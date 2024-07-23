from flask import Flask, request, jsonify, send_file
import cv2
import dlib
import torch
from facenet_pytorch import InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from flask_cors import CORS
import base64
import os

app = Flask(__name__)
CORS(app)

detector = dlib.get_frontal_face_detector()
model = InceptionResnetV1(pretrained='vggface2').eval()

def preprocess_face(face_img):
    face_img = cv2.resize(face_img, (160, 160))
    face_img = (face_img / 255.0 - 0.5) * 2
    face_img = torch.tensor(face_img).permute(2, 0, 1).unsqueeze(0).float()
    return face_img

UPLOAD_SCREENSHOOT = 'uploadsScreenhoot'
if not os.path.exists(UPLOAD_SCREENSHOOT):
    os.makedirs(UPLOAD_SCREENSHOOT)

@app.route('/save-screenshot', methods=['POST'])
def save_screenshot():
    if 'screenshot' not in request.files:
        return 'No file part', 400
    file = request.files['screenshot']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        file_path = os.path.join(UPLOAD_SCREENSHOOT, 'screenshot.png')
        file.save(file_path)
        return 'File saved successfully', 200

@app.route('/get-screenshot', methods=['GET'])
def get_screenshot():
    file_path = os.path.join(UPLOAD_SCREENSHOOT, 'screenshot.png')
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='image/png')
    else:
        return 'Screenshot not found', 404
    
    
UPLOAD_SELFIE = 'uploaded_selfie'
if not os.path.exists(UPLOAD_SELFIE):
    os.makedirs(UPLOAD_SELFIE)

@app.route('/upload-selfie', methods=['POST'])
def upload_selfie():
    if 'selfie' not in request.files:
        return 'No file part', 400
    file = request.files['selfie']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        file_path = os.path.join(UPLOAD_SELFIE, 'selfie.jpg')
        file.save(file_path)
        return 'File saved successfully', 200

@app.route('/get-selfie', methods=['GET'])
def get_selfie():
    file_path = os.path.join(UPLOAD_SELFIE, 'selfie.jpg')
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='image/jpg')
    else:
        return 'Selfie not found', 404
    
    


UPLOAD_Cards = 'uploadsCards'
if not os.path.exists(UPLOAD_Cards):
    os.makedirs(UPLOAD_Cards)  # Corrected from UPLOAD_SELFIE to UPLOAD_Cards

@app.route('/upload-card', methods=['POST'])
def upload_image():
    if 'capture' not in request.files:  # Expecting 'capture' field
        return "No image part in the request", 400
    file = request.files['capture']
    if file.filename == '':
        return "No selected file", 400
    if file:
        file_path = os.path.join(UPLOAD_Cards, 'capture.jpg')
        file.save(file_path)
        return "Image uploaded successfully", 200
    


@app.route('/get-card', methods=['GET'])
def get_card():
    file_path = os.path.join(UPLOAD_Cards, 'capture.jpg')
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='image/jpg')
    else:
        return 'capture not found', 404
    
@app.route('/faces_exist', methods=['POST'])
def exist_faces():
    if 'capture' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    id_image = request.files['capture']
    id_img = cv2.imdecode(np.frombuffer(id_image.read(), np.uint8), cv2.IMREAD_COLOR)
    
    if id_img is None:
        return jsonify({'message': 'Invalid image'}), 400

    id_gray = cv2.cvtColor(id_img, cv2.COLOR_BGR2GRAY)
    id_faces = detector(id_gray)
    
    # Debugging output
    print(f"Number of faces detected: {len(id_faces)}")

    if len(id_faces) == 0:
        return jsonify({'message': 'Try again, no face detected'}), 200

    else :
        for i, face in enumerate(id_faces):
          print(f"Face {i}: Left={face.left()}, Top={face.top()}, Width={face.width()}, Height={face.height()}")

    # Process the first detected face
        x, y, w, h = (id_faces[0].left(), id_faces[0].top(), id_faces[0].width(), id_faces[0].height())
        id_face_img = id_img[y:y+h, x:x+w]
        id_face_tensor = preprocess_face(id_face_img)
        id_face_embedding = model(id_face_tensor)
        id_face_path = 'detected_card_face.jpg'
        cv2.imwrite(id_face_path, id_face_img)
        return jsonify({'message': 'Good face detected'}), 200

        
    

@app.route('/match_faces', methods=['POST'])
def match_faces():
    id_image = request.files['id_image']
    selfie_image = request.files['selfie_image']
    id_img = cv2.imdecode(np.frombuffer(id_image.read(), np.uint8), cv2.IMREAD_COLOR)
    selfie_img = cv2.imdecode(np.frombuffer(selfie_image.read(), np.uint8), cv2.IMREAD_COLOR)
    id_gray = cv2.cvtColor(id_img, cv2.COLOR_BGR2GRAY)
    id_faces = detector(id_gray)
    if not id_faces:
        return jsonify({'error': 'No face detected in ID image.'}), 400
    x, y, w, h = (id_faces[0].left(), id_faces[0].top(), id_faces[0].width(), id_faces[0].height())
    id_face_img = id_img[y:y+h, x:x+w]
    id_face_tensor = preprocess_face(id_face_img)
    id_face_embedding = model(id_face_tensor)
    id_face_path = 'detected_id_face.jpg'
    cv2.imwrite(id_face_path, id_face_img)
    selfie_gray = cv2.cvtColor(selfie_img, cv2.COLOR_BGR2GRAY)
    selfie_faces = detector(selfie_gray)
    if not selfie_faces:
        return jsonify({'error': 'No face detected in selfie image.'}), 400

    x, y, w, h = (selfie_faces[0].left(), selfie_faces[0].top(), selfie_faces[0].width(), selfie_faces[0].height())
    selfie_face_img = selfie_img[y:y+h, x:x+w]
    selfie_face_tensor = preprocess_face(selfie_face_img)
    selfie_face_embedding = model(selfie_face_tensor)
    selfie_face_path = 'detected_selfie_face.jpg'
    cv2.imwrite(selfie_face_path, selfie_face_img)
    similarity = cosine_similarity(selfie_face_embedding.detach().numpy(), id_face_embedding.detach().numpy())
    similarity_score = float(similarity[0][0])
    match_status = "Match" if similarity_score > 0.8 else "No Match"
    with open(id_face_path, "rb") as f:
        id_face_b64 = base64.b64encode(f.read()).decode('utf-8')
    with open(selfie_face_path, "rb") as f:
        selfie_face_b64 = base64.b64encode(f.read()).decode('utf-8')

    return jsonify({
        'similarity_score': similarity_score,
        'match_status': match_status,
        'id_face_image': id_face_b64,
        'selfie_face_image': selfie_face_b64
    })



if __name__ == '__main__':
    app.run(debug=False)

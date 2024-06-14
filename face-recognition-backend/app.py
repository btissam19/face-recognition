from flask import Flask, request, jsonify
import cv2
import dlib
import torch
from facenet_pytorch import InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize the Dlib face detector
detector = dlib.get_frontal_face_detector()

# Load the pre-trained FaceNet model
model = InceptionResnetV1(pretrained='vggface2').eval()

# Function to preprocess face images for the model
def preprocess_face(face_img):
    face_img = cv2.resize(face_img, (160, 160))
    face_img = (face_img / 255.0 - 0.5) * 2  # Normalize
    face_img = torch.tensor(face_img).permute(2, 0, 1).unsqueeze(0).float()  # Convert to tensor
    return face_img

# Endpoint to handle face matching
@app.route('/match_faces', methods=['POST'])
def match_faces():
    id_image = request.files['id_image']
    selfie_image = request.files['selfie_image']

    id_img = cv2.imdecode(np.frombuffer(id_image.read(), np.uint8), cv2.IMREAD_COLOR)
    selfie_img = cv2.imdecode(np.frombuffer(selfie_image.read(), np.uint8), cv2.IMREAD_COLOR)

    # Detect face in ID image
    id_gray = cv2.cvtColor(id_img, cv2.COLOR_BGR2GRAY)
    id_faces = detector(id_gray)
    if not id_faces:
        return jsonify({'error': 'No face detected in ID image.'}), 400

    x, y, w, h = (id_faces[0].left(), id_faces[0].top(), id_faces[0].width(), id_faces[0].height())
    id_face_img = id_img[y:y+h, x:x+w]
    id_face_tensor = preprocess_face(id_face_img)
    id_face_embedding = model(id_face_tensor)

    # Detect face in selfie image
    selfie_gray = cv2.cvtColor(selfie_img, cv2.COLOR_BGR2GRAY)
    selfie_faces = detector(selfie_gray)
    if not selfie_faces:
        return jsonify({'error': 'No face detected in selfie image.'}), 400

    x, y, w, h = (selfie_faces[0].left(), selfie_faces[0].top(), selfie_faces[0].width(), selfie_faces[0].height())
    selfie_face_img = selfie_img[y:y+h, x:x+w]
    selfie_face_tensor = preprocess_face(selfie_face_img)
    selfie_face_embedding = model(selfie_face_tensor)

    # Compute similarity
    similarity = cosine_similarity(selfie_face_embedding.detach().numpy(), id_face_embedding.detach().numpy())
    similarity_score = float(similarity[0][0])  # Convert NumPy float32 to Python float

    match_status = "Match" if similarity_score > 0.8 else "No Match"

    return jsonify({
        'similarity_score': similarity_score,
        'match_status': match_status
    })

if __name__ == '__main__':
    app.run(debug=True)

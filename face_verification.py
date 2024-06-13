import cv2
import dlib
import torch
from facenet_pytorch import InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

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

# Function to capture a selfie
def capture_selfie():
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame from webcam. Exiting...")
            break
        
        cv2.imshow('Capture Selfie - Press "s" to save, "q" to quit', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            cv2.imwrite('selfie.jpg', frame)
            print("Selfie captured and saved as selfie.jpg.")
            break
        elif key == ord('q'):
            print("Exiting without capturing a selfie.")
            break
    
    cap.release()
    cv2.destroyAllWindows()  # Close OpenCV window after capturing selfie

# Capture the selfie
capture_selfie()

# Load and preprocess ID image
id_img_path = 'path_to_id_image.jpg'  # Update with your ID image path
id_img = cv2.imread(id_img_path)
if id_img is None:
    print(f"Failed to load ID image from {id_img_path}. Exiting...")
    exit()

id_gray = cv2.cvtColor(id_img, cv2.COLOR_BGR2GRAY)
id_faces = detector(id_gray)

if id_faces:
    x, y, w, h = (id_faces[0].left(), id_faces[0].top(), id_faces[0].width(), id_faces[0].height())
    id_face_img = id_img[y:y+h, x:x+w]
    id_face_tensor = preprocess_face(id_face_img)
    id_face_embedding = model(id_face_tensor)
    print("ID face processed successfully.")
else:
    print("No face detected in the ID image.")
    exit()

# Load and preprocess the captured selfie
selfie_img_path = 'selfie.jpg'
selfie_img = cv2.imread(selfie_img_path)
if selfie_img is None:
    print(f"Failed to load selfie image from {selfie_img_path}. Exiting...")
    exit()

selfie_gray = cv2.cvtColor(selfie_img, cv2.COLOR_BGR2GRAY)
selfie_faces = detector(selfie_gray)

if selfie_faces:
    x, y, w, h = (selfie_faces[0].left(), selfie_faces[0].top(), selfie_faces[0].width(), selfie_faces[0].height())
    selfie_face_img = selfie_img[y:y+h, x:x+w]
    selfie_face_tensor = preprocess_face(selfie_face_img)
    selfie_face_embedding = model(selfie_face_tensor)
    print("Selfie face processed successfully.")
    
    # Compute similarity
    similarity = cosine_similarity(selfie_face_embedding.detach().numpy(), id_face_embedding.detach().numpy())
    similarity_score = similarity[0][0]
    
    # Display similarity score and match status
    print(f'Similarity Score: {similarity_score:.2f}')
    match_status = "Match" if similarity_score > 0.8 else "No Match"
    print(f'Match Status: {match_status}')
else:
    print("No face detected in the selfie.")

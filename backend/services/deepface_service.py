from deepface import DeepFace
from models import db, Face, Person
import os
import uuid
import cv2
from config import encrypt_path, decrypt_path

# Base path for saving cropped faces
FACES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'faces')
os.makedirs(FACES_DIR, exist_ok=True)


def detect_and_save_faces(image_path, photo_id, user_id=None, detector_backend='retinaface'):
    """
    Detects ALL faces in an image (works for group photos too),
    crops them, saves them to disk, stores in database,
    and auto-recognizes known faces if user_id provided.
    """
    try:
        # Detect ALL faces using RetinaFace
        faces_data = DeepFace.extract_faces(
            img_path=image_path,
            detector_backend=detector_backend,
            enforce_detection=False
        )

        saved_faces = []

        for i, face_data in enumerate(faces_data):
            # Skip very low confidence detections
            confidence = face_data.get('confidence', 0)
            if confidence < 0.5:
                continue

            # Get the cropped face image
            face_img = face_data['face']

            # Convert to proper format (0-255 range)
            face_img = (face_img * 255).astype('uint8')

            # Save cropped face to disk
            face_filename = f"{uuid.uuid4().hex}.jpg"
            face_path = os.path.join(FACES_DIR, face_filename)
            cv2.imwrite(face_path, cv2.cvtColor(face_img, cv2.COLOR_RGB2BGR))

            # Try auto-recognition if user_id provided
            person_id = None
            person_name = 'Unknown'

            if user_id:
                matched_person_id = recognize_face(face_path, user_id)
                if matched_person_id:
                    person_id = matched_person_id
                    person = Person.query.get(matched_person_id)
                    person_name = person.name if person else 'Unknown'

            # Save face to database with encrypted path
            new_face = Face(
                photo_id=photo_id,
                face_path=encrypt_path(face_path),
                person_id=person_id
            )
            db.session.add(new_face)
            db.session.commit()

            saved_faces.append({
                'face_id': new_face.id,
                'face_path': face_filename,
                'person_id': person_id,
                'person_name': person_name,
                'confidence': round(confidence, 2),
                'auto_recognized': person_id is not None
            })

        return saved_faces

    except Exception as e:
        print(f"Face detection error: {e}")
        return []


def recognize_face(face_path, user_id):
    """
    Tries to match a face against all known faces
    for this user using DeepFace verification.
    Returns person_id if match found, None otherwise.
    """
    try:
        # Get all labeled faces for this user
        known_faces = db.session.query(Face).join(Person).filter(
            Person.user_id == user_id,
            Face.person_id != None
        ).all()

        if not known_faces:
            return None

        best_match = None
        best_distance = 0.4  # Threshold — lower = stricter matching

        for known_face in known_faces:
            real_path = decrypt_path(known_face.face_path)
            if not os.path.exists(real_path):
                continue

            try:
                result = DeepFace.verify(
                img1_path=face_path,
                img2_path=real_path,
                    model_name='Facenet512',
                    detector_backend='mtcnn',
                    enforce_detection=False
                )

                if result['verified'] and result['distance'] < best_distance:
                    best_distance = result['distance']
                    best_match = known_face.person_id

            except Exception:
                continue

        return best_match

    except Exception as e:
        print(f"Face recognition error: {e}")
        return None
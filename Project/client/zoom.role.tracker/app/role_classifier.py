import random

TRACKED_ROLES = ["person", "teacher", "is_youth", "tutor"]

def classify_faces(face_images):
    """
    Placeholder role classifier.
    - Always returns 'person' for each face by default.
    - You can replace this with your actual model logic.
    """
    return ["person" for _ in face_images]

# Example of a trivial heuristic replacement:
# def classify_faces(face_images):
#     roles = []
#     for i, _img in enumerate(face_images):
#         roles.append(TRACKED_ROLES[i % len(TRACKED_ROLES)])
#     return roles
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import numpy as np
import base64
import json

# --- IMPORTS FOR TASKS API ---
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Initialize the App
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VisionEngine:
    def __init__(self):
        # 1. SETUP THE MODEL
        # IMPORTANT: Ensure 'face_landmarker.task' is in the same folder as this script.
        model_path = './face_landmarker.task' 
        
        try:
            base_options = python.BaseOptions(model_asset_path=model_path)
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                output_face_blendshapes=True,  # We need this for Emotion detection
                output_facial_transformation_matrixes=True,
                num_faces=2
            )
            self.detector = vision.FaceLandmarker.create_from_options(options)
            print("✅ MediaPipe Vision Engine Loaded Successfully")
        except Exception as e:
            print(f"❌ Error Loading Model: {e}")
            print("Did you download 'face_landmarker.task'?")

    def analyze_frame(self, base64_image):
        try:
            # 2. DECODE IMAGE
            if "," in base64_image:
                encoded_data = base64_image.split(',')[1]
            else:
                encoded_data = base64_image
                
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {"status": "error", "debug_msg": "Frame decode failed"}

            # 3. PREPARE FOR MEDIAPIPE
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

            # 4. DETECT
            detection_result = self.detector.detect(mp_image)

            data = {
                "status": "active",
                "emotion": "Neutral",
                "gaze_alert": False,
                "debug_msg": ""
            }

            # If no face detected
            if not detection_result.face_landmarks:
                data["debug_msg"] = "No face detected"
                return data

            # Get data for the first face
            landmarks = detection_result.face_landmarks[0]
            
            # --- LOGIC A: GAZE TRACKING ---
            nose_tip = landmarks[1]
            left_eye_outer = landmarks[33]
            right_eye_outer = landmarks[263]

            dist_left = np.linalg.norm(np.array([nose_tip.x, nose_tip.y]) - np.array([left_eye_outer.x, left_eye_outer.y]))
            dist_right = np.linalg.norm(np.array([nose_tip.x, nose_tip.y]) - np.array([right_eye_outer.x, right_eye_outer.y]))
            
            # Avoid division by zero
            gaze_ratio = dist_left / (dist_right + 1e-6)
            
            if gaze_ratio < 0.5:
                data["gaze_alert"] = True
                data["debug_msg"] = "Looking Right >>"
            elif gaze_ratio > 2.0:
                data["gaze_alert"] = True
                data["debug_msg"] = "<< Looking Left"

            # --- LOGIC B: EMOTION VIA BLENDSHAPES ---
            # This uses the specific blendshape scores (0.0 to 1.0)
            if detection_result.face_blendshapes:
                # Convert list of categories to a simple dictionary
                blendshapes = {cat.category_name: cat.score for cat in detection_result.face_blendshapes[0]}
                
                # Detect Confusion (Brow Down)
                if blendshapes.get('browDownLeft', 0) > 0.5:
                    data["emotion"] = "Confused / Frowning"
                
                # Detect Surprise (Brow Outer Up)
                elif blendshapes.get('browOuterUpLeft', 0) > 0.5:
                    data["emotion"] = "Surprised"
                
                # Detect Talking (Jaw Open)
                elif blendshapes.get('jawOpen', 0) > 0.3:
                     data["emotion"] = "Talking"
                
                # Detect Blinking
                elif blendshapes.get('eyeBlinkLeft', 0) > 0.6:
                    data["emotion"] = "Blinking"

            return data

        except Exception as e:
            print(f"Analyze Error: {e}")
            return {"status": "error", "debug_msg": str(e)}

# Initialize Engine
engine = VisionEngine()

# --- WEBSOCKET ROUTE ---
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    print(f"Client {client_id} connected")
    try:
        while True:
            # 1. Wait for image
            data = await websocket.receive_text()
            
            # 2. Analyze
            result = engine.analyze_frame(data)
            
            # 3. Send result
            await websocket.send_text(json.dumps(result))
            
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
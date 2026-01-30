import cv2
from ultralytics import YOLO
import threading
import time
import numpy as np

class VisionEngine:
    def __init__(self):
        # 1. Instant Camera Startup
        self.cap = cv2.VideoCapture(0)
        # Use lower resolution for faster processing
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) # Reduces lag
        
        self.ret, self.frame = self.cap.read()
        self.stopped = False
        self.model_ready = False
        
        # Start hardware thread immediately
        threading.Thread(target=self.update_frame, daemon=True).start()

        # 2. Async Model Loading (App opens while this loads)
        threading.Thread(target=self.init_model, daemon=True).start()
        
        self.WHITELIST = ['person', 'chair', 'bottle', 'laptop', 'cell phone', 'cup', 'door']
        self.last_msg = "INITIALIZING..."
        self.processing = False 
        self.prev_gray = None

    def init_model(self):
        # YOLOv8 Nano is faster than YOLO-Tiny on most modern CPUs
        self.model = YOLO('yolov8n.pt')
        self.model_ready = True
        self.last_msg = "SCANNING"

    def update_frame(self):
        while not self.stopped:
            self.ret, self.frame = self.cap.read()
            if not self.ret:
                time.sleep(0.01)

    def get_processed_data(self):
        if not self.ret or self.frame is None:
            return None, {"msg": "WAKING UP..."}

        # Quick Brightness Check
        gray = cv2.cvtColor(self.frame, cv2.COLOR_BGR2GRAY)
        if np.mean(gray) < 30:
            return self.encode_frame(self.frame), {"msg": "TOO DARK"}

        # If AI is still thinking or not ready, show the raw feed + last message
        if not self.model_ready or self.processing:
            return self.encode_frame(self.frame), {"msg": self.last_msg}

        # Run AI Inference in its own lock to keep FPS high
        threading.Thread(target=self.run_inference, args=(self.frame.copy(), gray), daemon=True).start()

        return self.encode_frame(self.frame), {"msg": self.last_msg.upper()}

    def run_inference(self, img, gray):
        self.processing = True
        h, w = img.shape[:2]

        # Movement Logic
        motion_status = "STILL"
        if self.prev_gray is not None:
            diff = cv2.absdiff(self.prev_gray, gray)
            if np.mean(diff) > 4:
                motion_status = "MOVING"
        self.prev_gray = gray

        # AI Logic (imgs=160 and half=True for maximum speed)
        results = self.model(img, conf=0.45, imgsz=160, half=True, verbose=False)

        detected_objects = []
        for r in results:
            for box in r.boxes:
                label = r.names[int(box.cls[0])]
                if label in self.WHITELIST:
                    coords = box.xyxy[0].cpu().numpy()
                    rel_size = ((coords[2]-coords[0])*(coords[3]-coords[1]))/(w*h)
                    
                    dist = "CLOSE" if rel_size > 0.35 else "FAR" if rel_size < 0.07 else ""
                    center_x = (coords[0] + coords[2]) / 2
                    side = "LEFT" if center_x < w*0.4 else "RIGHT" if center_x > w*0.6 else "CENTER"
                    
                    detected_objects.append(f"{dist} {label} {side}".strip())

        if not detected_objects:
            self.last_msg = motion_status
        else:
            self.last_msg = f"{motion_status}: {detected_objects[0]}"

        self.processing = False

    def encode_frame(self, frame):
        # Lower quality slightly to reduce network transmission time to the browser
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
        return buffer.tobytes()

    def __del__(self):
        self.stopped = True
        self.cap.release()
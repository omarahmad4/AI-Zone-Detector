import cv2
import numpy as np
from ultralytics import YOLO
from typing import List, Dict, Tuple, Optional
from .zones import ZoneManager
from .database import Database

class ZoneDetector:
    def __init__(self, model_path: str = "yolov8n.pt", show_video: bool = True):
        """
        Initialize the zone detector with YOLOv8 model and optional video display.
        """
        self.model = YOLO(model_path)
        self.zone_manager = ZoneManager()
        self.database = Database()
        self.show_video = show_video
        self.cap = None
    
    def setup_camera(self, camera_id: int = 0):
        """Initialize the camera capture."""
        self.cap = cv2.VideoCapture(camera_id)
        if not self.cap.isOpened():
            raise RuntimeError("Failed to open camera")
    
    def add_zone(self, name: str, points: List[Tuple[float, float]]):
        """Add a new zone to track."""
        self.zone_manager.add_zone(name, points)
    
    def process_frame(self, frame: np.ndarray) -> List[Dict]:
        """
        Process a single frame for object detection and zone tracking.
        Returns list of detections with zone information.
        """
        # Run YOLOv8 detection
        results = self.model(frame, verbose=False)[0]
        detections = []
        
        # Process each detection
        for box in results.boxes:
            # Get object class and confidence
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            object_name = results.names[cls]
            
            # Get bounding box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            # Calculate center point
            center_x = (x1 + x2) / 2
            center_y = (y1 + y2) / 2
            
            # Normalize coordinates for zone checking
            height, width = frame.shape[:2]
            norm_x = center_x / width
            norm_y = center_y / height
            
            # Check which zone contains the center point
            zone_name = self.zone_manager.get_zone_for_point((norm_x, norm_y))
            
            # Log detection to database
            self.database.add_detection(object_name, zone_name, conf)
            
            # Store detection info
            detection = {
                "object": object_name,
                "zone": zone_name,
                "confidence": conf,
                "box": [x1, y1, x2, y2]
            }
            detections.append(detection)
            
            # Draw bounding box and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label = f"{object_name} ({zone_name or 'No Zone'})"
            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Draw zones
        self.zone_manager.draw_zones(frame)
        
        return detections
    
    def run(self):
        """Main loop for processing video feed."""
        if not self.cap:
            self.setup_camera()
        
        try:
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    break
                
                # Process frame
                detections = self.process_frame(frame)
                
                # Show video if enabled
                if self.show_video:
                    cv2.imshow("Zone Detector", frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                
        finally:
            if self.cap:
                self.cap.release()
            cv2.destroyAllWindows()
    
    def get_last_seen(self, object_name: str) -> Optional[Dict]:
        """Get the last known location of an object."""
        return self.database.get_last_seen(object_name)
    
    def get_recent_detections(self, limit: int = 10) -> List[Dict]:
        """Get the most recent detections."""
        return self.database.get_recent_detections(limit)

def main():
    # Example usage
    detector = ZoneDetector()
    
    # Add some example zones (normalized coordinates)
    detector.add_zone("Living Room", [
        (0.2, 0.2),
        (0.8, 0.2),
        (0.8, 0.8),
        (0.2, 0.8)
    ])
    
    detector.add_zone("Kitchen", [
        (0.6, 0.6),
        (0.9, 0.6),
        (0.9, 0.9),
        (0.6, 0.9)
    ])
    
    # Run the detector
    detector.run()

if __name__ == "__main__":
    main() 
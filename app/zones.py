import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional

class Zone:
    def __init__(self, name: str, points: List[Tuple[float, float]]):
        """
        Initialize a zone with a name and list of points.
        Points should be in normalized coordinates (0-1).
        """
        self.name = name
        self.points = np.array(points, dtype=np.float32)
    
    def is_point_inside(self, point: Tuple[float, float]) -> bool:
        """
        Check if a point is inside the zone using OpenCV's pointPolygonTest.
        Returns True if the point is inside the zone.
        """
        result = cv2.pointPolygonTest(self.points, point, False)
        return result >= 0
    
    def draw(self, frame: np.ndarray, color: Tuple[int, int, int] = (0, 255, 0), thickness: int = 2):
        """
        Draw the zone on the frame.
        """
        height, width = frame.shape[:2]
        points = (self.points * np.array([width, height])).astype(np.int32)
        cv2.polylines(frame, [points], True, color, thickness)
        
        # Add zone name
        if len(points) > 0:
            text_pos = tuple(points[0])
            cv2.putText(frame, self.name, text_pos, cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

class ZoneManager:
    def __init__(self):
        """Initialize the zone manager."""
        self.zones: List[Zone] = []
    
    def add_zone(self, name: str, points: List[Tuple[float, float]]):
        """Add a new zone."""
        self.zones.append(Zone(name, points))
    
    def get_zone_for_point(self, point: Tuple[float, float]) -> Optional[str]:
        """
        Get the name of the zone containing the point.
        Returns None if the point is not in any zone.
        """
        for zone in self.zones:
            if zone.is_point_inside(point):
                return zone.name
        return None
    
    def draw_zones(self, frame: np.ndarray):
        """Draw all zones on the frame."""
        for zone in self.zones:
            zone.draw(frame)
    
    def save_zones(self, filename: str):
        """Save zones to a file."""
        zones_data = {
            zone.name: zone.points.tolist() for zone in self.zones
        }
        np.save(filename, zones_data)
    
    def load_zones(self, filename: str):
        """Load zones from a file."""
        zones_data = np.load(filename, allow_pickle=True).item()
        self.zones = [
            Zone(name, points) for name, points in zones_data.items()
        ] 
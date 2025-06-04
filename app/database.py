import sqlite3
from datetime import datetime
from typing import List, Dict, Optional

class Database:
    def __init__(self, db_path: str = "detections.db"):
        """Initialize the database connection and create tables if they don't exist."""
        self.db_path = db_path
        self._create_tables()
    
    def _create_tables(self):
        """Create the necessary tables if they don't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS detections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    object_name TEXT NOT NULL,
                    zone_name TEXT,
                    timestamp DATETIME NOT NULL,
                    confidence REAL
                )
            """)
            conn.commit()
    
    def add_detection(self, object_name: str, zone_name: Optional[str], confidence: float):
        """Add a new detection to the database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO detections (object_name, zone_name, timestamp, confidence) VALUES (?, ?, ?, ?)",
                (object_name, zone_name, datetime.now(), confidence)
            )
            conn.commit()
    
    def get_last_seen(self, object_name: str) -> Optional[Dict]:
        """Get the last known location of an object."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT zone_name, timestamp FROM detections WHERE object_name = ? ORDER BY timestamp DESC LIMIT 1",
                (object_name,)
            )
            result = cursor.fetchone()
            if result:
                return {
                    "object": object_name,
                    "zone": result[0],
                    "timestamp": result[1]
                }
            return None
    
    def get_recent_detections(self, limit: int = 10) -> List[Dict]:
        """Get the most recent detections."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT object_name, zone_name, timestamp, confidence FROM detections ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            )
            results = cursor.fetchall()
            return [
                {
                    "object": row[0],
                    "zone": row[1],
                    "timestamp": row[2],
                    "confidence": row[3]
                }
                for row in results
            ] 
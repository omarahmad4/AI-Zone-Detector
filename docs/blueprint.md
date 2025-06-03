# **App Name**: ZoneWatch

## Core Features:

- Video Feed Processing: Continuously reads frames from the webcam, processes the data and renders bounding boxes with labels on the UI.
- Real-time Object Detection: Utilizes the YOLOv8 model (using the OpenCV library) to identify objects within each frame of the webcam feed.
- SQLite Integration: Stores detections with object names, zones, and timestamps in a SQLite database for persistence.
- Zone Definition: Defines distinct detection zones (e.g., Living Room, Bedroom, Hallway) using polygonal boundaries.
- Zone Assignment: Determine which defined zone each detected object resides within and update object’s zone accordingly. In the edge case where an object spans multiple zones, store only the zone where the object’s centroid is found.
- API Endpoint: Provides a basic Flask API with endpoints for querying the last known location of an object (/last-seen?object=) and retrieving recent detections (/recent-detections).

## Style Guidelines:

- Primary color: A subdued blue (#6699CC) to convey a sense of security and surveillance without being alarming.
- Background color: Light gray (#F0F0F0) for a clean and neutral backdrop.
- Accent color: Soft orange (#FFA07A) to highlight important information or alerts.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text, providing a modern, legible style.
- The camera view should occupy the primary area, overlaid with zone labels and object detections, maintaining a clean and informative presentation.
- Minimalist icons representing different object types, for a quick and intuitive understanding of detected objects.
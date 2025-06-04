# AI Zone Detector

A local, offline object detection and zone tracking system using YOLOv8 and OpenCV. This system can detect objects in your webcam feed, track which predefined zones they are in, and provide an API to query detection history.

## Features

- Real-time object detection using YOLOv8
- Custom polygon-based zones for tracking object locations
- Local SQLite database for storing detection history
- Flask API for querying detection data
- Real-time visualization of detections and zones
- Fully local operation - no cloud dependencies

## Requirements

- Python 3.11
- Webcam
- Required Python packages (see requirements.txt)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/ai-zone-detector.git
cd ai-zone-detector
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Download the YOLOv8 model (this will happen automatically on first run, but you can also download it manually):
```bash
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
```

## Usage

1. Start the system:
```bash
python api/app.py
```

This will:
- Start the object detection system with your webcam
- Show a window with the video feed, detections, and zones
- Start the Flask API server on port 5000

2. The system comes with two example zones (Living Room and Kitchen). You can modify these in `api/app.py` or create a zone configuration file.

3. Query the API:
- Get the last known location of an object:
```bash
curl "http://localhost:5000/last-seen?object=person"
```

- Get recent detections:
```bash
curl "http://localhost:5000/recent-detections?limit=10"
```

## Customizing Zones

Zones are defined as polygons with normalized coordinates (0-1). You can modify the example zones in `api/app.py` or create your own zone configuration file.

Example zone definition:
```python
detector.add_zone("Living Room", [
    (0.2, 0.2),  # Top-left
    (0.8, 0.2),  # Top-right
    (0.8, 0.8),  # Bottom-right
    (0.2, 0.8)   # Bottom-left
])
```

## Development

The project structure:
```
ai-zone-detector/
├── app/
│   ├── main.py      # Main detection logic
│   ├── zones.py     # Zone management
│   └── database.py  # SQLite database operations
├── api/
│   └── app.py       # Flask API server
├── requirements.txt
└── README.md
```

## License

MIT License

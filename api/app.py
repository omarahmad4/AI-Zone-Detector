from flask import Flask, jsonify, request
from app.main import ZoneDetector
import threading

app = Flask(__name__)
detector = None
detector_thread = None

def run_detector():
    """Run the detector in a separate thread."""
    global detector
    detector = ZoneDetector(show_video=True)
    
    # Add example zones (you can modify these or load from a file)
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
    
    detector.run()

@app.route('/last-seen')
def last_seen():
    """Get the last known location of an object."""
    object_name = request.args.get('object')
    if not object_name:
        return jsonify({"error": "Missing 'object' parameter"}), 400
    
    result = detector.get_last_seen(object_name)
    if result:
        return jsonify(result)
    return jsonify({"error": f"No recent sightings of {object_name}"}), 404

@app.route('/recent-detections')
def recent_detections():
    """Get the most recent detections."""
    limit = request.args.get('limit', default=10, type=int)
    results = detector.get_recent_detections(limit)
    return jsonify({"detections": results})

def start_api():
    """Start the Flask API server."""
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    # Start the detector in a separate thread
    detector_thread = threading.Thread(target=run_detector)
    detector_thread.daemon = True
    detector_thread.start()
    
    # Start the API server
    start_api() 
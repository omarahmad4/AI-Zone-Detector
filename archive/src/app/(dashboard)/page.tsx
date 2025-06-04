import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WebcamFeed from "@/components/live-view/webcam-feed";

export default function LiveViewPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Live Camera Feed</CardTitle>
          <CardDescription>
            Real-time object detection and zone monitoring. Ensure your Python backend is running.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebcamFeed />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. Ensure your Python ZoneWatch backend script is running on your local machine (typically at <code className="font-code bg-muted px-1 py-0.5 rounded">http://localhost:5000</code>).</p>
          <p>2. The Python script handles webcam access, object detection, and database operations.</p>
          <p>3. This web interface will attempt to connect to your webcam and send frames to the Python backend for processing detections.</p>
          <p>4. Detected objects and their assigned zones will be overlaid on the video feed above.</p>
        </CardContent>
      </Card>
    </div>
  );
}

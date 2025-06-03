import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ZoneEditor from "@/components/zones/zone-editor";

export default function ZonesPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Manage Detection Zones</CardTitle>
          <CardDescription>
            Define polygonal areas for object detection. You can upload an image of your camera view to get AI-suggested zone configurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ZoneEditor />
        </CardContent>
      </Card>
    </div>
  );
}

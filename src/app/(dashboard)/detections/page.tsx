import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LastSeenQuery from "@/components/detections/last-seen-query";
import RecentDetectionsTable from "@/components/detections/recent-detections-table";

export default function DetectionsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Query Detections</CardTitle>
          <CardDescription>
            Find the last known location of an object or view recent detection events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LastSeenQuery />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Detections</CardTitle>
          <CardDescription>
            A log of recently detected objects and their zones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentDetectionsTable />
        </CardContent>
      </Card>
    </div>
  );
}

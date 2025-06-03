"use client";

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Package, MapPin, Clock } from 'lucide-react';
import type { Detection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';

export default function RecentDetectionsTable() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${PYTHON_API_URL}/recent-detections`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: "Unknown error from backend."}));
        throw new Error(errData.detail || `Error: ${response.statusText}`);
      }
      const data: Detection[] = await response.json();
      setDetections(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recent detections.');
      setDetections([]); // Clear previous detections on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
    const intervalId = setInterval(fetchDetections, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading && detections.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading recent detections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchDetections} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="mr-2 h-3 w-3" /> Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={fetchDetections} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
          Refresh
        </Button>
      </div>
      {detections.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-2" />
            No recent detections found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Package className="inline-block mr-1 h-4 w-4" />Object</TableHead>
              <TableHead><MapPin className="inline-block mr-1 h-4 w-4" />Zone</TableHead>
              <TableHead><Clock className="inline-block mr-1 h-4 w-4" />Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detections.map((detection, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{detection.object}</TableCell>
                <TableCell>{detection.zone || 'N/A'}</TableCell>
                <TableCell>
                  {detection.timestamp ? `${formatDistanceToNow(new Date(detection.timestamp), { addSuffix: true })}` : 'N/A'}
                  {detection.timestamp ? <div className="text-xs text-muted-foreground">{new Date(detection.timestamp).toLocaleString()}</div> : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

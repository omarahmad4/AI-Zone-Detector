"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Loader2, AlertTriangle, Package, MapPin, Clock } from 'lucide-react';
import type { LastSeenRecord } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';


const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';

export default function LastSeenQuery() {
  const [objectName, setObjectName] = useState('');
  const [result, setResult] = useState<LastSeenRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectName.trim()) {
      setError("Please enter an object name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${PYTHON_API_URL}/last-seen?object=${encodeURIComponent(objectName.trim())}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Object "${objectName.trim()}" not found.`);
        }
        const errData = await response.json().catch(() => ({ detail: "Unknown error from backend."}));
        throw new Error(errData.detail || `Error: ${response.statusText}`);
      }
      const data: LastSeenRecord = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch last seen data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Enter object name (e.g., water_bottle)"
          value={objectName}
          onChange={(e) => setObjectName(e.target.value)}
          className="flex-grow"
          aria-label="Object name to search"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Search
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="bg-background shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" /> Last Seen: {result.object}
            </CardTitle>
            <CardDescription>
              Latest recorded information for the queried object.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Zone:</span>
              <span className="ml-2 text-foreground">{result.zone || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Timestamp:</span>
              <span className="ml-2 text-foreground">
                {result.timestamp ? `${formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })} (${new Date(result.timestamp).toLocaleString()})` : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

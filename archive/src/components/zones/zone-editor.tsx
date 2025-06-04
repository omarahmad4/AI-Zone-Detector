"use client";

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Upload, Save, Trash2, PlusCircle } from 'lucide-react';
import type { Zone, Point } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';

// Simplified Zone display and interaction. A proper canvas editor would be more complex.
export default function ZoneEditor() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const fetchZones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${PYTHON_API_URL}/zones`);
      if (!response.ok) throw new Error('Failed to fetch zones from backend.');
      const data = await response.json();
      setZones(data.zones || []);
    } catch (err: any) {
      setError(err.message);
      setZones([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const drawZonesOnCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw uploaded image if present
    if (uploadedImage) {
      const img = new window.Image();
      img.onload = () => {
        // Scale image to fit canvas while maintaining aspect ratio
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio, 1); // Don't scale up beyond original size or canvas
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        drawPolygons(ctx, zones, { width: img.width * ratio, height: img.height*ratio, offsetX: centerShift_x, offsetY: centerShift_y });
      };
      img.src = uploadedImage;
    } else {
       // If no image, draw polygons relative to canvas dimensions
       drawPolygons(ctx, zones, { width: canvas.width, height: canvas.height, offsetX: 0, offsetY: 0 });
    }
  };

  const drawPolygons = (ctx: CanvasRenderingContext2D, zonesToDraw: Zone[], dims: {width: number, height: number, offsetX: number, offsetY: number}) => {
    zonesToDraw.forEach((zone, zoneIndex) => {
      ctx.beginPath();
      zone.polygon.forEach((point, pointIndex) => {
        const x = dims.offsetX + point.x * dims.width;
        const y = dims.offsetY + point.y * dims.height;
        if (pointIndex === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      
      // Use a color palette for zones
      const colors = ['rgba(102, 153, 204, 0.7)', 'rgba(255, 160, 122, 0.7)', 'rgba(119, 179, 0, 0.7)', 'rgba(240, 62, 62, 0.7)'];
      ctx.strokeStyle = colors[zoneIndex % colors.length];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = colors[zoneIndex % colors.length].replace('0.7', '0.2'); // Lighter fill
      ctx.fill();

      ctx.fillStyle = colors[zoneIndex % colors.length].replace('0.7', '1'); // Solid for text
      ctx.font = 'bold 12px Inter';
      if (zone.polygon.length > 0) {
        const firstPoint = zone.polygon[0];
        ctx.fillText(zone.name, dims.offsetX + firstPoint.x * dims.width + 5, dims.offsetY + firstPoint.y * dims.height + 15);
      }
    });
  }


  useEffect(() => {
    drawZonesOnCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, uploadedImage, canvasRef]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveZones = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${PYTHON_API_URL}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Unknown error saving zones.'}));
        throw new Error(errData.detail || 'Failed to save zones to backend.');
      }
      toast({ title: "Zones Saved", description: "Zone configuration has been updated.", variant: "default" });
      fetchZones(); // Refresh zones from backend
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddZone = () => {
    const newZoneName = `Zone ${zones.length + 1}`;
    // Add a default square polygon for the new zone
    const defaultPolygon: Point[] = [
      { x: 0.1, y: 0.1 },
      { x: 0.4, y: 0.1 },
      { x: 0.4, y: 0.4 },
      { x: 0.1, y: 0.4 },
    ];
    setZones([...zones, { name: newZoneName, polygon: defaultPolygon }]);
  };

  const handleZoneNameChange = (index: number, newName: string) => {
    const updatedZones = [...zones];
    updatedZones[index].name = newName;
    setZones(updatedZones);
  };
  
  const handlePointChange = (zoneIndex: number, pointIndex: number, coord: 'x' | 'y', value: string) => {
    const updatedZones = [...zones];
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      updatedZones[zoneIndex].polygon[pointIndex][coord] = numValue;
      setZones(updatedZones);
    }
  };

  const handleRemoveZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index));
  };


  if (isLoading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Zone Visualization</CardTitle>
          <CardDescription>Upload an image of your camera feed to visualize and configure zones. Zones are defined by polygons with relative coordinates (0 to 1).</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <Label htmlFor="zone-image-upload">Upload Scene Image (Optional)</Label>
                <Input id="zone-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="mt-1"/>
            </div>
            <canvas ref={canvasRef} width="640" height="480" className="w-full border rounded-md bg-muted/20" data-ai-hint="security camera view"></canvas>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center justify-between">
                Zone Configuration
                <Button variant="outline" size="sm" onClick={handleAddZone} disabled={isSubmitting}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Zone
                </Button>
            </CardTitle>
            <CardDescription>Manually define or edit zone names and their polygonal boundaries (X, Y coordinates between 0.0 and 1.0).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {zones.map((zone, zoneIndex) => (
            <Card key={zoneIndex} className="p-4 bg-background shadow">
              <div className="flex justify-between items-center mb-2">
                <Input 
                    value={zone.name} 
                    onChange={(e) => handleZoneNameChange(zoneIndex, e.target.value)}
                    placeholder="Zone Name"
                    className="text-lg font-semibold flex-grow mr-2"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveZone(zoneIndex)} disabled={isSubmitting}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {zone.polygon.map((point, pointIndex) => (
                  <div key={pointIndex} className="space-y-1 p-2 border rounded-md">
                    <Label className="text-xs">Point {pointIndex + 1}</Label>
                    <div className="flex gap-1">
                    <Input 
                        type="number" step="0.01" min="0" max="1" 
                        value={point.x} 
                        onChange={(e) => handlePointChange(zoneIndex, pointIndex, 'x', e.target.value)}
                        placeholder="X"
                        className="w-full text-sm h-8"
                    />
                    <Input 
                        type="number" step="0.01" min="0" max="1" 
                        value={point.y} 
                        onChange={(e) => handlePointChange(zoneIndex, pointIndex, 'y', e.target.value)}
                        placeholder="Y"
                        className="w-full text-sm h-8"
                    />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {zones.length === 0 && <p className="text-muted-foreground text-center py-4">No zones configured. Add a zone to get started.</p>}
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveZones} disabled={isSubmitting || zones.length === 0}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save All Zones
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

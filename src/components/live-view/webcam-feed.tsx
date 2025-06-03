
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, VideoOff, Video } from 'lucide-react';
import type { Detection, Zone } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';

export default function WebcamFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [currentZones, setCurrentZones] = useState<Zone[]>([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  const drawOverlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw zones
    currentZones.forEach(zone => {
      ctx.beginPath();
      zone.polygon.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x * canvas.width, point.y * canvas.height);
        else ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 160, 122, 0.7)'; // Soft orange for zones
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 160, 122, 0.1)';
      ctx.fill();
      ctx.fillStyle = '#FFA07A';
      ctx.font = '14px Inter';
      // Position text within the polygon (simple top-left for now)
      if (zone.polygon.length > 0) {
         ctx.fillText(zone.name, zone.polygon[0].x * canvas.width + 5, zone.polygon[0].y * canvas.height + 15);
      }
    });
    
    // Draw detections
    detections.forEach(det => {
      if (!det.box) return;
      const [x, y, w, h] = det.box;
      ctx.strokeStyle = '#6699CC'; // Subdued blue for detection boxes
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#6699CC';
      ctx.font = 'bold 14px Inter';
      ctx.fillText(`${det.object} (${det.zone || 'N/A'})`, x, y > 20 ? y - 5 : y + h + 15);
    });
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isWebcamActive || videoRef.current.paused || videoRef.current.ended) {
      if (isWebcamActive) animationFrameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      if (isWebcamActive) animationFrameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const imageDataUrl = tempCanvas.toDataURL('image/jpeg');

    try {
      const response = await fetch(`${PYTHON_API_URL}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Failed to parse error from backend.' }));
        console.error('Backend error during /detect:', errData.detail || response.statusText);
        // Potentially set a transient error message for the user
        toast({
            variant: "destructive",
            title: "Detection Error",
            description: `Could not get detections: ${errData.detail || response.statusText}. Is the Python backend running?`,
        });
      } else {
        const data = await response.json();
        if (data.detections) setDetections(data.detections);
      }
    } catch (err: any) {
      console.error('Error sending frame to backend:', err);
      toast({
        variant: "destructive",
        title: "Detection Connection Error",
        description: "Failed to connect to the detection backend. Please ensure it's running and accessible.",
      });
    }
    
    drawOverlay();
    if (isWebcamActive) animationFrameIdRef.current = requestAnimationFrame(processFrame);
  };
  
  const startWebcam = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { 
             videoRef.current?.play().catch(e => {
                console.error("Error playing video:", e);
                setError("Could not play video stream.");
                toast({ variant: "destructive", title: "Playback Error", description: "Could not play video stream."});
             });
             setIsWebcamActive(true);
             setIsLoading(false);
          }
        }
      } else {
        setError('getUserMedia not supported in this browser.');
        toast({ variant: "destructive", title: "Browser Error", description: "getUserMedia not supported."});
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access webcam. Please check permissions.');
      toast({ variant: "destructive", title: "Webcam Access Denied", description: "Failed to access webcam. Please check permissions."});
      setIsLoading(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    setDetections([]); // Clear detections when webcam stops
  };

  useEffect(() => {
    // Fetch initial zones
    const fetchZones = async () => {
      try {
        const response = await fetch(`${PYTHON_API_URL}/zones`);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({ detail: "Unknown error fetching zones."}));
            throw new Error(errData.detail || `Failed to fetch zones: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.zones) setCurrentZones(data.zones);
      } catch (err: any) {
        console.error('Error fetching zones:', err);
        const errorMessage = err.message.includes('fetch') ? 
          'Failed to connect to backend to fetch zones. Is the Python backend running and accessible?' : 
          err.message;
        setError(errorMessage); // Set error for main display
        toast({
            variant: "destructive",
            title: "Zone Loading Error",
            description: errorMessage,
        });
      }
    };
    fetchZones();
    // Start webcam automatically
    startWebcam();

    return () => {
      stopWebcam();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (isWebcamActive) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        animationFrameIdRef.current = requestAnimationFrame(processFrame);
    } else {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
    }
    return () => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWebcamActive, detections, currentZones]); // Rerun if detections or zones change to redraw overlay

  if (isLoading && !isWebcamActive && !error) { // Don't show loading if there's already an error
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-lg border border-dashed bg-muted/50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Initializing webcam and loading zones...</p>
      </div>
    );
  }

  if (error && !isWebcamActive) { // If webcam couldn't start due to a persistent error (like zones failing AND webcam access)
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Initialization Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => { setError(null); startWebcam(); }} className="mt-4">Try Again</Button>
      </Alert>
    );
  }
  
  return (
    <div className="relative aspect-video w-full max-w-4xl mx-auto bg-card border rounded-lg shadow-lg overflow-hidden">
      {!isWebcamActive && !isLoading && !error ? ( // Show if webcam is off, not loading, and no major error prevented it
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <VideoOff className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Webcam is off or not found.</p>
            <Button onClick={startWebcam} variant="outline">
                <Video className="mr-2 h-4 w-4" /> Start Webcam
            </Button>
        </div>
      ) : null}
      <video
        ref={videoRef}
        className="block w-full h-full object-contain"
        playsInline
        muted // Mute to avoid feedback loops if mic is accidentally enabled
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none" 
      />
      {isWebcamActive && (
        <Button 
          onClick={stopWebcam} 
          variant="destructive" 
          size="sm"
          className="absolute bottom-4 right-4 z-20"
        >
          <VideoOff className="mr-2 h-4 w-4" /> Stop Webcam
        </Button>
      )}
       {isLoading && isWebcamActive && ( // Loading spinner specifically when webcam is active but something is loading (e.g., first frame processing)
         <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       )}
    </div>
  );
}

    
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  "data-testid"?: string;
}

export default function CameraCapture({ onCapture, "data-testid": testId }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Try to use back camera
      });
      
      setStream(mediaStream);
      setIsCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to take photos of your crops.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        onCapture(imageUrl);
        stopCamera();
        
        toast({
          title: "Photo Captured",
          description: "Your crop photo has been added successfully.",
        });
      }
    }, "image/jpeg", 0.8);
  };

  return (
    <div data-testid={testId}>
      {!isCapturing ? (
        <Button
          type="button"
          onClick={startCamera}
          className="w-full"
          data-testid="open-camera-button"
        >
          <Camera className="h-4 w-4 mr-2" />
          Open Camera
        </Button>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg bg-black"
                autoPlay
                playsInline
                muted
                data-testid="camera-preview"
              />
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2"
                onClick={stopCamera}
                data-testid="close-camera-button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-center mt-4 space-x-4">
              <Button
                variant="outline"
                onClick={stopCamera}
                data-testid="cancel-capture-button"
              >
                Cancel
              </Button>
              <Button
                onClick={capturePhoto}
                data-testid="capture-photo-button"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

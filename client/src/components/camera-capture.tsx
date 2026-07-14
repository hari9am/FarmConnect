import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  "data-testid"?: string;
}

export default function CameraCapture({ onCapture, "data-testid": testId }: CameraCaptureProps) {
  const { t } = useLanguage();
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      console.log("Requesting camera access...");
      console.log("Navigator.mediaDevices:", navigator.mediaDevices);
      console.log("getUserMedia available:", !!navigator.mediaDevices?.getUserMedia);
      console.log("Current protocol:", window.location.protocol);
      console.log("Current host:", window.location.host);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraSupported(false);
        throw new Error("Camera not supported on this device");
      }
      
      // Check HTTPS requirement for camera access
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.warn("Camera access may require HTTPS in production");
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });
      
      console.log("Camera access granted, setting up video...");
      setStream(mediaStream);
      setIsCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
          console.log("Video started playing");
        } catch (playError) {
          console.error("Error playing video:", playError);
        }
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      let errorMessage = t("camera_allow_access") || "Please allow camera access to take photos of your crops.";
      
      if (error.name === "NotAllowedError") {
        errorMessage = t("camera_denied") || "Camera access was denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage = t("camera_not_found") || "No camera found on this device.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = t("camera_not_supported") || "Camera is not supported on this device.";
        setCameraSupported(false);
      } else if (error.message.includes("not supported")) {
        errorMessage = t("camera_not_supported_use_upload") || "Camera is not supported on this device. Try using the 'Upload Photo' option instead.";
        setCameraSupported(false);
      }
      
      toast({
        title: t("camera_access_error") || "Camera Access Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      console.log("Video metadata loaded, dimensions:", video.videoWidth, "x", video.videoHeight);
      setIsReady(true);
    };
    
    const onCanPlay = () => {
      console.log("Video can play");
      setIsReady(true);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("canplay", onCanPlay);
    
    // If metadata already available
    if (video.readyState >= 1 && video.videoWidth > 0) {
      console.log("Video already ready");
      setIsReady(true);
    }
    
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [isCapturing]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
    setIsReady(false);
  };

  const capturePhoto = () => {
    console.log("Attempting to capture photo...");
    
    if (!isReady) {
      console.log("Camera not ready");
      toast({ title: t("camera_not_ready") || "Camera not ready", description: t("please_wait_try_again") || "Please wait a moment and try again." });
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) {
      console.log("Video or canvas ref not available");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      console.log("Canvas context not available");
      return;
    }

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);

      // Draw video frame to canvas
      context.drawImage(video, 0, 0);
      console.log("Video frame drawn to canvas");

      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          console.log("Blob created successfully, size:", blob.size);
          const imageUrl = URL.createObjectURL(blob);
          onCapture(imageUrl);
          stopCamera();
          toast({ title: t("photo_captured") || "Photo Captured", description: t("photo_added_success") || "Your crop photo has been added successfully." });
        } else {
          console.log("Blob creation failed, using data URL fallback");
          // Fallback for older browsers
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          onCapture(dataUrl);
          stopCamera();
          toast({ title: "Photo Captured", description: "Your crop photo has been added successfully." });
        }
      }, "image/jpeg", 0.8);
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast({
        title: t("capture_error") || "Capture Error",
        description: t("failed_capture_try_again") || "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t("invalid_file_type") || "Invalid File Type",
          description: t("please_select_image_file") || "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t("file_too_large") || "File Too Large",
          description: t("select_smaller_than_10mb") || "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      onCapture(imageUrl);
      toast({ title: t("photo_added") || "Photo Added", description: t("photo_added_success") || "Your crop photo has been added successfully." });
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div data-testid={testId}>
      {!isCapturing ? (
        <div className="space-y-2">
          {cameraSupported && (
            <Button
              type="button"
              onClick={startCamera}
              className="w-full"
              data-testid="open-camera-button"
            >
              <Camera className="h-4 w-4 mr-2" />
              {t("open_camera") || "Open Camera"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            className="w-full"
            data-testid="upload-photo-button"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t("upload_photo") || "Upload Photo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="file-input"
          />
        </div>
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
                {t("cancel") || "Cancel"}
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={!isReady}
                data-testid="capture-photo-button"
              >
                <Camera className="h-4 w-4 mr-2" />
                {t("capture_photo") || "Capture Photo"}
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

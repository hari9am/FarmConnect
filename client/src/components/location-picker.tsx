import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  "data-testid"?: string;
}

export default function LocationPicker({ onLocationSelect, "data-testid": testId }: LocationPickerProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click position to mock lat/lng
    const lat = 28.6139 + (y / rect.height - 0.5) * 0.1;
    const lng = 77.2090 + (x / rect.width - 0.5) * 0.1;
    
    const location = {
      lat,
      lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    };

    onLocationSelect(location);
    setIsSelecting(false);
  };

  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <div 
          className="bg-muted h-32 rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
          onClick={handleMapClick}
          data-testid="location-map"
        >
          {/* Mock map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200"></div>
          
          <div className="relative z-10 text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isSelecting ? "Tap on the map to select location" : "Click to select location"}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => setIsSelecting(!isSelecting)}
          data-testid="select-location-button"
        >
          {isSelecting ? "Cancel Selection" : "Select Location on Map"}
        </Button>
      </CardContent>
    </Card>
  );
}

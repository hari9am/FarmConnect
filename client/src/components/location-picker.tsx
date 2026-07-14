import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string; radius?: number }) => void;
  "data-testid"?: string;
}

// Fix Leaflet's default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = {
  lat: 28.6139,
  lng: 77.209
};

// Component to handle map clicks
function MapClickHandler({ onMapClick, isSelecting }: { onMapClick: (lat: number, lng: number) => void; isSelecting: boolean }) {
  useMapEvents({
    click: (e) => {
      if (!isSelecting) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ onLocationSelect, "data-testid": testId }: LocationPickerProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(5); // Default 5km radius
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelected({ lat, lng });
    onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, radius });
    setIsSelecting(false);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    if (selected) {
      onLocationSelect({ 
        lat: selected.lat, 
        lng: selected.lng, 
        address: `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`, 
        radius: newRadius 
      });
    }
  };

  return (
    <Card data-testid={testId} className="glass-card shadow-lg overflow-hidden border-primary/10">
      <CardContent className="p-4">
        <div data-testid="location-map" className="rounded-2xl overflow-hidden border border-primary/20">
          {isClient ? (
            <MapContainer
              center={selected || defaultCenter}
              zoom={12}
              style={{ height: '200px', width: '100%' }}
              className="rounded-2xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} isSelecting={isSelecting} />
              {selected && (
                <>
                  <Marker position={selected}>
                    <Popup>
                      Selected Location<br />
                      Lat: {selected.lat.toFixed(6)}<br />
                      Lng: {selected.lng.toFixed(6)}<br />
                      Radius: {radius}km
                    </Popup>
                  </Marker>
                  <Circle
                    center={selected}
                    radius={radius * 1000} // Convert km to meters
                    pathOptions={{
                      color: 'primary',
                      fillColor: '#10b981',
                      fillOpacity: 0.1,
                      weight: 2
                    }}
                  />
                </>
              )}
            </MapContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-muted">
              <p className="text-muted-foreground animate-pulse">Loading Map...</p>
            </div>
          )}
        </div>
        
        {/* Radius Controls */}
        {selected && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Search Radius: {radius} km
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="flex-1 h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(radius - 1) * 100 / 49}%, #e5e7eb ${(radius - 1) * 100 / 49}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRadiusChange(Math.max(1, radius - 5))}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRadiusChange(Math.min(50, radius + 5))}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  +
                </Button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className={`w-full mt-4 rounded-xl font-bold py-5 transition-all ${isSelecting ? 'bg-accent/10 border-accent text-accent' : 'border-primary/20 text-primary'}`}
          onClick={() => setIsSelecting(!isSelecting)}
          data-testid="select-location-button"
        >
          {isSelecting ? "Cancel Selection" : "Select Location on Map"}
        </Button>
      </CardContent>
    </Card>
  );
}


import { useEffect, useState, Component, ErrorInfo } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Calendar, Sprout, ArrowLeft, MapPin, Crosshair } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import CameraCapture from "@/components/camera-capture";
import { useGeolocation } from "@/hooks/use-geolocation";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Fix Leaflet's default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultMapCenter = {
  lat: 20.5937,
  lng: 78.9629
};

function MapClickHandler({ onSelect }: { onSelect: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click: (e) => {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function SelectableMap({
  center,
  onSelect,
}: {
  center: { lat: number; lng: number } | null;
  onSelect: (p: { lat: number; lng: number }) => void;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="h-full w-full flex items-center justify-center bg-muted">Loading Map...</div>;

  return (
    <MapContainer
      center={center || defaultMapCenter}
      zoom={center ? 13 : 5}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onSelect={onSelect} />
      {center && (
        <Marker position={center}>
          <Popup>
            Selected Location<br />
            Lat: {center.lat.toFixed(6)}<br />
            Lng: {center.lng.toFixed(6)}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

interface Params { id: string }

export default function EditUpcomingCrop() {
  const [, navigate] = useLocation();
  const { id } = useParams<Params>();
  const { toast } = useToast();
  const { t } = useLanguage();
  const geo = useGeolocation();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [plantedDate, setPlantedDate] = useState("");
  const [years, setYears] = useState<number | "">("");
  const [months, setMonths] = useState<number | "">("");
  const [days, setDays] = useState<number | "">("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locationLatLng, setLocationLatLng] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/public/upcoming/${id}`);
        if (!res.ok) throw new Error("Failed to load upcoming crop");
        const data = await res.json();
        if (ignore) return;
        setName(data.name || "");
        setPhotoUrl(data.photoUrl || "");
        setPlantedDate(data.plantedDate ? new Date(data.plantedDate).toISOString().slice(0, 10) : "");
        const yt = data.yieldTime || {};
        setYears(yt.years ?? "");
        setMonths(yt.months ?? (yt.years == null ? yt.months ?? "" : ""));
        setDays(yt.days ?? (yt.years == null && yt.months == null ? yt.days ?? "" : ""));
      } catch (e: any) {
        toast({ title: t("failed") || "Failed", description: e?.message || "Unable to load item.", variant: "destructive" });
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (id) load();
    return () => { ignore = true };
  }, [id, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ title: t("name_required") || "Name required", description: t("enter_crop_name") || "Please enter a crop name.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        name,
        plantedDate: plantedDate || null,
        yieldTime: {
          years: years === "" ? undefined : Number(years),
          months: months === "" ? undefined : Number(months),
          days: days === "" ? undefined : Number(days),
        },
        photoUrl: photoUrl || null,
        location: locationLatLng ? { lat: locationLatLng.lat, lng: locationLatLng.lng } : undefined,
      };
      await apiRequest("PATCH", `/api/upcoming/${id}`, payload);
      toast({ title: t("saved") || "Saved", description: t("upcoming_crop_updated") || "Upcoming crop updated." });
      navigate("/farmer/dashboard");
    } catch (err: any) {
      toast({ title: t("failed") || "Failed", description: err?.message || t("unable_update_upcoming") || "Unable to update upcoming crop.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-container p-4">
        <div className="space-y-3">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-40 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
      <div className="mobile-container">
        <div className="flex flex-col min-h-screen">
          <header className="p-4 border-b border-border bg-card">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/farmer/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">{t("edit_upcoming_crop") || "Edit Upcoming Crop"}</h1>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="name">{t("crop_name") || "Crop Name"}</Label>
                  <div className="relative mt-1">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Tomato" required />
                    <Sprout className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
                  </div>
                </div>

                {/* Location selection (not persisted currently) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Location</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const pos = await geo.getCurrentPosition();
                            setLocationLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                            toast({ title: t("location_updated_title") || "Location Updated", description: t("location_updated_desc") || "Your current location has been set for this crop." });
                          } catch (err: any) {
                            toast({ title: t("location_error_title") || "Location Error", description: t("location_error_desc") || (err?.message || "Unable to get your current location."), variant: "destructive" });
                          }
                        }}
                      >
                        <Crosshair className="h-4 w-4 mr-1" /> {t("use_current_location") || "Use Current Location"}
                      </Button>
                    </div>
                  </div>

                  <div className="h-60 rounded-md overflow-hidden border">
                    <SelectableMap center={locationLatLng} onSelect={(p) => setLocationLatLng(p)} />
                  </div>
                  {locationLatLng && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{locationLatLng.lat.toFixed(5)}, {locationLatLng.lng.toFixed(5)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="planted">{t("planted_date") || "Planted Date"}</Label>
                  <div className="relative mt-1">
                    <Input id="planted" type="date" value={plantedDate} onChange={(e) => setPlantedDate(e.target.value)} />
                    <Calendar className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <Label>{t("yield_time") || "Yield Time"}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={(function () { if (years !== "") return String(years); if (months !== "") return String(months); if (days !== "") return String(days); return ""; })()}
                      onChange={(e) => {
                        const val = e.target.value; const num = val === "" ? "" : Number(val);
                        if (years !== "") { setYears(num as any); setMonths(""); setDays(""); }
                        else if (months !== "") { setMonths(num as any); setYears(""); setDays(""); }
                        else if (days !== "") { setDays(num as any); setYears(""); setMonths(""); }
                        else { setMonths(num as any); setYears(""); setDays(""); }
                      }}
                    />
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={years !== "" ? "y" : months !== "" ? "m" : days !== "" ? "d" : ""}
                      onChange={(e) => {
                        const unit = e.target.value; const currentVal = ((): number | "" => { if (years !== "") return years; if (months !== "") return months; if (days !== "") return days; return ""; })();
                        if (!unit) { setYears(""); setMonths(""); setDays(""); return; }
                        if (unit === 'y') { setYears(currentVal as any); setMonths(""); setDays(""); }
                        if (unit === 'm') { setMonths(currentVal as any); setYears(""); setDays(""); }
                        if (unit === 'd') { setDays(currentVal as any); setYears(""); setMonths(""); }
                      }}
                    >
                      <option value="y">{t("years") || "Years"}</option>
                      <option value="m">{t("months") || "Months"}</option>
                      <option value="d">{t("days") || "Days"}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="photo">{t("photo_url") || "Photo"}</Label>
                  <div className="relative mt-1">
                    <Input id="photo" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Take photo" />
                    <ImageIcon className="h-4 w-4 text-muted-foreground absolute right-3 top-3" />
                  </div>
                  <CameraCapture onCapture={(url) => setPhotoUrl(url)} />
                  {photoUrl && (
                    <img src={photoUrl} alt="Upcoming crop" className="mt-1 w-full h-40 object-cover rounded-md border" />
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : (t("save_changes") || "Save Changes")}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
    </div>
  );
}

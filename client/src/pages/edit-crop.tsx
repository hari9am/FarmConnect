import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import CameraCapture from "@/components/camera-capture";
import { useGeolocation } from "@/hooks/use-geolocation";
import { MapPin, Image as ImageIcon, Crosshair } from "lucide-react";

interface Params { id: string }

export default function EditCrop() {
  const { id } = useParams<Params>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const geo = useGeolocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState<number | "">("");
  const [expiryDate, setExpiryDate] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [locationLatLng, setLocationLatLng] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/crops/${id}`);
        if (!res.ok) throw new Error("Failed to load crop");
        const data = await res.json();
        if (ignore) return;
        setName(data.name || "");
        setCategory(data.category || "");
        setQuantity(typeof data.quantity === "number" ? data.quantity : Number(data.quantity) || "");
        setUnit(data.unit || "kg");
        setPricePerUnit(data.pricePerUnit ? Number(data.pricePerUnit) : "");
        setExpiryDate(data.expiryDate ? String(data.expiryDate).slice(0,10) : "");
        setImages(Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []));
        if (data.location && typeof data.location.lat === "number" && typeof data.location.lng === "number") {
          setLocationLatLng({ lat: data.location.lat, lng: data.location.lng });
        }
      } catch (e: any) {
        toast({ title: t("failed") || "Failed", description: e?.message || "Unable to load crop.", variant: "destructive" });
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (id) load();
    return () => { ignore = true };
  }, [id, toast, t]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({ title: t("name_required") || "Name required", description: t("enter_crop_name") || "Please enter a crop name.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name,
        category,
        quantity: quantity === "" ? undefined : Number(quantity),
        unit,
        pricePerUnit: pricePerUnit === "" ? undefined : Number(pricePerUnit),
        expiryDate: expiryDate || undefined,
        images,
        location: locationLatLng || undefined,
      };
      await apiRequest("PATCH", `/api/crops/${id}`, payload);
      toast({ title: t("saved") || "Saved", description: t("crop_updated") || "Crop updated." });
      navigate("/farmer/dashboard");
    } catch (e: any) {
      toast({ title: t("failed") || "Failed", description: e?.message || "Unable to update crop.", variant: "destructive" });
    } finally {
      setSaving(false);
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
        <header className="p-4 border-b border-border bg-card sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{t("edit") || "Edit"} – {name || t("crop") || "Crop"}</h1>
            <Button variant="ghost" onClick={() => navigate("/farmer/dashboard")}>{t("back") || "Back"}</Button>
          </div>
        </header>

        <form onSubmit={onSave} className="flex-1 p-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("crop_name") || "Crop Name"}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Tomato" />
                </div>
                <div className="space-y-2">
                  <Label>{t("category") || "Category"}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_category") || "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fruits">{t("fruits") || "Fruits"}</SelectItem>
                      <SelectItem value="vegetables">{t("vegetables") || "Vegetables"}</SelectItem>
                      <SelectItem value="grains">{t("grains") || "Grains"}</SelectItem>
                      <SelectItem value="flowers">{t("flowers") || "Flowers"}</SelectItem>
                      <SelectItem value="eggs">{t("eggs") || "Eggs"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("quantity") || "Quantity"}</Label>
                  <Input type="number" value={quantity === "" ? "" : String(quantity)} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("unit") || "Unit"}</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">{t("kilograms") || "Kilograms"}</SelectItem>
                      <SelectItem value="quintal">{t("quintal") || "Quintal"}</SelectItem>
                      <SelectItem value="ton">{t("ton") || "Ton"}</SelectItem>
                      <SelectItem value="number">{t("number") || "Number"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("price_per_unit") || "Price per Unit"}</Label>
                  <Input type="number" step="0.01" value={pricePerUnit === "" ? "" : String(pricePerUnit)} onChange={(e) => setPricePerUnit(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>{t("expiry_date") || "Expiry Date"}</Label>
                  <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>{t("photos") || "Photos"}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`photo-${idx}`} className="w-full h-24 object-cover rounded-md border" />
                      <Button type="button" variant="secondary" size="sm" className="mt-1 w-full" onClick={() => setImages(images.filter((_,i)=>i!==idx))}>
                        {t("remove") || "Remove"}
                      </Button>
                    </div>
                  ))}
                  {images.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 border rounded-md text-muted-foreground">
                      <ImageIcon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{t("no_photos") || "No photos"}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input placeholder={t("photo_url") || "Photo URL"} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) { setImages([...images, val]); (e.target as HTMLInputElement).value=''; }
                    }
                  }} />
                  <CameraCapture onCapture={(url) => setImages([...images, url])} />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>{t("location") || "Location"}</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {locationLatLng ? (
                    <span>{locationLatLng.lat.toFixed(5)}, {locationLatLng.lng.toFixed(5)}</span>
                  ) : (
                    <span>{t("no_location_set") || "No location set"}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={async () => {
                    try {
                      const pos = await geo.getCurrentPosition();
                      setLocationLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    } catch (err: any) {
                      toast({ title: t("location_error_title") || "Location Error", description: t("location_error_desc") || (err?.message || "Unable to get your current location."), variant: "destructive" });
                    }
                  }}>
                    <Crosshair className="h-4 w-4 mr-1" /> {t("use_current_location") || "Use Current Location"}
                  </Button>
                  {locationLatLng && (
                    <Button type="button" variant="secondary" onClick={() => setLocationLatLng(null)}>
                      {t("clear") || "Clear"}
                    </Button>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>{saving ? (t("saving") || "Saving...") : (t("save_changes") || "Save Changes")}</Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

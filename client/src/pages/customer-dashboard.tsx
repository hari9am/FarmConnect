import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageCircle, ShoppingCart, MapPin, Star, Map, Heart, User, Globe, Gift, Zap, Layers, Navigation, Leaf, Sprout } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLanguage } from "@/hooks/use-language";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLocalizedProduceName } from "@/lib/produce-translations";
import { getPoints } from "@/lib/rewards";

// Fix Leaflet's default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

export default function CustomerDashboard() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("nearby");
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [points, setPoints] = useState(0);
  const { getCurrentPosition } = useGeolocation();
  const { t } = useLanguage();
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerH, setHeaderH] = useState<number>(0);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const user = JSON.parse(localStorage.getItem("farmconnect-user") || "{}");

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ["/api/crops"],
    queryFn: () => fetch("/api/crops").then(res => res.json()),
    staleTime: 60_000,
  });

  const { data: deliveryRequests = [] } = useQuery({
    queryKey: ["/api/customer/delivery-requests"],
    queryFn: async () => {
      const token = localStorage.getItem("farmconnect-token");
      if (!token) return [];
      const res = await fetch("/api/customer/delivery-requests", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return [];
      return res.json();
    },
  });

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("farmconnect-token");
        if (!token) return;
        const res = await fetch("/api/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (typeof data.count === "number") setUnreadCount(data.count);
      } catch {}
    };
    fetchUnread();
  }, []);

  useEffect(() => {
    const measure = () => setHeaderH(headerRef.current?.offsetHeight || 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const refresh = () => setPoints(getPoints());
    refresh();
    const i = setInterval(refresh, 10_000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const key = "farmconnect-cart";
    const update = () => {
      try {
        const items = JSON.parse(localStorage.getItem(key) || "[]");
        const total = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };
    update();
    window.addEventListener("cart:updated", update as any);
    return () => window.removeEventListener("cart:updated", update as any);
  }, []);



  function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s1 = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
    return R * c;
  }

  const filteredCrops = useMemo(() => {
    const q = (debouncedSearch || searchQuery).toLowerCase();
    let list = (crops as any[]).filter((crop: any) => crop.name.toLowerCase().includes(q));
    if (selectedFilter === "nearby" && myPos) {
      list = list
        .filter((c: any) => c.location && typeof c.location.lat === "number" && typeof c.location.lng === "number")
        .map((c: any) => ({ ...c, _dist: distanceKm(myPos.lat, myPos.lng, c.location.lat, c.location.lng) }))
        .filter((c: any) => typeof c._dist === "number" && c._dist <= radiusKm)
        .sort((a: any, b: any) => (a._dist ?? Infinity) - (b._dist ?? Infinity));
    }
    return list;
  }, [crops, debouncedSearch, searchQuery, selectedFilter, myPos, radiusKm]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    (async () => {
      if (selectedFilter !== "nearby") return;
      try {
        const pos = await getCurrentPosition();
        if (pos?.coords) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMyPos({ lat, lng });
          setMapCenter({ lat, lng });
        }
      } catch {}
    })();
  }, [selectedFilter]);

  const filters = [
    { id: "nearby", label: t("nearby") || "Nearby Harvests", icon: Navigation },
    { id: "vegetables", label: t("vegetables") || "Vegetables", icon: "🥬" },
    { id: "fruits", label: t("fruits") || "Fruits", icon: "🍎" },
    { id: "grains", label: t("grains") || "Grains", icon: "🌾" },
  ];

  const handleProductClick = (cropId: string) => navigate(`/product/${cropId}`);


  return (
    <div className="min-h-screen text-foreground font-sans overflow-x-hidden relative pb-24">
      {/* Nature Background Elements */}
      <div className="farm-bg">
        <div className="farm-leaf top-[-5%] left-[-5%]" />
        <div className="farm-leaf bottom-[-5%] right-[-5%] bg-accent opacity-5" />
        
        {/* Natural Decorations */}
        <div className="creeper-vine plant-decoration top-20 left-10" />
        <div className="creeper-vine plant-decoration bottom-20 right-10" style={{ transform: 'scale(0.8) rotate(180deg)' }} />
        <div className="leaf-pattern plant-decoration top-40 right-20" />
        <div className="leaf-pattern plant-decoration bottom-40 left-20" style={{ animationDelay: '3s' }} />
        <div className="leaf-pattern plant-decoration top-60 left-1/2" style={{ animationDelay: '6s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Modern Sticky Nature Header */}
        <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 p-4">
          <div className="glass-ultra rounded-[2rem] p-3 flex items-center justify-between shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-1" style={{fontFamily: 'var(--font-display)'}}>
                  {t("hey") || "Hi"}, {user.username || t("explorer") || "Friend"} <Leaf className="w-4 h-4 text-primary" />
                </h1>
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{t("today_offerings") || "Live Harvest Stream"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/cart")} className="w-10 h-10 rounded-full bg-background/50 border border-border flex items-center justify-center relative hover:scale-110 transition shadow-sm">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg">{cartCount}</span>}
              </button>
            </div>
          </div>
        </header>

        <div style={{ height: headerH + 20 }} />

        <main className="flex-1 px-4 space-y-8 max-w-5xl mx-auto w-full">
          {/* Search Section */}
          <div className="relative animate-fade-up">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <Input
              type="text"
              placeholder={t("search_local_produce") || "Search fresh crops..."}
              className="w-full h-14 pl-12 bg-white/60 backdrop-blur-2xl border border-primary/10 text-foreground rounded-[1.5rem] focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground text-lg shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 animate-fade-up">
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-500 scale-95 hover:scale-100 ${isSelected ? 'bg-primary text-white shadow-xl translate-y-[-2px]' : 'glass-ultra border-border text-muted-foreground hover:bg-primary/5'}`}
                >
                  {typeof filter.icon === "string" ? <span>{filter.icon}</span> : <filter.icon className="w-4 h-4" />}
                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* Interactive Google Radar */}
          <div className="glass-card p-1 shadow-2xl animate-fade-up">
            <div className="bg-white/40 rounded-[2rem] overflow-hidden relative border border-white/20" style={{ height: 380 }}>
              <div className="absolute top-4 left-4 z-[400] glass-ultra px-4 py-2 rounded-full text-xs font-black border border-white/40 flex items-center gap-2 shadow-lg text-primary uppercase tracking-widest">
                <MapPin className="w-4 h-4 animate-bounce" /> {t("harvest_radar") || "Harvest Radar"}
              </div>
              
              {isClient ? (
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {myPos && (
                    <>
                      <Marker position={myPos}>
                        <Popup>
                          Your Location<br />
                          Search Radius: {radiusKm}km
                        </Popup>
                      </Marker>
                      <Circle
                        center={myPos}
                        radius={radiusKm * 1000}
                        pathOptions={{
                          fillColor: "#10b981",
                          fillOpacity: 0.1,
                          color: "#10b981",
                          opacity: 0.8,
                          weight: 2
                        }}
                      />
                    </>
                  )}
                  {crops.map((crop: any) => (
                    <Marker
                      key={crop.id}
                      position={{ lat: crop.locationLat, lng: crop.locationLng }}
                      eventHandlers={{
                        click: () => setSelectedCrop(crop)
                      }}
                    >
                      {selectedCrop?.id === crop.id && (
                        <Popup>
                          <div className="p-2 min-w-[150px]">
                            <h4 className="font-black text-primary">{crop.name}</h4>
                            <p className="text-xs font-bold text-accent">₹{crop.pricePerUnit}/{crop.unit}</p>
                          </div>
                        </Popup>
                      )}
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">Loading Radar...</div>
              )}
              <button 
                className="absolute bottom-4 right-4 z-[400] w-14 h-14 glass-ultra rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/40 shadow-xl text-primary"
                onClick={async () => {
                  try {
                    const pos = await getCurrentPosition();
                    if (pos) setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  } catch {}
                }}
              >
                <Navigation className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Product Feed */}
          <div className="animate-fade-up py-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <Sprout className="w-6 h-6 text-primary" />
                <h3 className="font-black text-2xl font-display text-primary tracking-tight">{t("fresh_harvests") || "Fresh Harvests"}</h3>
              </div>
              <Badge variant="outline" className="rounded-full border-primary/20 text-primary bg-primary/5 px-4 py-1 font-bold">
                {filteredCrops.length} {t("items") || "Items"}
              </Badge>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                   <div key={i} className="glass-ultra h-64 rounded-[2rem] animate-pulse"></div>
                ))}
              </div>
            ) : filteredCrops.length === 0 ? (
              <div className="glass-ultra p-12 rounded-[2.5rem] text-center border border-primary/10 bg-white/40">
                <Search className="w-16 h-16 text-primary mx-auto mb-4 opacity-20" />
                <p className="font-black text-xl text-primary">{t("nothing_found") || "Nothing Sprouts Here"}</p>
                <p className="text-muted-foreground mt-2">{t("try_adjusting") || "Try adjusting your filters or search."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCrops.map((crop: any) => (
                  <div key={crop.id} className="glass-card cursor-pointer group shadow-lg" onClick={() => handleProductClick(crop.id)}>
                    <div className="bg-white/60 h-full rounded-[2rem] flex flex-col p-2 border border-white/20">
                      <div className="w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4 relative">
                        <img 
                          src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?auto=format&fit=crop&w=400&h=500"} 
                          alt={crop.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-1000"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black shadow-lg text-primary">
                          ★ 4.9
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <h4 className="text-xl font-black text-white leading-none drop-shadow-md">{crop.name}</h4>
                          <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">Direct from Farm</p>
                        </div>
                      </div>
                      <div className="px-3 pb-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-black text-primary">₹{crop.pricePerUnit}<span className="text-sm font-medium text-muted-foreground">/{crop.unit}</span></p>
                          {myPos && crop.location && typeof crop.location.lat === 'number' && typeof crop.location.lng === 'number' && (
                             <div className="flex items-center gap-1 text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded-lg">
                               <Navigation className="w-3 h-3" />
                               {(distanceKm(myPos.lat, myPos.lng, crop.location.lat, crop.location.lng)).toFixed(1)}km
                             </div>
                          )}
                        </div>
                        <Button className="w-full btn-organic rounded-xl font-bold py-5">
                          {t("view_details") || "Details"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Floating Bottom Nav */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
          <nav className="glass-ultra rounded-[2.5rem] px-8 py-4 flex justify-between items-center border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
             <button className="flex flex-col items-center gap-1 group">
               <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl transform active:scale-95 transition duration-300">
                 <Map className="h-6 w-6" />
               </div>
             </button>
             <button className="flex items-center justify-center text-muted-foreground hover:text-primary transition-all p-2 rounded-xl group" onClick={() => navigate("/rewards")}>
               <Gift className="h-7 w-7 group-hover:-translate-y-1 transition" />
             </button>
             <button className="flex items-center justify-center text-muted-foreground hover:text-primary transition-all p-2 rounded-xl group relative" onClick={() => navigate("/messages")}>
               <MessageCircle className="h-7 w-7 group-hover:-translate-y-1 transition" />
               {unreadCount > 0 && <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-white">{unreadCount}</span>}
             </button>
             <button className="flex items-center justify-center text-muted-foreground hover:text-primary transition-all p-2 rounded-xl group" onClick={() => navigate("/profile")}>
               <User className="h-7 w-7 group-hover:-translate-y-1 transition" />
             </button>
          </nav>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Save, X, LogOut, User, Phone, Globe, Trash, Camera, Upload, Leaf, ShieldCheck, Zap, Settings, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, getCurrentUser, getUserRole, logout } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const userUpdateSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const farmerUpdateSchema = userUpdateSchema.extend({});

type UserUpdateData = z.infer<typeof userUpdateSchema>;
type FarmerUpdateData = z.infer<typeof farmerUpdateSchema>;

export default function Profile() {
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const user = getCurrentUser();
  const userRole = getUserRole();
  const isFarmer = userRole === "farmer";

  if (!user || !userRole) {
    navigate("/role");
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhoto || null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/${userRole}/profile`],
    queryFn: async () => {
      const response = await fetch(`/api/${userRole}/profile`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    enabled: !!userRole,
  });

  const userForm = useForm<UserUpdateData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      username: profile?.username || user?.username || "",
      phone: profile?.phone || user?.phone || "",
    },
  });

  const farmerForm = useForm<FarmerUpdateData>({
    resolver: zodResolver(farmerUpdateSchema),
    defaultValues: {
      username: profile?.username || user?.username || "",
      phone: profile?.phone || user?.phone || "",
    },
  });

  React.useEffect(() => {
    if (profile) {
      const formData = {
        username: profile.username || user?.username || "",
        phone: profile.phone || user?.phone || "",
      };
      if (isFarmer) farmerForm.reset(formData);
      else userForm.reset(formData);
      if (profile.profilePhoto) setProfilePhoto(profile.profilePhoto);
    }
  }, [profile, user, isFarmer, farmerForm, userForm]);

  const mutationOptions = {
    onSuccess: () => {
      toast({ title: t("profile_updated"), description: t("profile_updated_successfully") });
      setIsEditing(false);
      if (photoPreview) setProfilePhoto(photoPreview);
      queryClient.invalidateQueries({ queryKey: [`/api/${userRole}/profile`] });
      const currentForm = isFarmer ? farmerForm : userForm;
      const updatedUser = { ...user, ...currentForm.getValues(), ...(photoPreview && { profilePhoto: photoPreview }) };
      localStorage.setItem("farmconnect-user", JSON.stringify(updatedUser));
    },
    onError: (error: any) => {
      toast({ title: t("update_failed"), description: error.message, variant: "destructive" });
    },
  };

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserUpdateData) => {
      const endpoint = isFarmer ? `/api/farmer/profile` : `/api/user/profile`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    ...mutationOptions
  });

  const handleLogout = () => { logout(); navigate("/role"); };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("delete_account_confirmation"));
    if (!confirmed) return;
    try {
      const res = await fetch("/api/account", { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to delete account");
      toast({ title: t("account_deleted") });
      logout();
    } catch (err: any) {
      toast({ title: t("delete_failed"), description: err?.message, variant: "destructive" });
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDelete = () => {
    setPhotoPreview(null);
    setProfilePhoto(null);
    // Immediately update the backend to remove photo
    const baseData = isFarmer ? farmerForm.getValues() : userForm.getValues();
    const updateData = { ...baseData, profilePhoto: null };
    updateUserMutation.mutate(updateData);
  };

  const handleSave = () => {
    const baseData = isFarmer ? farmerForm.getValues() : userForm.getValues();
    const updateData = { ...baseData, ...(photoPreview && { profilePhoto: photoPreview }) };
    updateUserMutation.mutate(updateData);
  };

  const languages = [
    { code: "english", name: "English" },
    { code: "hindi", name: "हिंदी (Hindi)" },
    { code: "punjabi", name: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "tamil", name: "தமிழ் (Tamil)" },
    { code: "telugu", name: "తెలుగు (Telugu)" },
    { code: "kannada", name: "ಕನ್ನಡ (Kannada)" },
    { code: "malayalam", name: "മലയാളം (Malayalam)" },
    { code: "marathi", name: "मराठी (Marathi)" },
    { code: "gujarati", name: "ગુજરાતી (Gujarati)" },
    { code: "bengali", name: "বাংলা (Bengali)" },
    { code: "odia", name: "ଓଡ଼ିଆ (Odia)" },
    { code: "urdu", name: "اردو (Urdu)" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6">
        <div className="w-24 h-24 rounded-[3rem] bg-primary/10 flex items-center justify-center animate-pulse border border-primary/20 shadow-xl">
           <User className="w-10 h-10 text-primary/20" />
        </div>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans text-foreground pb-20">
      {/* Enhanced Background System */}
      <div className="farm-bg fixed inset-0 z-0">
        <div className="farm-leaf top-[-10%] left-[-10%] opacity-10" />
        <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        
        {/* Natural Decorations */}
        <div className="creeper-vine plant-decoration top-20 left-10" />
        <div className="creeper-vine plant-decoration bottom-20 right-10" style={{ transform: 'scale(0.8) rotate(180deg)' }} />
        <div className="leaf-pattern plant-decoration top-40 right-20" />
        <div className="leaf-pattern plant-decoration bottom-40 left-20" style={{ animationDelay: '3s' }} />
        <div className="leaf-pattern plant-decoration top-60 left-1/2" style={{ animationDelay: '6s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="glass-ultra px-4 py-6 md:px-8 border-b border-white/20 sticky top-0 z-50 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(isFarmer ? "/farmer/dashboard" : "/customer/dashboard")}
                className="w-10 h-10 rounded-2xl bg-white/50 border border-primary/10 flex items-center justify-center text-primary hover:bg-white/80 transition shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                   {t("profile") || 'Identity & Settings'}
                </h1>
              </div>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="btn-organic rounded-2xl h-10 px-4 bg-primary/10 text-primary hover:bg-primary/20 border-none font-black text-[10px] uppercase tracking-widest relative overflow-hidden"
              >
                <Edit className="h-4 w-4 mr-2" /> {t("edit") || 'Edit Profile'} 🌿
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
           {/* Avatar Showcase */}
           <div className="animate-fade-up">
              <div className="glass-card p-1 shadow-2xl overflow-hidden rounded-[3rem]">
                 <div className="bg-white/80 backdrop-blur-3xl rounded-[2.8rem] p-10 text-center border border-white/40 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-none" />
                    
                    <div className="relative inline-block mb-8">
                       <div className="w-36 h-36 mx-auto rounded-[3rem] overflow-hidden bg-white border-4 border-white shadow-2xl relative z-10">
                          {photoPreview || profilePhoto ? (
                             <img src={photoPreview || profilePhoto || ''} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                                <User className="h-16 w-16 text-primary/40" />
                             </div>
                          )}
                       </div>
                       
                       {isEditing && (
                          <div className="absolute -bottom-2 -right-2 flex gap-2 z-20">
                             <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform">
                                <Camera className="h-5 w-5" />
                             </button>
                             { (photoPreview || profilePhoto) && (
                                <button onClick={handlePhotoDelete} className="w-12 h-12 rounded-2xl bg-destructive text-white flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform">
                                   <X className="h-5 w-5" />
                                </button>
                             )}
                          </div>
                       )}
                       <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </div>

                    <div className="space-y-2 relative z-10">
                       <h2 className="text-4xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                          {profile?.username || user?.username}
                       </h2>
                       <div className="flex items-center justify-center gap-3">
                          <Badge className="bg-primary/90 text-white border-none font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                             <Leaf className="w-3.5 h-3.5 mr-2" /> {isFarmer ? 'Master Cultivator' : 'Premium Customer'}
                          </Badge>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              {/* Account Metrics */}
              <div className="glass-card p-1 shadow-xl animate-fade-up" style={{ animationDelay: '100ms' }}>
                 <div className="bg-white/90 rounded-[2.5rem] p-8 border border-white/20 shadow-inner space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                       </div>
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t("personal_information") || 'Biological Identity'}</h3>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("username_label") || 'Public Alias'}</Label>
                          {isEditing ? (
                             <Input {...(isFarmer ? farmerForm.register("username") : userForm.register("username"))} className="h-14 rounded-2xl bg-white/50 border-primary/10 font-bold focus:ring-primary h-14" />
                          ) : (
                             <p className="text-xl font-black text-foreground ml-1">{profile?.username || user?.username}</p>
                          )}
                       </div>

                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("phone_number") || 'Communication Channel'}</Label>
                          {isEditing ? (
                             <Input {...(isFarmer ? farmerForm.register("phone") : userForm.register("phone"))} className="h-14 rounded-2xl bg-white/50 border-primary/10 font-bold focus:ring-primary h-14" />
                          ) : (
                             <p className="text-xl font-black text-foreground ml-1">{profile?.phone || user?.phone}</p>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Preferences */}
              <div className="glass-card p-1 shadow-xl animate-fade-up" style={{ animationDelay: '200ms' }}>
                 <div className="bg-white/90 rounded-[2.5rem] p-8 border border-white/20 shadow-inner space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shadow-sm">
                          <Globe className="w-5 h-5 text-accent" />
                       </div>
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent">{t("language_label") || 'Cultural Interface'}</h3>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Interface Dialect</Label>
                          {isEditing ? (
                             <div className="relative">
                                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-white/50 border border-primary/10 text-foreground rounded-2xl h-14 px-5 focus:ring-primary focus:outline-none appearance-none font-bold">
                                   {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                                </select>
                                <Globe className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-40 pointer-events-none" />
                             </div>
                          ) : (
                             <div className="flex items-center gap-3 bg-accent/5 px-5 py-4 rounded-2xl border border-accent/10">
                                <Globe className="h-5 w-5 text-accent" />
                                <p className="text-lg font-black text-accent">{languages.find(l => l.code === language)?.name || "English"}</p>
                             </div>
                          )}
                       </div>
                    </div>
                    
                    {isEditing && (
                       <div className="flex gap-4 pt-4">
                          <Button onClick={handleSave} className="flex-1 btn-organic h-14 rounded-2xl shadow-lg relative overflow-hidden" disabled={updateUserMutation.isPending}>
                             <Save className="h-5 w-5 mr-3" /> {t("save") || 'Preserve Changes'} 🌱
                          </Button>
                          <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-14 rounded-2xl border-none hover:bg-destructive/10 text-destructive font-black uppercase text-[10px] tracking-widest">
                             {t("cancel") || 'Discard'}
                          </Button>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Destructive Actions */}
           <div className="space-y-4 animate-fade-up pt-8" style={{ animationDelay: '300ms' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button onClick={handleLogout} className="glass-card p-1 shadow-lg group">
                    <div className="bg-white/80 rounded-[2rem] p-6 flex items-center justify-between border border-white/40 hover:bg-white transition-all">
                       <div className="flex items-center gap-5 text-left">
                          <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
                             <LogOut className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                             <h4 className="font-black text-lg text-primary uppercase tracking-tight leading-none">{t("logout") || 'Terminate Session'}</h4>
                             <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Secure Sign Out</p>
                          </div>
                       </div>
                    </div>
                 </button>

                 <button onClick={handleDeleteAccount} className="glass-card p-1 shadow-lg group">
                    <div className="bg-destructive/5 rounded-[2rem] p-6 flex items-center justify-between border border-destructive/10 hover:bg-destructive/10 transition-all">
                       <div className="flex items-center gap-5 text-left">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-destructive/20 group-hover:scale-110 transition-transform">
                             <Trash className="h-7 w-7 text-destructive" />
                          </div>
                          <div>
                             <h4 className="font-black text-lg text-destructive uppercase tracking-tight leading-none">{t("delete_account") || 'Wipe Identity'}</h4>
                             <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Irreversible Extraction</p>
                          </div>
                       </div>
                    </div>
                 </button>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

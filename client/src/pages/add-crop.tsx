import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/use-geolocation";
import CameraCapture from "@/components/camera-capture";
import LocationPicker from "@/components/location-picker";
import { useLanguage } from "@/hooks/use-language";

const cropSchema = z.object({
  name: z.string().min(1, "Please select a crop type"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Please select a unit"),
  pricePerUnit: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().optional(),
  expiryDate: z.string().min(1, "Please select an expiry date"),
});

type CropFormData = z.infer<typeof cropSchema>;

// Category -> product catalog used for crop selection
const productCatalog: Record<string, string[]> = {
  fruits: ["apples", "bananas", "mangoes"],
  vegetables: ["tomatoes", "onions", "potatoes", "carrots", "spinach"],
  grains: ["wheat", "rice"],
  flowers: ["rose", "lotus", "sunflower", "daisy", "tulip"],
  eggs:["eggs"],
};

export default function AddCrop() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; radius?: number } | null>(null);
  const [category, setCategory] = useState<string>("");
  const [useOtherCategory, setUseOtherCategory] = useState<boolean>(false);
  const [otherCategoryName, setOtherCategoryName] = useState<string>("");
  const [useOtherName, setUseOtherName] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getCurrentPosition } = useGeolocation();
  const { t } = useLanguage();

  const form = useForm<CropFormData>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      unit: "kg",
    },
  });
  const selectedName = form.watch("name");

  const createCropMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/crops", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmer/crops"] });
      toast({
        title: t("crop_added_title"),
        description: t("crop_added_desc"),
      });
      navigate("/farmer/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: t("error_adding_crop_title"),
        description: error.message || t("generic_error"),
        variant: "destructive",
      });
    },
  });

  const handleGetCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // In a real app, you'd use a geocoding service to get the address
      const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      setLocation({
        lat: latitude,
        lng: longitude,
        address,
        radius: 5, // Default 5km radius
      });

      toast({
        title: t("location_updated_title"),
        description: t("location_updated_desc"),
      });
    } catch (error) {
      toast({
        title: t("location_error_title"),
        description: t("location_error_desc"),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (data: CropFormData) => {
    // Require category if using Other
    if (useOtherName && !category) {
      toast({ title: t("category"), description: t("select_category"), variant: "destructive" });
      return;
    }
    if (!data.name || data.name.trim().length === 0) {
      toast({ title: t("crop_name"), description: t("enter_product_name"), variant: "destructive" });
      return;
    }
    const cropData = {
      ...data,
      // Ensure numeric types are sent as numbers, but server will coerce decimal/date formats
      quantity: Number(data.quantity),
      pricePerUnit: Number(data.pricePerUnit),
      images,
      location,
      expiryDate: new Date(data.expiryDate).toISOString(),
    } as any;

    createCropMutation.mutate(cropData);
  };

  const handleImageCapture = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const progressSteps = [
    { step: 1, title: t("step_details"), active: step >= 1 },
    { step: 2, title: t("step_photo"), active: step >= 2 },
    { step: 3, title: t("step_location"), active: step >= 3 },
  ];

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b border-border bg-card sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/farmer/dashboard")}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold" data-testid="page-title">{t("add_new_crop")}</h1>
          </div>
        </header>

        <div className="flex-1 p-4 space-y-6">
          {/* Step Progress */}
          <div className="flex items-center justify-between mb-6" data-testid="progress-steps">
            {progressSteps.map((stepInfo, index) => (
              <div key={stepInfo.step} className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    stepInfo.active 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {stepInfo.step}
                  </div>
                  <span className={`text-sm ${
                    stepInfo.active ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {stepInfo.title}
                  </span>
                </div>
                {index < progressSteps.length - 1 && (
                  <div className="flex-1 h-1 bg-muted mx-2"></div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Crop Details */}
            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">{t("category")}</Label>
                <Select 
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value);
                    setUseOtherCategory(value === "__other_cat__");
                    // Reset previously selected product name when category changes
                    form.setValue("name", "");
                    // Adjust unit defaults depending on category
                    if (value === "eggs") {
                      form.setValue("unit", "number");
                    } else {
                      form.setValue("unit", "kg");
                    }
                    // If category is other, default product selection to Other as well
                    if (value === "__other_cat__") {
                      setUseOtherName(true);
                    } else {
                      setUseOtherName(false);
                    }
                  }} 
                  data-testid="select-category"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fruits">{t("fruits")}</SelectItem>
                    <SelectItem value="vegetables">{t("vegetables")}</SelectItem>
                    <SelectItem value="grains">{t("grains")}</SelectItem>
                    <SelectItem value="flowers">{t("flowers") || "Flowers"}</SelectItem>
                    <SelectItem value="eggs">{t("eggs") || "Eggs"}</SelectItem>
                    <SelectItem value="__other_cat__">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
                {useOtherCategory && (
                  <Input
                    id="otherCategory"
                    placeholder={t("enter_category_name")}
                    value={otherCategoryName}
                    onChange={(e) => setOtherCategoryName(e.target.value)}
                    data-testid="input-other-category"
                  />
                )}
              </div>

              {/* Product under selected category */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("crop_name")}</Label>
                <Select 
                  onValueChange={(value) => {
                    if (value === "__other__") {
                      setUseOtherName(true);
                      form.setValue("name", "");
                    } else {
                      setUseOtherName(false);
                      form.setValue("name", value);
                    }
                  }} 
                  value={useOtherName ? "__other__" : (selectedName as any)}
                  disabled={!category}
                  data-testid="select-product-name"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_product")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(productCatalog[category] || []).map((prod) => (
                      <SelectItem key={prod} value={prod}>
                        {t(`crop_${prod}`) || prod.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
                {useOtherName && (
                  <Input
                    id="otherName"
                    placeholder={t("enter_product_name")}
                    value={(form.watch("name") as any) || ""}
                    onChange={(e) => form.setValue("name", e.target.value)}
                    data-testid="input-other-product"
                  />
                )}
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t("quantity")}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    {...form.register("quantity", { valueAsNumber: true })}
                    data-testid="input-quantity"
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">{t("unit")}</Label>
                  <Select onValueChange={(value) => form.setValue("unit", value)} value={form.watch("unit")} data-testid="select-unit">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {category === "eggs" ? (
                        <SelectItem value="number">{t("number") || "Number"}</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="kg">{t("kilograms")}</SelectItem>
                          <SelectItem value="quintal">{t("quintal")}</SelectItem>
                          <SelectItem value="ton">{t("ton")}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">{t("price_per_unit")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">₹</span>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...form.register("pricePerUnit", { valueAsNumber: true })}
                    data-testid="input-price"
                  />
                </div>
                {form.formState.errors.pricePerUnit && (
                  <p className="text-sm text-destructive">{form.formState.errors.pricePerUnit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">{t("expiry_date")}</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...form.register("expiryDate")}
                  data-testid="input-expiry-date"
                />
                {form.formState.errors.expiryDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description_optional")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("description_placeholder")}
                  className="h-24 resize-none"
                  {...form.register("description")}
                  data-testid="textarea-description"
                />
              </div>
            </div>

            {/* Photo Upload Section */}
            <Card data-testid="photo-upload-section">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">{t("add_photos")}</h3>
                {images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Crop photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                        data-testid={`crop-image-${index}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-4">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4" data-testid="photo-prompt">{t("photo_prompt")}</p>
                  </div>
                )}
                <CameraCapture onCapture={handleImageCapture} data-testid="camera-capture" />
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card data-testid="location-section">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{t("farm_location")}</h3>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    className="text-primary"
                    data-testid="use-current-location"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    {t("use_current_location")}
                  </Button>
                </div>
                {location ? (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">{t("location_set")}</p>
                    <p className="text-xs text-muted-foreground">{location.address}</p>
                  </div>
                ) : (
                  <LocationPicker onLocationSelect={setLocation} data-testid="location-picker" />
                )}
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            className="w-full"
            disabled={createCropMutation.isPending}
            data-testid="publish-crop-button"
          >
            {createCropMutation.isPending ? t("publishing") : t("publish_crop")}
          </Button>
        </div>
      </div>
    </div>
  );
}

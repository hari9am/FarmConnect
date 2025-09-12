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

const cropSchema = z.object({
  name: z.string().min(1, "Please select a crop type"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Please select a unit"),
  pricePerUnit: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().optional(),
  expiryDate: z.string().min(1, "Please select an expiry date"),
});

type CropFormData = z.infer<typeof cropSchema>;

const cropOptions = [
  { value: "tomatoes", label: "Tomatoes" },
  { value: "onions", label: "Onions" },
  { value: "potatoes", label: "Potatoes" },
  { value: "carrots", label: "Carrots" },
  { value: "spinach", label: "Spinach" },
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
];

export default function AddCrop() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getCurrentPosition } = useGeolocation();

  const form = useForm<CropFormData>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      unit: "kg",
    },
  });

  const createCropMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/crops", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmer/crops"] });
      toast({
        title: "Crop Added Successfully!",
        description: "Your crop has been published and is now visible to customers.",
      });
      navigate("/farmer/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Crop",
        description: error.message || "Something went wrong. Please try again.",
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
      });

      toast({
        title: "Location Updated",
        description: "Your current location has been set for this crop.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get your current location. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (data: CropFormData) => {
    const cropData = {
      ...data,
      images,
      location,
      expiryDate: new Date(data.expiryDate).toISOString(),
    };

    createCropMutation.mutate(cropData);
  };

  const handleImageCapture = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const progressSteps = [
    { step: 1, title: "Details", active: step >= 1 },
    { step: 2, title: "Photo", active: step >= 2 },
    { step: 3, title: "Location", active: step >= 3 },
  ];

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/farmer/dashboard")}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold" data-testid="page-title">Add New Crop</h1>
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
              <div className="space-y-2">
                <Label htmlFor="name">Crop Name</Label>
                <Select onValueChange={(value) => form.setValue("name", value)} data-testid="select-crop-name">
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value}>
                        {crop.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
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
                  <Label htmlFor="unit">Unit</Label>
                  <Select onValueChange={(value) => form.setValue("unit", value)} defaultValue="kg" data-testid="select-unit">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="quintal">Quintal</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit">Price per Unit</Label>
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
                <Label htmlFor="expiryDate">Expiry Date</Label>
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your crop quality, farming methods..."
                  className="h-24 resize-none"
                  {...form.register("description")}
                  data-testid="textarea-description"
                />
              </div>
            </div>

            {/* Photo Upload Section */}
            <Card data-testid="photo-upload-section">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Add Photos</h3>
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
                    <p className="text-muted-foreground mb-4" data-testid="photo-prompt">Take photos of your crop</p>
                  </div>
                )}
                <CameraCapture onCapture={handleImageCapture} data-testid="camera-capture" />
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card data-testid="location-section">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Farm Location</h3>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    className="text-primary"
                    data-testid="use-current-location"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Use Current Location
                  </Button>
                </div>
                {location ? (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Location Set</p>
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
            {createCropMutation.isPending ? "Publishing..." : "Publish Crop"}
          </Button>
        </div>
      </div>
    </div>
  );
}

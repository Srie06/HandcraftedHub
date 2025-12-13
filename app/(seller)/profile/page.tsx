"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Store, MapPin, Phone, Mail, FileText, Save } from "lucide-react";
import { Loader } from "@/components/loader";

/**
 * Profile Edit Page - Seller Profile Management
 */
function ProfileContent() {
  const { userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || "",
    shopName: userProfile?.shopName || "",
    shopDescription: userProfile?.shopDescription || "",
    location: userProfile?.location || "",
    phone: userProfile?.phone || "",
    bio: userProfile?.bio || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = "Shop name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await updateUserProfile({
        displayName: formData.displayName,
        shopName: formData.shopName,
        shopDescription: formData.shopDescription,
        location: formData.location,
        phone: formData.phone,
        bio: formData.bio,
        profileComplete: true,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <Card className="rounded-xl shadow-soft lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your seller information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1">
                {formData.displayName || "Your Name"}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {formData.shopName || "Your Shop"}
              </p>
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {formData.location || "Location"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  className={`mt-1 rounded-xl ${
                    errors.displayName ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={userProfile?.email || ""}
                    disabled
                    className="pl-10 rounded-xl bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shop Information */}
          <Card className="rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="shopName" className="text-sm font-medium">
                  Shop/Company Name
                </label>
                <Input
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) =>
                    handleInputChange("shopName", e.target.value)
                  }
                  className={`mt-1 rounded-xl ${
                    errors.shopName ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.shopName && (
                  <p className="text-sm text-red-500 mt-1">{errors.shopName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="shopDescription"
                  className="text-sm font-medium"
                >
                  Shop Description
                </label>
                <textarea
                  id="shopDescription"
                  value={formData.shopDescription}
                  onChange={(e) =>
                    handleInputChange("shopDescription", e.target.value)
                  }
                  rows={4}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-input bg-background"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio / Story
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={3}
                  placeholder="Tell your story..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-input bg-background"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="City, State, Country"
                    className={`pl-10 rounded-xl ${
                      errors.location ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={`pl-10 rounded-xl ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireSeller={true}>
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-amber-900">
              Edit Profile
            </h1>
            <p className="text-amber-800/70">
              Manage your seller profile and shop information
            </p>
          </div>

          <ProfileContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}

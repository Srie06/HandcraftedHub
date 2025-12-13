"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FormErrorBoundary from "@/components/form-error-boundary";
import { getFirebaseAuthErrorMessage } from "@/lib/validation";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, userProfile } = useAuth();

  const [step, setStep] = useState(1); // 1 = basic info, 2 = seller details
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    role: "buyer" as "buyer" | "seller",
    // Seller-specific fields
    shopName: "",
    shopDescription: "",
    location: "",
    phone: "",
  });

  // Check for role query parameter and pre-select seller role
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "seller") {
      setFormData((prev) => ({ ...prev, role: "seller" }));
    }
  }, [searchParams]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (userProfile) {
    router.push(userProfile.role === "seller" ? "/dashboard" : "/");
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Shop name validation
    if (!formData.shopName.trim()) {
      newErrors.shopName = "Shop/Company name is required";
    } else if (formData.shopName.trim().length < 2) {
      newErrors.shopName = "Shop name must be at least 2 characters";
    }

    // Shop description validation
    if (!formData.shopDescription.trim()) {
      newErrors.shopDescription = "Shop description is required";
    } else if (formData.shopDescription.trim().length < 10) {
      newErrors.shopDescription = "Description must be at least 10 characters";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");

    if (!validateStep1()) {
      return;
    }

    // If seller, go to step 2, otherwise submit
    if (formData.role === "seller") {
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setAuthError("");

    // Validate step 2 for sellers
    if (formData.role === "seller" && !validateStep2()) {
      return;
    }

    setIsLoading(true);

    try {
      const sellerProfile =
        formData.role === "seller"
          ? {
              shopName: formData.shopName,
              shopDescription: formData.shopDescription,
              location: formData.location,
              phone: formData.phone,
            }
          : undefined;

      await signUp(
        formData.email,
        formData.password,
        formData.role,
        formData.displayName,
        sellerProfile
      );

      // Redirect based on role
      router.push(formData.role === "seller" ? "/dashboard" : "/");
    } catch (error: any) {
      console.error("Signup error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      // Use centralized error message handler
      const errorMessage = getFirebaseAuthErrorMessage(error.code);
      console.log("Translated error message:", errorMessage);
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pastel-alt p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-soft-lg border-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Join HandcraftedHub to start buying or selling handcrafted items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step Indicator for Sellers */}
          {formData.role === "seller" && (
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {step > 1 ? "✓" : "1"}
                </div>
                <div className="w-12 h-0.5 bg-gray-300" />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 2
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={
              step === 1
                ? handleNext
                : (e) => {
                    e.preventDefault();
                    handleSubmit();
                  }
            }
            className="space-y-4"
          >
            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={formData.displayName}
                onChange={(e) =>
                  handleInputChange("displayName", e.target.value)
                }
                disabled={isLoading}
                className={`rounded-xl transition-all duration-300 ${
                  errors.displayName ? "border-red-500" : ""
                }`}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                className={`rounded-xl transition-all duration-300 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                className={`rounded-xl transition-all duration-300 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                disabled={isLoading}
                className={`rounded-xl transition-all duration-300 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">I want to</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="buyer"
                        checked={formData.role === "buyer"}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Buy handcrafted items</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        checked={formData.role === "seller"}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Sell my creations</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Seller Details */}
            {step === 2 && formData.role === "seller" && (
              <>
                {/* Shop/Company Name */}
                <div className="space-y-2">
                  <label htmlFor="shopName" className="text-sm font-medium">
                    Shop/Company Name
                  </label>
                  <Input
                    id="shopName"
                    type="text"
                    placeholder="Enter your shop or company name"
                    value={formData.shopName}
                    onChange={(e) =>
                      handleInputChange("shopName", e.target.value)
                    }
                    disabled={isLoading}
                    className={`rounded-xl transition-all duration-300 ${
                      errors.shopName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.shopName && (
                    <p className="text-sm text-red-500">{errors.shopName}</p>
                  )}
                </div>

                {/* Shop Description */}
                <div className="space-y-2">
                  <label
                    htmlFor="shopDescription"
                    className="text-sm font-medium"
                  >
                    Shop Description
                  </label>
                  <textarea
                    id="shopDescription"
                    placeholder="Tell us about your craft and products"
                    value={formData.shopDescription}
                    onChange={(e) =>
                      handleInputChange("shopDescription", e.target.value)
                    }
                    disabled={isLoading}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 ${
                      errors.shopDescription ? "border-red-500" : "border-input"
                    }`}
                  />
                  {errors.shopDescription && (
                    <p className="text-sm text-red-500">
                      {errors.shopDescription}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, State/Province, Country"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={isLoading}
                    className={`rounded-xl transition-all duration-300 ${
                      errors.location ? "border-red-500" : ""
                    }`}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your contact number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={isLoading}
                    className={`rounded-xl transition-all duration-300 ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </>
            )}

            {/* Auth Error */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full rounded-xl"
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="w-full rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : step === 1 && formData.role === "seller" ? (
                  "Next"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <FormErrorBoundary formName="Signup Form">
      <SignupContent />
    </FormErrorBoundary>
  );
}

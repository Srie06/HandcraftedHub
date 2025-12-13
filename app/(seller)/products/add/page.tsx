"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createDocument } from "@/lib/firebase/firestore";
import { uploadMultipleFiles } from "@/lib/firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import FormErrorBoundary from "@/components/form-error-boundary";
import { getFirebaseErrorMessage } from "@/lib/validation";

/**
 * Product categories
 */
const CATEGORIES = [
  "Jewelry",
  "Home Decor",
  "Pottery",
  "Textiles",
  "Woodwork",
  "Art",
  "Accessories",
  "Other",
];

/**
 * Form data interface
 */
interface ProductFormData {
  title: string;
  description: string;
  price: string;
  stock: string;
  category: string;
}

/**
 * Form errors interface
 */
interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  images?: string;
}

/**
 * Add Product page content
 */
function AddProductContent() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  // Image state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  /**
   * Handle input change
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file types and sizes
    const validFiles: File[] = [];
    const invalidFiles: Array<{ name: string; error: string }> = [];

    Array.from(files).forEach((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        invalidFiles.push({ name: file.name, error: "Not an image file" });
        return;
      }

      // Check file size (10MB limit)
      const maxSizeInMB = 10;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        invalidFiles.push({
          name: file.name,
          error: `File size exceeds ${maxSizeInMB}MB`,
        });
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles
        .map((f) => `${f.name}: ${f.error}`)
        .join(", ");
      toast({
        title: "Invalid files",
        description: errorMessages,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      // Add to existing files
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);

      // Create previews
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      // Clear error
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }

      // Show success message if files were added
      toast({
        title: "Images added",
        description: `${validFiles.length} image${
          validFiles.length > 1 ? "s" : ""
        } added successfully`,
      });
    }

    // Reset input
    e.target.value = "";
  };

  /**
   * Remove selected image
   */
  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number";
      }
    }

    // Stock validation
    if (!formData.stock) {
      newErrors.stock = "Stock is required";
    } else {
      const stock = parseInt(formData.stock, 10);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock must be a non-negative number";
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Images validation
    if (selectedFiles.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to add products",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress("Uploading images...");

    try {
      // Generate a temporary product ID for storage path
      const tempProductId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`;
      const storagePath = `products/${tempProductId}`;

      // Upload images to Firebase Storage
      setUploadProgress("Uploading images...");
      const imageURLs = await uploadMultipleFiles(storagePath, selectedFiles);

      setUploadProgress("Creating product...");

      // Create product document in Firestore
      const productData = {
        sellerId: userProfile.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category: formData.category,
        images: imageURLs,
      };

      await createDocument("products", productData);

      // Show success message
      toast({
        title: "Product created",
        description: "Your product has been successfully added.",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: getFirebaseErrorMessage(error),
        variant: "destructive",
      });
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="rounded-2xl shadow-soft-lg border-2">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            Create a new product listing for your handcrafted items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Product Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enter product title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`rounded-xl transition-all duration-300 ${
                  errors.title ? "border-destructive" : ""
                }`}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your product"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={4}
                className={`flex w-full rounded-xl border ${
                  errors.description ? "border-destructive" : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300`}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price ($) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`rounded-xl transition-all duration-300 ${
                    errors.price ? "border-destructive" : ""
                  }`}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Stock <span className="text-destructive">*</span>
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`rounded-xl transition-all duration-300 ${
                    errors.stock ? "border-destructive" : ""
                  }`}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`flex h-10 w-full rounded-xl border ${
                  errors.category ? "border-destructive" : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Images */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Product Images <span className="text-destructive">*</span>
              </label>
              <div className="space-y-4">
                {/* File input */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted transition-all duration-300 ${
                      errors.images ? "border-destructive" : "border-input"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                </div>

                {errors.images && (
                  <p className="text-sm text-destructive">{errors.images}</p>
                )}

                {/* Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-input group shadow-soft hover:shadow-soft-lg transition-all duration-300"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload progress */}
            {uploadProgress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader size="sm" />
                <span>{uploadProgress}</span>
              </div>
            )}

            {/* Form actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={isSubmitting}
                className="flex-1 rounded-xl transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Creating Product...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Add Product Page
 * Protected route that requires seller role
 */
export default function AddProductPage() {
  return (
    <ProtectedRoute requireSeller={true}>
      <FormErrorBoundary formName="Add Product Form">
        <main className="min-h-screen bg-gradient-pastel">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Add Product</h1>
              <p className="text-muted-foreground">
                List a new handcrafted product in your collection
              </p>
            </div>

            <AddProductContent />
          </div>
        </main>
      </FormErrorBoundary>
    </ProtectedRoute>
  );
}

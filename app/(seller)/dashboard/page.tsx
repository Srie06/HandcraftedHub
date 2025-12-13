"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useProducts } from "@/hooks/use-products";
import { useWhatsAppDrafts } from "@/hooks/use-whatsapp-drafts";
import ProtectedRoute from "@/components/protected-route";
import { Loader } from "@/components/loader";
import { ProductGridSkeleton } from "@/components/skeleton-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Plus,
  Package,
  ShoppingBag,
  DollarSign,
  Bell,
  User,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import {
  deleteProduct,
  updateDocument,
  getDocument,
} from "@/lib/firebase/firestore";
import { getProductSalesCount } from "@/lib/firebase/orders";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductDraft } from "@/types";

/**
 * Dashboard Stats Component
 */
function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Earnings */}
      <Card className="rounded-xl shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Earnings
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground mt-1">
            +0% from last month
          </p>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="rounded-xl shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Orders
          </CardTitle>
          <ShoppingBag className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">0 pending orders</p>
        </CardContent>
      </Card>

      {/* Active Products */}
      <Card className="rounded-xl shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Products
          </CardTitle>
          <Package className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">0 out of stock</p>
        </CardContent>
      </Card>

      {/* Profile Status */}
      <Card className="rounded-xl shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile Status
          </CardTitle>
          <User className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Complete</div>
          <p className="text-xs text-muted-foreground mt-1">
            All details filled
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Quick Actions Component
 */
function QuickActions({ onAddProduct }: { onAddProduct: () => void }) {
  const router = useRouter();

  return (
    <Card className="rounded-xl shadow-soft mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your store efficiently</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={onAddProduct}
            className="h-auto flex-col py-6 rounded-xl"
          >
            <Plus className="h-6 w-6 mb-2" />
            <span>Add Product</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col py-6 rounded-xl"
            onClick={() => router.push("/orders")}
          >
            <ShoppingBag className="h-6 w-6 mb-2" />
            <span>View Orders</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col py-6 rounded-xl"
            onClick={() => router.push("/profile")}
          >
            <User className="h-6 w-6 mb-2" />
            <span>Edit Profile</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col py-6 rounded-xl"
            onClick={() => router.push("/earnings")}
          >
            <TrendingUp className="h-6 w-6 mb-2" />
            <span>Earnings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Notifications Component
 */
function NotificationsPanel() {
  const notifications = [
    {
      id: 1,
      type: "info",
      message: "Welcome to your seller dashboard!",
      time: "Just now",
    },
  ];

  return (
    <Card className="rounded-xl shadow-soft mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Stay updated with your store</CardDescription>
          </div>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No new notifications
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Get status badge variant based on draft status
 */
function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    case "review":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Get status icon based on draft status
 */
function getStatusIcon(status: string) {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    case "review":
      return <Eye className="h-4 w-4" />;
    case "processing":
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

/**
 * Format status text
 */
function formatStatus(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "review":
      return "Under Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

/**
 * Calculate estimated review time based on submission time
 */
function getEstimatedReviewTime(submittedAt: any): string {
  const submitted = submittedAt?.toDate();
  if (!submitted) return "Unknown";

  const now = new Date();
  const hoursSinceSubmission =
    (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);

  // Assume 24-48 hour review time
  if (hoursSinceSubmission < 24) {
    return "Within 24 hours";
  } else if (hoursSinceSubmission < 48) {
    return "Within 48 hours";
  } else {
    return "Under review";
  }
}

/**
 * Get go-live date for approved products
 */
function getGoLiveDate(reviewedAt: any): string {
  const reviewed = reviewedAt?.toDate();
  if (!reviewed) return "Unknown";

  return reviewed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * WhatsApp Submissions Section Component
 */
function WhatsAppSubmissionsSection({ sellerId }: { sellerId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { drafts, loading } = useWhatsAppDrafts({ sellerId });
  const [salesCounts, setSalesCounts] = useState<{ [key: string]: number }>({});
  const [loadingSales, setLoadingSales] = useState(false);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    price: number;
    stock: number;
    paused: boolean;
  } | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch sales counts for approved drafts with productId
  useEffect(() => {
    const fetchSalesCounts = async () => {
      setLoadingSales(true);
      const counts: { [key: string]: number } = {};

      const approvedDrafts = drafts.filter(
        (draft) => draft.status === "approved" && draft.productId
      );

      for (const draft of approvedDrafts) {
        if (draft.productId) {
          const count = await getProductSalesCount(draft.productId);
          counts[draft.id] = count;
        }
      }

      setSalesCounts(counts);
      setLoadingSales(false);
    };

    if (drafts.length > 0) {
      fetchSalesCounts();
    }
  }, [drafts]);

  /**
   * Handle resubmit for rejected products
   */
  const handleResubmit = (draftId: string) => {
    toast({
      title: "Resubmit via WhatsApp",
      description:
        "Please send updated product information via WhatsApp to resubmit.",
    });
  };

  /**
   * Toggle expanded view for draft details
   */
  const toggleExpanded = (draftId: string) => {
    setExpandedDraft(expandedDraft === draftId ? null : draftId);
  };

  /**
   * Open quick edit dialog
   */
  const openQuickEdit = async (productId: string) => {
    try {
      const productDoc = await getDocument("products", productId);
      if (productDoc) {
        setSelectedProduct({
          id: productId,
          price: productDoc.price || 0,
          stock: productDoc.stock || 0,
          paused: productDoc.paused || false,
        });
        setEditPrice(String(productDoc.price || 0));
        setEditStock(String(productDoc.stock || 0));
        setQuickEditOpen(true);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  };

  /**
   * Save quick edits
   */
  const saveQuickEdit = async () => {
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      const price = parseFloat(editPrice);
      const stock = parseInt(editStock);

      if (isNaN(price) || price < 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      if (isNaN(stock) || stock < 0) {
        toast({
          title: "Invalid Stock",
          description: "Please enter a valid stock quantity",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      await updateDocument("products", selectedProduct.id, {
        price,
        stock,
      });

      toast({
        title: "Product Updated",
        description: "Your changes have been saved successfully",
      });

      setQuickEditOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggle product pause/resume
   */
  const toggleProductPause = async (
    productId: string,
    currentPaused: boolean
  ) => {
    try {
      await updateDocument("products", productId, {
        paused: !currentPaused,
      });

      toast({
        title: currentPaused ? "Product Resumed" : "Product Paused",
        description: currentPaused
          ? "Your product is now visible to buyers"
          : "Your product is now hidden from buyers",
      });

      // Update local state
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct({
          ...selectedProduct,
          paused: !currentPaused,
        });
      }
    } catch (error) {
      console.error("Error toggling product pause:", error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  /**
   * View sales analytics for a product
   */
  const viewAnalytics = (productId: string, draftId: string) => {
    const salesCount = salesCounts[draftId] || 0;
    toast({
      title: "Sales Analytics",
      description: `Total sales: ${salesCount} units`,
    });
  };

  if (loading) {
    return (
      <Card className="rounded-xl shadow-soft mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp Submissions
              </CardTitle>
              <CardDescription>Products submitted via WhatsApp</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-soft mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              WhatsApp Submissions
            </CardTitle>
            <CardDescription>Products submitted via WhatsApp</CardDescription>
          </div>
          <Badge variant="secondary">{drafts.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No WhatsApp submissions yet
            </h3>
            <p className="text-muted-foreground max-w-md">
              Send product photos and descriptions via WhatsApp to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <Card
                key={draft.id}
                className="overflow-hidden rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4 p-4">
                  {/* Product Image */}
                  <div className="relative w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {draft.originalMedia.images &&
                    draft.originalMedia.images.length > 0 ? (
                      <Image
                        src={draft.originalMedia.images[0]}
                        alt="Product"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold line-clamp-1">
                        {draft.aiProcessing?.translations?.en?.title ||
                          "Processing..."}
                      </h3>
                      <Badge
                        variant={getStatusBadgeVariant(draft.status)}
                        className="flex items-center gap-1 flex-shrink-0"
                      >
                        {getStatusIcon(draft.status)}
                        {formatStatus(draft.status)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {draft.aiProcessing?.translations?.en?.description ||
                        "AI processing in progress..."}
                    </p>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Submitted:{" "}
                        </span>
                        <span className="font-medium">
                          {draft.submittedAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>

                      {draft.status === "approved" && (
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Sales: </span>
                          <span className="font-medium">
                            {loadingSales ? "..." : salesCounts[draft.id] || 0}
                          </span>
                        </div>
                      )}

                      {draft.aiProcessing?.generated?.category && (
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {draft.aiProcessing.generated.category}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Status Tracking Details */}
                    <div className="mt-3 pt-3 border-t">
                      {/* Pending Review Status */}
                      {(draft.status === "review" ||
                        draft.status === "processing") && (
                        <div className="flex items-start gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-900">
                              Pending Review
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Estimated time:{" "}
                              {getEstimatedReviewTime(draft.submittedAt)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Approved Status */}
                      {draft.status === "approved" && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900">
                              Approved & Live
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Go-live date: {getGoLiveDate(draft.reviewedAt)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Rejected Status */}
                      {draft.status === "rejected" && (
                        <div className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-red-900">Rejected</p>
                            {draft.adminReview?.feedback && (
                              <div className="mt-1 p-2 bg-red-50 rounded text-xs">
                                <p className="font-medium mb-1">
                                  Admin Feedback:
                                </p>
                                <p className="text-red-800">
                                  {draft.adminReview.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 flex-shrink-0">
                    {draft.status === "review" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none"
                        disabled
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        In Review
                      </Button>
                    )}
                    {draft.status === "approved" && draft.productId && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none"
                          onClick={() => openQuickEdit(draft.productId!)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Quick Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none"
                          onClick={() =>
                            router.push(`/product/${draft.productId}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none"
                          onClick={() =>
                            viewAnalytics(draft.productId!, draft.id)
                          }
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </>
                    )}
                    {draft.status === "rejected" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 md:flex-none"
                        onClick={() => handleResubmit(draft.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Resubmit
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Quick Edit Dialog */}
      <Dialog open={quickEditOpen} onOpenChange={setQuickEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Edit Product</DialogTitle>
            <DialogDescription>
              Update price, stock, or pause/resume your product listing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Price Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Stock Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Quantity</label>
              <Input
                type="number"
                min="0"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Pause/Resume Toggle */}
            {selectedProduct && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Product Visibility</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct.paused
                      ? "Product is currently hidden"
                      : "Product is currently visible"}
                  </p>
                </div>
                <Button
                  variant={selectedProduct.paused ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    toggleProductPause(
                      selectedProduct.id,
                      selectedProduct.paused
                    )
                  }
                >
                  {selectedProduct.paused ? (
                    <>
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuickEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={saveQuickEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/**
 * Seller Dashboard Content
 */
function DashboardContent() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products for the current seller
  const { products, loading } = useProducts({
    sellerId: userProfile?.uid,
  });

  /**
   * Handle product deletion
   */
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id, productToDelete.images || []);

      toast({
        title: "Product deleted",
        description: "Your product has been successfully deleted.",
      });

      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Open delete confirmation dialog
   */
  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  /**
   * Navigate to edit product page
   */
  const handleEditProduct = (productId: string) => {
    router.push(`/products/${productId}/edit`);
  };

  /**
   * Navigate to add product page
   */
  const handleAddProduct = () => {
    router.push("/products/add");
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <DashboardStats />
        <QuickActions onAddProduct={handleAddProduct} />
        <ProductGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <QuickActions onAddProduct={handleAddProduct} />

      {/* Notifications */}
      <NotificationsPanel />

      {/* WhatsApp Submissions Section */}
      {userProfile?.uid && (
        <WhatsAppSubmissionsSection sellerId={userProfile.uid} />
      )}

      {/* Products Section */}
      <Card className="rounded-xl shadow-soft">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </div>
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Empty state - no products */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Start building your collection by adding your first handcrafted
                product.
              </p>
              <Button onClick={handleAddProduct} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-muted rounded-t-xl overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Product Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Price:
                        </span>
                        <span className="font-semibold">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Stock:
                        </span>
                        <Badge
                          variant={
                            product.stock > 0 ? "default" : "destructive"
                          }
                        >
                          {product.stock}{" "}
                          {product.stock === 1 ? "item" : "items"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Category:
                        </span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => openDeleteDialog(product)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.title}
              &quot;? This action cannot be undone and will permanently remove
              the product and all its images.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Seller Dashboard Page
 * Protected route that requires seller role
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute requireSeller={true}>
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-amber-900">
              Seller Dashboard
            </h1>
            <p className="text-amber-800/70">
              Welcome back! Manage your products and grow your business.
            </p>
          </div>

          <DashboardContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}

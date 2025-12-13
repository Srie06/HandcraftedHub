"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProductDraft, DraftStatus } from "@/types";
import { getAllDrafts } from "@/lib/firebase/product-drafts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import { Search, Filter, Eye } from "lucide-react";

export default function ProductDraftsPage() {
  const router = useRouter();
  const { userProfile, loading: authLoading } = useAuth();
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [filteredDrafts, setFilteredDrafts] = useState<ProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DraftStatus | "all">("all");

  // Load drafts
  useEffect(() => {
    async function loadDrafts() {
      try {
        setLoading(true);
        const allDrafts = await getAllDrafts();
        setDrafts(allDrafts);
        setFilteredDrafts(allDrafts);
      } catch (error) {
        console.error("Error loading drafts:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadDrafts();
    }
  }, [authLoading]);

  // Apply filters
  useEffect(() => {
    let filtered = [...drafts];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((draft) => draft.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (draft) =>
          draft.sellerName.toLowerCase().includes(query) ||
          draft.sellerPhone.includes(query) ||
          draft.id.toLowerCase().includes(query)
      );
    }

    setFilteredDrafts(filtered);
  }, [drafts, statusFilter, searchQuery]);

  // Count by status
  const statusCounts = {
    all: drafts.length,
    pending: drafts.filter((d) => d.status === "pending").length,
    processing: drafts.filter((d) => d.status === "processing").length,
    review: drafts.filter((d) => d.status === "review").length,
    approved: drafts.filter((d) => d.status === "approved").length,
    rejected: drafts.filter((d) => d.status === "rejected").length,
  };

  const getStatusColor = (status: DraftStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Drafts</h1>
        <p className="text-gray-600">
          Review and approve WhatsApp-submitted products
        </p>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "all" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setStatusFilter("all")}
        >
          <div className="text-2xl font-bold">{statusCounts.all}</div>
          <div className="text-sm text-gray-600">All Drafts</div>
        </Card>
        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "pending" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => setStatusFilter("pending")}
        >
          <div className="text-2xl font-bold">{statusCounts.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "processing" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setStatusFilter("processing")}
        >
          <div className="text-2xl font-bold">{statusCounts.processing}</div>
          <div className="text-sm text-gray-600">Processing</div>
        </Card>
        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "review" ? "ring-2 ring-purple-500" : ""
          }`}
          onClick={() => setStatusFilter("review")}
        >
          <div className="text-2xl font-bold">{statusCounts.review}</div>
          <div className="text-sm text-gray-600">Review</div>
        </Card>
        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "approved" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setStatusFilter("approved")}
        >
          <div className="text-2xl font-bold">{statusCounts.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        <Card
          className={`p-4 cursor-pointer transition-all ${
            statusFilter === "rejected" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setStatusFilter("rejected")}
        >
          <div className="text-2xl font-bold">{statusCounts.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by seller name, phone, or draft ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        >
          <Filter className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      </div>

      {/* Drafts list */}
      <div className="space-y-4">
        {filteredDrafts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No drafts found</p>
          </Card>
        ) : (
          filteredDrafts.map((draft) => (
            <Card
              key={draft.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Image preview */}
                <div className="w-full md:w-32 h-32 flex-shrink-0">
                  {draft.originalMedia.images.length > 0 ? (
                    <img
                      src={draft.originalMedia.images[0]}
                      alt="Product preview"
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                {/* Draft info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {draft.aiProcessing?.translations?.en?.title ||
                          "Processing..."}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Draft ID: {draft.id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(draft.status)}>
                      {draft.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Artisan</p>
                      <p className="font-medium">{draft.sellerName}</p>
                      <p className="text-sm text-gray-600">
                        {draft.sellerPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="font-medium">
                        {formatDate(draft.submittedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Media</p>
                      <p className="font-medium">
                        {draft.originalMedia.images.length} images
                        {draft.originalMedia.audio && ", audio"}
                        {draft.originalMedia.video && ", video"}
                      </p>
                    </div>
                  </div>

                  {draft.aiProcessing?.generated && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <Badge variant="outline">
                        {draft.aiProcessing.generated.category}
                      </Badge>
                      {draft.aiProcessing.generated.tags
                        .slice(0, 3)
                        .map((tag) => (
                          <Badge key={tag} variant="outline" className="ml-2">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  )}

                  <Button
                    onClick={() => router.push(`/product-drafts/${draft.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review Draft
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

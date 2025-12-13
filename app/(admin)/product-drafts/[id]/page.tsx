"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProductDraft, AdminReview, AdminEdits } from "@/types";
import {
  getProductDraft,
  updateDraftAdminReview,
  linkDraftToProduct,
} from "@/lib/firebase/product-drafts";
import { createDocument } from "@/lib/firebase/firestore";
import { sendTextMessage } from "@/lib/whatsapp/message-sender";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import {
  ArrowLeft,
  Check,
  X,
  Image as ImageIcon,
  Music,
  Video,
  Edit2,
  Save,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "bn", name: "Bengali" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
];

export default function DraftReviewPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;
  const { userProfile, loading: authLoading } = useAuth();

  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Editable fields
  const [editedTitles, setEditedTitles] = useState<{ [lang: string]: string }>(
    {}
  );
  const [editedDescriptions, setEditedDescriptions] = useState<{
    [lang: string]: string;
  }>({});
  const [editedCategory, setEditedCategory] = useState("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedPrice, setEditedPrice] = useState<number>(0);
  const [editedStock, setEditedStock] = useState<number>(0);
  const [newTag, setNewTag] = useState("");
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Load draft
  useEffect(() => {
    async function loadDraft() {
      try {
        setLoading(true);
        const draftData = await getProductDraft(draftId);
        if (draftData) {
          setDraft(draftData);

          // Initialize editable fields
          if (draftData.aiProcessing?.translations) {
            const titles: { [lang: string]: string } = {};
            const descriptions: { [lang: string]: string } = {};

            SUPPORTED_LANGUAGES.forEach((lang) => {
              titles[lang.code] =
                draftData.aiProcessing.translations[lang.code]?.title || "";
              descriptions[lang.code] =
                draftData.aiProcessing.translations[lang.code]?.description ||
                "";
            });

            setEditedTitles(titles);
            setEditedDescriptions(descriptions);
          }

          if (draftData.aiProcessing?.generated) {
            setEditedCategory(draftData.aiProcessing.generated.category || "");
            setEditedTags(draftData.aiProcessing.generated.tags || []);
            setEditedPrice(
              draftData.aiProcessing.generated.suggestedPrice || 0
            );
            setEditedStock(10); // Default stock
          }
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadDraft();
    }
  }, [draftId, authLoading]);

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditedTags(editedTags.filter((t) => t !== tag));
  };

  const handleApprove = async () => {
    if (!draft || !userProfile) return;

    try {
      setSubmitting(true);

      // Create edits object
      const edits: AdminEdits = {
        title: editedTitles,
        description: editedDescriptions,
        category: editedCategory,
        tags: editedTags,
        price: editedPrice,
        stock: editedStock,
      };

      // Create admin review
      const adminReview: AdminReview = {
        reviewerId: userProfile.uid,
        reviewerName: userProfile.displayName,
        reviewedAt: Timestamp.now(),
        action: "approved",
        edits,
      };

      // Update draft with admin review
      await updateDraftAdminReview(draftId, adminReview);

      // Publish product
      const productData = {
        sellerId: draft.sellerId,
        title: editedTitles.en || "Handcrafted Product",
        description: editedDescriptions.en || "",
        price: editedPrice,
        stock: editedStock,
        category: editedCategory,
        images: draft.originalMedia.images,
      };

      const productId = await createDocument("products", productData);

      // Link draft to product
      await linkDraftToProduct(draftId, productId);

      // Send WhatsApp notification
      try {
        await sendTextMessage(
          draft.sellerPhone,
          `🎉 Great news! Your product has been approved and is now live on HandcraftedHub!\n\nProduct: ${editedTitles.en}\nPrice: ₹${editedPrice}\n\nYou can view it on the platform now. Happy selling!`
        );
      } catch (error) {
        console.error("Error sending WhatsApp notification:", error);
      }

      alert("Product approved and published successfully!");
      router.push("/product-drafts");
    } catch (error) {
      console.error("Error approving draft:", error);
      alert("Failed to approve draft. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!draft || !userProfile || !rejectFeedback.trim()) {
      alert("Please provide feedback for rejection");
      return;
    }

    try {
      setSubmitting(true);

      // Create edits object (even for rejection, to track what was reviewed)
      const edits: AdminEdits = {
        title: editedTitles,
        description: editedDescriptions,
        category: editedCategory,
        tags: editedTags,
        price: editedPrice,
        stock: editedStock,
      };

      // Create admin review
      const adminReview: AdminReview = {
        reviewerId: userProfile.uid,
        reviewerName: userProfile.displayName,
        reviewedAt: Timestamp.now(),
        action: "rejected",
        feedback: rejectFeedback,
        edits,
      };

      // Update draft with admin review
      await updateDraftAdminReview(draftId, adminReview);

      // Send WhatsApp notification
      try {
        await sendTextMessage(
          draft.sellerPhone,
          `Thank you for your submission to HandcraftedHub.\n\nUnfortunately, we cannot approve your product at this time.\n\nFeedback: ${rejectFeedback}\n\nPlease feel free to submit again with improvements.`
        );
      } catch (error) {
        console.error("Error sending WhatsApp notification:", error);
      }

      alert("Product rejected and feedback sent to artisan.");
      router.push("/product-drafts");
    } catch (error) {
      console.error("Error rejecting draft:", error);
      alert("Failed to reject draft. Please try again.");
    } finally {
      setSubmitting(false);
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

  if (!draft) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Draft not found</p>
          <Button
            onClick={() => router.push("/product-drafts")}
            className="mt-4"
          >
            Back to Drafts
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/product-drafts")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Drafts
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Review Product Draft</h1>
            <p className="text-gray-600">Draft ID: {draft.id}</p>
          </div>
          <Badge
            className={
              draft.status === "approved"
                ? "bg-green-100 text-green-800"
                : draft.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-purple-100 text-purple-800"
            }
          >
            {draft.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Original media and info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Artisan info */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Artisan Information</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{draft.sellerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{draft.sellerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">{formatDate(draft.submittedAt)}</p>
              </div>
            </div>
          </Card>

          {/* Original media */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Original Media</h2>

            {/* Images */}
            {draft.originalMedia.images.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Images ({draft.originalMedia.images.length})
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {draft.originalMedia.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Audio */}
            {draft.originalMedia.audio && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4" />
                  <p className="text-sm font-medium">Audio</p>
                </div>
                <audio controls className="w-full">
                  <source src={draft.originalMedia.audio} />
                </audio>
              </div>
            )}

            {/* Video */}
            {draft.originalMedia.video && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4" />
                  <p className="text-sm font-medium">Video</p>
                </div>
                <video controls className="w-full rounded">
                  <source src={draft.originalMedia.video} />
                </video>
              </div>
            )}

            {/* Text messages */}
            {draft.originalMedia.textMessages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Text Messages</p>
                <div className="space-y-2">
                  {draft.originalMedia.textMessages.map((msg, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* AI Processing info */}
          {draft.aiProcessing && (
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">AI Processing</h2>

              {/* Transcription */}
              {draft.aiProcessing.transcription && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Transcription</p>
                  <Badge variant="outline" className="mb-2">
                    {draft.aiProcessing.transcription.detectedLanguage}
                  </Badge>
                  <Badge variant="outline" className="ml-2 mb-2">
                    {Math.round(
                      draft.aiProcessing.transcription.confidence * 100
                    )}
                    % confidence
                  </Badge>
                  <p className="text-sm bg-gray-50 p-2 rounded">
                    {draft.aiProcessing.transcription.text}
                  </p>
                </div>
              )}

              {/* Generated data */}
              {draft.aiProcessing.generated && (
                <div>
                  <p className="text-sm font-medium mb-2">AI Confidence</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          draft.aiProcessing.generated.confidence * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(draft.aiProcessing.generated.confidence * 100)}%
                    overall confidence
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right column - Editable content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit toggle */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setEditing(!editing)}
              disabled={
                draft.status === "approved" || draft.status === "rejected"
              }
            >
              {editing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Fields
                </>
              )}
            </Button>
          </div>

          {/* Multilingual titles */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Product Titles</h2>
            <div className="space-y-4">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div key={lang.code}>
                  <label className="text-sm font-medium mb-1 block">
                    {lang.name}
                  </label>
                  <Input
                    value={editedTitles[lang.code] || ""}
                    onChange={(e) =>
                      setEditedTitles({
                        ...editedTitles,
                        [lang.code]: e.target.value,
                      })
                    }
                    disabled={!editing}
                    placeholder={`Title in ${lang.name}`}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Multilingual descriptions */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Product Descriptions</h2>
            <div className="space-y-4">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div key={lang.code}>
                  <label className="text-sm font-medium mb-1 block">
                    {lang.name}
                  </label>
                  <textarea
                    value={editedDescriptions[lang.code] || ""}
                    onChange={(e) =>
                      setEditedDescriptions({
                        ...editedDescriptions,
                        [lang.code]: e.target.value,
                      })
                    }
                    disabled={!editing}
                    placeholder={`Description in ${lang.name}`}
                    className="w-full min-h-[100px] p-2 border rounded"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Category, tags, price, stock */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <Input
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  disabled={!editing}
                  placeholder="e.g., Pottery, Textiles, Jewelry"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                      {editing && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button onClick={handleAddTag}>Add</Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(Number(e.target.value))}
                    disabled={!editing}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Stock
                  </label>
                  <Input
                    type="number"
                    value={editedStock}
                    onChange={(e) => setEditedStock(Number(e.target.value))}
                    disabled={!editing}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Action buttons */}
          {draft.status !== "approved" && draft.status !== "rejected" && (
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Review Actions</h2>
              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {submitting ? "Processing..." : "Approve & Publish"}
                </Button>
                <Button
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  disabled={submitting}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>

              {showRejectForm && (
                <div className="mt-4">
                  <label className="text-sm font-medium mb-1 block">
                    Rejection Feedback (required)
                  </label>
                  <textarea
                    value={rejectFeedback}
                    onChange={(e) => setRejectFeedback(e.target.value)}
                    placeholder="Provide feedback to the artisan..."
                    className="w-full min-h-[100px] p-2 border rounded mb-2"
                  />
                  <Button
                    onClick={handleReject}
                    disabled={submitting || !rejectFeedback.trim()}
                    variant="destructive"
                    className="w-full"
                  >
                    {submitting ? "Processing..." : "Confirm Rejection"}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Show admin review if exists */}
          {draft.adminReview && (
            <Card className="p-6 bg-gray-50">
              <h2 className="font-semibold text-lg mb-4">Admin Review</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Reviewed by</p>
                  <p className="font-medium">
                    {draft.adminReview.reviewerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Action</p>
                  <Badge
                    className={
                      draft.adminReview.action === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {draft.adminReview.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {formatDate(draft.adminReview.reviewedAt)}
                  </p>
                </div>
                {draft.adminReview.feedback && (
                  <div>
                    <p className="text-sm text-gray-500">Feedback</p>
                    <p className="font-medium">{draft.adminReview.feedback}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

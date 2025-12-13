"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Video,
  MessageSquare,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { createProductDraft } from "@/lib/firebase/product-drafts";
import { processDraft } from "@/lib/whatsapp/draft-processor";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

interface UploadedFile {
  file: File;
  preview: string;
  type: "image" | "audio" | "video";
}

type ProcessingStep =
  | "idle"
  | "uploading"
  | "transcribing"
  | "translating"
  | "generating"
  | "complete"
  | "error";

export default function WhatsAppSimulatorPage() {
  const router = useRouter();

  // File uploads
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [audio, setAudio] = useState<UploadedFile | null>(null);
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [textMessage, setTextMessage] = useState("");

  // Seller info
  const [sellerName, setSellerName] = useState("Demo Artisan");
  const [sellerPhone, setSellerPhone] = useState("+91 98765 43210");

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdDraftId, setCreatedDraftId] = useState<string | null>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: "image" as const,
    }));

    setImages([...images, ...newImages]);
  };

  // Handle audio upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudio({
      file,
      preview: URL.createObjectURL(file),
      type: "audio",
    });
  };

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideo({
      file,
      preview: URL.createObjectURL(file),
      type: "video",
    });
  };

  // Remove file
  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const removeAudio = () => {
    if (audio) {
      URL.revokeObjectURL(audio.preview);
      setAudio(null);
    }
  };

  const removeVideo = () => {
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
  };

  // Simulate processing with progress
  const simulateStep = async (step: ProcessingStep, duration: number) => {
    setCurrentStep(step);
    const startProgress = progress;
    const progressMap: Record<ProcessingStep, number> = {
      idle: 0,
      uploading: 20,
      transcribing: 40,
      translating: 60,
      generating: 80,
      complete: 100,
      error: progress,
    };
    const endProgress = progressMap[step] || progress;

    const steps = 20;
    const increment = (endProgress - startProgress) / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, duration / steps));
      setProgress(startProgress + increment * (i + 1));
    }
  };

  // Process submission
  const handleSubmit = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    if (!audio && !video && !textMessage.trim()) {
      alert("Please provide audio, video, or text description");
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setProgress(0);
      setCreatedDraftId(null);

      // Step 1: Upload media
      await simulateStep("uploading", 2000);

      const imageUrls: string[] = [];
      for (const img of images) {
        const url = await uploadImageToCloudinary(img.file, "whatsapp-drafts");
        imageUrls.push(url);
      }

      let audioUrl: string | undefined;
      if (audio) {
        audioUrl = await uploadImageToCloudinary(audio.file, "whatsapp-drafts");
      }

      let videoUrl: string | undefined;
      if (video) {
        videoUrl = await uploadImageToCloudinary(video.file, "whatsapp-drafts");
      }

      // Create draft with required fields
      const draftId = await createProductDraft({
        sellerId: "demo-seller-id",
        sellerPhone,
        sellerName,
        status: "pending",
        originalMedia: {
          images: imageUrls,
          audio: audioUrl,
          video: videoUrl,
          textMessages: textMessage.trim() ? [textMessage] : [],
        },
        aiProcessing: {
          transcription: {
            text: "",
            detectedLanguage: "en",
            confidence: 0,
          },
          translations: {},
          generated: {
            category: "",
            tags: [],
            materials: [],
            techniques: [],
            confidence: 0,
          },
        },
      });

      setCreatedDraftId(draftId);

      // Step 2: Transcribe
      await simulateStep("transcribing", 2500);

      // Step 3: Translate
      await simulateStep("translating", 2000);

      // Step 4: Generate product data
      await simulateStep("generating", 2500);

      // Process the draft (this will run the actual AI pipeline)
      await processDraft(draftId);

      // Complete
      await simulateStep("complete", 500);
    } catch (err: any) {
      console.error("Error processing submission:", err);
      setError(err.message || "Failed to process submission");
      setCurrentStep("error");
    } finally {
      setProcessing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    if (audio) URL.revokeObjectURL(audio.preview);
    if (video) URL.revokeObjectURL(video.preview);

    setImages([]);
    setAudio(null);
    setVideo(null);
    setTextMessage("");
    setCurrentStep("idle");
    setProgress(0);
    setError(null);
    setCreatedDraftId(null);
  };

  const getStepMessage = () => {
    switch (currentStep) {
      case "idle":
        return "Ready to process";
      case "uploading":
        return "Uploading media files...";
      case "transcribing":
        return "Transcribing audio/video...";
      case "translating":
        return "Translating to all languages...";
      case "generating":
        return "Generating product details...";
      case "complete":
        return "Processing complete!";
      case "error":
        return "Error occurred";
      default:
        return "Ready to process";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Simulator</h1>
        <p className="text-gray-600">
          Test the WhatsApp product submission flow without a real WhatsApp
          connection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <div className="space-y-6">
          {/* Seller Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Artisan Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Artisan Name
                </label>
                <Input
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Enter artisan name"
                  disabled={processing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  disabled={processing}
                />
              </div>
            </div>
          </Card>

          {/* Image Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Product Images (1-3)</h2>

            {images.length < 3 && (
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {images.length}/3 uploaded
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={processing}
                />
              </label>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={processing}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Audio Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Description</h2>

            {!audio ? (
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Mic className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload audio file</p>
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  disabled={processing}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Mic className="w-6 h-6 text-blue-500" />
                  <span className="text-sm">{audio.file.name}</span>
                </div>
                <button
                  onClick={removeAudio}
                  className="text-red-500 hover:text-red-600"
                  disabled={processing}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </Card>

          {/* Video Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Video Description</h2>

            {!video ? (
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Video className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload video file</p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={processing}
                />
              </label>
            ) : (
              <div className="space-y-3">
                <video
                  src={video.preview}
                  controls
                  className="w-full rounded"
                />
                <button
                  onClick={removeVideo}
                  className="w-full py-2 text-red-500 hover:text-red-600 text-sm"
                  disabled={processing}
                >
                  Remove Video
                </button>
              </div>
            )}
          </Card>

          {/* Text Message */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Text Description</h2>
            <textarea
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              placeholder="Enter product description..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={processing}
            />
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={processing || images.length === 0}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Simulate WhatsApp Submission
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              disabled={processing}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Right: Processing Status */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Processing Status</h2>

            {currentStep === "idle" && (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                <p>Ready to simulate WhatsApp submission</p>
              </div>
            )}

            {currentStep !== "idle" && currentStep !== "error" && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {getStepMessage()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="space-y-3">
                  <ProcessingStepItem
                    label="Uploading Media"
                    status={
                      currentStep === "uploading"
                        ? "active"
                        : progress > 20
                        ? "complete"
                        : "pending"
                    }
                  />
                  <ProcessingStepItem
                    label="Transcribing Audio/Video"
                    status={
                      currentStep === "transcribing"
                        ? "active"
                        : progress > 40
                        ? "complete"
                        : "pending"
                    }
                  />
                  <ProcessingStepItem
                    label="Translating Content"
                    status={
                      currentStep === "translating"
                        ? "active"
                        : progress > 60
                        ? "complete"
                        : "pending"
                    }
                  />
                  <ProcessingStepItem
                    label="Generating Product Data"
                    status={
                      currentStep === "generating"
                        ? "active"
                        : progress > 80
                        ? "complete"
                        : "pending"
                    }
                  />
                </div>

                {/* Complete State */}
                {currentStep === "complete" && createdDraftId && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-green-900">
                        Processing Complete!
                      </span>
                    </div>
                    <p className="text-sm text-green-800 mb-4">
                      Product draft has been created and is ready for review.
                    </p>
                    <Button
                      onClick={() =>
                        router.push(`/product-drafts/${createdDraftId}`)
                      }
                      className="w-full"
                    >
                      Review Draft
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep === "error" && error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-2 text-blue-900">
              About This Simulator
            </h3>
            <p className="text-sm text-blue-800">
              This simulator mimics the WhatsApp product submission flow. It
              uses mock AI services to transcribe, translate, and generate
              product details. In production, this would connect to real
              WhatsApp Business API and AI services.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ProcessingStepItemProps {
  label: string;
  status: "pending" | "active" | "complete";
}

function ProcessingStepItem({ label, status }: ProcessingStepItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
        w-8 h-8 rounded-full flex items-center justify-center
        ${status === "complete" ? "bg-green-500" : ""}
        ${status === "active" ? "bg-blue-500" : ""}
        ${status === "pending" ? "bg-gray-200" : ""}
      `}
      >
        {status === "complete" && (
          <CheckCircle className="w-5 h-5 text-white" />
        )}
        {status === "active" && (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        )}
        {status === "pending" && (
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
        )}
      </div>
      <span
        className={`
        text-sm
        ${status === "complete" ? "text-green-700 font-medium" : ""}
        ${status === "active" ? "text-blue-700 font-medium" : ""}
        ${status === "pending" ? "text-gray-500" : ""}
      `}
      >
        {label}
      </span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Product, ProductDraft } from "@/types";
import { LanguageCode } from "@/lib/i18n/config";
import { ProductLanguageSelector } from "@/components/product/product-language-selector";
import { MultilingualContent } from "@/components/product/multilingual-content";
import { VideoPlayerWithSubtitles } from "@/components/product/video-player-with-subtitles";
import { AudioPlayerWithCaptions } from "@/components/product/audio-player-with-captions";
import { Card, CardContent } from "@/components/ui/card";

interface MultilingualProductPageProps {
  product: Product;
  productDraft?: ProductDraft; // If product was created from WhatsApp
}

/**
 * Enhanced product page with multilingual support
 * This component demonstrates the integration of all multilingual features
 */
export function MultilingualProductPage({
  product,
  productDraft,
}: MultilingualProductPageProps) {
  const searchParams = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");

  // Initialize language from URL param or localStorage
  useEffect(() => {
    const urlLang = searchParams.get("lang") as LanguageCode;
    const savedLang = localStorage.getItem("productLanguage") as LanguageCode;

    if (urlLang) {
      setCurrentLanguage(urlLang);
    } else if (savedLang) {
      setCurrentLanguage(savedLang);
    }
  }, [searchParams]);

  // Extract multilingual data from product draft if available
  const multilingualTitle: { [key: string]: string } = productDraft
    ?.aiProcessing?.translations
    ? Object.entries(productDraft.aiProcessing.translations).reduce(
        (acc, [lang, trans]) => {
          acc[lang] = trans.title;
          return acc;
        },
        {} as { [key: string]: string }
      )
    : { en: product.title };

  const multilingualDescription: { [key: string]: string } = productDraft
    ?.aiProcessing?.translations
    ? Object.entries(productDraft.aiProcessing.translations).reduce(
        (acc, [lang, trans]) => {
          acc[lang] = trans.description;
          return acc;
        },
        {} as { [key: string]: string }
      )
    : { en: product.description };

  const originalLanguage =
    productDraft?.aiProcessing?.transcription?.detectedLanguage;

  // Extract media URLs
  const videoUrl = productDraft?.originalMedia?.video;
  const audioUrl = productDraft?.originalMedia?.audio;

  // Mock subtitle tracks (in production, these would be generated from AI)
  const subtitleTracks = videoUrl
    ? [
        {
          language: "en" as LanguageCode,
          url: "/subtitles/product-en.vtt",
          label: "English",
        },
        {
          language: "hi" as LanguageCode,
          url: "/subtitles/product-hi.vtt",
          label: "हिंदी",
        },
      ]
    : [];

  // Mock audio captions (in production, these would be synced from transcription)
  const audioCaptions = audioUrl
    ? [
        {
          language: "en" as LanguageCode,
          segments: [
            {
              start: 0,
              end: 5,
              text: "This is a handcrafted pottery piece...",
            },
            { start: 5, end: 10, text: "Made with traditional techniques..." },
          ],
        },
        {
          language: "hi" as LanguageCode,
          segments: [
            {
              start: 0,
              end: 5,
              text: "यह एक हस्तनिर्मित मिट्टी का बर्तन है...",
            },
            { start: 5, end: 10, text: "पारंपरिक तकनीकों से बनाया गया..." },
          ],
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Language Selector */}
      <div className="flex justify-end">
        <ProductLanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      </div>

      {/* Product Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-soft-lg">
            <Image
              src={product.images[0] || "/placeholder-product.png"}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Multilingual Content */}
        <div className="space-y-6">
          <MultilingualContent
            title={multilingualTitle}
            description={multilingualDescription}
            currentLanguage={currentLanguage}
            originalLanguage={originalLanguage}
          />

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-muted-foreground">
              {product.stock} in stock
            </span>
          </div>
        </div>
      </div>

      {/* Video Player with Subtitles */}
      {videoUrl && (
        <Card className="rounded-2xl shadow-soft-lg overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Product Video</h3>
            <VideoPlayerWithSubtitles
              videoUrl={videoUrl}
              subtitles={subtitleTracks}
              currentLanguage={currentLanguage}
              originalLanguage={originalLanguage}
            />
          </CardContent>
        </Card>
      )}

      {/* Audio Player with Captions */}
      {audioUrl && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Artisan Description</h3>
          <AudioPlayerWithCaptions
            audioUrl={audioUrl}
            captions={audioCaptions}
            currentLanguage={currentLanguage}
            originalLanguage={originalLanguage}
          />
        </div>
      )}
    </div>
  );
}

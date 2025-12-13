"use client";

import { useState, useEffect } from "react";
import { LanguageCode } from "@/lib/i18n/config";
import { Badge } from "@/components/ui/badge";

interface MultilingualContentProps {
  title: { [key: string]: string };
  description: { [key: string]: string };
  currentLanguage: LanguageCode;
  originalLanguage?: string;
  className?: string;
}

export function MultilingualContent({
  title,
  description,
  currentLanguage,
  originalLanguage,
  className = "",
}: MultilingualContentProps) {
  const [displayTitle, setDisplayTitle] = useState("");
  const [displayDescription, setDisplayDescription] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Trigger smooth transition
    setIsTransitioning(true);

    // Small delay for fade effect
    const timer = setTimeout(() => {
      // Get content for current language, fallback to English
      const newTitle =
        title[currentLanguage] || title["en"] || Object.values(title)[0] || "";
      const newDescription =
        description[currentLanguage] ||
        description["en"] ||
        Object.values(description)[0] ||
        "";

      setDisplayTitle(newTitle);
      setDisplayDescription(newDescription);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentLanguage, title, description]);

  // Update meta tags for SEO
  useEffect(() => {
    if (typeof window !== "undefined" && displayTitle) {
      document.title = `${displayTitle} - HandcraftedHub`;

      // Update meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          displayDescription.substring(0, 160)
        );
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = displayDescription.substring(0, 160);
        document.head.appendChild(meta);
      }

      // Update Open Graph tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", displayTitle);
      } else {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        ogTitle.setAttribute("content", displayTitle);
        document.head.appendChild(ogTitle);
      }

      let ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (ogDescription) {
        ogDescription.setAttribute(
          "content",
          displayDescription.substring(0, 160)
        );
      } else {
        ogDescription = document.createElement("meta");
        ogDescription.setAttribute("property", "og:description");
        ogDescription.setAttribute(
          "content",
          displayDescription.substring(0, 160)
        );
        document.head.appendChild(ogDescription);
      }
    }
  }, [displayTitle, displayDescription]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Original Language Badge */}
      {originalLanguage && originalLanguage !== currentLanguage && (
        <Badge variant="outline" className="text-xs">
          Originally in {originalLanguage}
        </Badge>
      )}

      {/* Title with smooth transition */}
      <h1
        className={`text-4xl font-bold transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {displayTitle}
      </h1>

      {/* Description with smooth transition */}
      <div
        className={`prose prose-sm max-w-none transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-muted-foreground whitespace-pre-wrap">
          {displayDescription}
        </p>
      </div>
    </div>
  );
}

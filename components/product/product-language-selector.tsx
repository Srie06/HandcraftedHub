"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n/config";
import { Globe } from "lucide-react";

interface ProductLanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  className?: string;
}

export function ProductLanguageSelector({
  currentLanguage,
  onLanguageChange,
  className = "",
}: ProductLanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Persist language selection in localStorage
  useEffect(() => {
    if (currentLanguage) {
      localStorage.setItem("productLanguage", currentLanguage);
    }
  }, [currentLanguage]);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "productLanguage"
    ) as LanguageCode;
    if (
      savedLanguage &&
      savedLanguage !== currentLanguage &&
      SUPPORTED_LANGUAGES[savedLanguage]
    ) {
      onLanguageChange(savedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (language: string) => {
    const langCode = language as LanguageCode;

    // Update parent component state
    onLanguageChange(langCode);

    // Update URL with language param
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", langCode);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[180px] rounded-xl shadow-soft">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, { nativeName }]) => (
            <SelectItem key={code} value={code}>
              {nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

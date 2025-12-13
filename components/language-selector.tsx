"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { currentLanguage, changeLanguage, t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentLanguage}
        onValueChange={(value) => changeLanguage(value as LanguageCode)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("languages.selectLanguage")} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <SelectItem key={code} value={code}>
              {lang.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

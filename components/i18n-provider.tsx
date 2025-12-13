"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/config";
import { useEffect, useState } from "react";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Ensure i18n is initialized
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      i18n.on("initialized", () => {
        setIsInitialized(true);
      });
    }
  }, []);

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

# Multilingual Infrastructure

This directory contains the i18n (internationalization) setup for HandcraftedHub's WhatsApp Seller Integration feature.

## Supported Languages

The platform supports 10 Indian languages plus English:

- English (en)
- Hindi (hi) - हिंदी
- Tamil (ta) - தமிழ்
- Telugu (te) - తెలుగు
- Bengali (bn) - বাংলা
- Marathi (mr) - मराठी
- Gujarati (gu) - ગુજરાતી
- Kannada (kn) - ಕನ್ನಡ
- Malayalam (ml) - മലയാളം
- Punjabi (pa) - ਪੰਜਾਬੀ

## Structure

```
lib/i18n/
├── config.ts              # i18next configuration
├── use-translation.ts     # Custom React hook for translations
├── index.ts              # Exports
└── locales/              # Translation files
    ├── en.json
    ├── hi.json
    ├── ta.json
    ├── te.json
    ├── bn.json
    ├── mr.json
    ├── gu.json
    ├── kn.json
    ├── ml.json
    └── pa.json
```

## Usage

### In React Components

```tsx
import { useTranslation } from "@/lib/i18n";

function MyComponent() {
  const { t, changeLanguage, currentLanguage } = useTranslation();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <button onClick={() => changeLanguage("hi")}>Switch to Hindi</button>
    </div>
  );
}
```

### Language Selector Component

```tsx
import { LanguageSelector } from "@/components/language-selector";

function Header() {
  return (
    <header>
      <LanguageSelector />
    </header>
  );
}
```

## Adding New Translations

1. Add the key-value pair to `locales/en.json` (base language)
2. Add translations to all other language files
3. Use the translation key in your component: `t('your.new.key')`

## Language Detection

The system automatically detects the user's preferred language using:

1. Previously selected language (stored in localStorage)
2. Browser language settings
3. Falls back to English if detection fails

## Translation Keys Structure

- `common.*` - Common UI elements (buttons, labels)
- `nav.*` - Navigation items
- `product.*` - Product-related content
- `whatsapp.*` - WhatsApp integration features
- `admin.*` - Admin panel content
- `languages.*` - Language names
- `orders.*` - Order-related content
- `seller.*` - Seller dashboard content

## Requirements Validation

This implementation satisfies:

- **Requirement 8.1**: Support for all 10 Indian languages
- **Requirement 8.3**: UI elements in user's selected language

# Multilingual Product Components

This directory contains components for displaying product information in multiple languages.

## Components

### ProductLanguageSelector

Language dropdown with all 10 supported Indian languages plus English.

### MultilingualContent

Displays product title and description with smooth language transitions.

### VideoPlayerWithSubtitles

Custom video player with subtitle support and language switching.

### AudioPlayerWithCaptions

Custom audio player with synchronized caption display.

## Quick Start

```tsx
import {
  ProductLanguageSelector,
  MultilingualContent,
  VideoPlayerWithSubtitles,
  AudioPlayerWithCaptions
} from "@/components/product";

// In your component
const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");

<ProductLanguageSelector
  currentLanguage={currentLanguage}
  onLanguageChange={setCurrentLanguage}
/>

<MultilingualContent
  title={{ en: "Title", hi: "शीर्षक" }}
  description={{ en: "Description", hi: "विवरण" }}
  currentLanguage={currentLanguage}
/>
```

## Full Documentation

See [MULTILINGUAL_PRODUCT_DISPLAY.md](../../docs/MULTILINGUAL_PRODUCT_DISPLAY.md) for complete documentation.

## Requirements Validated

This implementation validates the following requirements from the WhatsApp Seller Integration spec:

- **Requirement 4.1**: Language selector with available languages ✓
- **Requirement 4.2**: Dynamic content switching by language ✓
- **Requirement 4.3**: Video display with subtitles ✓
- **Requirement 4.4**: Audio with captions ✓
- **Requirement 4.5**: Original language indicator ✓

## Features

- ✅ 10 Indian languages + English support
- ✅ Native language names in dropdown
- ✅ localStorage persistence
- ✅ URL parameter support
- ✅ Smooth transitions
- ✅ SEO meta tag updates
- ✅ Video player with subtitles
- ✅ Audio player with captions
- ✅ Original language badges
- ✅ Responsive design
- ✅ Accessibility support

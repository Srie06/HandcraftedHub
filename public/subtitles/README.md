# Video Subtitles

This directory contains WebVTT (`.vtt`) subtitle files for product videos.

## Format

Subtitle files follow the WebVTT format:

```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
First subtitle text

00:00:05.000 --> 00:00:10.000
Second subtitle text
```

## File Naming Convention

Subtitle files should be named: `{product-id}-{language-code}.vtt`

Examples:

- `product-en.vtt` - English subtitles
- `product-hi.vtt` - Hindi subtitles
- `product-ta.vtt` - Tamil subtitles

## Supported Languages

The system supports subtitles in all 10 Indian languages:

- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Bengali (bn)
- Marathi (mr)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)

## Usage

Subtitles are automatically loaded by the `VideoPlayerWithSubtitles` component when provided in the `subtitles` prop:

```tsx
<VideoPlayerWithSubtitles
  videoUrl="/videos/product.mp4"
  subtitles={[
    {
      language: "en",
      url: "/subtitles/product-en.vtt",
      label: "English",
    },
    {
      language: "hi",
      url: "/subtitles/product-hi.vtt",
      label: "हिंदी",
    },
  ]}
  currentLanguage={currentLanguage}
  originalLanguage="hi"
/>
```

## AI Generation

In production, these subtitle files will be automatically generated from:

1. Audio transcription (original language)
2. Translation to all supported languages
3. Timestamp synchronization with video

For now, sample files are provided for demonstration purposes.

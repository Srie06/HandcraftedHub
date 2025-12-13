# Public Assets Folder

This folder contains static assets that are served directly by Next.js.

## Images

### HANDCRAFTED HUB.png

**Location:** `/public/HANDCRAFTED HUB.png`

This is the hero background image for the landing page.

**Requirements:**

- Format: PNG
- Filename: HANDCRAFTED HUB.png (with spaces and uppercase)
- Recommended size: 1920x1080 or larger
- Aspect ratio: 16:9 or wider
- File size: Optimized for web (< 1MB recommended)
- Opacity: Displayed at 60% opacity for visible background effect

**Usage:**
The image is used as a background in the hero section of the landing page (`app/page.tsx`).
The code uses URL encoding (%20) to handle spaces in the filename.

## How to Add Images

1. Place your image files directly in the `/public` folder
2. Reference them in your code using `/filename.ext` (e.g., `/handcraftedhub.jpg`)
3. Next.js will serve them from the root URL

## Example

```tsx
// In your component
<img src="/HANDCRAFTED%20HUB.png" alt="HandcraftedHub" />

// Or as a background (with URL encoding for spaces)
<div style={{ backgroundImage: "url('/HANDCRAFTED%20HUB.png')" }} />
```

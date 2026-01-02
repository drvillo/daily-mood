# PWA Icon Generation Guide

Your PWA needs icons at `public/icons/icon-192x192.png` and `public/icons/icon-512x512.png`.

## Option 1: Using Online Tools (Easiest)

1. **Create or find an icon image** (square, at least 512x512px)
   - Use a mood-related emoji (😊, 😌, 😕, 😢) or create a simple design
   - Or use a mood tracker icon from a free icon site

2. **Generate PWA icons** using one of these tools:
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

3. **Download and place icons**:
   - Save `icon-192x192.png` to `public/icons/`
   - Save `icon-512x512.png` to `public/icons/`

## Option 2: Using ImageMagick (Command Line)

If you have a source image `icon-source.png`:

```bash
# Create icons directory if it doesn't exist
mkdir -p public/icons

# Generate 192x192 icon
convert icon-source.png -resize 192x192 public/icons/icon-192x192.png

# Generate 512x512 icon
convert icon-source.png -resize 512x512 public/icons/icon-512x512.png
```

## Option 3: Quick Placeholder Icons (For Testing)

You can create simple colored square icons using ImageMagick:

```bash
mkdir -p public/icons

# Create a simple blue square for 192x192
convert -size 192x192 xc:"#3b82f6" public/icons/icon-192x192.png

# Create a simple blue square for 512x512
convert -size 512x512 xc:"#3b82f6" public/icons/icon-512x512.png
```

## Icon Requirements

- **Format**: PNG
- **Sizes**: 192x192px and 512x512px (required)
- **Purpose**: Should work as both "any" and "maskable" icons
- **Design**: 
  - Keep important content in the center 80% (safe zone for maskable icons)
  - Use high contrast colors
  - Simple, recognizable design

## Recommended Icon Design

For a mood tracker app, consider:
- A calendar grid with a smiley face
- A simple mood emoji (😊)
- A minimalist calendar icon
- A colorful gradient circle


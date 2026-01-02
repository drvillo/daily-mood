# Yearly Mood Tracker

A simple, visual mood tracking web app with a yearly grid view. Built with React, Vite, and TypeScript.

## Features

- **Quick Mood Logging**: Select your mood for today with one click
- **Yearly Grid View**: See your entire year at a glance with color-coded days
- **Smart View Switching**: Automatically shows log mode when today isn't logged, reflect mode when it is
- **Light/Dark Theme**: Toggle between themes with persistent preference
- **Data Export/Import**: Export your data as JSON for backup or import to restore
- **PWA Support**: Installable as a Progressive Web App, works offline
- **Keyboard Shortcuts**: Use number keys 1-5 to quickly select moods
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory, ready for static hosting.

## Usage

1. **Logging Mood**: When you first open the app (or if today isn't logged), you'll see large mood buttons. Click one or press 1-5 on your keyboard to log your mood.

2. **Viewing Year**: After logging, you'll automatically see the yearly grid view. Each day is color-coded by mood.

3. **Editing Past Days**: Click any day in the grid to edit its mood.

4. **Export/Import**: Use the header buttons to export your data as JSON or import previously exported data.

5. **Theme Toggle**: Click the sun/moon icon in the header to switch between light and dark themes.

## Mood Levels

1. Very Low - Dark purple/navy
2. Awful / Terrible - Red/deep orange
3. Meh / Bad - Orange/amber
4. Normal / Okay - Soft yellow/warm beige
5. Great / Fantastic - Bright teal/cyan

## Technical Details

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router with HashRouter (for static hosting)
- **Animations**: Framer Motion
- **Storage**: localStorage (browser-only, no backend)
- **PWA**: vite-plugin-pwa with Workbox
- **Styling**: CSS Modules with CSS custom properties
- **Color System**: LCH color space for perceptual uniformity

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── styles/         # Global styles and themes
```

## Deployment

This app can be deployed to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static file host

Just build the project and upload the `dist` folder contents.

## License

MIT


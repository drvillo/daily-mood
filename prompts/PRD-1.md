Great sketch — it’s very clear what you’re aiming for. Below is a **clear, lightweight Product Requirements Document (PRD)** tailored to a **simple, personal mood-tracking web app**, inspired directly by your grid-based yearly view.

I’ve kept it **intentionally minimal and buildable**, while leaving room to evolve later.

---

# Product Requirements Document (PRD)

**Product Name (working):** Yearly Mood Tracker
**Version:** v1.0
**Author:** Francesco
**Date:** Jan 2026

---

## 1. Purpose & Vision

### 1.1 Problem

Tracking mood consistently is hard. Most tools are either:

* Too complex (journals, long forms)
* Too abstract (scores without visual meaning)
* Too fragmented (daily view only, no yearly pattern)

### 1.2 Solution

A **simple, visual, low-friction web app** that lets users:

* Log **one mood per day**
* See the **entire year at a glance**
* Recognize patterns without overthinking

The app should feel:

* Calm
* Non-judgmental
* Fast to use (≤5 seconds per day)

---

## 2. Target User

### 2.1 Primary User

* Individual tracking their own mood (initially: single-user, personal use)
* Values self-awareness over analytics
* Comfortable with simple, manual input

### 2.2 User Mindset

* “I want to notice patterns, not optimize myself”
* “I don’t want to write every day”
* “Missing days is okay”

---

## 3. Core User Stories

### Must-have (v1)

1. **As a user**, I want the app to show me a focused mood selection when today isn't logged yet
2. **As a user**, I want to see the yearly grid view when today is already logged
3. **As a user**, I want to select today's mood with one tap/click
4. **As a user**, I want to see all days of the year in a single grid
5. **As a user**, I want each day color-coded by mood
6. **As a user**, I want to change any day's mood later if needed
7. **As a user**, I want my data saved automatically
8. **As a user**, I want to export my data as JSON for backup
9. **As a user**, I want smooth, delightful transitions between views

### Nice-to-have (v1.1+)

* View simple counts per mood
* See streaks or gaps (visually, not numerically)
* Switch between years
* Import data from JSON file

---

## 4. Mood Model

### 4.1 Mood Levels

| Mood | Label             | Color Philosophy                | Color Examples (LCH recommended) |
| ---- | ----------------- | ------------------------------- | -------------------------------- |
| 5    | Great / Fantastic | Vibrant, positive, energizing   | Bright green, teal, or cyan      |
| 4    | Normal / Okay     | Neutral, balanced, calm          | Soft yellow, warm beige, or light blue |
| 3    | Meh / Bad         | Muted, acknowledging difficulty | Orange, amber, or muted yellow   |
| 2    | Awful / Terrible  | Strong, validating struggle     | Red, deep orange, or coral       |
| 1    | Very Low          | Dark, respectful of depth       | Dark gray, deep purple, or navy  |

### 4.2 Color Design Principles

**Perceptual Balance:**
* Use LCH color space for better perceptual uniformity
* Ensure colors are distinguishable in both light and dark themes
* Maintain sufficient contrast for accessibility (WCAG AA)

**Emotional Resonance:**
* Colors should feel intuitive and non-judgmental
* Avoid overly bright or harsh colors that might feel dismissive
* Dark/low moods use respectful, dignified colors (not "bad" colors)

**Visual Language:**
* Colors are the primary language - no emojis, no numbers shown by default
* Labels visible only on hover / legend
* Color gradients should feel smooth and natural across the scale
* Each color should be distinct enough to recognize patterns at a glance

---

## 5. Functional Requirements

### 5.1 Dynamic Entry Flow (Smart View Switching)

**Primary Behavior:**
* On app load, check if today's mood is logged
* **If today is NOT logged**: Show **"Log Mode"** (focused mood selection)
* **If today IS logged**: Show **"Reflect Mode"** (yearly grid view)

**Manual Toggle:**
* Always provide a toggle button/link to switch between modes
* "Log Today" button visible in Reflect Mode
* "View Year" button visible in Log Mode
* Smooth transition between views (see Micro-interactions)

**User Intent Recognition:**
* Log Mode: Centered on quick daily entry
* Reflect Mode: Centered on pattern recognition and reflection

### 5.2 Daily Mood Input (Log Mode)

* Large, prominent mood selection buttons
* User selects mood via:

  * Color buttons (primary method)
  * Or clicking directly on today's cell in grid (if visible)
* One action = one save
* Overwrites previous value for that day
* After selection, automatically transitions to Reflect Mode

---

### 5.3 Yearly Grid View (Reflect Mode)

**Layout**

* Columns = months (Jan → Dec)
* Rows = days (1 → 31)
* Each cell = one day
* Empty days (e.g. Feb 30) are disabled or hidden
* Today's cell visually highlighted (border, glow, or subtle animation)

**Behavior**

* Colored square if mood exists
* Empty square if no data (subtle gray outline)
* Click any day to edit its mood (opens quick selector)
* Hover shows:

  * Date
  * Mood label
  * Optional: Count of days with same mood

---

### 5.4 Legend

* Simple legend on the side or bottom
* Shows:

  * Color
  * Mood label
* Optional count per mood (can be hidden by default)
* Always visible but unobtrusive

### 5.5 Engagement Features

**Visual Progress Indicators:**
* Subtle "Year Progress" indicator (e.g., "Day 45 of 366" or percentage)
* Current streak counter (non-punitive, celebrates consistency without shaming gaps)
* Optional: Visual pattern highlights (e.g., "You've logged 30 days this month")

**Micro-interactions:**
* Smooth transitions between Log and Reflect modes (fade/slide animations)
* Mood button hover effects (subtle scale or glow)
* Grid cell hover states (slight elevation or color shift)
* Success feedback when mood is saved (brief, non-intrusive animation)
* Use `framer-motion` or CSS transitions for smooth, delightful interactions

**Color Themes:**
* Light theme (default)
* Dark theme (user preference, stored in localStorage)
* Theme toggle in settings or header
* Colors adapt appropriately to theme (maintain contrast and mood meaning)

---

### 5.6 Data Persistence

* Mood data saved automatically to localStorage
* No "save" button
* Data persists across sessions
* Instant save feedback (visual confirmation)

### 5.7 Data Portability

**Export Functionality:**
* User can export all mood data as JSON file
* Export button in settings or header (non-intrusive)
* File format: `mood-data-YYYY-MM-DD.json`
* Includes all mood entries and metadata (version, export date)

**Import Functionality:**
* User can import JSON file to restore data
* Import button triggers file picker
* Validates file format before import
* Option to merge or replace existing data
* Confirmation dialog before overwriting

**Data Ownership:**
* User owns their data completely
* No cloud sync required
* Export/import enables backup and migration
* Privacy-first: data never leaves user's device unless explicitly exported

---

## 6. Non-Functional Requirements

### 6.0 Design Philosophy

**Visual Design:**
* **Clean but engaging**: Minimalist interface that feels inviting, not sterile
* **Delightful**: Subtle animations and interactions that bring joy without distraction
* **User-centered**: Every element serves the user's intent (logging vs. reflecting)
* **Non-judgmental**: Visual language that supports without pressure or guilt
* **Modern**: Contemporary design patterns that feel fresh and approachable

**User Experience:**
* **Intent-driven**: UI adapts to user's primary need (quick log vs. deep reflection)
* **Delightful interactions**: Micro-animations that feel responsive and polished
* **Inviting return**: Design should make users want to come back daily
* **Fast and fluid**: Every interaction should feel instant and smooth
* **Accessible**: Beautiful design that works for everyone

### 6.1 Simplicity

* No onboarding flow
* No notifications


### 6.2 Performance

* App loads in <1s
* Grid renders instantly

### 6.3 Accessibility

* Sufficient color contrast (WCAG AA minimum)
* Color + label on hover for clarity
* Keyboard navigation (basic)
* Screen reader support for mood selection and grid navigation
* Focus states clearly visible

### 6.4 User Engagement

* **Delightful UI**: Clean, modern design that invites return visits
* **Micro-interactions**: Smooth animations that feel responsive and polished
* **Non-judgmental**: Missing days are visually neutral, not marked as "failed"
* **Inviting**: The app should feel like a gentle companion, not a taskmaster
* **Fast**: Every interaction should feel instant (<100ms perceived latency)

---

## 7. Technical Scope

### 7.1 Frontend Stack

* **React + Vite** (modern, fast, component-based)
* **React Router with HashRouter** (required for static hosting compatibility)
* Responsive but **desktop-first**
* CSS Grid for yearly layout
* **No third-party services** - completely browser-based

### 7.2 Storage

* **LocalStorage only** (single-device, browser-based)
* Data structure:
  ```json
  {
    "moods": {
      "2026-01-15": 5,
      "2026-01-16": 4,
      ...
    },
    "version": "1.0"
  }
  ```
* **Privacy-first**: All data stays in the browser, never sent to any server

### 7.3 Data Portability

* **Export**: User can download all mood data as JSON file
* **Import**: User can upload JSON file to restore data
* Enables data backup and migration between devices/browsers

### 7.4 Progressive Web App (PWA)

* Installable on home screen (mobile and desktop)
* Works offline after first load
* Service worker for offline functionality
* Minimal manifest.json for app-like experience

### 7.5 Deployment

* **Static hosting only** - no server required
* Compatible with AWS S3, Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.
* HashRouter ensures routing works on any static host without server configuration
* Build output is standard static files (HTML, CSS, JS) that can be served from any CDN or static host

---

## 8. Out of Scope (v1)

Explicitly **not included**:

* Journaling / notes
* AI insights
* Mood predictions
* Sharing / social features
* Mental health advice
* Push notifications
* Cloud sync or third-party authentication
* Multi-device sync (use export/import instead)

---

## 9. Success Criteria

The product is successful if:

* Logging a day takes <5 seconds
* User logs mood on ≥70% of days
* The yearly view alone feels “insightful”
* Missing days do not feel like failure

---

## 10. Future Extensions (Optional)

* Monthly or yearly summary view
* Custom mood scales
* Notes per day (collapsed by default)
* Export as image (like your sketch)
* Additional color themes beyond light/dark
* Statistics and insights (non-judgmental, pattern-focused)

---

If you want, next we can:

* Turn this into **wireframes**
* Define a **very small MVP tech stack**
* Write **API / data models**
* Or translate this directly into **GitHub issues / tasks**

Just tell me how far you want to go 👌

# PWA Mobile Testing Guide

## Prerequisites

Before testing, ensure you have:
1. ✅ Generated PWA icons (see `scripts/generate-icons.md`)
2. ✅ Built the production version: `npm run build`
3. ✅ A way to serve the built files (local server or deployed)

## Critical Issues Fixed

- ✅ Added iOS meta tags for better mobile support
- ✅ Fixed `start_url` to `/#/` for HashRouter compatibility
- ✅ Updated theme colors to match app colors
- ⚠️ **Still need**: PWA icons (192x192 and 512x512)

## Testing Checklist

### 1. Desktop Browser Testing (Chrome/Edge)

#### Step 1: Build and Preview
```bash
npm run build
npm run preview
```

#### Step 2: Open Chrome DevTools
1. Open `http://localhost:4173` (or the preview URL)
2. Press `F12` or right-click → Inspect
3. Go to **Application** tab (or **Manifest** in older Chrome)

#### Step 3: Check Manifest
- [ ] Manifest loads without errors
- [ ] Icons are listed and accessible
- [ ] Theme color matches your app
- [ ] Start URL is `/#/`

#### Step 4: Check Service Worker
- [ ] Go to **Application** → **Service Workers**
- [ ] Service worker should be registered and active
- [ ] Status should show "activated and is running"

#### Step 5: Test Install Prompt
- [ ] Look for install icon in address bar (or menu)
- [ ] Click "Install" and verify app installs
- [ ] Open installed app and verify it works offline

#### Step 6: Test Offline Functionality
- [ ] Go to **Network** tab → Check "Offline"
- [ ] Refresh the page
- [ ] App should still work (cached assets)
- [ ] Try logging a mood while offline
- [ ] Go back online and verify data syncs

#### Step 7: Lighthouse Audit
1. Open **Lighthouse** tab in DevTools
2. Select:
   - ✅ Progressive Web App
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
3. Click "Generate report"
4. **Target scores**:
   - PWA: All checks passing ✅
   - Performance: 90+
   - Accessibility: 100
   - Best Practices: 100

### 2. Android Testing (Chrome)

#### Method 1: USB Debugging (Recommended)

1. **Enable USB Debugging on Android**:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect Phone to Computer**:
   ```bash
   # Check if device is connected
   adb devices
   ```

3. **Serve the app**:
   ```bash
   npm run build
   npm run preview -- --host
   # Note the IP address (e.g., http://192.168.1.100:4173)
   ```

4. **Access from Phone**:
   - Open Chrome on Android
   - Navigate to `http://YOUR_COMPUTER_IP:4173`
   - Or use port forwarding:
     ```bash
     adb reverse tcp:4173 tcp:4173
     # Then access http://localhost:4173 on phone
     ```

5. **Test Installation**:
   - Chrome should show "Add to Home Screen" banner
   - Or menu (⋮) → "Install app" / "Add to Home screen"
   - Verify app installs and opens in standalone mode

6. **Test Offline**:
   - Enable Airplane Mode
   - Open the installed app
   - Verify it still works
   - Try logging moods offline

#### Method 2: Deploy to Test Server

1. **Deploy to a test URL** (Netlify, Vercel, GitHub Pages, etc.):
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting service
   ```

2. **Access from Android**:
   - Open Chrome on Android
   - Navigate to your deployed URL
   - Follow installation steps above

### 3. iOS Testing (Safari)

#### Method 1: Local Network Testing

1. **Serve the app**:
   ```bash
   npm run build
   npm run preview -- --host
   # Note the IP address
   ```

2. **Access from iPhone/iPad**:
   - Ensure phone and computer are on same WiFi
   - Open Safari on iOS
   - Navigate to `http://YOUR_COMPUTER_IP:4173`

3. **Add to Home Screen**:
   - Tap Share button (square with arrow)
   - Select "Add to Home Screen"
   - Customize name if needed
   - Tap "Add"

4. **Test Installation**:
   - Open app from home screen
   - Verify it opens in standalone mode (no Safari UI)
   - Check status bar styling

5. **Test Offline**:
   - Enable Airplane Mode
   - Open the installed app
   - Verify it still works

#### Method 2: Deploy to Test Server

1. **Deploy to HTTPS URL** (required for iOS PWA):
   - iOS requires HTTPS for PWAs (except localhost)
   - Deploy to Netlify, Vercel, or similar

2. **Access and install** as above

### 4. Common Issues & Solutions

#### Issue: Icons Not Showing
**Solution**: 
- Verify icons exist at `public/icons/icon-192x192.png` and `public/icons/icon-512x512.png`
- Rebuild: `npm run build`
- Clear browser cache

#### Issue: Install Prompt Not Appearing
**Solution**:
- Check Lighthouse PWA audit for specific issues
- Ensure HTTPS (or localhost)
- Verify manifest is valid
- Check service worker is registered

#### Issue: App Not Working Offline
**Solution**:
- Check service worker is active
- Verify Workbox is caching assets
- Check browser console for errors
- Ensure `registerType: 'autoUpdate'` in vite.config.ts

#### Issue: iOS Status Bar Wrong Color
**Solution**:
- Check `apple-mobile-web-app-status-bar-style` in index.html
- Options: `default`, `black`, `black-translucent`
- Match with your app's theme

#### Issue: HashRouter Not Working After Install
**Solution**:
- Verify `start_url: '/#/'` in manifest
- Test navigation in installed app
- Check that routes work correctly

### 5. Quick Test Script

Create a simple test checklist:

```bash
# 1. Build
npm run build

# 2. Check for errors
npm run preview

# 3. Open in browser and check:
# - Service worker registered
# - Manifest loads
# - Icons visible
# - Install prompt appears
# - Offline mode works
```

### 6. Production Deployment Checklist

Before deploying to production:

- [ ] Icons generated and in `public/icons/`
- [ ] Build succeeds: `npm run build`
- [ ] Lighthouse PWA audit passes
- [ ] Tested on Android Chrome
- [ ] Tested on iOS Safari
- [ ] Offline functionality works
- [ ] Install prompt appears
- [ ] App works in standalone mode
- [ ] Theme colors match app
- [ ] HashRouter navigation works

## Testing URLs

- **Local Preview**: `http://localhost:4173`
- **Network Preview**: `http://YOUR_IP:4173`
- **Deployed**: Your production URL

## Additional Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools PWA Testing](https://developer.chrome.com/docs/devtools/progressive-web-apps/)
- [iOS PWA Guidelines](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)



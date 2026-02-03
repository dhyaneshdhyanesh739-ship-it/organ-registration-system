# 🔧 Troubleshooting Guide - Blank Page Issue

## Issue
Browser shows blank white page at `http://localhost:5173`

## Root Cause
The client dev server is likely not running, or there's a JavaScript error preventing the app from rendering.

## Solution Steps

### 1. Start Client Dev Server
Open a terminal and run:
```cmd
cd e:\kiddo\organ-donor-system\client
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### 2. Check Browser Console
1. Press `F12` to open DevTools
2. Click **Console** tab
3. Look for red error messages

**Common Errors:**
- `Failed to fetch` → Server not running
- `Module not found` → Run `npm install`
- Import errors → Check file paths

### 3. Hard Refresh Browser
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 4. Verify Both Servers Running

**Terminal 1 - Backend:**
```cmd
cd e:\kiddo\organ-donor-system\server
npm run dev
```

**Terminal 2 - Frontend:**
```cmd
cd e:\kiddo\organ-donor-system\client
npm run dev
```

### 5. Check Ports
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Quick Checklist
- [ ] Client dev server running
- [ ] See "VITE ready" in terminal
- [ ] Browser at correct URL (5173, not 5000)
- [ ] No console errors
- [ ] All dependencies installed (`npm install`)

## Next Steps
Once both servers are running:
1. Open `http://localhost:5173`
2. You should see the landing page with gradient hero section
3. Test navigation and features

## Screenshot Reference
![Blank Page Issue](file:///C:/Users/DHYANESH/.gemini/antigravity/brain/5a92779f-61ba-410f-b4dc-e210235dde1e/uploaded_media_1769694441485.png)

The blank page indicates the React app isn't loading. Follow steps above to resolve.

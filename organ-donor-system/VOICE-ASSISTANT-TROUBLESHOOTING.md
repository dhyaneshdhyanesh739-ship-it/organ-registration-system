# Voice Assistant Troubleshooting Guide

## Network Error Fix

The voice assistant "network error" has been resolved with improved error handling and connectivity checks.

## Common Issues and Solutions

### 1. Network Error ❌

**Cause**: The Web Speech API (used by Chrome and Edge) requires an active internet connection because it uses cloud-based speech recognition servers.

**Solutions**:
- ✅ Ensure you have an active internet connection
- ✅ Check if your firewall is blocking the connection
- ✅ Try refreshing the page
- ✅ The app now checks your connection before starting and shows a clear error message

### 2. HTTPS Requirement 🔒

**Cause**: Speech recognition requires a secure context (HTTPS or localhost).

**Solutions**:
- ✅ Use `http://localhost:5173` (already secure for development)
- ✅ For production, ensure your site uses HTTPS
- ❌ Don't use IP addresses like `http://192.168.x.x` (not considered secure)

### 3. Microphone Permissions 🎤

**Cause**: Browser needs permission to access your microphone.

**Solutions**:
- ✅ Click "Allow" when prompted for microphone access
- ✅ Check browser settings if you previously denied access:
  - **Chrome/Edge**: Settings → Privacy and security → Site settings → Microphone
  - **Firefox**: Settings → Privacy & Security → Permissions → Microphone

### 4. Browser Compatibility 🌐

**Supported Browsers**:
- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Safari (limited support)
- ❌ Firefox (limited/no support for Web Speech API)

## How to Use Voice Assistant

1. **Click the microphone button** (bottom-right corner)
2. **Allow microphone access** when prompted
3. **Speak clearly** after the button turns red
4. **Wait for response** - the system will process your command

### Available Commands

- 🏠 "Go to home" / "Home page"
- 📊 "Dashboard" / "Show dashboard"
- 🫀 "Organs" / "Organ info"
- 📝 "Register"
- 🔐 "Login" / "Sign in"
- ❓ "Help" - Shows all available commands

## Technical Details

### What Changed

1. **Enhanced Error Handling**: Now provides specific error messages for different failure scenarios
2. **Network Check**: Proactively checks internet connectivity before starting
3. **Better Recovery**: Improved retry logic for transient failures
4. **Clear Feedback**: User-friendly error messages instead of technical jargon

### Error Types Now Handled

| Error | Message | Solution |
|-------|---------|----------|
| `network` | Network error. Please check your internet connection | Check internet connection |
| `not-allowed` | Microphone access denied | Allow microphone permissions |
| `audio-capture` | No microphone detected | Connect a microphone |
| `service-not-allowed` | Service not available | Use HTTPS or localhost |
| Offline | No internet connection | Connect to internet |

## Still Having Issues?

1. **Check Console**: Open browser DevTools (F12) and check the Console tab for detailed error messages
2. **Test Microphone**: Try using your microphone in another app to ensure it's working
3. **Clear Cache**: Clear browser cache and reload the page
4. **Try Another Browser**: Use Chrome or Edge for best compatibility

## Development Notes

The voice assistant uses:
- **Web Speech API** for speech recognition
- **Speech Synthesis API** for voice responses
- **Navigator.onLine** for connectivity checks

For production deployment, ensure:
- HTTPS is enabled
- Firewall allows connections to Google's speech recognition servers
- Users are informed about microphone permission requirements

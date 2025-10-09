# Quick Start Guide 🚀

## First Time Setup

1. **Install dependencies** (one time only):
   ```powershell
   npm install
   ```

2. **Start the development server**:
   ```powershell
   npm run dev
   ```

3. **Open your browser** to the URL shown (usually `http://localhost:3000`)

## Daily Development

```powershell
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Notifications

1. Click the bell icon (🔔) in the top-right corner
2. Click "Enable Notifications" and allow browser permissions
3. Set your preferred reminder interval (30 min, 1 hr, etc.)
4. Log some water intake to reset the reminder timer
5. Wait for the interval to pass without logging - you'll get a reminder!

## Mobile Testing

### Local Network Testing
1. Find your local IP: `ipconfig` (look for IPv4 Address)
2. Start dev server: `npm run dev -- --host`
3. Open `http://YOUR_IP:3000` on your mobile device
4. Note: Notifications require HTTPS in production

### Production Testing
- Deploy to a hosting service (Vercel, Netlify, etc.)
- HTTPS is automatically enabled
- Notifications will work on mobile devices

## Troubleshooting

**Notifications not working?**
- Check browser permissions (Settings → Site Settings → Notifications)
- Ensure you're on localhost or HTTPS
- Check if Do Not Disturb is enabled on your device

**Build errors?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 18 or higher

**Styling issues?**
- Tailwind directives may show CSS errors in the editor - this is normal
- They compile correctly when running `npm run dev`

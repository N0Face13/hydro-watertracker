## Water Tracker App — AI assistant instructions

This is a complete React app with Vite + Tailwind + push notifications. The main component is at `src/app.jsx`. Data persists via localStorage. Use these notes for targeted, low-risk edits.

What this app does (big picture)
- Single-page React component `WaterTracker` in `src/app.jsx` implements all UI and logic.
- State persistence via **localStorage** (durable across reloads) with backward-compatible `window.hydrationData`.
- **Push notifications** remind users to drink water at configurable intervals (30 min to 2 hrs) using Web Notifications API.
- Daily reset, history, and streak logic live in useEffect hooks. Stored shape: { currentIntake, dailyGoal, streak, lastCompletedDate, lastResetDate, dailyHistory }.
- **Mobile-optimized** with touch-friendly buttons, responsive design, and iOS Safari fixes.

Key files to inspect
- `src/app.jsx` — entire app (UI, logic, notifications, theme). Primary place for fixes and features.
- `Readme.md` — comprehensive feature list and setup instructions.
- `QUICKSTART.md` — development workflow and testing guide.
- `package.json` — dependencies (React 18, Vite, Tailwind, Lucide icons).
- `src/index.css` — global styles with Tailwind directives and mobile fixes.

Conventions & important patterns
- Single-file app: prefer small, focused edits inside `src/app.jsx`. Avoid heavy architectural refactors.
- Data persistence: **localStorage** is primary (durable). window.hydrationData maintained for backward compatibility. When adding keys, update both initializers and persistence effects.
- Date handling: `new Date().toDateString()` for lastResetDate/lastCompletedDate; ISO yyyy-mm-dd keys in dailyHistory.
- Notifications: Web Notifications API with permission checks. Interval-based reminders stop when goal reached or water logged. Settings in modal (bell icon).
- Theme: `isDark` boolean toggles between dark/light themes. All theme keys centralized in theme object (bg, card, text, textMuted, border, accent, wave, button).
- Presets: quick-add uses presets array (Glass 250ml, Bottle 500ml, Large Bottle 1000ml). addWater/removeWater helpers keep logic centralized.
- Mobile: touch-optimized buttons, responsive grids, viewport meta tags, iOS Safari height fixes in CSS.

Build / run / debug notes
- **Run locally**: `npm install` then `npm run dev` (opens `http://localhost:3000`)
- **Build**: `npm run build` creates production bundle in `dist/`
- **Preview**: `npm run preview` serves production build locally
- **Mobile testing**: Use `npm run dev -- --host` and access via local IP on mobile devices
- **Notifications**: Work on localhost (dev) and HTTPS (production). Will not work on HTTP in production.
- **Tailwind**: CSS directives may show editor errors but compile correctly via PostCSS

Change guidance & examples
- Safe bugfix: fix streak logic — update useEffect near lastResetDate/lastCompletedDate comparison.
- Add notification feature: Update notification settings modal, add to reminderInterval options, adjust checkAndNotify logic.
- New preset: Add to presets array in format `{ label: 'Name', amount: 500, icon: '🥤' }`.
- Persist new state: Add to localStorage effect and initialize from localStorage in useState(() => ...).
- Mobile fix: Check `src/index.css` for iOS Safari specific fixes; add new fixes there.

Edge cases discovered
- dailyGoal can be null — many calculations guard on existence. Preserve guards when changing goal logic.
- Date math uses ms-diff floored to days; timezone edge-cases may affect streak across midnight in different zones.
- Notification permission can be 'default', 'granted', or 'denied' — handle all three states in UI.
- lastWaterTime tracks when water was last logged; used to calculate reminder intervals without spamming notifications.
- Mobile Safari has viewport height quirks; `-webkit-fill-available` used in CSS to fix.

When you edit
- Keep changes inside `src/app.jsx` unless adding entirely new features (charts library, backend, etc.).
- Preserve exported default function name `WaterTracker` and component signature.
- Update `Readme.md` for user-facing changes (new features, setup steps).
- Update `.github/copilot-instructions.md` (this file) when architectural patterns change.
- Test on mobile (Chrome DevTools mobile emulation or real device) for UI changes.

Adding new dependencies
- Use `npm install <package>` and update package.json
- Document in Readme.md under "Technology Stack"
- Keep bundle size in mind — this is intentionally a lightweight app

Testing notifications locally
1. Run `npm run dev`
2. Click bell icon (🔔) in header
3. Click "Enable Notifications" and grant browser permission
4. Set interval (30 min default)
5. Log water to reset timer
6. Wait for interval — notification fires when goal not reached

Questions to ask the maintainer (if unclear)
- Should reminders continue after daily goal is reached? (Currently they stop)
- Should notification intervals be more granular (5 min, 15 min options)?
- Should there be sound/vibration options for notifications?
- Deploy target for production? (Vercel/Netlify recommended for auto-HTTPS)

Keep edits concise and mobile-tested — this app prioritizes simplicity and mobile UX.

# Water Tracker App 💧

A beautiful, mobile-friendly React app to track your daily water intake with smart push notifications.

## Features ✨

✅ **Hydration Calculator** - Calculate your personalized daily water goal based on weight, activity level, and climate  
✅ **Track Water Goal** - Set and track your daily hydration goal (e.g., 2 liters)  
✅ **Daily Reset** - Automatically resets your intake at midnight  
✅ **Push Notifications** - Smart reminders at configurable intervals (30 min, 1 hr, 1.5 hrs, 2 hrs)  
✅ **Graphical & Friendly UI** - Beautiful progress circles, weekly charts, and smooth animations  
✅ **Simple Click to Log** - Quick-add presets (Glass, Bottle, Large Bottle) or custom amounts  
✅ **Daily Accomplishment Page** - Celebrate when you reach your goal with a trophy modal  
✅ **Streak Counter** - Track consecutive days of meeting your hydration goal  
✅ **Mobile-Friendly** - Optimized for touch devices with responsive design  
✅ **Dark/Light Mode** - Toggle between themes for comfortable viewing  
✅ **Persistent Storage** - Your data saves automatically using localStorage

## Getting Started 🚀

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "Water Tracker App"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## How to Use 📱

1. **First Time Setup**: Set your daily water goal using the calculator or enter a custom amount
2. **Log Water Intake**: Click preset buttons (Glass, Bottle, Large Bottle) or use +/- for custom amounts
3. **Enable Notifications**: Click the bell icon (🔔) in the header to set up reminders
4. **Track Progress**: Watch your circular progress bar fill up and check your weekly chart
5. **Celebrate Success**: Get a trophy modal when you complete your daily goal!

## Notification Settings 🔔

- **Enable/Disable**: Toggle notifications on/off via the bell icon
- **Reminder Intervals**: Choose 30 min, 1 hour, 1.5 hours, or 2 hours
- **Smart Reminders**: Only notifies when you haven't logged water within your interval
- **Browser Permission**: Grant notification permission when prompted

## Technology Stack 🛠️

- **React 18** - Modern hooks-based component architecture
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Web Notifications API** - Native browser push notifications
- **localStorage** - Client-side data persistence

## Project Structure 📁

```
Water Tracker App/
├── src/
│   ├── app.jsx          # Main app component with all logic
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── public/
│   └── droplet.svg      # App icon
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── README.md            # This file
```

## Mobile Optimization 📱

- Touch-friendly buttons with hover/active states
- Responsive grid layouts that adapt to screen size
- Viewport meta tags for proper mobile rendering
- iOS Safari compatibility fixes
- No accidental zoom on input focus
- Smooth animations optimized for mobile performance

## Browser Support 🌐

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (iOS 13+, macOS)
- Mobile browsers (iOS Safari, Chrome Android)

**Note**: Push notifications require HTTPS in production (works on localhost for development).

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License - feel free to use this project for personal or commercial purposes.
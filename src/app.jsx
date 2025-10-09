import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Minus, Trophy, Calendar, Zap, Calculator, X, Check } from 'lucide-react';

export default function WaterTracker() {
  // Initialize from localStorage for persistence across sessions
  const [currentIntake, setCurrentIntake] = useState(() => {
    const stored = localStorage.getItem('hydrationData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.currentIntake || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  });
  const [dailyGoal, setDailyGoal] = useState(() => {
    const stored = localStorage.getItem('hydrationData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.dailyGoal || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [streak, setStreak] = useState(() => {
    const stored = localStorage.getItem('hydrationData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.streak || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  });
  const [lastCompletedDate, setLastCompletedDate] = useState(() => {
    const stored = localStorage.getItem('hydrationData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.lastCompletedDate || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [lastResetDate, setLastResetDate] = useState(() => {
    const stored = localStorage.getItem('hydrationData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.lastResetDate || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [dailyHistory, setDailyHistory] = useState(() => {
    const stored = localStorage.getItem('hydrationData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.dailyHistory || {};
      } catch (e) {
        return {};
      }
    }
    return {};
  });
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAccomplishment, setShowAccomplishment] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !window.hydrationData?.dailyGoal && !localStorage.getItem('hydrationData');
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') === 'true';
  });
  const [reminderInterval, setReminderInterval] = useState(() => {
    return parseInt(localStorage.getItem('reminderInterval')) || 60; // default 60 minutes
  });
  const [lastWaterTime, setLastWaterTime] = useState(() => {
    return parseInt(localStorage.getItem('lastWaterTime')) || Date.now();
  });
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [quietTimeStart, setQuietTimeStart] = useState(() => {
    return parseInt(localStorage.getItem('quietTimeStart')) || 22; // 10 PM
  });
  const [quietTimeEnd, setQuietTimeEnd] = useState(() => {
    return parseInt(localStorage.getItem('quietTimeEnd')) || 7; // 7 AM
  });
  const [lastNotificationTime, setLastNotificationTime] = useState(() => {
    return parseInt(localStorage.getItem('lastNotificationTime')) || 0;
  });
  
  // Calculator states
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [climate, setClimate] = useState('moderate');

  // Persist data to localStorage for durability
  useEffect(() => {
    const data = {
      currentIntake,
      dailyGoal,
      streak,
      lastCompletedDate,
      lastResetDate,
      dailyHistory
    };
    localStorage.setItem('hydrationData', JSON.stringify(data));
    // Also keep window.hydrationData for backward compatibility
    if (!window.hydrationData) {
      window.hydrationData = {};
    }
    window.hydrationData = data;
  }, [currentIntake, dailyGoal, streak, lastCompletedDate, lastResetDate, dailyHistory]);



  // Notification permission and reminder setup
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true);
      }
    }
  }, [notificationsEnabled]);

  // Reminder interval logic
  useEffect(() => {
    if (!notificationsEnabled || !dailyGoal) return;
    if (Notification.permission !== 'granted') return;
    if (currentIntake >= dailyGoal) return; // Stop notifications when goal is reached

    const checkAndNotify = () => {
      const now = Date.now();
      const timeSinceLastNotification = now - lastNotificationTime;
      const intervalMs = reminderInterval * 60 * 1000;

      // Check if we're in quiet time
      const currentHour = new Date().getHours();
      const isQuietTime = quietTimeStart > quietTimeEnd 
        ? (currentHour >= quietTimeStart || currentHour < quietTimeEnd) // e.g., 22:00 to 07:00
        : (currentHour >= quietTimeStart && currentHour < quietTimeEnd); // e.g., 01:00 to 06:00

      // Only notify if goal not reached, interval has passed, and not in quiet time
      if (currentIntake < dailyGoal && timeSinceLastNotification >= intervalMs && !isQuietTime) {
        sendNotification();
        setLastNotificationTime(now);
      }
    };

    // Check immediately and then every minute
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, lastNotificationTime, currentIntake, dailyGoal, reminderInterval, quietTimeStart, quietTimeEnd]);

  // Update lastWaterTime when water is added (only on manual add, not on state changes)
  const updateLastWaterTime = () => {
    const newTime = Date.now();
    setLastWaterTime(newTime);
    localStorage.setItem('lastWaterTime', newTime.toString());
  };

  // Persist notification settings
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('reminderInterval', reminderInterval.toString());
  }, [reminderInterval]);

  useEffect(() => {
    localStorage.setItem('quietTimeStart', quietTimeStart.toString());
  }, [quietTimeStart]);

  useEffect(() => {
    localStorage.setItem('quietTimeEnd', quietTimeEnd.toString());
  }, [quietTimeEnd]);

  useEffect(() => {
    localStorage.setItem('lastNotificationTime', lastNotificationTime.toString());
  }, [lastNotificationTime]);

  // Check for daily reset and record previous day's data
  useEffect(() => {
    const today = new Date().toDateString();
    
    if (lastResetDate && lastResetDate !== today) {
      // Save yesterday's data to history
      const yesterday = new Date(lastResetDate);
      const dateKey = yesterday.toISOString().split('T')[0];
      
      setDailyHistory(prev => ({
        ...prev,
        [dateKey]: {
          intake: currentIntake,
          goal: dailyGoal,
          completed: currentIntake >= dailyGoal,
          date: dateKey
        }
      }));
      
      // Check if streak should continue or break
      const yesterdayDate = new Date(lastResetDate);
      const currentDate = new Date();
      const diffTime = currentDate - yesterdayDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If more than 1 day passed without completion, break streak
      if (diffDays > 1 || (diffDays === 1 && currentIntake < dailyGoal)) {
        if (currentIntake < dailyGoal) {
          setStreak(0);
        }
      }
      
      // Reset intake for new day
      setCurrentIntake(0);
    }
    
    if (!lastResetDate) {
      setLastResetDate(today);
    } else if (lastResetDate !== today) {
      setLastResetDate(today);
    }
  }, [lastResetDate, currentIntake, dailyGoal]);

  // Check if goal is reached
  useEffect(() => {
    if (dailyGoal && currentIntake >= dailyGoal && !showAccomplishment) {
      const today = new Date().toDateString();
      
      if (lastCompletedDate !== today) {
        setShowAccomplishment(true);
        
        // Update streak
        if (lastCompletedDate) {
          const lastDate = new Date(lastCompletedDate);
          const currentDate = new Date();
          lastDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);
          const diffTime = currentDate - lastDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            setStreak(prev => prev + 1);
          } else if (diffDays > 1) {
            setStreak(1);
          }
        } else {
          setStreak(1);
        }
        
        setLastCompletedDate(today);
      }
    }
  }, [currentIntake, dailyGoal, lastCompletedDate, showAccomplishment]);

  const sendNotification = (isTest = false) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const remaining = dailyGoal - currentIntake;
      new Notification('💧 Hydration Reminder', {
        body: isTest
          ? `You'll receive reminders every ${reminderInterval} minutes to stay hydrated.`
          : remaining > 0 
            ? `Time to drink water! You still need ${remaining}ml to reach your goal.`
            : 'Great job staying hydrated!',
        icon: '/droplet.svg',
        badge: '/droplet.svg',
        tag: 'hydration-reminder',
        requireInteraction: false,
        silent: false
      });
      if (!isTest) {
        setLastNotificationTime(Date.now());
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setShowNotificationPrompt(false);
        setLastNotificationTime(Date.now());
        // Send a test notification
        sendNotification(true);
      } else {
        setShowNotificationPrompt(false);
      }
    }
  };

  const addWater = (amount) => {
    setCurrentIntake(prev => Math.min(prev + amount, dailyGoal + 2000));
    updateLastWaterTime();
  };

  const removeWater = (amount) => {
    setCurrentIntake(prev => Math.max(prev - amount, 0));
  };

  const calculateHydration = () => {
    if (!weight) return;
    
    let base = parseFloat(weight) * 33; // 33ml per kg
    
    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      veryActive: 1.5
    };
    
    // Climate adjustment
    const climateAdjustments = {
      cold: 0.9,
      moderate: 1.0,
      hot: 1.2,
      veryHot: 1.3
    };
    
    const calculated = Math.round(base * activityMultipliers[activityLevel] * climateAdjustments[climate]);
    setDailyGoal(calculated);
    setShowCalculator(false);
    setShowOnboarding(false);
  };

  const setManualGoal = () => {
    const goal = parseInt(customGoal);
    if (goal && goal > 0) {
      setDailyGoal(goal);
      setShowGoalInput(false);
      setShowOnboarding(false);
      setCustomGoal('');
    }
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const stats = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      if (dailyHistory[dateKey]) {
        stats.push(dailyHistory[dateKey]);
      } else if (i === 0 && dailyGoal) {
        // Today's data
        stats.push({
          intake: currentIntake,
          goal: dailyGoal,
          completed: currentIntake >= dailyGoal,
          date: dateKey
        });
      } else {
        stats.push({
          intake: 0,
          goal: dailyGoal || 2500,
          completed: false,
          date: dateKey
        });
      }
    }
    
    return stats;
  };

  const percentage = dailyGoal ? Math.min((currentIntake / dailyGoal) * 100, 100) : 0;
  
  const presets = [
    { label: 'Glass', amount: 250, icon: '🥛' },
    { label: 'Bottle', amount: 500, icon: '🍶' },
    { label: 'Large Bottle', amount: 1000, icon: '💧' }
  ];

  const theme = isDark ? {
    bg: 'bg-slate-900',
    card: 'bg-slate-800',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    border: 'border-slate-700',
    accent: 'bg-cyan-500',
    accentHover: 'hover:bg-cyan-600',
    button: 'bg-slate-700 hover:bg-slate-600',
    wave: 'from-cyan-400 via-blue-500 to-cyan-600'
  } : {
    bg: 'bg-blue-50',
    card: 'bg-white',
    text: 'text-slate-900',
    textMuted: 'text-slate-600',
    border: 'border-slate-200',
    accent: 'bg-cyan-500',
    accentHover: 'hover:bg-cyan-600',
    button: 'bg-slate-100 hover:bg-slate-200',
    wave: 'from-cyan-300 via-blue-400 to-cyan-500'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300 p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Onboarding Screen */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${theme.card} rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
              <div className="text-center mb-8">
                <div className={`${theme.accent} p-6 rounded-full inline-block mb-4`}>
                  <Droplet className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome to Hydration Tracker</h2>
                <p className={theme.textMuted}>Let's set up your daily water goal</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowOnboarding(false);
                    setShowCalculator(true);
                  }}
                  className={`w-full ${theme.accent} ${theme.accentHover} text-white p-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
                >
                  <Calculator className="w-5 h-5" />
                  Calculate My Goal
                </button>
                
                <button
                  onClick={() => {
                    setShowOnboarding(false);
                    setShowGoalInput(true);
                  }}
                  className={`w-full ${theme.button} p-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95`}
                >
                  Set Custom Goal
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`${theme.accent} p-3 rounded-2xl shadow-lg`}>
              <Droplet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Hydro</h1>
              <p className={theme.textMuted}>Stay healthy, stay hydrated</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNotificationPrompt(true)}
              className={`${theme.button} p-3 rounded-xl transition-colors relative`}
              title="Notification Settings"
            >
              🔔
              {notificationsEnabled && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`${theme.button} p-3 rounded-xl transition-colors`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className={theme.textMuted}>Streak</span>
            </div>
            <p className="text-3xl font-bold">{streak} days</p>
          </div>
          
          <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-cyan-500" />
              <span className={theme.textMuted}>Today</span>
            </div>
            <p className="text-3xl font-bold">{currentIntake}ml</p>
          </div>
          
          <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg col-span-2 md:col-span-1`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className={theme.textMuted}>Goal</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{dailyGoal ? `${dailyGoal}ml` : 'Not set'}</p>
              <button
                onClick={() => setShowGoalInput(true)}
                className={`${theme.button} p-2 rounded-lg text-sm`}
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Main Progress Circle */}
        <div className={`${theme.card} p-8 rounded-3xl border ${theme.border} shadow-xl mb-8`}>
          <div className="relative w-64 h-64 mx-auto mb-6">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="currentColor"
                strokeWidth="16"
                fill="none"
                className={theme.textMuted}
                opacity="0.2"
              />
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 112}`}
                strokeDashoffset={`${2 * Math.PI * 112 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className="text-cyan-400" stopColor="currentColor" />
                  <stop offset="50%" className="text-blue-500" stopColor="currentColor" />
                  <stop offset="100%" className="text-cyan-600" stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Animated water with SVG waves - behind text */}
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none" style={{ clipPath: 'circle(112px at center)', zIndex: 1 }}>
              {/* Solid water base - fills from bottom */}
              <div 
                className="absolute inset-x-0 w-full transition-all duration-1000 ease-out"
                style={{
                  bottom: 0,
                  height: `${percentage}%`,
                  background: 'linear-gradient(to top, rgba(6, 182, 212, 0.7), rgba(14, 116, 144, 0.6))',
                  zIndex: 1
                }}
              />
              
              {/* Wave Layer 1 - Primary wave on top with smooth curves */}
              <div 
                className="absolute inset-x-0 w-full"
                style={{
                  bottom: 0,
                  height: `${Math.min(percentage + 10, 100)}%`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100' preserveAspectRatio='none'%3E%3Cpath fill='rgba(6,182,212,0.5)' d='M0,50 C240,20 480,80 720,50 C960,20 1200,80 1440,50 L1440,100 L0,100 Z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-x',
                  backgroundSize: '1440px 50px',
                  backgroundPosition: 'top left',
                  animation: 'waveSlide1 15s linear infinite',
                  zIndex: 3,
                  transition: 'height 1s ease-out',
                  filter: 'blur(1px)'
                }}
              />
              
              {/* Wave Layer 2 - Middle wave with white highlight */}
              <div 
                className="absolute inset-x-0 w-full"
                style={{
                  bottom: 0,
                  height: `${Math.min(percentage + 7, 100)}%`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100' preserveAspectRatio='none'%3E%3Cpath fill='rgba(255,255,255,0.25)' d='M0,60 C288,90 576,30 864,60 C1152,90 1296,30 1440,60 L1440,100 L0,100 Z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-x',
                  backgroundSize: '1440px 50px',
                  backgroundPosition: 'top left',
                  animation: 'waveSlide2 10s linear infinite reverse',
                  zIndex: 2,
                  transition: 'height 1s ease-out',
                  filter: 'blur(0.5px)'
                }}
              />
              
              {/* Wave Layer 3 - Subtle deep wave */}
              <div 
                className="absolute inset-x-0 w-full"
                style={{
                  bottom: 0,
                  height: `${Math.min(percentage + 5, 100)}%`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100' preserveAspectRatio='none'%3E%3Cpath fill='rgba(14,116,144,0.4)' d='M0,70 C360,40 720,100 1080,70 C1260,55 1350,85 1440,70 L1440,100 L0,100 Z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-x',
                  backgroundSize: '1440px 50px',
                  backgroundPosition: 'top left',
                  animation: 'waveSlide3 20s linear infinite',
                  zIndex: 2,
                  transition: 'height 1s ease-out',
                  filter: 'blur(1.5px)'
                }}
              />
              
              {/* Bubbles container - positioned within water */}
              {percentage > 5 && (
                <div 
                  className="absolute inset-x-0 w-full"
                  style={{
                    bottom: 0,
                    height: `${percentage}%`,
                    zIndex: 4
                  }}
                >
                  <div className="bubble" style={{ left: '15%', bottom: '5%', animationDelay: '0s' }} />
                  <div className="bubble" style={{ left: '75%', bottom: '10%', animationDelay: '1.5s' }} />
                  <div className="bubble" style={{ left: '40%', bottom: '8%', animationDelay: '3s' }} />
                  <div className="bubble" style={{ left: '85%', bottom: '12%', animationDelay: '0.8s' }} />
                  <div className="bubble" style={{ left: '25%', bottom: '15%', animationDelay: '2.2s' }} />
                  <div className="bubble" style={{ left: '60%', bottom: '6%', animationDelay: '1.2s' }} />
                  <div className="bubble" style={{ left: '50%', bottom: '18%', animationDelay: '2.8s' }} />
                  <div className="bubble" style={{ left: '10%', bottom: '9%', animationDelay: '4s' }} />
                </div>
              )}
              
              {/* Shimmer light effect */}
              {percentage > 0 && (
                <div 
                  className="absolute inset-x-0 w-full"
                  style={{
                    bottom: 0,
                    height: `${percentage}%`,
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmerMove 4s ease-in-out infinite',
                    zIndex: 5,
                    transition: 'height 1s ease-out'
                  }}
                />
              )}
            </div>
            
            {/* Center content with glow effect - on top of water */}
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
              <div className={`text-5xl font-bold mb-2 ${percentage > 0 ? 'glow-text' : ''}`}>{Math.round(percentage)}%</div>
              <div className={`${theme.textMuted} ${percentage > 0 ? 'glow-text-subtle' : ''}`}>{currentIntake} / {dailyGoal || '---'}ml</div>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => addWater(preset.amount)}
                className={`${theme.button} p-4 rounded-xl transition-all hover:scale-105 active:scale-95`}
              >
                <div className="text-3xl mb-2">{preset.icon}</div>
                <div className="font-semibold">{preset.label}</div>
                <div className={`${theme.textMuted} text-sm`}>{preset.amount}ml</div>
              </button>
            ))}
          </div>

          {/* Custom Amount Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => removeWater(100)}
              className={`${theme.accent} ${theme.accentHover} p-3 rounded-xl text-white transition-all hover:scale-105 active:scale-95`}
            >
              <Minus className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className={`${theme.textMuted} text-sm mb-1`}>Custom Amount</div>
              <div className="text-2xl font-bold">100ml</div>
            </div>
            <button
              onClick={() => addWater(100)}
              className={`${theme.accent} ${theme.accentHover} p-3 rounded-xl text-white transition-all hover:scale-105 active:scale-95`}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Calculator Button */}
        <button
          onClick={() => setShowCalculator(true)}
          className={`w-full ${theme.card} p-4 rounded-2xl border ${theme.border} shadow-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all mb-4`}
        >
          <Calculator className="w-5 h-5 text-cyan-500" />
          <span className="font-semibold">Calculate My Hydration Goal</span>
        </button>

        {/* Weekly Progress */}
        {dailyGoal && (
          <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-lg`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
              Weekly Progress
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {getWeeklyStats().map((day, index) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });
                const completionPercentage = Math.min((day.intake / day.goal) * 100, 100);
                
                return (
                  <div key={day.date} className="text-center">
                    <div className={`text-xs ${theme.textMuted} mb-2`}>{dayName}</div>
                    <div className={`${theme.button} rounded-xl p-2 h-24 flex flex-col items-center justify-end relative overflow-hidden`}>
                      <div 
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${theme.wave} opacity-30 transition-all duration-500`}
                        style={{ height: `${completionPercentage}%` }}
                      />
                      {day.completed && (
                        <Check className="w-4 h-4 text-green-500 relative z-10 mb-1" />
                      )}
                      <div className={`text-xs font-bold relative z-10 ${theme.textMuted}`}>
                        {Math.round(day.intake / 1000)}L
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hydration Calculator Modal */}
        {showCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${theme.card} rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Hydration Calculator</h2>
                <button onClick={() => setShowCalculator(false)} className={`${theme.button} p-2 rounded-lg`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-semibold">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className={`w-full ${theme.button} p-3 rounded-xl border ${theme.border} outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="Enter your weight"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className={`w-full ${theme.button} p-3 rounded-xl border ${theme.border} outline-none focus:ring-2 focus:ring-cyan-500`}
                  >
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="veryActive">Very Active (athlete)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Climate</label>
                  <select
                    value={climate}
                    onChange={(e) => setClimate(e.target.value)}
                    className={`w-full ${theme.button} p-3 rounded-xl border ${theme.border} outline-none focus:ring-2 focus:ring-cyan-500`}
                  >
                    <option value="cold">Cold</option>
                    <option value="moderate">Moderate</option>
                    <option value="hot">Hot</option>
                    <option value="veryHot">Very Hot</option>
                  </select>
                </div>

                <button
                  onClick={calculateHydration}
                  disabled={!weight}
                  className={`w-full ${theme.accent} ${theme.accentHover} text-white p-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  Calculate My Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Goal Input Modal */}
        {showGoalInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${theme.card} rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Set Custom Goal</h2>
                <button onClick={() => setShowGoalInput(false)} className={`${theme.button} p-2 rounded-lg`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-semibold">Daily Water Goal (ml)</label>
                  <input
                    type="number"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className={`w-full ${theme.button} p-3 rounded-xl border ${theme.border} outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="e.g., 2500"
                  />
                  <p className={`${theme.textMuted} text-sm mt-2`}>
                    Recommended: 2000-3000ml per day
                  </p>
                </div>

                <button
                  onClick={setManualGoal}
                  disabled={!customGoal || parseInt(customGoal) <= 0}
                  className={`w-full ${theme.accent} ${theme.accentHover} text-white p-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  Set Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings Modal */}
        {showNotificationPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${theme.card} rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Notification Settings</h2>
                <button onClick={() => setShowNotificationPrompt(false)} className={`${theme.button} p-2 rounded-lg`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Enable Reminders</p>
                    <p className={`${theme.textMuted} text-sm`}>Get notified to drink water</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!notificationsEnabled && Notification.permission !== 'granted') {
                        requestNotificationPermission();
                      } else {
                        setNotificationsEnabled(!notificationsEnabled);
                      }
                    }}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-cyan-500' : theme.button
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {notificationsEnabled && Notification.permission === 'granted' && (
                  <>
                    <div>
                      <label className="block mb-2 font-semibold">Reminder Interval</label>
                      <select
                        value={reminderInterval}
                        onChange={(e) => setReminderInterval(parseInt(e.target.value))}
                        className={`w-full ${theme.button} p-3 rounded-xl border ${theme.border} outline-none focus:ring-2 focus:ring-cyan-500`}
                      >
                        <option value="30">Every 30 minutes</option>
                        <option value="60">Every 1 hour</option>
                        <option value="90">Every 1.5 hours</option>
                        <option value="120">Every 2 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold">Quiet Time (No Notifications)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-sm ${theme.textMuted} mb-1`}>Start</label>
                          <select
                            value={quietTimeStart}
                            onChange={(e) => setQuietTimeStart(parseInt(e.target.value))}
                            className={`w-full ${theme.button} p-2 rounded-xl border ${theme.border} outline-none focus:ring-2 focus:ring-cyan-500`}
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-sm ${theme.textMuted} mb-1`}>End</label>
                          <select
                            value={quietTimeEnd}
                            onChange={(e) => setQuietTimeEnd(parseInt(e.target.value))}
                            className={`w-full ${theme.button} p-2 rounded-xl border ${theme.border} outline-none focus:ring-2 focus:ring-cyan-500`}
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className={`${theme.textMuted} text-xs mt-2`}>
                        🌙 Currently: {quietTimeStart.toString().padStart(2, '0')}:00 - {quietTimeEnd.toString().padStart(2, '0')}:00
                      </p>
                    </div>
                  </>
                )}

                {!notificationsEnabled && Notification.permission === 'denied' && (
                  <div className={`${theme.button} p-4 rounded-xl`}>
                    <p className={`${theme.textMuted} text-sm`}>
                      ⚠️ Notifications are blocked. Please enable them in your browser settings.
                    </p>
                  </div>
                )}

                {!notificationsEnabled && Notification.permission === 'default' && (
                  <button
                    onClick={requestNotificationPermission}
                    className={`w-full ${theme.accent} ${theme.accentHover} text-white p-4 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95`}
                  >
                    Enable Notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accomplishment Modal */}
        {showAccomplishment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${theme.card} rounded-3xl p-8 max-w-md w-full shadow-2xl text-center`}>
              <div className="mb-6">
                <div className="inline-block bg-gradient-to-br from-yellow-400 to-amber-500 p-6 rounded-full mb-4 animate-bounce">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Goal Achieved! 🎉</h2>
                <p className={`${theme.textMuted} text-lg`}>You've reached your daily hydration goal!</p>
              </div>

              <div className={`${theme.button} p-6 rounded-2xl mb-6`}>
                <div className="text-5xl font-bold text-cyan-500 mb-2">{streak}</div>
                <div className={theme.textMuted}>Day Streak</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={theme.textMuted}>Today's Intake</span>
                  <span className="font-bold">{currentIntake}ml</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={theme.textMuted}>Daily Goal</span>
                  <span className="font-bold">{dailyGoal}ml</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={theme.textMuted}>Achievement</span>
                  <span className="font-bold text-cyan-500">{Math.round(percentage)}%</span>
                </div>
              </div>

              <button
                onClick={() => setShowAccomplishment(false)}
                className={`w-full ${theme.accent} ${theme.accentHover} text-white p-4 rounded-xl font-semibold mt-6 transition-all hover:scale-105 active:scale-95`}
              >
                Continue Tracking
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes waveSlide1 {
          0% { 
            background-position-x: 0px;
          }
          100% { 
            background-position-x: 1440px;
          }
        }
        
        @keyframes waveSlide2 {
          0% { 
            background-position-x: 0px;
          }
          100% { 
            background-position-x: -1440px;
          }
        }
        
        @keyframes waveSlide3 {
          0% { 
            background-position-x: 0px;
          }
          100% { 
            background-position-x: 1440px;
          }
        }
        
        @keyframes bubbleRise {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-10px) scale(0.5);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-80px) scale(0.8);
          }
          100% {
            transform: translateY(-180px) scale(0.4);
            opacity: 0;
          }
        }
        
        @keyframes shimmerMove {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 5px rgba(6, 182, 212, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.3);
          }
        }
        
        /* Bubble styles */
        .bubble {
          position: absolute;
          width: 6px;
          height: 6px;
          background: radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(200, 240, 255, 0.7) 40%, 
            rgba(100, 200, 255, 0.3) 70%,
            transparent 100%);
          border-radius: 50%;
          animation: bubbleRise 5s ease-in-out infinite;
          box-shadow: 
            0 0 8px rgba(255, 255, 255, 0.5),
            inset -2px -2px 4px rgba(255, 255, 255, 0.6),
            inset 2px 2px 4px rgba(0, 150, 200, 0.3);
          filter: blur(0.3px);
        }
        
        .bubble:nth-child(1) { width: 8px; height: 8px; animation-duration: 6s; }
        .bubble:nth-child(2) { width: 5px; height: 5px; animation-duration: 5.5s; }
        .bubble:nth-child(3) { width: 7px; height: 7px; animation-duration: 7s; }
        .bubble:nth-child(4) { width: 6px; height: 6px; animation-duration: 5s; }
        .bubble:nth-child(5) { width: 9px; height: 9px; animation-duration: 8s; }
        .bubble:nth-child(6) { width: 5px; height: 5px; animation-duration: 6.5s; }
        .bubble:nth-child(7) { width: 7px; height: 7px; animation-duration: 5.8s; }
        .bubble:nth-child(8) { width: 6px; height: 6px; animation-duration: 7.2s; }
        
        /* Glow effects */
        .glow-text {
          animation: glow 3s ease-in-out infinite;
        }
        
        .glow-text-subtle {
          text-shadow: 0 0 8px rgba(6, 182, 212, 0.2);
        }
      `}</style>
    </div>
  );
}
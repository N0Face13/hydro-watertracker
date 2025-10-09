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

    const checkAndNotify = () => {
      const now = Date.now();
      const timeSinceLastWater = now - lastWaterTime;
      const intervalMs = reminderInterval * 60 * 1000;

      // Only notify if goal not reached and interval has passed
      if (currentIntake < dailyGoal && timeSinceLastWater >= intervalMs) {
        sendNotification();
      }
    };

    // Check immediately and then every minute
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, lastWaterTime, currentIntake, dailyGoal, reminderInterval]);

  // Update lastWaterTime when water is added
  useEffect(() => {
    if (currentIntake > 0) {
      const newTime = Date.now();
      setLastWaterTime(newTime);
      localStorage.setItem('lastWaterTime', newTime.toString());
    }
  }, [currentIntake]);

  // Persist notification settings
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('reminderInterval', reminderInterval.toString());
  }, [reminderInterval]);

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

  const sendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const remaining = dailyGoal - currentIntake;
      new Notification('💧 Hydration Reminder', {
        body: remaining > 0 
          ? `Time to drink water! You still need ${remaining}ml to reach your goal.`
          : 'Great job staying hydrated!',
        icon: '/droplet.svg',
        badge: '/droplet.svg',
        tag: 'hydration-reminder',
        requireInteraction: false,
        silent: false
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setShowNotificationPrompt(false);
        // Send a test notification
        new Notification('🎉 Notifications Enabled!', {
          body: `You'll receive reminders every ${reminderInterval} minutes to stay hydrated.`,
          icon: '/droplet.svg'
        });
      } else {
        setShowNotificationPrompt(false);
      }
    }
  };

  const addWater = (amount) => {
    setCurrentIntake(prev => Math.min(prev + amount, dailyGoal + 2000));
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
              <h1 className="text-3xl font-bold">Hydration Tracker</h1>
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
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold mb-2">{Math.round(percentage)}%</div>
              <div className={theme.textMuted}>{currentIntake} / {dailyGoal || '---'}ml</div>
            </div>
            
            {/* Animated wave */}
            <div className="absolute inset-0 flex items-end justify-center overflow-hidden rounded-full pointer-events-none" style={{ clipPath: 'circle(112px at center)' }}>
              <div 
                className={`w-[200%] h-full bg-gradient-to-r ${theme.wave} opacity-20 transition-all duration-1000`}
                style={{
                  transform: `translateY(${100 - percentage}%)`,
                  animation: 'wave 3s ease-in-out infinite'
                }}
              />
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
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(${100 - percentage}%); }
          50% { transform: translateX(-25%) translateY(${100 - percentage}%); }
        }
      `}</style>
    </div>
  );
}
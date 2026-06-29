import React, { useEffect, useState, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { getPrayerState, formatDuration, PrayerState } from '../utils/prayerCalc';
import { Bell, BellOff, Volume2, Sparkles, Sunrise, Sun, Sunset, Moon, CloudMoon, Clock } from 'lucide-react';

export const SmartPrayerCard: React.FC = () => {
  const { settings, currentTime } = useDashboard();
  const [prayerState, setPrayerState] = useState<PrayerState | null>(null);
  const [isAdhanMuted, setIsAdhanMuted] = useState<boolean>(!settings.adhanEnabled);
  const previousPrayerRef = useRef<string>('');

  // Track the prayer state at every tick
  useEffect(() => {
    const state = getPrayerState(currentTime, settings.prayerMethod, settings.prayerMadhhab);
    setPrayerState(state);

    // If the active prayer transitions, play the synthesized chime
    if (state.type === 'CURRENT' && previousPrayerRef.current !== state.prayer) {
      if (!isAdhanMuted) {
        playNotificationChime();
      }
    }
    previousPrayerRef.current = state.prayer;
  }, [currentTime, settings.prayerMethod, settings.prayerMadhhab, isAdhanMuted]);

  if (!settings.widgetVisibility.prayerCard || !prayerState) return null;

  // Synthesize an elegant, multi-harmonic electronic gong/adhan alert bell using Web Audio API
  function playNotificationChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Core oscillator
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4 note

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(554.37, ctx.currentTime); // C#5 (Major third harmonic)

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(659.25, ctx.currentTime); // E5 (Fifth harmonic)

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5); // Warm exponential decay

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc3.start();

      osc1.stop(ctx.currentTime + 3);
      osc2.stop(ctx.currentTime + 3);
      osc3.stop(ctx.currentTime + 3);
    } catch (e) {
      console.error('Failed to play synthesised notification chime', e);
    }
  }

  const getPrayerIcon = (name: string) => {
    switch (name) {
      case 'Tahajjud': return <Sparkles className="w-8 h-8 text-indigo-400" />;
      case 'Fajr': return <Sunrise className="w-8 h-8 text-amber-500 animate-pulse" />;
      case 'Dhuhr': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'Asr': return <Sun className="w-8 h-8 text-orange-400" />;
      case 'Maghrib': return <Sunset className="w-8 h-8 text-rose-500" />;
      case 'Isha': return <Moon className="w-8 h-8 text-slate-300" />;
      default: return <Clock className="w-8 h-8 text-cyan-400" />;
    }
  };

  const getPrayerColorClass = (name: string) => {
    switch (name) {
      case 'Tahajjud': return 'from-indigo-600/30 to-purple-600/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/10';
      case 'Fajr': return 'from-amber-600/30 to-orange-600/15 border-amber-500/30 text-amber-300 shadow-amber-500/10';
      case 'Dhuhr': return 'from-yellow-600/30 to-amber-600/15 border-yellow-500/30 text-yellow-300 shadow-yellow-500/10';
      case 'Asr': return 'from-orange-600/30 to-red-600/15 border-orange-500/30 text-orange-300 shadow-orange-500/10';
      case 'Maghrib': return 'from-rose-600/30 to-pink-600/15 border-rose-500/30 text-rose-300 shadow-rose-500/10';
      case 'Isha': return 'from-slate-700/30 to-blue-900/15 border-blue-500/30 text-blue-300 shadow-blue-500/10';
      default: return 'from-cyan-600/30 to-blue-600/15 border-cyan-500/30 text-cyan-300 shadow-cyan-500/10';
    }
  };

  const formatTimeHM = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const { type, prayer, startTime, endTime, timeRemainingMs, progress } = prayerState;

  // Radial progress calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`bg-slate-950/45 border-slate-800/40 backdrop-blur-md rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between transition-all duration-700 text-white shadow-2xl ${
        prayer === 'Asr' || prayer === 'Fajr' ? 'glow-amber border-amber-500/20' :
        prayer === 'Maghrib' ? 'glow-amber border-rose-500/20' :
        prayer === 'Isha' || prayer === 'Tahajjud' ? 'glow-blue border-indigo-500/20' : 'glow-green border-emerald-500/20'
      }`}
      id="smart-prayer-card"
    >
      {/* High-Resolution Al-Masjid an-Nabawi Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out pointer-events-none scale-105"
        style={{ backgroundImage: `url('https://stock.adobe.com/images/al-masjid-an-nabawi-mosque-in-medina-saudi-arabia-during-golden-hour/1884567289')` }}
      />
      
      {/* Elegant dark semi-transparent glassmorphism gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/45 to-slate-950/40 pointer-events-none" />

      {/* Background soft glow based on prayer status */}
      <div className="absolute -inset-24 rounded-full filter blur-3xl opacity-10 pointer-events-none bg-current"></div>

      {/* Header with status badges and mute toggler */}
      <div className="flex items-center justify-between relative z-10 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono uppercase tracking-widest font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300">
            {type === 'CURRENT' ? 'CURRENT PRAYER' : 'NEXT PRAYER'}
          </span>
          <span className="text-[9px] text-slate-300 font-mono">
            {settings.prayerMethod} • {settings.prayerMadhhab === 'Hanafi' ? 'Hanafi' : 'Standard'}
          </span>
        </div>

        <button
          onClick={() => setIsAdhanMuted(!isAdhanMuted)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/10 bg-white/5 hover:border-white/20 transition-all text-slate-300 hover:text-white"
          title={isAdhanMuted ? "Enable chime" : "Mute chime"}
        >
          {isAdhanMuted ? (
            <>
              <BellOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[8px] font-mono uppercase font-black text-rose-400">Muted</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[8px] font-mono uppercase font-black text-emerald-400">Active</span>
            </>
          )}
        </button>
      </div>

      {/* Main Body - Beautifully Balanced Circular Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 my-4 items-center justify-items-center relative z-10">
        
        {/* Left Side: Detail metadata */}
        <div className="flex flex-col items-center sm:items-start lg:items-center xl:items-start text-center sm:text-left lg:text-center xl:text-left">
          <div className="label text-slate-200 font-semibold mb-1 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">Operational Node</div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-lg backdrop-blur-md shadow-lg">
            {getPrayerIcon(prayer)}
            <div>
              <h3 className="font-mono text-xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {prayer}
              </h3>
              <span className="text-[8px] font-mono text-slate-300 uppercase block drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Active Interval</span>
            </div>
          </div>
          <div className="mt-2.5 space-y-0.5 text-[10px] text-slate-200 font-mono drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
            <div>🌅 Started: <span className="text-white font-semibold">{formatTimeHM(startTime)}</span></div>
            <div>🌇 Target: <span className="text-white font-semibold">{formatTimeHM(endTime)}</span></div>
          </div>
        </div>

        {/* Center: Glowing Circular Prayer Ring */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Outer track */}
            <circle
              cx="80"
              cy="80"
              r={radius + 8}
              className="text-white/5"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Glowing progress ring segment */}
            <circle
              cx="80"
              cy="80"
              r={radius + 8}
              className="transition-all duration-1000 animate-pulse"
              strokeWidth="7"
              strokeDasharray={2 * Math.PI * (radius + 8)}
              strokeDashoffset={2 * Math.PI * (radius + 8) - (progress / 100) * (2 * Math.PI * (radius + 8))}
              strokeLinecap="round"
              stroke={
                prayer === 'Asr' || prayer === 'Fajr' ? '#f59e0b' :
                prayer === 'Maghrib' ? '#f43f5e' :
                prayer === 'Isha' || prayer === 'Tahajjud' ? '#3b82f6' : '#22c55e'
              }
              fill="transparent"
            />
          </svg>

          {/* Core display inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-200 font-mono tracking-widest uppercase font-bold drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
              {type === 'CURRENT' ? 'REMAINING' : 'STARTS IN'}
            </span>
            <span className="digital-font text-base md:text-lg text-white font-bold tracking-tight my-0.5 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {formatDuration(timeRemainingMs)}
            </span>
            <span className="text-[10px] text-slate-200 font-mono font-bold drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
              {Math.round(progress)}% COMPLETED
            </span>
          </div>
        </div>

        {/* Right Side: Progress Bar details */}
        <div className="flex flex-col items-center sm:items-end lg:items-center xl:items-end text-center sm:text-right lg:text-center xl:text-right w-full sm:w-auto lg:w-full xl:w-auto">
          <span className="label text-slate-200 font-semibold mb-1 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">State Progress</span>
          <div className="w-44 bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/15 mb-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                prayer === 'Asr' || prayer === 'Fajr' ? 'bg-amber-500' :
                prayer === 'Maghrib' ? 'bg-rose-500' :
                prayer === 'Isha' || prayer === 'Tahajjud' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-200 font-mono leading-relaxed drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.8)]">
            <div>Next Event: <span className="text-white font-bold">{prayer === 'Isha' ? 'Tahajjud' : prayer === 'Tahajjud' ? 'Fajr' : prayer === 'Fajr' ? 'Dhuhr' : prayer === 'Dhuhr' ? 'Asr' : prayer === 'Asr' ? 'Maghrib' : 'Isha'}</span></div>
            <div className="text-[8px] text-slate-300 uppercase tracking-widest mt-0.5">Calculations live</div>
          </div>
        </div>

      </div>

      {/* Interactive Testing Control Panel inside card */}
      <div className="mt-2 border-t border-white/5 pt-2 flex items-center justify-between relative z-10 text-[9px] text-slate-500 font-mono">
        <span>Continuous Automatic Sequence State: Running</span>
        <button
          onClick={playNotificationChime}
          className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded border border-white/5 hover:border-white/15 bg-white/5 transition-all"
        >
          <Volume2 className="w-3.5 h-3.5" />
          Test Operational Chime
        </button>
      </div>
    </div>
  );
};
export default SmartPrayerCard;

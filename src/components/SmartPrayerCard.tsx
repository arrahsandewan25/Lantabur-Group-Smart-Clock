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
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out pointer-events-none scale-100 opacity-95"
        style={{ backgroundImage: `url('/Prayer.jpg')` }}
      />
      
      {/* High-contrast smart gradient overlay: clear in the middle, dark at the top and bottom for flawless typography readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/25 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />

      {/* Background soft glow based on prayer status */}
      <div className="absolute -inset-24 rounded-full filter blur-3xl opacity-15 pointer-events-none bg-current"></div>

      {/* Header with status badges and mute toggler */}
      <div className="flex items-center justify-between relative z-10 border-b border-white/15 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest font-black bg-black/60 border border-white/20 px-2.5 py-1 rounded-full text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] animate-pulse">
            {type === 'CURRENT' ? '● CURRENT PRAYER' : '○ NEXT PRAYER'}
          </span>
          <span className="text-[10px] text-white/90 font-mono font-black bg-black/50 px-2.5 py-1 rounded-full border border-white/10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {settings.prayerMethod} • {settings.prayerMadhhab === 'Hanafi' ? 'Hanafi' : 'Standard'}
          </span>
        </div>

        <button
          onClick={() => setIsAdhanMuted(!isAdhanMuted)}
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-white/20 bg-black/50 hover:bg-black/70 hover:border-white/40 transition-all text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
          title={isAdhanMuted ? "Enable chime" : "Mute chime"}
        >
          {isAdhanMuted ? (
            <>
              <BellOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[9px] font-mono uppercase font-black text-rose-200">Muted</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono uppercase font-black text-emerald-200">Active</span>
            </>
          )}
        </button>
      </div>

      {/* Main Body - Beautifully Balanced Circular Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 my-4 items-center justify-items-center relative z-10">
        
        {/* Left Side: Detail metadata */}
        <div className="flex flex-col items-center sm:items-start lg:items-center xl:items-start text-center sm:text-left lg:text-center xl:text-left w-full max-w-[200px]">
          <div className="label text-white/70 font-mono text-[10px] tracking-widest mb-1.5 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">Operational Node</div>
          <div className="flex items-center gap-3 bg-black/45 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl w-full">
            <div className="p-1.5 bg-white/10 rounded-xl">
              {getPrayerIcon(prayer)}
            </div>
            <div className="text-left">
              <h3 className="font-sans text-xl font-black text-white uppercase tracking-wider leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                {prayer}
              </h3>
              <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest mt-1 block">Active Interval</span>
            </div>
          </div>
          
          <div className="mt-3.5 space-y-2 w-full text-xs text-white/90 font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-4 bg-black/45 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-white/70">
                <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                <span>Started</span>
              </div>
              <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded text-[11px]">{formatTimeHM(startTime)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-black/45 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-white/70">
                <Sunset className="w-3.5 h-3.5 text-rose-400" />
                <span>Target</span>
              </div>
              <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded text-[11px]">{formatTimeHM(endTime)}</span>
            </div>
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
              className="text-white/10"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Glowing progress ring segment */}
            <circle
              cx="80"
              cy="80"
              r={radius + 8}
              className="transition-all duration-1000"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * (radius + 8)}
              strokeDashoffset={2 * Math.PI * (radius + 8) - (progress / 100) * (2 * Math.PI * (radius + 8))}
              strokeLinecap="round"
              stroke={
                prayer === 'Asr' || prayer === 'Fajr' ? '#fbbf24' :
                prayer === 'Maghrib' ? '#f43f5e' :
                prayer === 'Isha' || prayer === 'Tahajjud' ? '#60a5fa' : '#34d399'
              }
              fill="transparent"
            />
          </svg>

          {/* Core display inside ring with glass overlay to contrast perfectly with the building lights */}
          <div className="absolute inset-2 bg-black/45 backdrop-blur-[3px] rounded-full flex flex-col items-center justify-center border border-white/10 shadow-inner">
            <span className="text-[9px] text-white/70 font-mono tracking-widest uppercase font-black drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)]">
              {type === 'CURRENT' ? 'REMAINING' : 'STARTS IN'}
            </span>
            <span className="digital-font text-2xl md:text-3xl font-black text-white tracking-widest my-0.5 select-none drop-shadow-[0_3px_8px_rgba(0,0,0,0.99)]">
              {formatDuration(timeRemainingMs)}
            </span>
            <span className="text-[9px] text-white/90 font-mono font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
              {Math.round(progress)}% DONE
            </span>
          </div>
        </div>

        {/* Right Side: Progress Bar details */}
        <div className="flex flex-col items-center sm:items-end lg:items-center xl:items-end text-center sm:text-right lg:text-center xl:text-right w-full sm:w-auto lg:w-full xl:w-auto">
          <span className="label text-white/70 font-mono text-[10px] tracking-widest mb-1.5 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">State Progress</span>
          <div className="w-44 bg-black/50 rounded-full h-2 overflow-hidden border border-white/15 mb-3 shadow-inner relative">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                prayer === 'Asr' || prayer === 'Fajr' ? 'bg-amber-400' :
                prayer === 'Maghrib' ? 'bg-rose-400' :
                prayer === 'Isha' || prayer === 'Tahajjud' ? 'bg-blue-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-white/90 font-mono space-y-2 w-full max-w-[200px]">
            <div className="flex items-center justify-between gap-4 bg-black/45 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span className="text-white/70">Next Event</span>
              <span className="text-white font-black bg-white/10 px-1.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                {prayer === 'Isha' ? 'Tahajjud' : prayer === 'Tahajjud' ? 'Fajr' : prayer === 'Fajr' ? 'Dhuhr' : prayer === 'Dhuhr' ? 'Asr' : prayer === 'Asr' ? 'Maghrib' : 'Isha'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest text-emerald-300 font-black animate-pulse shadow-md">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              Calculations live
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Testing Control Panel inside card */}
      <div className="mt-2 border-t border-white/15 pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 relative z-10 text-[10px] text-white font-mono font-bold drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-1.5 bg-black/45 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] uppercase tracking-wider text-white">Continuous Automatic Sequence State: Running</span>
        </div>
        <button
          onClick={playNotificationChime}
          className="flex items-center gap-1.5 text-white hover:bg-white/15 px-3 py-1 rounded-full border border-white/20 bg-black/45 backdrop-blur-sm transition-all text-[9px] font-black uppercase tracking-wider drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
        >
          <Volume2 className="w-3.5 h-3.5 text-white" />
          Test Operational Chime
        </button>
      </div>
    </div>
  );
};
export default SmartPrayerCard;

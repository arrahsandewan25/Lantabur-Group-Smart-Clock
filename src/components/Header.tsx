import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Globe, Cpu, Wifi } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, currentTime } = useDashboard();

  // Helper to format dates gracefully
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to calculate week number
  const getWeekNumber = (date: Date) => {
    const tempDate = new Date(date.getTime());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((tempDate.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  };

  const getThemeColorGlow = () => {
    switch (settings.themeColor) {
      case 'cyan': return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]';
      case 'emerald': return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]';
      case 'purple': return 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]';
      case 'pink': return 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]';
      case 'amber': return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      default: return 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]';
    }
  };

  return (
    <header className="w-full glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
      {/* Decorative top lighting element */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-80 ${
        settings.themeColor === 'cyan' ? 'text-cyan-400' :
        settings.themeColor === 'emerald' ? 'text-emerald-400' :
        settings.themeColor === 'purple' ? 'text-purple-400' :
        settings.themeColor === 'pink' ? 'text-pink-400' :
        settings.themeColor === 'amber' ? 'text-amber-400' : 'text-blue-400'
      }`}></div>

      {/* Brand & Slogan */}
      <div className="flex items-center gap-4 self-start md:self-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-pulse"></div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8CC0EB] via-[#BFDDF0] to-[#FFEBCC] border border-white/30 flex items-center justify-center relative overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Lantabur" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <Cpu className={`w-7 h-7 ${getThemeColorGlow()}`} />
            )}
          </div>
        </div>

        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-white tracking-wide uppercase flex items-center gap-2">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="" className="w-6 h-6 object-contain inline-block mr-1 rounded" referrerPolicy="no-referrer" />
            )}
            {settings.companyName}
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-mono font-normal tracking-normal text-white/70">
              OPERATIONS
            </span>
          </h1>
          {settings.slogan && (
            <p className="text-xs text-slate-400 font-sans tracking-wider mt-0.5 max-w-sm truncate">
              {settings.slogan}
            </p>
          )}
        </div>
      </div>

      {/* Center Shift Node */}
      <div className="flex items-center gap-6 glass-panel py-2 px-4 rounded-xl border border-white/5 bg-slate-950/20">
        <div className="text-left">
          <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-widest">Department</span>
          <span className="text-xs font-semibold text-white tracking-wide">{settings.departmentName}</span>
        </div>
        <div className="h-6 w-[1px] bg-white/10"></div>
        <div className="text-left">
          <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-widest">Active Shift</span>
          <span className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
            settings.shift.toLowerCase().includes('day') ? 'text-amber-400' : 'text-indigo-300'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
            {settings.shift}
          </span>
        </div>
      </div>

      {/* Live Date, Week and Systems Status */}
      <div className="flex flex-col items-end gap-1.5 self-end md:self-auto text-right">
        <div className="text-sm font-semibold text-slate-200 tracking-wide font-sans">
          {formatDate(currentTime)}
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Week {getWeekNumber(currentTime)}</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold tracking-wide">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            SYSTEM SECURE
          </span>
        </div>
      </div>
    </header>
  );
};
export default Header;

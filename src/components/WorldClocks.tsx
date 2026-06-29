import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Sun, Moon, CloudRain, CloudSun, Compass, Thermometer } from 'lucide-react';

export const WorldClocks: React.FC = () => {
  const { settings, currentTime } = useDashboard();

  if (!settings.widgetVisibility.clocks) return null;

  // Helper to get local time parts
  const getLocalTimeParts = (timezone: string) => {
    try {
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(currentTime);

      const [time, period] = timeStr.split(' ');
      const [h, m, s] = time.split(':');

      const dateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(currentTime);

      const tzOffsetStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'shortOffset',
      }).format(currentTime);
      const tzOffset = tzOffsetStr.split(',')[1]?.trim() || tzOffsetStr.split(' ').pop() || '';

      const hour24 = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          hour12: false,
        }).format(currentTime),
        10
      );

      const isNight = hour24 < 6 || hour24 > 18;

      return {
        time: `${h}:${m}`,
        seconds: s,
        ampm: period,
        date: dateStr,
        offset: tzOffset,
        isNight,
        hour24
      };
    } catch (e) {
      console.error(`Error formatting time for ${timezone}`, e);
      return {
        time: '00:00',
        seconds: '00',
        ampm: 'AM',
        date: 'N/A',
        offset: 'UTC',
        isNight: false,
        hour24: 12
      };
    }
  };

  const getWeatherIcon = (condition: string, isNight: boolean) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return isNight ? <Moon className="w-5 h-5 text-indigo-300" /> : <Sun className="w-5 h-5 text-amber-400" />;
      case 'rainy':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      default:
        return <CloudSun className="w-5 h-5 text-slate-400" />;
    }
  };

  const getThemeGlow = () => {
    switch (settings.themeColor) {
      case 'cyan': return 'hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-500/20';
      case 'emerald': return 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/20';
      case 'purple': return 'hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/20';
      case 'pink': return 'hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:border-pink-500/20';
      case 'amber': return 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/20';
      default: return 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/20';
    }
  };

  return (
    <section className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
        <h2 className="text-xs font-display font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-cyan-400" />
          Global Operations Clocks
        </h2>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          Continuous Live Ticker (UTC Sync)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {settings.cities.map((city) => {
          const { time, seconds, ampm, date, offset, isNight } = getLocalTimeParts(city.timezone);

          return (
            <div
              key={city.id}
              className="glass-panel rounded-xl p-2.5 flex flex-col items-center justify-center text-center relative overflow-hidden group border border-white/10"
              id={`world-clock-${city.name.toLowerCase()}`}
            >
              {/* Day/Night subtle background blur glow */}
              <div className={`absolute -bottom-6 -right-6 w-12 h-12 rounded-full filter blur-lg opacity-10 pointer-events-none transition-all duration-1000 ${
                isNight ? 'bg-indigo-500' : 'bg-amber-500'
              }`}></div>

              {/* Title & Flag using High Density .label style */}
              <div className="label text-slate-300 text-[10px] font-bold tracking-wider flex items-center gap-1.5 justify-center mb-1 select-none">
                <span className="text-xs">{city.flag}</span>
                <span>{city.name}</span>
              </div>

              {/* Large Digital Clock Display */}
              <div className="digital-font text-lg md:text-xl font-bold tracking-tight text-white leading-none my-1 select-none">
                {time}<span className="text-slate-400 text-sm font-semibold">:{seconds}</span>
              </div>

              {/* Period & Timezone Offset */}
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                <span className="text-slate-400 font-semibold">{ampm}</span> • {offset}
              </div>

              {/* Small high density operations weather stats */}
              <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-mono mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {getWeatherIcon(city.weatherCondition, isNight)}
                <span>{city.tempOffset}°C</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
export default WorldClocks;

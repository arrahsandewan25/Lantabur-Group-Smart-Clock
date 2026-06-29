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

  const getWeatherIcon = (condition: string, isNight: boolean, iconColorClass: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return isNight ? <Moon className={`w-4 h-4 md:w-5 h-5 lg:w-6 h-6 ${iconColorClass}`} /> : <Sun className={`w-4 h-4 md:w-5 h-5 lg:w-6 h-6 ${iconColorClass}`} />;
      case 'rainy':
        return <CloudRain className={`w-4 h-4 md:w-5 h-5 lg:w-6 h-6 ${iconColorClass}`} />;
      default:
        return <CloudSun className={`w-4 h-4 md:w-5 h-5 lg:w-6 h-6 ${iconColorClass}`} />;
    }
  };

  const getCityStyle = (index: number) => {
    if (index % 2 === 0) {
      return {
        cardBg: 'bg-gradient-to-br from-amber-50 via-amber-100/80 to-yellow-150',
        border: 'border-amber-300/90 shadow-[0_8px_20px_rgba(245,158,11,0.12)]',
        textCity: 'text-amber-900 font-extrabold text-xs md:text-sm lg:text-base uppercase tracking-wider',
        textTime: 'text-amber-950 font-black',
        textSec: 'text-amber-600 font-bold',
        textSub: 'text-amber-800 font-bold text-[10px] md:text-xs lg:text-sm',
        glow: 'hover:shadow-[0_15px_35px_rgba(245,158,11,0.35)] hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-amber-600'
      };
    } else {
      return {
        cardBg: 'bg-gradient-to-br from-orange-50 via-orange-100/80 to-amber-150',
        border: 'border-orange-300/80 shadow-[0_8px_20px_rgba(249,115,22,0.12)]',
        textCity: 'text-orange-900 font-extrabold text-xs md:text-sm lg:text-base uppercase tracking-wider',
        textTime: 'text-orange-950 font-black',
        textSec: 'text-orange-600 font-bold',
        textSub: 'text-orange-800 font-bold text-[10px] md:text-xs lg:text-sm',
        glow: 'hover:shadow-[0_15px_35px_rgba(249,115,22,0.35)] hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-orange-600'
      };
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
    <section className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h2 className="text-sm font-display font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          Global Operations Clocks
        </h2>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Continuous Live Ticker (UTC Sync)
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
        {settings.cities.map((city, index) => {
          const { time, seconds, ampm, date, offset, isNight } = getLocalTimeParts(city.timezone);
          const styles = getCityStyle(index);

          return (
            <div
              key={city.id}
              className={`rounded-2xl p-4 md:p-6 lg:p-7 flex flex-col items-center justify-center text-center relative overflow-hidden group border transition-all duration-300 ${styles.cardBg} ${styles.border} ${styles.glow} min-h-[150px] md:min-h-[170px] lg:min-h-[190px]`}
              id={`world-clock-${city.name.toLowerCase()}`}
            >
              {/* Subtle warm ambient background blur glow */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full filter blur-xl opacity-30 pointer-events-none transition-all duration-1000 bg-amber-400/40"></div>

              {/* Title & Flag */}
              <div className={`flex items-center gap-2 justify-center mb-2 select-none ${styles.textCity}`}>
                <span className="text-base md:text-lg lg:text-xl">{city.flag}</span>
                <span className="font-extrabold tracking-widest">{city.name}</span>
              </div>

              {/* Large Digital Clock Display */}
              <div className={`digital-font text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-none my-2 select-none ${styles.textTime}`}>
                {time}<span className={`text-sm md:text-base lg:text-lg xl:text-xl font-bold ml-0.5 ${styles.textSec}`}>:{seconds}</span>
              </div>

              {/* Period & Timezone Offset */}
              <div className={`font-mono uppercase tracking-wider ${styles.textSub} mb-2`}>
                <span className="font-extrabold">{ampm}</span> • {offset}
              </div>

              {/* Weather Stats */}
              <div className={`flex items-center gap-2 font-mono ${styles.textSub} opacity-90 group-hover:opacity-100 transition-opacity`}>
                {getWeatherIcon(city.weatherCondition, isNight, styles.iconColor)}
                <span className="font-bold">{city.tempOffset}°C</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
export default WorldClocks;

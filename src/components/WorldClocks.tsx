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
        return isNight ? <Moon className={`w-4 h-4 ${iconColorClass}`} /> : <Sun className={`w-4 h-4 ${iconColorClass}`} />;
      case 'rainy':
        return <CloudRain className={`w-4 h-4 ${iconColorClass}`} />;
      default:
        return <CloudSun className={`w-4 h-4 ${iconColorClass}`} />;
    }
  };

  const getCityStyle = (cityName: string) => {
    const name = cityName.toLowerCase();
    if (name.includes('dhaka')) {
      return {
        cardBg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
        border: 'border-amber-300',
        textCity: 'text-amber-900 font-extrabold',
        textTime: 'text-amber-950 font-black',
        textSec: 'text-amber-600 font-bold',
        textSub: 'text-amber-800 font-medium',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)]',
        iconColor: 'text-amber-600'
      };
    }
    if (name.includes('makkah')) {
      return {
        cardBg: 'bg-gradient-to-br from-orange-50 to-amber-100',
        border: 'border-orange-300/60',
        textCity: 'text-orange-900 font-extrabold',
        textTime: 'text-orange-950 font-black',
        textSec: 'text-orange-600 font-bold',
        textSub: 'text-orange-800 font-medium',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:shadow-[0_0_25px_rgba(249,115,22,0.45)]',
        iconColor: 'text-orange-600'
      };
    }
    if (name.includes('dubai')) {
      return {
        cardBg: 'bg-gradient-to-br from-yellow-50 to-orange-100',
        border: 'border-orange-300/60',
        textCity: 'text-amber-900 font-extrabold',
        textTime: 'text-amber-950 font-black',
        textSec: 'text-amber-600 font-bold',
        textSub: 'text-amber-800 font-medium',
        glow: 'shadow-[0_0_15px_rgba(217,119,6,0.25)] hover:shadow-[0_0_25px_rgba(217,119,6,0.45)]',
        iconColor: 'text-amber-600'
      };
    }
    if (name.includes('london')) {
      return {
        cardBg: 'bg-gradient-to-br from-red-50 to-rose-100',
        border: 'border-rose-300/60',
        textCity: 'text-rose-900 font-extrabold',
        textTime: 'text-rose-950 font-black',
        textSec: 'text-rose-600 font-bold',
        textSub: 'text-rose-800 font-medium',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)] hover:shadow-[0_0_25px_rgba(244,63,94,0.45)]',
        iconColor: 'text-rose-600'
      };
    }
    if (name.includes('berlin')) {
      return {
        cardBg: 'bg-gradient-to-br from-orange-50 to-red-100',
        border: 'border-orange-200',
        textCity: 'text-orange-900 font-extrabold',
        textTime: 'text-orange-950 font-black',
        textSec: 'text-orange-600 font-bold',
        textSub: 'text-orange-800 font-medium',
        glow: 'shadow-[0_0_15px_rgba(234,88,12,0.25)] hover:shadow-[0_0_25px_rgba(234,88,12,0.45)]',
        iconColor: 'text-orange-600'
      };
    }
    if (name.includes('york')) {
      return {
        cardBg: 'bg-gradient-to-br from-rose-50 to-amber-100',
        border: 'border-rose-200',
        textCity: 'text-rose-950 font-extrabold',
        textTime: 'text-rose-900 font-black',
        textSec: 'text-rose-600 font-bold',
        textSub: 'text-rose-800 font-medium',
        glow: 'shadow-[0_0_15px_rgba(225,29,72,0.25)] hover:shadow-[0_0_25px_rgba(225,29,72,0.45)]',
        iconColor: 'text-rose-600'
      };
    }
    if (name.includes('tokyo')) {
      return {
        cardBg: 'bg-gradient-to-br from-pink-50 to-rose-100',
        border: 'border-pink-300/60',
        textCity: 'text-pink-900 font-extrabold',
        textTime: 'text-pink-950 font-black',
        textSec: 'text-pink-600 font-bold',
        textSub: 'text-pink-800 font-medium',
        glow: 'shadow-[0_0_15px_rgba(236,72,153,0.25)] hover:shadow-[0_0_25px_rgba(236,72,153,0.45)]',
        iconColor: 'text-pink-600'
      };
    }
    if (name.includes('beijing')) {
      return {
        cardBg: 'bg-gradient-to-br from-yellow-50 to-orange-100',
        border: 'border-orange-400/60',
        textCity: 'text-orange-950 font-extrabold',
        textTime: 'text-amber-950 font-black',
        textSec: 'text-orange-700 font-bold',
        textSub: 'text-orange-900 font-medium',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]',
        iconColor: 'text-orange-700'
      };
    }
    return {
      cardBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-200',
      textCity: 'text-amber-900 font-extrabold',
      textTime: 'text-amber-950 font-black',
      textSec: 'text-amber-600 font-bold',
      textSub: 'text-amber-800 font-medium',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      iconColor: 'text-amber-600'
    };
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
          const styles = getCityStyle(city.name);

          return (
            <div
              key={city.id}
              className={`rounded-xl p-2.5 flex flex-col items-center justify-center text-center relative overflow-hidden group border transition-all duration-300 ${styles.cardBg} ${styles.border} ${styles.glow}`}
              id={`world-clock-${city.name.toLowerCase()}`}
            >
              {/* Subtle light/warm background glow */}
              <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full filter blur-lg opacity-25 pointer-events-none transition-all duration-1000 bg-amber-400/30"></div>

              {/* Title & Flag */}
              <div className={`text-[10px] font-bold tracking-wider flex items-center gap-1.5 justify-center mb-1 select-none ${styles.textCity}`}>
                <span className="text-xs">{city.flag}</span>
                <span>{city.name}</span>
              </div>

              {/* Large Digital Clock Display */}
              <div className={`digital-font text-lg md:text-xl font-bold tracking-tight leading-none my-1 select-none ${styles.textTime}`}>
                {time}<span className={`text-xs font-semibold ${styles.textSec}`}>:{seconds}</span>
              </div>

              {/* Period & Timezone Offset */}
              <div className={`text-[9px] font-mono uppercase tracking-wider ${styles.textSub}`}>
                <span className="font-bold">{ampm}</span> • {offset}
              </div>

              {/* Weather Stats */}
              <div className={`flex items-center gap-1.5 text-[8px] font-mono mt-1 ${styles.textSub}`}>
                {getWeatherIcon(city.weatherCondition, isNight, styles.iconColor)}
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

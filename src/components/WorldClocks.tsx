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

  const CITY_BACKGROUNDS: Record<string, string> = {
    'dhaka': '/Dhaka.jpg',
    'makkah': '/Makkah.jpg',
    'dubai': '/Dubai.jpg',
    'london': '/London.jpg',
    'berlin': '/Berlin.jpg',
    'new york': '/New%20York.jpg'
  };

  const getCityTheme = (cityName: string) => {
    const name = cityName.toLowerCase();
    const bg = CITY_BACKGROUNDS[name] || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=85&w=1920';
    
    if (name.includes('makkah')) {
      return {
        bg,
        border: 'border-amber-500/20 shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
        textCity: 'text-amber-100 font-extrabold text-sm md:text-base uppercase tracking-widest',
        textTime: 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] font-black',
        textSec: 'text-amber-500 font-bold',
        textSub: 'text-amber-200/80 font-mono text-xs',
        glow: 'hover:shadow-[0_15px_40px_rgba(245,158,11,0.35)] hover:border-amber-400/50 hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-amber-400'
      };
    }
    if (name.includes('dhaka')) {
      return {
        bg,
        border: 'border-cyan-500/20 shadow-[0_8px_30px_rgba(6,182,212,0.15)]',
        textCity: 'text-cyan-100 font-extrabold text-sm md:text-base uppercase tracking-widest',
        textTime: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] font-black',
        textSec: 'text-cyan-500 font-bold',
        textSub: 'text-cyan-200/80 font-mono text-xs',
        glow: 'hover:shadow-[0_15px_40px_rgba(6,182,212,0.35)] hover:border-cyan-400/50 hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-cyan-400'
      };
    }
    if (name.includes('dubai')) {
      return {
        bg,
        border: 'border-orange-500/20 shadow-[0_8px_30px_rgba(249,115,22,0.15)]',
        textCity: 'text-orange-100 font-extrabold text-sm md:text-base uppercase tracking-widest',
        textTime: 'text-orange-300 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)] font-black',
        textSec: 'text-orange-500 font-bold',
        textSub: 'text-orange-200/80 font-mono text-xs',
        glow: 'hover:shadow-[0_15px_40px_rgba(249,115,22,0.35)] hover:border-orange-400/50 hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-orange-400'
      };
    }
    if (name.includes('london')) {
      return {
        bg,
        border: 'border-blue-500/20 shadow-[0_8px_30px_rgba(59,130,246,0.15)]',
        textCity: 'text-blue-100 font-extrabold text-sm md:text-base uppercase tracking-widest',
        textTime: 'text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] font-black',
        textSec: 'text-blue-500 font-bold',
        textSub: 'text-blue-200/80 font-mono text-xs',
        glow: 'hover:shadow-[0_15px_40px_rgba(59,130,246,0.35)] hover:border-blue-400/50 hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-blue-400'
      };
    }
    if (name.includes('berlin')) {
      return {
        bg,
        border: 'border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
        textCity: 'text-emerald-100 font-extrabold text-sm md:text-base uppercase tracking-widest',
        textTime: 'text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)] font-black',
        textSec: 'text-emerald-500 font-bold',
        textSub: 'text-emerald-200/80 font-mono text-xs',
        glow: 'hover:shadow-[0_15px_40px_rgba(16,185,129,0.35)] hover:border-emerald-400/50 hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-emerald-400'
      };
    }
    if (name.includes('new york')) {
      return {
        bg,
        border: 'border-rose-500/20 shadow-[0_8px_30px_rgba(244,63,94,0.15)]',
        textCity: 'text-rose-100 font-extrabold text-sm md:text-base uppercase tracking-widest',
        textTime: 'text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] font-black',
        textSec: 'text-rose-500 font-bold',
        textSub: 'text-rose-200/80 font-mono text-xs',
        glow: 'hover:shadow-[0_15px_40px_rgba(244,63,94,0.35)] hover:border-rose-400/50 hover:scale-[1.03] transform transition-all duration-300',
        iconColor: 'text-rose-400'
      };
    }
    return {
      bg,
      border: 'border-white/10 shadow-[0_8px_30px_rgba(255,255,255,0.05)]',
      textCity: 'text-slate-100 font-extrabold text-sm md:text-base uppercase tracking-widest',
      textTime: 'text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] font-black',
      textSec: 'text-slate-400 font-bold',
      textSub: 'text-slate-300/80 font-mono text-xs',
      glow: 'hover:shadow-[0_15px_40px_rgba(255,255,255,0.15)] hover:border-white/30 hover:scale-[1.03] transform transition-all duration-300',
      iconColor: 'text-slate-300'
    };
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {settings.cities.map((city, index) => {
          const { time, seconds, ampm, date, offset, isNight } = getLocalTimeParts(city.timezone);
          const styles = getCityTheme(city.name);

          return (
            <div
              key={city.id}
              className={`rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group border transition-all duration-300 ${styles.border} ${styles.glow} min-h-[170px] md:min-h-[190px] lg:min-h-[210px]`}
              id={`world-clock-${city.name.toLowerCase()}`}
            >
              {/* Ultra High Resolution City Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 pointer-events-none"
                style={{ backgroundImage: `url('${styles.bg}')` }}
              />
              
              {/* Elegant dark semi-transparent glassmorphism gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/40 group-hover:from-slate-950/90 group-hover:via-slate-950/50 group-hover:to-slate-950/45 transition-colors duration-300 pointer-events-none" />

              {/* Title & Flag */}
              <div className={`flex items-center gap-2.5 justify-center mb-2.5 select-none ${styles.textCity} relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}>
                <span className="text-xl md:text-2xl">{city.flag}</span>
                <span className="font-extrabold tracking-widest text-sm md:text-base uppercase">{city.name}</span>
              </div>

              {/* Large Digital Clock Display */}
              <div className={`digital-font text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-none my-3 select-none ${styles.textTime} relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}>
                {time}<span className={`text-base md:text-lg lg:text-xl font-bold ml-1 ${styles.textSec} drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}>:{seconds}</span>
              </div>

              {/* Period & Timezone Offset */}
              <div className={`font-mono uppercase tracking-wider ${styles.textSub} mb-2.5 text-xs relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}>
                <span className="font-extrabold">{ampm}</span> • {offset} • <span className="text-[10px]">{date}</span>
              </div>

              {/* Weather Stats */}
              <div className={`flex items-center gap-2 font-mono ${styles.textSub} opacity-95 group-hover:opacity-100 transition-opacity text-xs md:text-sm relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}>
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

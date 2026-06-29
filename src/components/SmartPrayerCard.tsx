import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { calculateTodayPrayers } from '../utils/prayerCalc';
import { Sparkles, Sunrise, Sun, Sunset, Moon, Clock } from 'lucide-react';

export const SmartPrayerCard: React.FC = () => {
  const { settings, currentTime } = useDashboard();
  const [imageMetrics, setImageMetrics] = useState({
    avgBrightness: 50,
    dominantColor: 'rgba(15, 23, 42, 0.85)',
    adaptiveOverlayOpacity: 0.85
  });

  // Dynamic image extraction for backing glassmorphism harmony
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 10, 10);
          const imgData = ctx.getImageData(0, 0, 10, 10).data;
          let rSum = 0, gSum = 0, bSum = 0;
          for (let i = 0; i < imgData.length; i += 4) {
            rSum += imgData[i];
            gSum += imgData[i+1];
            bSum += imgData[i+2];
          }
          const numPixels = imgData.length / 4;
          const rAvg = Math.round(rSum / numPixels);
          const gAvg = Math.round(gSum / numPixels);
          const bAvg = Math.round(bSum / numPixels);
          
          const brightness = 0.2126 * rAvg + 0.7152 * gAvg + 0.0722 * bAvg;
          const adaptiveOverlayOpacity = Math.max(0.65, Math.min(0.95, brightness / 255 + 0.35));
          const dominantColor = `rgba(${Math.max(10, Math.min(rAvg, 30))}, ${Math.max(10, Math.min(gAvg, 30))}, ${Math.max(15, Math.min(bAvg, 45))}, ${adaptiveOverlayOpacity})`;
          
          setImageMetrics({
            avgBrightness: brightness,
            dominantColor,
            adaptiveOverlayOpacity
          });
        }
      } catch (e) {
        console.error('Error in dynamic background image analysis:', e);
      }
    };
    img.src = '/Prayer Block.jpg';
  }, []);

  if (!settings.widgetVisibility.prayerCard) return null;

  // Calculate current prayer and next prayer dynamically
  const periods = calculateTodayPrayers(currentTime, settings.prayerMethod, settings.prayerMadhhab);

  // Check if any prayer is active now
  let currentPeriod = periods.find((p) => currentTime >= p.startTime && currentTime <= p.endTime);
  let nextPeriod;

  if (currentPeriod) {
    const currentIndex = periods.indexOf(currentPeriod);
    if (currentIndex < periods.length - 1) {
      nextPeriod = periods[currentIndex + 1];
    } else {
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPeriods = calculateTodayPrayers(tomorrow, settings.prayerMethod, settings.prayerMadhhab);
      nextPeriod = tomorrowPeriods[0];
    }
  } else {
    // We are in a gap. Next prayer is the first one starting in the future
    nextPeriod = periods.find((p) => p.startTime > currentTime);
    if (!nextPeriod) {
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPeriods = calculateTodayPrayers(tomorrow, settings.prayerMethod, settings.prayerMadhhab);
      nextPeriod = tomorrowPeriods[0];
    }

    // Current/Last prayer is the one that just ended
    const passed = periods.filter((p) => p.endTime < currentTime);
    if (passed.length > 0) {
      currentPeriod = passed[passed.length - 1];
    } else {
      const yesterday = new Date(currentTime);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayPeriods = calculateTodayPrayers(yesterday, settings.prayerMethod, settings.prayerMadhhab);
      currentPeriod = yesterdayPeriods[yesterdayPeriods.length - 1];
    }
  }

  const formatTimeHM = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getPrayerIcon = (name: string) => {
    switch (name) {
      case 'Tahajjud': return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'Fajr': return <Sunrise className="w-5 h-5 text-amber-400" />;
      case 'Dhuhr': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'Asr': return <Sun className="w-5 h-5 text-cyan-400" />;
      case 'Maghrib': return <Sunset className="w-5 h-5 text-rose-400" />;
      case 'Isha': return <Moon className="w-5 h-5 text-blue-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const shadowStyle = { textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)' };

  return (
    <div
      className="bg-slate-950/45 border-slate-800/40 backdrop-blur-md rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-around transition-all duration-700 text-white shadow-2xl h-full min-h-[220px]"
      id="smart-prayer-card"
    >
      {/* Premium Al-Masjid an-Nabawi Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out pointer-events-none scale-100 opacity-95"
        style={{ backgroundImage: `url('/Prayer Block.jpg')` }}
      />
      
      {/* Dynamic harmony overlay tinted with the dominant tone extracted from image */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none" 
        style={{ backgroundColor: imageMetrics.dominantColor }}
      />
      
      {/* High-contrast smart gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80 pointer-events-none" />

      {/* Current Prayer Block */}
      <div className="relative z-10 flex flex-col justify-center py-2 border-b border-white/10">
        <span style={shadowStyle} className="text-[10px] font-mono tracking-widest text-[#F8E8C0] font-black uppercase mb-1">
          Current Prayer
        </span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPrayerIcon(currentPeriod.name)}
            <span style={shadowStyle} className="font-sans text-2xl font-black text-cyan-400 tracking-wider uppercase">
              {currentPeriod.name}
            </span>
          </div>
          <span style={shadowStyle} className="font-mono text-lg font-extrabold text-slate-100 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
            {formatTimeHM(currentPeriod.startTime)}
          </span>
        </div>
      </div>

      {/* Next Prayer Block */}
      <div className="relative z-10 flex flex-col justify-center py-2 pt-3">
        <span style={shadowStyle} className="text-[10px] font-mono tracking-widest text-[#F8E8C0] font-black uppercase mb-1">
          Next Prayer
        </span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPrayerIcon(nextPeriod.name)}
            <span style={shadowStyle} className="font-sans text-2xl font-black text-cyan-400 tracking-wider uppercase">
              {nextPeriod.name}
            </span>
          </div>
          <span style={shadowStyle} className="font-mono text-lg font-extrabold text-slate-100 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
            {formatTimeHM(nextPeriod.startTime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SmartPrayerCard;

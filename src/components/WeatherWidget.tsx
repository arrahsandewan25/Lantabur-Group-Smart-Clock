import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CloudSun, Thermometer, Droplets, Wind, CloudRain, Sun, Compass } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const { settings } = useDashboard();
  const [weatherData, setWeatherData] = useState({
    temp: 31,
    feelsLike: 35,
    humidity: 72,
    wind: 12,
    rainChance: 15,
    uvIndex: 8, // Very High
    sunrise: '05:46 AM',
    sunset: '06:47 PM'
  });

  // Simulate periodic refreshing (e.g., standard interval mimicking an API refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      // Add minor fluctuations to make the telemetry feel alive and live
      setWeatherData((prev) => ({
        ...prev,
        temp: Math.min(36, Math.max(28, prev.temp + (Math.random() > 0.5 ? 0.2 : -0.2))),
        feelsLike: Math.min(41, Math.max(30, prev.feelsLike + (Math.random() > 0.5 ? 0.3 : -0.3))),
        humidity: Math.min(90, Math.max(50, prev.humidity + Math.floor(Math.random() * 3 - 1))),
        wind: Math.min(20, Math.max(5, prev.wind + Math.floor(Math.random() * 2 - 1))),
      }));
    }, 15000); // Live fluctuation every 15 seconds for UI interest
    return () => clearInterval(interval);
  }, []);

  if (!settings.widgetVisibility.weather) return null;

  const getUVRating = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400 border-emerald-400/20' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-yellow-400 border-yellow-400/20' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400 border-orange-400/20' };
    return { text: 'Very High', color: 'text-rose-400 border-rose-400/20' };
  };

  const uvRating = getUVRating(weatherData.uvIndex);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-full relative overflow-hidden" id="weather-widget">
      {/* Dynamic atmospheric glow background */}
      <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <CloudSun className="w-4 h-4 text-cyan-400" />
            Base Weather Station
          </h3>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">Primary Node: Dhaka Operations Base</p>
        </div>
        <span className="text-[9px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono font-semibold">
          LIVE TELEMETRY
        </span>
      </div>

      {/* Main Temperature & Conditions */}
      <div className="grid grid-cols-2 gap-4 my-4 items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-md"></div>
            <Sun className="w-14 h-14 text-yellow-400 animate-spin-slow drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
          </div>
          <div>
            <div className="font-mono text-4xl font-extrabold text-white leading-none tracking-tighter flex">
              {weatherData.temp.toFixed(1)}
              <span className="text-cyan-400 text-2xl font-semibold">°C</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Sunny & Clear</span>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Feels Like</span>
          <span className="text-lg font-mono font-semibold text-white">{weatherData.feelsLike.toFixed(1)}°C</span>
          <span className="text-[9px] text-slate-400 font-mono">Heat Index: Stable</span>
        </div>
      </div>

      {/* Core Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-b border-white/5 py-4 my-2">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">Humidity</span>
            <span className="font-mono text-xs font-bold text-white">{weatherData.humidity}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">Wind</span>
            <span className="font-mono text-xs font-bold text-white">{weatherData.wind} km/h</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">Precipitation</span>
            <span className="font-mono text-xs font-bold text-white">{weatherData.rainChance}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">UV Index</span>
            <span className={`font-mono text-xs font-black ${uvRating.color}`}>
              {weatherData.uvIndex} ({uvRating.text})
            </span>
          </div>
        </div>
      </div>

      {/* Solar Transitions */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2">
        <span>🌅 Sunrise: <span className="text-slate-300 font-semibold">{weatherData.sunrise}</span></span>
        <span>🌇 Sunset: <span className="text-slate-300 font-semibold">{weatherData.sunset}</span></span>
      </div>
    </div>
  );
};
export default WeatherWidget;

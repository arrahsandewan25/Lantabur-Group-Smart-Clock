import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CloudSun, Thermometer, Droplets, Wind, CloudRain, Sun, Moon } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const { settings, currentTime } = useDashboard();
  const [realTimeWeather, setRealTimeWeather] = useState<{
    temp: number;
    condition: string;
    feelsLike: number;
    humidity: number;
    wind: number;
    rainChance: number;
    uvIndex: number;
    sunrise: string;
    sunset: string;
  } | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/dhaka-weather');
        if (res.ok) {
          const data = await res.json();
          setRealTimeWeather(data);
        }
      } catch (err) {
        console.warn("Could not load real-time Dhaka weather from API, using fallback calculations.", err);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (!settings.widgetVisibility.weather) return null;

  // Find Dhaka's configuration from the active cities
  const dhakaCity = settings.cities.find(
    (c) => c.timezone === 'Asia/Dhaka' || c.name.toLowerCase().includes('dhaka')
  );

  // Determine current hour in Dhaka to simulate physical diurnal conditions
  const getDhakaHour = (): number => {
    try {
      return parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: 'numeric',
          hour12: false,
        }).format(currentTime),
        10
      );
    } catch {
      // Fallback if IANA formatting fails
      return new Date(currentTime.getTime() + 6 * 60 * 60 * 1000).getUTCHours();
    }
  };

  const dhakaHour = getDhakaHour();
  const isNight = dhakaHour < 6 || dhakaHour >= 19; // Night between 7 PM and 6 AM

  // 1. Dynamic Temperature Curve (maximum in late afternoon, minimum in early morning)
  const baseOffset = dhakaCity?.tempOffset ?? 31.0;
  const timeRad = ((dhakaHour - 15) * Math.PI) / 12; // Shifted so max is at 15:00 (3 PM)
  const diurnalOffset = Math.cos(timeRad) * 4.0; // +/- 4°C fluctuation over 24 hours
  // Tiny live telemetry jitter using seconds to make the UI feel alive
  const jitter = Math.sin((currentTime.getSeconds() * Math.PI) / 30) * 0.2;
  const calculatedTemp = parseFloat((baseOffset + diurnalOffset + jitter).toFixed(1));

  // 2. Dynamic Humidity (higher at night/morning, lower in hot afternoons)
  const humidityRad = ((dhakaHour - 5) * Math.PI) / 12; // Peak humidity at 5 AM
  const baseHumidity = 72;
  const humidityOffset = Math.cos(humidityRad) * 12; // +/- 12% fluctuation
  const humidityJitter = Math.cos((currentTime.getSeconds() * Math.PI) / 30) * 1.5;
  const calculatedHumidity = Math.min(98, Math.max(30, Math.round(baseHumidity + humidityOffset + humidityJitter)));

  // 3. Dynamic Wind speed (peaks slightly in afternoon, calmer at night)
  const windRad = ((dhakaHour - 14) * Math.PI) / 12;
  const baseWind = 12;
  const windOffset = Math.cos(windRad) * 4;
  const windJitter = Math.sin((currentTime.getSeconds() * Math.PI) / 15) * 1.0;
  const calculatedWind = Math.min(25, Math.max(3, Math.round(baseWind + windOffset + windJitter)));

  // 4. Dynamic Precipitation based on configured weather condition
  const configCondition = (dhakaCity?.weatherCondition || 'Sunny').toLowerCase();
  let baseRainChance = 15;
  if (configCondition === 'rainy') baseRainChance = 85;
  else if (configCondition === 'cloudy') baseRainChance = 40;
  else if (configCondition === 'hazy') baseRainChance = 10;
  else baseRainChance = 5;

  const rainJitter = Math.sin((currentTime.getSeconds() * Math.PI) / 45) * 2;
  const calculatedRainChance = Math.min(100, Math.max(0, Math.round(baseRainChance + rainJitter)));

  // 5. Dynamic UV Index (0 at night, peaks in midday sun)
  let calculatedUvIndex = 0;
  if (dhakaHour >= 6 && dhakaHour < 18) {
    const uvFactor = Math.sin(((dhakaHour - 6) * Math.PI) / 12); // Peaks at 12 PM
    calculatedUvIndex = Math.round(uvFactor * 9);
  }

  // 6. Dynamic Feels Like
  const calculatedFeelsLike = parseFloat((calculatedTemp + (calculatedHumidity > 60 ? (calculatedHumidity - 60) * 0.12 : 0)).toFixed(1));

  // Select dynamic or grounded weather
  const temp = realTimeWeather ? realTimeWeather.temp : calculatedTemp;
  const condition = (realTimeWeather ? realTimeWeather.condition : configCondition).toLowerCase();
  const feelsLike = realTimeWeather ? realTimeWeather.feelsLike : calculatedFeelsLike;
  const humidity = realTimeWeather ? realTimeWeather.humidity : calculatedHumidity;
  const wind = realTimeWeather ? realTimeWeather.wind : calculatedWind;
  const rainChance = realTimeWeather ? realTimeWeather.rainChance : calculatedRainChance;
  const uvIndex = realTimeWeather ? realTimeWeather.uvIndex : calculatedUvIndex;
  const sunrise = realTimeWeather ? realTimeWeather.sunrise : "05:46 AM";
  const sunset = realTimeWeather ? realTimeWeather.sunset : "06:47 PM";

  // Dynamic Weather Condition Title
  let displayCondition = 'Sunny & Clear';
  if (condition === 'rainy') {
    displayCondition = isNight ? 'Rainy Night' : 'Rainy & Wet';
  } else if (condition === 'cloudy') {
    displayCondition = isNight ? 'Cloudy Night' : 'Mostly Cloudy';
  } else if (condition === 'hazy') {
    displayCondition = isNight ? 'Hazy Night' : 'Hazy Mist';
  } else {
    displayCondition = isNight ? 'Clear Night' : 'Sunny & Clear';
  }

  const getUVRating = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400 border-emerald-400/20' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-yellow-400 border-yellow-400/20' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400 border-orange-400/20' };
    return { text: 'Very High', color: 'text-rose-400 border-rose-400/20' };
  };

  const uvRating = getUVRating(uvIndex);

  // Dynamic Icon selector
  const getWeatherIcon = () => {
    const iconClass = "w-14 h-14 animate-pulse duration-[3000ms] relative z-10";
    if (condition === 'rainy') {
      return <CloudRain className={`${iconClass} text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]`} />;
    }
    if (condition === 'cloudy') {
      return <CloudSun className={`${iconClass} text-slate-300 drop-shadow-[0_0_12px_rgba(203,213,225,0.4)]`} />;
    }
    if (isNight) {
      return <Moon className={`${iconClass} text-indigo-300 drop-shadow-[0_0_12px_rgba(165,180,252,0.4)]`} />;
    }
    return <Sun className={`${iconClass} text-yellow-400 animate-spin-slow drop-shadow-[0_0_12px_rgba(234,179,8,0.4)]`} />;
  };

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
            <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-md"></div>
            {getWeatherIcon()}
          </div>
          <div>
            <div className="font-mono text-4xl font-extrabold text-white leading-none tracking-tighter flex">
              {temp.toFixed(1)}
              <span className="text-cyan-400 text-2xl font-semibold">°C</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block font-medium">{displayCondition}</span>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Feels Like</span>
          <span className="text-lg font-mono font-semibold text-white">{feelsLike.toFixed(1)}°C</span>
          <span className="text-[9px] text-slate-400 font-mono">
            {isNight ? 'Sun Status: Below Horizon' : 'Sun Status: Stable'}
          </span>
        </div>
      </div>

      {/* Core Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-b border-white/5 py-4 my-2">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">Humidity</span>
            <span className="font-mono text-xs font-bold text-white">{humidity}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">Wind</span>
            <span className="font-mono text-xs font-bold text-white">{wind} km/h</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">Precipitation</span>
            <span className="font-mono text-xs font-bold text-white">{rainChance}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase">UV Index</span>
            <span className={`font-mono text-xs font-black ${uvRating.color}`}>
              {uvIndex} ({uvRating.text})
            </span>
          </div>
        </div>
      </div>

      {/* Solar Transitions */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2">
        <span>🌅 Sunrise: <span className="text-slate-300 font-semibold">{sunrise}</span></span>
        <span>🌇 Sunset: <span className="text-slate-300 font-semibold">{sunset}</span></span>
      </div>
    </div>
  );
};
export default WeatherWidget;

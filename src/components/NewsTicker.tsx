import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Radio } from 'lucide-react';

export const NewsTicker: React.FC = () => {
  const { settings } = useDashboard();

  if (!settings.widgetVisibility.newsTicker || settings.newsSources.length === 0) return null;

  // Duplicate the news list to create a seamless infinite scroll loop
  const duplicatedNews = [...settings.newsSources, ...settings.newsSources, ...settings.newsSources];

  return (
    <div
      className="w-full glass-panel border border-white/5 py-3 px-4 flex items-center gap-4 relative overflow-hidden shrink-0 select-none"
      id="news-ticker-panel"
    >
      {/* Absolute red flashing broadcast icon */}
      <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded font-mono text-[9px] font-black text-red-400 shrink-0 relative z-10">
        <Radio className="w-3 h-3 animate-pulse text-red-400" />
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping absolute top-0.5 right-0.5"></span>
        <span>LIVE FEED</span>
      </div>

      <div className="h-4 w-[1px] bg-white/10 shrink-0 relative z-10"></div>

      {/* Scrolling container */}
      <div className="ticker-wrap flex-grow relative overflow-hidden">
        <div className="ticker-content inline-flex items-center gap-12 text-xs font-mono tracking-wider font-semibold text-slate-300 whitespace-nowrap">
          {duplicatedNews.map((news, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <span className="text-cyan-400 font-bold">✦</span>
              <span>{news}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default NewsTicker;

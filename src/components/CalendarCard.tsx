import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Calendar, Gift, Backpack, Building, ArrowRight, Star } from 'lucide-react';

export const CalendarCard: React.FC = () => {
  const { settings, currentTime } = useDashboard();

  if (!settings.widgetVisibility.calendar) return null;

  // Filter events that are upcoming and are not company (operational) events
  const upcomingEvents = [...settings.boardEvents]
    .filter((e) => e.type !== 'company' && new Date(e.date) >= new Date(currentTime.toDateString()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Next major holiday countdown
  const nextHoliday = upcomingEvents[0];

  const getDaysCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const today = new Date(currentTime.toDateString());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'public': return <Gift className="w-4 h-4 text-rose-400" />;
      case 'school': return <Backpack className="w-4 h-4 text-amber-400" />;
      default: return <Building className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'public': return 'bg-rose-500/10 text-rose-300 border border-rose-500/20';
      case 'school': return 'bg-amber-500/10 text-amber-300 border border-amber-500/20';
      default: return 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-full relative overflow-hidden" id="calendar-widget">
      {/* Background soft glow element */}
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="border-b border-white/5 pb-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Holidays
        </h3>
        <p className="text-[10px] font-mono text-slate-500 mt-0.5">National & Public Holiday Tracker</p>
      </div>



      {/* List of upcoming milestones */}
      <div className="flex-grow my-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-2">
          Upcoming Schedule
        </span>
        <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              <Star className="w-6 h-6 mx-auto mb-1 text-slate-600" />
              No upcoming events scheduled.
            </div>
          ) : (
            upcomingEvents.map((evt) => (
              <div key={evt.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 bg-white/5 rounded flex items-center justify-center shrink-0 border border-white/5">
                    {getEventTypeIcon(evt.type)}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-200 truncate block leading-tight">{evt.title}</span>
                    <span className="text-[9px] text-slate-500 font-mono capitalize">{evt.type} Holiday</span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono block">
                    {getDaysCountdown(evt.date)}d remaining
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default CalendarCard;

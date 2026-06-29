import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  X, Settings, Layout, Calendar as CalendarIcon, Megaphone, Sparkles,
  Compass, ShieldCheck, Sun, Palette, Trash2, Plus, Sliders, Play, RefreshCw
} from 'lucide-react';
import { PrayerName, AdminSettings } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const {
    settings, updateSettings, updateWidgetVisibility,
    addAnnouncement, removeAnnouncement,
    addEvent, removeEvent,
    addQuote, removeQuote,
    addCity, removeCity,
    resetToDefault
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'branding' | 'widgets' | 'clocks' | 'prayer' | 'announcements' | 'news'>('branding');

  // Input states
  const [newCity, setNewCity] = useState({ name: '', flag: '🇧🇩', timezone: 'Asia/Dhaka', tempOffset: 30, weatherCondition: 'Sunny' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' as 'info' | 'success' | 'warning' | 'birthday', timestamp: 'Just Now' });
  const [newNews, setNewNews] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'company' as 'company' | 'school' | 'public' });
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });

  if (!isOpen) return null;

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.name || !newCity.timezone) return;
    addCity(newCity);
    setNewCity({ name: '', flag: '🇧🇩', timezone: 'Asia/Dhaka', tempOffset: 30, weatherCondition: 'Sunny' });
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    addAnnouncement(newAnnouncement);
    setNewAnnouncement({ title: '', content: '', type: 'info', timestamp: 'Just Now' });
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews) return;
    updateSettings({
      newsSources: [newNews, ...settings.newsSources]
    });
    setNewNews('');
  };

  const handleRemoveNews = (index: number) => {
    const updated = settings.newsSources.filter((_, i) => i !== index);
    updateSettings({ newsSources: updated });
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    addEvent(newEvent);
    setNewEvent({ title: '', date: '', type: 'company' });
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.text || !newQuote.author) return;
    addQuote(newQuote);
    setNewQuote({ text: '', author: '' });
  };

  const themeColors: { id: typeof settings.themeColor; label: string; bg: string }[] = [
    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { id: 'pink', label: 'Pink', bg: 'bg-pink-500' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-112 bg-slate-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col transition-all duration-300 transform translate-x-0" id="admin-control-center">
      
      {/* Drawer Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider">
            Operations Command Center
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 bg-slate-950/40 text-xs font-mono font-bold uppercase tracking-wider overflow-x-auto pr-2 shrink-0">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-3 shrink-0 border-b-2 transition-all ${
            activeTab === 'branding' ? 'border-cyan-400 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Branding
        </button>
        <button
          onClick={() => setActiveTab('widgets')}
          className={`px-4 py-3 shrink-0 border-b-2 transition-all ${
            activeTab === 'widgets' ? 'border-cyan-400 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Widgets
        </button>
        <button
          onClick={() => setActiveTab('clocks')}
          className={`px-4 py-3 shrink-0 border-b-2 transition-all ${
            activeTab === 'clocks' ? 'border-cyan-400 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Clocks
        </button>
        <button
          onClick={() => setActiveTab('prayer')}
          className={`px-4 py-3 shrink-0 border-b-2 transition-all ${
            activeTab === 'prayer' ? 'border-cyan-400 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Prayers
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-3 shrink-0 border-b-2 transition-all ${
            activeTab === 'announcements' ? 'border-cyan-400 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Bulletins
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-3 shrink-0 border-b-2 transition-all ${
            activeTab === 'news' ? 'border-cyan-400 text-white bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ticker
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">

        {/* TAB 1: BRANDING & THEMING */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Company Details
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                placeholder="Company Name"
              />
              <input
                type="text"
                value={settings.slogan}
                onChange={(e) => updateSettings({ slogan: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400 mt-2"
                placeholder="Operations Slogan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Shift Name
                </label>
                <input
                  type="text"
                  value={settings.shift}
                  onChange={(e) => updateSettings({ shift: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g., Night Shift"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={settings.departmentName}
                  onChange={(e) => updateSettings({ departmentName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g., HQ Control"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Custom Logo URL
              </label>
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                placeholder="https://example.com/logo.png"
              />
              <span className="text-[9px] text-slate-500 font-mono">Leave empty to use the default sci-fi Core CPU icon.</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Theme Colors Accent
              </label>
              <div className="grid grid-cols-6 gap-2">
                {themeColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => updateSettings({ themeColor: color.id })}
                    className={`w-full h-10 rounded-lg flex items-center justify-center transition-all ${color.bg} ${
                      settings.themeColor === color.id
                        ? 'ring-2 ring-white scale-110 shadow-lg'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Display Brightness
                </label>
                <span className="text-xs font-mono text-cyan-400 font-bold">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={settings.brightness}
                onChange={(e) => updateSettings({ brightness: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        )}

        {/* TAB 2: WIDGET VISIBILITY */}
        {activeTab === 'widgets' && (
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Dashboard Module Toggles
            </span>
            <div className="space-y-3">
              {Object.keys(settings.widgetVisibility).map((wKey) => {
                const isVisible = settings.widgetVisibility[wKey as keyof AdminSettings['widgetVisibility']];
                return (
                  <div key={wKey} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-slate-900/40">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide font-mono">
                      {wKey.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <button
                      onClick={() => updateWidgetVisibility(wKey as any, !isVisible)}
                      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 focus:outline-none ${
                        isVisible ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all duration-300 transform ${
                          isVisible ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CLOCKS & CITIES */}
        {activeTab === 'clocks' && (
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Add New Clock Node
            </span>
            <form onSubmit={handleAddCity} className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newCity.name}
                  onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                  placeholder="City Name"
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white"
                  required
                />
                <input
                  type="text"
                  value={newCity.flag}
                  onChange={(e) => setNewCity({ ...newCity, flag: e.target.value })}
                  placeholder="Flag Emoji"
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white"
                  required
                />
              </div>

              <input
                type="text"
                value={newCity.timezone}
                onChange={(e) => setNewCity({ ...newCity, timezone: e.target.value })}
                placeholder="IANA Timezone (e.g. Asia/Dubai)"
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={newCity.tempOffset}
                  onChange={(e) => setNewCity({ ...newCity, tempOffset: parseInt(e.target.value, 10) })}
                  placeholder="Temp Offset"
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white"
                />
                <select
                  value={newCity.weatherCondition}
                  onChange={(e) => setNewCity({ ...newCity, weatherCondition: e.target.value })}
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-300"
                >
                  <option value="Sunny">Sunny</option>
                  <option value="Clear">Clear</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Hazy">Hazy</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 font-mono font-bold text-xs uppercase text-slate-950 py-2 rounded-lg flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Clock Node
              </button>
            </form>

            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block pt-2">
              Active Clock Nodes ({settings.cities.length})
            </span>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {settings.cities.map((city) => {
                const cleanCityName = city.name
                  .replace(/^(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)\b\s*[,-]?\s*/gi, '')
                  .replace(/\s*[,-]?\s*\b(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)$/gi, '')
                  .replace(/,\s*(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)\b/gi, '')
                  .trim();
                return (
                  <div key={city.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{city.flag}</span>
                      <span className="text-xs font-semibold text-slate-200">{cleanCityName}</span>
                      <span className="text-[9px] text-slate-500 font-mono">({city.timezone})</span>
                    </div>
                    <button
                      onClick={() => removeCity(city.id)}
                      className="p-1 rounded text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PRAYERS & CALCULATION METHOD */}
        {activeTab === 'prayer' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Prayer Calculation Method
              </label>
              <select
                value={settings.prayerMethod}
                onChange={(e) => updateSettings({ prayerMethod: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Standard">Standard (General Islamic Presets)</option>
                <option value="ISNA">Islamic Society of North America (ISNA)</option>
                <option value="MWL">Muslim World League (MWL)</option>
                <option value="Umm Al-Qura">Umm Al-Qura University (Makkah)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Madhhab (Asr Juristic Method)
              </label>
              <select
                value={settings.prayerMadhhab}
                onChange={(e) => updateSettings({ prayerMadhhab: e.target.value as any })}
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Standard">Standard / Shafi / Maliki / Hanbali</option>
                <option value="Hanafi">Hanafi (Asr Starts Significantly Later)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-slate-300 space-y-2">
              <h4 className="text-xs font-mono font-bold text-yellow-400 flex items-center gap-1">
                <Sliders className="w-4 h-4" /> Evaluator Quick Test
              </h4>
              <p className="text-[10px] leading-relaxed">
                Want to see the automatic prayer transitions immediately? Toggle the calculation methods, madhhabs, or edit current system settings. The Smart Prayer widget calculates times relative to the system clock hour and switches state instantly!
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS & BULLETIN */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Broadcast Announcement
            </span>
            <form onSubmit={handleAddAnnouncement} className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Bulletin Title"
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white"
                required
              />
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="Announcement details..."
                rows={3}
                className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-slate-300"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="birthday">Birthday</option>
                </select>
                <input
                  type="text"
                  value={newAnnouncement.timestamp}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, timestamp: e.target.value })}
                  placeholder="Timestamp (e.g. 10:00 AM)"
                  className="bg-slate-900 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 font-mono font-bold text-xs uppercase text-slate-950 py-2 rounded-lg flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Broadcast Announcement
              </button>
            </form>

            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block pt-2">
              Active Announcements ({settings.announcements.length})
            </span>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {settings.announcements.map((ann) => (
                <div key={ann.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-white/5 gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">{ann.title}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{ann.content}</span>
                  </div>
                  <button
                    onClick={() => removeAnnouncement(ann.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: NEWS TICKER & HOLIDAYS & QUOTES */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                News Ticker Headline
              </span>
              <form onSubmit={handleAddNews} className="flex gap-2">
                <input
                  type="text"
                  value={newNews}
                  onChange={(e) => setNewNews(e.target.value)}
                  placeholder="Add news flash line..."
                  className="flex-grow bg-slate-900 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white"
                />
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 p-2 rounded-lg text-slate-950 shrink-0"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </form>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {settings.newsSources.map((news, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-white/5">
                    <span className="text-[11px] text-slate-300 truncate pr-2">{news}</span>
                    <button
                      onClick={() => handleRemoveNews(idx)}
                      className="p-1 text-red-400 hover:bg-red-400/10 rounded shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-white/5 pt-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Holidays Calendar
              </span>
              <form onSubmit={handleAddEvent} className="space-y-2 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event Title"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 px-3 text-xs text-white"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-xs text-white"
                    required
                  />
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-xs text-slate-300"
                  >
                    <option value="company">Company</option>
                    <option value="school">School</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 font-mono text-[10px] uppercase font-bold text-slate-950 py-1.5 rounded-lg flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Holiday Event
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Drawer Footer Actions */}
      <div className="p-6 border-t border-white/10 flex items-center justify-between bg-slate-950 shrink-0">
        <button
          onClick={resetToDefault}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono uppercase font-bold px-3 py-1.5 rounded border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
        </button>

        <button
          onClick={onClose}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-mono font-bold text-xs uppercase px-5 py-2 rounded-lg transition-all"
        >
          Save & Synch
        </button>
      </div>

    </div>
  );
};
export default AdminPanel;

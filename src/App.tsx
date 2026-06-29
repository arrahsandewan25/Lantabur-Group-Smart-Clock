import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import Backdrop from './components/Backdrop';
import Header from './components/Header';
import WorldClocks from './components/WorldClocks';
import SmartPrayerCard from './components/SmartPrayerCard';
import WeatherWidget from './components/WeatherWidget';
import NewsTicker from './components/NewsTicker';
import AdminPanel from './components/AdminPanel';
import { Settings, Cpu } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { settings } = useDashboard();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative text-slate-100 transition-all duration-300 w-full pt-4 px-4 sm:pt-6 sm:px-6 lg:pt-8 lg:px-8 pb-0 gap-4 md:gap-6"
      style={{ filter: `brightness(${settings.brightness}%)` }}
    >
      {/* Animated galaxy background and particle system */}
      <Backdrop />

      {/* Main dashboard body */}
      <main className="w-full max-w-full mx-auto flex-grow flex flex-col gap-4 md:gap-6">
        
        {/* Row 1: Corporate Header */}
        <Header />

        {/* Row 2: Live World Clocks Ticker (Expanded & Spacious) */}
        <WorldClocks />

        {/* Row 3: Main Operations Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-grow">
          
          {/* Left Column: Environmental Station (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-grow">
              <WeatherWidget />
            </div>
          </div>

          {/* Right Column: Prayer Times node replacing Holidays (6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-grow">
              <SmartPrayerCard />
            </div>
          </div>

        </div>

      </main>

      {/* Row 5: Infinite News Ticker Footer */}
      <NewsTicker />

      {/* Floating Operational Admin Panel trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAdminOpen(true)}
          className="relative group p-3.5 rounded-full bg-slate-900 border border-white/15 hover:border-cyan-400 text-slate-200 hover:text-cyan-400 hover:scale-110 transition-all duration-300 shadow-lg flex items-center justify-center cursor-pointer"
          title="Open Admin Control Center"
          id="admin-trigger-button"
        >
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur group-hover:animate-pulse"></div>
          <Settings className="w-5.5 h-5.5 relative z-10 animate-spin-slow" />
        </button>
      </div>

      {/* Master Control Slide Drawer */}
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminSettings, Announcement, BoardEvent, Quote, CityClockConfig } from '../types';
// @ts-ignore
import defaultLogo from '../assets/lantabur_logo.jpg';

interface DashboardContextType {
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  updateWidgetVisibility: (widget: keyof AdminSettings['widgetVisibility'], value: boolean) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  removeAnnouncement: (id: string) => void;
  addEvent: (event: Omit<BoardEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  removeQuote: (id: string) => void;
  addCity: (city: Omit<CityClockConfig, 'id'>) => void;
  removeCity: (id: string) => void;
  currentTime: Date;
  activeBriefing: string;
  isGeneratingBriefing: boolean;
  generateAIBriefing: () => Promise<void>;
  resetToDefault: () => void;
  isGoogleCalendarSynced: boolean;
  isGoogleCalendarLoading: boolean;
  syncGoogleCalendar: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEFAULT_CITIES: CityClockConfig[] = [
  { id: '2', name: 'Makkah', flag: '', timezone: 'Asia/Riyadh', tempOffset: 38, weatherCondition: 'Clear' },
  { id: '3', name: 'Dubai', flag: '', timezone: 'Asia/Dubai', tempOffset: 35, weatherCondition: 'Hazy' },
  { id: '4', name: 'London', flag: '', timezone: 'Europe/London', tempOffset: 19, weatherCondition: 'Rainy' },
  { id: '5', name: 'Berlin', flag: '', timezone: 'Europe/Berlin', tempOffset: 22, weatherCondition: 'Cloudy' },
  { id: '6', name: 'New York', flag: '', timezone: 'America/New_York', tempOffset: 26, weatherCondition: 'Partly Cloudy' },
  { id: '1', name: 'Dhaka', flag: '', timezone: 'Asia/Dhaka', tempOffset: 31, weatherCondition: 'Sunny' }
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Operational Briefing', content: 'All system checks are green for today\'s shift. Keep up the high standard!', type: 'success', timestamp: '10:00 AM' },
  { id: '2', title: 'Global Operations Meeting', content: 'Quarterly review starts tomorrow at 10:00 AM in the Main Conference Hall.', type: 'info', timestamp: '11:30 AM' },
  { id: '3', title: 'Happy Birthday', content: 'Best wishes to Mr. Rahman (VP Operations) celebrating today!', type: 'birthday', timestamp: '01:15 PM' },
  { id: '4', title: 'Payroll Released', content: 'June disbursements have been finalized and processed corporate-wide.', type: 'success', timestamp: '03:45 PM' }
];

const DEFAULT_EVENTS: BoardEvent[] = [
  { id: 'e1', title: 'Corporate Hackathon 2026', date: '2026-07-02', type: 'company' },
  { id: 'e2', title: 'School Midterm Break', date: '2026-07-10', type: 'school' },
  { id: 'e3', title: 'National Ashura Holiday', date: '2026-07-16', type: 'public' },
  { id: 'e4', title: 'Global Operational Audit', date: '2026-07-24', type: 'company' }
];

const DEFAULT_QUOTES: Quote[] = [
  { id: 'q1', text: 'Great teachers inspire greatness.', author: 'William Arthur Ward' },
  { id: 'q2', text: 'Strive not to be a success, but rather to be of value.', author: 'Albert Einstein' },
  { id: 'q3', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { id: 'q4', text: 'Precision operations are built on exact timekeeping and absolute focus.', author: 'Operations Control Room' }
];

const DEFAULT_SETTINGS: AdminSettings = {
  companyName: 'Lantabur Group',
  departmentName: 'HQ Digital Operations',
  shift: 'Day Shift',
  slogan: '',
  logoUrl: defaultLogo,
  prayerMethod: 'Standard',
  prayerMadhhab: 'Standard',
  adhanEnabled: true,
  themeColor: 'cyan',
  brightness: 100,
  widgetVisibility: {
    clocks: true,
    prayerCard: true,
    announcements: true,
    calendar: true,
    weather: true,
    quote: true,
    newsTicker: true,
    aiBriefing: true
  },
  announcements: DEFAULT_ANNOUNCEMENTS,
  boardEvents: DEFAULT_EVENTS,
  quotes: DEFAULT_QUOTES,
  cities: DEFAULT_CITIES,
  newsSources: [
    'World News: Operations are reporting continuous stable growth.',
    'Bangladesh News: Lantabur infrastructure upgrades are officially online.',
    'Company Highlights: High-performance dashboard deployed to corporate headquarters.',
    'Technology Spotlights: Artificial intelligence integrated seamlessly to boost operations.'
  ]
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem('lantabur_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.logoUrl || parsed.logoUrl.includes('lantabur_logo_1782702424680') || parsed.logoUrl.includes('Lantabur Group Logo.jpg')) {
          parsed.logoUrl = defaultLogo;
        }
        if (parsed.cities && Array.isArray(parsed.cities)) {
          parsed.cities = parsed.cities.filter((city: any) => 
            city.name !== 'Tokyo' && 
            city.name !== 'Beijing' && 
            city.timezone !== 'Asia/Tokyo' && 
            city.timezone !== 'Asia/Shanghai'
          ).map((city: any) => ({
            ...city,
            name: city.name
              .replace(/^(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)\b\s*[,-]?\s*/gi, '')
              .replace(/\s*[,-]?\s*\b(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)$/gi, '')
              .replace(/,\s*(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)\b/gi, '')
              .trim()
          }));
          // Sort cities to match order: Makkah, Dubai, London, Berlin, New York, Dhaka
          const order = ['makkah', 'dubai', 'london', 'berlin', 'new york', 'dhaka'];
          parsed.cities.sort((a: any, b: any) => {
            const indexA = order.indexOf(a.name.toLowerCase());
            const indexB = order.indexOf(b.name.toLowerCase());
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB;
            }
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    return DEFAULT_SETTINGS;
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeBriefing, setActiveBriefing] = useState<string>(() => {
    return localStorage.getItem('lantabur_briefing') || 
      "Welcome to Lantabur Operations Command. System checks: Normal. Connection: Established. All global operational nodes are synched.";
  });
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState<boolean>(false);
  const [isGoogleCalendarSynced, setIsGoogleCalendarSynced] = useState<boolean>(false);
  const [isGoogleCalendarLoading, setIsGoogleCalendarLoading] = useState<boolean>(false);

  const syncGoogleCalendar = async () => {
    setIsGoogleCalendarLoading(true);
    try {
      const response = await fetch('/api/calendar');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.events && Array.isArray(data.events)) {
          setSettings((prev) => {
            const localCompanyEvents = prev.boardEvents.filter(e => e.type === 'company');
            const mergedEvents = [...localCompanyEvents, ...data.events];
            const seen = new Set();
            const uniqueEvents = [];
            for (const event of mergedEvents) {
              const key = `${event.title}_${event.date}`;
              if (!seen.has(key)) {
                seen.add(key);
                uniqueEvents.push(event);
              }
            }
            return {
              ...prev,
              boardEvents: uniqueEvents
            };
          });
          setIsGoogleCalendarSynced(true);
        } else {
          setIsGoogleCalendarSynced(false);
        }
      } else {
        setIsGoogleCalendarSynced(false);
      }
    } catch (e) {
      console.error("Failed to fetch Google Calendar events:", e);
      setIsGoogleCalendarSynced(false);
    } finally {
      setIsGoogleCalendarLoading(false);
    }
  };

  // Synchronous ticking clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync Google Calendar on mount and periodically
  useEffect(() => {
    syncGoogleCalendar();
    const interval = setInterval(syncGoogleCalendar, 120000); // 2 minutes refresh
    return () => clearInterval(interval);
  }, []);

  // Fetch live top news from Bangladesh and international sources on mount
  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          if (data.news && Array.isArray(data.news) && data.news.length > 0) {
            setSettings((prev) => ({
              ...prev,
              newsSources: data.news
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch live news from dashboard api:", e);
      }
    };
    fetchLiveNews();
    const interval = setInterval(fetchLiveNews, 300000); // 5 minutes refresh
    return () => clearInterval(interval);
  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('lantabur_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateWidgetVisibility = (widget: keyof AdminSettings['widgetVisibility'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      widgetVisibility: {
        ...prev.widgetVisibility,
        [widget]: value
      }
    }));
  };

  const addAnnouncement = (item: Omit<Announcement, 'id'>) => {
    const newItem: Announcement = {
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSettings((prev) => ({
      ...prev,
      announcements: [newItem, ...prev.announcements]
    }));
  };

  const removeAnnouncement = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id)
    }));
  };

  const addEvent = (item: Omit<BoardEvent, 'id'>) => {
    const newItem: BoardEvent = {
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSettings((prev) => ({
      ...prev,
      boardEvents: [...prev.boardEvents, newItem]
    }));
  };

  const removeEvent = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      boardEvents: prev.boardEvents.filter((e) => e.id !== id)
    }));
  };

  const addQuote = (item: Omit<Quote, 'id'>) => {
    const newItem: Quote = {
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSettings((prev) => ({
      ...prev,
      quotes: [...prev.quotes, newItem]
    }));
  };

  const removeQuote = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((q) => q.id !== id)
    }));
  };

  const addCity = (item: Omit<CityClockConfig, 'id'>) => {
    const cleanedName = item.name
      .replace(/^(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)\b\s*[,-]?\s*/gi, '')
      .replace(/\s*[,-]?\s*\b(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)$/gi, '')
      .replace(/,\s*(BD|SA|AE|GB|DE|US|UK|FR|CA|AU|JP|CN)\b/gi, '')
      .trim();

    const newItem: CityClockConfig = {
      ...item,
      name: cleanedName,
      id: Math.random().toString(36).substr(2, 9)
    };
    setSettings((prev) => ({
      ...prev,
      cities: [...prev.cities, newItem]
    }));
  };

  const removeCity = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      cities: prev.cities.filter((c) => c.id !== id)
    }));
  };

  const generateAIBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const response = await fetch("/api/ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcements: settings.announcements.map(a => `${a.title}: ${a.content}`),
          weather: { temp: 31, condition: "Sunny", humidity: 72 },
          shift: settings.shift,
          date: currentTime.toLocaleDateString(),
          department: settings.departmentName
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to generate briefing");
      }

      const data = await response.json();
      if (data.briefing) {
        setActiveBriefing(data.briefing);
        localStorage.setItem('lantabur_briefing', data.briefing);
      }
    } catch (e: any) {
      console.error("Failed to generate AI briefing", e);
      setActiveBriefing(`[ALERT] AI Connection Idle. Fallback briefing: General operations continue normally in the ${settings.shift} across ${settings.departmentName}. Weather is currently nominal.`);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
    setActiveBriefing("Welcome to Lantabur Operations Command. System checks: Normal. Connection: Established. All global operational nodes are synched.");
  };

  return (
    <DashboardContext.Provider
      value={{
        settings,
        updateSettings,
        updateWidgetVisibility,
        addAnnouncement,
        removeAnnouncement,
        addEvent,
        removeEvent,
        addQuote,
        removeQuote,
        addCity,
        removeCity,
        currentTime,
        activeBriefing,
        isGeneratingBriefing,
        generateAIBriefing,
        resetToDefault,
        isGoogleCalendarSynced,
        isGoogleCalendarLoading,
        syncGoogleCalendar
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

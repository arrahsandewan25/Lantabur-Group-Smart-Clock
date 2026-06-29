export interface CityClockConfig {
  id: string;
  name: string;
  flag: string;
  timezone: string; // IANA timezone, e.g., 'Asia/Dhaka', 'Asia/Riyadh', 'Asia/Dubai', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'Asia/Tokyo', 'Asia/Singapore'
  tempOffset: number; // For simulating temperature
  weatherCondition: string;
}

export type PrayerName = 'Tahajjud' | 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimeRule {
  name: PrayerName;
  startTime: string; // 'HH:MM'
  endTime: string; // 'HH:MM'
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'birthday';
  timestamp: string;
}

export interface BoardEvent {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  type: 'public' | 'school' | 'company';
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export interface AdminSettings {
  companyName: string;
  departmentName: string;
  shift: string;
  slogan: string;
  logoUrl: string;
  prayerMethod: string; // 'Standard', 'ISNA', 'MWL', 'Umm Al-Qura'
  prayerMadhhab: 'Hanafi' | 'Standard'; // Hanafi affects Asr time
  adhanEnabled: boolean;
  newsSources: string[];
  themeColor: 'cyan' | 'emerald' | 'purple' | 'pink' | 'amber' | 'blue';
  brightness: number; // 0 to 100
  widgetVisibility: {
    clocks: boolean;
    prayerCard: boolean;
    announcements: boolean;
    calendar: boolean;
    weather: boolean;
    quote: boolean;
    newsTicker: boolean;
    aiBriefing: boolean;
  };
  announcements: Announcement[];
  boardEvents: BoardEvent[];
  quotes: Quote[];
  cities: CityClockConfig[];
}

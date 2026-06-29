import { PrayerName } from '../types';

export interface PrayerPeriod {
  name: PrayerName;
  startTime: Date;
  endTime: Date;
}

export interface PrayerState {
  type: 'CURRENT' | 'NEXT';
  prayer: PrayerName;
  startTime: Date;
  endTime: Date;
  timeRemainingMs: number;
  progress: number; // 0 to 100
}

// Default standard prayer start and end offsets relative to a base date
export const DEFAULT_PRAYER_TIMES = [
  { name: 'Tahajjud' as PrayerName, startHour: 2, startMin: 15, endHour: 4, endMin: 5 },
  { name: 'Fajr' as PrayerName, startHour: 4, startMin: 5, endHour: 5, endMin: 30 },
  { name: 'Dhuhr' as PrayerName, startHour: 12, startMin: 5, endHour: 15, endMin: 45 },
  { name: 'Asr' as PrayerName, startHour: 15, startMin: 45, endHour: 18, endMin: 40 },
  { name: 'Maghrib' as PrayerName, startHour: 18, startMin: 40, endHour: 20, endMin: 0 },
  { name: 'Isha' as PrayerName, startHour: 20, startMin: 0, endHour: 23, endMin: 30 },
];

/**
 * Gets the actual dates for today's prayers
 */
export function calculateTodayPrayers(
  baseDate: Date,
  method: string,
  madhhab: 'Hanafi' | 'Standard'
): PrayerPeriod[] {
  return DEFAULT_PRAYER_TIMES.map((p) => {
    const start = new Date(baseDate);
    const end = new Date(baseDate);

    let sHour = p.startHour;
    let sMin = p.startMin;
    let eHour = p.endHour;
    let eMin = p.endMin;

    // Apply adjustments based on Method
    if (method === 'ISNA') {
      // Fajr slightly later, Isha slightly earlier
      if (p.name === 'Fajr') { sMin += 10; }
      if (p.name === 'Isha') { sMin -= 15; }
    } else if (method === 'MWL') {
      if (p.name === 'Fajr') { sMin -= 5; }
      if (p.name === 'Isha') { sMin += 10; }
    } else if (method === 'Umm Al-Qura') {
      if (p.name === 'Fajr') { sMin -= 8; }
      if (p.name === 'Isha') { sHour = 20; sMin = 15; }
    }

    // Apply Asr adjustment for Hanafi madhhab
    if (p.name === 'Asr' && madhhab === 'Hanafi') {
      sHour = 16;
      sMin = 30;
    }

    start.setHours(sHour, sMin, 0, 0);
    end.setHours(eHour, eMin, 0, 0);

    return {
      name: p.name,
      startTime: start,
      endTime: end,
    };
  });
}

/**
 * Derives the active prayer or the next upcoming prayer state
 */
export function getPrayerState(
  now: Date,
  method: string,
  madhhab: 'Hanafi' | 'Standard',
  customTimesOverride?: { name: PrayerName; start: string; end: string }[]
): PrayerState {
  // 1. Calculate the raw prayer times
  let periods: PrayerPeriod[] = [];

  if (customTimesOverride && customTimesOverride.length > 0) {
    periods = customTimesOverride.map((ov) => {
      const start = new Date(now);
      const end = new Date(now);

      const [sH, sM] = ov.start.split(':').map(Number);
      const [eH, eM] = ov.end.split(':').map(Number);

      start.setHours(sH, sM, 0, 0);
      end.setHours(eH, eM, 0, 0);

      // Handle overnight end times for a specific prayer
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      return {
        name: ov.name,
        startTime: start,
        endTime: end,
      };
    });
  } else {
    periods = calculateTodayPrayers(now, method, madhhab);
  }

  // 2. Check if we are currently inside any prayer period
  const activePeriod = periods.find((p) => now >= p.startTime && now <= p.endTime);

  if (activePeriod) {
    const totalDuration = activePeriod.endTime.getTime() - activePeriod.startTime.getTime();
    const elapsed = now.getTime() - activePeriod.startTime.getTime();
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    return {
      type: 'CURRENT',
      prayer: activePeriod.name,
      startTime: activePeriod.startTime,
      endTime: activePeriod.endTime,
      timeRemainingMs: activePeriod.endTime.getTime() - now.getTime(),
      progress,
    };
  }

  // 3. Otherwise, determine the next prayer.
  // Find the first prayer starting after 'now'
  let nextPeriod = periods.find((p) => p.startTime > now);

  if (!nextPeriod) {
    // If no prayer starts later today, the next prayer is Tahajjud of TOMORROW
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowPeriods = customTimesOverride && customTimesOverride.length > 0
      ? customTimesOverride.map((ov) => {
          const start = new Date(tomorrow);
          const end = new Date(tomorrow);
          const [sH, sM] = ov.start.split(':').map(Number);
          const [eH, eM] = ov.end.split(':').map(Number);
          start.setHours(sH, sM, 0, 0);
          end.setHours(eH, eM, 0, 0);
          if (end < start) end.setDate(end.getDate() + 1);
          return { name: ov.name, startTime: start, endTime: end };
        })
      : calculateTodayPrayers(tomorrow, method, madhhab);

    nextPeriod = tomorrowPeriods[0]; // Tahajjud of tomorrow
  }

  // Find the prayer that just ended to show progress since last prayer ended (if desired),
  // otherwise we can base progress bar on the countdown progress.
  // Let's find the previous period (the one that ended most recently)
  let prevPeriod: PrayerPeriod | undefined;
  const passedPeriods = periods.filter((p) => p.endTime < now);
  if (passedPeriods.length > 0) {
    prevPeriod = passedPeriods[passedPeriods.length - 1];
  } else {
    // Previous period is Isha of yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayPeriods = calculateTodayPrayers(yesterday, method, madhhab);
    prevPeriod = yesterdayPeriods[yesterdayPeriods.length - 1];
  }

  const totalGap = nextPeriod.startTime.getTime() - prevPeriod.endTime.getTime();
  const elapsedGap = now.getTime() - prevPeriod.endTime.getTime();
  const progress = Math.min(100, Math.max(0, (elapsedGap / totalGap) * 100));

  return {
    type: 'NEXT',
    prayer: nextPeriod.name,
    startTime: nextPeriod.startTime,
    endTime: nextPeriod.endTime,
    timeRemainingMs: nextPeriod.startTime.getTime() - now.getTime(),
    progress,
  };
}

/**
 * Format remaining time in HH:MM:SS
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

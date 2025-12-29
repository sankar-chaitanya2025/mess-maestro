// Types
export interface ScanRecord {
  id: string;
  uid: string;
  date: string;
  day: string;
  time: string;
  mealTime: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  messHallNo: 1 | 2 | 3;
  status: 'success' | 'pending';
}

export interface DailyStat {
  date: string;
  total: number;
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
}

export interface HourlyStat {
  hour: string;
  count: number;
}

export interface HallStat {
  hall: string;
  count: number;
  percentage: number;
}

// Helper functions (kept for date formatting in transformation functions)
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(change)),
    isPositive: change >= 0,
  };
};

// Note: Individual scan records are not available from ThingSpeak API
// These functions are kept for compatibility but return empty arrays
export const getScanRecords = (): ScanRecord[] => {
  return [];
};

export const getRecentScans = (limit: number = 50): ScanRecord[] => {
  return [];
};

export const filterRecords = (
  records: ScanRecord[],
  filters: {
    dateFrom?: string;
    dateTo?: string;
    mealType?: string;
    messHall?: string;
    uid?: string;
  }
): ScanRecord[] => {
  return records.filter(record => {
    if (filters.dateFrom && record.date < filters.dateFrom) return false;
    if (filters.dateTo && record.date > filters.dateTo) return false;
    if (filters.mealType && filters.mealType !== 'All' && record.mealTime !== filters.mealType) return false;
    if (filters.messHall && filters.messHall !== 'All' && record.messHallNo !== parseInt(filters.messHall)) return false;
    if (filters.uid && !record.uid.toLowerCase().includes(filters.uid.toLowerCase())) return false;
    return true;
  });
};

export const exportToCSV = (records: ScanRecord[]): string => {
  const headers = ['UID', 'Date', 'Day', 'Time', 'Meal Time', 'Mess Hall No', 'Status'];
  const rows = records.map(r => [r.uid, r.date, r.day, r.time, r.mealTime, r.messHallNo, r.status]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

/**
 * ThingSpeak Data Transformation Functions
 * 
 * ThingSpeak provides aggregated counts in fields:
 * - field1: Total Attendance (optional, can be sum of meals)
 * - field2: Breakfast count
 * - field3: Lunch count
 * - field4: Dinner count
 * - field5: Snacks count (optional)
 * - created_at: Timestamp
 */

// ThingSpeak Feed type (shared with useThingSpeak hook)
export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  field7?: string;
  field8?: string;
}

/**
 * Parse a ThingSpeak field value to number
 * Handles null, undefined, and string numbers
 */
const parseFieldValue = (value: string | null | undefined): number => {
  if (!value || value === 'null' || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed));
};

/**
 * Convert ThingSpeak feed to today's stats format
 * Maps fields to meal counts:
 * - field1 → total (or sum of meals if not provided)
 * - field2 → breakfast
 * - field3 → lunch
 * - field4 → dinner
 * - field5 → snacks (optional, defaults to 0)
 */
export const thingSpeakToTodayStats = (feed: ThingSpeakFeed | null): { total: number; breakfast: number; lunch: number; dinner: number; snacks: number } => {
  if (!feed) {
    return { total: 0, breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
  }

  const breakfast = parseFieldValue(feed.field2);
  const lunch = parseFieldValue(feed.field3);
  const dinner = parseFieldValue(feed.field4);
  const snacks = parseFieldValue(feed.field5);
  
  // Total can come from field1, or be sum of all meals
  const totalFromField = parseFieldValue(feed.field1);
  const total = totalFromField > 0 ? totalFromField : breakfast + lunch + dinner + snacks;

  return {
    total,
    breakfast,
    lunch,
    dinner,
    snacks,
  };
};

/**
 * Convert ThingSpeak feed to meal-wise data for bar chart
 */
export const thingSpeakToMealWiseData = (feed: ThingSpeakFeed | null): Array<{ meal: string; count: number }> => {
  if (!feed) {
    return [
      { meal: 'Breakfast', count: 0 },
      { meal: 'Lunch', count: 0 },
      { meal: 'Dinner', count: 0 },
      { meal: 'Snacks', count: 0 },
    ];
  }

  return [
    { meal: 'Breakfast', count: parseFieldValue(feed.field2) },
    { meal: 'Lunch', count: parseFieldValue(feed.field3) },
    { meal: 'Dinner', count: parseFieldValue(feed.field4) },
    { meal: 'Snacks', count: parseFieldValue(feed.field5) },
  ];
};

/**
 * Convert ThingSpeak feed to hourly data for line chart
 * Since ThingSpeak only provides totals, we distribute values across meal hours
 * This is a simplified approach - in production, you'd want historical hourly data
 */
export const thingSpeakToHourlyData = (feed: ThingSpeakFeed | null): HourlyStat[] => {
  if (!feed) {
    // Return empty hourly data
    const hours: HourlyStat[] = [];
    for (let h = 7; h <= 21; h++) {
      hours.push({
        hour: `${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`,
        count: 0,
      });
    }
    return hours;
  }

  const breakfast = parseFieldValue(feed.field2);
  const lunch = parseFieldValue(feed.field3);
  const dinner = parseFieldValue(feed.field4);
  const snacks = parseFieldValue(feed.field5);

  const hours: HourlyStat[] = [];
  for (let h = 7; h <= 21; h++) {
    let count = 0;
    
    // Distribute meal counts across their time slots
    if (h >= 7 && h <= 9) {
      // Breakfast: 7-9 AM
      count = Math.round(breakfast / 3);
    } else if (h >= 12 && h <= 14) {
      // Lunch: 12-2 PM
      count = Math.round(lunch / 3);
    } else if (h >= 16 && h <= 18) {
      // Snacks: 4-6 PM
      count = Math.round(snacks / 3);
    } else if (h >= 19 && h <= 21) {
      // Dinner: 7-9 PM
      count = Math.round(dinner / 3);
    }

    hours.push({
      hour: `${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`,
      count,
    });
  }

  return hours;
};

/**
 * Convert ThingSpeak feed to hall distribution
 * Since ThingSpeak doesn't provide hall breakdown, we distribute evenly
 * In production, you'd want separate fields for each hall
 */
export const thingSpeakToHallDistribution = (feed: ThingSpeakFeed | null): HallStat[] => {
  if (!feed) {
    return [
      { hall: 'Hall 1', count: 0, percentage: 33 },
      { hall: 'Hall 2', count: 0, percentage: 33 },
      { hall: 'Hall 3', count: 0, percentage: 34 },
    ];
  }

  const total = thingSpeakToTodayStats(feed).total;
  const perHall = Math.round(total / 3);
  const remainder = total % 3;

  return [
    { hall: 'Hall 1', count: perHall + (remainder > 0 ? 1 : 0), percentage: Math.round(((perHall + (remainder > 0 ? 1 : 0)) / total) * 100) || 33 },
    { hall: 'Hall 2', count: perHall + (remainder > 1 ? 1 : 0), percentage: Math.round(((perHall + (remainder > 1 ? 1 : 0)) / total) * 100) || 33 },
    { hall: 'Hall 3', count: perHall, percentage: Math.round((perHall / total) * 100) || 34 },
  ];
};

/**
 * Convert ThingSpeak feeds to weekly trend
 * Uses the latest feed and previous feed for comparison
 * In production, you'd want to fetch more historical data
 */
export const thingSpeakToWeeklyTrend = (feeds: ThingSpeakFeed[]): DailyStat[] => {
  if (feeds.length === 0) {
    // Return empty weekly data
    const stats: DailyStat[] = [];
    const today = new Date();
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      stats.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: 0,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snacks: 0,
      });
    }
    return stats;
  }

  // Use latest feed for today, previous feed for yesterday
  const latestFeed = feeds[feeds.length - 1];
  const previousFeed = feeds.length > 1 ? feeds[feeds.length - 2] : null;

  const today = new Date();
  const stats: DailyStat[] = [];
  
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const isToday = d === 0;
    const isYesterday = d === 1;

    let feedData = { total: 0, breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
    
    if (isToday && latestFeed) {
      feedData = thingSpeakToTodayStats(latestFeed);
    } else if (isYesterday && previousFeed) {
      feedData = thingSpeakToTodayStats(previousFeed);
    }

    stats.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      ...feedData,
    });
  }

  return stats;
};
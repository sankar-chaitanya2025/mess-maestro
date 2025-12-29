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

// These functions are now replaced by ThingSpeak transformation functions
// Kept for backward compatibility
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
 * ThingSpeak provides individual scan records with the following field mapping:
 * - field1: UID (e.g., "2C5C7181")
 * - field2: Date/Status (e.g., "GRANTED")
 * - field3: Day (e.g., "10")
 * - field4: Time (can be null)
 * - field5: Meal_Time (can be null, e.g., "Breakfast", "Lunch", "Dinner", "Snacks")
 * - field6: mess_hall_no (can be null, e.g., "1", "2", "3")
 * - created_at: Timestamp of the record
 */

// ThingSpeak Feed type (shared with useThingSpeak hook)
export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1?: string | null;
  field2?: string | null;
  field3?: string | null;
  field4?: string | null;
  field5?: string | null;
  field6?: string | null;
  field7?: string | null;
  field8?: string | null;
}

/**
 * Convert ThingSpeak feeds to ScanRecord array
 * Maps ThingSpeak fields to ScanRecord format
 */
export const thingSpeakFeedsToScanRecords = (feeds: ThingSpeakFeed[]): ScanRecord[] => {
  return feeds
    .filter(feed => feed.field1) // Only include feeds with UID
    .map(feed => {
      // Parse date from created_at or field2
      const createdDate = new Date(feed.created_at);
      const dateStr = formatDate(createdDate);
      const dayName = createdDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Parse time from field4 or created_at
      let timeStr = feed.field4 || '';
      if (!timeStr) {
        const hours = createdDate.getHours().toString().padStart(2, '0');
        const minutes = createdDate.getMinutes().toString().padStart(2, '0');
        timeStr = `${hours}:${minutes}`;
      }
      
      // Parse meal time from field5
      const mealTimeStr = feed.field5 || '';
      let mealTime: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' = 'Breakfast';
      if (mealTimeStr) {
        const mealLower = mealTimeStr.toLowerCase();
        if (mealLower.includes('lunch')) mealTime = 'Lunch';
        else if (mealLower.includes('dinner')) mealTime = 'Dinner';
        else if (mealLower.includes('snack')) mealTime = 'Snacks';
        else mealTime = 'Breakfast';
      } else {
        // Infer meal time from hour
        const hour = createdDate.getHours();
        if (hour >= 7 && hour < 10) mealTime = 'Breakfast';
        else if (hour >= 12 && hour < 15) mealTime = 'Lunch';
        else if (hour >= 16 && hour < 19) mealTime = 'Snacks';
        else if (hour >= 19 && hour < 22) mealTime = 'Dinner';
      }
      
      // Parse mess hall from field6
      const hallStr = feed.field6 || '';
      let messHallNo: 1 | 2 | 3 = 1;
      if (hallStr) {
        const hallNum = parseInt(hallStr);
        if (hallNum >= 1 && hallNum <= 3) {
          messHallNo = hallNum as 1 | 2 | 3;
        }
      }
      
      // Parse status from field2 (if it contains "GRANTED" or similar)
      const statusStr = feed.field2 || '';
      const status: 'success' | 'pending' = 
        statusStr.toUpperCase().includes('GRANTED') || 
        statusStr.toUpperCase().includes('SUCCESS') ||
        statusStr.toUpperCase().includes('OK')
          ? 'success' 
          : 'pending';
      
      return {
        id: `ts-${feed.entry_id}`,
        uid: feed.field1 || 'UNKNOWN',
        date: dateStr,
        day: feed.field3 || dayName,
        time: timeStr,
        mealTime,
        messHallNo,
        status,
      };
    })
    .sort((a, b) => {
      // Sort by date (newest first), then by time
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
};

// Helper functions to process ScanRecord arrays (reuse existing logic)
const getTodayStatsFromRecords = (records: ScanRecord[]): { total: number; breakfast: number; lunch: number; dinner: number; snacks: number } => {
  const today = formatDate(new Date());
  const todayRecords = records.filter(r => r.date === today);
  
  return {
    total: todayRecords.length,
    breakfast: todayRecords.filter(r => r.mealTime === 'Breakfast').length,
    lunch: todayRecords.filter(r => r.mealTime === 'Lunch').length,
    dinner: todayRecords.filter(r => r.mealTime === 'Dinner').length,
    snacks: todayRecords.filter(r => r.mealTime === 'Snacks').length,
  };
};

const getYesterdayStatsFromRecords = (records: ScanRecord[]): { total: number; breakfast: number; lunch: number; dinner: number; snacks: number } => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);
  const yesterdayRecords = records.filter(r => r.date === yesterdayStr);
  
  return {
    total: yesterdayRecords.length,
    breakfast: yesterdayRecords.filter(r => r.mealTime === 'Breakfast').length,
    lunch: yesterdayRecords.filter(r => r.mealTime === 'Lunch').length,
    dinner: yesterdayRecords.filter(r => r.mealTime === 'Dinner').length,
    snacks: yesterdayRecords.filter(r => r.mealTime === 'Snacks').length,
  };
};

const getMealWiseDataFromRecords = (records: ScanRecord[]): Array<{ meal: string; count: number }> => {
  const today = formatDate(new Date());
  const todayRecords = records.filter(r => r.date === today);
  
  return [
    { meal: 'Breakfast', count: todayRecords.filter(r => r.mealTime === 'Breakfast').length },
    { meal: 'Lunch', count: todayRecords.filter(r => r.mealTime === 'Lunch').length },
    { meal: 'Dinner', count: todayRecords.filter(r => r.mealTime === 'Dinner').length },
    { meal: 'Snacks', count: todayRecords.filter(r => r.mealTime === 'Snacks').length },
  ];
};

const getHourlyDataFromRecords = (records: ScanRecord[]): HourlyStat[] => {
  const today = formatDate(new Date());
  const todayRecords = records.filter(r => r.date === today);
  
  const hours: HourlyStat[] = [];
  for (let h = 7; h <= 21; h++) {
    const hourStr = h.toString().padStart(2, '0');
    const count = todayRecords.filter(r => r.time.startsWith(hourStr)).length;
    hours.push({
      hour: `${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`,
      count,
    });
  }
  
  return hours;
};

const getHallDistributionFromRecords = (records: ScanRecord[]): HallStat[] => {
  const today = formatDate(new Date());
  const todayRecords = records.filter(r => r.date === today);
  const total = todayRecords.length || 1;
  
  const halls = [1, 2, 3].map(hall => {
    const count = todayRecords.filter(r => r.messHallNo === hall).length;
    return {
      hall: `Hall ${hall}`,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
  
  return halls;
};

const getWeeklyTrendFromRecords = (records: ScanRecord[]): DailyStat[] => {
  const stats: DailyStat[] = [];
  const today = new Date();
  
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = formatDate(date);
    const dayRecords = records.filter(r => r.date === dateStr);
    
    stats.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      total: dayRecords.length,
      breakfast: dayRecords.filter(r => r.mealTime === 'Breakfast').length,
      lunch: dayRecords.filter(r => r.mealTime === 'Lunch').length,
      dinner: dayRecords.filter(r => r.mealTime === 'Dinner').length,
      snacks: dayRecords.filter(r => r.mealTime === 'Snacks').length,
    });
  }
  
  return stats;
};

/**
 * Convert ThingSpeak feeds to today's stats format
 */
export const thingSpeakToTodayStats = (feeds: ThingSpeakFeed[]): { total: number; breakfast: number; lunch: number; dinner: number; snacks: number } => {
  const records = thingSpeakFeedsToScanRecords(feeds);
  return getTodayStatsFromRecords(records);
};

/**
 * Convert ThingSpeak feeds to yesterday's stats format
 */
export const thingSpeakToYesterdayStats = (feeds: ThingSpeakFeed[]): { total: number; breakfast: number; lunch: number; dinner: number; snacks: number } => {
  const records = thingSpeakFeedsToScanRecords(feeds);
  return getYesterdayStatsFromRecords(records);
};

/**
 * Convert ThingSpeak feeds to meal-wise data for bar chart
 */
export const thingSpeakToMealWiseData = (feeds: ThingSpeakFeed[]): Array<{ meal: string; count: number }> => {
  const records = thingSpeakFeedsToScanRecords(feeds);
  return getMealWiseDataFromRecords(records);
};

/**
 * Convert ThingSpeak feeds to hourly data for line chart
 */
export const thingSpeakToHourlyData = (feeds: ThingSpeakFeed[]): HourlyStat[] => {
  const records = thingSpeakFeedsToScanRecords(feeds);
  return getHourlyDataFromRecords(records);
};

/**
 * Convert ThingSpeak feeds to hall distribution
 */
export const thingSpeakToHallDistribution = (feeds: ThingSpeakFeed[]): HallStat[] => {
  const records = thingSpeakFeedsToScanRecords(feeds);
  return getHallDistributionFromRecords(records);
};

/**
 * Convert ThingSpeak feeds to weekly trend
 */
export const thingSpeakToWeeklyTrend = (feeds: ThingSpeakFeed[]): DailyStat[] => {
  const records = thingSpeakFeedsToScanRecords(feeds);
  return getWeeklyTrendFromRecords(records);
};

/**
 * Get scan records from ThingSpeak feeds
 */
export const thingSpeakToScanRecords = (feeds: ThingSpeakFeed[]): ScanRecord[] => {
  return thingSpeakFeedsToScanRecords(feeds);
};

/**
 * Get recent scans from ThingSpeak feeds
 */
export const thingSpeakToRecentScans = (feeds: ThingSpeakFeed[], limit: number = 50): ScanRecord[] => {
  const records = thingSpeakFeedsToScanRecords(feeds);
  return records.slice(0, limit);
};
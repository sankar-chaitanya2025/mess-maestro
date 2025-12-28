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

// Helper functions
const generateUID = (): string => {
  const num = Math.floor(Math.random() * 7000) + 1;
  return `UID${num.toString().padStart(4, '0')}`;
};

const getMealTimeSlot = (meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'): { startHour: number; endHour: number } => {
  switch (meal) {
    case 'Breakfast':
      return { startHour: 7, endHour: 9 };
    case 'Lunch':
      return { startHour: 12, endHour: 14 };
    case 'Snacks':
      return { startHour: 16, endHour: 18 };
    case 'Dinner':
      return { startHour: 19, endHour: 21 };
  }
};

const formatTime = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate realistic scan data
export const generateScanRecords = (days: number = 30): ScanRecord[] => {
  const records: ScanRecord[] = [];
  const today = new Date();
  
  for (let d = 0; d < days; d++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - d);
    const dayName = getDayName(currentDate);
    const dateStr = formatDate(currentDate);
    const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
    
    // Meal distribution with realistic counts
    const meals: Array<{ type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'; baseCount: number }> = [
      { type: 'Breakfast', baseCount: isWeekend ? 400 : 600 },
      { type: 'Lunch', baseCount: isWeekend ? 800 : 1200 },
      { type: 'Dinner', baseCount: isWeekend ? 600 : 900 },
      { type: 'Snacks', baseCount: isWeekend ? 150 : 300 },
    ];
    
    meals.forEach(({ type, baseCount }) => {
      // Add some randomness to counts
      const count = baseCount + Math.floor(Math.random() * 100) - 50;
      const timeSlot = getMealTimeSlot(type);
      
      for (let i = 0; i < Math.min(count, 150); i++) { // Cap to avoid too much data
        const hour = timeSlot.startHour + Math.floor(Math.random() * (timeSlot.endHour - timeSlot.startHour + 1));
        const minute = Math.floor(Math.random() * 60);
        const messHall = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
        
        records.push({
          id: `${dateStr}-${type}-${i}`,
          uid: generateUID(),
          date: dateStr,
          day: dayName,
          time: formatTime(hour, minute),
          mealTime: type,
          messHallNo: messHall,
          status: Math.random() > 0.02 ? 'success' : 'pending',
        });
      }
    });
  }
  
  return records.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  });
};

// Get today's stats
export const getTodayStats = (records: ScanRecord[]): { total: number; breakfast: number; lunch: number; dinner: number; snacks: number } => {
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

// Get yesterday's stats for comparison
export const getYesterdayStats = (records: ScanRecord[]): { total: number; breakfast: number; lunch: number; dinner: number; snacks: number } => {
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

// Get meal-wise data for bar chart
export const getMealWiseData = (records: ScanRecord[]): Array<{ meal: string; count: number }> => {
  const today = formatDate(new Date());
  const todayRecords = records.filter(r => r.date === today);
  
  return [
    { meal: 'Breakfast', count: todayRecords.filter(r => r.mealTime === 'Breakfast').length },
    { meal: 'Lunch', count: todayRecords.filter(r => r.mealTime === 'Lunch').length },
    { meal: 'Dinner', count: todayRecords.filter(r => r.mealTime === 'Dinner').length },
    { meal: 'Snacks', count: todayRecords.filter(r => r.mealTime === 'Snacks').length },
  ];
};

// Get hourly data for line chart
export const getHourlyData = (records: ScanRecord[]): HourlyStat[] => {
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

// Get hall distribution
export const getHallDistribution = (records: ScanRecord[]): HallStat[] => {
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

// Get weekly trend
export const getWeeklyTrend = (records: ScanRecord[]): DailyStat[] => {
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

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(change)),
    isPositive: change >= 0,
  };
};

// Simulated data store
let scanRecords: ScanRecord[] = generateScanRecords();

export const getScanRecords = (): ScanRecord[] => scanRecords;

export const getRecentScans = (limit: number = 50): ScanRecord[] => {
  return scanRecords.slice(0, limit);
};

export const addScanRecord = (record: Omit<ScanRecord, 'id'>): ScanRecord => {
  const newRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  scanRecords = [newRecord, ...scanRecords];
  return newRecord;
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

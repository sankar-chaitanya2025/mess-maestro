import { useState, useCallback, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MealBarChart } from '@/components/dashboard/MealBarChart';
import { HourlyLineChart } from '@/components/dashboard/HourlyLineChart';
import { HallDistributionChart } from '@/components/dashboard/HallDistributionChart';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { LiveFeed } from '@/components/dashboard/LiveFeed';
import { 
  Users, 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Cookie 
} from 'lucide-react';
import {
  getScanRecords,
  getTodayStats,
  getYesterdayStats,
  getMealWiseData,
  getHourlyData,
  getHallDistribution,
  getWeeklyTrend,
  calculatePercentageChange,
  getRecentScans,
} from '@/lib/data';

const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const records = useMemo(() => getScanRecords(), [refreshKey]);
  const todayStats = useMemo(() => getTodayStats(records), [records]);
  const yesterdayStats = useMemo(() => getYesterdayStats(records), [records]);
  const mealData = useMemo(() => getMealWiseData(records), [records]);
  const hourlyData = useMemo(() => getHourlyData(records), [records]);
  const hallData = useMemo(() => getHallDistribution(records), [records]);
  const weeklyData = useMemo(() => getWeeklyTrend(records), [records]);
  const recentScans = useMemo(() => getRecentScans(50), [refreshKey]);

  return (
    <Layout title="Dashboard" subtitle="Real-time mess management overview">
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Attendance Today"
          value={todayStats.total}
          icon={Users}
          trend={calculatePercentageChange(todayStats.total, yesterdayStats.total)}
        />
        <StatCard
          title="Breakfast"
          value={todayStats.breakfast}
          icon={Coffee}
          trend={calculatePercentageChange(todayStats.breakfast, yesterdayStats.breakfast)}
        />
        <StatCard
          title="Lunch"
          value={todayStats.lunch}
          icon={UtensilsCrossed}
          trend={calculatePercentageChange(todayStats.lunch, yesterdayStats.lunch)}
        />
        <StatCard
          title="Dinner"
          value={todayStats.dinner}
          icon={Moon}
          trend={calculatePercentageChange(todayStats.dinner, yesterdayStats.dinner)}
        />
      </div>

      {/* Charts Grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <MealBarChart data={mealData} />
        <HourlyLineChart data={hourlyData} />
        <HallDistributionChart data={hallData} />
        <WeeklyTrendChart data={weeklyData} />
      </div>

      {/* Live Feed */}
      <LiveFeed records={recentScans} onRefresh={handleRefresh} />
    </Layout>
  );
};

export default Dashboard;

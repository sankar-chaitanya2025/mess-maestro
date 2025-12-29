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
  calculatePercentageChange,
  getRecentScans,
  // ThingSpeak transformation functions
  thingSpeakToTodayStats,
  thingSpeakToMealWiseData,
  thingSpeakToHourlyData,
  thingSpeakToHallDistribution,
  thingSpeakToWeeklyTrend,
} from '@/lib/data';
import { useThingSpeak } from '@/hooks/useThingSpeak';

const Dashboard = () => {
  // Fetch live data from ThingSpeak
  const { data: thingSpeakData, allFeeds, loading: thingSpeakLoading, error: thingSpeakError, refetch } = useThingSpeak();

  const handleRefresh = useCallback(() => {
    // Refetch ThingSpeak data on manual refresh
    refetch();
  }, [refetch]);

  // Get empty records for LiveFeed (ThingSpeak doesn't provide individual records)
  const recentScans = useMemo(() => getRecentScans(50), []);

  // Use ThingSpeak data only - no fallback to mock data
  const todayStats = useMemo(() => {
    return thingSpeakToTodayStats(thingSpeakData);
  }, [thingSpeakData]);

  const yesterdayStats = useMemo(() => {
    // For yesterday, use the previous feed if available
    if (allFeeds.length > 1) {
      const previousFeed = allFeeds[allFeeds.length - 2];
      return thingSpeakToTodayStats(previousFeed);
    }
    // If no previous feed, return zeros
    return { total: 0, breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
  }, [allFeeds]);

  const mealData = useMemo(() => {
    return thingSpeakToMealWiseData(thingSpeakData);
  }, [thingSpeakData]);

  const hourlyData = useMemo(() => {
    return thingSpeakToHourlyData(thingSpeakData);
  }, [thingSpeakData]);

  const hallData = useMemo(() => {
    return thingSpeakToHallDistribution(thingSpeakData);
  }, [thingSpeakData]);

  const weeklyData = useMemo(() => {
    return thingSpeakToWeeklyTrend(allFeeds);
  }, [allFeeds]);

  // Show loading state while fetching initial data
  if (thingSpeakLoading && !thingSpeakData) {
    return (
      <Layout title="Dashboard" subtitle="Real-time mess management overview">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading data from ThingSpeak...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state if ThingSpeak fails
  if (thingSpeakError && !thingSpeakData) {
    return (
      <Layout title="Dashboard" subtitle="Real-time mess management overview">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-2 text-sm font-medium text-destructive">Failed to load data</p>
            <p className="mb-4 text-xs text-muted-foreground">{thingSpeakError}</p>
            <button
              onClick={refetch}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

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

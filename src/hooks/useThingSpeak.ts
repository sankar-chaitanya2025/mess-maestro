import { useState, useEffect, useCallback } from 'react';

import type { ThingSpeakFeed } from '@/lib/data';

/**
 * ThingSpeak API Response Types
 */

export interface ThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
    field6: string;
    field7: string;
    field8: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
  };
  feeds: ThingSpeakFeed[];
}

/**
 * Custom hook to fetch data from ThingSpeak API
 * 
 * API Endpoint: https://api.thingspeak.com/channels/3214347/feeds.json?api_key=407YRZDLITHI1BGO&results=2
 * 
 * @returns Object containing:
 * - data: Latest feed data (feeds[feeds.length - 1])
 * - allFeeds: All feeds from response
 * - loading: Loading state
 * - error: Error message if fetch fails
 * - refetch: Function to manually refetch data
 */
export function useThingSpeak() {
  const [data, setData] = useState<ThingSpeakFeed | null>(null);
  const [allFeeds, setAllFeeds] = useState<ThingSpeakFeed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        'https://api.thingspeak.com/channels/3214347/feeds.json?api_key=407YRZDLITHI1BGO&results=2'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ThingSpeakResponse = await response.json();

      if (result.feeds && result.feeds.length > 0) {
        // Latest value = feeds[feeds.length - 1]
        const latestFeed = result.feeds[result.feeds.length - 1];
        setData(latestFeed);
        setAllFeeds(result.feeds);
      } else {
        throw new Error('No feeds found in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ThingSpeak data';
      setError(errorMessage);
      console.error('ThingSpeak fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 15 seconds (ThingSpeak free tier allows updates every 15s)
    const interval = setInterval(() => {
      fetchData();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    allFeeds,
    loading,
    error,
    refetch: fetchData,
  };
}


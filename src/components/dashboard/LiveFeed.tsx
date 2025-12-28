import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Search, CheckCircle2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ScanRecord } from '@/lib/data';

interface LiveFeedProps {
  records: ScanRecord[];
  onRefresh: () => void;
}

export function LiveFeed({ records, onRefresh }: LiveFeedProps) {
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      onRefresh();
      setLastUpdate(new Date());
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const filteredRecords = useMemo(() => {
    if (!search) return records;
    const searchLower = search.toLowerCase();
    return records.filter(
      r => r.uid.toLowerCase().includes(searchLower) ||
           r.mealTime.toLowerCase().includes(searchLower) ||
           r.time.includes(search)
    );
  }, [records, search]);

  const getMealColor = (meal: string) => {
    switch (meal) {
      case 'Breakfast': return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'Lunch': return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'Dinner': return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'Snacks': return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="chart-container fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Recent Scans</h3>
          <div className="flex items-center gap-1.5">
            <div className="pulse-dot h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-success">Live</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search UID, meal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-9"
            />
          </div>
          
          <button
            onClick={() => {
              setIsRefreshing(true);
              onRefresh();
              setLastUpdate(new Date());
              setTimeout(() => setIsRefreshing(false), 500);
            }}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span className="text-xs tabular-nums">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-96 overflow-auto">
        <table className="data-table">
          <thead className="sticky top-0 bg-card">
            <tr>
              <th>UID</th>
              <th>Time</th>
              <th>Meal Type</th>
              <th>Hall</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => (
              <tr 
                key={record.id} 
                className={cn(
                  'transition-colors',
                  index === 0 && isRefreshing && 'animate-pulse bg-accent/50'
                )}
              >
                <td className="font-mono text-sm">{record.uid}</td>
                <td className="tabular-nums">{record.time}</td>
                <td>
                  <Badge variant="outline" className={cn('border', getMealColor(record.mealTime))}>
                    {record.mealTime}
                  </Badge>
                </td>
                <td>Hall {record.messHallNo}</td>
                <td>
                  {record.status === 'success' ? (
                    <div className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Success</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-warning">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Pending</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="mb-2 h-8 w-8" />
          <p>No records found</p>
        </div>
      )}
    </div>
  );
}

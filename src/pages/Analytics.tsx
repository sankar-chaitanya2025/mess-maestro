import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Search, 
  Download, 
  Filter,
  RotateCcw,
  FileDown,
  CheckCircle2,
  Clock,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getScanRecords, filterRecords, exportToCSV, type ScanRecord } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Analytics = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [mealType, setMealType] = useState('All');
  const [messHall, setMessHall] = useState('All');
  const [uidSearch, setUidSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const allRecords = useMemo(() => getScanRecords(), []);

  const filteredRecords = useMemo(() => {
    return filterRecords(allRecords, {
      dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
      dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
      mealType,
      messHall,
      uid: uidSearch,
    });
  }, [allRecords, dateFrom, dateTo, mealType, messHall, uidSearch]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const peakHoursData = useMemo(() => {
    const hours: { [key: string]: number } = {};
    filteredRecords.forEach(record => {
      const hour = record.time.split(':')[0];
      hours[hour] = (hours[hour] || 0) + 1;
    });
    return Object.entries(hours)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [filteredRecords]);

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setMealType('All');
    setMessHall('All');
    setUidSearch('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csv = exportToCSV(filteredRecords);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mess-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    <Layout title="Analytics" subtitle="Detailed reports and data analysis">
      {/* Filters Section */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6 fade-in">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PPP') : 'From date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !dateTo && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'PPP') : 'To date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Meal Type */}
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger>
              <SelectValue placeholder="Meal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Meals</SelectItem>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
              <SelectItem value="Snacks">Snacks</SelectItem>
            </SelectContent>
          </Select>

          {/* Mess Hall */}
          <Select value={messHall} onValueChange={setMessHall}>
            <SelectTrigger>
              <SelectValue placeholder="Mess Hall" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Halls</SelectItem>
              <SelectItem value="1">Hall 1</SelectItem>
              <SelectItem value="2">Hall 2</SelectItem>
              <SelectItem value="3">Hall 3</SelectItem>
            </SelectContent>
          </Select>

          {/* UID Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search UID..."
              value={uidSearch}
              onChange={(e) => setUidSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Records</p>
          <p className="mt-1 text-2xl font-bold">{filteredRecords.length.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Unique Students</p>
          <p className="mt-1 text-2xl font-bold">
            {new Set(filteredRecords.map(r => r.uid)).size.toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Success Rate</p>
          <p className="mt-1 text-2xl font-bold">
            {filteredRecords.length > 0 
              ? `${Math.round((filteredRecords.filter(r => r.status === 'success').length / filteredRecords.length) * 100)}%`
              : '0%'}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Date Range</p>
          <p className="mt-1 text-lg font-bold">
            {filteredRecords.length > 0 
              ? `${filteredRecords[filteredRecords.length - 1]?.date.slice(5)} - ${filteredRecords[0]?.date.slice(5)}`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Peak Hours Chart */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6 fade-in">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Peak Hours Distribution</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {peakHoursData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(0, 0%, ${80 - (index * 3) % 50}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-border bg-card p-6 fade-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Scan Records</h3>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>UID</th>
                <th>Date</th>
                <th>Day</th>
                <th>Time</th>
                <th>Meal Type</th>
                <th>Hall</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map(record => (
                <tr key={record.id}>
                  <td className="font-mono text-sm">{record.uid}</td>
                  <td>{record.date}</td>
                  <td>{record.day}</td>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="mb-2 h-8 w-8" />
            <p>No records match your filters</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;

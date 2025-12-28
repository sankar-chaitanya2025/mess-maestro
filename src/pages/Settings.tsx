import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Building2, 
  Bell,
  Shield,
  Database,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [mealTimings, setMealTimings] = useState({
    breakfast: { start: '07:00', end: '09:30' },
    lunch: { start: '12:00', end: '14:30' },
    snacks: { start: '16:00', end: '18:00' },
    dinner: { start: '19:00', end: '21:30' },
  });

  const [notifications, setNotifications] = useState({
    lowAttendance: true,
    unusualActivity: true,
    dailyReport: false,
  });

  const [halls, setHalls] = useState([
    { id: 1, name: 'Main Hall', capacity: 3000 },
    { id: 2, name: 'North Wing', capacity: 2500 },
    { id: 3, name: 'South Wing', capacity: 1500 },
  ]);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    toast.info('Settings reset to defaults');
  };

  return (
    <Layout title="Settings" subtitle="System configuration and preferences">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Meal Timings */}
        <div className="rounded-xl border border-border bg-card p-6 fade-in">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Meal Timings</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Configure the operating hours for each meal service.
          </p>

          <div className="space-y-4">
            {Object.entries(mealTimings).map(([meal, times]) => (
              <div key={meal} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium capitalize text-foreground">
                  {meal}
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={times.start}
                    onChange={(e) => setMealTimings(prev => ({
                      ...prev,
                      [meal]: { ...prev[meal as keyof typeof prev], start: e.target.value }
                    }))}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={times.end}
                    onChange={(e) => setMealTimings(prev => ({
                      ...prev,
                      [meal]: { ...prev[meal as keyof typeof prev], end: e.target.value }
                    }))}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mess Halls */}
        <div className="rounded-xl border border-border bg-card p-6 fade-in">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Mess Hall Management</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Configure mess hall names and seating capacity.
          </p>

          <div className="space-y-4">
            {halls.map((hall, index) => (
              <div key={hall.id} className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">Hall {hall.id}</span>
                <Input
                  value={hall.name}
                  onChange={(e) => {
                    const newHalls = [...halls];
                    newHalls[index].name = e.target.value;
                    setHalls(newHalls);
                  }}
                  className="flex-1"
                  placeholder="Hall name"
                />
                <Input
                  type="number"
                  value={hall.capacity}
                  onChange={(e) => {
                    const newHalls = [...halls];
                    newHalls[index].capacity = parseInt(e.target.value) || 0;
                    setHalls(newHalls);
                  }}
                  className="w-32"
                  placeholder="Capacity"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-6 fade-in">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Configure alert preferences and notification settings.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Low Attendance Alert</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when attendance drops below 50%
                </p>
              </div>
              <Switch
                checked={notifications.lowAttendance}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, lowAttendance: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Unusual Activity</p>
                <p className="text-sm text-muted-foreground">
                  Alert on suspicious scan patterns
                </p>
              </div>
              <Switch
                checked={notifications.unusualActivity}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, unusualActivity: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Daily Report</p>
                <p className="text-sm text-muted-foreground">
                  Receive end-of-day summary via email
                </p>
              </div>
              <Switch
                checked={notifications.dailyReport}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, dailyReport: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-xl border border-border bg-card p-6 fade-in">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">System Information</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-accent/30 p-4">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-xl font-bold text-foreground">7,000</p>
            </div>
            <div className="rounded-lg bg-accent/30 p-4">
              <p className="text-sm text-muted-foreground">Total Halls</p>
              <p className="text-xl font-bold text-foreground">3</p>
            </div>
            <div className="rounded-lg bg-accent/30 p-4">
              <p className="text-sm text-muted-foreground">System Version</p>
              <p className="text-xl font-bold text-foreground">v1.0.0</p>
            </div>
            <div className="rounded-lg bg-accent/30 p-4">
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-xl font-bold text-foreground">Just now</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

import { NavLink, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Utensils,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThingSpeak } from '@/hooks/useThingSpeak';
import { thingSpeakToScanRecords } from '@/lib/data';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { allFeeds } = useThingSpeak();

  // Calculate unique students count from ThingSpeak data
  const uniqueStudentsCount = useMemo(() => {
    const records = thingSpeakToScanRecords(allFeeds);
    const uniqueUIDs = new Set(records.map(record => record.uid));
    return uniqueUIDs.size;
  }, [allFeeds]);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Utensils className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">MessFlow</span>
          <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'nav-item',
                isActive && 'active'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Unique Students</span>
            <span className="text-sm font-semibold text-foreground">
              {uniqueStudentsCount.toLocaleString()}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <HelpCircle className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Need help? Press <kbd className="rounded bg-muted px-1 py-0.5">?</kbd></p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('stat-card group fade-in', className)}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend.isPositive 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {value.toLocaleString()}
        </p>
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

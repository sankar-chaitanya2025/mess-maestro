import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(time, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="h-4 w-4" />
          <span className="tabular-nums">{format(time, 'HH:mm:ss')}</span>
        </div>
      </div>
    </header>
  );
}

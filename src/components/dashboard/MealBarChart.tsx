import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MealData {
  meal: string;
  count: number;
}

interface MealBarChartProps {
  data: MealData[];
}

export function MealBarChart({ data }: MealBarChartProps) {
  return (
    <div className="chart-container fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Meal-wise Attendance</h3>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="meal" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}>
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(0, 0%, ${90 - index * 15}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

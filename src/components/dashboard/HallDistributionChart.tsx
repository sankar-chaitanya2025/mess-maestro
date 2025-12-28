import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface HallData {
  hall: string;
  count: number;
  percentage: number;
}

interface HallDistributionChartProps {
  data: HallData[];
}

export function HallDistributionChart({ data }: HallDistributionChartProps) {
  return (
    <div className="chart-container fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Hall Distribution</h3>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
          >
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="hall" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={50}
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
              formatter={(value: number, name: string, props: { payload: HallData }) => [
                `${value.toLocaleString()} (${props.payload.percentage}%)`,
                'Students'
              ]}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(0, 0%, ${75 - index * 15}%)`}
                />
              ))}
              <LabelList 
                dataKey="percentage" 
                position="right" 
                fill="hsl(var(--muted-foreground))"
                fontSize={12}
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  title: string;
  horizontal?: boolean;
}

export default function BarChart({ data, title, horizontal = false }: BarChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm/3">
      <h3 className="text-2xl tracking-tight font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-md  font-medium">
              <span className="text-[#004737]">{item.label}</span>
              <span className="font-semibold text-foreground text-lg">{item.value}</span>
            </div>
            <div className="w-full bg-border/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#3b82f6',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

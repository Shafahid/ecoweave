'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  title: string;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export default function TrendChart({ data, title, color = 'blue' }: TrendChartProps) {
  const colorClasses = {
    blue: 'stroke-blue-600 fill-blue-500',
    green: 'stroke-green-600 fill-green-500',
    orange: 'stroke-orange-600 fill-orange-500',
    red: 'stroke-red-600 fill-red-500',
  };

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 800;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (point.value / maxValue) * chartHeight;
    return { x, y, label: point.label, value: point.value };
  });

  const pathData = points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  const areaPath = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm/3">
      <h3 className="text-2xl tracking-tight font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: '260px' }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i / 4) * chartHeight;
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-foreground"
              />
            );
          })}

          {/* Area fill */}
          <path
            d={areaPath}
            className={colorClasses[color]}
            fillOpacity="0.15"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            className={colorClasses[color]}
            strokeWidth="2.5"
          />

          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                className={`${colorClasses[color]} stroke-white dark:stroke-gray-900`}
                strokeWidth="2"
              />
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-sm fill-current text-foreground/60"
            >
              {point.label}
            </text>
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i / 4) * chartHeight;
            const value = maxValue * (1 - i / 4);
            return (
              <text
                key={i}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-sm fill-current text-foreground/60"
              >
                {Math.round(value)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

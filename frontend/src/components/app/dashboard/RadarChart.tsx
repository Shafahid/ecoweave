'use client';

interface RadarData {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  data: RadarData[];
  title: string;
  color?: string;
}

export default function RadarChart({ data, title, color = '#10b981' }: RadarChartProps) {
  if (data.length === 0) return null;

  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const numLevels = 5;

  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const getLevelPoints = (level: number) => {
    return data.map((_, index) => {
      const value = (level / numLevels) * 100;
      return getPoint(index, value);
    });
  };

  const dataPoints = data.map((item, index) => getPoint(index, item.value));
  const dataPath = dataPoints.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm/3">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background circles */}
          {[1, 2, 3, 4, 5].map((level) => {
            const points = getLevelPoints(level);
            const path = points.map((p, i) => 
              i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
            ).join(' ') + ' Z';
            
            return (
              <path
                key={level}
                d={path}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-foreground"
              />
            );
          })}

          {/* Axis lines */}
          {data.map((_, index) => {
            const point = getPoint(index, 100);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="currentColor"
                strokeOpacity="0.2"
                className="text-foreground"
              />
            );
          })}

          {/* Data area */}
          <path
            d={dataPath}
            fill={color}
            fillOpacity="0.25"
            stroke={color}
            strokeWidth="2"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Labels */}
          {data.map((item, index) => {
            const labelPoint = getPoint(index, 115);
            return (
              <text
                key={index}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                className="text-sm fill-current text-gray-500 font-medium"
              >
                {item.label}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-foreground/60">{item.label}</span>
            <span className="font-semibold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

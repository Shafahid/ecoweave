'use client';

interface AnalysisCardProps {
  title: string;
  value: string | number;
  percentage?: number;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  icon?: React.ReactNode;
}

export default function AnalysisCard({ 
  title, 
  value, 
  percentage, 
  color = 'blue',
  icon 
}: AnalysisCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  const bgColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-950',
    green: 'bg-green-100 dark:bg-green-950',
    orange: 'bg-orange-100 dark:bg-orange-950',
    red: 'bg-red-100 dark:bg-red-950',
    purple: 'bg-purple-100 dark:bg-purple-950',
  };

  const strokeColorClasses = {
    blue: '#3b82f6',
    green: '#16a34a',
    orange: '#ea580c',
    red: '#dc2626',
    purple: '#9333ea',
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = percentage 
    ? circumference - (percentage / 100) * circumference 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm/3 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex-1">
        <h3 className="text-xl tracking-tight text-gray-900 font-medium mb-1">{title}</h3>
        <div className={`text-4xl font-medium ${colorClasses[color]} mb-1`}>
          {value}
        </div>
        {percentage !== undefined && (
          <div className="text-sm text-[#004737]/80 font-medium">
            {percentage}% complete
          </div>
        )}
      </div>
      
      {percentage !== undefined && (
        <div className="relative">
          <svg width="80" height="80" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={strokeColorClasses[color]}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-medium tracking-tight ${colorClasses[color]}`}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      )}

      {icon && !percentage && (
        <div className={`w-12 h-12 rounded-full ${bgColorClasses[color]} flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      )}
    </div>
  );
}

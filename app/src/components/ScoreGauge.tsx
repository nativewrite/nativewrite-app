"use client";

interface ScoreGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  className?: string;
}

export default function ScoreGauge({ value, max, label, unit = "", className = "" }: ScoreGaugeProps) {
  // Calculate percentage for semi-circle
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const angle = (percentage / 100) * 180; // 180 degrees for semi-circle
  
  // Color based on percentage (green > 70%, yellow 40-70%, red < 40%)
  const getColor = () => {
    if (percentage >= 70) return "#10b981"; // green
    if (percentage >= 40) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const color = getColor();

  // Calculate dash array for semi-circle arc
  const radius = 56;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Gauge Container */}
      <div className="relative w-36 h-24 mb-6">
        {/* Background semi-circle */}
        <svg width="144" height="72" viewBox="0 0 128 64" className="overflow-visible" preserveAspectRatio="xMidYMid meet">
          <path
            d="M 8 56 A 56 56 0 0 1 120 56"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value semi-circle */}
          <path
            d="M 8 56 A 56 56 0 0 1 120 56"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 56px' }}
          />
        </svg>
        {/* Value text - positioned in center of semi-circle */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
          <div className="text-center -mt-2">
            <div className="text-3xl font-bold leading-none" style={{ color }}>
              {value.toFixed(unit ? 1 : 0)}
            </div>
            {unit && <div className="text-xs text-slate-500 mt-1">{unit}</div>}
          </div>
        </div>
      </div>
      {/* Label - clearly below the gauge */}
      <div className="text-sm font-medium text-slate-700 text-center px-2 w-full">
        <div className="break-words leading-relaxed">{label}</div>
      </div>
    </div>
  );
}


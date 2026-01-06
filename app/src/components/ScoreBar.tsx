"use client";

interface ScoreBarProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  reverse?: boolean; // If true, lower is better (like repetition density)
  className?: string;
}

export default function ScoreBar({ 
  value, 
  max, 
  label, 
  unit = "", 
  reverse = false,
  className = "" 
}: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Color logic: reverse means lower is better (red for high values)
  const getColor = () => {
    if (reverse) {
      if (percentage <= 30) return "#10b981"; // green (good - low repetition)
      if (percentage <= 60) return "#f59e0b"; // yellow
      return "#ef4444"; // red (bad - high repetition)
    } else {
      if (percentage >= 70) return "#10b981"; // green (good)
      if (percentage >= 40) return "#f59e0b"; // yellow
      return "#ef4444"; // red (bad)
    }
  };

  const color = getColor();

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start justify-between mb-2 gap-3">
        <span className="text-sm font-medium text-slate-700 flex-1 min-w-0 break-words leading-snug">{label}</span>
        <span className="text-sm font-semibold flex-shrink-0 whitespace-nowrap ml-auto" style={{ color }}>
          {value.toFixed(unit ? 1 : 0)}{unit}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}


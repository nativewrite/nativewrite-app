"use client";

interface Score {
  naturalness: number;
  predictability_index: number;
  burstiness_index: number;
  readability: number;
  repetition_density: number;
}

interface BeforeAfterPanelProps {
  before: Score;
  after: Score;
  delta: {
    naturalness: number;
    predictability_index: number;
    burstiness_index: number;
    readability: number;
    repetition_density: number;
  };
}

export default function BeforeAfterPanel({ before, after, delta }: BeforeAfterPanelProps) {
  const formatDelta = (value: number, reverse?: boolean) => {
    const isPositive = reverse ? value < 0 : value > 0;
    const sign = isPositive ? "+" : "";
    const color = isPositive ? "text-green-600" : reverse && value < 0 ? "text-green-600" : "text-red-600";
    return (
      <span className={`font-semibold ${color}`}>
        {sign}{value.toFixed(1)}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Before Column */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Before</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Naturalness Score (estimated)</div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{before.naturalness}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Predictability Index</div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{before.predictability_index.toFixed(1)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Sentence Variety</div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{before.burstiness_index.toFixed(1)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Readability</div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{before.readability}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Repetition Density</div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{before.repetition_density}</div>
          </div>
        </div>
      </div>

      {/* After Column */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">After</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Naturalness Score (estimated)</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900 leading-tight">{after.naturalness}</div>
              <div className="text-sm whitespace-nowrap leading-tight">{formatDelta(delta.naturalness)}</div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Predictability Index</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900 leading-tight">{after.predictability_index.toFixed(1)}</div>
              <div className="text-sm whitespace-nowrap leading-tight">{formatDelta(delta.predictability_index, true)}</div>
            </div>
            <div className="text-xs text-slate-500 mt-2">Lower is better</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Sentence Variety</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900 leading-tight">{after.burstiness_index.toFixed(1)}</div>
              <div className="text-sm whitespace-nowrap leading-tight">{formatDelta(delta.burstiness_index)}</div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Readability</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900 leading-tight">{after.readability}</div>
              <div className="text-sm whitespace-nowrap leading-tight">{formatDelta(delta.readability)}</div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words leading-snug">Repetition Density</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900 leading-tight">{after.repetition_density}</div>
              <div className="text-sm whitespace-nowrap leading-tight">{formatDelta(delta.repetition_density, true)}</div>
            </div>
            <div className="text-xs text-slate-500 mt-2">Lower is better</div>
          </div>
        </div>
      </div>
    </div>
  );
}


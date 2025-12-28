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
            <div className="text-sm text-slate-600 mb-2 break-words">Naturalness Score (estimated)</div>
            <div className="text-2xl font-bold text-slate-900">{before.naturalness}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words">Predictability Index</div>
            <div className="text-2xl font-bold text-slate-900">{before.predictability_index.toFixed(1)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words">Sentence Variety</div>
            <div className="text-2xl font-bold text-slate-900">{before.burstiness_index.toFixed(1)}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words">Readability</div>
            <div className="text-2xl font-bold text-slate-900">{before.readability}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2 break-words">Repetition Density</div>
            <div className="text-2xl font-bold text-slate-900">{before.repetition_density}</div>
          </div>
        </div>
      </div>

      {/* After Column */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">After</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words">Naturalness Score (estimated)</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900">{after.naturalness}</div>
              <div className="text-sm whitespace-nowrap">{formatDelta(delta.naturalness)}</div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words">Predictability Index</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900">{after.predictability_index.toFixed(1)}</div>
              <div className="text-sm whitespace-nowrap">{formatDelta(delta.predictability_index, true)}</div>
            </div>
            <div className="text-xs text-slate-500 mt-2">Lower is better</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words">Sentence Variety</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900">{after.burstiness_index.toFixed(1)}</div>
              <div className="text-sm whitespace-nowrap">{formatDelta(delta.burstiness_index)}</div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words">Readability</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900">{after.readability}</div>
              <div className="text-sm whitespace-nowrap">{formatDelta(delta.readability)}</div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-slate-600 mb-2 break-words">Repetition Density</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="text-2xl font-bold text-slate-900">{after.repetition_density}</div>
              <div className="text-sm whitespace-nowrap">{formatDelta(delta.repetition_density, true)}</div>
            </div>
            <div className="text-xs text-slate-500 mt-2">Lower is better</div>
          </div>
        </div>
      </div>
    </div>
  );
}


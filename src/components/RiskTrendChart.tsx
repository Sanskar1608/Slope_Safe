import React, { useState } from 'react';
import { SensorReading } from '../types';
import { TrendingUp, CloudRain, Droplets, Info } from 'lucide-react';

interface RiskHistoryChartProps {
  history: SensorReading[];
  locationName: string;
}

export const RiskHistoryChart: React.FC<RiskHistoryChartProps> = ({ history, locationName }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hasHistory = history && history.length > 0;

  if (!hasHistory) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs">
        No recent telemetry history recorded for this station.
      </div>
    );
  }

  const height = 180;
  const width = 500;
  const padding = { top: 20, right: 25, bottom: 25, left: 35 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxRain = Math.max(25, ...history.map((h) => h.rainfallMm));

  // Points for risk line (0 to 100)
  const points = history.map((item, idx) => {
    const x = padding.left + (idx / (history.length - 1)) * chartW;
    const y = padding.top + chartH - (item.riskScore / 100) * chartH;
    return { x, y, item, idx };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <div className="parchment-card border border-[#D4C3A3] rounded-2xl p-4 sm:p-5 shadow-sm relative">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#92400E]" />
          <h4 className="text-xs sm:text-sm font-serif font-bold text-[#2A1F13] tracking-wide">
            24-Hour Risk History &amp; Precipitation Trend
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-serif text-[#6C5C48]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-1 bg-[#92400E] inline-block rounded-xs" /> Risk Index (%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-sky-600 inline-block rounded-xs" /> Rainfall (mm)
          </span>
        </div>
      </div>

      {/* SVG Multi-Axis Chart */}
      <div className="w-full overflow-x-auto bg-white/70 p-2 rounded-xl border border-[#DECBB4]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[220px] select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="riskHistoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B45309" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="rainBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + chartH - (val / 100) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={val === 75 ? '#dc262644' : '#DECBB4'}
                  strokeDasharray={val === 75 || val === 50 ? '3 3' : 'none'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill={val >= 75 ? '#dc2626' : '#7A6A55'}
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Rainfall bars in background */}
          {history.map((item, idx) => {
            const barWidth = Math.max(8, (chartW / history.length) * 0.45);
            const x = padding.left + (idx / (history.length - 1)) * chartW - barWidth / 2;
            const barH = (item.rainfallMm / maxRain) * (chartH * 0.7);
            const y = padding.top + chartH - barH;
            return (
              <rect
                key={`rain-${idx}`}
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill="url(#rainBarGradient)"
                rx="2"
              />
            );
          })}

          {/* Risk Area & Line */}
          <path d={areaD} fill="url(#riskHistoryGradient)" />
          <path d={pathD} fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((pt) => {
            const isHovered = hoveredIdx === pt.idx;
            return (
              <g key={`pt-${pt.idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 3.5}
                  fill={pt.item.riskScore >= 75 ? '#B91C1C' : '#92400E'}
                  stroke="#FAF6EC"
                  strokeWidth="2"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(pt.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                {/* Time label on X-axis */}
                <text
                  x={pt.x}
                  y={height - 8}
                  fill="#7A6A55"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {pt.item.timestamp}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip display when hovered */}
      {hoveredIdx !== null && (
        <div className="mt-2 p-2.5 bg-[#FAF6EC] border border-[#DECBB4] rounded-xl flex items-center justify-between text-xs font-mono text-[#2C2114] shadow-xs">
          <div>
            <span className="text-[#7A6A55]">Time:</span> <span className="font-bold text-[#2A1F13]">{history[hoveredIdx].timestamp}</span>
          </div>
          <div>
            <span className="text-[#92400E] font-bold">Risk: {history[hoveredIdx].riskScore}%</span>
          </div>
          <div>
            <span className="text-sky-700 font-bold">Rainfall: {history[hoveredIdx].rainfallMm} mm</span>
          </div>
          <div>
            <span className="text-emerald-700 font-bold">Moisture: {history[hoveredIdx].soilMoisturePercent}%</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DECBB4] text-[11px] text-[#7A6A55] font-serif">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#7A6A55]" />
          Pore-water pressure correlation active
        </span>
        <span className="font-mono text-[#7A6A55]">Sampling Rate: 4-Hour Epochs</span>
      </div>
    </div>
  );
};

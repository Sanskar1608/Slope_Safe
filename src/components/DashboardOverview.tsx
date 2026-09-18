import React from 'react';
import { MonitoredLocation, SystemAlert } from '../types';
import { getRiskColorClass } from '../utils/riskCalculations';
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Mountain,
  ShieldAlert,
  Gauge,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Compass,
  AlertCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  location: MonitoredLocation;
  allLocations: MonitoredLocation[];
  activeAlerts: SystemAlert[];
  onOpenDetails: (loc: MonitoredLocation) => void;
  onOpenAlertsModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  location,
  allLocations,
  activeAlerts,
  onOpenDetails,
  onOpenAlertsModal,
}) => {
  const riskColor = getRiskColorClass(location.currentRiskLevel);

  // Overall system summary calculations
  const totalLocations = allLocations.length;
  const criticalCount = allLocations.filter(
    (l) => l.currentRiskLevel === 'Very High' || l.currentRiskLevel === 'High'
  ).length;

  const overallSystemStatus =
    criticalCount >= 2
      ? {
          title: 'ELEVATED REGIONAL HAZARD',
          desc: `${criticalCount} of ${totalLocations} monitored sectors exceed critical early-warning saturation thresholds.`,
          level: 'High' as const,
          color: 'border-[#F87171] bg-[#FEF2F2] text-[#991B1B]',
        }
      : criticalCount === 1
      ? {
          title: 'LOCALIZED HAZARD WARNING',
          desc: `1 sector flagged for potential slope instability. Hydrological telemetry active.`,
          level: 'Moderate' as const,
          color: 'border-[#FBBF24] bg-[#FFFBEB] text-[#92400E]',
        }
      : {
          title: 'REGIONAL CONDITIONS NOMINAL',
          desc: `All ${totalLocations} sectors currently demonstrate stable factors of safety.`,
          level: 'Low' as const,
          color: 'border-[#86EFAC] bg-[#F0FDF4] text-[#166534]',
        };

  // Circular gauge calculations
  const strokeDashoffset = 283 - (283 * location.currentRiskScore) / 100;

  return (
    <div className="space-y-6">
      {/* 1. Regional Early Warning Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${overallSystemStatus.color}`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/80 border border-[#D0BDA3] shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-[#92400E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#7A6A55]">
                System Status
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#92400E] animate-ping" />
            </div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#2A1F13]">
              {overallSystemStatus.title}
            </h3>
            <p className="text-xs text-[#6C5C48] font-serif mt-0.5">{overallSystemStatus.desc}</p>
          </div>
        </div>

        {activeAlerts.length > 0 && (
          <button
            onClick={onOpenAlertsModal}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEE2E2] hover:bg-[#FECACA] border border-[#F87171] text-[#991B1B] text-xs font-serif font-bold transition shadow-xs cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{activeAlerts.length} Active System Alerts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected Location Highlight Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DECBB4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A6A55] font-serif">Monitored Station:</span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A1F13] tracking-tight">
              {location.name}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskColor.badge}`}
            >
              {location.currentRiskLevel} Risk
            </span>
          </div>
          <p className="text-xs text-[#6C5C48] font-serif mt-0.5">
            {location.region}, {location.country} &bull; Coordinates: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E &bull; Last updated {location.lastUpdated}
          </p>
        </div>

        <button
          onClick={() => onOpenDetails(location)}
          className="flex items-center gap-2 px-4 py-2 bg-[#92400E] hover:bg-[#78350F] text-white font-serif font-bold rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span>View Comprehensive Details</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Core Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card A: Risk Probability & Factor of Safety */}
        <div className="parchment-card rounded-2xl p-4 sm:p-5 shadow-sm border border-[#D4C3A3] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#7A6A55] uppercase tracking-wider">
              Risk Probability
            </span>
            <Gauge className="w-4 h-4 text-[#92400E]" />
          </div>

          <div className="my-3 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#2A1F13]">
                  {location.currentRiskScore}
                </span>
                <span className="text-lg font-bold text-[#7A6A55]">%</span>
              </div>
              <p className="text-xs font-serif font-bold mt-1" style={{ color: riskColor.hex }}>
                Status: {location.currentRiskLevel}
              </p>
            </div>

            {/* Radial Gauge SVG */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#E9DEC9"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={riskColor.hex}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="176"
                  strokeDashoffset={176 - (176 * location.currentRiskScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[11px] font-bold font-mono text-[#2C2114]">
                FS {location.factorOfSafety}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#DECBB4] flex items-center justify-between text-[11px] text-[#6C5C48] font-serif">
            <span>Factor of Safety (FS):</span>
            <span
              className={`font-mono font-bold ${
                location.factorOfSafety < 1.0
                  ? 'text-[#B91C1C]'
                  : location.factorOfSafety < 1.3
                  ? 'text-[#D97706]'
                  : 'text-emerald-700'
              }`}
            >
              {location.factorOfSafety} {location.factorOfSafety < 1.0 ? '(Failure Bound)' : '(Adequate)'}
            </span>
          </div>
        </div>

        {/* Card B: Current Rainfall */}
        <div className="parchment-card rounded-2xl p-4 sm:p-5 shadow-sm border border-[#D4C3A3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#7A6A55] uppercase tracking-wider">
              Rainfall Influx
            </span>
            <CloudRain className="w-4 h-4 text-sky-700" />
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#2A1F13]">
                {location.currentRainfallMmPerHour}
              </span>
              <span className="text-sm font-semibold text-[#7A6A55]">mm/h</span>
            </div>
            <p className="text-xs text-sky-700 font-serif font-medium mt-1">
              {location.currentRainfallMmPerHour > 15
                ? 'Torrential Cloudburst'
                : location.currentRainfallMmPerHour > 7
                ? 'Intense Continuous Rain'
                : 'Light to Moderate Precipitation'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#DECBB4] space-y-1">
            <div className="flex items-center justify-between text-[11px] font-serif text-[#6C5C48]">
              <span>24-Hour Cumulative:</span>
              <span className="font-mono font-bold text-sky-700">{location.rainfall24hMm} mm</span>
            </div>
            {/* Progress bar relative to 100mm threshold */}
            <div className="w-full h-1.5 bg-[#E9DEC9] rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  location.rainfall24hMm > 80
                    ? 'bg-[#B91C1C]'
                    : location.rainfall24hMm > 40
                    ? 'bg-[#D97706]'
                    : 'bg-sky-600'
                }`}
                style={{ width: `${Math.min(100, (location.rainfall24hMm / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card C: Soil Moisture & Pore Pressure */}
        <div className="parchment-card rounded-2xl p-4 sm:p-5 shadow-sm border border-[#D4C3A3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#7A6A55] uppercase tracking-wider">
              Soil Moisture Saturation
            </span>
            <Droplets className="w-4 h-4 text-emerald-700" />
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#2A1F13]">
                {location.soilMoisturePercent}
              </span>
              <span className="text-lg font-bold text-[#7A6A55]">%</span>
            </div>
            <p className="text-xs text-emerald-700 font-serif font-medium mt-1">
              {location.soilMoisturePercent > 80
                ? 'Critical Soil Saturation (Pore Liquefaction Risk)'
                : location.soilMoisturePercent > 60
                ? 'High Hydraulic Loading'
                : 'Normal Field Capacity'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#DECBB4] flex items-center justify-between text-[11px] text-[#6C5C48] font-serif">
            <span>Pore Water Tension:</span>
            <span className="font-mono font-bold text-emerald-700">
              {location.poreWaterPressureKPa} kPa
            </span>
          </div>
        </div>

        {/* Card D: Slope & Elevation */}
        <div className="parchment-card rounded-2xl p-4 sm:p-5 shadow-sm border border-[#D4C3A3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#7A6A55] uppercase tracking-wider">
              Slope &amp; Elevation
            </span>
            <Mountain className="w-4 h-4 text-[#92400E]" />
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#2A1F13]">
                {location.slope}°
              </span>
              <span className="text-sm font-semibold text-[#7A6A55]">Incline</span>
            </div>
            <p className="text-xs text-[#92400E] font-serif font-medium mt-1">
              Aspect: {location.aspect} Facing &bull; Elev: {location.elevation}m ASL
            </p>
          </div>

          <div className="pt-2 border-t border-[#DECBB4] flex items-center justify-between text-[11px] text-[#6C5C48] font-serif">
            <span>Critical Failure Angle:</span>
            <span className="font-mono font-bold text-[#92400E]">
              {location.slope >= 35 ? 'Exceeded (>35°)' : 'Sub-critical'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Active Alert for Selected Location (If exists) */}
      {location.activeAlert && (
        <div className="p-4 rounded-2xl border border-[#F87171] bg-[#FEF2F2] text-[#991B1B] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FEE2E2] text-[#B91C1C] border border-[#F87171] shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#B91C1C] text-white">
                  Active Warning
                </span>
                <span className="text-xs text-[#991B1B] font-mono">
                  Issued {location.activeAlert.issuedAt}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-serif font-bold text-[#7F1D1D] mt-1">
                {location.activeAlert.title}
              </h4>
              <p className="text-xs text-[#4B3C2A] font-serif mt-0.5">
                {location.activeAlert.message}
              </p>
              <div className="mt-2 text-xs font-serif font-semibold text-[#92400E] bg-[#FFFBEB] border border-[#FCD34D] px-2.5 py-1 rounded-md inline-block">
                Action Protocol: {location.activeAlert.recommendedAction}
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenDetails(location)}
            className="px-3.5 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-serif font-bold text-xs transition shrink-0 cursor-pointer shadow-xs"
          >
            Review Geotechnical Protocol &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

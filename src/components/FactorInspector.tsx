import React, { useState } from 'react';
import {
  MapPin,
  LocateFixed,
  Compass,
  CloudRain,
  Mountain,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Sparkles,
  PlusCircle,
  X,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';
import { PinnedLocationFactors, RiskLevel, AppSettings, MonitoredLocation } from '../types';
import { getRiskColorClass } from '../utils/riskUtils';

interface PinFactorInspectorProps {
  factors: PinnedLocationFactors | null;
  isLoading: boolean;
  settings?: AppSettings;
  onRequestAutoDetectLocation?: () => void;
  onMovePinPreset?: (lat: number, lng: number, placeName: string) => void;
  onAddAsMonitoredLocation?: (location: MonitoredLocation) => void;
  onOpenFullSimulator?: (factors: PinnedLocationFactors) => void;
  onClose?: () => void;
  isAutoLocating?: boolean;
}

export const PinFactorInspector: React.FC<PinFactorInspectorProps> = ({
  factors,
  isLoading,
  settings,
  onRequestAutoDetectLocation,
  onMovePinPreset,
  onAddAsMonitoredLocation,
  onOpenFullSimulator,
  onClose,
  isAutoLocating,
}) => {
  const [technicalReport, setTechnicalReport] = useState<string | null>(null);
  const [technicalLoading, setTechnicalLoading] = useState(false);
  const [showTechnicalModal, setShowTechnicalModal] = useState(false);

  if (!factors && !isLoading) {
    return (
      <div className="parchment-card rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-[#D4C3A3] text-[#2C2114]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4E1C6] text-[#9E4A14] border border-[#DEB288] flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#2A1F13] flex items-center gap-2">
              <span>Interactive Pin Location Inspector</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#EAE0CE] text-[#554433] border border-[#D0BDA3]">
                Live Factor Detector
              </span>
            </h4>
            <p className="text-xs font-serif text-[#6B5A44] mt-0.5">
              Click anywhere on the map to drop a pin, or use <strong className="text-[#92400E]">Auto Detect Location</strong> to evaluate your live vicinity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRequestAutoDetectLocation && (
            <button
              onClick={onRequestAutoDetectLocation}
              disabled={isAutoLocating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#2C2114] font-serif font-semibold text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <LocateFixed className={`w-4 h-4 text-[#92400E] ${isAutoLocating ? 'animate-spin' : ''}`} />
              <span>{isAutoLocating ? 'Detecting GPS...' : 'Auto Detect My Location'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading || !factors) {
    return (
      <div className="parchment-card rounded-2xl p-5 shadow-md animate-pulse border-2 border-[#D4C3A3] text-[#2C2114]">
        <div className="flex items-center justify-between border-b border-[#D8C7AD] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F4E1C6] flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#92400E] animate-spin" />
            </div>
            <div>
              <div className="h-4 w-48 bg-[#E6D9C5] rounded mb-1.5" />
              <div className="h-3 w-32 bg-[#EFE6D6] rounded" />
            </div>
          </div>
          <span className="text-xs font-mono text-[#92400E] font-semibold animate-pulse">
            Scanning Digital Elevation &amp; Factors...
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-[#EFE6D6] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const color = getRiskColorClass(factors.riskLevel);
  const displayElev =
    settings?.elevationUnit === 'ft'
      ? Math.round(factors.elevation * 3.28084)
      : factors.elevation;
  const displayRain =
    settings?.rainfallUnit === 'in'
      ? (factors.currentRainfallMmPerHour / 25.4).toFixed(2)
      : factors.currentRainfallMmPerHour;
  const displayRain24h =
    settings?.rainfallUnit === 'in'
      ? (factors.rainfall24hMm / 25.4).toFixed(1)
      : factors.rainfall24hMm;

  // Run a technical geotechnical review for the selected pin
  const handleTechnicalReview = async () => {
    setTechnicalLoading(true);
    setShowTechnicalModal(true);
    try {
      const res = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: factors.placeName,
          latitude: factors.latitude,
          longitude: factors.longitude,
          elevation: factors.elevation,
          slope: factors.slope,
          rainfallCurrent: factors.currentRainfallMmPerHour,
          rainfall24h: factors.rainfall24hMm,
          soilMoisture: factors.soilMoisturePercent,
          soilType: factors.soilType,
          vegetationCover: 'Montane slope vegetation',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTechnicalReport(
          `${data.geologicalSummary}\n\nKey Recommendations:\n` +
            (data.recommendations || []).map((r: string) => `• ${r}`).join('\n')
        );
      } else {
        setTechnicalReport(
          `Geotechnical review for ${factors.placeName}:\nSlope inclination is ${factors.slope}° with Factor of Safety ${factors.factorOfSafety}. Recommended to maintain drainage channels and observe standard monsoonal slope vigilance.`
        );
      }
    } catch {
      setTechnicalReport(
        `Geotechnical review for ${factors.placeName}:\nSlope inclination is ${factors.slope}° with Factor of Safety ${factors.factorOfSafety}. Recommended to maintain drainage channels and observe standard monsoonal slope vigilance.`
      );
    } finally {
      setTechnicalLoading(false);
    }
  };

  const handleSaveToMonitoring = () => {
    if (!onAddAsMonitoredLocation) return;
    const newStation: MonitoredLocation = {
      id: `pinned-${Date.now()}`,
      name: factors.placeName.split(',')[0] || `Sector (${factors.latitude}, ${factors.longitude})`,
      region: factors.region,
      country: 'India',
      latitude: factors.latitude,
      longitude: factors.longitude,
      elevation: factors.elevation,
      slope: factors.slope,
      aspect: factors.aspect,
      soilType: factors.soilType,
      vegetation: 'Montane Slope Regolith',
      currentRiskScore: factors.riskScore,
      currentRiskLevel: factors.riskLevel,
      currentRainfallMmPerHour: factors.currentRainfallMmPerHour,
      rainfall24hMm: factors.rainfall24hMm,
      soilMoisturePercent: factors.soilMoisturePercent,
      poreWaterPressureKPa: factors.poreWaterPressureKPa,
      factorOfSafety: factors.factorOfSafety,
      sensorHealth: 'Optimal',
      lastUpdated: 'Just now (Pin Detected)',
      history: [
        {
          timestamp: 'Now',
          riskScore: factors.riskScore,
          rainfallMm: factors.currentRainfallMmPerHour,
          soilMoisturePercent: factors.soilMoisturePercent,
        },
      ],
      description: factors.verdict,
    };
    onAddAsMonitoredLocation(newStation);
  };

  return (
    <div
      id="pin-factor-inspector-card"
      className="parchment-card rounded-3xl p-5 sm:p-7 shadow-[0_8px_30px_rgba(60,42,20,0.08)] border-2 border-[#D4C3A3] text-[#2C2114] relative space-y-4 transition-all duration-300"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8C7AD]">
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Pin Icon in warm rounded square */}
          <div className="w-9 h-9 rounded-xl bg-[#F4E1C6] text-[#9E4A14] border border-[#DEB288] flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-4 h-4 animate-pulse" />
          </div>

          {/* Peach Pill */}
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#FCECD8] text-[#9A4B16] border border-[#F6C296]">
            Pinned Location Detected
          </span>

          {/* Risk Level Badge */}
          <span
            className={`text-[11px] font-bold px-3 py-0.5 rounded-full border shadow-xs ${
              factors.riskLevel === 'Very High'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : factors.riskLevel === 'High'
                ? 'bg-orange-100 text-orange-800 border-orange-300'
                : factors.riskLevel === 'Moderate'
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {factors.riskLevel} Risk ({factors.riskScore}%)
          </span>

          {/* Timestamp */}
          <span className="text-[11px] text-[#7C6B56] font-mono">
            Detected at {factors.detectedAt}
          </span>
        </div>

        {/* Hand-Drawn Botanical & Cloud Sketches + Actions */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Botanical Tea Leaves Sketch */}
          <div className="hidden md:flex items-center" title="Flora & Geotechnical Slope Regolith">
            <svg className="w-8 h-6 text-[#5B7744] opacity-85 hover:opacity-100 transition-opacity" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 26 C18 18, 12 12, 4 10 C12 10, 16 16, 18 26 Z" fill="#6C8B52" stroke="#486236" strokeWidth="1" />
              <path d="M18 26 C18 16, 24 10, 32 8 C24 9, 19 15, 18 26 Z" fill="#7E9E61" stroke="#486236" strokeWidth="1" />
              <path d="M18 26 L18 6" stroke="#486236" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M18 6 C16 3, 20 1, 22 2 C21 5, 19 5, 18 6 Z" fill="#8EAE71" stroke="#486236" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Soft Watercolor Rain Cloud Sketch */}
          <div className="hidden md:flex items-center" title="IMD Doppler Precipitation Radar">
            <svg className="w-9 h-6 text-[#608EA5] opacity-85 hover:opacity-100 transition-opacity" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18 C7 18, 5 15.5, 6 12.5 C7 9.5, 10 9, 12 10 C13.5 6.5, 18 5, 22 7 C25 5.5, 29 7, 30 10 C33 10, 35 12, 34 15 C34 17.5, 32 18, 30 18 Z" fill="#DCE9F0" stroke="#7BA3B8" strokeWidth="1.2" />
              <line x1="12" y1="20" x2="10" y2="24" stroke="#4A84A1" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" />
              <line x1="18" y1="20" x2="16" y2="25" stroke="#4A84A1" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" />
              <line x1="24" y1="20" x2="22" y2="24" stroke="#4A84A1" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" />
              <line x1="29" y1="20" x2="27" y2="25" stroke="#4A84A1" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" />
            </svg>
          </div>

          {onRequestAutoDetectLocation && (
            <button
              onClick={onRequestAutoDetectLocation}
              disabled={isAutoLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#2C2114] text-xs font-serif font-semibold transition shadow-xs cursor-pointer disabled:opacity-60"
              title="Detect live GPS location & auto-detect its factors"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-[#92400E] ${isAutoLocating ? 'animate-spin' : ''}`} />
              <span>{isAutoLocating ? 'Detecting...' : 'Auto Detect My Location'}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8C7B67] hover:text-[#2C2114] hover:bg-[#EAE0CE] transition cursor-pointer"
              title="Close Pin Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Location Place Title & Geodetic Coordinates */}
      <div>
        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1F13] tracking-tight leading-tight">
          {factors.placeName}
        </h3>
        <p className="text-xs sm:text-sm font-serif text-[#6C5C48] mt-1">
          {factors.region} &bull;{' '}
          <span className="font-mono text-[#4A3B28]">
            {factors.latitude.toFixed(4)}°N, {factors.longitude.toFixed(4)}°E
          </span>{' '}
          &bull; Alt: {displayElev} {settings?.elevationUnit || 'm'} ASL
        </p>
      </div>

      {/* THE DIRECT GEOTECHNICAL EVALUATION & VERDICT BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F4EA] border border-[#D9C8B0] shadow-xs flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center gap-2">
          {factors.riskLevel === 'Very High' || factors.riskLevel === 'High' ? (
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#B91C1C]" />
          ) : (
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#92400E]" />
          )}
          <span className="font-bold text-xs uppercase tracking-wider text-[#3D2F1E] font-sans">
            Direct Geotechnical Evaluation &amp; Verdict:
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#3D2F1E] leading-relaxed font-serif">
          {factors.verdict.includes(':') ? (
            <>
              <strong className="font-bold text-[#92400E]">
                {factors.verdict.split(':')[0]}:
              </strong>{' '}
              <span>{factors.verdict.split(':').slice(1).join(':')}</span>
            </>
          ) : (
            factors.verdict
          )}
        </p>

        {/* HIGHLIGHTED RECOMMENDED ACTION & SAFETY PROTOCOL */}
        <div className="pt-2 border-t border-[#DECBB4]">
          <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FFFBEB] border-2 border-[#F59E0B] p-3 sm:p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded-md bg-[#D97706] text-white shadow-2xs">
                ACTION PROTOCOL
              </span>
            </div>
            <div className="text-xs sm:text-[13px] font-serif font-bold text-[#78350F] leading-relaxed">
              {factors.safetyAdvice}
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMATICALLY DETECTED FACTORS GRID */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3D2F1E] flex items-center gap-1.5 font-sans">
            <Activity className="w-3.5 h-3.5 text-[#92400E]" />
            Automatically Detected Geotechnical Factors:
          </span>
          <span className="text-[11px] font-mono text-[#8C7B67]">
            DEM &bull; IMD/Open-Meteo Telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Factor 1: Slope & Aspect */}
          <div className="bg-[#FAF6EC] border border-[#DECBB4] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[#4F3D29] text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 font-serif">
                <Mountain className="w-3.5 h-3.5 text-[#92400E]" /> Slope
              </span>
              <span className="text-[10px] font-mono text-[#523E2A]">{factors.aspect}</span>
            </div>
            <div className="font-mono text-xl font-bold text-[#92400E]">
              {factors.slope}°
            </div>
            <div className="text-[10px] font-serif text-[#4F3D29] font-medium truncate mt-0.5">
              {factors.slope > 35 ? 'Steep Escarpment' : factors.slope > 20 ? 'Moderate Hill' : 'Gentle Plain'}
            </div>
          </div>

          {/* Factor 2: Elevation */}
          <div className="bg-[#FAF6EC] border border-[#DECBB4] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[#4F3D29] text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 font-serif">
                <Layers className="w-3.5 h-3.5 text-sky-800" /> Elevation
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-[#1A1107]">
              {displayElev}
              <span className="text-xs font-serif font-bold text-[#4F3D29] ml-0.5">
                {settings?.elevationUnit || 'm'}
              </span>
            </div>
            <div className="text-[10px] font-serif text-[#4F3D29] font-medium truncate mt-0.5">
              {factors.elevation > 1500 ? 'High Montane' : factors.elevation > 500 ? 'Hill Corridor' : 'Valley Lowland'}
            </div>
          </div>

          {/* Factor 3: Current Rainfall */}
          <div className="bg-[#FAF6EC] border border-[#DECBB4] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[#4F3D29] text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 font-serif">
                <CloudRain className="w-3.5 h-3.5 text-sky-800" /> Rain Rate
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-sky-800">
              {displayRain}
              <span className="text-xs font-serif font-bold text-[#4F3D29] ml-0.5">
                {settings?.rainfallUnit || 'mm'}/h
              </span>
            </div>
            <div className="text-[10px] font-serif text-[#4F3D29] font-medium truncate mt-0.5">
              24h: {displayRain24h}{settings?.rainfallUnit || 'mm'}
            </div>
          </div>

          {/* Factor 4: Soil Saturation */}
          <div className="bg-[#FAF6EC] border border-[#DECBB4] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[#4F3D29] text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 font-serif">
                <Activity className="w-3.5 h-3.5 text-emerald-800" /> Soil Saturation
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-emerald-800">
              {factors.soilMoisturePercent}%
            </div>
            <div className="text-[10px] font-serif text-[#4F3D29] font-medium truncate mt-0.5">
              Pore Press: {factors.poreWaterPressureKPa} kPa
            </div>
          </div>

          {/* Factor 5: Factor of Safety */}
          <div className="bg-[#FAF6EC] border border-[#DECBB4] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[#4F3D29] text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 font-serif">
                <ShieldAlert className="w-3.5 h-3.5 text-[#B91C1C]" /> Factor of Safety
              </span>
            </div>
            <div
              className={`font-mono text-xl font-bold ${
                factors.factorOfSafety < 1.0
                  ? 'text-[#B91C1C]'
                  : factors.factorOfSafety < 1.25
                  ? 'text-[#B45309]'
                  : 'text-emerald-800'
              }`}
            >
              FS {factors.factorOfSafety.toFixed(2)}
            </div>
            <div className="text-[10px] font-serif text-[#4F3D29] font-medium truncate mt-0.5">
              {factors.factorOfSafety < 1.0 ? 'Unstable (<1.0)' : factors.factorOfSafety < 1.25 ? 'Marginal' : 'Stable (>1.25)'}
            </div>
          </div>

          {/* Factor 6: Soil Lithology */}
          <div className="bg-[#FAF6EC] border border-[#DECBB4] rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-[#4F3D29] text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 font-serif">
                <Layers className="w-3.5 h-3.5 text-[#92400E]" /> Lithology
              </span>
            </div>
            <div className="font-serif font-bold text-xs text-[#1A1107] line-clamp-2 leading-tight">
              {factors.soilType}
            </div>
            <div className="text-[10px] font-serif text-[#4F3D29] truncate mt-1 font-medium">
              GSI Strata Classification
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR: Presets, Botanical Center Doodle & Primary Buttons */}
      <div className="pt-2.5 border-t border-[#D8C7AD] flex flex-wrap items-center justify-between gap-3">
        {/* Quick regional pin presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] uppercase font-mono font-bold mr-1 text-[#7A6A55]">
            PIN SAMPLE SECTORS:
          </span>
          {onMovePinPreset && (
            <>
              <button
                onClick={() => onMovePinPreset(11.5167, 76.1333, 'Meppadi, Wayanad (W. Ghats)')}
                className="px-2.5 py-1 rounded-lg bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#3D2F1E] text-[11px] font-serif font-medium transition cursor-pointer"
              >
                Wayanad (38°)
              </button>
              <button
                onClick={() => onMovePinPreset(30.5564, 79.5678, 'Kedarnath Valley, Uttarakhand')}
                className="px-2.5 py-1 rounded-lg bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#3D2F1E] text-[11px] font-serif font-medium transition cursor-pointer"
              >
                Kedarnath (42°)
              </button>
              <button
                onClick={() => onMovePinPreset(10.0889, 77.0595, 'Munnar Gap Road, Kerala')}
                className="px-2.5 py-1 rounded-lg bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#3D2F1E] text-[11px] font-serif font-medium transition cursor-pointer"
              >
                Munnar (33°)
              </button>
              <button
                onClick={() => onMovePinPreset(30.5564, 79.5678, 'Joshimath Subsidized Slope, UK')}
                className="px-2.5 py-1 rounded-lg bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#3D2F1E] text-[11px] font-serif font-medium transition cursor-pointer"
              >
                Joshimath (35°)
              </button>
              <button
                onClick={() => onMovePinPreset(25.5788, 91.8933, 'Shillong Ridge, Meghalaya')}
                className="px-2.5 py-1 rounded-lg bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#3D2F1E] text-[11px] font-serif font-medium transition cursor-pointer"
              >
                Shillong (29°)
              </button>
            </>
          )}
        </div>

        {/* Delicate Center Leaf Doodle in Bottom Bar */}
        <div className="hidden xl:flex items-center">
          <svg className="w-7 h-5 text-[#5B7744] opacity-80" viewBox="0 0 36 28" fill="none">
            <path d="M18 26 C18 18, 12 12, 4 10 C12 10, 16 16, 18 26 Z" fill="#6C8B52" stroke="#486236" strokeWidth="1" />
            <path d="M18 26 C18 16, 24 10, 32 8 C24 9, 19 15, 18 26 Z" fill="#7E9E61" stroke="#486236" strokeWidth="1" />
            <path d="M18 26 L18 6" stroke="#486236" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Primary Buttons */}
        <div className="flex items-center gap-2">
          {onAddAsMonitoredLocation && (
            <button
              onClick={handleSaveToMonitoring}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#2C2114] text-xs font-serif font-semibold transition shadow-xs cursor-pointer"
              title="Add this location to the active monitoring radar"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#92400E]" />
              <span>+ Add to Monitored List</span>
            </button>
          )}

          <button
            onClick={handleTechnicalReview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#92400E] hover:bg-[#78350F] text-white text-xs font-serif font-semibold transition shadow-sm cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
            <span>Technical Risk Review</span>
          </button>

          {onOpenFullSimulator && (
            <button
              onClick={() => onOpenFullSimulator(factors)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3ECE0] hover:bg-[#EAE0D0] border border-[#D0BDA3] text-[#92400E] text-xs font-serif font-semibold transition shadow-xs cursor-pointer"
              title="Open full geotechnical simulator with these factors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Simulator &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Telemetry Toast Notification (matching bottom-right of reference image) */}
      <div className="fixed bottom-5 right-5 z-40 max-w-sm hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF6EC] border border-[#D0BDA3] text-[#2C2114] text-xs font-serif shadow-lg animate-in slide-in-from-bottom-2 duration-300">
        <span className="w-2 h-2 rounded-full bg-[#B91C1C] animate-ping shrink-0" />
        <span className="truncate">
          📍 Pinned {factors.placeName.split(',')[0]}: Slope {factors.slope}°, Rain {displayRain}mm/h, Risk: {factors.riskLevel} ({factors.riskScore}%).
        </span>
      </div>

      {/* Technical review modal */}
      {showTechnicalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2114]/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowTechnicalModal(false)}
        >
          <div
            className="bg-[#FAF6EC] border-2 border-[#D4C3A3] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-[#2C2114]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D8C7AD]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#92400E]" />
                <h4 className="font-serif font-bold text-sm text-[#2A1F13]">
                  Geotechnical Risk Review
                </h4>
              </div>
              <button
                onClick={() => setShowTechnicalModal(false)}
                className="p-1 rounded-lg text-[#8C7B67] hover:text-[#2C2114] hover:bg-[#EAE0CE] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#1A1107] leading-relaxed max-h-72 overflow-y-auto space-y-3 font-serif bg-[#FAF5EA] p-3.5 rounded-xl border border-[#D0BDA3]">
              {technicalLoading ? (
                <div className="flex items-center gap-2 text-[#92400E] py-6 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reviewing slope shear dynamics and site telemetry...</span>
                </div>
              ) : (
                <div className="whitespace-pre-line font-serif text-xs text-[#3D2F1E]">
                  {technicalReport}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTechnicalModal(false)}
                className="px-4 py-2 rounded-xl bg-[#92400E] hover:bg-[#78350F] text-white font-serif font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MonitoredLocation, RiskLevel, AiEvaluationResponse } from '../types';
import { estimateSlopeRisk, getRiskColorClass } from '../utils/riskUtils';
import {
  X,
  Compass,
  Sparkles,
  Mountain,
  CloudRain,
  Droplets,
  Check,
  PlusCircle,
  AlertCircle,
  Gauge,
  Layers,
  Send,
  Sliders,
  Radio,
  MapPin,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Trees
} from 'lucide-react';

interface TerrainEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocation: (location: MonitoredLocation) => void;
  initialCoords?: { lat: number; lng: number } | null;
  initialLocation?: MonitoredLocation | null;
  allLocations?: MonitoredLocation[];
  onSelectLocation?: (loc: MonitoredLocation) => void;
  onSimulateAction?: (message: string) => void;
}

export const TerrainEvaluatorModal: React.FC<TerrainEvaluatorModalProps> = ({
  isOpen,
  onClose,
  onAddLocation,
  initialCoords,
  initialLocation,
  allLocations = [],
  onSelectLocation,
  onSimulateAction,
}) => {
  // Active Evaluator Mode: 'station' (evaluating monitored sector) vs 'custom' (evaluating custom coordinates / map click)
  const [evalMode, setEvalMode] = useState<'station' | 'custom'>(
    initialCoords ? 'custom' : initialLocation ? 'station' : 'station'
  );

  // Station Evaluation State
  const [selectedStation, setSelectedStation] = useState<MonitoredLocation>(
    initialLocation || allLocations[0] || {
      id: 'default',
      name: 'Default Slope Sector',
      region: 'Western Ghats',
      country: 'India',
      latitude: 11.538,
      longitude: 76.134,
      elevation: 980,
      slope: 38,
      aspect: 'SW',
      soilType: 'Residual Laterite with Colluvial Clay',
      vegetation: 'Tea plantation & secondary forest',
      currentRiskScore: 78,
      currentRiskLevel: 'Very High',
      currentRainfallMmPerHour: 28.5,
      rainfall24hMm: 165.0,
      soilMoisturePercent: 88,
      poreWaterPressureKPa: 18.4,
      factorOfSafety: 0.94,
      sensorHealth: 'Optimal',
      lastUpdated: 'Live',
      history: [],
      description: 'Monitored sector.',
    }
  );

  // Station Scenario Stress Simulator Sliders
  const [stationSimRain, setStationSimRain] = useState(selectedStation.currentRainfallMmPerHour);
  const [stationSimSoil, setStationSimSoil] = useState(selectedStation.soilMoisturePercent);
  const [stationSimSlope, setStationSimSlope] = useState(selectedStation.slope);
  const [stationBroadcastSent, setStationBroadcastSent] = useState(false);

  // Custom Coordinates State
  const [customName, setCustomName] = useState('Kedarnath Valley Slope Sector 4');
  const [customRegion, setCustomRegion] = useState('Uttarakhand Himalayas');
  const [customLat, setCustomLat] = useState(initialCoords?.lat ?? 30.5564);
  const [customLng, setCustomLng] = useState(initialCoords?.lng ?? 79.5678);
  const [customElevation, setCustomElevation] = useState(1850);
  const [customSlope, setCustomSlope] = useState(38);
  const [customRainfallCurrent, setCustomRainfallCurrent] = useState(16.5);
  const [customRainfall24h, setCustomRainfall24h] = useState(95.0);
  const [customSoilMoisture, setCustomSoilMoisture] = useState(82);
  const [customSoilType, setCustomSoilType] = useState('Weathered Gneiss & Colluvial Moraine with Clayey Silt');

  // Technical risk review state
  const [technicalLoading, setTechnicalLoading] = useState(false);
  const [technicalResult, setTechnicalResult] = useState<AiEvaluationResponse | null>(null);

  // Sync when initialLocation or initialCoords change
  useEffect(() => {
    if (initialCoords) {
      setEvalMode('custom');
      setCustomLat(initialCoords.lat);
      setCustomLng(initialCoords.lng);
      setCustomName(`Terrain Point (${initialCoords.lat.toFixed(4)}°N, ${initialCoords.lng.toFixed(4)}°E)`);
      setTechnicalResult(null);
    } else if (initialLocation) {
      setEvalMode('station');
      setSelectedStation(initialLocation);
      setStationSimRain(initialLocation.currentRainfallMmPerHour);
      setStationSimSoil(initialLocation.soilMoisturePercent);
      setStationSimSlope(initialLocation.slope);
      setStationBroadcastSent(false);
      setTechnicalResult(null);
    }
  }, [initialCoords, initialLocation]);

  // Recalculate station stress test
  const stationCalculated = estimateSlopeRisk({
    slopeDeg: stationSimSlope,
    rainfallCurrent: stationSimRain,
    rainfall24h: selectedStation.rainfall24hMm + (stationSimRain - selectedStation.currentRainfallMmPerHour) * 4,
    soilMoisture: stationSimSoil,
  });

  // Recalculate custom evaluation
  const customCalculated = estimateSlopeRisk({
    slopeDeg: customSlope,
    rainfallCurrent: customRainfallCurrent,
    rainfall24h: customRainfall24h,
    soilMoisture: customSoilMoisture,
  });

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Run technical geotechnical assessment
  const handleRunTechnicalEvaluation = async () => {
    setTechnicalLoading(true);
    const target =
      evalMode === 'station'
        ? {
            locationName: selectedStation.name,
            latitude: selectedStation.latitude,
            longitude: selectedStation.longitude,
            elevation: selectedStation.elevation,
            slope: stationSimSlope,
            rainfallCurrent: stationSimRain,
            rainfall24h: selectedStation.rainfall24hMm,
            soilMoisture: stationSimSoil,
            soilType: selectedStation.soilType,
            vegetationCover: selectedStation.vegetation,
          }
        : {
            locationName: customName,
            latitude: customLat,
            longitude: customLng,
            elevation: customElevation,
            slope: customSlope,
            rainfallCurrent: customRainfallCurrent,
            rainfall24h: customRainfall24h,
            soilMoisture: customSoilMoisture,
            soilType: customSoilType,
            vegetationCover: 'Mixed montane scrub & slopes',
          };

    try {
      const res = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      });
      if (res.ok) {
        const data = await res.json();
        setTechnicalResult(data);
      }
    } catch (e) {
      console.error('Risk assessment failed:', e);
    } finally {
      setTechnicalLoading(false);
    }
  };

  // Pin custom evaluated sector to active radar
  const handleSaveCustomToMap = () => {
    const finalRiskScore = technicalResult?.riskScore ?? customCalculated.riskScore;
    const finalRiskLevel = technicalResult?.riskLevel ?? customCalculated.riskLevel;
    const finalFS = technicalResult ? Number(technicalResult.stabilityFactor) : customCalculated.factorOfSafety;

    const newLoc: MonitoredLocation = {
      id: `custom-${Date.now()}`,
      name: customName,
      region: customRegion,
      country: 'Site Assessment',
      latitude: customLat,
      longitude: customLng,
      elevation: customElevation,
      slope: customSlope,
      aspect: 'W',
      soilType: customSoilType,
      vegetation: 'Coniferous forest & montane scrub',
      currentRiskScore: finalRiskScore,
      currentRiskLevel: finalRiskLevel,
      currentRainfallMmPerHour: customRainfallCurrent,
      rainfall24hMm: customRainfall24h,
      soilMoisturePercent: customSoilMoisture,
      poreWaterPressureKPa: customCalculated.poreWaterPressure,
      factorOfSafety: finalFS,
      sensorHealth: 'Optimal',
      lastUpdated: 'Just now',
      description: technicalResult?.geologicalSummary || 'Custom location evaluated via terrain telemetry analyzer.',
      history: [
        { timestamp: '00:00', riskScore: Math.max(10, finalRiskScore - 30), rainfallMm: 2, soilMoisturePercent: 50 },
        { timestamp: '06:00', riskScore: Math.max(15, finalRiskScore - 20), rainfallMm: 5, soilMoisturePercent: 58 },
        { timestamp: '12:00', riskScore: Math.max(20, finalRiskScore - 10), rainfallMm: 9, soilMoisturePercent: 68 },
        { timestamp: '18:00', riskScore: finalRiskScore, rainfallMm: customRainfallCurrent, soilMoisturePercent: customSoilMoisture }
      ],
    };

    onAddLocation(newLoc);
    onClose();
  };

  const currentDisplayRiskLevel =
    technicalResult?.riskLevel ||
    (evalMode === 'station' ? stationCalculated.riskLevel : customCalculated.riskLevel);
  const color = getRiskColorClass(currentDisplayRiskLevel);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-[#2C2114]/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="parchment-card border border-[#D4C3A3] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#2C2114]">
        
        {/* Modal Top Navigation & Mode Switcher */}
        <div className="p-4 sm:p-5 border-b border-[#DECBB4] bg-[#F5EDE0]/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#92400E] border border-[#D0BDA3] shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2A1F13] tracking-tight flex items-center gap-2">
                <span>Terrain &amp; Slope Risk Evaluator</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white text-[#92400E] border border-[#DECBB4]">
                  Field Dossier
                </span>
              </h3>
              <p className="text-xs text-[#6C5C48] font-serif">
                Single unified tool for station inspection, stress testing, and custom coordinate assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-[#FAF6EC] p-1 rounded-xl border border-[#DECBB4] text-xs">
              <button
                type="button"
                onClick={() => {
                  setEvalMode('station');
                  setTechnicalResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-serif font-bold transition cursor-pointer ${
                  evalMode === 'station'
                    ? 'bg-[#92400E] text-white shadow-xs'
                    : 'text-[#6C5C48] hover:text-[#2C2114]'
                }`}
              >
                Monitored Station
              </button>
              <button
                type="button"
                onClick={() => {
                  setEvalMode('custom');
                  setTechnicalResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-serif font-bold transition cursor-pointer ${
                  evalMode === 'custom'
                    ? 'bg-[#92400E] text-white shadow-xs'
                    : 'text-[#6C5C48] hover:text-[#2C2114]'
                }`}
              >
                Custom Coordinates
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-[#FAF6EC] text-[#6C5C48] hover:text-[#2C2114] border border-[#DECBB4] transition cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-[#4B3C2A]">
          
          {/* ===================== MODE 1: MONITORED STATION ===================== */}
          {evalMode === 'station' && (
            <div className="space-y-5">
              {/* Station Selection and Status Bar */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#DECBB4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#92400E]" />
                    <span className="font-serif font-bold text-[#6C5C48]">Inspecting Sector Station:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStation.id}
                      onChange={(e) => {
                        const found = allLocations.find((l) => l.id === e.target.value);
                        if (found) {
                          setSelectedStation(found);
                          setStationSimRain(found.currentRainfallMmPerHour);
                          setStationSimSoil(found.soilMoisturePercent);
                          setStationSimSlope(found.slope);
                          setTechnicalResult(null);
                          if (onSelectLocation) onSelectLocation(found);
                        }
                      }}
                      className="text-sm font-serif font-bold text-[#2A1F13] bg-white border border-[#DECBB4] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#92400E] cursor-pointer shadow-xs"
                    >
                      {allLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} — {loc.region} ({loc.currentRiskLevel})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-[#7A6A55] font-mono">
                    {selectedStation.latitude.toFixed(4)}°N, {selectedStation.longitude.toFixed(4)}°E &bull; {selectedStation.elevation}m ASL &bull; Sensor Health: {selectedStation.sensorHealth}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-[#7A6A55] block">Baseline Risk</span>
                    <span className="text-lg font-black font-mono text-[#2A1F13]">
                      {selectedStation.currentRiskScore}%
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColorClass(selectedStation.currentRiskLevel).badge}`}>
                    {selectedStation.currentRiskLevel}
                  </span>
                </div>
              </div>

              {/* Station Geotechnical Sensor Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/80 border border-[#DECBB4] shadow-xs">
                  <span className="text-[#7A6A55] text-[10px] block font-serif">Slope Angle</span>
                  <span className="text-sm font-bold text-[#92400E] font-mono">{selectedStation.slope}°</span>
                  <span className="text-[10px] text-[#7A6A55] block font-serif">Aspect: {selectedStation.aspect}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-[#DECBB4] shadow-xs">
                  <span className="text-[#7A6A55] text-[10px] block font-serif">Live Rainfall</span>
                  <span className="text-sm font-bold text-sky-700 font-mono">{selectedStation.currentRainfallMmPerHour} mm/h</span>
                  <span className="text-[10px] text-[#7A6A55] block font-serif">24h: {selectedStation.rainfall24hMm} mm</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-[#DECBB4] shadow-xs">
                  <span className="text-[#7A6A55] text-[10px] block font-serif">Soil Saturation</span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">{selectedStation.soilMoisturePercent}%</span>
                  <span className="text-[10px] text-[#7A6A55] block font-serif">Pore-water: {selectedStation.poreWaterPressureKPa} kPa</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-[#DECBB4] shadow-xs">
                  <span className="text-[#7A6A55] text-[10px] block font-serif">Factor of Safety</span>
                  <span className={`text-sm font-bold font-mono ${selectedStation.factorOfSafety < 1.0 ? 'text-[#B91C1C]' : 'text-emerald-700'}`}>
                    FS {selectedStation.factorOfSafety}
                  </span>
                  <span className="text-[10px] text-[#7A6A55] block font-serif">
                    {selectedStation.factorOfSafety < 1.0 ? 'Critical' : 'Stable'}
                  </span>
                </div>
              </div>

              {/* Geological Stratigraphy & Vegetation */}
              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#DECBB4] grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-serif text-[#7A6A55] font-bold block mb-0.5">Soil Lithology &amp; Bedrock</span>
                  <p className="text-[#2C2114] font-serif">{selectedStation.soilType}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-serif text-[#7A6A55] font-bold block mb-0.5">Vegetation &amp; Root Cohesion</span>
                  <p className="text-[#2C2114] font-serif">{selectedStation.vegetation}</p>
                </div>
              </div>

              {/* Real-time Scenario Stress Simulator for Station */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#DECBB4] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#92400E]" />
                    <span className="font-serif font-bold text-[#2A1F13] text-xs uppercase tracking-wider">
                      Interactive Weather &amp; Slope Stress Test
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStationSimRain(selectedStation.currentRainfallMmPerHour);
                      setStationSimSoil(selectedStation.soilMoisturePercent);
                      setStationSimSlope(selectedStation.slope);
                    }}
                    className="text-[11px] font-serif text-[#92400E] hover:text-[#78350F] font-bold cursor-pointer"
                  >
                    Reset to Live
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Rainfall slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-serif">
                      <span className="text-[#6C5C48]">Simulated Rain Rate:</span>
                      <span className="font-mono text-sky-700 font-bold">{stationSimRain.toFixed(1)} mm/h</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="0.5"
                      value={stationSimRain}
                      onChange={(e) => setStationSimRain(Number(e.target.value))}
                      className="w-full accent-sky-700 cursor-pointer"
                    />
                  </div>

                  {/* Soil Moisture slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-serif">
                      <span className="text-[#6C5C48]">Soil Saturation:</span>
                      <span className="font-mono text-emerald-700 font-bold">{stationSimSoil}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={stationSimSoil}
                      onChange={(e) => setStationSimSoil(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  {/* Slope Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-serif">
                      <span className="text-[#6C5C48]">Slope Incline:</span>
                      <span className="font-mono text-[#92400E] font-bold">{stationSimSlope}°</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={stationSimSlope}
                      onChange={(e) => setStationSimSlope(Number(e.target.value))}
                      className="w-full accent-[#92400E] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Simulated Geotechnical Outcome */}
                <div className="p-3 rounded-xl bg-[#FAF6EC] border border-[#DECBB4] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#7A6A55] uppercase font-mono">Stress-Test Outcome</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xl font-bold font-mono text-[#2A1F13]">
                        {stationCalculated.riskScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getRiskColorClass(stationCalculated.riskLevel).badge}`}>
                        {stationCalculated.riskLevel} Hazard
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-[#7A6A55] block font-serif">Simulated FS</span>
                    <span className={`text-base font-bold ${stationCalculated.factorOfSafety < 1.0 ? 'text-[#B91C1C]' : 'text-emerald-700'}`}>
                      FS {stationCalculated.factorOfSafety}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== MODE 2: CUSTOM COORDINATES ===================== */}
          {evalMode === 'custom' && (
            <div className="space-y-5">
              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-[#DECBB4]">
                <span className="text-[11px] text-[#7A6A55] font-serif">Test India Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomName('Uttarkashi Bhagirathi Valley Cut-Slope');
                    setCustomRegion('Uttarakhand Garhwal');
                    setCustomLat(30.7268);
                    setCustomLng(78.4354);
                    setCustomElevation(1352);
                    setCustomSlope(43);
                    setCustomRainfallCurrent(26);
                    setCustomRainfall24h(140);
                    setCustomSoilMoisture(92);
                    setCustomSoilType('Weathered Phyllite & Fractured Quartzite with Debris Wedge');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-[#FAF6EC] border border-[#DECBB4] rounded-lg text-[11px] font-serif text-[#92400E] font-semibold transition cursor-pointer shadow-xs"
                >
                  Himalayan Cloudburst (Uttarkashi)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomName('Idukki Munnar Ghat Gap');
                    setCustomRegion('Western Ghats, Kerala');
                    setCustomLat(10.0889);
                    setCustomLng(77.0595);
                    setCustomElevation(1530);
                    setCustomSlope(39);
                    setCustomRainfallCurrent(19);
                    setCustomRainfall24h(125);
                    setCustomSoilMoisture(86);
                    setCustomSoilType('Residual Laterite over Charnockite Basement');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-[#FAF6EC] border border-[#DECBB4] rounded-lg text-[11px] font-serif text-emerald-800 font-semibold transition cursor-pointer shadow-xs"
                >
                  Western Ghats (Idukki)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomName('Kohima-Dimapur Bypass Sinking Zone');
                    setCustomRegion('Nagaland (Northeast Hills)');
                    setCustomLat(25.6751);
                    setCustomLng(94.1086);
                    setCustomElevation(1444);
                    setCustomSlope(34);
                    setCustomRainfallCurrent(12);
                    setCustomRainfall24h(82);
                    setCustomSoilMoisture(78);
                    setCustomSoilType('Disang Shales with Expansive Smectite Clay Matrix');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-[#FAF6EC] border border-[#DECBB4] rounded-lg text-[11px] font-serif text-sky-800 font-semibold transition cursor-pointer shadow-xs"
                >
                  Northeast Hill Tracts (Nagaland)
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">Site / Sector Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-[#2A1F13] text-xs font-serif focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">Region / Basin</label>
                  <input
                    type="text"
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-[#2A1F13] text-xs font-serif focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(Number(e.target.value))}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-[#2A1F13] text-xs font-mono focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(Number(e.target.value))}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-[#2A1F13] text-xs font-mono focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">Elevation (m ASL)</label>
                  <input
                    type="number"
                    value={customElevation}
                    onChange={(e) => setCustomElevation(Number(e.target.value))}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-[#2A1F13] text-xs font-mono focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">Slope Incline (°)</label>
                  <input
                    type="number"
                    min="5"
                    max="65"
                    value={customSlope}
                    onChange={(e) => setCustomSlope(Number(e.target.value))}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-[#92400E] font-mono font-bold text-xs focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">Current Rainfall (mm/h)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customRainfallCurrent}
                    onChange={(e) => setCustomRainfallCurrent(Number(e.target.value))}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-sky-700 font-mono font-bold text-xs focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">24h Cumulative Rainfall (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={customRainfall24h}
                    onChange={(e) => setCustomRainfall24h(Number(e.target.value))}
                    className="w-full bg-white border border-[#DECBB4] rounded-xl px-3 py-2 text-sky-700 font-mono text-xs focus:ring-2 focus:ring-[#92400E] focus:outline-none shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#6C5C48] font-serif font-semibold mb-1">
                    Soil Moisture Saturation (% Volumetric)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={customSoilMoisture}
                    onChange={(e) => setCustomSoilMoisture(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-emerald-700 mt-1">
                    <span>Drained (10%)</span>
                    <span>Current: {customSoilMoisture}%</span>
                    <span>Fully Saturated (100%)</span>
                  </div>
                </div>
              </div>

              {/* Custom Real-time Estimation Banner */}
              <div className="p-4 rounded-2xl border bg-[#FAF6EC] shadow-xs space-y-2" style={{ borderColor: color.hex }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#7A6A55]">
                      Geotechnical Estimation for Custom Point
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-2xl font-black font-mono" style={{ color: color.hex }}>
                        {technicalResult?.riskScore ?? customCalculated.riskScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${color.badge}`}>
                        {technicalResult?.riskLevel ?? customCalculated.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-[#7A6A55] block font-serif">Factor of Safety</span>
                    <span className="text-xl font-bold text-[#2A1F13]">
                      FS {technicalResult?.stabilityFactor ?? customCalculated.factorOfSafety}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical assessment verdict */}
          {technicalResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#92400E]/40 space-y-3 shadow-xs animate-in fade-in slide-in-from-top-2 font-serif">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#92400E] flex items-center gap-1.5 font-serif">
                  <ShieldCheck className="w-4 h-4 text-[#92400E]" />
                  GEOTECHNICAL RISK ASSESSMENT
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColorClass(technicalResult.riskLevel).badge}`}>
                  {technicalResult.riskLevel} ({technicalResult.riskScore}% Risk &bull; FS {technicalResult.stabilityFactor})
                </span>
              </div>

              <p className="text-xs text-[#2C2114] leading-relaxed">
                {technicalResult.geologicalSummary}
              </p>

              {technicalResult.criticalFactors && technicalResult.criticalFactors.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-[#DECBB4]">
                  <span className="text-[10px] uppercase font-mono text-[#7A6A55] font-bold">Key Slope Destabilizers:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {technicalResult.criticalFactors.map((cf, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#FAF6EC] border border-[#DECBB4] text-[11px]">
                        <span className="font-bold text-[#2A1F13]">{cf.factor}:</span>{' '}
                        <span className="text-[#4B3C2A]">{cf.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {technicalResult.recommendations && technicalResult.recommendations.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-[#DECBB4]">
                  <span className="text-[10px] uppercase font-mono text-[#7A6A55] font-bold">Civil Defense Mitigation Actions:</span>
                  <ul className="space-y-1 text-xs text-[#2C2114]">
                    {technicalResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#92400E] font-bold">&bull;</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Unified Footer Actions */}
        <div className="p-4 bg-[#F5EDE0] border-t border-[#DECBB4] flex flex-wrap items-center justify-between gap-3">
          {/* Technical assessment button */}
          <button
            type="button"
            onClick={handleRunTechnicalEvaluation}
            disabled={technicalLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF6EC] text-[#92400E] font-serif font-bold rounded-xl text-xs transition border border-[#D0BDA3] cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <ShieldCheck className={`w-4 h-4 ${technicalLoading ? 'animate-spin' : ''}`} />
            <span>{technicalLoading ? 'Reviewing terrain metrics...' : 'Run Technical Risk Assessment'}</span>
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#FAF6EC] border border-[#DECBB4] text-[#6C5C48] text-xs font-serif font-semibold rounded-xl transition cursor-pointer shadow-xs"
            >
              Close
            </button>

            {evalMode === 'custom' && (
              <button
                type="button"
                onClick={handleSaveCustomToMap}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#92400E] hover:bg-[#78350F] text-white text-xs font-serif font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Pin Sector to Active Radar</span>
              </button>
            )}

            {evalMode === 'station' && (
              <button
                type="button"
                onClick={() => {
                  setStationBroadcastSent(true);
                  if (onSimulateAction) {
                    onSimulateAction(`Simulated emergency telemetry broadcast for ${selectedStation.name}`);
                  }
                }}
                disabled={stationBroadcastSent}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#92400E] hover:bg-[#78350F] text-white text-xs font-serif font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{stationBroadcastSent ? 'Dispatched' : 'Dispatch Evacuation Directive'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

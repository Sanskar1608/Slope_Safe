import React, { useState } from 'react';
import { HISTORICAL_LANDSLIDES, HistoricalLandslideEvent } from '../data/historicalLandslides';
import {
  History,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Compass,
  MapPin,
  Clock,
  CloudRain,
  Mountain,
  Users,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface HistoricalLandslidesArchiveProps {
  onViewOnMap: (lat: number, lng: number, placeName: string) => void;
  onSimulateEvent: (coords: { lat: number; lng: number }) => void;
}

export const HistoricalLandslidesArchive: React.FC<HistoricalLandslidesArchiveProps> = ({
  onViewOnMap,
  onSimulateEvent
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(HISTORICAL_LANDSLIDES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('all');

  const states = Array.from(new Set(HISTORICAL_LANDSLIDES.map((e) => e.state)));

  const filteredEvents = HISTORICAL_LANDSLIDES.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'all' || e.state === selectedState;
    return matchesSearch && matchesState;
  });

  const activeEvent =
    HISTORICAL_LANDSLIDES.find((e) => e.id === selectedEventId) || HISTORICAL_LANDSLIDES[0];

  return (
    <div className="space-y-6">
      {/* Archive Hero Banner */}
      <div className="parchment-card rounded-2xl p-6 border border-[#D2BF9E] shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE4D2] border border-[#CDBAA0] text-xs font-serif font-bold text-[#853D0A]">
            <History className="w-3.5 h-3.5 text-[#92400E]" />
            <span>National Geotechnical Disaster Archive &bull; Retrospective Analysis</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1107] tracking-tight">
            Historical Landslide Case Studies &amp; Life-Saving Protocols
          </h2>

          <p className="text-xs sm:text-sm text-[#3D2C1A] font-serif leading-relaxed">
            Examine major recorded landslide disasters across the Himalayas and Western Ghats.
            Discover how Slope Safe&apos;s early-warning algorithm, IoT piezometers, and Doppler rainfall thresholds
            could have detected slope destabilization hours in advance to protect lives.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#EFE4D2] p-3 rounded-xl border border-[#D0BDA3]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#6B543D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search disasters by name, district, or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FAF5EA] border border-[#CEBDA2] text-xs font-serif text-[#1A1107] placeholder-[#6C5C48] focus:outline-none focus:ring-1 focus:ring-[#92400E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-[#6B543D]" />
          <span className="text-xs font-serif text-[#3D2C1A] font-bold">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#FAF5EA] border border-[#CEBDA2] text-xs font-serif text-[#1A1107] font-semibold focus:outline-none focus:ring-1 focus:ring-[#92400E] cursor-pointer"
          >
            <option value="all">All States ({HISTORICAL_LANDSLIDES.length})</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Events List on the Left, In-Depth Case Study on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Event Cards List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-serif font-black uppercase tracking-wider text-on-landslide-heading px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-xs" />
            <span>Recorded Catastrophes ({filteredEvents.length})</span>
          </h3>

          <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
            {filteredEvents.map((event) => {
              const isSelected = event.id === activeEvent.id;
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF5EA] border-2 border-[#92400E] shadow-md -translate-y-0.5'
                      : 'bg-[#F6EFE2] hover:bg-[#FAF5EA] border-[#D0BDA3] hover:border-[#B45309]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E5D7C1] text-[#4A3926] font-bold">
                      {event.year} &bull; {event.state}
                    </span>
                    <span className="text-[11px] font-serif font-bold text-[#B91C1C] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#B91C1C]" />
                      <span>{event.fatalities}+ Fatalities</span>
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#1A1107] leading-snug">
                    {event.name}
                  </h4>

                  <p className="text-[11px] font-serif text-[#4F3D29] line-clamp-1 mt-1 font-medium">
                    {event.locationName}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#DECBB4] flex items-center justify-between text-[11px] font-serif">
                    <span className="text-[#853D0A] font-bold">
                      Lead Time: +{event.appSolution.leadTimeHours} Hours
                    </span>
                    <span className="text-[#92400E] font-bold flex items-center gap-0.5">
                      Case File &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Case Study & Slope Safe Solution */}
        <div className="lg:col-span-8 space-y-6">
          <div className="parchment-card rounded-2xl p-6 border border-[#D2BF9E] shadow-sm space-y-6">
            {/* Header */}
            <div className="border-b border-[#D0BDA3] pb-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] border border-[#F87171] text-xs font-serif font-bold flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Historic Disaster: {activeEvent.year}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#EBE0CD] text-[#2C1F10] border border-[#CEBDA2] text-xs font-mono font-bold">
                    {activeEvent.state}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onViewOnMap(
                        activeEvent.coordinates.lat,
                        activeEvent.coordinates.lng,
                        activeEvent.name
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#92400E] hover:bg-[#78350F] text-white text-xs font-serif font-bold transition shadow-xs cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Inspect on Live Map</span>
                  </button>

                  <button
                    onClick={() => onSimulateEvent(activeEvent.coordinates)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] border border-[#CEBDA2] text-[#1A1107] text-xs font-serif font-bold transition shadow-xs cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#92400E]" />
                    <span>Simulate in Evaluator</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1107]">
                  {activeEvent.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#4F3D29] font-serif font-medium mt-1">
                  Location: {activeEvent.locationName} &bull; Coordinates: {activeEvent.coordinates.lat.toFixed(4)}°N, {activeEvent.coordinates.lng.toFixed(4)}°E
                </p>
              </div>

              {/* Event Quick Statistics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#FAF5EA] p-3 rounded-xl border border-[#D0BDA3]">
                  <span className="text-[11px] font-serif text-[#4F3D29] font-bold block">Fatalities</span>
                  <span className="text-lg font-mono font-bold text-[#B91C1C]">
                    {activeEvent.fatalities}+ deaths
                  </span>
                  <span className="text-[10px] text-[#4F3D29] font-serif block truncate">
                    {activeEvent.injuredOrDisplaced}
                  </span>
                </div>

                <div className="bg-[#FAF5EA] p-3 rounded-xl border border-[#D0BDA3]">
                  <span className="text-[11px] font-serif text-[#4F3D29] font-bold block">Rainfall Trigger</span>
                  <span className="text-lg font-mono font-bold text-sky-800">
                    {activeEvent.rainfallMm24h} mm/24h
                  </span>
                  <span className="text-[10px] text-[#4F3D29] font-serif block truncate">
                    Severe Monsoon Cloudburst
                  </span>
                </div>

                <div className="bg-[#FAF5EA] p-3 rounded-xl border border-[#D0BDA3]">
                  <span className="text-[11px] font-serif text-[#4F3D29] font-bold block">Slope Incline</span>
                  <span className="text-lg font-mono font-bold text-[#92400E]">
                    {activeEvent.slopeAngle}°
                  </span>
                  <span className="text-[10px] text-[#4F3D29] font-serif block truncate">
                    Critical Escarpment
                  </span>
                </div>

                <div className="bg-[#FAF5EA] p-3 rounded-xl border border-[#D0BDA3]">
                  <span className="text-[11px] font-serif text-[#4F3D29] font-bold block">Date of Occurrence</span>
                  <span className="text-sm font-serif font-bold text-[#1A1107] mt-1 block">
                    {activeEvent.date}
                  </span>
                  <span className="text-[10px] text-[#4F3D29] font-serif block">
                    Historical Record
                  </span>
                </div>
              </div>
            </div>

            {/* Event Summary & Root Cause */}
            <div className="space-y-4 text-xs font-serif leading-relaxed text-[#2C1F10]">
              <div>
                <h4 className="font-bold text-sm text-[#1A1107] mb-1">What Happened:</h4>
                <p className="bg-[#FAF5EA] p-3.5 rounded-xl border border-[#D0BDA3] font-medium text-[#2C1F10]">
                  {activeEvent.summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#1A1107] mb-1">Geotechnical Root Cause:</h4>
                <p className="bg-[#FAF5EA] p-3.5 rounded-xl border border-[#D0BDA3] font-medium text-[#2C1F10]">
                  {activeEvent.rootCause}
                </p>
              </div>

              {/* Key Geological Factors */}
              <div>
                <h4 className="font-bold text-sm text-[#1A1107] mb-1">Geological &amp; Environmental Factors:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activeEvent.geologicalFactors.map((factor, i) => (
                    <li
                      key={i}
                      className="bg-[#FAF5EA] p-2.5 rounded-lg border border-[#DECBB4] text-[11px] text-[#3D2C1A] font-serif font-medium flex items-start gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#92400E] shrink-0 mt-1" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* THE SLOPE SAFE LIFE-SAVING SOLUTION PROTOCOL - HIGHLIGHTED */}
            <div className="bg-gradient-to-b from-[#FFFDF7] to-[#FDF6E8] border-2 border-[#D97706] ring-4 ring-[#F59E0B]/20 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#F59E0B]/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#B45309] text-white shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#D97706] text-white shadow-xs">
                        SOLUTION &amp; PREVENTIVE PROTOCOL
                      </span>
                    </div>
                    <h4 className="font-serif font-black text-lg text-[#1A1107] mt-0.5">
                      Slope Safe Early Warning Solution
                    </h4>
                    <p className="text-xs font-serif text-[#78350F] font-medium">
                      Actionable geotechnical intervention that eliminates mass casualties
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#92400E] font-serif font-black text-xs sm:text-sm border-2 border-[#F59E0B] shadow-md shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-ping inline-block" />
                  <Clock className="w-4 h-4 text-[#B45309]" />
                  <span>+{activeEvent.appSolution.leadTimeHours} Hours Advance Lead Time</span>
                </div>
              </div>

              {/* Solution Mechanism */}
              <div className="space-y-4 text-xs font-serif">
                <div className="bg-[#FEF9EE] p-4 rounded-xl border-l-4 border-l-[#D97706] border border-[#F3DFC1] shadow-xs">
                  <span className="font-bold text-sm text-[#92400E] flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    Early Warning Mechanism:
                  </span>
                  <p className="text-[#2C1F10] text-xs sm:text-sm font-semibold leading-relaxed">
                    {activeEvent.appSolution.earlyWarningMechanism}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-[#92400E] block mb-2 font-sans">
                    Specific Detection Thresholds Triggered:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeEvent.appSolution.detectionCriteria.map((criterion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 bg-[#F0FDF4] p-3 rounded-xl border-2 border-[#86EFAC] shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="text-xs text-emerald-950 font-bold leading-snug">
                          {criterion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="bg-[#FEF3C7]/90 p-4 rounded-xl border-2 border-[#F59E0B] shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#92400E] uppercase tracking-wide">
                      <ShieldAlert className="w-4 h-4 text-[#B45309]" />
                      Life-Saving Action Protocol:
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#2A1807] font-semibold leading-relaxed">
                      {activeEvent.appSolution.preventiveAction}
                    </p>
                  </div>

                  <div className="bg-[#ECFDF5] p-4 rounded-xl border-2 border-[#10B981] shadow-md space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Expected Life-Saving Outcome:
                    </div>
                    <p className="text-xs sm:text-[13px] text-emerald-950 font-bold leading-relaxed">
                      {activeEvent.appSolution.expectedOutcome}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

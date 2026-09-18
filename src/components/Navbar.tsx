import React from 'react';
import { MonitoredLocation, SystemAlert, UserLiveLocation, AppSettings } from '../types';
import { SlopeSafeLogo } from './SlopeSafeLogo';
import { 
  ShieldAlert, 
  Activity, 
  MapPin, 
  Bell, 
  Compass,
  LocateFixed,
  Sliders,
  Info,
  History
} from 'lucide-react';

interface NavbarProps {
  locations: MonitoredLocation[];
  selectedLocation: MonitoredLocation;
  userLocation?: UserLiveLocation | null;
  onRequestLocation?: () => void;
  onSelectLocation: (location: MonitoredLocation) => void;
  activeAlerts: SystemAlert[];
  onOpenAlerts: () => void;
  onOpenSimulator: () => void;
  onOpenOptions: () => void;
  settings?: AppSettings;
  isAutoLocating?: boolean;
  activeTab?: 'monitor' | 'history';
  onTabChange?: (tab: 'monitor' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locations,
  selectedLocation,
  userLocation,
  onRequestLocation,
  onSelectLocation,
  activeAlerts,
  onOpenAlerts,
  onOpenSimulator,
  onOpenOptions,
  settings,
  isAutoLocating = false,
  activeTab = 'monitor',
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F6EDE0]/95 backdrop-blur-md border-b border-[#D2BF9E] shadow-[0_2px_8px_rgba(50,30,15,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand on the Left: 'Slope Safe Dashboard' with hover info tooltip */}
        <div className="flex items-center gap-3">
          <SlopeSafeLogo size="md" id="navbar-brand-logo" />
          <div className="relative group cursor-pointer select-none">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-lg text-[#1A1107] tracking-tight leading-none">
                  Slope Safe
                </span>
                <span className="text-[11px] text-[#853D0A] group-hover:text-[#B45309] font-serif transition-colors font-bold">
                  ⓘ
                </span>
              </div>
              <span className="font-serif text-xs text-[#4A3926] leading-tight font-bold">
                Early Warning System
              </span>
            </div>

            {/* Description tooltip */}
            <div className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-[#FAF5EA] border border-[#D0BDA3] shadow-xl text-xs text-[#2D2012] pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              <div className="flex items-center gap-1.5 text-[#92400E] font-serif font-bold text-xs mb-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Slope Safe India Protocol</span>
              </div>
              <p className="text-[11px] text-[#3D2C1A] leading-relaxed">
                India Landslide Hazard Monitoring &amp; Early Warning System (Geological Survey of India &bull; NDMA &bull; IMD Doppler Telemetry).
              </p>
            </div>
          </div>
        </div>

        {/* Center: Main Navigation Tabs (Live Monitor vs History Archive) */}
        {onTabChange && (
          <div className="flex items-center gap-1 bg-[#EBE0CD] p-1 rounded-xl border border-[#CDBAA0]">
            <button
              onClick={() => onTabChange('monitor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'monitor'
                  ? 'bg-[#FAF5EA] text-[#92400E] shadow-2xs'
                  : 'text-[#4A3926] hover:text-[#1A1107]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Monitor</span>
              <span className="sm:hidden">Live</span>
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#FAF5EA] text-[#92400E] shadow-2xs'
                  : 'text-[#4A3926] hover:text-[#1A1107]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Disaster Archive</span>
              <span className="hidden md:inline text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E5D5BC] text-[#632904]">
                Real Data
              </span>
            </button>
          </div>
        )}

        {/* Right Actions & Sector Selectors */}
        <div className="flex items-center gap-2">
          {/* Location / Sector Dropdown (Hidden on very small screens or in History mode if desired) */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onRequestLocation}
              disabled={isAutoLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE4D2] hover:bg-[#E5D7C1] border border-[#CEBDA2] text-[#1A1107] text-xs font-serif transition shadow-2xs cursor-pointer disabled:opacity-60"
              title="Current Detected Vicinity Location"
            >
              <span className="w-2.5 h-2.5 rotate-45 bg-sky-600 rounded-[1px] inline-block shrink-0 shadow-2xs" />
              <span className="max-w-[130px] truncate font-bold text-[#1A1107]">
                {isAutoLocating
                  ? 'Locating...'
                  : userLocation
                  ? userLocation.placeName || `${userLocation.latitude.toFixed(2)}°N`
                  : 'Meerut (Simulated)'}
              </span>
            </button>

            <div className="relative flex items-center">
              <MapPin className="w-3.5 h-3.5 text-[#6B543D] absolute left-3 pointer-events-none" />
              <select
                id="station-selector"
                aria-label="Select Monitored Station"
                value={selectedLocation.id}
                onChange={(e) => {
                  const found = locations.find((l) => l.id === e.target.value);
                  if (found) onSelectLocation(found);
                }}
                className="pl-8 pr-7 py-1.5 bg-[#EFE4D2] hover:bg-[#E5D7C1] border border-[#CEBDA2] rounded-full text-xs font-serif text-[#1A1107] font-semibold focus:outline-none focus:ring-1 focus:ring-[#92400E] cursor-pointer max-w-[170px] truncate transition shadow-2xs"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unified Terrain Evaluator Trigger */}
          <button
            id="open-evaluator-btn"
            onClick={onOpenSimulator}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] border border-[#CEBDA2] text-[#2C1F10] text-xs font-serif font-bold transition shadow-2xs cursor-pointer"
            title="Single Unified Terrain & Slope Risk Evaluator"
          >
            <Compass className="w-3.5 h-3.5 text-[#92400E]" />
            <span className="hidden md:inline">Evaluator</span>
          </button>

          {/* Active Alerts Button */}
          <button
            id="alerts-toggle-btn"
            onClick={onOpenAlerts}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] border border-[#CEBDA2] text-[#2C1F10] text-xs font-serif font-bold transition cursor-pointer"
          >
            <Bell className={`w-3.5 h-3.5 ${activeAlerts.length > 0 ? 'text-amber-800 animate-pulse' : 'text-[#6B543D]'}`} />
            <span className="hidden sm:inline">Alerts</span>
            {activeAlerts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#B91C1C] text-white">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* App Options & Settings Button */}
          <button
            id="app-options-btn"
            onClick={onOpenOptions}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] border border-[#CEBDA2] text-[#2C1F10] text-xs font-serif font-bold transition cursor-pointer"
            title="App Options, Alerts Sensitivity & Units"
          >
            <Sliders className="w-3.5 h-3.5 text-[#6B543D]" />
            <span className="hidden sm:inline">Options</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { AppSettings } from '../types';
import { playAlertChime } from '../utils/audioAlert';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  ShieldAlert,
  Layers,
  Clock,
  CloudRain,
  RotateCcw,
  Check,
  Play
} from 'lucide-react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2C2114]/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="parchment-card border border-[#D4C3A3] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#2C2114]">
        {/* Header */}
        <div className="p-5 border-b border-[#DECBB4] flex items-center justify-between bg-[#F5EDE0]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#92400E] border border-[#D0BDA3] shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2A1F13]">System Options &amp; Preferences</h3>
              <p className="text-xs text-[#6C5C48] font-serif">Configure early warning thresholds, audio chimes, units, and map layers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-[#FAF6EC] border border-[#DECBB4] text-[#6C5C48] hover:text-[#2C2114] transition cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-[#4B3C2A] divide-y divide-[#DECBB4]">
          {/* Section 1: Audio Alerts */}
          <div className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundAlerts ? (
                  <Volume2 className="w-4 h-4 text-[#92400E]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#7A6A55]" />
                )}
                <div>
                  <span className="font-serif font-bold text-[#2A1F13] block text-sm">Hazard Audio Chimes</span>
                  <span className="text-[11px] text-[#6C5C48] font-serif">
                    Play synthesized warning tones when critical landslide probability is detected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playAlertChime('critical')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF6EC] border border-[#DECBB4] text-[#4B3C2A] hover:text-[#92400E] text-[11px] font-serif font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                  title="Test Sound"
                >
                  <Play className="w-3 h-3" />
                  <span>Test Tone</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ soundAlerts: !settings.soundAlerts })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.soundAlerts ? 'bg-[#92400E]' : 'bg-[#D0BDA3]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.soundAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Hazard Alert Sensitivity */}
          <div className="space-y-3 pt-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#92400E]" />
              <div>
                <span className="font-serif font-bold text-[#2A1F13] block text-sm">Early Warning Sensitivity</span>
                <span className="text-[11px] text-[#6C5C48] font-serif">
                  Select threshold criteria for issuing regional and localized disaster alarms
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'standard', label: 'Standard GSI', desc: 'Alerts at ≥50% risk score' },
                { id: 'high', label: 'High Sensitivity', desc: 'Alerts at ≥35% risk score' },
                { id: 'strict', label: 'Strict Emergency', desc: 'Alerts at ≥75% critical only' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onUpdateSettings({ sensitivity: lvl.id as any })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer font-serif ${
                    settings.sensitivity === lvl.id
                      ? 'border-[#92400E] bg-[#FFFBEB] text-[#2A1F13] shadow-xs'
                      : 'border-[#DECBB4] bg-white/80 text-[#6C5C48] hover:border-[#D0BDA3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#2A1F13]">{lvl.label}</span>
                    {settings.sensitivity === lvl.id && <Check className="w-3.5 h-3.5 text-[#92400E]" />}
                  </div>
                  <p className="text-[10px] text-[#7A6A55] leading-tight">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Units of Measurement */}
          <div className="space-y-3 pt-5">
            <span className="font-serif font-bold text-[#2A1F13] block text-sm">Measurement Units</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/80 border border-[#DECBB4] flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-[#2A1F13] block text-xs">Rainfall Rate</span>
                  <span className="text-[10px] text-[#7A6A55] font-serif">Monsoon precipitation flux</span>
                </div>
                <div className="flex items-center bg-[#FAF6EC] p-0.5 rounded-lg border border-[#DECBB4]">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ rainfallUnit: 'mm' })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                      settings.rainfallUnit === 'mm' ? 'bg-[#92400E] text-white' : 'text-[#7A6A55]'
                    }`}
                  >
                    mm/h
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ rainfallUnit: 'in' })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                      settings.rainfallUnit === 'in' ? 'bg-[#92400E] text-white' : 'text-[#7A6A55]'
                    }`}
                  >
                    in/h
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-[#DECBB4] flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-[#2A1F13] block text-xs">Elevation Scale</span>
                  <span className="text-[10px] text-[#7A6A55] font-serif">Altitude above sea level</span>
                </div>
                <div className="flex items-center bg-[#FAF6EC] p-0.5 rounded-lg border border-[#DECBB4]">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ elevationUnit: 'm' })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                      settings.elevationUnit === 'm' ? 'bg-[#92400E] text-white' : 'text-[#7A6A55]'
                    }`}
                  >
                    Meters (m)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ elevationUnit: 'ft' })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                      settings.elevationUnit === 'ft' ? 'bg-[#92400E] text-white' : 'text-[#7A6A55]'
                    }`}
                  >
                    Feet (ft)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Map Visual Overlays */}
          <div className="space-y-3 pt-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#92400E]" />
              <div>
                <span className="font-serif font-bold text-[#2A1F13] block text-sm">Map Overlays &amp; Markers</span>
                <span className="text-[11px] text-[#6C5C48] font-serif">Toggle visual indicators on the geographic risk map</span>
              </div>
            </div>

            <div className="space-y-2 font-serif">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[#DECBB4] hover:border-[#D0BDA3] cursor-pointer shadow-xs">
                <div>
                  <span className="font-bold text-[#2A1F13] block text-xs">25 km Proximity Buffer Ring</span>
                  <span className="text-[10px] text-[#7A6A55]">
                    Draws a circular hazard radius around your live GPS location
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showProximityRing}
                  onChange={(e) => onUpdateSettings({ showProximityRing: e.target.checked })}
                  className="w-4 h-4 accent-[#92400E] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[#DECBB4] hover:border-[#D0BDA3] cursor-pointer shadow-xs">
                <div>
                  <span className="font-bold text-[#2A1F13] block text-xs">Show Score Badges on Station Markers</span>
                  <span className="text-[10px] text-[#7A6A55]">
                    Displays numeric percentage risk directly inside the circular radar pins
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showRiskScoresOnMap}
                  onChange={(e) => onUpdateSettings({ showRiskScoresOnMap: e.target.checked })}
                  className="w-4 h-4 accent-[#92400E] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 5: Telemetry Auto-Refresh Rate */}
          <div className="space-y-3 pt-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#92400E]" />
              <div>
                <span className="font-serif font-bold text-[#2A1F13] block text-sm">Telemetry Refresh Interval</span>
                <span className="text-[11px] text-[#6C5C48] font-serif">Frequency for IoT sensor data stream synchronization</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 0, label: 'Manual' },
                { sec: 15, label: '15 sec' },
                { sec: 30, label: '30 sec' },
                { sec: 60, label: '60 sec' },
              ].map((item) => (
                <button
                  key={item.sec}
                  type="button"
                  onClick={() => onUpdateSettings({ autoRefreshSeconds: item.sec })}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-serif font-bold transition cursor-pointer ${
                    settings.autoRefreshSeconds === item.sec
                      ? 'border-[#92400E] bg-[#92400E] text-white shadow-xs'
                      : 'border-[#DECBB4] bg-white/80 text-[#6C5C48] hover:border-[#D0BDA3]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Emergency Disaster Simulation Drill */}
          <div className="space-y-3 pt-5 font-serif">
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#F87171] flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CloudRain className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#991B1B] block text-sm">Monsoon Cloudburst Simulation Drill</span>
                  <p className="text-[11px] text-[#4B3C2A] leading-relaxed mt-0.5">
                    Stress-tests all monitoring stations by injecting heavy rainfall (+35 mm/h) and pore-water pressure to verify early warning alarms and disaster evacuation thresholds.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ monsoonSimulation: !settings.monsoonSimulation })}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
                  settings.monsoonSimulation
                    ? 'bg-[#B91C1C] text-white shadow-xs'
                    : 'bg-white text-[#991B1B] border border-[#F87171] hover:bg-[#FEE2E2]'
                }`}
              >
                {settings.monsoonSimulation ? 'Active Drill' : 'Start Drill'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5EDE0] border-t border-[#DECBB4] flex items-center justify-between">
          <button
            type="button"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs text-[#6C5C48] hover:text-[#2C2114] font-serif font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#92400E] hover:bg-[#78350F] text-white font-serif font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
          >
            Apply &amp; Done
          </button>
        </div>
      </div>
    </div>
  );
};

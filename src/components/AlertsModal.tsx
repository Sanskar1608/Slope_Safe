import React from 'react';
import { SystemAlert, RiskLevel } from '../types';
import { getRiskColorClass } from '../utils/riskCalculations';
import { X, Bell, AlertTriangle, CheckCircle, MapPin, ArrowRight } from 'lucide-react';

interface AlertsModalProps {
  alerts: SystemAlert[];
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onSelectAlertLocation: (locationId: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  alerts,
  isOpen,
  onClose,
  onAcknowledgeAlert,
  onSelectAlertLocation,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2C2114]/75 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="parchment-card border border-[#D4C3A3] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#2C2114]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#DECBB4] flex items-center justify-between bg-[#F5EDE0]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FEE2E2] text-[#B91C1C] border border-[#F87171]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2A1F13]">Active Early Warning Alerts</h3>
              <p className="text-xs text-[#6C5C48] font-serif">
                {alerts.length} critical geotechnical advisory notices active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-[#F3ECE0] text-[#6C5C48] hover:text-[#2C2114] border border-[#DECBB4] transition cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of alerts */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-[#6C5C48] space-y-2 font-serif">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-[#2A1F13] text-base">No Active Early Warning Alerts</p>
              <p className="text-xs text-[#7A6A55]">
                All sensor telemetry is currently within baseline stability limits.
              </p>
            </div>
          ) : (
            alerts.map((alt) => {
              const color = getRiskColorClass(alt.level);
              return (
                <div
                  key={alt.id}
                  className="p-4 rounded-2xl bg-white/85 border border-[#DECBB4] hover:border-[#D0BDA3] transition space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${color.badge}`}>
                        {alt.level} Hazard
                      </span>
                      <span className="text-[11px] text-[#7A6A55] font-mono">Issued {alt.issuedAt}</span>
                    </div>

                    <button
                      onClick={() => onAcknowledgeAlert(alt.id)}
                      className="text-[11px] font-serif font-medium text-[#6C5C48] hover:text-[#2C2114] px-2.5 py-1 bg-[#FAF6EC] border border-[#DECBB4] rounded-md transition cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#2A1F13]">{alt.title}</h4>
                    <p className="text-xs text-[#4B3C2A] font-serif mt-1 leading-relaxed">{alt.message}</p>
                  </div>

                  <div className="bg-[#FAF6EC] p-2.5 rounded-xl border border-[#DECBB4] text-xs font-serif">
                    <span className="text-[#92400E] font-bold block mb-0.5">Recommended Response:</span>
                    <span className="text-[#2C2114]">{alt.actionRequired}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[#7A6A55] font-serif">
                      <MapPin className="w-3.5 h-3.5 text-[#92400E]" />
                      <span>{alt.locationName}</span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectAlertLocation(alt.locationId);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-[#92400E] hover:text-[#78350F] font-serif font-bold transition cursor-pointer"
                    >
                      <span>Jump to Sector</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5EDE0] border-t border-[#DECBB4] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#FAF6EC] border border-[#D0BDA3] text-[#2C2114] text-xs font-serif font-semibold rounded-xl transition cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

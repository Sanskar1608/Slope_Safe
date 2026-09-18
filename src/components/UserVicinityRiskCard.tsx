import React from 'react';
import { MonitoredLocation, UserLiveLocation, GeolocationStatus, RiskLevel } from '../types';
import {
  calculateDistanceKm,
  calculateBearing,
  evaluateVicinityLandslideRisk,
  getRiskColorClass,
} from '../utils/riskCalculations';
import {
  MapPin,
  Navigation,
  ShieldAlert,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  RefreshCw,
  LocateFixed,
  ShieldCheck,
  Radio,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface UserVicinityRiskCardProps {
  userLocation: UserLiveLocation | null;
  geoStatus: GeolocationStatus;
  onRequestLocation: () => void;
  onSimulatePresetLocation?: (lat: number, lng: number, name: string) => void;
  allLocations: MonitoredLocation[];
  onSelectAndPanLocation: (loc: MonitoredLocation) => void;
  onOpenLocationDetails: (loc: MonitoredLocation) => void;
  onOpenEvaluatorWithUserCoords: (coords: { lat: number; lng: number }) => void;
}

export const UserVicinityRiskCard: React.FC<UserVicinityRiskCardProps> = ({
  userLocation,
  geoStatus,
  onRequestLocation,
  onSimulatePresetLocation,
  allLocations,
  onSelectAndPanLocation,
  onOpenLocationDetails,
  onOpenEvaluatorWithUserCoords,
}) => {
  // Compute distances to all monitored locations if user location is available
  const sortedSectors = React.useMemo(() => {
    if (!userLocation) return [];
    return allLocations
      .map((loc) => {
        const dist = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          loc.latitude,
          loc.longitude
        );
        const bearing = calculateBearing(
          userLocation.latitude,
          userLocation.longitude,
          loc.latitude,
          loc.longitude
        );
        return {
          location: loc,
          distanceKm: dist,
          bearing,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [userLocation, allLocations]);

  const closest = sortedSectors[0] || null;

  const vicinityEvaluation = closest
    ? evaluateVicinityLandslideRisk(
        closest.distanceKm,
        closest.location.currentRiskScore,
        closest.location.currentRiskLevel
      )
    : null;

  const riskColor = vicinityEvaluation
    ? getRiskColorClass(vicinityEvaluation.vicinityRiskLevel)
    : { bg: 'bg-[#F2E8D8]', border: 'border-[#DECBB4]', text: 'text-[#4A3926]', badge: 'bg-[#EFE4D2] text-[#4A3926]' };

  return (
    <div className="parchment-card rounded-2xl p-5 sm:p-6 shadow-sm border border-[#D2BF9E] space-y-5">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DECBB4]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1]">
            <LocateFixed className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#1A1107] tracking-tight">
                Live Location &amp; Local Landslide Proximity Radar
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                GPS Active
              </span>
            </div>
            <p className="text-xs text-[#4F3D29] font-serif">
              Real-time spatial proximity scan against India&apos;s GSI high-vulnerability hill sectors.
            </p>
          </div>
        </div>

        {/* Action button based on geoStatus */}
        <div className="flex items-center gap-2">
          {geoStatus === 'granted' && userLocation && (
            <button
              onClick={onRequestLocation}
              className="px-3.5 py-1.5 rounded-xl bg-[#EFE4D2] hover:bg-[#E5D7C1] text-[#1A1107] border border-[#CEBDA2] text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Refresh GPS Coordinates"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#92400E]" />
              <span>Update Location</span>
            </button>
          )}

          {(geoStatus === 'denied' || geoStatus === 'prompt' || geoStatus === 'idle') && (
            <button
              onClick={onRequestLocation}
              className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-serif font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Allow Live Location Access</span>
            </button>
          )}
        </div>
      </div>

      {/* Geolocation Request Prompt / Denied Notice */}
      {geoStatus !== 'granted' && (
        <div className="bg-[#FAF5EA] border border-[#BAE6FD] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold font-serif text-sm text-[#0369A1] flex items-center gap-1.5">
              <Navigation className="w-4 h-4" />
              {geoStatus === 'requesting'
                ? 'Requesting Browser GPS Permission...'
                : geoStatus === 'denied'
                ? 'Location Access Blocked or Denied in Browser'
                : 'Live Geolocation Permission Requested'}
            </span>
            <p className="text-xs text-[#3D2C1A] max-w-xl leading-relaxed font-serif">
              {geoStatus === 'denied'
                ? 'Location permission was denied in your browser settings. You can grant access above or click any sample disaster-prone Indian hill station below to test the live vicinity landslide radar.'
                : 'To calculate immediate landslide hazard probability, slope angle, and proximity to active debris flows, please allow location access when prompted.'}
            </p>

            {onSimulatePresetLocation && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-[#4F3D29] font-serif font-bold">Or test sample hill terrain:</span>
                <button
                  type="button"
                  onClick={() => onSimulatePresetLocation(11.538, 76.134, 'Wayanad Foothills, Kerala')}
                  className="px-2.5 py-1 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] text-[11px] font-serif font-bold text-[#92400E] border border-[#CEBDA2] transition cursor-pointer shadow-2xs"
                >
                  Wayanad, Kerala
                </button>
                <button
                  type="button"
                  onClick={() => onSimulatePresetLocation(30.412, 79.332, 'Chamoli Valley, Uttarakhand')}
                  className="px-2.5 py-1 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] text-[11px] font-serif font-bold text-[#B91C1C] border border-[#CEBDA2] transition cursor-pointer shadow-2xs"
                >
                  Chamoli, UK
                </button>
                <button
                  type="button"
                  onClick={() => onSimulatePresetLocation(11.41, 76.695, 'Nilgiris Ridge, Tamil Nadu')}
                  className="px-2.5 py-1 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] text-[11px] font-serif font-bold text-[#0369A1] border border-[#CEBDA2] transition cursor-pointer shadow-2xs"
                >
                  Nilgiris, TN
                </button>
                <button
                  type="button"
                  onClick={() => onSimulatePresetLocation(31.104, 77.173, 'Shimla Slopes, Himachal')}
                  className="px-2.5 py-1 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] text-[11px] font-serif font-bold text-[#853D0A] border border-[#CEBDA2] transition cursor-pointer shadow-2xs"
                >
                  Shimla, HP
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onRequestLocation}
            className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-serif font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <LocateFixed className="w-4 h-4" />
            <span>{geoStatus === 'requesting' ? 'Locating...' : 'Enable Live Location'}</span>
          </button>
        </div>
      )}

      {/* Granted State: Live Location & Vicinity Risk Breakdown */}
      {geoStatus === 'granted' && userLocation && (
        <div className="space-y-5">
          {/* Top Row: User's location badge & proximity verdict */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Exact Coordinates */}
            <div className="bg-[#FAF5EA] border border-[#DECBB4] p-4 rounded-2xl space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4F3D29] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                Detected Position
              </span>
              <div className="text-base font-serif font-bold text-[#1A1107]">
                {userLocation.placeName || 'Local Geolocation Coordinates'}
              </div>
              <div className="font-mono text-xs text-[#0369A1] font-bold">
                {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
              </div>
              {userLocation.accuracy && (
                <div className="text-[10px] text-[#55422D] font-mono">
                  Accuracy radius: &plusmn;{Math.round(userLocation.accuracy)} meters
                </div>
              )}
            </div>

            {/* Proximity Risk Level */}
            <div className={`p-4 rounded-2xl border space-y-1.5 shadow-2xs ${riskColor.bg} ${riskColor.border}`}>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4F3D29] flex items-center gap-1">
                <ShieldAlert className={`w-3.5 h-3.5 ${riskColor.text}`} />
                Vicinity Landslide Vulnerability
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-serif font-black ${riskColor.text}`}>
                  {vicinityEvaluation?.vicinityRiskLevel || 'Low'} Hazard
                </span>
                <span className="text-xs font-mono text-[#3D2C1A] font-bold">
                  ({vicinityEvaluation?.vicinityRiskScore || 10}% Score)
                </span>
              </div>
              <p className="text-[11px] text-[#3D2C1A] leading-tight font-serif font-medium">
                {vicinityEvaluation?.alertHeadline}
              </p>
            </div>

            {/* Closest Critical Hazard Zone */}
            <div className="bg-[#FAF5EA] border border-[#DECBB4] p-4 rounded-2xl space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4F3D29] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#92400E]" />
                Nearest Monitored Slope
              </span>
              {closest ? (
                <div>
                  <div className="text-sm font-serif font-bold text-[#1A1107] truncate">
                    {closest.location.name}
                  </div>
                  <div className="text-xs font-mono text-[#92400E] font-bold mt-0.5">
                    {closest.distanceKm} km away ({closest.bearing})
                  </div>
                  <div className="text-[11px] text-[#4F3D29] mt-1 flex items-center gap-1">
                    <span>Status:</span>
                    <span className="font-bold text-[#B91C1C]">{closest.location.currentRiskLevel} ({closest.location.currentRiskScore}%)</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#55422D]">Calculating nearest sector...</div>
              )}
            </div>
          </div>

          {/* Actionable Civil Defense & Public Advisory */}
          {vicinityEvaluation && (
            <div className="p-4 rounded-2xl bg-[#FAF5EA] border border-[#DECBB4] flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#92400E] shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-serif font-bold text-[#1A1107] block">
                  Civil Defense &amp; Disaster Preparedness Advisory for Your Sector
                </span>
                <p className="text-[#3D2C1A] font-serif leading-relaxed">
                  {vicinityEvaluation.recommendedAction}
                </p>
              </div>
            </div>
          )}

          {/* List of 3 Closest Monitored Slope Stations */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-serif font-bold text-[#1A1107] uppercase tracking-wider">
                Slope Monitoring Stations In Your Regional Zone ({sortedSectors.length} Total)
              </h3>
              <span className="text-[11px] text-[#4F3D29] font-serif">Sorted by distance from your GPS location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sortedSectors.slice(0, 3).map((item) => {
                const colorClass = getRiskColorClass(item.location.currentRiskLevel);
                return (
                  <div
                    key={item.location.id}
                    className="p-3.5 rounded-2xl bg-[#FAF5EA] border border-[#DECBB4] hover:border-[#CEBDA2] transition flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-serif font-bold text-xs text-[#1A1107] leading-tight">
                          {item.location.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${colorClass.badge}`}
                        >
                          {item.location.currentRiskLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#4F3D29] font-serif font-medium">
                        {item.location.region}
                      </div>
                      <div className="font-mono text-xs text-[#0369A1] font-bold mt-1.5">
                        {item.distanceKm} km {item.bearing}
                      </div>
                      <div className="text-[10px] text-[#4F3D29] font-mono mt-0.5">
                        Slope: {item.location.slope}° &bull; Rain: {item.location.currentRainfallMmPerHour} mm/h
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#DECBB4]">
                      <button
                        onClick={() => onSelectAndPanLocation(item.location)}
                        className="flex-1 py-1 px-2 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C1] text-[#1A1107] border border-[#CEBDA2] text-[11px] font-serif font-bold transition text-center cursor-pointer shadow-2xs"
                      >
                        Locate on Map
                      </button>
                      <button
                        onClick={() => onOpenLocationDetails(item.location)}
                        className="py-1 px-2.5 rounded-lg bg-[#92400E] hover:bg-[#78350F] text-white text-[11px] font-serif font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { MonitoredLocation, SystemAlert, UserLiveLocation, GeolocationStatus, AppSettings, PinnedLocationFactors } from './types';
import { INITIAL_LOCATIONS, INITIAL_ALERTS } from './data/mockLocations';
import { Navbar } from './components/Navbar';
import { RiskMap } from './components/RiskMap';
import { DashboardOverview } from './components/DashboardOverview';
import { AlertsModal } from './components/AlertsModal';
import { TerrainEvaluatorModal } from './components/TerrainEvaluatorModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { UserVicinityRiskCard } from './components/UserVicinityRiskCard';
import { SlopeSafeLogo } from './components/SlopeSafeLogo';
import { PinFactorInspector } from './components/PinFactorInspector';
import { HistoricalLandslidesArchive } from './components/HistoricalLandslidesArchive';
import { detectFactorsForLocation } from './utils/terrainDetector';
import { getRiskColorClass, estimateSlopeRisk } from './utils/riskCalculations';
import { playAlertChime } from './utils/audioAlert';
import {
  MapPin,
  Mountain,
  CloudRain,
  Droplets,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Compass,
  Radio,
  ExternalLink,
  Sliders,
  LocateFixed,
  History
} from 'lucide-react';

export default function App() {
  const [locations, setLocations] = useState<MonitoredLocation[]>(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<MonitoredLocation>(INITIAL_LOCATIONS[0]);
  const [activeAlerts, setActiveAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  // App Options / Settings State
  const [settings, setSettings] = useState<AppSettings>({
    soundAlerts: true,
    sensitivity: 'standard',
    rainfallUnit: 'mm',
    elevationUnit: 'm',
    autoRefreshSeconds: 30,
    showProximityRing: true,
    showRiskScoresOnMap: true,
    monsoonSimulation: false,
  });

  // Main Tab Navigation State: 'monitor' (Live Warning System) or 'history' (Tragic Landslide Archives)
  const [activeTab, setActiveTab] = useState<'monitor' | 'history'>('monitor');

  // User Live Geolocation State
  const [userLocation, setUserLocation] = useState<UserLiveLocation | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('idle');

  // Interactive Pin & Auto-Detect Location Factor State
  const [pinnedFactors, setPinnedFactors] = useState<PinnedLocationFactors | null>(null);
  const [isPinDetecting, setIsPinDetecting] = useState<boolean>(false);

  // Single unified terrain evaluation modal state
  const [evaluatorLocation, setEvaluatorLocation] = useState<MonitoredLocation | null>(null);
  const [clickedMapCoords, setClickedMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isEvaluatorOpen, setIsEvaluatorOpen] = useState<boolean>(false);

  // App Modals State
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);

  // Toast feedback state
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  // Trigger factor detection for any coordinate (Pin drop or Auto-detect)
  const handlePinCoordinate = async (lat: number, lng: number, placeName?: string) => {
    setIsPinDetecting(true);
    try {
      const factors = await detectFactorsForLocation(lat, lng, placeName);
      setPinnedFactors(factors);
      showToast(
        `📍 Pinned ${factors.placeName.split(',')[0]}: Slope ${factors.slope}°, Rain ${factors.currentRainfallMmPerHour}mm/h, Risk: ${factors.riskLevel} (${factors.riskScore}%).`
      );
    } catch (err) {
      console.error('Failed to detect factors for pin:', err);
      showToast('Could not detect factors for coordinate. Retrying with local terrain model.');
    } finally {
      setIsPinDetecting(false);
    }
  };

  // Live Location Request with Reverse Geocoding
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let placeName: string | undefined = undefined;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              data.address?.state_district;
            const state = data.address?.state;
            if (city && state) placeName = `${city}, ${state}`;
            else if (state) placeName = `${state}, India`;
            else if (data.display_name) placeName = data.display_name.split(',').slice(0, 2).join(',');
          }
        } catch {
          // Fallback if nominatim has network issues
        }

        const newLiveLoc: UserLiveLocation = {
          latitude,
          longitude,
          accuracy,
          placeName,
          detectedAt: new Date().toLocaleTimeString(),
        };

        setUserLocation(newLiveLoc);
        setGeoStatus('granted');
        showToast(
          `Live position acquired: ${placeName || `${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`}. Automatically analyzing slope factors.`
        );

        // Automatically pin user location and detect all factors
        handlePinCoordinate(latitude, longitude, placeName);
      },
      (err) => {
        console.warn('Geolocation access error:', err);
        if (err.code === 1) {
          setGeoStatus('denied');
          showToast('Location permission denied in browser. You can enable it or test sample coordinates.');
        } else if (err.code === 3) {
          setGeoStatus('timeout');
          showToast('Location request timed out. Please retry.');
        } else {
          setGeoStatus('unavailable');
          showToast('Unable to retrieve location coordinates.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Simulating user at pre-configured disaster prone zones
  const handleSimulatePresetLocation = (lat: number, lng: number, name: string) => {
    setUserLocation({
      latitude: lat,
      longitude: lng,
      placeName: name,
      accuracy: 25,
      detectedAt: new Date().toLocaleTimeString(),
    });
    setGeoStatus('granted');
    handlePinCoordinate(lat, lng, name);
    showToast(`Teleported location to "${name}". Live vicinity proximity recalculated.`);
  };

  // Auto-request location on initial mount or setup Meerut / Himalayas fallback
  useEffect(() => {
    // Default initial pin to Meppadi, Wayanad to showcase factor detection
    handlePinCoordinate(11.5167, 76.1333, 'Meppadi, Wayanad (W. Ghats)');
  }, []);

  // Periodic Telemetry Fluctuation Simulator
  useEffect(() => {
    const intervalSeconds = settings.autoRefreshSeconds || 30;
    const interval = setInterval(() => {
      setLocations((prevLocations) =>
        prevLocations.map((loc) => {
          // Subtle realistic noise in precipitation and moisture
          const rainDelta = (Math.random() - 0.48) * 1.8;
          const newRain = Math.max(0, Math.round((loc.currentRainfallMmPerHour + rainDelta) * 10) / 10);
          const moistureDelta = (Math.random() - 0.48) * 1.5;
          const newMoisture = Math.min(100, Math.max(10, Math.round(loc.soilMoisturePercent + moistureDelta)));

          const { riskScore, riskLevel, factorOfSafety } = estimateSlopeRisk({
            slopeDeg: loc.slope,
            rainfallCurrent: newRain,
            rainfall24h: loc.rainfall24hMm,
            soilMoisture: newMoisture,
          });

          const newPoint = {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            riskScore: riskScore,
            rainfallMm: newRain,
            soilMoisturePercent: newMoisture,
          };

          return {
            ...loc,
            currentRainfallMmPerHour: newRain,
            soilMoisturePercent: newMoisture,
            currentRiskScore: riskScore,
            currentRiskLevel: riskLevel,
            factorOfSafety: factorOfSafety,
            lastUpdated: 'Just now',
            history: [...loc.history.slice(-19), newPoint],
          };
        })
      );
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [settings.autoRefreshSeconds]);

  // Keep selected location in sync with updated telemetry
  useEffect(() => {
    const updated = locations.find((l) => l.id === selectedLocation.id);
    if (updated) setSelectedLocation(updated);
  }, [locations, selectedLocation.id]);

  // Alert generation on high/very high changes
  useEffect(() => {
    const critical = locations.filter(
      (l) => l.currentRiskLevel === 'Very High' || (settings.sensitivity === 'high' && l.currentRiskLevel === 'High')
    );

    if (critical.length > 0) {
      const existingCriticalIds = new Set(activeAlerts.map((a) => a.locationId));
      critical.forEach((loc) => {
        if (!existingCriticalIds.has(loc.id)) {
          const newAlert: SystemAlert = {
            id: `alert-${Date.now()}-${loc.id}`,
            locationId: loc.id,
            locationName: loc.name,
            level: loc.currentRiskLevel,
            title: `${loc.name} Critical Landslide Alert`,
            issuedAt: new Date().toLocaleTimeString(),
            message: `CRITICAL: Factor of safety collapsed to ${loc.factorOfSafety}. Rainfall reached ${loc.currentRainfallMmPerHour}mm/h with ${loc.soilMoisturePercent}% saturation. Immediate evacuation recommended.`,
            actionRequired:
              loc.currentRiskLevel === 'Very High'
                ? 'Immediate mass evacuation of downhill settlements within 2.5km cone. Halt road transit.'
                : 'Deploy civil defense patrols and place rescue boats/excavators on active standby.',
            status: 'active',
          };
          setActiveAlerts((prev) => [newAlert, ...prev]);
          if (settings.soundAlerts) playAlertChime();
          showToast(`⚠️ NEW HAZARD WARNING ISSUED: ${loc.name} reached ${loc.currentRiskLevel} Risk!`);
        }
      });
    }
  }, [locations, settings.sensitivity, settings.soundAlerts]);

  // Open Location Details in the SINGLE Evaluator
  const handleOpenDetails = (loc: MonitoredLocation) => {
    setEvaluatorLocation(loc);
    setClickedMapCoords({ lat: loc.latitude, lng: loc.longitude });
    setIsAlertsOpen(false);
    setIsOptionsOpen(false);
    setIsEvaluatorOpen(true);
  };

  // Open the SINGLE unified Terrain Evaluator popup for coordinates or what-if simulation
  const handleOpenSimulator = (coords?: { lat: number; lng: number } | null) => {
    setEvaluatorLocation(null);
    setClickedMapCoords(coords ?? null);
    setIsAlertsOpen(false);
    setIsOptionsOpen(false);
    setIsEvaluatorOpen(true);
  };

  const handleOpenAlerts = () => {
    setIsEvaluatorOpen(false);
    setIsOptionsOpen(false);
    setIsAlertsOpen(true);
  };

  const handleOpenOptions = () => {
    setIsEvaluatorOpen(false);
    setIsAlertsOpen(false);
    setIsOptionsOpen(true);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast('Early Warning Alert marked as acknowledged.');
  };

  const handleSelectAlertLocation = (locId: string) => {
    const found = locations.find((l) => l.id === locId);
    if (found) {
      setIsAlertsOpen(false);
      handleOpenDetails(found);
    }
  };

  const handleAddCustomLocation = (newLoc: MonitoredLocation) => {
    setLocations((prev) => [newLoc, ...prev]);
    setSelectedLocation(newLoc);
    showToast(`Pinned new monitored sector "${newLoc.name}" to the live risk radar.`);
  };

  const handleMapClick = (lat: number, lng: number) => {
    handlePinCoordinate(lat, lng);
  };

  // Historical Disaster event actions
  const handleSelectHistoricalEventOnMap = (lat: number, lng: number, placeName: string) => {
    setActiveTab('monitor');
    handlePinCoordinate(lat, lng, placeName);
    showToast(`Focused map on historical disaster site: ${placeName}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateHistoricalEvent = (coords: { lat: number; lng: number }) => {
    setClickedMapCoords(coords);
    setIsEvaluatorOpen(true);
    showToast(`Loaded disaster site coordinates into Geotechnical Evaluator.`);
  };

  return (
    <div className="min-h-screen wood-desk-bg text-[#1A1107] flex flex-col font-sans relative selection:bg-[#DEB288] selection:text-[#1A1107]">
      {/* Landslide Disaster Aerial Background Layer */}
      <div className="landslide-backdrop" aria-hidden="true" />

      {/* Navigation Header */}
      <div className="relative z-10">
        <Navbar
          locations={locations}
          selectedLocation={selectedLocation}
          userLocation={userLocation}
          onRequestLocation={requestUserLocation}
          onSelectLocation={setSelectedLocation}
          activeAlerts={activeAlerts}
          onOpenAlerts={handleOpenAlerts}
          onOpenSimulator={() => handleOpenSimulator(null)}
          onOpenOptions={handleOpenOptions}
          settings={settings}
          isAutoLocating={geoStatus === 'requesting'}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Toast Feedback Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[10000] bg-[#FAF5EA] border-2 border-[#92400E] text-[#1A1107] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-serif font-bold animate-in fade-in slide-in-from-bottom-5">
            <Radio className="w-4 h-4 text-[#92400E] animate-pulse shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* CONDITIONALLY RENDER: EITHER DISASTER HISTORY ARCHIVE OR LIVE MONITOR */}
        {activeTab === 'history' ? (
          <HistoricalLandslidesArchive
            onViewOnMap={handleSelectHistoricalEventOnMap}
            onSimulateEvent={handleSimulateHistoricalEvent}
          />
        ) : (
          <>
            {/* SECTION 1: Interactive Landslide Risk Map & Pin Factor Inspector */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="bg-on-landslide-pill rounded-2xl px-4 py-3 shadow-lg flex-1 border border-[#8C6239]/50 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#F59E0B]" />
                    <h2 className="text-base sm:text-lg font-serif font-black text-on-landslide-heading tracking-tight">
                      Geospatial Landslide Risk Map
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#92400E]/50 border border-[#D97706]/40 text-[#FDE68A]">
                      Live Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-on-landslide-sub font-serif font-medium mt-1">
                    Click anywhere on India terrain or drag the pin to automatically detect all factors. Use <strong className="text-[#FBBF24] font-bold">Auto Detect Location</strong> to analyze your live GPS position.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={requestUserLocation}
                    disabled={geoStatus === 'requesting'}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#7DD3FC] text-[#0369A1] text-xs font-serif font-bold transition cursor-pointer shadow-md"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${geoStatus === 'requesting' ? 'animate-spin' : ''}`} />
                    <span>Auto Detect Location</span>
                  </button>

                  <button
                    onClick={() => handleOpenSimulator(null)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF5EA] hover:bg-[#F2E7D3] border border-[#CEBDA2] text-[#92400E] text-xs font-serif font-bold transition cursor-pointer shadow-md"
                  >
                    <span>+ Custom Simulator</span>
                  </button>
                </div>
              </div>

              <RiskMap
                locations={locations}
                selectedLocation={selectedLocation}
                userLocation={userLocation}
                settings={settings}
                onSelectLocation={setSelectedLocation}
                onOpenLocationDetails={handleOpenDetails}
                onMapClickCoordinate={handleMapClick}
                onRequestUserLocation={requestUserLocation}
                pinnedFactors={pinnedFactors}
                onPinCoordinate={handlePinCoordinate}
                isPinDetecting={isPinDetecting}
                isAutoLocating={geoStatus === 'requesting'}
              />

              {/* Interactive Pin Location & Automatic Factor Detector Card */}
              <PinFactorInspector
                factors={pinnedFactors}
                isLoading={isPinDetecting}
                settings={settings}
                onRequestAutoDetectLocation={requestUserLocation}
                onMovePinPreset={(lat, lng, placeName) => handlePinCoordinate(lat, lng, placeName)}
                onAddAsMonitoredLocation={handleAddCustomLocation}
                onOpenFullSimulator={(factors) => {
                  handleOpenSimulator({ lat: factors.latitude, lng: factors.longitude });
                }}
                onClose={() => setPinnedFactors(null)}
                isAutoLocating={geoStatus === 'requesting'}
              />
            </section>

            {/* SECTION 2: User Live Location Vicinity Landslide Risk Radar */}
            <section>
              <UserVicinityRiskCard
                userLocation={userLocation}
                geoStatus={geoStatus}
                onRequestLocation={requestUserLocation}
                onSimulatePresetLocation={handleSimulatePresetLocation}
                allLocations={locations}
                onSelectAndPanLocation={(loc) => {
                  setSelectedLocation(loc);
                  showToast(`Panned map to closest sector: ${loc.name}`);
                }}
                onOpenLocationDetails={handleOpenDetails}
                onOpenEvaluatorWithUserCoords={(coords) => {
                  handleOpenSimulator(coords);
                }}
              />
            </section>

            {/* SECTION 3: Core Risk Dashboard */}
            <section>
              <DashboardOverview
                location={selectedLocation}
                allLocations={locations}
                activeAlerts={activeAlerts}
                onOpenDetails={handleOpenDetails}
                onOpenAlertsModal={() => setIsAlertsOpen(true)}
              />
            </section>

            {/* SECTION 4: Monitored Slope Stations Quick Comparison Matrix */}
            <section className="parchment-card rounded-2xl p-5 shadow-sm border border-[#D2BF9E] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-serif font-black text-[#1A1107] tracking-wide">
                    India Monitored Slope Sectors &bull; GSI High Vulnerability Zones ({locations.length})
                  </h3>
                  <p className="text-xs text-[#4F3D29] font-serif font-medium">
                    Continuous IoT telemetry across Western Ghats, Garhwal/Kumaon Himalayas, Pir Panjal, and Northeast Hill Tracts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#4F3D29] font-bold">
                    Live Gateway Feed &bull; 100% Sensor Network Health
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#DECBB4] rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F2E8] text-[#4A3926] text-[11px] uppercase tracking-wider font-mono font-bold border-b border-[#DECBB4]">
                    <tr>
                      <th className="p-3">Sector Station</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3">Probability</th>
                      <th className="p-3">Slope Incline</th>
                      <th className="p-3">
                        Rainfall ({settings.rainfallUnit === 'in' ? 'in/h' : 'mm/h'})
                      </th>
                      <th className="p-3">Soil Saturation</th>
                      <th className="p-3">Factor of Safety</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DECBB4]">
                    {locations.map((loc) => {
                      const color = getRiskColorClass(loc.currentRiskLevel);
                      const isCurrent = loc.id === selectedLocation.id;
                      const displayRain =
                        settings.rainfallUnit === 'in'
                          ? (loc.currentRainfallMmPerHour / 25.4).toFixed(2)
                          : loc.currentRainfallMmPerHour;
                      const displayElev =
                        settings.elevationUnit === 'ft'
                          ? Math.round(loc.elevation * 3.28084)
                          : loc.elevation;

                      return (
                        <tr
                          key={loc.id}
                          className={`hover:bg-[#FAF6EC] transition cursor-pointer ${
                            isCurrent ? 'bg-[#F4ECE0] font-bold' : ''
                          }`}
                          onClick={() => setSelectedLocation(loc)}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div>
                                <span className="font-bold font-serif text-[#1A1107] block">{loc.name}</span>
                                <span className="text-[11px] text-[#4F3D29] font-medium">
                                  {loc.region} &bull; {displayElev}{settings.elevationUnit} ASL
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${color.badge}`}
                            >
                              {loc.currentRiskLevel}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#1A1107]">
                            {loc.currentRiskScore}%
                          </td>
                          <td className="p-3 font-mono text-[#92400E] font-bold">
                            {loc.slope}° ({loc.aspect})
                          </td>
                          <td className="p-3 font-mono text-sky-800 font-bold">
                            {displayRain} {settings.rainfallUnit}/h
                          </td>
                          <td className="p-3 font-mono text-emerald-800 font-bold">
                            {loc.soilMoisturePercent}%
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <span
                              className={
                                loc.factorOfSafety < 1.0
                                  ? 'text-[#B91C1C]'
                                  : loc.factorOfSafety < 1.3
                                  ? 'text-[#B45309]'
                                  : 'text-emerald-800'
                              }
                            >
                              {loc.factorOfSafety}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(loc);
                              }}
                              className="px-2.5 py-1 bg-[#EFE4D2] hover:bg-[#E5D7C1] text-[#92400E] border border-[#DECBB4] font-serif font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <span>Evaluate</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer & Disclaimer */}
      <footer className="relative z-10 border-t border-[#7A5332] bg-[#22140A]/90 backdrop-blur-md py-8 text-center text-xs text-[#E5D2BA]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-3">
          <SlopeSafeLogo size="lg" id="footer-brand-logo" withGlow={true} />
          <div className="space-y-1">
            <p className="font-serif font-black text-[#FFF7EC] text-sm tracking-wide">
              Slope Safe India &bull; Landslide Risk Monitoring &amp; Early Warning System
            </p>
            <p className="text-[11px] text-[#D8C2A7] font-serif max-w-2xl mx-auto leading-relaxed font-medium">
              Geotechnical decision-support framework integrated with Geological Survey of India (GSI) hazard micro-zonation, IMD Doppler rainfall telemetry, and NDMA disaster mitigation standards.
            </p>
          </div>
        </div>
      </footer>

      {/* SINGLE UNIFIED MODAL FOR EVALUATING TERRAIN */}
      {isEvaluatorOpen && (
        <TerrainEvaluatorModal
          isOpen={isEvaluatorOpen}
          onClose={() => {
            setIsEvaluatorOpen(false);
            setClickedMapCoords(null);
            setEvaluatorLocation(null);
          }}
          onAddLocation={handleAddCustomLocation}
          initialCoords={clickedMapCoords}
          initialLocation={evaluatorLocation}
          allLocations={locations}
          onSelectLocation={setSelectedLocation}
          onSimulateAction={showToast}
        />
      )}

      {/* System Alerts Modal */}
      {isAlertsOpen && (
        <AlertsModal
          alerts={activeAlerts}
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onSelectAlertLocation={handleSelectAlertLocation}
        />
      )}

      {/* App Options & Settings Modal */}
      {isOptionsOpen && (
        <AppSettingsModal
          isOpen={isOptionsOpen}
          onClose={() => setIsOptionsOpen(false)}
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings((prev) => ({ ...prev, ...newSettings }));
            showToast('Updated system options and preferences.');
          }}
          onResetSettings={() => {
            setSettings({
              soundAlerts: true,
              sensitivity: 'standard',
              rainfallUnit: 'mm',
              elevationUnit: 'm',
              autoRefreshSeconds: 30,
              showProximityRing: true,
              showRiskScoresOnMap: true,
              monsoonSimulation: false,
            });
            showToast('Reset options to default configuration.');
          }}
        />
      )}
    </div>
  );
}

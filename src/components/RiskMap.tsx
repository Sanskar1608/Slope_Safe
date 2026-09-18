import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MonitoredLocation, RiskLevel, UserLiveLocation, AppSettings, PinnedLocationFactors } from '../types';
import { getRiskColorClass } from '../utils/riskCalculations';
import {
  Layers,
  Crosshair,
  LocateFixed,
  Navigation,
  Globe,
  MapPin,
  Mountain,
  Compass,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface RiskMapProps {
  locations: MonitoredLocation[];
  selectedLocation: MonitoredLocation;
  userLocation?: UserLiveLocation | null;
  settings?: AppSettings;
  onSelectLocation: (location: MonitoredLocation) => void;
  onOpenLocationDetails: (location: MonitoredLocation) => void;
  onMapClickCoordinate?: (lat: number, lng: number) => void;
  onRequestUserLocation?: () => void;
  pinnedFactors?: PinnedLocationFactors | null;
  onPinCoordinate?: (lat: number, lng: number, placeName?: string) => void;
  isPinDetecting?: boolean;
  isAutoLocating?: boolean;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  locations,
  selectedLocation,
  userLocation,
  settings,
  onSelectLocation,
  onOpenLocationDetails,
  onMapClickCoordinate,
  onRequestUserLocation,
  pinnedFactors,
  onPinCoordinate,
  isPinDetecting = false,
  isAutoLocating = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const pinnedMarkerRef = useRef<L.Marker | null>(null);
  
  const onPinCoordinateRef = useRef(onPinCoordinate);
  onPinCoordinateRef.current = onPinCoordinate;
  const onMapClickCoordinateRef = useRef(onMapClickCoordinate);
  onMapClickCoordinateRef.current = onMapClickCoordinate;

  // Satellite option removed as requested. Supported: topo and street.
  const [activeLayer, setActiveLayer] = useState<'topo' | 'street'>('topo');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Popup for "My Location", "All India", and "Centre on Selected"
  const [isViewportsPopupOpen, setIsViewportsPopupOpen] = useState(false);

  const tileUrls = {
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
      maxZoom: 17,
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedLocation.latitude, selectedLocation.longitude],
      zoom: 6,
      zoomControl: false,
    });

    const zoomCtrl = L.control.zoom({ position: 'topright' }).addTo(map);
    // Add parchment-zoom class to Leaflet zoom container
    const zoomContainer = zoomCtrl.getContainer();
    if (zoomContainer) {
      zoomContainer.classList.add('parchment-zoom');
    }

    const initialTile = L.tileLayer(tileUrls.topo.url, {
      attribution: tileUrls.topo.attribution,
      maxZoom: tileUrls.topo.maxZoom,
    }).addTo(map);

    tileLayerRef.current = initialTile;
    mapInstanceRef.current = map;

    // Handle map clicks to drop pin and automatically detect all factors
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lng = Number(e.latlng.lng.toFixed(4));
      if (onPinCoordinateRef.current) {
        onPinCoordinateRef.current(lat, lng);
      }
      if (onMapClickCoordinateRef.current) {
        onMapClickCoordinateRef.current(lat, lng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer on layer switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const currentConfig = tileUrls[activeLayer];
    const newTile = L.tileLayer(currentConfig.url, {
      attribution: currentConfig.attribution,
      maxZoom: currentConfig.maxZoom,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const filtered = locations.filter((loc) => {
      if (filterRisk === 'ALL') return true;
      return loc.currentRiskLevel === filterRisk;
    });

    const showScore = settings?.showRiskScoresOnMap !== false;

    filtered.forEach((loc) => {
      const color = getRiskColorClass(loc.currentRiskLevel);
      const isSelected = loc.id === selectedLocation.id;
      const isCritical = loc.currentRiskLevel === 'Very High' || loc.currentRiskLevel === 'High';

      const customIcon = L.divIcon({
        className: 'custom-landslide-marker',
        html: `
          <div class="relative group cursor-pointer flex items-center justify-center">
            ${
              isCritical
                ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-60" style="background-color: ${color.hex}"></div>`
                : ''
            }
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-md border-2 transition-transform duration-200 transform ${
              isSelected ? 'scale-125 ring-3 ring-[#92400E]' : 'hover:scale-110'
            }" style="background-color: #FAF6EC; border-color: ${color.hex};">
              <span class="text-[11px] font-bold font-mono" style="color: ${color.hex}">
                ${showScore ? `${loc.currentRiskScore}` : '▲'}
              </span>
            </div>
            <div class="absolute -bottom-1 w-2 h-2 rotate-45 border-r border-b" style="background-color: #FAF6EC; border-color: ${color.hex}"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);

      // Popup content with vintage field journal card style
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3.5 text-[#2C2114] bg-[#FAF6EC] rounded-xl text-xs leading-relaxed max-w-[260px] shadow-xl border border-[#D8C7AD] font-serif';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between mb-1.5 pb-1 border-b border-[#D8C7AD]">
          <span class="font-bold text-sm text-[#2A1F13]">${loc.name}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold font-sans" style="background-color: ${color.hex}20; color: ${color.hex}; border: 1px solid ${color.hex}50">
            ${loc.currentRiskLevel} (${loc.currentRiskScore}%)
          </span>
        </div>
        <p class="text-[#6C5C48] text-[11px] mb-2">${loc.region}, ${loc.country}</p>
        <div class="grid grid-cols-2 gap-1.5 bg-white p-2 rounded-lg border border-[#DECBB4] mb-2 font-mono text-[10px]">
          <div><span class="text-[#7A6A55]">Slope:</span> <span class="text-[#92400E] font-bold">${loc.slope}°</span></div>
          <div><span class="text-[#7A6A55]">Elev:</span> <span class="text-[#2C2114] font-semibold">${loc.elevation}m</span></div>
          <div><span class="text-[#7A6A55]">Rain:</span> <span class="text-sky-700">${loc.currentRainfallMmPerHour}mm/h</span></div>
          <div><span class="text-[#7A6A55]">Moist:</span> <span class="text-emerald-700">${loc.soilMoisturePercent}%</span></div>
        </div>
        <button id="popup-detail-btn-${loc.id}" class="w-full py-1.5 px-2 bg-[#92400E] hover:bg-[#78350F] text-white rounded-lg font-serif font-semibold text-[11px] transition text-center flex items-center justify-center gap-1 cursor-pointer shadow-xs">
          Evaluate Slope &amp; Details &rarr;
        </button>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'landslide-custom-popup',
      });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-detail-btn-${loc.id}`);
        if (btn) {
          btn.onclick = () => {
            map.closePopup();
            onOpenLocationDetails(loc);
          };
        }
      });

      markersRef.current[loc.id] = marker;
    });
  }, [locations, filterRisk, selectedLocation.id, settings?.showRiskScoresOnMap]);

  // Pan to selected location when changed
  const panToSelected = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedLocation.latitude, selectedLocation.longitude], 10, {
      duration: 1.2,
    });
  };

  useEffect(() => {
    panToSelected();
  }, [selectedLocation.id]);

  // Handle User Live Location marker and proximity scan radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }

    if (!userLocation) return;

    const userPinHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
        <div class="absolute -inset-3 rounded-full bg-sky-500 opacity-40 animate-ping"></div>
        <div class="relative w-6 h-6 rounded-full bg-sky-600 border-2 border-white shadow-md flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        <div class="absolute -top-6 whitespace-nowrap bg-[#FAF6EC] text-[#0369A1] border border-[#7DD3FC] px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md tracking-tight font-serif">
          Your Position
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-live-radar-marker',
      html: userPinHtml,
      iconSize: [0, 0],
    });

    const marker = L.marker([userLocation.latitude, userLocation.longitude], {
      icon: userIcon,
      zIndexOffset: 800,
    }).addTo(map);

    marker.bindPopup(
      `
      <div class="p-2 space-y-1 text-[#2C2114] bg-[#FAF6EC] rounded-xl border border-[#D8C7AD] font-serif min-w-[200px]">
        <div class="font-bold text-xs text-[#0369A1] flex items-center gap-1.5 border-b border-[#D8C7AD] pb-1">
          <span>📍 Your Live Position</span>
        </div>
        <div class="text-[11px] font-mono text-[#2C2114] font-semibold">
          ${userLocation.latitude.toFixed(4)}° N, ${userLocation.longitude.toFixed(4)}° E
        </div>
        ${
          userLocation.placeName
            ? `<div class="text-[11px] text-[#0284C7] font-medium">${userLocation.placeName}</div>`
            : ''
        }
        <div class="text-[10px] text-[#7A6A55] pt-1">
          Proximity scan radius: 25 km buffer
        </div>
      </div>
    `,
      { className: 'landslide-custom-popup' }
    );

    userMarkerRef.current = marker;

    if (settings?.showProximityRing !== false) {
      const circle = L.circle([userLocation.latitude, userLocation.longitude], {
        radius: 25000,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.07,
        weight: 1.5,
        dashArray: '6, 6',
      }).addTo(map);

      userCircleRef.current = circle;
    }
  }, [userLocation, settings?.showProximityRing]);

  // Handle Pinned Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pinnedMarkerRef.current) {
      pinnedMarkerRef.current.remove();
      pinnedMarkerRef.current = null;
    }

    if (!pinnedFactors) return;

    const color = getRiskColorClass(pinnedFactors.riskLevel);

    const pinHtml = `
      <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing group">
        <div class="absolute -top-1 w-9 h-9 rounded-full opacity-50 animate-ping" style="background-color: ${color.hex}"></div>
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white transition transform group-hover:scale-110" style="background-color: #9A4917">
          <span class="text-amber-100 text-xs font-black">📍</span>
        </div>
        <div class="w-1.5 h-3 bg-[#4A3B28] border-l border-r border-[#6B5A44]"></div>
        <div class="w-3 h-1 rounded-full bg-black/40 blur-[1px]"></div>
        <div class="absolute -top-7 whitespace-nowrap bg-[#FAF6EC] text-[#2C2114] border border-[#D4C3A3] px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 font-serif">
          <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${color.hex}"></span>
          <span class="max-w-[110px] truncate font-semibold">${pinnedFactors.placeName.split(',')[0]}</span>
          <span class="font-mono text-[#92400E] font-bold">${pinnedFactors.slope}°</span>
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: 'custom-interactive-pin-marker',
      html: pinHtml,
      iconSize: [0, 0],
    });

    const marker = L.marker([pinnedFactors.latitude, pinnedFactors.longitude], {
      icon: pinIcon,
      draggable: true,
      zIndexOffset: 950,
    }).addTo(map);

    marker.on('dragend', (event: any) => {
      const position = event.target.getLatLng();
      if (onPinCoordinateRef.current) {
        onPinCoordinateRef.current(Number(position.lat.toFixed(4)), Number(position.lng.toFixed(4)));
      }
    });

    const popupHtml = `
      <div class="p-3 text-[#2C2114] bg-[#FAF6EC] rounded-xl text-xs leading-relaxed max-w-[260px] shadow-xl border border-[#D8C7AD] font-serif">
        <div class="flex items-center justify-between pb-1 mb-1.5 border-b border-[#D8C7AD]">
          <span class="font-bold text-[#2A1F13] text-xs truncate max-w-[150px]">${pinnedFactors.placeName}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold font-sans" style="background-color: ${color.hex}20; color: ${color.hex}; border: 1px solid ${color.hex}50">
            ${pinnedFactors.riskLevel} (${pinnedFactors.riskScore}%)
          </span>
        </div>
        <div class="grid grid-cols-2 gap-1.5 bg-white border border-[#DECBB4] p-2 rounded-lg mb-2 font-mono text-[10px]">
          <div><span class="text-[#7A6A55]">Slope:</span> <strong class="text-[#92400E]">${pinnedFactors.slope}°</strong></div>
          <div><span class="text-[#7A6A55]">Elev:</span> <span class="text-[#2C2114]">${pinnedFactors.elevation}m</span></div>
          <div><span class="text-[#7A6A55]">Rain:</span> <span class="text-sky-700">${pinnedFactors.currentRainfallMmPerHour}mm/h</span></div>
          <div><span class="text-[#7A6A55]">Moist:</span> <span class="text-emerald-700">${pinnedFactors.soilMoisturePercent}%</span></div>
          <div><span class="text-[#7A6A55]">FS:</span> <strong class="${pinnedFactors.factorOfSafety < 1 ? 'text-[#B91C1C]' : 'text-emerald-700'}">${pinnedFactors.factorOfSafety.toFixed(2)}</strong></div>
          <div><span class="text-[#7A6A55]">Lith:</span> <span class="text-[#2C2114] truncate">${pinnedFactors.soilType.split(' ')[0]}</span></div>
        </div>
        <div class="text-[10px] text-[#4B3C2A] mb-1 leading-snug">
          ${pinnedFactors.verdict.slice(0, 120)}...
        </div>
        <div class="text-[9px] text-[#92400E] font-serif text-center pt-1 border-t border-[#D8C7AD]">
          Drag pin or click map to move anywhere in India
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, { closeButton: false });
    pinnedMarkerRef.current = marker;
  }, [pinnedFactors]);

  const handleFlyToUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 10, {
        duration: 1.2,
      });
    } else if (onRequestUserLocation) {
      onRequestUserLocation();
    }
  };

  const handleFlyToAllIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.5, 82.0], 5, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden border-2 border-[#D4C3A3] bg-[#F7F3E9] shadow-[0_8px_30px_rgba(60,42,20,0.08)] isolate">
      {/* Map Header Toolbar */}
      <div className="absolute top-3 left-3 right-16 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Map title & filter */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-[#FAF6EC]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#D8C7AD] shadow-md text-[#2C2114]">
          <span className="text-xs font-bold font-serif text-[#2C2114] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#92400E] animate-pulse" />
            Topographic Risk Radar
          </span>
          <span className="text-[#C5B395]">|</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as any)}
            className="text-[11px] font-serif bg-white border border-[#D4C2A5] rounded-lg px-2.5 py-1 text-[#2C2114] focus:outline-none focus:ring-1 focus:ring-[#92400E] cursor-pointer shadow-xs"
          >
            <option value="ALL">All Risk Levels ({locations.length})</option>
            <option value="Very High">Very High Only</option>
            <option value="High">High &amp; Above</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low (Stable)</option>
          </select>

          {/* Active Pin Indicator button */}
          {pinnedFactors && (
            <button
              onClick={() => {
                if (mapInstanceRef.current && pinnedMarkerRef.current) {
                  mapInstanceRef.current.flyTo([pinnedFactors.latitude, pinnedFactors.longitude], 11, { duration: 1 });
                  pinnedMarkerRef.current.openPopup();
                }
              }}
              className="px-2.5 py-1 text-[11px] rounded-xl font-serif font-semibold transition flex items-center gap-1 bg-white hover:bg-[#F4ECE1] text-[#92400E] border border-[#D0BDA3] shadow-xs cursor-pointer"
              title="Focus map on current pinned location"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="max-w-[100px] truncate">{pinnedFactors.placeName.split(',')[0]}</span>
              <span className="font-mono text-[10px]">({pinnedFactors.slope}°)</span>
            </button>
          )}
        </div>

        {/* Right: Layer Switcher & Map Navigation Views Popup Button */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#FAF6EC]/95 backdrop-blur-md p-1 rounded-2xl border border-[#D8C7AD] shadow-md">
          <button
            onClick={() => setActiveLayer('topo')}
            className={`px-3 py-1 text-[11px] rounded-xl font-serif transition cursor-pointer ${
              activeLayer === 'topo'
                ? 'bg-[#92400E] text-white font-bold shadow-xs'
                : 'text-[#4A3B28] hover:text-[#2C2114] hover:bg-[#F3ECE0]'
            }`}
            title="OpenTopoMap Contours &amp; Shaded Relief"
          >
            Topo Relief
          </button>
          <button
            onClick={() => setActiveLayer('street')}
            className={`px-3 py-1 text-[11px] rounded-xl font-serif transition cursor-pointer ${
              activeLayer === 'street'
                ? 'bg-[#92400E] text-white font-bold shadow-xs'
                : 'text-[#4A3B28] hover:text-[#2C2114] hover:bg-[#F3ECE0]'
            }`}
            title="Street &amp; Infrastructure Map"
          >
            Roads
          </button>

          {/* Unified Popup Button for: My Location, Centre on Selected, All India */}
          <button
            onClick={() => setIsViewportsPopupOpen((prev) => !prev)}
            className={`px-3 py-1 text-[11px] rounded-xl font-serif font-semibold transition ml-1 border-l border-[#DECBB4] flex items-center gap-1.5 cursor-pointer ${
              isViewportsPopupOpen
                ? 'bg-[#92400E] text-white shadow-xs'
                : 'bg-white text-[#92400E] hover:bg-[#F4ECE1] border border-[#D0BDA3]'
            }`}
            title="Map Views: My Location, All India, and Centre on Selected Station"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Map Views</span>
          </button>
        </div>
      </div>

      {/* DEDICATED POPUP: "My Location", "All India", and "Centre on Selected" */}
      {isViewportsPopupOpen && (
        <div
          className="absolute top-16 right-3 z-30 w-80 bg-[#FAF6EC] border-2 border-[#D4C3A3] rounded-2xl shadow-2xl p-4 text-[#2C2114] animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#D8C7AD]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#92400E]" />
              <span className="font-serif font-bold text-xs text-[#2A1F13] uppercase tracking-wider">
                Map Views &amp; Positioning
              </span>
            </div>
            <button
              onClick={() => setIsViewportsPopupOpen(false)}
              className="p-1 rounded-md text-[#8C7B67] hover:text-[#2C2114] hover:bg-[#EAE0CE] transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {/* 1. My Location */}
            <button
              onClick={() => {
                handleFlyToUser();
                setIsViewportsPopupOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-white hover:bg-[#F4ECE1] border border-[#DECBB4] hover:border-[#92400E] flex items-center justify-between text-left transition group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#E0F2FE] text-[#0369A1] group-hover:scale-110 transition-transform">
                  <LocateFixed className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif font-bold text-xs text-[#2C2114] block">My Live Location</span>
                  <span className="text-[10px] text-[#7A6A55] font-mono">
                    {userLocation
                      ? userLocation.placeName || `${userLocation.latitude.toFixed(3)}°N, ${userLocation.longitude.toFixed(3)}°E`
                      : 'Acquire browser GPS position'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A89884] group-hover:text-[#0369A1] transition" />
            </button>

            {/* 2. Centre on Selected Station */}
            <button
              onClick={() => {
                panToSelected();
                setIsViewportsPopupOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-white hover:bg-[#F4ECE1] border border-[#DECBB4] hover:border-[#92400E] flex items-center justify-between text-left transition group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FEF3C7] text-[#92400E] group-hover:scale-110 transition-transform">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif font-bold text-xs text-[#2C2114] block">Centre on Selected</span>
                  <span className="text-[10px] text-[#7A6A55] truncate max-w-[160px] block font-serif">
                    {selectedLocation.name} ({selectedLocation.currentRiskLevel})
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A89884] group-hover:text-[#92400E] transition" />
            </button>

            {/* 3. All India Overview */}
            <button
              onClick={() => {
                handleFlyToAllIndia();
                setIsViewportsPopupOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-white hover:bg-[#F4ECE1] border border-[#DECBB4] hover:border-[#92400E] flex items-center justify-between text-left transition group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#DCFCE7] text-emerald-800 group-hover:scale-110 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif font-bold text-xs text-[#2C2114] block">All India Hazard View</span>
                  <span className="text-[10px] text-[#7A6A55] font-serif">National perspective &amp; all zones</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A89884] group-hover:text-emerald-700 transition" />
            </button>

            {/* Quick Regional Focus shortcuts */}
            <div className="pt-2 border-t border-[#D8C7AD]">
              <span className="text-[10px] uppercase font-mono text-[#7A6A55] font-bold block mb-1.5">
                Regional Focus Presets:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([11.5, 76.5], 8, { duration: 1.2 });
                    }
                    setIsViewportsPopupOpen(false);
                  }}
                  className="p-1.5 bg-white hover:bg-[#F4ECE1] border border-[#DECBB4] rounded-lg text-[10px] font-serif font-semibold text-[#2C2114] hover:text-[#92400E] text-center transition cursor-pointer"
                >
                  W. Ghats
                </button>
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([30.5, 79.2], 8, { duration: 1.2 });
                    }
                    setIsViewportsPopupOpen(false);
                  }}
                  className="p-1.5 bg-white hover:bg-[#F4ECE1] border border-[#DECBB4] rounded-lg text-[10px] font-serif font-semibold text-[#2C2114] hover:text-[#92400E] text-center transition cursor-pointer"
                >
                  Himalayas
                </button>
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([26.5, 93.5], 7, { duration: 1.2 });
                    }
                    setIsViewportsPopupOpen(false);
                  }}
                  className="p-1.5 bg-white hover:bg-[#F4ECE1] border border-[#DECBB4] rounded-lg text-[10px] font-serif font-semibold text-[#2C2114] hover:text-[#92400E] text-center transition cursor-pointer"
                >
                  Northeast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map DOM Container with vintage sepia watercolor topographical filter */}
      <div id="landslide-map-container" ref={mapContainerRef} className="w-full h-full vintage-topo-map z-0" />

      {/* Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#FAF6EC]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#D8C7AD] shadow-md flex items-center gap-3 text-[11px] text-[#2C2114] font-serif">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] shadow-xs" />
          <span>Very High</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] shadow-xs" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
          <span>Low</span>
        </div>
      </div>

      {/* Quick Location Badge Indicator */}
      <div className="absolute bottom-3 right-12 z-10 hidden md:flex items-center gap-2 bg-[#FAF6EC]/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#D8C7AD] text-[11px] text-[#2C2114] font-serif shadow-md">
        <span className="text-[#6C5C48]">Selected:</span>
        <span className="font-bold text-[#2A1F13]">{selectedLocation.name}</span>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.closePopup();
            }
            onOpenLocationDetails(selectedLocation);
          }}
          className="text-[#92400E] hover:text-[#78350F] font-bold underline ml-1 cursor-pointer"
        >
          Evaluate Terrain
        </button>
      </div>
    </div>
  );
};

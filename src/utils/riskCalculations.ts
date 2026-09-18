import { RiskLevel } from '../types';
import { evaluateLandslideWithML, MLPredictionResult } from './landslideMLClassifier';

export function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'Very High';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
}

export function getRiskColorClass(level: RiskLevel): {
  badge: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
  hex: string;
} {
  switch (level) {
    case 'Very High':
      return {
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        bg: 'bg-rose-950/20',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        dot: 'bg-rose-500',
        hex: '#f43f5e',
      };
    case 'High':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        bg: 'bg-amber-950/20',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        hex: '#f59e0b',
      };
    case 'Moderate':
      return {
        badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
        bg: 'bg-yellow-950/20',
        border: 'border-yellow-500/40',
        text: 'text-yellow-300',
        dot: 'bg-yellow-400',
        hex: '#eab308',
      };
    case 'Low':
    default:
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        bg: 'bg-emerald-950/20',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        hex: '#10b981',
      };
  }
}

/**
 * Estimates geotechnical slope stability & risk probability using Random Forest & Baseline Logistic Regression
 */
export function estimateSlopeRisk(params: {
  slopeDeg: number;
  rainfallCurrent: number;
  rainfall24h: number;
  soilMoisture: number;
  elevationMeters?: number;
}): {
  riskScore: number;
  riskLevel: RiskLevel;
  factorOfSafety: number;
  poreWaterPressure: number;
  mlPrediction: MLPredictionResult;
} {
  const { slopeDeg, rainfallCurrent, rainfall24h, soilMoisture, elevationMeters = 850 } = params;

  // Pore water pressure proxy (kPa) based on saturation and depth
  const moistureRatio = Math.pow(soilMoisture / 100, 1.8);
  const poreWaterPressure = Number((moistureRatio * 16.5).toFixed(1));

  // Run the Random Forest Classifier + Baseline Logistic Regression models
  const mlPrediction = evaluateLandslideWithML({
    slopeDeg,
    rainfall24hMm: rainfall24h,
    rainfallIntensityMmPerHour: rainfallCurrent,
    soilMoisturePercent: soilMoisture,
    poreWaterPressureKPa: poreWaterPressure,
    elevationMeters,
  });

  const riskScore = mlPrediction.randomForest.ensembleProbability;
  const riskLevel = mlPrediction.randomForest.riskLevel;

  // Geotechnical Factor of Safety approximation (FS)
  // When slope is ~40 deg and saturated, FS dips below 1.0
  const baseFriction = Math.tan((32 * Math.PI) / 180);
  const tanSlope = Math.tan((Math.max(5, slopeDeg) * Math.PI) / 180);
  const saturationReduction = 1 - (soilMoisture / 100) * 0.45;
  const fsRaw = (baseFriction / tanSlope) * saturationReduction;
  const factorOfSafety = Math.max(0.72, Math.min(2.8, Number(fsRaw.toFixed(2))));

  return {
    riskScore,
    riskLevel,
    factorOfSafety,
    poreWaterPressure,
    mlPrediction,
  };
}

/**
 * Great-circle distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Compass cardinal bearing calculation
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;
  const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
}

/**
 * Evaluates the proximity risk for a given user location relative to monitored sectors
 */
export function evaluateVicinityLandslideRisk(
  closestDistanceKm: number,
  closestSectorRiskScore: number,
  closestSectorRiskLevel: RiskLevel
): {
  vicinityRiskLevel: RiskLevel;
  vicinityRiskScore: number;
  alertHeadline: string;
  recommendedAction: string;
} {
  // Proximity decay calculation: risk reduces with distance
  let distanceFactor = 0;
  if (closestDistanceKm < 15) {
    distanceFactor = 1.0;
  } else if (closestDistanceKm < 35) {
    distanceFactor = 0.75;
  } else if (closestDistanceKm < 75) {
    distanceFactor = 0.45;
  } else if (closestDistanceKm < 150) {
    distanceFactor = 0.2;
  } else {
    distanceFactor = 0.05;
  }

  const vicinityScore = Math.min(99, Math.round(closestSectorRiskScore * distanceFactor));
  const vicinityLevel = calculateRiskLevel(vicinityScore);

  let alertHeadline = '';
  let recommendedAction = '';

  if (closestDistanceKm < 20 && (closestSectorRiskLevel === 'Very High' || closestSectorRiskLevel === 'High')) {
    alertHeadline = `CRITICAL PROXIMITY: Within ${closestDistanceKm} km of an active High-Vulnerability Landslide Sector`;
    recommendedAction =
      'Remain alert to local district administration (DDMA) advisories. Avoid vulnerable hillside ghat roads, cut-slopes, and unreinforced drainage culverts during heavy rainfall.';
  } else if (closestDistanceKm < 50) {
    alertHeadline = `MODERATE VICINITY WATCH: Nearest monitored slope sector is ${closestDistanceKm} km away`;
    recommendedAction =
      'Keep track of regional meteorological rainfall telemetry. Ensure local emergency helplines (112 / 1077) are on speed dial.';
  } else {
    alertHeadline = `STABLE GEOGRAPHICAL ZONE: No critical slope instability detected within ${closestDistanceKm} km`;
    recommendedAction =
      'Your immediate area is currently distant from monitored high-vulnerability hill corridors. Standard monsoonal precautions apply.';
  }

  return {
    vicinityRiskLevel: vicinityLevel,
    vicinityRiskScore: vicinityScore,
    alertHeadline,
    recommendedAction,
  };
}


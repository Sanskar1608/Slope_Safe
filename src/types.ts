import { MLPredictionResult } from './utils/landslideClassifier';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface SensorReading {
  timestamp: string; // ISO string or short time e.g. "12:00"
  riskScore: number; // 0 - 100
  rainfallMm: number;
  soilMoisturePercent: number;
}

export interface MonitoredLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number; // in meters
  slope: number; // in degrees
  aspect: string; // e.g., "NW", "SE"
  soilType: string;
  vegetation: string;
  currentRiskScore: number; // 0 - 100
  currentRiskLevel: RiskLevel;
  currentRainfallMmPerHour: number;
  rainfall24hMm: number;
  soilMoisturePercent: number;
  poreWaterPressureKPa: number;
  factorOfSafety: number; // e.g. 1.08
  sensorHealth: 'Optimal' | 'Warning' | 'Maintenance';
  lastUpdated: string;
  history: SensorReading[];
  description: string;
  activeAlert?: {
    id: string;
    level: RiskLevel;
    title: string;
    issuedAt: string;
    message: string;
    recommendedAction: string;
  };
}

export interface SystemAlert {
  id: string;
  locationId: string;
  locationName: string;
  level: RiskLevel;
  title: string;
  issuedAt: string;
  message: string;
  actionRequired: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface AiEvaluationResponse {
  source: string;
  riskScore: number;
  riskLevel: RiskLevel;
  stabilityFactor: string;
  geologicalSummary: string;
  recommendations: string[];
  criticalFactors: {
    factor: string;
    impact: 'Low' | 'Moderate' | 'High' | 'Critical';
    detail: string;
  }[];
}

export interface UserLiveLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  placeName?: string;
  detectedAt: string;
}

export type GeolocationStatus =
  | 'idle'
  | 'prompt'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout';

export interface AppSettings {
  soundAlerts: boolean;
  sensitivity: 'standard' | 'high' | 'strict';
  rainfallUnit: 'mm' | 'in';
  elevationUnit: 'm' | 'ft';
  autoRefreshSeconds: number; // 0 = manual, 15, 30, 60
  showProximityRing: boolean;
  showRiskScoresOnMap: boolean;
  monsoonSimulation: boolean;
}

export interface PinnedLocationFactors {
  latitude: number;
  longitude: number;
  placeName: string;
  region: string;
  elevation: number; // meters
  slope: number; // degrees
  aspect: string; // e.g. "NW", "SE"
  currentRainfallMmPerHour: number;
  rainfall24hMm: number;
  soilMoisturePercent: number;
  poreWaterPressureKPa: number;
  soilType: string;
  factorOfSafety: number;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  verdict: string;
  safetyAdvice: string;
  detectedAt: string;
  isLoading?: boolean;
  mlPrediction?: MLPredictionResult;
}



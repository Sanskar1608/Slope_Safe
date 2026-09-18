import express from "express";
import path from "path";

type RiskAssessmentRequest = {
  locationName?: string;
  latitude?: number;
  longitude?: number;
  elevation?: number;
  slope?: number;
  rainfallCurrent?: number;
  rainfall24h?: number;
  soilMoisture?: number;
  soilType?: string;
  vegetationCover?: string;
};

function evaluateRiskMetrics(data: RiskAssessmentRequest) {
  const slope = Number(data.slope ?? 0);
  const rainfallCurrent = Number(data.rainfallCurrent ?? 0);
  const rainfall24h = Number(data.rainfall24h ?? 0);
  const soilMoisture = Number(data.soilMoisture ?? 0);
  const elevation = Number(data.elevation ?? 0);

  const slopeFactor = Math.min(100, (slope / 45) * 40);
  const rainFactor = Math.min(100, ((rainfallCurrent * 3 + rainfall24h) / 120) * 35);
  const moistureFactor = (soilMoisture / 100) * 25;
  const totalScore = Math.min(99, Math.round(slopeFactor + rainFactor + moistureFactor + (elevation > 1500 ? 8 : 0)));

  let riskLevel = "Low";
  if (totalScore >= 75) riskLevel = "Very High";
  else if (totalScore >= 50) riskLevel = "High";
  else if (totalScore >= 25) riskLevel = "Moderate";

  return {
    source: "geotechnical-risk-engine",
    riskScore: totalScore,
    riskLevel,
    stabilityFactor: (1.8 - (totalScore / 100) * 0.95).toFixed(2),
    geologicalSummary: `Based on a ${slope}° incline at ${elevation}m elevation, current rainfall of ${rainfallCurrent} mm/h (24h: ${rainfall24h} mm) and ${soilMoisture}% soil saturation, terrain shear stress is significantly elevated along potential failure planes.`,
    recommendations: [
      totalScore >= 50 ? "Issue immediate stage 2 early warning to downstream communities." : "Continue continuous hydrometric and piezometric sensor telemetry.",
      "Inspect slope drainage gullies and weep holes for blockage.",
      totalScore >= 75 ? "Prepare structural evacuation routes and halt road transit along the slope toe." : "Monitor rainfall accumulation thresholds over the next 6 to 12 hours."
    ],
    criticalFactors: [
      { factor: "Slope Incline", impact: slope > 30 ? "High" : "Moderate", detail: `${slope}° slope angle exceeds the typical repose threshold for weak colluvium.` },
      { factor: "Hydrological Saturation", impact: soilMoisture > 70 ? "Critical" : "Elevated", detail: `Soil moisture at ${soilMoisture}% elevates pore-water pressure.` },
      { factor: "Precipitation Influx", impact: rainfall24h > 50 ? "High" : "Normal", detail: `${rainfall24h}mm in the past 24h accelerates seepage velocities.` }
    ]
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      configured: true,
    });
  });

  app.post("/api/risk-assessment", async (req, res) => {
    try {
      const data = req.body as RiskAssessmentRequest;
      const assessment = evaluateRiskMetrics(data);
      return res.json(assessment);
    } catch (err: any) {
      console.error("Risk assessment error:", err);
      return res.status(500).json({
        error: "Risk evaluation failed",
        message: err.message,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Slope Safe server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

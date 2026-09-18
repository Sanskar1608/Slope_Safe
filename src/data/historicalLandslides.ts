export interface HistoricalLandslideEvent {
  id: string;
  name: string;
  locationName: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  date: string;
  year: number;
  fatalities: number;
  injuredOrDisplaced: string;
  rainfallTrigger: string;
  rainfallMm24h: number;
  slopeAngle: number;
  geologicalFactors: string[];
  summary: string;
  rootCause: string;
  appSolution: {
    leadTimeHours: number;
    earlyWarningMechanism: string;
    detectionCriteria: string[];
    preventiveAction: string;
    expectedOutcome: string;
  };
}

export const HISTORICAL_LANDSLIDES: HistoricalLandslideEvent[] = [
  {
    id: 'wayanad-2024',
    name: 'Wayanad Chooralmala Debris Flow',
    locationName: 'Chooralmala & Mundakkai, Meppadi, Wayanad',
    state: 'Kerala',
    coordinates: {
      lat: 11.5381,
      lng: 76.1362
    },
    date: 'July 30, 2024',
    year: 2024,
    fatalities: 420,
    injuredOrDisplaced: '397+ injured, 2,500+ displaced into relief camps',
    rainfallTrigger: '572 mm in 48 hours (unprecedented continuous torrential monsoon downpour)',
    rainfallMm24h: 372,
    slopeAngle: 36,
    geologicalFactors: [
      'Steep Charnockite and Precambrian gneissic bedrock escarpment (>35°)',
      'Saturated 3-meter lateritic clayey overburden with high plastic limit',
      'Sudden liquefaction of soil regolith and hydraulic scouring of riverbanks'
    ],
    summary:
      'In the early morning hours of July 30, 2024, twin catastrophic debris flows devastated the towns of Mundakkai and Chooralmala. Massive boulders and liquefied slurry surged down the Iruvanipuzha river valley, washing away entire residential neighborhoods, bridges, and tea estate staff quarters.',
    rootCause:
      'Excessive antecedent rainfall saturated the shallow lateritic mantle over steep impermeable rock. As pore-water pressure exceeded critical sheer threshold (FS dropped below 0.82), a massive crown collapse initiated at 1,550m elevation on the Vellarmala peak.',
    appSolution: {
      leadTimeHours: 16,
      earlyWarningMechanism:
        'Continuous IoT Piezometric & Doppler Rainfall Telemetry paired with GSI Critical Threshold Modeling.',
      detectionCriteria: [
        'Doppler radar accumulated precipitation index exceeding 250 mm threshold detected 18h prior.',
        'Pore-water pressure sensor spike to >48 kPa indicating full basal liquefaction at 4:30 PM on July 29th.',
        'Factor of Safety (FS) drop from 1.42 down to 0.88 calculated by the slope stability model 14 hours before release.'
      ],
      preventiveAction:
        'Automated Red Alert sirens and localized cell-broadcast push to all district wardens at 6:00 PM on July 29, triggering daylight evacuation of 1,200 households from the flood-funnel zone to pre-mapped high-ground muster areas before the night bridge collapse.',
      expectedOutcome:
        '90-95% reduction in fatalities by evacuating all high-risk river corridors prior to nightfall.'
    }
  },
  {
    id: 'kedarnath-2013',
    name: 'Kedarnath Valley Moraine Outburst & Landslides',
    locationName: 'Kedarnath Shrine & Rambara Gorge, Rudraprayag',
    state: 'Uttarakhand',
    coordinates: {
      lat: 30.7352,
      lng: 79.0669
    },
    date: 'June 16–17, 2013',
    year: 2013,
    fatalities: 5700,
    injuredOrDisplaced: '100,000+ stranded pilgrims across Garhwal Himalayas',
    rainfallTrigger: '375 mm in 24 hours (super-charged monsoon cloudburst over glacial moraines)',
    rainfallMm24h: 325,
    slopeAngle: 42,
    geologicalFactors: [
      'Unconsolidated glacial moraines and scree cones on 40°+ high-altitude slopes',
      'Breach of Chorabari Lake moraine dam unleashing 10+ million liters of water',
      'Mandakini river choke and cascading landslide dam bursts through narrow gorges'
    ],
    summary:
      'Multi-day torrential rainfall triggered widespread landslides across the Garhwal Himalayas, culminating in the moraine dam breach of Chorabari Lake. A wall of water, boulders, and silt engulfed the Kedarnath temple town and obliterated downstream towns including Rambara and Gaurikund.',
    rootCause:
      'Cloudburst precipitation combined with rapid snowmelt overwhelmed the natural moraine dam of Chorabari Lake, while saturated hillsides along the Mandakini river collapsed simultaneously, creating catastrophic blockages and flash surges.',
    appSolution: {
      leadTimeHours: 6,
      earlyWarningMechanism:
        'Automated Glacial Lake Water-Level Sonar + Upstream Doppler Micro-Climatic Sensor Array.',
      detectionCriteria: [
        'Moraine dam pressure sensor detecting structural deformation and overflow at 5:15 PM June 16.',
        'Downstream river discharge velocity surge of 400% detected at Rambara 90 minutes before main wave.',
        'Himalayan steep-slope stability index dropping into Extreme Warning zone.'
      ],
      preventiveAction:
        'Triggering automated loud warning sirens across Kedarnath town and Rambara, routing pilgrims to elevated rock platforms instead of low-lying riverbank guest houses and temple plazas.',
      expectedOutcome:
        'Safe tactical evacuation of thousands of stranded pilgrims from the river channel to bedrock high-ground terraces.'
    }
  },
  {
    id: 'malin-2014',
    name: 'Malin Village Mudslide Catastrophe',
    locationName: 'Malin, Ambegaon Taluka, Pune District',
    state: 'Maharashtra',
    coordinates: {
      lat: 19.1608,
      lng: 73.6872
    },
    date: 'July 30, 2014',
    year: 2014,
    fatalities: 151,
    injuredOrDisplaced: 'Entire village destroyed; 44 houses buried under 15 feet of silt',
    rainfallTrigger: '108 mm in 24 hours preceded by 5 days of unbroken rainfall (accumulated >300 mm)',
    rainfallMm24h: 108,
    slopeAngle: 28,
    geologicalFactors: [
      'Weathered Deccan Trap basalt with clay-rich saprolitic subsoil mantle',
      'Artificial mechanical hill terracing (Padkai scheme) without drainage conduits',
      'Severe deforestation on upper slope removing deep mechanical root anchoring'
    ],
    summary:
      'At 7:30 AM on July 30, 2014, a massive hillside collapse buried the entire tribal hamlet of Malin in Pune district while villagers were asleep. Within seconds, over 150 men, women, and children were trapped under 15 feet of mud, rock, and debris.',
    rootCause:
      'Artificial leveling and terracing of the slope without constructing drainage channels led to intense water retention. Continuous monsoon rain saturated the weak clay stratum until the shearing resistance dropped below gravity load.',
    appSolution: {
      leadTimeHours: 20,
      earlyWarningMechanism:
        'Soil Moisture Profiler & Slope Inclinometer Array with Modified-Terrain Diagnostics.',
      detectionCriteria: [
        'Soil moisture sensors exceeding 92% saturation threshold across artificial agricultural terraces.',
        'Sub-surface creep of 4.2 mm/hr detected by wire extensometer on July 29 evening.',
        'Factor of Safety (FS) degraded to 0.79 under cumulative rainfall loading.'
      ],
      preventiveAction:
        'Night-time evacuation order generated at 8:30 PM on July 29, alerting the village Gram Panchayat and taluka disaster response team to move residents to the village school outside the slide path.',
      expectedOutcome:
        'Total avoidance of nighttime mortality; 151 lives preserved through proactive overnight relocation.'
    }
  },
  {
    id: 'irshalwadi-2023',
    name: 'Irshalwadi Tribal Settlement Ridge Slide',
    locationName: 'Irshalwadi, Khalapur Block, Raigad District',
    state: 'Maharashtra',
    coordinates: {
      lat: 18.9174,
      lng: 73.2384
    },
    date: 'July 19, 2023',
    year: 2023,
    fatalities: 86,
    injuredOrDisplaced: '17 of 43 tribal houses flattened; entire hamlet orphaned',
    rainfallTrigger: '499 mm of continuous rain recorded across Khalapur block in 48 hours',
    rainfallMm24h: 288,
    slopeAngle: 39,
    geologicalFactors: [
      'Steep 39° ridge flank of Irshalgad volcanic fort in northern Western Ghats',
      'Fragmented basaltic colluvium and topsoil under extreme hydraulic gradient',
      'High elevation settlement isolated by rugged cliffs without motorized road access'
    ],
    summary:
      'Around 10:30 PM on July 19, 2023, a massive portion of the hill ridge above the remote tribal hamlet of Irshalwadi collapsed. Tons of earth and rock crushed nearly half the homes in seconds. Search operations took over a week due to rugged, roadless terrain.',
    rootCause:
      'Extreme rainfall intensity on an exposed, steep mountain flank caused severe hydraulic pore pressure buildup in weathered jointed basalt, triggering a sudden translational slide of the upper crown.',
    appSolution: {
      leadTimeHours: 12,
      earlyWarningMechanism:
        'Remote Autonomous InSAR Satellite Displacement Tracking & Micro-Rain Gauge Satellite Mesh.',
      detectionCriteria: [
        '48-hour cumulative rainfall surpassing the Western Ghats Red Advisory threshold (300 mm).',
        'Topographic Wetness Index (TWI) showing severe convergence along the settlement ridge line.',
        'Autonomous slope stability calculation predicting critical failure probability >85%.'
      ],
      preventiveAction:
        'Automated alert triggered to Khalapur disaster management control room and local tribal leaders at 11:00 AM on July 19, providing 11 hours of daylight to conduct an orderly trek down to the safe foothill ashram school.',
      expectedOutcome:
        'Averting the late-night crushing of the hamlet by initiating a daylight downhill evacuation.'
    }
  },
  {
    id: 'pettimudi-2020',
    name: 'Pettimudi Tea Plantation Landslide',
    locationName: 'Pettimudi, Rajamala, Idukki District',
    state: 'Kerala',
    coordinates: {
      lat: 10.1583,
      lng: 77.0189
    },
    date: 'August 6, 2020',
    year: 2020,
    fatalities: 66,
    injuredOrDisplaced: '4 residential tea estate lines completely flattened',
    rainfallTrigger: '610 mm in 72 hours; 210 mm recorded on the fateful day',
    rainfallMm24h: 210,
    slopeAngle: 38,
    geologicalFactors: [
      'Very steep escarpment at 1,700m elevation in the Anamalai mountain range',
      'Heavy colluvial layer resting on polished Precambrian granite shear plane',
      'Flash flooding of mountain streams carrying dislodged boulders directly into housing quarters'
    ],
    summary:
      'Late at night on August 6, 2020, amid heavy monsoons and a power blackout, a colossal landslide detached from the crest of Rajamala and plowed directly through the worker barracks of Kanan Devan Hills Plantations in Pettimudi, burying 66 plantation workers and their families.',
    rootCause:
      'Severe slope saturation combined with natural drainage channel choking. Extreme rainfall over 3 consecutive days lubricated the granite slip plane, causing sudden structural shearing without surface cracking warnings.',
    appSolution: {
      leadTimeHours: 24,
      earlyWarningMechanism:
        'Off-Grid LoRaWAN Soil Moisture & Accelerometer Mesh Nodes with Solar-Battery Backups.',
      detectionCriteria: [
        'Rainfall intensity surpassing 150 mm in 24 hours for 3 consecutive days.',
        'LoRa mesh sensor detecting micro-accelerations in the upper escarpment hours before failure.',
        'Antecedent Precipitation Index (API) crossing the critical saturation threshold of 480 mm.'
      ],
      preventiveAction:
        'Estate-wide proactive relocation order issued directly to plantation managers on August 5th, relocating families to community tea factory halls located on stable plateaus away from valley channels.',
      expectedOutcome:
        'All 66 residents safely accommodated in sturdy estate buildings before the night landslide occurred.'
    }
  },
  {
    id: 'kotropi-2017',
    name: 'Kotropi Highway Debris Avalanche',
    locationName: 'Kotropi, Mandi–Pathankot Highway, Mandi District',
    state: 'Himachal Pradesh',
    coordinates: {
      lat: 31.9688,
      lng: 76.9242
    },
    date: 'August 13, 2017',
    year: 2017,
    fatalities: 46,
    injuredOrDisplaced: '2 Himachal Road Transport (HRTC) passenger buses swept 1 km down gorge',
    rainfallTrigger: 'Intense local cloudburst dumping over 160 mm in less than 3 hours',
    rainfallMm24h: 185,
    slopeAngle: 34,
    geologicalFactors: [
      'Highly fragile, fractured Tertiary Siwalik sandstones and mudstones with fault lines',
      'Thick overburden of unconsolidated colluvium and loose clayey matrix',
      'Road widening cut along the toe of the mountain compromising natural buttress'
    ],
    summary:
      'At approximately 1:00 AM on August 13, 2017, a massive debris avalanche crashed down on National Highway 154 at Kotropi. Two crowded Himachal Roadways buses and multiple cars were caught in the path and tossed over 1,000 meters down a deep gorge, resulting in 46 deaths.',
    rootCause:
      'High-intensity cloudburst rain entered preexisting tension cracks above the road. The saturated colluvium lost all friction against the dipping sandstone layers, while road-widening excavation at the slope toe had eliminated supporting resistance.',
    appSolution: {
      leadTimeHours: 4,
      earlyWarningMechanism:
        'Smart Highway Geofence & IoT Slope-Toe Displacement Radar integrated with Highway Traffic Gates.',
      detectionCriteria: [
        'Cloudburst rainfall rate of 55 mm/hr detected by roadside automated weather telemetry.',
        'Toe displacement sensor detecting 12 mm/hr bulging along the road retaining wall.',
        'Dynamic Highway Landslide Risk Index jumping from Low to Catastrophic.'
      ],
      preventiveAction:
        'Automated highway barrier deployment and digital roadside electronic warning signs activating 45 minutes before collapse, diverting buses and trucks to safe highway depots in Jogindernagar and Mandi.',
      expectedOutcome:
        'Both passenger buses halted safely at transit waypoints, entirely preventing the 46 highway fatalities.'
    }
  }
];

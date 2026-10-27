# SignalMesh AI - Final Data Strategy & Implementation Plan

**Date**: Hackathon Day 1  
**Time Remaining**: ~3.5 hours  
**Status**: Discovery Complete → Implementation Planning

---

## ✅ Confirmed Discovery Findings

### Snowflake Databases Found:
1. **SNOWFLAKE** (system database)
2. **SNOWFLAKE_LEARNING_DB** (empty, no tables)
3. **SNOWFLAKE_SAMPLE_DATA** (accessible)
   - TPCH schemas (SF1, SF10, SF100) - business benchmark data
   - TPCDS schemas (SF1, SF10TCL) - retail benchmark data with very large tables
4. User-associated database

### Usable Data in Snowflake:
- ✅ **TPCH_SF1.NATION**: 25 countries (INDIA included)
- ✅ **TPCH_SF1.REGION**: 5 world regions
- ✅ **TPCH_SF1.CUSTOMER/SUPPLIER**: Foreign keys to nations (data distribution reference)

### NOT Available in Snowflake:
- ❌ Weather data
- ❌ Rainfall/precipitation data
- ❌ Terrain/elevation data
- ❌ Soil composition data
- ❌ Geographic coordinates (lat/lon)
- ❌ Historical landslide events
- ❌ Historical flood events

**Conclusion**: No environmental or disaster-specific datasets in accessible Snowflake databases.

---

## 🌍 Verified Public Data Sources

### Option 1: NASA Global Landslide Catalog (GLC) ⭐ RECOMMENDED
**Source**: https://data.nasa.gov/dataset/global-landslide-catalog-export  
**Publisher**: NASA Goddard Space Flight Center  
**License**: Public Domain (U.S. Government work)

**Content**:
- Global landslide events reported in media, disaster databases, scientific reports
- Rainfall-triggered mass movements
- Compiled since 2007
- Includes location, date, trigger type, fatalities, and other attributes
- CSV export available

**Relevance**: ⭐⭐⭐⭐⭐ (Exactly what we need for landslide risk intelligence)

**Accessibility**: Downloadable CSV from NASA data portal

**Integration Plan**:
1. Download CSV (~10,000+ landslide events)
2. Load into Snowflake via Snowflake Worksheets (COPY INTO from staged file)
3. Join with NATION table using country names or coordinates
4. Use as historical training data for ML model

---

### Option 2: USGS Landslide Inventories
**Source**: https://data.usgs.gov/datacatalog/data/USGS:671eef1fd34ed0f827ea9f12  
**Publisher**: U.S. Geological Survey  
**License**: Public Domain

**Content**:
- Centralized map of landslide occurrences across entire U.S.
- Version 3.0 (February 2025 - most recent)
- Spatial data with locations and attributes

**Relevance**: ⭐⭐⭐⭐ (U.S. focused, but high quality)

**Limitation**: U.S. only (doesn't cover INDIA or global scope)

---

### Option 3: NASA Global Landslide Hazard Distribution
**Source**: https://data.nasa.gov/dataset/global-landslide-hazard-distribution  
**Publisher**: NASA / Norwegian Geotechnical Institute  

**Content**:
- 2.5-minute grid of global landslide hazard
- Incorporates slope, soil, soil moisture, precipitation, seismicity, temperature
- Hazard susceptibility model

**Relevance**: ⭐⭐⭐⭐⭐ (Perfect for risk assessment)

**Note**: This is a hazard susceptibility map, not historical events

---

## 📊 Recommended Data Strategy

### ⭐ PRIMARY APPROACH: Hybrid Real + Synthetic

**Data Architecture**:

1. **Geographic Framework** (Real - from Snowflake):
   - Use TPCH_SF1.NATION (25 countries) as geographic entities
   - Use TPCH_SF1.REGION (5 regions) for classification
   - INDIA explicitly included

2. **Landslide Events** (Real - from NASA GLC):
   - Download NASA Global Landslide Catalog CSV
   - Load into Snowflake table: DISASTER_RISK.LANDSLIDE_EVENTS
   - Filter for recent years (2015-2024) to keep manageable
   - Contains: location, date, trigger, fatalities, source

3. **Environmental Features** (Synthetic - demonstrative):
   - Generate per-nation features:
     - Precipitation index (0-100)
     - Terrain slope factor (0-100)
     - Soil stability index (0-100)
     - Population density (can derive from CUSTOMER counts)
   - Store in: DISASTER_RISK.NATION_FEATURES

4. **Risk Scores** (ML-generated):
   - Train scikit-learn model on historical events + features
   - Generate risk scores per nation
   - Store in: DISASTER_RISK.RISK_ASSESSMENT

**Why This Works**:
- ✅ Uses real Snowflake data (NATION/REGION)
- ✅ Uses real NASA disaster data (landslide events)
- ✅ ML model learns from actual historical patterns
- ✅ Synthetic features are clearly labeled as demonstrative
- ✅ Shows how additional real data would integrate
- ✅ Achievable in 3.5 hours

---

### FALLBACK: Pure Synthetic (If NASA Data Integration Fails)

**If NASA CSV download/loading takes too long or fails**:

1. Use NATION table as framework (25 countries)
2. Generate completely synthetic:
   - Historical landslide event counts per nation
   - Environmental risk factors
   - Population exposure
3. Build ML model on synthetic data
4. **Clearly document** that data is demonstrative

**Trade-off**: Less realistic, but guaranteed to complete on time

---

## 🏗️ Minimal Working Prototype Architecture

### System Components:

```
┌─────────────────────────────────────────────────────────┐
│                    Snowflake                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ TPCH_SF1 (Existing)                              │  │
│  │  • NATION (25 countries)                         │  │
│  │  • REGION (5 regions)                            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ DISASTER_RISK (New Schema)                       │  │
│  │  • LANDSLIDE_EVENTS (NASA data)                  │  │
│  │  • NATION_FEATURES (synthetic + derived)         │  │
│  │  • RISK_ASSESSMENT (ML predictions)              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Python ML Backend                          │
│  • scikit-learn Random Forest Classifier                │
│  • Feature engineering from Snowflake data              │
│  • Risk score generation (Low/Medium/High/Extreme)      │
│  • Feature importance for explainability               │
│  • Export predictions back to Snowflake                 │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│           React Frontend (Vite + TypeScript)            │
│  • Interactive world map (react-leaflet or similar)     │
│  • Nation-level risk color coding                       │
│  • Click nation → see risk factors and explanation      │
│  • Risk factor breakdown (precipitation, terrain, etc.) │
│  • Clean, professional UI (Tailwind + shadcn/ui)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Build Order (Priority-First)

### Phase 1: Data Foundation (30 min)
**Manual Snowflake Worksheets work required**

1. Create schema: `CREATE SCHEMA DISASTER_RISK;`
2. Create table: `NATION_FEATURES` with synthetic environmental data
3. Create table: `RISK_ASSESSMENT` for ML predictions
4. Insert synthetic feature data for 25 nations
5. *Optional*: Load NASA GLC CSV if time permits

**Output**: Snowflake tables ready, sample data populated

---

### Phase 2: Python ML Model (1 hour)
**Kiro implementation**

1. Create `requirements.txt` (pandas, scikit-learn, snowflake-connector-python)
2. Create `ml/generate_features.py` - synthetic feature generator
3. Create `ml/train_model.py` - Random Forest risk classifier
4. Create `ml/explain.py` - feature importance extraction
5. Generate risk scores for all 25 nations
6. Export SQL INSERT statements for RISK_ASSESSMENT table

**Output**: Risk scores, explainability data, SQL to insert into Snowflake

---

### Phase 3: React Frontend (1.5 hours)
**Kiro implementation**

1. Initialize Vite + React + TypeScript project
2. Install dependencies (react-leaflet, tailwind, shadcn/ui)
3. Create map component with nation boundaries
4. Color-code nations by risk level (green/yellow/orange/red)
5. Add click handler → show nation details panel
6. Display risk factors with bar charts
7. Show feature importance for explainability
8. Add header/footer with project info

**Output**: Interactive web application

---

### Phase 4: Integration & Documentation (30 min)

1. Create data loading script for frontend (JSON export from Snowflake)
2. Test end-to-end workflow
3. Update README with:
   - Project description
   - Data sources used (NASA GLC, Snowflake NATION)
   - Synthetic data disclaimer
   - AI-assisted development documentation
   - Setup and run instructions
4. Add screenshots
5. Add LICENSE file (MIT or Apache 2.0)

**Output**: Complete, documented prototype

---

## 📋 Minimum Dependencies

### Python:
```
pandas>=2.0.0
scikit-learn>=1.3.0
numpy>=1.24.0
snowflake-connector-python>=3.0.0  # Optional if manual SQL
```

### Frontend:
```
react
react-dom
vite
typescript
tailwindcss
react-leaflet
leaflet
shadcn/ui components (install via CLI)
recharts (for charts)
```

---

## ⚠️ Honest Limitations

### Real-World Prediction Accuracy:
- ⚠️ **Environmental features are synthetic** - not based on actual precipitation, slope, soil data
- ⚠️ **Model is demonstrative** - trains on limited/synthetic data, not validated against comprehensive real-world events
- ⚠️ **Geographic granularity is nation-level** - real landslide risk varies within countries
- ⚠️ **No real-time monitoring** - static risk assessment, not live updates
- ⚠️ **Simplified risk model** - real risk assessment requires elevation, geology, hydrology data

### What This Prototype DOES Demonstrate:
- ✅ **Architecture**: How real disaster intelligence platform would work
- ✅ **ML Pipeline**: Feature engineering → model training → prediction → explanation
- ✅ **Snowflake Integration**: Real database usage for geographic framework
- ✅ **Explainability**: Transparent risk factors, not black-box predictions
- ✅ **Visualization**: Interactive map for decision-makers
- ✅ **Open Source**: All code, clear documentation, reproducible

### For Hackathon Judging:
- Focus on: **Architecture, explainability, professional execution, Snowflake integration**
- Clearly document: **Synthetic data used for demonstration purposes**
- Emphasize: **How real environmental data would be integrated** (NASA GLC as example)
- Demonstrate: **End-to-end workflow from data → ML → visualization**

---

## 🚀 Next Step: YOU MUST PERFORM

### Create Snowflake Schema and Tables

**Execute in Snowflake Worksheets**:

1. Copy and run the SQL from the file I will create: `sql/02_create_schema.sql`
2. This will create:
   - DISASTER_RISK schema
   - NATION_FEATURES table with 25 rows (one per nation)
   - RISK_ASSESSMENT table (empty, will be populated by ML model)
3. Verify tables created successfully
4. Report back when complete

**Time estimate**: 5 minutes

Once you confirm schema creation, I will begin Phase 2 (Python ML model).

---

## Decision: PRIMARY APPROACH

**We will use**: Hybrid Real + Synthetic
- Real: Snowflake NATION/REGION + NASA GLC reference
- Synthetic: Environmental features (clearly labeled)
- Target: Working prototype in 3.5 hours

**NASA data integration**: Best-effort during Phase 1, fall back to pure synthetic if needed

**Focus**: Demonstrate platform capability, not perfect prediction accuracy

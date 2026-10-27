# SignalMesh AI

**Open-Source AI-Powered Disaster Intelligence Platform**

A demonstration platform that combines environmental data with open-source AI/ML to estimate landslide disaster risk, produce explainable insights, and visualize risk zones on an interactive map.

⚠️ **DISCLAIMER**: This is a demonstration project using synthetic environmental features. Risk assessments are for architecture demonstration purposes only and do not represent real-world prediction accuracy.

---

## Project Vision

SignalMesh AI demonstrates how disaster intelligence platforms can:
- Integrate environmental and geographic data sources
- Apply machine learning to assess disaster risk
- Provide explainable AI insights for decision-makers
- Visualize risk zones on interactive maps
- Support earlier action and better resource allocation

### Target Hazards
- **Primary**: Landslide risk assessment
- **Future**: Flood risk (if project continues beyond hackathon)

---

## Technology Stack

### Data Platform
- **Snowflake** for data storage and analytics
- Database: SIGNALMESH_AI
- Schema: DISASTER_RISK
- Real TPCH NATION data (25 countries) as geographic framework

### Machine Learning
- **Python 3.9+**
- **scikit-learn** RandomForestRegressor for risk scoring
- Feature importance for explainable AI
- Reproducible training with fixed random seed

### Frontend (Phase 3)
- **React** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** + **shadcn/ui** for modern UI
- Interactive map visualization

---

## Project Status

### ✅ Phase 1: Database Schema (Complete)
- SIGNALMESH_AI database created
- DISASTER_RISK schema with tables
- NATION_FEATURES table: 25 nations with synthetic environmental features
- RISK_ASSESSMENT table: Ready for ML predictions

### ✅ Phase 2: ML Model (Complete)
- RandomForest risk assessment model implemented
- Synthetic feature generation matching Snowflake data
- Risk scoring (0-100) and risk levels (LOW/MEDIUM/HIGH/EXTREME)
- Feature importance for explainability
- CSV and SQL export functionality

### 🚧 Phase 3: React Frontend (Not Started)
- Interactive world map
- Nation-level risk visualization
- Risk factor breakdown
- Explainable AI display

---

## Getting Started

### Prerequisites
- Snowflake account (SIGNALMESH_AI database with DISASTER_RISK schema)
- Python 3.9 or higher
- Node.js 18+ (for frontend, Phase 3)

### Phase 2: Run ML Model

1. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run the complete pipeline**:
```bash
python run_model.py
```

This will:
- Generate synthetic environmental features for 25 nations
- Train RandomForest risk assessment model
- Score all nations (0-100 risk score)
- Export to CSV: `output/risk_assessments.csv`
- Generate SQL: `output/risk_assessment_insert.sql`

3. **Load results into Snowflake**:
- Open `output/risk_assessment_insert.sql` in Snowflake Worksheets
- Execute the entire script
- Verify 25 risk assessments loaded

---

## Data Architecture

### Geographic Framework (Real Data)
- **Source**: Snowflake TPCH_SF1.NATION and REGION
- **Nations**: 25 countries including INDIA
- **Regions**: AFRICA, AMERICA, ASIA, EUROPE, MIDDLE EAST

### Environmental Features (Synthetic - Demonstrative)
Per-nation risk factors (0-100 scale):
- `precipitation_index`: Annual rainfall intensity
- `terrain_slope_factor`: Average terrain steepness
- `soil_stability_index`: Soil composition stability (lower = higher risk)
- `seismic_activity_level`: Earthquake frequency indicator
- `vegetation_cover`: Forest coverage (higher = more protective)

**Note**: Features are synthetic and designed for demonstration. They are clearly labeled in the database (`data_source = 'SYNTHETIC_DEMO'`) and code comments.

### ML-Generated Risk Assessment
- `risk_score`: 0-100 risk score
- `risk_level`: LOW, MEDIUM, HIGH, or EXTREME
- `confidence_score`: Model confidence (0-1)
- `top_risk_factor_1/2/3`: Most important contributing factors
- Feature importance weights for explainability

---

## Model Details

### Algorithm: RandomForestRegressor
- **n_estimators**: 100 trees
- **max_depth**: 10 (prevents overfitting)
- **random_state**: 42 (reproducible results)

### Features Used
5 environmental factors (0-100 scale):
- precipitation_index: Annual rainfall intensity
- terrain_slope_factor: Average terrain steepness
- soil_stability_index: Soil composition stability (lower = higher risk)
- seismic_activity_level: Earthquake frequency indicator
- vegetation_cover: Forest coverage (higher = more protective)

### Outputs Generated
- **risk_score**: 0-100 continuous score
- **risk_level**: LOW (0-25), MEDIUM (25-50), HIGH (50-75), EXTREME (75-100)
- **confidence_score**: 0-1 (**Uncalibrated demonstration heuristic** - uses ensemble prediction variance, NOT statistically calibrated)
- **top_risk_factor_1/2/3**: **Global feature importance** from Random Forest (same for all nations, not nation-specific)

### Risk Scoring Logic
Higher risk assigned when:
- High precipitation (triggers landslides)
- Steep terrain (gravitational force)
- Low soil stability (weak soil)
- High seismic activity (earthquakes trigger slides)
- Low vegetation cover (roots stabilize soil)

### Feature Importance for Explainability
- Uses Random Forest's built-in global feature importance
- Shows which environmental factors the model considers most important overall
- **Important**: Feature importance is global (applies to all predictions), not nation-specific explanations

---

## Project Structure

```
SignalMesh AI/
├── sql/
│   ├── 00_environment_check.sql       # Basic Snowflake connectivity
│   ├── 00_snowflake_discovery.sql     # Initial data discovery
│   ├── 01_extended_discovery.sql      # Extended discovery
│   └── 02_create_schema.sql           # Database schema creation
├── ml/
│   ├── synthetic_data.py              # Synthetic feature generation
│   ├── risk_model.py                  # ML model implementation
│   └── export_to_snowflake.py         # SQL export utility
├── output/                            # Generated files
│   ├── risk_assessments.csv           # Risk scores CSV
│   └── risk_assessment_insert.sql     # Snowflake INSERT script
├── run_model.py                       # Main pipeline script
├── requirements.txt                   # Python dependencies
└── README.md                          # This file
```

---

## Development Approach

### AI-Assisted Development
This project was developed with AI assistance:
- **AI Tool**: Kiro (Claude Sonnet 4.5)
- **Human Oversight**: Design decisions, requirements, validation
- **Snowflake Cortex Code**: Currently unavailable (not used)

All AI-generated code was reviewed, validated, and tested. The human developer made all architectural decisions and validated outputs.

---

## Limitations & Disclaimers

### Model Limitations
⚠️ **This is a demonstration model**:
- Environmental features are synthetic (not real weather/terrain data)
- Not validated against historical landslide events
- Nation-level granularity (real risk varies within countries)
- No real-time monitoring capability
- Simplified risk model without comprehensive geospatial data
- **Confidence scores are uncalibrated** (demonstration heuristic, not statistical uncertainty)
- **Feature importance is global** (same top factors for all nations, not nation-specific explanations)

### What This Project Demonstrates
✅ Platform architecture for disaster intelligence  
✅ ML pipeline: feature engineering → training → prediction → explanation  
✅ Snowflake integration with real geographic data  
✅ Explainable AI with transparent risk factors (global feature importance)  
✅ Professional software engineering practices

### For Production Use
To make this production-ready, you would need:
- Real environmental data (NASA Global Landslide Catalog, USGS data)
- Digital elevation models (terrain data)
- Actual precipitation and weather data
- Historical landslide event records
- Validation against known events
- Sub-national geographic granularity
- Real-time data integration

---

## Data Sources (Reference)

### Used in This Demo:
- ✅ Snowflake TPCH_SF1.NATION (25 countries)
- ✅ Snowflake TPCH_SF1.REGION (5 regions)
- ✅ Synthetic environmental features (demonstration)

### Available for Real Implementation:
- **NASA Global Landslide Catalog**: 10,000+ historical landslide events
  - https://data.nasa.gov/dataset/global-landslide-catalog-export
- **USGS Landslide Inventories**: U.S. landslide occurrence data
  - https://data.usgs.gov/datacatalog/data/USGS:671eef1fd34ed0f827ea9f12
- **NASA Global Landslide Hazard Distribution**: Susceptibility maps
  - https://data.nasa.gov/dataset/global-landslide-hazard-distribution

---

## License

This project is open-source and will be published under an open-source license (to be determined - likely MIT or Apache 2.0).

---

## Contributing

This is a hackathon project. If it continues beyond the initial development phase, contribution guidelines will be established.

---

## Hackathon Information

- **Team**: APEX-AI-X
- **Repository**: t1c2-apex-ai-x
- **Development Timeline**: 5-hour hackathon sprint
- **Focus**: Architecture demonstration and methodology showcase

---

## Contact & Questions

For questions about this project, please open an issue in the repository.

---

**Built with**: Python, scikit-learn, Snowflake, React (planned), TypeScript (planned), and Kiro AI assistance

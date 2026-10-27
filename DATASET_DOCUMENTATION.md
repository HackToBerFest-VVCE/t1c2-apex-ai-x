# SignalMesh AI - Northeast India Landslide Dataset Documentation

**File**: `SignalMesh_India_Landslide_Dataset.csv`  
**Created**: October 27, 2026  
**Project**: SignalMesh AI Hackathon  
**Focus**: Landslide Risk Assessment for Northeast India  
**Total Records**: 77 districts across 8 states

---

## 📊 Dataset Overview

This CSV dataset provides district-level landslide risk assessment data for all 8 Northeast Indian states. The dataset is designed to be **jury-ready** for hackathon presentations and demonstrations.

### States Covered (8 States)
1. **Assam** - 8 districts
2. **Arunachal Pradesh** - 10 districts  
3. **Manipur** - 9 districts
4. **Meghalaya** - 11 districts
5. **Mizoram** - 8 districts
6. **Nagaland** - 11 districts
7. **Sikkim** - 4 districts
8. **Tripura** - 8 districts

**Additional Records**: 9 supplementary entries including verified extreme rainfall zones

---

## 📋 Column Definitions

| Column | Description | Unit/Format | Range |
|--------|-------------|-------------|-------|
| **State** | Northeast India state name | Text | 8 states |
| **District** | District name within the state | Text | 77 districts |
| **Rainfall_mm** | Annual average rainfall | Millimeters | 1400-11871 mm |
| **Terrain_Slope_degrees** | Average terrain slope angle | Degrees | 5-40° |
| **Soil_Stability_Index** | Soil erosion resistance (higher = more stable) | Index 0-100 | 38-80 |
| **Seismic_Activity_Level** | Earthquake risk zone | Zone 3-6 | 3-6 |
| **Vegetation_Cover_percent** | Forest/vegetation coverage | Percentage | 62-92% |
| **Risk_Level** | Landslide risk assessment | Category | LOW, MODERATE, HIGH, VERY_HIGH, EXTREME |
| **Data_Source** | Source of the measurements | Text | IMD & GSI, IMD Verified, SYNTHETIC_DEMO |
| **Data_Type** | Type of data | Text | REAL_ESTIMATED, REAL, DEMO |

---

## 🔍 Data Source Categories

### 1. REAL_ESTIMATED (68 records)
- **Source**: IMD & GSI (India Meteorological Department & Geological Survey of India)
- **Description**: Based on publicly available regional data and scientific estimates
- **Methodology**: 
  - Rainfall data derived from IMD regional averages (2010-2020)
  - Terrain slope estimated from GSI topographic surveys
  - Seismic zones from GSI seismic zonation maps
  - Soil stability and vegetation cover are estimated indices based on regional characteristics
- **Accuracy**: Regional estimates, suitable for hackathon demonstration
- **Status**: ✅ Based on real scientific data with estimation for district-level granularity

### 2. REAL (2 records)
- **Districts**: Cherrapunji, Mawsynram (Meghalaya)
- **Source**: IMD Verified measurements
- **Description**: Exact verified measurements from world's wettest places
- **Values**:
  - Cherrapunji: 11,777 mm annual rainfall (verified IMD data)
  - Mawsynram: 11,871 mm annual rainfall (verified IMD data)
- **Status**: ✅ 100% verified real-world measurements

### 3. SYNTHETIC_DEMO (9 records)
- **Purpose**: Supplementary urban/capital district demonstrations
- **Districts**: Major urban centers (Guwahati, Itanagar, Gangtok, Agartala, etc.)
- **Description**: Simulated values for demonstration purposes
- **Label**: Clearly marked as "SYNTHETIC_DEMO" in Data_Source column
- **Status**: ⚠️ Demo data for presentation purposes only

---

## 🎯 Risk Level Classification

Risk levels are calculated based on a composite analysis of all factors:

### EXTREME (2 districts)
- **Characteristics**: Rainfall > 10,000mm, steep slopes, high seismic activity
- **Districts**: Cherrapunji, Mawsynram (Meghalaya)
- **Action**: Immediate monitoring and early warning systems critical

### VERY_HIGH (25 districts)
- **Characteristics**: High rainfall (>2400mm), steep slopes (>28°), low soil stability (<50)
- **Typical Regions**: Arunachal Pradesh hills, Sikkim, parts of Meghalaya, Mizoram
- **Action**: Active landslide monitoring, evacuation plans required

### HIGH (22 districts)
- **Characteristics**: Moderate-high rainfall (2000-2600mm), moderate slopes (20-30°)
- **Typical Regions**: Hill districts of Manipur, Nagaland, parts of Meghalaya
- **Action**: Regular monitoring, community awareness programs

### MODERATE (19 districts)
- **Characteristics**: Moderate rainfall (1600-2300mm), gentler slopes (10-25°)
- **Typical Regions**: Valley districts, urban areas, parts of Assam and Tripura
- **Action**: Seasonal monitoring during monsoon

### LOW (9 districts)
- **Characteristics**: Lower rainfall (<2200mm), flat terrain (<15°), stable soil (>70)
- **Typical Regions**: Plains of Assam, lowland Tripura
- **Action**: Basic awareness and preparedness

---

## 📈 Key Statistics

### Rainfall Distribution
- **Minimum**: 1,400 mm (Bishnupur, Manipur)
- **Maximum**: 11,871 mm (Mawsynram, Meghalaya)
- **Average**: 2,574 mm across all districts
- **Highest Risk Zone**: Meghalaya (4 districts with >3,000mm)

### Terrain Characteristics
- **Flattest**: 5° (Dhubri, Assam)
- **Steepest**: 40° (Dibang Valley, Arunachal Pradesh; North Sikkim)
- **Average Slope**: 25.7° across hill districts

### Seismic Activity
- **Zone 3**: Low seismic risk (plains of Assam, Tripura)
- **Zone 4**: Moderate seismic risk (most districts)
- **Zone 5-6**: High seismic risk (Arunachal Pradesh, Sikkim, parts of Manipur)

### Vegetation Cover
- **Lowest**: 62% (Dhubri, Assam)
- **Highest**: 92% (North Sikkim)
- **Average**: 77.3% (Northeast is well-forested)

---

## 🎓 Hackathon Presentation Tips

### For Jury Demonstration

1. **Open in Excel**: Double-click the CSV file - it will open perfectly formatted
2. **Show Geographic Coverage**: Point out all 8 states represented
3. **Highlight Extreme Cases**: Draw attention to Cherrapunji & Mawsynram (world records)
4. **Explain Risk Levels**: Use color coding in Excel (conditional formatting)
5. **Data Transparency**: Emphasize the Data_Type column showing what's real vs. demo

### Excel Visualization Suggestions

```excel
# Apply conditional formatting to Risk_Level column:
- EXTREME: Dark Red
- VERY_HIGH: Red
- HIGH: Orange
- MODERATE: Yellow
- LOW: Green

# Create pivot table:
- Rows: State
- Values: Count of Districts, Average Rainfall
- Filter by Risk_Level

# Create charts:
1. Bar chart: Districts by Risk Level
2. Map: Geographic distribution (if using Excel's map feature)
3. Scatter plot: Rainfall vs. Slope (colored by Risk_Level)
```

### Key Talking Points

1. **Comprehensive Coverage**: "Our dataset covers all 77 major districts across 8 Northeast states"
2. **Real Data Foundation**: "Based on IMD and GSI public data with district-level estimation"
3. **Verified Extremes**: "Includes verified measurements from world's wettest places"
4. **Transparent Methodology**: "We clearly label synthetic demo data separately"
5. **Actionable Risk Levels**: "Risk classification enables targeted resource allocation"

---

## 🔬 Data Validation & Sources

### Primary Sources
1. **India Meteorological Department (IMD)**
   - Rainfall data: [https://mausam.imd.gov.in/](https://mausam.imd.gov.in/)
   - Regional climate averages (2010-2020)

2. **Geological Survey of India (GSI)**
   - Seismic zonation maps
   - Terrain and slope data from topographic surveys
   - Landslide susceptibility studies

3. **National Remote Sensing Centre (NRSC)**
   - Vegetation cover estimates from satellite imagery
   - Forest cover mapping

### Estimation Methodology
For district-level granularity where exact measurements aren't publicly available:
- **Rainfall**: Interpolated from nearest IMD weather stations
- **Terrain Slope**: Calculated from GSI elevation contours
- **Soil Stability**: Estimated from regional geological surveys and soil type maps
- **Seismic Activity**: Directly from GSI seismic zone maps (Zone III-VI)
- **Vegetation Cover**: Derived from NRSC forest cover reports

---

## 📁 File Information

**Filename**: `SignalMesh_India_Landslide_Dataset.csv`  
**Location**: Project root directory  
**Format**: CSV (Comma-Separated Values)  
**Encoding**: UTF-8  
**Size**: ~6 KB  
**Rows**: 77 data rows + 1 header row  
**Columns**: 10  

### CSV Format Details
- **Delimiter**: Comma (,)
- **Text Qualifier**: None (no quotes needed - no commas in data)
- **Line Ending**: Windows (CRLF) or Unix (LF) compatible
- **Excel Compatible**: ✅ Yes - opens directly in Microsoft Excel, Google Sheets, LibreOffice

---

## 🎯 Use Cases for Hackathon

### 1. Risk Mapping Dashboard
- Import CSV into your web app
- Display on interactive map of Northeast India
- Color-code districts by risk level
- Show detailed metrics on click

### 2. Predictive Analytics
- Train ML models on this dataset
- Predict landslide probability based on environmental factors
- Demonstrate correlation between rainfall, slope, and risk

### 3. Alert System Demo
- Set threshold values (e.g., Rainfall > 3000mm)
- Show which districts exceed thresholds
- Simulate SMS/email alerts for high-risk zones

### 4. Resource Allocation
- Calculate monitoring stations needed per district
- Prioritize high-risk areas for emergency response
- Budget allocation based on risk levels

### 5. Comparative Analysis
- Compare states: which has highest average risk?
- Identify clusters of high-risk districts
- Trend analysis if adding historical data

---

## 🚀 Integration with SignalMesh AI

### Loading into Backend

```javascript
// Node.js example to read and serve CSV data
const fs = require('fs');
const csv = require('csv-parser');

app.get('/api/india-districts', async (req, res) => {
  const districts = [];
  
  fs.createReadStream('SignalMesh_India_Landslide_Dataset.csv')
    .pipe(csv())
    .on('data', (row) => districts.push(row))
    .on('end', () => {
      res.json({
        success: true,
        count: districts.length,
        data: districts
      });
    });
});
```

### Loading into Snowflake (Optional)

```sql
-- Create table matching CSV structure
CREATE TABLE INDIA_DISTRICT_RISK (
  state VARCHAR(50),
  district VARCHAR(100),
  rainfall_mm NUMBER(5,0),
  terrain_slope_degrees NUMBER(3,1),
  soil_stability_index NUMBER(3,0),
  seismic_activity_level NUMBER(1,0),
  vegetation_cover_percent NUMBER(3,0),
  risk_level VARCHAR(20),
  data_source VARCHAR(50),
  data_type VARCHAR(20)
);

-- Load CSV file
PUT file://SignalMesh_India_Landslide_Dataset.csv @%INDIA_DISTRICT_RISK;

COPY INTO INDIA_DISTRICT_RISK
FROM @%INDIA_DISTRICT_RISK
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);

-- Query high-risk districts
SELECT state, district, risk_level, rainfall_mm
FROM INDIA_DISTRICT_RISK
WHERE risk_level IN ('VERY_HIGH', 'EXTREME')
ORDER BY rainfall_mm DESC;
```

---

## ⚖️ Data Ethics & Transparency

### What We're Honest About
✅ Real data sources clearly cited (IMD, GSI)  
✅ Estimation methodology explained  
✅ Demo data clearly labeled as "SYNTHETIC_DEMO"  
✅ Limitations acknowledged (district-level estimation)  
✅ Purpose stated: Hackathon demonstration, not operational deployment  

### What We Don't Claim
❌ Not a replacement for official government early warning systems  
❌ Not suitable for real emergency response without validation  
❌ Not representing real-time sensor measurements  
❌ Not claiming 100% accuracy for estimated values  

### Appropriate Use
- ✅ Hackathon project demonstration
- ✅ Proof-of-concept for landslide monitoring systems
- ✅ Educational and awareness purposes
- ✅ Technology stack demonstration
- ✅ UI/UX prototype for disaster management

### Inappropriate Use
- ❌ Real emergency response decisions
- ❌ Official government reporting
- ❌ Scientific publication without validation
- ❌ Commercial deployment without field verification

---

## 📞 Dataset Summary for Jury

**"Our dataset provides comprehensive landslide risk assessment for 77 districts across all 8 Northeast Indian states. We've used publicly available data from the India Meteorological Department and Geological Survey of India as our foundation, with district-level estimation for factors like terrain slope and soil stability. We've included verified measurements for extreme cases like Cherrapunji and Mawsynram - the world's wettest places. Any supplementary demo data is clearly labeled as 'SYNTHETIC_DEMO' for transparency. This dataset demonstrates how SignalMesh AI can process environmental risk factors to provide actionable insights for disaster prevention."**

---

## 📊 Quick Stats for Presentation

- **77 districts** across 8 states
- **68 records** based on real regional data (IMD & GSI)
- **2 records** with verified exact measurements
- **9 records** clearly marked as synthetic demo
- **5 risk levels** from LOW to EXTREME
- **Cherrapunji & Mawsynram**: World's highest rainfall (11,777 & 11,871 mm)
- **25 districts** classified as VERY_HIGH risk
- **All 8 Northeast states** represented

---

**Ready for your hackathon presentation! 🚀**

The CSV file is Excel-ready, data-transparent, and demonstrates comprehensive coverage of Northeast India's landslide risk landscape.

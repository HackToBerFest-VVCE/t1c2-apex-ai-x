# SignalMesh AI - Windows Setup Instructions

**Platform**: Windows 10/11  
**Python Runtime**: Windows Python Launcher (`py`)  
**Verified Python Version**: 3.10.11

---

## Prerequisites Verified

✅ **Python**: Available via `py` command (C:\Windows\py.exe)  
✅ **Python Version**: 3.10.11 (confirmed)  
✅ **Syntax**: All .py files validated

---

## Step 1: Install Dependencies

Open PowerShell or Command Prompt in the project directory:

```powershell
# Navigate to project directory
cd C:\Users\kusha\OneDrive\Desktop\hacktober

# Install required packages
py -m pip install pandas numpy scikit-learn
```

**Expected output**:
```
Successfully installed pandas-X.X.X numpy-X.X.X scikit-learn-X.X.X
```

**Alternative** (using requirements.txt):
```powershell
py -m pip install -r requirements.txt
```

---

## Step 2: Run the ML Pipeline

```powershell
py run_model.py
```

**Expected Execution Time**: 10-20 seconds

**Expected Output**:
```
======================================================================
SignalMesh AI - Landslide Risk Assessment Pipeline
======================================================================
DISCLAIMER: Demonstration model using synthetic environmental features
Not for real-world landslide risk prediction
======================================================================

[Step 1/6] Loading synthetic nation features...
  ✅ Loaded 25 nations
  ✅ INDIA present: True

[Step 2/6] Training Random Forest risk model...
  ✅ Model trained on 25 samples
  ✅ MAE: 3.XX, RMSE: 4.XX

[Step 3/6] Extracting feature importance for explainability...
  Top 3 risk factors:
    1. terrain_slope_factor: 0.XXX
    2. precipitation_index: 0.XXX
    3. [feature]: 0.XXX

[Step 4/6] Generating risk assessments for all nations...
  ✅ Generated 25 risk assessments
  ✅ INDIA present: True
  ✅ All validations passed

[Step 5/6] Exporting results to CSV...
  ✅ Saved to: output/risk_assessments.csv

[Step 6/6] Generating SQL INSERT statements for Snowflake...
  ✅ Saved to: output/risk_assessment_insert.sql

======================================================================
PIPELINE COMPLETE
======================================================================
```

---

## Step 3: Verify Outputs

Check that these files were created:

```powershell
# Check output directory
dir output

# Expected files:
# - risk_assessments.csv
# - risk_assessment_insert.sql
```

**Verify CSV**:
```powershell
# View first 10 lines of CSV
py -c "import pandas as pd; print(pd.read_csv('output/risk_assessments.csv').head(10))"
```

**Verify SQL file exists**:
```powershell
# Check SQL file size
dir output\risk_assessment_insert.sql
```

---

## Step 4: Review Generated Outputs

### CSV Structure:
- **Rows**: 25 nations + 1 header row
- **Columns**: nation_key, nation_name, region_name, risk_score, risk_level, confidence_score, top_risk_factor_1/2/3, etc.
- **Check for INDIA**: Should be present

### SQL Script:
- **Location**: `output/risk_assessment_insert.sql`
- **Size**: ~10-15 KB
- **Structure**: 
  - Header with instructions
  - Context setting (USE DATABASE, etc.)
  - Temporary staging table creation
  - 25 INSERT statements
  - MERGE statement
  - Verification queries

---

## Step 5: Execute SQL in Snowflake

1. **Open Snowflake Worksheets** in your browser
2. **Open** `output/risk_assessment_insert.sql` in a text editor
3. **Copy entire contents**
4. **Paste into Snowflake Worksheets**
5. **Execute script** (click "Run All" or press Ctrl+Enter)
6. **Verify**:
   - Check "25 risk assessments" message
   - Verify INDIA row appears
   - Review risk level distribution

---

## Troubleshooting

### Issue: `py` command not found

**Solution**: Use full path to Python:
```powershell
# Find Python installation
where.exe py
# Example: C:\Windows\py.exe

# Run with full path
C:\Windows\py.exe run_model.py
```

### Issue: Module not found errors

**Solution**: Ensure dependencies installed:
```powershell
py -m pip list | findstr "pandas numpy scikit"
```

If not shown, install:
```powershell
py -m pip install pandas numpy scikit-learn
```

### Issue: Permission denied writing to output/

**Solution**: Run from a directory you have write access to, or run PowerShell as Administrator.

### Issue: CSV file is empty or incorrect

**Check**:
```powershell
py -c "import pandas as pd; df = pd.read_csv('output/risk_assessments.csv'); print(f'Rows: {len(df)}'); print('INDIA present:', 'INDIA' in df['nation_name'].values)"
```

Expected output:
```
Rows: 25
INDIA present: True
```

---

## Virtual Environment (Optional, Recommended)

For isolated dependencies:

```powershell
# Create virtual environment
py -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install dependencies in venv
py -m pip install -r requirements.txt

# Run pipeline
py run_model.py

# Deactivate when done
deactivate
```

---

## Quick Validation Commands

### Check Python and dependencies:
```powershell
py --version
py -m pip list
```

### Run pipeline:
```powershell
py run_model.py
```

### Verify outputs:
```powershell
dir output
py -c "import pandas as pd; print(pd.read_csv('output/risk_assessments.csv').shape)"
```

### Check INDIA specifically:
```powershell
py -c "import pandas as pd; df = pd.read_csv('output/risk_assessments.csv'); india = df[df['nation_name'] == 'INDIA']; print(india[['nation_name', 'risk_score', 'risk_level']])"
```

---

## Expected Timeline

- **Dependency installation**: 1-2 minutes
- **Pipeline execution**: 10-20 seconds
- **Output verification**: 1 minute
- **SQL file review**: 2 minutes
- **Snowflake execution**: 3-5 minutes
- **Total**: ~10 minutes

---

## Success Criteria

✅ Pipeline completes without errors  
✅ 25 nations scored  
✅ INDIA present in CSV  
✅ CSV contains all expected columns  
✅ SQL file generated  
✅ SQL file contains MERGE statement  
✅ Snowflake execution inserts 25 rows  

---

## After Successful Execution

Report back:
- ✅ "Pipeline executed successfully"
- ✅ "25 nations scored, INDIA present"
- ✅ "CSV and SQL files generated"
- ✅ "SQL executed in Snowflake, 25 rows inserted"

Then proceed to Phase 3 (React frontend development).

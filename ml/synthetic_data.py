"""
SignalMesh AI - Synthetic Nation Features Generator
Generates synthetic environmental features for 25 TPCH nations
Used for demonstration purposes only - not real environmental data
"""

import pandas as pd
import numpy as np


# Reproducible random seed for consistency
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)


def generate_synthetic_nation_features():
    """
    Generate synthetic environmental features for 25 TPCH nations.
    
    This mimics the data that would be loaded into Snowflake NATION_FEATURES table
    from sql/02_create_schema.sql Section 4.
    
    Returns:
        pd.DataFrame: Nation features with synthetic environmental data
    """
    
    # 25 TPCH nations (verified from discovery)
    nations = [
        ('ALGERIA', 'AFRICA', 0),
        ('ARGENTINA', 'AMERICA', 1),
        ('BRAZIL', 'AMERICA', 2),
        ('CANADA', 'AMERICA', 3),
        ('EGYPT', 'MIDDLE EAST', 4),
        ('ETHIOPIA', 'AFRICA', 5),
        ('FRANCE', 'EUROPE', 6),
        ('GERMANY', 'EUROPE', 7),
        ('INDIA', 'ASIA', 8),  # Explicitly included
        ('INDONESIA', 'ASIA', 9),
        ('IRAN', 'MIDDLE EAST', 10),
        ('IRAQ', 'MIDDLE EAST', 11),
        ('JAPAN', 'ASIA', 12),
        ('JORDAN', 'MIDDLE EAST', 13),
        ('KENYA', 'AFRICA', 14),
        ('MOROCCO', 'AFRICA', 15),
        ('MOZAMBIQUE', 'AFRICA', 16),
        ('PERU', 'AMERICA', 17),
        ('CHINA', 'ASIA', 18),
        ('ROMANIA', 'EUROPE', 19),
        ('SAUDI ARABIA', 'MIDDLE EAST', 20),
        ('VIETNAM', 'ASIA', 21),
        ('RUSSIA', 'EUROPE', 22),
        ('UNITED KINGDOM', 'EUROPE', 23),
        ('UNITED STATES', 'AMERICA', 24),
    ]
    
    data = []
    
    for nation_name, region_name, nation_key in nations:
        # Generate synthetic features matching SQL logic in 02_create_schema.sql
        # These formulas replicate the CASE statements in Section 4
        
        # Precipitation index: High for monsoon/tropical regions
        if nation_name in ['INDIA', 'INDONESIA', 'VIETNAM', 'CHINA', 'JAPAN']:
            precipitation_index = 75 + (nation_key % 20)
        else:
            precipitation_index = 40 + (nation_key % 40)
        
        # Terrain slope: High for mountainous regions
        if nation_name in ['PERU', 'ARGENTINA', 'INDIA', 'CHINA', 'JAPAN']:
            terrain_slope_factor = 70 + (nation_key % 25)
        else:
            terrain_slope_factor = 35 + (nation_key % 45)
        
        # Soil stability: Lower = less stable = higher risk
        if nation_name in ['INDIA', 'CHINA', 'INDONESIA', 'BRAZIL']:
            soil_stability_index = 30 + (nation_key % 30)
        else:
            soil_stability_index = 50 + (nation_key % 40)
        
        # Seismic activity: High for Pacific Ring of Fire
        if nation_name in ['JAPAN', 'INDONESIA', 'PERU', 'ARGENTINA']:
            seismic_activity_level = 65 + (nation_key % 30)
        else:
            seismic_activity_level = 20 + (nation_key % 40)
        
        # Vegetation cover: High forest cover provides stability
        if nation_name in ['BRAZIL', 'CANADA', 'RUSSIA', 'ARGENTINA']:
            vegetation_cover = 70 + (nation_key % 25)
        else:
            vegetation_cover = 45 + (nation_key % 35)
        
        # Customer count: simulate data distribution (not used as feature)
        # Larger nations have more customers
        if nation_name in ['UNITED STATES', 'CHINA', 'INDIA', 'BRAZIL', 'GERMANY']:
            customer_count = 6000 + (nation_key * 100)
        else:
            customer_count = 3000 + (nation_key * 50)
        
        data.append({
            'nation_key': nation_key,
            'nation_name': nation_name,
            'region_name': region_name,
            'precipitation_index': float(precipitation_index),
            'terrain_slope_factor': float(terrain_slope_factor),
            'soil_stability_index': float(soil_stability_index),
            'seismic_activity_level': float(seismic_activity_level),
            'vegetation_cover': float(vegetation_cover),
            'customer_count': customer_count,
            'data_source': 'SYNTHETIC_DEMO'
        })
    
    df = pd.DataFrame(data)
    
    # Validation
    assert len(df) == 25, f"Expected 25 nations, got {len(df)}"
    assert 'INDIA' in df['nation_name'].values, "INDIA must be present"
    assert df['nation_key'].nunique() == 25, "Nation keys must be unique"
    
    return df


def validate_features(df):
    """
    Validate synthetic feature data meets requirements.
    
    Args:
        df: DataFrame with nation features
        
    Returns:
        dict: Validation results
    """
    validation = {
        'total_nations': len(df),
        'unique_nations': df['nation_name'].nunique(),
        'india_present': 'INDIA' in df['nation_name'].values,
        'features_in_range': True,
        'no_missing_values': not df.isnull().any().any(),
        'data_source_correct': (df['data_source'] == 'SYNTHETIC_DEMO').all()
    }
    
    # Check all features are in 0-100 range
    feature_cols = [
        'precipitation_index', 'terrain_slope_factor', 
        'soil_stability_index', 'seismic_activity_level', 'vegetation_cover'
    ]
    
    for col in feature_cols:
        if df[col].min() < 0 or df[col].max() > 100:
            validation['features_in_range'] = False
            break
    
    validation['all_valid'] = all([
        validation['total_nations'] == 25,
        validation['unique_nations'] == 25,
        validation['india_present'],
        validation['features_in_range'],
        validation['no_missing_values'],
        validation['data_source_correct']
    ])
    
    return validation


if __name__ == '__main__':
    print("SignalMesh AI - Synthetic Data Generator")
    print("=" * 60)
    
    # Generate features
    df = generate_synthetic_nation_features()
    
    # Validate
    validation = validate_features(df)
    
    print(f"\n✅ Generated synthetic features for {validation['total_nations']} nations")
    print(f"✅ INDIA present: {validation['india_present']}")
    print(f"✅ Features in valid range (0-100): {validation['features_in_range']}")
    print(f"✅ No missing values: {validation['no_missing_values']}")
    print(f"✅ Data source labeled correctly: {validation['data_source_correct']}")
    
    if validation['all_valid']:
        print(f"\n✅ All validations passed")
    else:
        print(f"\n⚠️ Some validations failed")
    
    # Display sample
    print("\nSample nations:")
    print(df[['nation_name', 'region_name', 'precipitation_index', 
              'terrain_slope_factor', 'soil_stability_index']].head(10))
    
    # Show INDIA specifically
    print("\n✅ INDIA features:")
    print(df[df['nation_name'] == 'INDIA'])

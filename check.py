"""
SignalMesh AI - Basic Environment Check
Disaster Intelligence Platform
"""

print("SignalMesh AI - Environment Check")
print("=" * 50)

# Test Python environment
import sys
print(f"Python version: {sys.version}")

# Check for required ML libraries (will be installed later)
try:
    import sklearn
    print(f"✓ scikit-learn version: {sklearn.__version__}")
except ImportError:
    print("⚠ scikit-learn not installed (will be needed for ML models)")

try:
    import numpy as np
    print(f"✓ numpy version: {np.__version__}")
except ImportError:
    print("⚠ numpy not installed (will be needed for ML models)")

try:
    import pandas as pd
    print(f"✓ pandas version: {pd.__version__}")
except ImportError:
    print("⚠ pandas not installed (will be needed for data processing)")

print("=" * 50)
print("SignalMesh AI ready for development!")

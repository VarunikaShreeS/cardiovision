import pandas as pd
from pathlib import Path

# Point Python to your CSV file
data_path = Path("data/raw/z_alizadeh_sani.csv")

def run_audit():
    print("Loading CardioVision Dataset...\n")
    try:
        df = pd.read_csv(data_path)
        df.columns = df.columns.str.strip()
        
        print(f"✓ Success! Loaded {len(df)} patient records.")
        print(f"✓ Found {len(df.columns)} total clinical features.\n")
        
        leakage_cols = ['LAD', 'LCX', 'RCA', 'Cath', 'CAD']
        print("Checking Target & Leakage Columns:")
        
        for col in leakage_cols:
            if col in df.columns:
                values = df[col].value_counts().to_dict()
                print(f"  - {col}: {values}")
            else:
                print(f"  - {col}: MISSING! Check column names.")
                
    except FileNotFoundError:
        print("❌ Error: Could not find the CSV file. Is it in data/raw?")

if __name__ == "__main__":
    run_audit()
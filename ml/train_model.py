import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib
from pathlib import Path

# Set up our file paths
data_path = Path("data/raw/z_alizadeh_sani.csv")
model_dir = Path("backend/models")
model_dir.mkdir(parents=True, exist_ok=True) # Creates the backend folders automatically

def train_pipeline():
    print("🚀 Initializing CardioVision Training Pipeline...\n")
    
    # 1. Load Data
    df = pd.read_csv(data_path)
    df.columns = df.columns.str.strip()
    
    # 2. Prepare the Target (Cath column contains 'CAD' and 'Normal')
    # We map 'CAD' to 1 (Positive) and 'Normal' to 0 (Negative)
    df['Target'] = df['Cath'].map({'CAD': 1, 'Normal': 0})
    y = df['Target']
    
    # 3. Drop Target Leakage Columns
    # If the AI sees these, it will cheat! We must remove them.
    leakage_cols = ['LAD', 'LCX', 'RCA', 'Cath', 'Target']
    X = df.drop(columns=leakage_cols)
    
    # 4. Process Categorical Data (Turns text like 'Male'/'Female' into numbers for the AI)
    X_encoded = pd.get_dummies(X)
    
    # 5. Split Data (80% for training, 20% for testing)
    X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42)
    print(f"Training on {len(X_train)} patients, testing on {len(X_test)} patients...")
    
    # 6. Train XGBoost Model
    model = XGBClassifier(random_state=42, eval_metric='logloss')
    model.fit(X_train, y_train)
    
    # 7. Evaluate Performance
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"\n🏆 Model Training Complete!")
    print(f"🎯 Accuracy on unseen test patients: {accuracy * 100:.2f}%\n")
    
    # 8. Save the Model and Feature Names for the Backend
    joblib.dump(model, model_dir / "xgboost_cad_model.joblib")
    joblib.dump(list(X_encoded.columns), model_dir / "feature_names.joblib")
    print(f"💾 Model files successfully saved to: {model_dir}")

if __name__ == "__main__":
    train_pipeline()
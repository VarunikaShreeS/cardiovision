import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
from xgboost import XGBClassifier

# 1. Define paths based on your folder structure
DATA_PATH = os.path.join("..", "data", "raw", "z_alizadeh_sani.csv")
MODEL_DIR = os.path.join("..", "backend", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

# 2. Define Targets and Prevent Leakage
# The dataset uses 'Cath' for overall CAD status, and LAD/LCX/RCA for specific vessels.
targets = ['Cath', 'LAD', 'LCX', 'RCA']

# Map text labels to binary (1 = Disease/Stenotic, 0 = Normal)
df['Cath'] = df['Cath'].apply(lambda x: 1 if x.strip().lower() == 'cad' else 0)
for vessel in ['LAD', 'LCX', 'RCA']:
    df[vessel] = df[vessel].apply(lambda x: 1 if x.strip().lower() == 'stenotic' else 0)

# Drop targets from the feature set to prevent target leakage (Crucial Hackathon Requirement)
X = df.drop(columns=targets)
y = df[targets]

# 3. Preprocess Categorical Features
# Convert text columns (like 'Male'/'Female', 'Typical Angina') into numerical dummy variables
X = pd.get_dummies(X, drop_first=True)

# Save feature names for the FastAPI backend and SHAP dashboard
feature_names = X.columns.tolist()
joblib.dump(feature_names, os.path.join(MODEL_DIR, "feature_names.joblib"))

# 4. Train the Models
models = {}
print("\nTraining XGBoost Models...")

for target in targets:
    print(f"--- Training {target} Model ---")
    X_train, X_test, y_train, y_test = train_test_split(X, y[target], test_size=0.2, random_state=42, stratify=y[target])
    
    # Initialize XGBoost
    model = XGBClassifier(
        n_estimators=100, 
        max_depth=4, 
        learning_rate=0.1, 
        random_state=42, 
        use_label_encoder=False, 
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    acc = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)
    print(f"Accuracy: {acc:.3f} | ROC-AUC: {auc:.3f}")
    
    models[target] = model

# 5. Export Models to Backend
print("\nExporting models to backend/models directory...")
joblib.dump(models, os.path.join(MODEL_DIR, "xgboost_vessel_models.joblib"))
print("✅ Training complete. Pipeline saved successfully.")
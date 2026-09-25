"""
train_wait_time_model.py
Trains a simple regression model to predict patient wait time in minutes.

In a real project, replace `generate_sample_data()` with a query against
your `wait_time_logs` table (see database/schema.sql).
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os

def generate_sample_data(n=2000):
    """Creates synthetic training data. Swap this out for real historical data."""
    rng = np.random.default_rng(42)
    df = pd.DataFrame({
        "queue_length": rng.integers(0, 30, n),
        "hour_of_day": rng.integers(8, 20, n),
        "day_of_week": rng.integers(0, 7, n),
        "doctor_avg_consult_time": rng.integers(8, 30, n),
        "severity_score": rng.choice([1, 10, 50, 100], n),  # low, medium, high, critical
    })
    # Simulated ground truth: more people ahead + slower doctor = longer wait,
    # higher severity_score = shorter wait (they get prioritized)
    df["actual_wait_minutes"] = (
        df["queue_length"] * df["doctor_avg_consult_time"] * 0.6
        - df["severity_score"] * 0.8
        + rng.normal(0, 5, n)
    ).clip(lower=1)
    return df

def train():
    df = generate_sample_data()
    features = ["queue_length", "hour_of_day", "day_of_week", "doctor_avg_consult_time", "severity_score"]
    X = df[features]
    y = df["actual_wait_minutes"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"Validation MAE: {mae:.2f} minutes")

    os.makedirs("model", exist_ok=True)
    joblib.dump(model, "model/wait_time_model.pkl")
    print("Model saved to model/wait_time_model.pkl")

if __name__ == "__main__":
    train()

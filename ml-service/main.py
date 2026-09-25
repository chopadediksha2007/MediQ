"""
main.py
FastAPI microservice exposing the ML predictions to the Spring Boot backend.

Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os
import numpy as np

app = FastAPI(title="Medi Q — ML Service")

MODEL_PATH = "model/wait_time_model.pkl"
model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

SEVERITY_MAP = {"LOW": 1, "MEDIUM": 10, "HIGH": 50, "CRITICAL": 100}


class WaitTimeRequest(BaseModel):
    queue_length: int
    hour_of_day: int
    day_of_week: int
    doctor_avg_consult_time: int
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL


class WaitTimeResponse(BaseModel):
    predicted_wait_minutes: float
    priority_score: float
    explanation: str


@app.get("/")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict-wait-time", response_model=WaitTimeResponse)
def predict_wait_time(req: WaitTimeRequest):
    severity_score = SEVERITY_MAP.get(req.severity.upper(), 1)

    if model is None:
        # Fallback if model hasn't been trained yet
        predicted = req.queue_length * req.doctor_avg_consult_time * 0.5
    else:
        X = np.array([[req.queue_length, req.hour_of_day, req.day_of_week,
                        req.doctor_avg_consult_time, severity_score]])
        predicted = float(model.predict(X)[0])

    # Simple explainability: describe the top factor driving the prediction
    if severity_score >= 50:
        explanation = f"Prioritized due to {req.severity.upper()} severity — moved ahead in queue."
    elif req.queue_length > 10:
        explanation = f"Longer wait mainly due to {req.queue_length} patients ahead."
    else:
        explanation = "Wait time based on current queue length and doctor's average consultation time."

    return WaitTimeResponse(
        predicted_wait_minutes=round(max(predicted, 1), 1),
        priority_score=severity_score,
        explanation=explanation
    )


class NoShowRequest(BaseModel):
    lead_time_hours: float
    past_no_shows: int
    total_past_appointments: int


class NoShowResponse(BaseModel):
    no_show_probability: float


@app.post("/predict-no-show", response_model=NoShowResponse)
def predict_no_show(req: NoShowRequest):
    # Simple heuristic placeholder — replace with a trained classifier (see step 11 in the roadmap)
    history_rate = (req.past_no_shows / req.total_past_appointments) if req.total_past_appointments > 0 else 0.1
    lead_time_factor = min(req.lead_time_hours / 72, 1.0) * 0.3
    probability = min(history_rate * 0.7 + lead_time_factor, 0.95)
    return NoShowResponse(no_show_probability=round(probability, 2))

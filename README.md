# Medi Q — AI Smart Hospital Queue Management

A working starter scaffold: patient registration, appointment booking,
emergency-priority queue, live dashboard (WebSocket), and an ML microservice
for wait-time prediction and no-show prediction.

## Project Structure
```
medi-q/
├── database/
│   └── schema.sql              # PostgreSQL tables + seed data
├── backend/                    # Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/mediq/
│       ├── MediQApplication.java
│       ├── entity/              # Patient, Doctor, Department, Appointment, QueueEntry
│       ├── repository/          # Spring Data JPA repositories
│       ├── controller/          # REST APIs (PatientController, AppointmentController)
│       ├── service/             # QueueService — priority scoring + WebSocket broadcast
│       └── config/              # WebSocketConfig
├── ml-service/                  # Python FastAPI
│   ├── requirements.txt
│   ├── main.py                  # /predict-wait-time and /predict-no-show endpoints
│   └── model/
│       └── train_wait_time_model.py
├── frontend/                    # React
│   ├── package.json
│   └── src/
│       ├── api/api.js
│       ├── components/QueueDashboard.js
│       └── App.js
└── docker-compose.yml
```

## How to Run (Step by Step)

### 1. Database
```bash
psql -U postgres -c "CREATE DATABASE mediq_db;"
psql -U postgres -d mediq_db -f database/schema.sql
```

### 2. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python model/train_wait_time_model.py   # trains and saves the model
uvicorn main:app --reload --port 8000
```
Test it: http://localhost:8000/docs

### 3. Backend
```bash
cd backend
# Update src/main/resources/application.properties with your DB credentials if not using Docker
mvn spring-boot:run
```
Runs on http://localhost:8080

### 4. Frontend
```bash
cd frontend
npm install
npm start
```
Runs on http://localhost:3000

### 5. Or run everything with Docker
```bash
docker-compose up --build
```

## Testing the Flow
1. Register a patient: `POST http://localhost:8080/api/patients`
   ```json
   { "name": "Ravi Kumar", "contact": "9999999999", "age": 34, "gender": "M" }
   ```
2. Book an appointment: `POST http://localhost:8080/api/appointments`
   ```json
   { "patient": {"id": 1}, "doctor": {"id": 1}, "scheduledTime": "2026-08-08T10:00:00" }
   ```
3. Check the patient in (adds to live queue): `POST http://localhost:8080/api/appointments/1/check-in`
   ```json
   { "severity": "HIGH" }
   ```
4. Open the frontend at http://localhost:3000 — the patient appears in the live queue instantly.
5. Check in another patient with `"severity": "CRITICAL"` — watch them jump to the top of the queue in real time.

## What's Included vs. Not Yet
**Included (working code):** registration, booking, check-in, priority queue, live WebSocket dashboard, wait-time ML model, no-show prediction endpoint (heuristic placeholder).

**Not yet built:** authentication/roles, notifications (SMS/email), admin analytics charts, anomaly detection, explainability UI in the frontend. These plug into the same structure — new controllers/services on the backend, new components on the frontend.

## What Makes Medi Q Stand Out
- **Explainable prioritization** — every queue position comes with a plain-language reason, not just a number
- **Two ML models working together** — wait-time regression + no-show classification
- **Real-time re-prioritization** — the whole queue re-sorts instantly and broadcasts to every connected screen the moment an emergency case checks in

## Suggested Next Steps
1. Add Spring Security + JWT for role-based login
2. Connect `predictedWaitMinutes` on the Appointment entity to actually call the ML service on check-in
3. Build the admin analytics page (charts using recharts or Chart.js)
4. Add SMS/email notifications when a patient nears the front of the queue
5. Replace the no-show heuristic with a trained classifier once you have real appointment history

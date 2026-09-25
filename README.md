# MediQ — AI Smart Hospital Queue Management

A working starter scaffold for an AI-powered hospital queue management system featuring patient registration, appointment booking, emergency-priority queue management, a live dashboard using WebSocket, and an ML microservice for wait-time prediction and no-show prediction.

## Project Structure

```text
medi-q/
├── database/
│   └── schema.sql                  # PostgreSQL tables + seed data
├── backend/                        # Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/mediq/
│       ├── MediQApplication.java
│       ├── entity/                 # Patient, Doctor, Department, Appointment, QueueEntry
│       ├── repository/             # Spring Data JPA repositories
│       ├── controller/             # REST APIs
│       ├── service/                # QueueService — priority scoring + WebSocket broadcast
│       └── config/                 # WebSocketConfig
├── ml-service/                     # Python FastAPI
│   ├── requirements.txt
│   ├── main.py                     # /predict-wait-time and /predict-no-show endpoints
│   └── model/
│       └── train_wait_time_model.py
├── frontend/                       # React
│   ├── package.json
│   └── src/
│       ├── api/api.js
│       ├── components/QueueDashboard.js
│       └── App.js
└── docker-compose.yml
```

## How to Run

### 1. Database

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE mediq_db;"
```

Then run the database schema:

```bash
psql -U postgres -d mediq_db -f database/schema.sql
```

### 2. ML Service

Navigate to the ML service:

```bash
cd ml-service
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Train the wait-time model:

```bash
python model/train_wait_time_model.py
```

Start the FastAPI service:

```bash
uvicorn main:app --reload --port 8000
```

Test the API documentation at:

```text
http://localhost:8000/docs
```

### 3. Backend

Navigate to the backend:

```bash
cd backend
```

Update:

```text
src/main/resources/application.properties
```

with your PostgreSQL database credentials if you are not using Docker.

Then start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

### 4. Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend runs on:

```text
http://localhost:3000
```

### 5. Run Everything with Docker

If Docker is configured:

```bash
docker-compose up --build
```

## Testing the Flow

### 1. Register a Patient

Send a POST request to:

```text
http://localhost:8080/api/patients
```

Example:

```json
{
  "name": "Ravi Kumar",
  "contact": "9999999999",
  "age": 34,
  "gender": "M"
}
```

### 2. Book an Appointment

Send a POST request to:

```text
http://localhost:8080/api/appointments
```

Example:

```json
{
  "patient": {
    "id": 1
  },
  "doctor": {
    "id": 1
  },
  "scheduledTime": "2026-08-08T10:00:00"
}
```

### 3. Check In the Patient

Send a POST request to:

```text
http://localhost:8080/api/appointments/1/check-in
```

Example:

```json
{
  "severity": "HIGH"
}
```

The patient is then added to the live queue.

### 4. Open the Frontend

Open:

```text
http://localhost:3000
```

The patient should appear in the live queue.

### 5. Test Priority Queue

Check in another patient with:

```json
{
  "severity": "CRITICAL"
}
```

The critical patient should move to the top of the queue in real time.

## What's Included vs. Not Yet

### Included

* Patient registration
* Appointment booking
* Patient check-in
* Emergency-priority queue
* Live WebSocket dashboard
* Wait-time ML model
* No-show prediction endpoint
* Real-time queue updates

### Not Yet Built

* Authentication and role-based access
* SMS/email notifications
* Admin analytics charts
* Anomaly detection
* Explainability UI in the frontend

These features can be added using the existing project structure through additional controllers, services, and frontend components.

## What Makes MediQ Stand Out

### Explainable Prioritization

Every queue position can be associated with a plain-language reason rather than relying only on a numerical score.

### Two ML Models Working Together

The system includes:

* Wait-time regression
* No-show classification/prediction

### Real-Time Re-Prioritization

The queue can be re-sorted instantly when an emergency case checks in, with updates broadcast to connected screens through WebSocket.

## Suggested Next Steps

1. Add Spring Security + JWT for role-based login.
2. Connect `predictedWaitMinutes` on the Appointment entity to the ML service during check-in.
3. Build the admin analytics page using Recharts or Chart.js.
4. Add SMS/email notifications when a patient approaches the front of the queue.
5. Replace the no-show heuristic with a trained classifier once sufficient appointment history is available.

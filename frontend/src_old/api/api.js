import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const api = axios.create({ baseURL: API_BASE });

// Patients
export const registerPatient = (patient) => api.post("/patients", patient);
export const getPatients = () => api.get("/patients");

// Appointments
export const bookAppointment = (appointment) => api.post("/appointments", appointment);
export const checkInPatient = (appointmentId, severity) =>
  api.post(`/appointments/${appointmentId}/check-in`, { severity });
export const getLiveQueue = () => api.get("/appointments/queue/live");

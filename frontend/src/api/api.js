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
export const getAllAppointments = () => api.get("/appointments");
export const getAppointmentsForDoctor = (doctorId) => api.get(`/appointments/doctor/${doctorId}`);
export const getAppointmentsForPatient = (patientId) => api.get(`/appointments/patient/${patientId}`);
export const getWaitLogsForPatient = (patientId) => api.get(`/appointments/patient/${patientId}/wait-logs`);
export const getWaitLogsForDoctor = (doctorId) => api.get(`/appointments/doctor/${doctorId}/wait-logs`);
export const getAllWaitLogs = () => api.get("/appointments/wait-logs/all");
export const getDoctors = () => api.get("/doctors");
export const getDepartments = () => api.get("/departments");
export const startConsultation = (appointmentId) => api.post(`/appointments/${appointmentId}/start`);
export const completeConsultation = (appointmentId) => api.post(`/appointments/${appointmentId}/complete`);

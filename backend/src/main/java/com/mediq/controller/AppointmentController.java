package com.mediq.controller;

import com.mediq.entity.Appointment;
import com.mediq.entity.QueueEntry;
import com.mediq.repository.AppointmentRepository;
import com.mediq.repository.WaitTimeLogRepository;
import com.mediq.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private WaitTimeLogRepository waitTimeLogRepository;

    @Autowired
    private QueueService queueService;

    // Book a new appointment
    @PostMapping
    public Appointment bookAppointment(@RequestBody Appointment appointment) {
        appointment.setStatus("SCHEDULED");
        return appointmentRepository.save(appointment);
    }

    // Check a patient in -> adds them to the live queue.
    // Body example: { "severity": "HIGH" }
    @PostMapping("/{id}/check-in")
    public QueueEntry checkIn(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow();
        appointment.setStatus("WAITING");
        appointmentRepository.save(appointment);
        return queueService.addToQueue(appointment, body.get("severity"));
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Appointments for a specific doctor — used by the Doctor Dashboard
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsForDoctor(@PathVariable Long doctorId) {
        return appointmentRepository.findByDoctor_Id(doctorId);
    }

    // Appointments for a specific patient — used by the Patient History page
    @GetMapping("/patient/{patientId}")
    public List<Appointment> getAppointmentsForPatient(@PathVariable Long patientId) {
        return appointmentRepository.findByPatient_Id(patientId);
    }

    // Actual vs predicted wait-time logs for a patient — the real dataset
    // your ML model would eventually retrain on (see wait_time_logs table)
    @GetMapping("/patient/{patientId}/wait-logs")
    public Object getWaitLogsForPatient(@PathVariable Long patientId) {
        return waitTimeLogRepository.findByAppointment_Patient_Id(patientId);
    }

    // Same, scoped to a doctor — used by the Doctor Analytics page
    @GetMapping("/doctor/{doctorId}/wait-logs")
    public Object getWaitLogsForDoctor(@PathVariable Long doctorId) {
        return waitTimeLogRepository.findByAppointment_Doctor_Id(doctorId);
    }

    // ALL wait logs hospital-wide — used by the Admin AI Analytics page
    @GetMapping("/wait-logs/all")
    public Object getAllWaitLogs() {
        return waitTimeLogRepository.findAll();
    }

    @GetMapping("/queue/live")
    public List<QueueEntry> getLiveQueue() {
        return queueService.getLiveQueue();
    }

    // Doctor clicks "Start Consultation" — marks patient as being seen right now
    @PostMapping("/{id}/start")
    public void startConsultation(@PathVariable Long id) {
        queueService.startConsultation(id);
    }

    // Doctor clicks "Complete" — finishes the visit and removes them from the live queue
    @PostMapping("/{id}/complete")
    public void completeConsultation(@PathVariable Long id) {
        queueService.completeConsultation(id);
    }
}

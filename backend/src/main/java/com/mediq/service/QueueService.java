package com.mediq.service;

import com.mediq.entity.Appointment;
import com.mediq.entity.QueueEntry;
import com.mediq.entity.WaitTimeLog;
import com.mediq.repository.AppointmentRepository;
import com.mediq.repository.QueueEntryRepository;
import com.mediq.repository.WaitTimeLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QueueService {

    @Autowired
    private QueueEntryRepository queueEntryRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private WaitTimeLogRepository waitTimeLogRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RestTemplate restTemplate;

    private static final String ML_SERVICE_URL = "http://localhost:8000/predict-wait-time";

    // Severity levels mapped to a base priority score.
    // Higher score = seen sooner. Emergency cases jump the queue.
    private double severityToScore(String severity) {
        if (severity == null) return 1.0;
        switch (severity.toUpperCase()) {
            case "CRITICAL": return 100.0;
            case "HIGH": return 50.0;
            case "MEDIUM": return 10.0;
            default: return 1.0; // LOW
        }
    }

    // Calls the real ML microservice (see ml-service/main.py) to get a predicted
    // wait time. Falls back silently (leaves predictedWaitMinutes null) if the
    // ML service isn't running — check-in should never fail because of this.
    private Integer callMlPrediction(Appointment appointment, String severity) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("queue_length", (int) queueEntryRepository.count());
            request.put("hour_of_day", LocalDateTime.now().getHour());
            request.put("day_of_week", LocalDateTime.now().getDayOfWeek().getValue() % 7);
            int avgConsult = appointment.getDoctor() != null && appointment.getDoctor().getAvgConsultationTime() != null
                ? appointment.getDoctor().getAvgConsultationTime() : 15;
            request.put("doctor_avg_consult_time", avgConsult);
            request.put("severity", severity != null ? severity.toUpperCase() : "LOW");

            Map response = restTemplate.postForObject(ML_SERVICE_URL, request, Map.class);
            if (response != null && response.get("predicted_wait_minutes") != null) {
                return (int) Math.round(((Number) response.get("predicted_wait_minutes")).doubleValue());
            }
        } catch (Exception e) {
            // ML service unreachable — that's fine, we just skip the prediction this time.
        }
        return null;
    }

    // Add a patient's appointment to the live queue with a priority score
    @Transactional
    public QueueEntry addToQueue(Appointment appointment, String severity) {
        Integer predictedWait = callMlPrediction(appointment, severity);
        if (predictedWait != null) {
            appointment.setPredictedWaitMinutes(predictedWait);
            appointmentRepository.save(appointment);
        }

        QueueEntry entry = new QueueEntry();
        entry.setAppointment(appointment);
        entry.setPriorityScore(severityToScore(severity));
        QueueEntry saved = queueEntryRepository.save(entry);
        broadcastQueueUpdate();
        return saved;
    }

    // Returns the live queue ordered by priority (critical first), then by who arrived earliest
    public List<QueueEntry> getLiveQueue() {
        return queueEntryRepository.findAllByOrderByPriorityScoreDescEntryTimeAsc();
    }

    // Doctor starts seeing this patient — marks them IN_PROGRESS but keeps them
    // visible in the queue (with a "Consulting" status) until completed.
    @Transactional
    public void startConsultation(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow();
        appointment.setStatus("IN_PROGRESS");
        appointmentRepository.save(appointment);
        broadcastQueueUpdate();
    }

    // Doctor finishes the consultation — logs the real wait time (this is the
    // real-world data your wait-time ML model would eventually retrain on),
    // then removes them from the live queue entirely.
    @Transactional
    public void completeConsultation(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow();

        QueueEntry entry = queueEntryRepository.findByAppointment_Id(appointmentId).orElse(null);
        if (entry != null) {
            long actualMinutes = Duration.between(entry.getEntryTime(), LocalDateTime.now()).toMinutes();
            WaitTimeLog log = new WaitTimeLog();
            log.setAppointment(appointment);
            log.setPredictedWaitMinutes(appointment.getPredictedWaitMinutes());
            log.setActualWaitMinutes((int) Math.max(actualMinutes, 0));
            waitTimeLogRepository.save(log);
        }

        appointment.setStatus("DONE");
        appointmentRepository.save(appointment);
        queueEntryRepository.deleteByAppointment_Id(appointmentId);
        broadcastQueueUpdate();
    }

    // Push the latest queue state to all connected clients (staff dashboard + patient view)
    private void broadcastQueueUpdate() {
        messagingTemplate.convertAndSend("/topic/queue-updates", getLiveQueue());
    }
}

package com.mediq.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wait_time_logs")
public class WaitTimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    private Integer predictedWaitMinutes;
    private Integer actualWaitMinutes;

    public WaitTimeLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }

    public Integer getPredictedWaitMinutes() { return predictedWaitMinutes; }
    public void setPredictedWaitMinutes(Integer predictedWaitMinutes) { this.predictedWaitMinutes = predictedWaitMinutes; }

    public Integer getActualWaitMinutes() { return actualWaitMinutes; }
    public void setActualWaitMinutes(Integer actualWaitMinutes) { this.actualWaitMinutes = actualWaitMinutes; }
}

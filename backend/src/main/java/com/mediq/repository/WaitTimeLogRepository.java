package com.mediq.repository;

import com.mediq.entity.WaitTimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WaitTimeLogRepository extends JpaRepository<WaitTimeLog, Long> {
    List<WaitTimeLog> findByAppointment_Patient_Id(Long patientId);
    List<WaitTimeLog> findByAppointment_Doctor_Id(Long doctorId);
}

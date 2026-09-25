package com.mediq.repository;

import com.mediq.entity.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    List<QueueEntry> findAllByOrderByPriorityScoreDescEntryTimeAsc();
    Optional<QueueEntry> findByAppointment_Id(Long appointmentId);
    void deleteByAppointment_Id(Long appointmentId);
}

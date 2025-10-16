package com.tanmay.taskmanager.repositories;


import com.tanmay.taskmanager.models.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("SELECT t FROM Task t WHERE lower(t.title) LIKE lower(concat('%', :q, '%')) OR lower(t.description) LIKE lower(concat('%', :q, '%'))")
    Page<Task> search(@Param("q") String q, Pageable pageable);
}

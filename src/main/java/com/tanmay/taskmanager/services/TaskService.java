package com.tanmay.taskmanager.services;


import com.tanmay.taskmanager.models.Task;
import com.tanmay.taskmanager.models.AuditLog;
import com.tanmay.taskmanager.repositories.TaskRepository;
import com.tanmay.taskmanager.repositories.AuditLogRepository;
import com.tanmay.taskmanager.utils.Sanitizer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;


    @Autowired
    private ObjectMapper mapper;

    public Page<Task> list(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (q == null || q.isBlank()) return taskRepository.findAll(pageable);
        return taskRepository.search(q.trim(), pageable);
    }

    // Create a new task
    public Task create(Task t) {
        // Sanitize input
        t.setTitle(Sanitizer.sanitize(t.getTitle()));
        t.setDescription(Sanitizer.sanitize(t.getDescription()));

        Task saved = taskRepository.save(t);

        // Create audit log for creation
        try {
            // This now uses the ObjectMapper configured to handle Instant dates
            String json = mapper.writeValueAsString(saved);
            AuditLog log = new AuditLog();
            // --- FIX: Using a simple, explicit action phrase guaranteed to contain 'create' ---
            log.setAction("Task Created");
            log.setTaskId(saved.getId());
            log.setUpdatedContent(json);
            auditLogRepository.save(log);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return saved;
    }

    // Update existing task
    public Optional<Task> update(Long id, Task updated) {
        return taskRepository.findById(id).map(existing -> {
            Map<String, String> changes = new HashMap<>();

            if (updated.getTitle() != null && !updated.getTitle().isBlank() &&
                    !updated.getTitle().equals(existing.getTitle())) {
                String val = Sanitizer.sanitize(updated.getTitle());
                changes.put("title", val);
                existing.setTitle(val);
            }

            if (updated.getDescription() != null && !updated.getDescription().isBlank() &&
                    !updated.getDescription().equals(existing.getDescription())) {
                String val = Sanitizer.sanitize(updated.getDescription());
                changes.put("description", val);
                existing.setDescription(val);
            }

            Task saved = taskRepository.save(existing);

            // Only create audit log if something changed
            if (!changes.isEmpty()) {
                try {
                    String json = mapper.writeValueAsString(changes);
                    AuditLog log = new AuditLog();
                    log.setAction("Update Task");
                    log.setTaskId(saved.getId());
                    log.setUpdatedContent(json);
                    auditLogRepository.save(log);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            return saved;
        });
    }

    // Delete task
    public boolean delete(Long id) {
        return taskRepository.findById(id).map(t -> {
            taskRepository.delete(t);

            // Create audit log for deletion
            AuditLog log = new AuditLog();
            log.setAction("Delete Task");
            log.setTaskId(id);
            log.setUpdatedContent(null);
            auditLogRepository.save(log);

            return true;
        }).orElse(false);
    }
}

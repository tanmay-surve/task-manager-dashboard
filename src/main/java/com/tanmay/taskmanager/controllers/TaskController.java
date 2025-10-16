package com.tanmay.taskmanager.controllers;


import com.tanmay.taskmanager.models.Task;
import com.tanmay.taskmanager.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<Page<Task>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(taskService.list(q, page, size));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Task task) {
        if (task.getTitle() == null || task.getTitle().isBlank() ||
                task.getDescription() == null || task.getDescription().isBlank()) {
            return ResponseEntity.badRequest().body("{\"error\":\"Title and Description required\"}");
        }
        if (task.getTitle().length() > 100 || task.getDescription().length() > 500) {
            return ResponseEntity.badRequest().body("{\"error\":\"Title/Description too long\"}");
        }
        Task created = taskService.create(task);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Task task) {
        return taskService.update(id, task)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = taskService.delete(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.ok("{\"status\":\"deleted\"}");
    }
}

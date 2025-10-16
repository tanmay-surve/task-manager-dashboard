package com.tanmay.taskmanager.controllers;

import com.tanmay.taskmanager.models.AuditLog;
import com.tanmay.taskmanager.repositories.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort; // New Import
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
public class AuditController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public Page<AuditLog> list(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "5") int size) {


        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "timestamp")
        );

        return auditLogRepository.findAll(pageable);
    }
}

package com.example.fastfingerspro.controller;

import com.example.fastfingerspro.model.Score;
import com.example.fastfingerspro.repository.ScoreRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin("*")
public class ScoreController {

    private final ScoreRepository repo;

    public ScoreController(ScoreRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/top")
    public List<Score> getTop() {
        return repo.findTop20ByOrderByWpmDesc();
    }

    @PostMapping
    public Score save(@RequestBody Score s) {
        return repo.save(s);
    }
}

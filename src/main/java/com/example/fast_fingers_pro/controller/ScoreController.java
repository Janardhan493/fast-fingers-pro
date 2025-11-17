package com.example.fast_fingers_pro.controller;

import com.example.fast_fingers_pro.model.Score;
import com.example.fast_fingers_pro.repository.ScoreRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class ScoreController {

    private final ScoreRepository repo;

    public ScoreController(ScoreRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/top")
    public List<Score> getTopScores() {
        return repo.findTop50ByOrderByWpmDesc();
    }

    @PostMapping
    public Score saveScore(@RequestBody Score score) {
        if (score.getName() == null || score.getName().isBlank()) {
            score.setName("Anonymous");
        }
        return repo.save(score);
    }
}

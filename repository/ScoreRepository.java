package com.example.fastfingerspro.repository;

import com.example.fastfingerspro.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findTop20ByOrderByWpmDesc();
}

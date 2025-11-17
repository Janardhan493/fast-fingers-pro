package com.example.fast_fingers_pro.repository;

import com.example.fast_fingers_pro.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findTop50ByOrderByWpmDesc();
}

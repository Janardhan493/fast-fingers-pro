package com.example.fast_fingers_pro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int wpm;
    private int accuracy;
    private int durationSeconds;
    private int totalWords;
    private LocalDateTime createdAt;

    public Score() {}

    public Score(String name, int wpm, int accuracy, int durationSeconds, int totalWords) {
        this.name = name;
        this.wpm = wpm;
        this.accuracy = accuracy;
        this.durationSeconds = durationSeconds;
        this.totalWords = totalWords;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public int getWpm() { return wpm; }
    public int getAccuracy() { return accuracy; }
    public int getDurationSeconds() { return durationSeconds; }
    public int getTotalWords() { return totalWords; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setWpm(int wpm) { this.wpm = wpm; }
    public void setAccuracy(int accuracy) { this.accuracy = accuracy; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
    public void setTotalWords(int totalWords) { this.totalWords = totalWords; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

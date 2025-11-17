// === CONFIG ===
const API_BASE = ""; // same origin (http://localhost:9091)
const PAGE_SIZE = 10;

// === STATE ===
let testDuration = 15;
let timeLeft = 15;
let timerId = null;
let isRunning = false;
let words = [];
let currentIndex = 0;
let correctChars = 0;
let totalChars = 0;
let typedWords = 0;

let leaderboardRaw = [];
let currentFilter = "all";
let currentPage = 1;

let historyData = [];
let historyChart = null;

// === DOM ===
const nameInput = document.getElementById("nameInput");
const loginBtn = document.getElementById("loginBtn");
const currentUserSpan = document.getElementById("currentUser");

const durationButtons = document.getElementById("durationButtons");
const timeDisplay = document.getElementById("timeDisplay");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const typingInput = document.getElementById("typingInput");
const wordsDisplay = document.getElementById("wordsDisplay");

const currentWpmSpan = document.getElementById("currentWpm");
const currentAccuracySpan = document.getElementById("currentAccuracy");
const currentWordsSpan = document.getElementById("currentWords");

const finalWpmSpan = document.getElementById("finalWpm");
const finalAccuracySpan = document.getElementById("finalAccuracy");
const finalDurationSpan = document.getElementById("finalDuration");
const finalWordsSpan = document.getElementById("finalWords");
const finalStatusSpan = document.getElementById("finalStatus");

const filterButtons = document.querySelectorAll(".chip--filter");
const leaderboardBody = document.getElementById("leaderboardBody");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfoSpan = document.getElementById("pageInfo");

const historyCanvas = document.getElementById("historyChart");

// === Utility ===
function getCurrentUserName() {
    const stored = localStorage.getItem("ffpUserName");
    return stored || "Guest";
}

function setCurrentUserName(name) {
    const trimmed = name.trim() || "Guest";
    localStorage.setItem("ffpUserName", trimmed);
    currentUserSpan.textContent = trimmed;
    nameInput.value = trimmed === "Guest" ? "" : trimmed;
}

function randomWords(count = 60) {
    const base = [
        "code", "java", "spring", "backend", "frontend", "typing",
        "keyboard", "api", "render", "deploy", "react", "skill",
        "focus", "dream", "career", "effort", "debug", "commit",
        "logic", "brain", "challenge", "practice", "speed", "accuracy",
        "persistence", "design", "system", "object", "class", "method",
        "thread", "future", "impact", "create", "build", "connect",
        "learn", "grow", "ship", "product", "testing", "review",
        "resume", "project", "hire", "startup", "vision"
    ];
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(base[Math.floor(Math.random() * base.length)]);
    }
    return arr;
}

function formatDateRelative(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
}

// animate number change
function animateNumber(element, from, to, suffix = "") {
    const duration = 300;
    const start = performance.now();

    function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const value = Math.round(from + (to - from) * t);
        element.textContent = value + suffix;
        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

// === Typing logic ===
function resetTest() {
    isRunning = false;
    clearInterval(timerId);
    timerId = null;

    timeLeft = testDuration;
    timeDisplay.textContent = timeLeft.toString();

    words = randomWords();
    currentIndex = 0;
    correctChars = 0;
    totalChars = 0;
    typedWords = 0;

    currentWpmSpan.textContent = "0";
    currentAccuracySpan.textContent = "100%";
    currentWordsSpan.textContent = "0";

    typingInput.value = "";
    typingInput.disabled = true;

    renderWords();
    finalStatusSpan.textContent = "Ready";
    finalStatusSpan.style.background = "rgba(15, 118, 110, 0.24)";
    finalStatusSpan.style.color = "#a7f3d0";
}

function renderWords() {
    wordsDisplay.innerHTML = "";
    words.forEach((w, idx) => {
        const span = document.createElement("span");
        span.textContent = w + " ";
        span.classList.add("word");
        if (idx === currentIndex) span.classList.add("word--current");
        wordsDisplay.appendChild(span);
    });
}

function startTest() {
    if (isRunning) return;
    isRunning = true;

    typingInput.disabled = false;
    typingInput.focus();
    timeLeft = testDuration;
    timeDisplay.textContent = timeLeft.toString();

    timerId = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            timeLeft = 0;
            timeDisplay.textContent = "0";
            clearInterval(timerId);
            timerId = null;
            finishTest();
        } else {
            timeDisplay.textContent = timeLeft.toString();
        }
    }, 1000);
}

function handleInput(e) {
    if (!isRunning) return;

    const val = e.target.value;
    const currentWord = words[currentIndex] || "";
    const lastChar = val[val.length - 1];

    // if space -> check correctness and move to next word
    if (lastChar === " ") {
        const trimmed = val.trim();
        totalChars += trimmed.length;
        if (trimmed === currentWord) {
            correctChars += trimmed.length;
            markWordState(currentIndex, true);
        } else {
            markWordState(currentIndex, false);
        }
        typedWords++;
        currentIndex++;
        e.target.value = "";
        updateLiveStats();
        updateCurrentHighlight();
        return;
    }

    // partial typing: update accuracy estimation
    totalChars++;
    const correctSoFar = [...val.trim()].filter((ch, i) => ch === currentWord[i]).length;
    correctChars += correctSoFar ? 0 : 0; // keep simple for live
    updateLiveStats();
    updateCurrentHighlight();
}

function markWordState(index, isCorrect) {
    const spans = wordsDisplay.querySelectorAll(".word");
    if (!spans[index]) return;
    spans[index].classList.remove("word--current");
    spans[index].classList.add(isCorrect ? "word--correct" : "word--wrong");
}

function updateCurrentHighlight() {
    const spans = wordsDisplay.querySelectorAll(".word");
    spans.forEach((span, idx) => {
        span.classList.toggle("word--current", idx === currentIndex);
    });
}

function calcWpm(correctCharacters, elapsedSeconds) {
    if (elapsedSeconds <= 0) return 0;
    const words = correctCharacters / 5;
    return Math.round((words * 60) / elapsedSeconds);
}

function calcAccuracy() {
    if (totalChars === 0) return 100;
    return Math.max(0, Math.round((correctChars / totalChars) * 100));
}

function updateLiveStats() {
    const elapsed = testDuration - timeLeft;
    const wpm = calcWpm(correctChars, elapsed || 1);
    const acc = calcAccuracy();

    currentWpmSpan.textContent = wpm.toString();
    currentAccuracySpan.textContent = acc + "%";
    currentWordsSpan.textContent = typedWords.toString();
}

async function finishTest() {
    isRunning = false;
    typingInput.disabled = true;

    const elapsed = testDuration;
    const wpm = calcWpm(correctChars, elapsed || 1);
    const accuracy = calcAccuracy();

    animateNumber(finalWpmSpan, Number(finalWpmSpan.textContent || 0), wpm);
    animateNumber(
        finalAccuracySpan,
        parseInt((finalAccuracySpan.textContent || "100").replace("%", ""), 10) || 0,
        accuracy,
        "%"
    );
    finalDurationSpan.textContent = testDuration + "s";
    finalWordsSpan.textContent = typedWords.toString();

    finalStatusSpan.textContent = "Saved to leaderboard";
    finalStatusSpan.style.background = "rgba(15, 118, 110, 0.24)";
    finalStatusSpan.style.color = "#a7f3d0";

    // glow animation
    finalWpmSpan.classList.add("glow");
    finalAccuracySpan.classList.add("glow");
    setTimeout(() => {
        finalWpmSpan.classList.remove("glow");
        finalAccuracySpan.classList.remove("glow");
    }, 350);

    const result = {
        name: getCurrentUserName(),
        wpm,
        accuracy,
        durationSeconds: testDuration,
        totalWords: typedWords
    };

    saveToHistory(result);
    updateHistoryChart();
    await saveScoreToBackend(result);
    await loadLeaderboard();
}

// === History & Chart ===

function loadHistoryFromStorage() {
    try {
        const raw = localStorage.getItem("ffpHistory");
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveToHistory(entry) {
    historyData.unshift({
        ...entry,
        createdAt: new Date().toISOString()
    });
    historyData = historyData.slice(0, 20);
    localStorage.setItem("ffpHistory", JSON.stringify(historyData));
}

function initHistoryChart() {
    const ctx = historyCanvas.getContext("2d");
    historyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: historyData.map((e, idx) => `#${historyData.length - idx}`),
            datasets: [
                {
                    label: "WPM",
                    data: historyData.map(e => e.wpm),
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: "#9ca3af", font: { size: 10 } }
                },
                y: {
                    ticks: { color: "#9ca3af", font: { size: 10 } },
                    beginAtZero: true
                }
            }
        }
    });
}

function updateHistoryChart() {
    if (!historyChart) return;
    historyChart.data.labels = historyData.map((e, idx) => `#${historyData.length - idx}`);
    historyChart.data.datasets[0].data = historyData.map(e => e.wpm);
    historyChart.update();
}

// === Leaderboard ===

async function loadLeaderboard() {
    try {
        const res = await fetch(`${API_BASE}/api/scores/top`);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        leaderboardRaw = Array.isArray(data) ? data : [];
        currentPage = 1;
        renderLeaderboard();
    } catch (err) {
        console.error(err);
        leaderboardBody.innerHTML = `
            <tr><td colspan="7" class="empty-message">
                Unable to load leaderboard. Is backend running on port 9091?
            </td></tr>
        `;
    }
}

function filterByDate(list) {
    if (currentFilter === "all") return list;

    const now = new Date();
    if (currentFilter === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return list.filter(s => {
            const d = new Date(s.createdAt);
            return d >= start;
        });
    }
    if (currentFilter === "week") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return list.filter(s => new Date(s.createdAt) >= sevenDaysAgo);
    }
    return list;
}

function renderLeaderboard() {
    const filtered = filterByDate(leaderboardRaw);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

    if (pageItems.length === 0) {
        leaderboardBody.innerHTML = `
            <tr><td colspan="7" class="empty-message">
                No scores yet. Be the first!
            </td></tr>
        `;
        pageInfoSpan.textContent = `Page 1 of 1`;
        return;
    }

    leaderboardBody.innerHTML = "";
    pageItems.forEach((s, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${startIdx + idx + 1}</td>
            <td>${s.name || "Anonymous"}</td>
            <td>${s.wpm}</td>
            <td>${s.accuracy}%</td>
            <td>${s.durationSeconds}s</td>
            <td>${s.totalWords}</td>
            <td>${formatDateRelative(s.createdAt)}</td>
        `;
        leaderboardBody.appendChild(tr);
    });

    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
}

async function saveScoreToBackend(result) {
    try {
        await fetch(`${API_BASE}/api/scores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result)
        });
    } catch (err) {
        console.error("Failed to save score:", err);
        finalStatusSpan.textContent = "Saved locally. Backend error.";
        finalStatusSpan.style.background = "rgba(248,113,113,0.25)";
        finalStatusSpan.style.color = "#fecaca";
    }
}

// === Events ===

durationButtons.addEventListener("click", (e) => {
    if (!(e.target instanceof HTMLButtonElement)) return;
    const btn = e.target;
    const sec = Number(btn.dataset.seconds || "60");
    testDuration = sec;
    timeLeft = sec;
    timeDisplay.textContent = sec.toString();
    durationButtons.querySelectorAll(".pill").forEach(p => p.classList.remove("pill--active"));
    btn.classList.add("pill--active");
    resetTest();
});

startBtn.addEventListener("click", () => {
    // Save whatever is in the name box as current user
    if (nameInput.value.trim().length > 0) {
        setCurrentUserName(nameInput.value);
    }
    resetTest();
    startTest();
});


resetBtn.addEventListener("click", () => {
    resetTest();
});

typingInput.addEventListener("input", handleInput);

loginBtn.addEventListener("click", () => {
    setCurrentUserName(nameInput.value);
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("chip--active"));
        btn.classList.add("chip--active");
        currentFilter = btn.dataset.filter || "all";
        currentPage = 1;
        renderLeaderboard();
    });
});

prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderLeaderboard();
    }
});

nextPageBtn.addEventListener("click", () => {
    const filtered = filterByDate(leaderboardRaw);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage < totalPages) {
        currentPage++;
        renderLeaderboard();
    }
});

// === Init ===
document.addEventListener("DOMContentLoaded", async () => {
    setCurrentUserName(getCurrentUserName());
    resetTest();

    historyData = loadHistoryFromStorage();
    initHistoryChart();
    updateHistoryChart();

    await loadLeaderboard();
});

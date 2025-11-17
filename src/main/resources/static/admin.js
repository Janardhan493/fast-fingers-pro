const API_BASE = "";

const adminBody = document.getElementById("adminLeaderboardBody");

function formatDateRelative(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
}

async function loadAdminLeaderboard() {
    try {
        const res = await fetch(`${API_BASE}/api/scores/top`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        if (!list.length) {
            adminBody.innerHTML = `<tr><td colspan="7" class="empty-message">No data yet.</td></tr>`;
            return;
        }

        adminBody.innerHTML = "";
        list.forEach((s, idx) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${s.name || "Anonymous"}</td>
                <td>${s.wpm}</td>
                <td>${s.accuracy}%</td>
                <td>${s.durationSeconds}s</td>
                <td>${s.totalWords}</td>
                <td>${formatDateRelative(s.createdAt)}</td>
            `;
            adminBody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        adminBody.innerHTML = `<tr><td colspan="7" class="empty-message">Error loading scores.</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", loadAdminLeaderboard);

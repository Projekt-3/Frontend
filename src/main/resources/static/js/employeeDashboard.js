import { loadCSS, loadHeader, setGreeting, logOut } from "./general.js";

export async function initEmployeeDashboard() {
    // Load CSS
    loadCSS('/css/modal.css');
    loadCSS('/css/dashboard.css');
    loadCSS('/css/fragment.css');

    await loadHeader();
    setGreeting();
    logOut();

    // Hent employeeId fra sessionStorage
    const employeeId = sessionStorage.getItem("employeeId");
    if (!employeeId) {
        alert("Ingen medarbejder ID fundet. Log ind igen.");
        return;
    }

    // Indlæs vagter
    loadMyShifts(employeeId);
}

// Funktion: hent og vis medarbejderens vagter
async function loadMyShifts(employeeId) {
    const token = sessionStorage.getItem("token");

    const res = await fetch(`http://localhost:8080/dashboard/employee/${employeeId}/shifts`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        alert("Kunne ikke hente dine vagter");
        return;
    }

    const shifts = await res.json();
    const container = document.getElementById("my-shifts-container");
    container.innerHTML = "";

    shifts.forEach(es => {
        const div = document.createElement("div");
        div.className = "shift";

        // Kombiner date + plannedStart til en JS Date, hvis date findes
        let shiftDateTime = "Uden dato";
        if (es.shift.date && es.shift.plannedStart) {
            shiftDateTime = new Date(`${es.shift.date}T${es.shift.plannedStart}`).toLocaleString();
        }

        div.innerHTML = `
        <p>${es.shift.showTitle || "Uden show"} - ${shiftDateTime}</p>
        <button onclick="toggleCheckIn(${es.id}, ${es.checkInStatus})">
            ${es.checkInStatus ? "Check Ud" : "Check Ind"}
        </button>
    `;
        container.appendChild(div);
    });
}

// Funktion: toggle check-in status
async function toggleCheckIn(employeeShiftId, currentStatus) {
    const token = sessionStorage.getItem("token");

    const res = await fetch(
        `http://localhost:8080/dashboard/employee-shift/${employeeShiftId}/checkin?status=${!currentStatus}`,
        {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        alert("Fejl ved opdatering af check-in status");
        return;
    }
    // Vis alert afhængigt af status
    if (!currentStatus) {
        alert("Du er nu checket ind!");
    } else {
        alert("Du er nu checket ud!");
    }

    // Genindlæs vagter for at opdatere knapper
    loadMyShifts(sessionStorage.getItem("employeeId"));
}

// Gør toggleCheckIn tilgængelig globalt, så HTML onclick fungerer
window.toggleCheckIn = toggleCheckIn;

// Kør init ved load
document.addEventListener("DOMContentLoaded", () => initEmployeeDashboard());

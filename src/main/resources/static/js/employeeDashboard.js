import { loadCSS, loadHeader, setGreeting, logOut } from "./general.js";

export async function initEmployeeDashboard() {
    // Load CSS
    loadCSS('/css/modal.css');
    loadCSS('/css/dashboard.css');
    loadCSS('/css/fragment.css');

    await loadHeader();
    setGreeting();
    logOut();

    const employeeId = sessionStorage.getItem("employeeId");
    if (!employeeId) {
        alert("Ingen medarbejder ID fundet. Log ind igen.");
        return;
    }

    loadMyShifts(employeeId);
}

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

        let shiftDateTime = "Uden dato";
        if (es.shift.date && es.shift.plannedStart) {
            shiftDateTime = new Date(`${es.shift.date}T${es.shift.plannedStart.slice(0,5)}`).toLocaleString();
        }

        div.innerHTML = `
        <p>${es.shift.showTitle || "Uden show"} - ${shiftDateTime.slice(0,17)} - ${es.shift.plannedEnd.slice(0,5)}</p>
        <button onclick="toggleCheckIn(${es.id}, ${es.checkInStatus})">
            ${es.checkInStatus ? "Check Ud" : "Check Ind"}
        </button>
    `;
        container.appendChild(div);
    });
}


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

import {loadCSS, loadHeader, setGreeting, logOut} from "./general.js";

export async function initEmployeeDashboard() {
    loadCSS('/css/modal.css');
    loadCSS('/css/dashboard.css');
    loadCSS('/css/fragment.css');

    await loadHeader()
    setGreeting()
    setupButtons()
    logOut()
}

// ------- BUTTON SETUP ----------

function updateButtons(checkedIn) {
    document.getElementById("checkInBtn").style.display = checkedIn ? "none" : "inline-block";
    document.getElementById("checkOutBtn").style.display = checkedIn ? "inline-block" : "none";
}

function setupButtons() {
    document.getElementById("checkInBtn").addEventListener("click", checkIn);
    document.getElementById("checkOutBtn").addEventListener("click", checkOut);
}

// -------- SHOW SHIFT ----------
async function loadTodayShift(){

}

function displayShift(shift) {
    const container = document.getElementById("shiftDetail")

    container.innerHTML = `
        <p><strong>Show titel:</strong> ${shift.showTitle}</p>
        <p><strong>Starttidspunkt:</strong> ${shift.plannedStart}</p>
        <p><strong>Sluttidspunkt:</strong> ${shift.plannedEnd}</p>
    `
}


function checkIn() {
    const token = sessionStorage.getItem("token")
    const response = fetch(`http://localhost:8080/dashboard/employee/shift/${id}/check-in`, {
        method: "POST",
        headers: {"Content-Type": "application/json",   "Authorization": `Bearer ${token}`},
    })

    if (!response){
        alert("Check ind fejlede")
        return;
    }

    alert("Du er nu checket ind!")
    updateButtons(true)
}


function checkOut() {
    const token = sessionStorage.getItem("token")
    const response = fetch(`http://localhost:8080/dashboard/employee/shift/${id}/check-out`, {
        method: "POST",
        headers: {"Content-Type": "application/json",  "Authorization": `Bearer ${token}`},
    })

    if (!response){
        alert("Check ud fejlede")
        return;
    }

    alert("Du er nu checket ud!")
    updateButtons(false)
}



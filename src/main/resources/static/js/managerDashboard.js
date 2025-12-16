import {loadCSS, loadHeader, setGreeting, logOut} from "./general.js";

export async function initManagerDashboard() {
    loadCSS('./css/modal.css');
    loadCSS('./css/dashboard.css');
    loadCSS('.css/fragment.css');

    await loadHeader()
    setGreeting()
    setupModal("createEmpModal", "create-emp-modal")
    setupModal("readEmpModal", "all-emp-modal")
    setupModal("createShowModal", "create-show-modal")
    setupModal("createShiftModal", "create-shift-modal");
    setupModal("readAllShifts", "all-shifts-modal")
    setupEmpForm()
    setupEmployeeClick()
    setupShiftClick()
    setupShowForm()
    setupShiftForm()
    await loadShows()
    await loadEmployees()
    await loadShifts()
    logOut()
}

// -------- MODAL ---------
function setupModal(openBtnId, modalId) {
    const modal = document.getElementById(modalId)
    const openModalBtn = document.getElementById(openBtnId)
    const closeModalBtn = modal.querySelector(".close");

    openModalBtn.onclick = async () => {
        if (modalId === "all-emp-modal") {
            await loadEmployees();
        }
        if (modalId === "create-show-modal") {
            const token = sessionStorage.getItem("token")
            const response = await fetch("http://localhost:8080/dashboard/manager/employees", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const employees = await response.json()
            populateEmployeeSelect(employees)
        }
        if (modalId === "create-shift-modal") {
            const token = sessionStorage.getItem("token");
            const response = await fetch("http://localhost:8080/dashboard/manager/shows", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const shows = await response.json();
            showSelect(shows);
        }
        modal.style.display = "block";

        if (modalId === "all-shifts-modal") {
            await loadShifts();
        }
    }

    closeModalBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") modal.style.display = "none";
    });

}

// --------- CREATE EMP -----------
function setupEmpForm() {
    const empForm = document.getElementById("emp-form");
    const usernameInput = document.getElementById("username")
    const mailInput = document.getElementById("mail")

    usernameInput.addEventListener("input", () => {
        mailInput.value = usernameInput.value + "@lion.dk";
    })

    empForm.onsubmit = async (event) => {
        event.preventDefault();

        const phoneValue = document.getElementById("phone").value;
        if (!phoneValue || isNaN(phoneValue)) {
            alert("Må kun indholde tal");
            return;
        }

        const employee = {
            firstname: document.getElementById("firstname").value,
            lastname: document.getElementById("lastname").value,
            username: document.getElementById("username").value,
            role: document.getElementById("role").value.toUpperCase(),
            mail: document.getElementById("mail").value,
            phone: parseInt(phoneValue, 10),
            password: document.getElementById("password").value
        };

        const token = sessionStorage.getItem("token")
        const response = await fetch("http://localhost:8080/dashboard/manager/register/employee", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(employee)
        });
        const result = await response.text();
        alert(result);
        empForm.reset();
        document.getElementById("emp-modal").style.display = "none";
    };
}

// ---------- LOAD EMPLOYEES ------------
async function loadEmployees() {
    const token = sessionStorage.getItem("token")
    const response = await fetch("http://localhost:8080/dashboard/manager/employees", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })

    if (!response.ok) {
        console.error("fejl ved indhentning af medarbejdere")
        return;
    }

    const employees = await response.json()
    console.log("medarbejdere hentet", employees);
    displayEmployees(employees)

}

function displayEmployees(list) {
    const container = document.getElementById("emp-list")
    console.log("container fundet: ", container)
    container.innerHTML = ""

    list.forEach(emp => {
        const div = document.createElement("div")
        div.className = "emp"
        div.dataset.id = emp.id;
        div.textContent = `${emp.firstname} ${emp.lastname}`
        container.appendChild(div)
    })

    setupEmployeeClick();
}


// ---- LOAD SPECIFIC EMPLOYEE ----
function displayEmployeeModal(emp) {
    const modal = document.getElementById("emp-modal");
    const container = document.getElementById("emp-details");

    container.innerHTML = `
        <p><strong>Navn:</strong> ${emp.firstname} ${emp.lastname}</p>
        <p><strong>Brugernavn:</strong> ${emp.username}</p>
        <p><strong>Mail:</strong> ${emp.mail}</p>
        <p><strong>Rolle:</strong> ${emp.role}</p>
        <p><strong>Telefon:</strong> ${emp.phone}</p>
    `;

    modal.style.display = "block";

    document.getElementById("edit-emp").onclick = () => editEmp(emp)
    document.getElementById("delete-emp").onclick = () => deleteEmp(emp)
    const closeBtn = modal.querySelector(".close");
    closeBtn.onclick = () => modal.style.display = "none";
}

function setupEmployeeClick() {
    const container = document.getElementById("emp-list");

    container.addEventListener("click", async (event) => {
        const div = event.target.closest(".emp");
        if (!div) return;

        const id = div.dataset.id;
        if (!id) return;

        try {
            const token = sessionStorage.getItem("token")
            const response = await fetch(`http://localhost:8080/dashboard/manager/employees/${id}`, {
                headers: { "Authorization": `Bearer ${token}`}
            });

            if (!response.ok) {
                alert("Kunne ikke hente medarbejder info");
                return;
            }

            const emp = await response.json();
            console.log("Modtaget employee:", emp);
            displayEmployeeModal(emp);

        } catch (err) {
            console.error(err);
        }
    });
}

// ------ UPDATE EMP -------
function editEmp(emp) {
    const container = document.getElementById("emp-details");

    container.innerHTML = `
        <label>Fornavn:</label>
        <input id="edit-firstname" value="${emp.firstname}">

        <label>Efternavn:</label>
        <input id="edit-lastname" value="${emp.lastname}">
        
        <label>Brugernavn:</label>
        <input id="edit-username" value="${emp.username}">

        <label>Mail:</label>
        <input id="edit-mail" value="${emp.mail}" readonly>

        <label>Rolle:</label>
        <select id="edit-role" class="select">
            <option value="CREW" ${emp.role === "CREW" ? "selected" : ""}>Crew</option>
            <option value="CAST" ${emp.role === "CAST" ? "selected" : ""}>Cast</option>
            <option value="TECH" ${emp.role === "TECH" ? "selected" : ""}>Tech</option>
            <option value="MANAGER" ${emp.role === "MANAGER" ? "selected" : ""}>Manager</option>
        </select>

        <label>Telefon:</label>
        <input id="edit-phone" value="${emp.phone}">

        <button id="save-emp-btn">Gem ændringer</button>
    `;

    const usernameInput = document.getElementById("edit-username");
    const mailInput = document.getElementById("edit-mail");

    usernameInput.addEventListener("input", () => {
        mailInput.value = usernameInput.value + "@lion.dk";
    });

    document.getElementById("save-emp-btn").onclick = () => saveEmployee(emp.id);
}

async function saveEmployee(id) {
    const updatedEmp = {
        firstname: document.getElementById("edit-firstname").value,
        lastname: document.getElementById("edit-lastname").value,
        username: document.getElementById("edit-username").value,
        mail: document.getElementById("edit-mail").value,
        role: document.getElementById("edit-role").value.toUpperCase(),
        phone: Number(document.getElementById("edit-phone").value)
    };

    const token = sessionStorage.getItem("token")
    const response = await fetch(`http://localhost:8080/dashboard/manager/employees/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json","Authorization": `Bearer ${token}`},
        body: JSON.stringify(updatedEmp)
    });

    if (!response.ok) {
        alert("Fejl ved opdatering");
        return;
    }

    alert("Medarbejder opdateret!");
    document.getElementById("emp-modal").style.display = "none";
    await loadEmployees();
}

//---------SHOW EMPLOYEES--------------
function populateEmployeeSelect(employees) {
    const select = document.getElementById("employee");
    select.innerHTML = ""; // ryd eksisterende options

    employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.id;
        option.textContent = `${emp.firstname} ${emp.lastname} (${emp.role})`;
        select.appendChild(option);
    });
}

// ---------- CREATE SHOW -------------
function setupShowForm() {
    const showForm = document.getElementById("show-form");

    showForm.onsubmit = async (event) => {
        event.preventDefault();

        const selectedEmployees = Array.from(
            document.getElementById("employee").selectedOptions
        ).map(opt => Number(opt.value));

        const show = {
            name: document.getElementById("title").value,
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
            employees: selectedEmployees
        };

        const token = sessionStorage.getItem("token")
        const response = await fetch("http://localhost:8080/dashboard/manager/register/show", {
            method: "POST",
            headers: {"Content-Type": "application/json","Authorization": `Bearer ${token}`},
            body: JSON.stringify(show)
        });
        const result = await response.text();
        alert(result);
        showForm.reset();
        document.getElementById("create-show-modal").style.display = "none";

        await loadShows();
    };
}

// ------- DELETE EMP -------
async function deleteEmp(employee) {
    const id = employee.id;

    const confirmed = confirm("Er du sikker på at du vil slette denne medarbejder?");
    if (!confirmed) return;

    const token = sessionStorage.getItem("token")
    const response = await fetch(`http://localhost:8080/dashboard/manager/employees/${id}`, {
        method: "DELETE",
        headers: {"Authorization": `Bearer ${token}`}
    });

    if (response.ok) {
        alert("Medarbejder slettet");
        document.getElementById("emp-modal").style.display = "none";
        await loadEmployees();
    } else {
        const msg = await response.text();
        alert("Fejl: " + msg);
    }
}

// ---------- CREATE SHIFT -------------
function showSelect(shows) {
    const select = document.getElementById("showSelect");
    select.innerHTML = "";

    shows.forEach(show => {
        const option = document.createElement("option")
        option.value = show.id;
        option.textContent = show.title
        select.appendChild(option)
    })
}

function setupShiftForm() {
    const shiftForm = document.getElementById("shift-form");

    shiftForm.addEventListener("submit", async event => {
        event.preventDefault();

        const shift = {
            plannedStart: document.getElementById("plannedStart").value,
            plannedEnd: document.getElementById("plannedEnd").value,
            show: {
                id: Number(document.getElementById("showSelect").value) // Konverterer value fra string til et tal
            }
        };

        const token = sessionStorage.getItem("token")
        const response = await fetch("http://localhost:8080/dashboard/manager/register/shift", {
            method: "POST",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            body: JSON.stringify(shift)
        });

        const result = await response.text();
        alert(result);
        shiftForm.reset();
        document.getElementById("create-shift-modal").style.display = "none";
    })
}

// ---------- LOAD SHIFTS --------------
async function loadShifts() {

    const token = sessionStorage.getItem("token");
    const response = await fetch("http://localhost:8080/dashboard/manager/shifts", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }

    })

    if (!response.ok) {
        console.error("Fejl ved indhentning af vager");
        return;
    }

    const shifts = await response.json();
    displayShifts(shifts);
}

function displayShifts(list) {
    const container = document.getElementById("shift-list")
    container.innerHTML = "";

    list.forEach(shift => {
        const div = document.createElement("div")
        div.className = "shift"
        div.dataset.id = shift.id
        div.textContent = `${shift.showTitle || "Ingen forestilling"}
        ${shift.plannedStart} - ${shift.plannedEnd}
        (Vagt #${shift.id})`;
        container.appendChild(div);
    });
    setupShiftClick();
}

// ---- LOAD SPECIFIC SHIFT ----
function displayShiftModal(shift) {
    const modal = document.getElementById("shift-modal")
    const container = document.getElementById("shift-details")

    container.innerHTML = `
        <p><strong>Show titel:</strong> ${shift.showTitle}</p>
        <p><strong>Starttidspunkt:</strong> ${shift.plannedStart}</p>
        <p><strong>Sluttidspunkt:</strong> ${shift.plannedEnd}</p>
    `;

    modal.style.display = "block";

    document.getElementById("delete-shift").onclick = function () {
        deleteShift(shift);
    }
    const closeBtn = modal.querySelector(".close")
    closeBtn.onclick = () => modal.style.display = "none";
}

function setupShiftClick() {
    const container = document.getElementById("shift-list");

    container.addEventListener("click", async event => {
        const div = event.target.closest(".shift")
        if (!div) return;

        const id = div.dataset.id;
        if (!id) return;

        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/dashboard/manager/shift/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                alert("Kunne ikke hente vagt info");
                return;
            }

            const shift = await response.json();
            displayShiftModal(shift);
        } catch (error) {
            console.log(error);
        }
    });
}

// ------- DELETE SHIFT -------

async function deleteShift(shift) {
    const id = shift.id;

    const confirmed = confirm("Er du sikker på at du vil slette denne vagt?")
    if (!confirmed) return;

    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/dashboard/manager/shift/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
            alert("Vagten er blevet slettet");
            document.getElementById("shift-modal").style.display = "none";
            await loadShifts();
        } else {
            const msg = await response.text();
            alert("Fejl: " + msg)
        }
    } catch (error) {
        console.log(error)
        alert("Noget gik galt ved sletning")
    }
}

//--------------------LOAD SHOWS-----------
async function loadShows() {
    try {
        const token = sessionStorage.getItem("token")
        const response = await fetch("http://localhost:8080/dashboard/manager/shows", {
            method: "GET",
            headers: {  "Authorization": `Bearer ${token}`}
        });

        if (!response.ok) {
            console.error("Fejl ved indhentning af forestillinger");
            return;
        }

        const shows = await response.json();
        displayShows(shows);
    } catch (error) {
        console.error("fejl: ", error);

    }
}

function displayShows(list) {
    const container = document.getElementById("shows-container");
    container.innerHTML = "";

    list.forEach(show => {
        const card = document.createElement("div");
        card.className = "show-card";

        const start = new Date(show.startDate).toLocaleDateString("da-DK");
        const end = new Date(show.endDate).toLocaleDateString("da-DK");

        card.innerHTML = `
            <div class="show-title">${show.title}</div>
            <div class="show-dates">Start: ${start}<br>Slut: ${end}</div>
        `;

        // Tilføj klik-event
        card.addEventListener("click", () => {
            openShowDetails(show);
        });

        container.appendChild(card);
    });
}

function openShowDetails(show) {
    let modal = document.getElementById("show-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "show-modal";
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2 id="show-title"></h2>
                <p id="show-dates"></p>
                <p id="show-employees"></p>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector(".close").onclick = () => {
            modal.style.display = "none";
        };

        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = "none";
        };
    }

    modal.querySelector("#show-title").textContent = show.title;
    modal.querySelector("#show-dates").textContent = `Start: ${show.startDate} | Slut: ${show.endDate}`;
    modal.querySelector("#show-employees").textContent =
        `Medarbejdere: ${(show.employees || []).map(e => e.firstname + " " + e.lastname).join(", ") || "Ingen"}`;

    modal.style.display = "block";
}






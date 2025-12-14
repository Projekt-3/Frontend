export async function initManagerDashboard(){
    // Load CSS til dashboard
    loadCSS('./css/modal.css');
    loadCSS('./css/dashboard.css');
    loadCSS('.css/fragment.css');

    await loadHeader()
    setGreeting()
    setupModal("createEmpModal", "create-emp-modal")
    setupModal("readEmpModal", "all-emp-modal")
    setupModal("createShowModal", "create-show-modal")
    setupModal("createShiftModal", "create-shift-modal");
    setupEmpForm()
    setupEmployeeClick()
    setupShowForm()
    setupShiftForm()
    await loadEmployees()
}

// Dynamisk load CSS
function loadCSS(href) {
    if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
}

//--------- HEADER -----------
async function loadHeader() {
    const response = await fetch('fragment/header.html');
    const html = await response.text();
    document.getElementById('header').innerHTML = html;

    const img = document.querySelector('.lion-logo');
    if (img) {
        img.src = './image/lion_logo.png';
    }
}

function setGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "";

    if (hour < 12) {
        greeting = "God morgen";
    } else if(hour > 10 && hour < 12) {
        greeting = "God formiddag"
    } else if (hour < 18) {
        greeting = "God eftermiddag";
    } else {
        greeting = "God aften";
    }

    const greetingElement = document.getElementById("greeting-text");
    if (greetingElement) {
        greetingElement.textContent = greeting;
    }
}

// -------- MODAL ---------
function setupModal(openBtnId, modalId){
    const modal = document.getElementById(modalId)
    const openModalBtn = document.getElementById(openBtnId)
    const closeModalBtn = modal.querySelector(".close");

    openModalBtn.onclick = async () => {
        if(modalId === "all-emp-modal"){
            await loadEmployees();
        }
        if (modalId === "create-show-modal") {
            const response = await fetch("http://localhost:8080/dashboard/manager/employees",{
                method: "GET",
                credentials: "include"
            });

            const employees = await response.json()
            populateEmployeeSelect(employees)
        }
        if (modalId === "create-shift-modal") {
            const response = await fetch("http://localhost:8080/dashboard/manager/shows", {
                method: "GET",
                credentials: "include"
            });
            const shows = await response.json();
            showSelect(shows);
        }
        modal.style.display = "block";
    }

    closeModalBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.style.display = "none"; });

}

// --------- CREATE EMP -----------
function setupEmpForm(){
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

        const response = await fetch("http://localhost:8080/dashboard/manager/register/employee", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(employee)
        });
        const result = await response.text();
        alert(result);
        empForm.reset();
        document.getElementById("emp-modal").style.display = "none";
    };
}

// ---------- LOAD EMPLOYEES ------------
async function loadEmployees(){
    const response = await fetch("http://localhost:8080/dashboard/manager/employees", {
        method: "GET",
        credentials: "include"
    })

    if(!response.ok){
        console.error("fejl ved indhentning af medarbejdere")
        return;
    }

    const employees = await response.json()
    console.log("medarbejdere hentet", employees);
    displayEmployees(employees)

}

function displayEmployees(list){
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
            const response = await fetch(`http://localhost:8080/dashboard/manager/employees/${id}`, {
                credentials: "include"
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

    const response = await fetch(`http://localhost:8080/dashboard/manager/employees/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
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
function setupShowForm(){
    const showForm = document.getElementById("show-form");

    showForm.onsubmit = async (event) => {
        event.preventDefault();

        const selectedEmployees = Array.from(
            document.getElementById("employee").selectedOptions
        ).map(opt =>Number( opt.value));

        const show = {
            name: document.getElementById("title").value,
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
            employees: selectedEmployees
        };

        const response = await fetch("http://localhost:8080/dashboard/manager/register/show", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(show)
        });
        const result = await response.text();
        alert(result);
        showForm.reset();
        document.getElementById("create-show-modal").style.display = "none";
    };
}
// ------- DELETE EMP -------
async function deleteEmp(employee) {
    const id = employee.id;

    const confirmed = confirm("Er du sikker på at du vil slette denne medarbejder?");
    if (!confirmed) return;

    const response = await fetch(`http://localhost:8080/dashboard/manager/employees/${id}`, {
        method: "DELETE",
        credentials: "include"
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

        const response = await fetch("http://localhost:8080/dashboard/manager/register/shift", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(shift)
        });

        const result = await response.text();
        alert(result);
        shiftForm.reset();
        document.getElementById("create-shift-modal").style.display = "none";
    })
}

export async function initManagerDashboard(){
    await loadHeader()
    setGreeting()
    setupModal()
    setupForm()
}


//--------- HEADER -----------
async function loadHeader() {
    const response = await fetch('fragment/header.html');   // dit fragment
    const html = await response.text();
    document.getElementById('header').innerHTML = html;
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
function setupModal(){
    const modal = document.getElementById("emp-modal")
    const openModalBtn = document.getElementById("openModalBtn")
    const closeModalBtn = document.querySelector(".close");

    openModalBtn.onclick = () => modal.style.display = "block";
    closeModalBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.style.display = "none"; });

}

// --------- CREATE EMP -----------
function setupForm(){
    const empForm = document.getElementById("emp-form");
    empForm.onsubmit = async (event) => {
        event.preventDefault();

        const phoneValue = document.getElementById("phone").value;
        if (!phoneValue || isNaN(phoneValue)) {
            alert("Only numbers is allowed");
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
        console.log("Sending employee:", employee);

        const response = await fetch("http://localhost:8080/manager/register", {
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


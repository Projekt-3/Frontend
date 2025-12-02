async function loadDashboard(){
    const response = await fetch('managerDashboard.html')
    const html = await response.text()
    document.getElementById('index').innerHTML = html

    const modal = document.getElementById("emp-modal")
    const openModalBtn = document.getElementById("openModalBtn")
    const closeModalBtn = document.querySelector(".close");
    const empForm = document.getElementById("emp-form");

    openModalBtn.onclick = () => modal.style.display = "block";
    closeModalBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.style.display = "none"; });

    empForm.onsubmit = async (event) => {
        event.preventDefault();
        const employee = {
            firstname: document.getElementById("firstname").value,
            lastname: document.getElementById("lastname").value,
            username: document.getElementById("username").value,
            role: document.getElementById("role").value,
            mail: document.getElementById("mail").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value
        };

        const response = await fetch("http://localhost:8080/dashboard/employee/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employee)
        });
        const result = await response.text();
        alert(result);
        empForm.reset();
        modal.style.display = "none";
    };
}

window.onload = loadDashboard;

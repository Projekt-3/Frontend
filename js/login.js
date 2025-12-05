import {navigateTo} from "./app";

export function initLogin() {
    const loginForm = document.getElementById("loginForm");

//emp login
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        fetch("http://localhost:8080/dologin", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({mail: username, password})
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Invalid username or password");

                }
                return response.json();
            })
            .then(data => {
                sessionStorage.setItem("token", data.token);
                navigateTo("managerDashboard");
            })
            .catch(error => {
                document.getElementById("error").textContent = error.message;
            });
    });
}



import {navigateTo} from "./app.js";

export async function initLogin() {
    const loginForm = document.getElementById("loginForm");

    loadCSS('./css/login.css');

    await loadHeader()

    // Dynamisk load CSS
    function loadCSS(href) {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;

            // Når CSS’en er loadet, gør body synlig
            link.onload = () => {
                document.body.style.visibility = 'visible';
            };

            document.head.appendChild(link);
        } else {
            // Hvis CSS allerede er loadet, vis body med det samme
            document.body.style.visibility = 'visible';
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



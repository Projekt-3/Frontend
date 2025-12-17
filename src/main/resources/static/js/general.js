export function loadCSS(href) {
    if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
}

// ------- HEADER --------
export async function loadHeader() {
    const header = document.getElementById('header')

    if(!header){
        console.warn('Header findes ikke på denne side')
        return;
    }

    const response = await fetch('./fragment/header.html');
    const html = await response.text();
    header.innerHTML = html;

    const img = document.querySelector('.lion-logo');
    if (img) {
        img.src = './image/lion_logo.png';
    }
}

export function setGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "";

    if (hour < 10) {
        greeting = "God morgen";
    } else if (hour < 12) {
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

export function logOut(){
    const logOutBtn = document.createElement('button')
    logOutBtn.textContent = "Log ud"
    logOutBtn.classList.add('logout-btn')

    logOutBtn.addEventListener('click', () =>{
        sessionStorage.clear()
        window.location.href = "index.html"
    })

    document.body.appendChild(logOutBtn)
}


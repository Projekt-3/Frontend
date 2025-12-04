import { initManagerDashboard } from './managerDashboard.js';

async function navigateTo(page){
    const response = await fetch(`${page}.html`)
    const html = await response.text()
    document.getElementById('index').innerHTML = html

    if(page === 'managerDashboard'){
        initManagerDashboard()
    }
}

window.onload = () => {
    navigateTo('managerDashboard');
};


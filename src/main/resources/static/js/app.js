import { initManagerDashboard } from './managerDashboard.js';
import { initLogin } from './login.js';
import {initEmployeeDashboard} from "./employeeDashboard.js";

export async function navigateTo(page) {
    const response = await fetch(`./fragment/${page}.html`);
    const html = await response.text();
    document.getElementById('index').innerHTML = html;

    if (page === 'managerDashboard') {
        await initManagerDashboard();
    } else if (page === 'login') {
        initLogin();
    } else if (page === 'employeeDashboard') {
        initEmployeeDashboard()
    }
}

window.onload = async () => {
    await navigateTo('login'); // start with login page
};

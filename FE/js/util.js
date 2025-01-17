function updateNavActive(onclick) {
    document
        .querySelectorAll(".nav-link")
        .forEach((link) => link.classList.remove("active"));
    document.querySelector(`[onclick="${onclick}"]`).classList.add("active");
}

const JwtTokenString = "jwtToken";
const ref = "https://burro-ideal-macaw.ngrok-free.app";
//https://burro-ideal-macaw.ngrok-free.app

function getToken() {
    return localStorage.getItem(JwtTokenString);
}

function saveToken(token) {
    localStorage.setItem(JwtTokenString, token);
}

function removeToken() {
    localStorage.removeItem(JwtTokenString);
}

function getAccountId() {
    const token = getToken();
    return JSON.parse(atob(token.split(".")[1])).idAccount;
}

function handleError(message, error) {
    console.error(message, error);
    alert(`${message.replace("Error", "Failed")}${error}`);
}

function openModal(id) {
    new bootstrap.Modal(document.getElementById(id)).show();
}

async function closeModalAndRefresh(modalId, refreshFn) {
    bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
    await refreshFn();
}

async function getResponse(api, method, token) {
    return await fetch(api, {
        method: method,
        headers: {
            "ngrok-skip-browser-warning": true,
            Authorization: `Bearer ${token}`,
        },
    });
}

async function getResponseWithBody(api, method, token, body) {
    return await fetch(api, {
        method: method,
        headers: {
            "ngrok-skip-browser-warning": true,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body,
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).replace(",", "");
}

function convertTimestampToDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };
    return date.toLocaleString("vi-VN", options)
}

function togglePassword(button) {
    const inputId = button.getAttribute("data-target");
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = button.querySelector("i");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.remove("bi-eye");
        eyeIcon.classList.add("bi-eye-slash");
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("bi-eye-slash");
        eyeIcon.classList.add("bi-eye");
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
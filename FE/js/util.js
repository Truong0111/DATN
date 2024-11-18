function updateNavActive(onclick) {
    document
        .querySelectorAll(".nav-link")
        .forEach((link) => link.classList.remove("active"));
    document.querySelector(`[onclick="${onclick}"]`).classList.add("active");
}

const JwtTokenString = "jwtToken";
const ref = "http://localhost:3000";

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
    alert(message.replace("Error", "Failed"));
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
            Authorization: `Bearer ${token}`,
        },
    });
}

async function getResponseWithBody(api, method, token, body) {
    return await fetch(api, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body,
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).replace(",", "");
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

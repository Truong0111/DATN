import {Type} from "../constant.js"

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Create loading overlay
    const loadingOverlay = document.createElement("div");
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    loadingOverlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    // Show/hide loading function
    const toggleLoading = (show) => {
        loadingOverlay.style.display = show ? "flex" : "none";
    };

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const accountValue = {
            username: username,
            password: password,
            typeApp: Type.WEB,
        }

        try {
            toggleLoading(true);
            const api = `${ref}/account/login`
            const response = await fetch(api, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(accountValue),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            localStorage.setItem("jwtToken", data.token);
            window.location.href = "home.html";
        } catch (error) {
            alert(error.message);
        } finally {
            toggleLoading(false);
        }
    });

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const registerData = {
            firstName: document.getElementById("register-firstname").value,
            lastName: document.getElementById("register-lastname").value,
            refId: document.getElementById("register-mssv").value,
            email: document.getElementById("register-email").value,
            phoneNumber: document.getElementById("register-phone").value,
            password: document.getElementById("register-password").value,
        };

        try {
            toggleLoading(true);
            const api = `${ref}/account/register`
            const response = await fetch(api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registerData),
            });

            if (response.ok) {
                alert("Registration successful! Please login.");
                registerForm.reset();
            } else {
                const errorText = await response.text();
                alert(errorText || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred during registration");
        } finally {
            toggleLoading(false);
        }
    });
});

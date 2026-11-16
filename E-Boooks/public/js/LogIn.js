
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.querySelector(".login-button");
    const togglePassword = document.getElementById("togglePassword");

    if (!loginForm || !emailInput || !passwordInput ||
        !loginMessage || !loginButton) {
        console.error("CodeVerse: Login elements are missing.");
        return;
    }

    // SHOW / HIDE PASSWORD
    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";

            passwordInput.type = isHidden ? "text" : "password";
            togglePassword.textContent = isHidden ? "Hide" : "Show";
        });
    }

    // DISPLAY LOGIN MESSAGE
    function showMessage(message, success = false) {
        loginMessage.textContent = message;
        loginMessage.style.color = success ? "#16803c" : "#dc2626";
    }

    // LOGIN FORM
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        showMessage("");

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Signing In...";

        try {
            console.log("CodeVerse: Sending login request...");

            
const response = await fetch("/api/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
});

const contentType =
    response.headers.get("content-type") || "";

if (!contentType.includes("application/json")) {
    const serverMessage = await response.text();

    console.error("Login server error:", {
        status: response.status,
        message: serverMessage.slice(0, 500)
    });

    throw new Error(
        "The login server is temporarily unavailable. " +
        "Please try again later."
    );
}

const data = await response.json();

if (!response.ok || !data.success) {
    throw new Error(
        data.message || "Login failed."
    );
}

// Keep your existing successful-login redirect here.

            // Redirect only after confirmed success
            window.setTimeout(() => {
                window.location.replace("/index.html");
            }, 800);

        } catch (error) {
            console.error("CodeVerse login error:", error);

            showMessage(
                error.message || "Unable to sign in. Please try again."
            );

            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }
    });

    console.log("CodeVerse: Login JavaScript loaded successfully.");
});

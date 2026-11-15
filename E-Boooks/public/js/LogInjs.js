
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.querySelector(".login-button");
    const togglePassword = document.getElementById("togglePassword");

    // SHOW / HIDE PASSWORD
    if (togglePassword) {
        togglePassword.addEventListener("click", function () {

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.textContent = "Hide";
            } else {
                passwordInput.type = "password";
                togglePassword.textContent = "Show";
            }

        });
    }

    // LOGIN
    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        loginMessage.textContent = "";
        loginMessage.style.color = "red";

        if (!email || !password) {
            loginMessage.textContent = "Please enter your email and password.";
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Signing In...";

        try {

            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Invalid email or password.");
            }

            loginMessage.style.color = "green";
            loginMessage.textContent = "Login successful! Redirecting...";

            // REDIRECT TO HOME PAGE
            setTimeout(function () {
                window.location.href = "index.html";
            }, 800);

        } catch (error) {

            loginMessage.style.color = "red";
            loginMessage.textContent = error.message;

            loginButton.disabled = false;
            loginButton.textContent = "Sign In";

        }

    });

});

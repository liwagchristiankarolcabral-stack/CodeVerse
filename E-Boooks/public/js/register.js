
document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const registerButton = document.getElementById("registerButton");
    const registerMessage = document.getElementById("registerMessage");

    if (!registerForm || !registerButton || !registerMessage) {
        console.error("Registration elements not found.");
        return;
    }

    // SHOW / HIDE PASSWORD
    document.querySelectorAll(".toggle-password").forEach(button => {

        button.addEventListener("click", function () {

            const target = document.getElementById(
                button.dataset.target
            );

            if (!target) return;

            if (target.type === "password") {
                target.type = "text";
                button.textContent = "Hide";
            } else {
                target.type = "password";
                button.textContent = "Show";
            }

        });

    });

    // CREATE ACCOUNT
    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();

        const yearLevel = document.getElementById("yearLevel").value;
        const section = document.getElementById("section").value.trim();
        const gender = document.getElementById("gender").value;

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const agreeTerms = document.getElementById("agreeTerms");

        registerMessage.style.color = "red";
        registerMessage.textContent = "";

        if (!yearLevel || !section || !gender) {
            registerMessage.textContent =
                "Please complete your year level, section, and gender.";
            return;
        }

        if (section.length > 30) {
            registerMessage.textContent =
                "Section must not exceed 30 characters.";
            return;
        }

        if (password !== confirmPassword) {
            registerMessage.textContent = "Passwords do not match.";
            return;
        }

        if (password.length < 10) {
            registerMessage.textContent =
                "Password must contain at least 10 characters.";
            return;
        }

        if (new TextEncoder().encode(password).length > 72) {
            registerMessage.textContent =
                "Password must not exceed 72 bytes.";
            return;
        }

        if (!agreeTerms.checked) {
            registerMessage.textContent =
                "Please accept the Terms and Conditions.";
            return;
        }

        registerButton.disabled = true;
        registerButton.textContent = "Creating Account...";

        try {

            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    yearLevel,
                    section,
                    gender,
                    password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Registration failed."
                );
            }

            registerMessage.style.color = "green";
            registerMessage.textContent =
                "Account created successfully! Redirecting...";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {

            registerMessage.style.color = "red";
            registerMessage.textContent = error.message;

            registerButton.disabled = false;
            registerButton.textContent = "Create Account";

        }

    });

});

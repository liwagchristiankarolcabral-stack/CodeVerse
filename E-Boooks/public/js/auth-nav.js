
document.addEventListener("DOMContentLoaded", function () {

    const accountActions =
        document.getElementById("accountActions");

    if (!accountActions) {
        console.error("accountActions element was not found.");
        return;
    }

    // ==========================================
    // DISPLAY GUEST BUTTONS
    // ==========================================

    function showGuestButtons() {

        accountActions.innerHTML = `
            <a href="/LogIn.html" class="login-btn">
                Log In
            </a>

            <a href="/register.html" class="signup-btn">
                Sign Up
            </a>
        `;
    }

    // ==========================================
    // DISPLAY LOGGED-IN USER
    // ==========================================

    function showLoggedInUser(user) {

        const fullName =
            user.fullName ||
            user.full_name ||
            "CodeVerse User";

        accountActions.replaceChildren();

        // Display user's registered full name
        const username = document.createElement("span");

        username.className = "account-username";
        username.textContent = "👤 " + fullName;

        // Create Log Out button
        const logoutButton = document.createElement("button");

        logoutButton.type = "button";
        logoutButton.className = "logout-btn";
        logoutButton.id = "logoutButton";
        logoutButton.textContent = "Log Out";

        accountActions.append(
            username,
            logoutButton
        );

        // ==========================================
        // LOG OUT FUNCTION
        // ==========================================

        logoutButton.addEventListener("click", async function () {

            logoutButton.disabled = true;
            logoutButton.textContent = "Logging out...";

            try {

                const response = await fetch("/api/logout", {
                    method: "POST",
                    credentials: "same-origin"
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error("Unable to log out.");
                }

                // Redirect to login page
                window.location.replace("/LogIn.html");

            } catch (error) {

                console.error("Logout error:", error);

                alert("Unable to log out. Please try again.");

                logoutButton.disabled = false;
                logoutButton.textContent = "Log Out";
            }

        });
    }

    // ==========================================
    // CHECK USER LOGIN STATUS
    // ==========================================

    async function checkLoginStatus() {

        try {

            const response = await fetch("/api/user", {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            });

            if (!response.ok) {
                showGuestButtons();
                return;
            }

            const data = await response.json();

            if (data.success && data.user) {

                showLoggedInUser(data.user);

            } else {

                showGuestButtons();

            }

        } catch (error) {

            console.error("Login status error:", error);

            showGuestButtons();

        }
    }

    checkLoginStatus();

    // Refresh account information when returning to the page
    window.addEventListener("pageshow", checkLoginStatus);

});

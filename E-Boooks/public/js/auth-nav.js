
document.addEventListener("DOMContentLoaded", function () {

    const accountActions = document.getElementById("accountActions");

    if (!accountActions) {
        console.error("accountActions element was not found.");
        return;
    }

    fetch("/api/user", {
        method: "GET",
        credentials: "include"
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("User is not logged in.");
        }

        return response.json();

    })
    .then(data => {

        if (data.success && data.user) {

            // Display Log Out button
            accountActions.innerHTML = `
                <button type="button" class="signup-btn" id="logoutButton">
                    Log Out
                </button>
            `;

            document.getElementById("logoutButton").addEventListener("click", function () {

                fetch("/api/logout", {
                    method: "POST",
                    credentials: "include"
                })
                .then(response => {

                    if (response.ok) {
                        window.location.href = "LogIn.html";
                    } else {
                        alert("Unable to log out. Please try again.");
                    }

                })
                .catch(error => {
                    console.error("Logout error:", error);
                    alert("An error occurred while logging out.");
                });

            });

        }

    })
    .catch(error => {

        console.log("No active login session:", error);

        accountActions.innerHTML = `
            <a href="LogIn.html" class="login-btn">Log In</a>
            <a href="register.html" class="signup-btn">Sign Up</a>
        `;

    });

});

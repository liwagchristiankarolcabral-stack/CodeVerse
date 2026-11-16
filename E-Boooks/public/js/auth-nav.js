
/* ==========================================
   CODEVERSE - USER ACCOUNT NAVIGATION
   Login Status + Username + Logout
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    /* ==========================================
       GET HTML ELEMENTS
    ========================================== */

    const guestActions =
        document.getElementById("guestActions");

    const userActions =
        document.getElementById("userActions");

    const userName =
        document.getElementById("userName");

    const userAvatar =
        document.getElementById("userAvatar");

    const logoutButton =
        document.getElementById("logoutButton");

    if (
        !guestActions ||
        !userActions ||
        !userName ||
        !userAvatar ||
        !logoutButton
    ) {
        console.error(
            "CodeVerse: Account navigation elements were not found."
        );
        return;
    }

    /* ==========================================
       DISPLAY GUEST BUTTONS
    ========================================== */

    function showGuestButtons() {

        guestActions.hidden = false;
        userActions.hidden = true;

        userName.textContent = "User";
        userAvatar.textContent = "U";

    }

    /* ==========================================
       DISPLAY LOGGED-IN USER
    ========================================== */

    function showLoggedInUser(user) {

        const fullName =
            user.fullName ||
            user.full_name ||
            "CodeVerse User";

        // Display registered full name
        userName.textContent = fullName;

        // Display first letter as avatar
        userAvatar.textContent =
            fullName.charAt(0).toUpperCase();

        // Hide Login and Sign Up
        guestActions.hidden = true;

        // Show username and Logout
        userActions.hidden = false;

    }

    /* ==========================================
       CHECK USER LOGIN STATUS
    ========================================== */

    async function checkLoginStatus() {

        try {

            const response = await fetch(
                "/api/auth/status",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to check authentication status."
                );
            }

            const data = await response.json();

            if (
                data.success &&
                data.loggedIn &&
                data.user
            ) {

                showLoggedInUser(data.user);

            } else {

                showGuestButtons();

            }

        } catch (error) {

            console.error(
                "CodeVerse login status error:",
                error
            );

            // Do not incorrectly show guest buttons
            // when the server is temporarily unavailable.
            guestActions.hidden = true;
            userActions.hidden = true;

        }

    }

    /* ==========================================
       LOG OUT FUNCTION
    ========================================== */

    async function logoutUser() {

        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out...";

        try {

            const response = await fetch(
                "/api/logout",
                {
                    method: "POST",
                    credentials: "same-origin"
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message || "Unable to log out."
                );

            }

            // Update navigation
            showGuestButtons();

            // Redirect to homepage
            window.location.replace("/index.html");

        } catch (error) {

            console.error(
                "CodeVerse logout error:",
                error
            );

            alert(
                "Unable to log out. Please try again."
            );

        } finally {

            logoutButton.disabled = false;
            logoutButton.textContent = "Log Out";

        }

    }

    /* ==========================================
       EVENT LISTENERS
    ========================================== */

    logoutButton.addEventListener(
        "click",
        logoutUser
    );

    /* ==========================================
       INITIALIZE AUTHENTICATION
    ========================================== */

    guestActions.hidden = true;
    userActions.hidden = true;

    checkLoginStatus();

    // Refresh login status when returning
    // to this page using browser navigation.
    window.addEventListener(
        "pageshow",
        checkLoginStatus
    );

});

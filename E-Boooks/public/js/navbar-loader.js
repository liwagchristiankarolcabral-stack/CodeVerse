
"use strict";

/* ==========================================================
   CODEVERSE SHARED NAVBAR LOADER
========================================================== */

(function () {

    async function initializeNavbar() {

        const container =
            document.getElementById("navbarContainer");

        if (!container) {
            return;
        }

        /* ==================================================
           LOAD NAVBAR HTML
        ================================================== */

        try {

            const response = await fetch(
                "/components/navbar.html",
                {
                    credentials: "same-origin",
                    cache: "no-cache"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Navbar HTTP " + response.status
                );
            }

            container.innerHTML =
                await response.text();

        } catch (error) {

            console.error(
                "CodeVerse navbar loading error:",
                error
            );

            return;
        }

        /* ==================================================
           ELEMENTS
        ================================================== */

        const get = id =>
            document.getElementById(id);

        const themeButton =
            get("cvThemeToggle");

        const menuButton =
            get("cvMenuToggle");

        const navigationLinks =
            get("cvNavLinks");

        const guestActions =
            get("guestActions");

        const userActions =
            get("userActions");

        const userName =
            get("userName");

        const userAvatar =
            get("userAvatar");

        const logoutButton =
            get("logoutButton");

        /* ==================================================
           DARK MODE
        ================================================== */

        const isReader =
            !!document.querySelector(
                ".reading-controls, #bookContent"
            );

        const themeKey =
            isReader ? "readerTheme" : "theme";

        function readTheme() {

            try {

                return localStorage.getItem(
                    themeKey
                );

            } catch (error) {

                return null;

            }
        }

        function saveTheme(value) {

            try {

                localStorage.setItem(
                    themeKey,
                    value
                );

            } catch (error) {

                console.warn(
                    "Theme preference could not be saved.",
                    error
                );

            }
        }

        function isDarkMode() {

            return document.body.classList.contains(
                "dark-mode"
            );
        }

        function applyTheme(dark) {

            document.body.classList.toggle(
                "dark-mode",
                dark
            );

            document.body.classList.toggle(
                "dark",
                dark
            );

            document.documentElement.classList.toggle(
                "dark",
                dark
            );

            document.documentElement.setAttribute(
                "data-theme",
                dark ? "dark" : "light"
            );

            if (themeButton) {

                themeButton.textContent =
                    dark ? "☀" : "☾";

                themeButton.setAttribute(
                    "aria-pressed",
                    String(dark)
                );

                themeButton.setAttribute(
                    "aria-label",
                    dark
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                );

            }
        }

        const storedTheme = readTheme();

        const initiallyDark =
            storedTheme === "dark" ||
            (
                storedTheme === null &&
                (
                    document.body.classList.contains(
                        "dark-mode"
                    ) ||
                    document.body.classList.contains(
                        "dark"
                    )
                )
            );

        applyTheme(initiallyDark);

        if (themeButton) {

            themeButton.addEventListener(
                "click",
                function () {

                    const nextDark = !isDarkMode();

                    saveTheme(
                        nextDark ? "dark" : "light"
                    );

                    applyTheme(nextDark);

                }
            );

        }

        /* ==================================================
           MOBILE MENU
        ================================================== */

        if (menuButton && navigationLinks) {

            menuButton.addEventListener(
                "click",
                function () {

                    const opened =
                        navigationLinks.classList.toggle(
                            "cv-open"
                        );

                    menuButton.setAttribute(
                        "aria-expanded",
                        String(opened)
                    );

                    menuButton.setAttribute(
                        "aria-label",
                        opened
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    );

                }
            );

            navigationLinks.addEventListener(
                "click",
                function (event) {

                    if (!event.target.closest("a")) {
                        return;
                    }

                    navigationLinks.classList.remove(
                        "cv-open"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }

        /* ==================================================
           AUTHENTICATION STATUS
        ================================================== */

        function showGuest() {

            if (guestActions) {
                guestActions.hidden = false;
            }

            if (userActions) {
                userActions.hidden = true;
            }
        }

        function showUser(name) {

            const safeName =
                String(name || "User").trim() || "User";

            if (userName) {
                userName.textContent = safeName;
            }

            if (userAvatar) {

                userAvatar.textContent =
                    safeName.charAt(0).toUpperCase();

            }

            if (guestActions) {
                guestActions.hidden = true;
            }

            if (userActions) {
                userActions.hidden = false;
            }
        }

        try {

            const response = await fetch(
                "/api/auth/status",
                {
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Authentication status HTTP " +
                    response.status
                );
            }

            const result =
                await response.json();

            const authenticated =
                result.loggedIn === true ||
                result.authenticated === true;

            if (authenticated) {

                const account =
                    result.user || {};

                const name =
                    account.fullName ||
                    account.full_name ||
                    account.name ||
                    account.username ||
                    "User";

                showUser(name);

            } else {

                showGuest();

            }

        } catch (error) {

            console.warn(
                "CodeVerse authentication status error:",
                error
            );

            showGuest();

        }

        /* ==================================================
           LOGOUT
        ================================================== */

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async function () {

                    logoutButton.disabled = true;

                    try {

                        const response = await fetch(
                            "/api/logout",
                            {
                                method: "POST",
                                credentials: "same-origin"
                            }
                        );

                        if (!response.ok) {

                            throw new Error(
                                "Logout HTTP " +
                                response.status
                            );

                        }

                        window.location.assign(
                            "/index.html"
                        );

                    } catch (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                        alert(
                            "Unable to log out. Please try again."
                        );

                        logoutButton.disabled = false;

                    }

                }
            );

        }

    }

    /* ======================================================
       INITIALIZATION
    ====================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeNavbar,
            {
                once: true
            }
        );

    } else {

        initializeNavbar();

    }

})();

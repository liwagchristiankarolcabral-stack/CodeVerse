
"use strict";

/* ==========================================================
   CODEVERSE - COMPLETE NAVBAR BULK UPDATER
   Version 2.0

   FEATURES:
   - Updates all matching HTML files in protected-books
   - Supports book covers and book reader pages
   - Creates one shared navigation component
   - Supports login / logout
   - Supports dark mode
   - Supports mobile navigation
   - Preserves existing book content and scripts
   - Provides compatibility for old navbar JavaScript
   - Creates backups
   - Supports --dry-run
   - Supports --restore
========================================================== */

const fs = require("fs");
const path = require("path");

/* ==========================================================
   PROJECT DIRECTORIES
========================================================== */

const ROOT = process.cwd();

const BOOKS_DIR = path.join(
    ROOT,
    "protected-books"
);

const PUBLIC_DIR = path.join(
    ROOT,
    "public"
);

const COMPONENT_DIR = path.join(
    PUBLIC_DIR,
    "components"
);

const CSS_DIR = path.join(
    PUBLIC_DIR,
    "css"
);

const JS_DIR = path.join(
    PUBLIC_DIR,
    "js"
);

/* ==========================================================
   COMMAND OPTIONS
========================================================== */

const DRY_RUN = process.argv.includes("--dry-run");

const RESTORE = process.argv.includes("--restore");

const BACKUP_SUFFIX = ".navbar-backup";

/* ==========================================================
   VALIDATION
========================================================== */

if (!fs.existsSync(BOOKS_DIR)) {
    console.error(
        "ERROR: protected-books folder not found."
    );

    console.error(
        "Run this script from your E-Boooks project folder."
    );

    process.exit(1);
}

/* ==========================================================
   CREATE DIRECTORIES
========================================================== */

if (!DRY_RUN && !RESTORE) {
    for (const directory of [
        COMPONENT_DIR,
        CSS_DIR,
        JS_DIR
    ]) {
        fs.mkdirSync(directory, {
            recursive: true
        });
    }
}

/* ==========================================================
   SHARED NAVBAR HTML
========================================================== */

const NAVBAR_HTML = `
<header class="cv-navbar" aria-label="CodeVerse navigation">

    <!-- BRAND -->

    <a class="cv-brand" href="/index.html">

        <img
            src="/images/CodeVerseLogo.png"
            alt="CodeVerse Logo"
        >

        <span class="cv-brand-name">
            Code<span>Verse</span>
        </span>

    </a>

    <!-- NAVIGATION LINKS -->

    <nav
        class="cv-nav-links"
        id="cvNavLinks"
        aria-label="Main navigation"
    >

        <a href="/index.html">
            Home
        </a>

        <a href="/library.html">
            Explore Books
        </a>

        <a href="/index.html#about">
            About
        </a>

    </nav>

    <!-- NAVIGATION ACTIONS -->

    <div class="cv-nav-actions">

        <!-- DARK MODE -->

        <button
            type="button"
            class="cv-icon-button"
            id="cvThemeToggle"
            aria-label="Toggle dark mode"
            aria-pressed="false"
        >
            ☾
        </button>

        <!-- GUEST -->

        <div
            class="cv-guest-actions"
            id="guestActions"
            hidden
        >

            <a
                href="/LogIn.html"
                class="cv-login-button"
            >
                Log In
            </a>

            <a
                href="/register.html"
                class="cv-signup-button"
            >
                Sign Up
            </a>

        </div>

        <!-- LOGGED IN USER -->

        <div
            class="cv-user-actions"
            id="userActions"
            hidden
        >

            <span
                class="cv-user-avatar"
                id="userAvatar"
            >
                U
            </span>

            <span
                class="cv-user-name"
                id="userName"
            >
                User
            </span>

            <button
                type="button"
                class="cv-logout-button"
                id="logoutButton"
            >
                Log Out
            </button>

        </div>

        <!-- MOBILE MENU -->

        <button
            type="button"
            class="cv-icon-button cv-mobile-toggle"
            id="cvMenuToggle"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="cvNavLinks"
        >
            ☰
        </button>

    </div>

</header>
`;

/* ==========================================================
   SHARED NAVBAR CSS
========================================================== */

const NAVBAR_CSS = `
/* ==========================================================
   CODEVERSE SHARED NAVIGATION
========================================================== */

#navbarContainer {
    position: relative;
    z-index: 1200;
}

.cv-navbar,
.cv-navbar * {
    box-sizing: border-box;
}

.cv-navbar {
    position: relative;

    display: flex;
    align-items: center;

    gap: 24px;

    width: 100%;
    min-height: 78px;

    padding: 12px 5%;

    background: var(--surface, #ffffff);

    color: var(--text, #202b40);

    border-bottom: 1px solid
        var(--border, #e6eaf1);

    font-family:
        "DM Sans",
        Arial,
        sans-serif;
}

.cv-navbar [hidden] {
    display: none !important;
}

/* ==========================================================
   BRAND
========================================================== */

.cv-brand {
    display: inline-flex;
    align-items: center;

    gap: 10px;

    flex-shrink: 0;

    text-decoration: none;

    color: inherit;

    font-size: 23px;
    font-weight: 800;

    white-space: nowrap;
}

.cv-brand img {
    width: 44px;
    height: 44px;

    object-fit: contain;
}

.cv-brand-name {
    color: inherit;
}

.cv-brand-name span {
    color: var(--primary, #3157a4);
}

/* ==========================================================
   NAVIGATION LINKS
========================================================== */

.cv-nav-links {
    display: flex;
    align-items: center;

    gap: 25px;

    margin-left: auto;
}

.cv-nav-links a {
    color: var(--muted, #64748b);

    text-decoration: none;

    font-size: 14px;
    font-weight: 700;

    white-space: nowrap;

    transition: color 0.2s ease;
}

.cv-nav-links a:hover {
    color: var(--primary, #3157a4);
}

/* ==========================================================
   ACTIONS
========================================================== */

.cv-nav-actions,
.cv-guest-actions,
.cv-user-actions {
    display: flex;
    align-items: center;

    gap: 10px;
}

.cv-nav-actions {
    flex-shrink: 0;
}

/* ==========================================================
   ICON BUTTONS
========================================================== */

.cv-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 42px;
    height: 42px;

    padding: 0;

    border-radius: 10px;

    border: 1px solid
        var(--border, #e6eaf1);

    background: var(--surface, #ffffff);

    color: var(--text, #202b40);

    font-size: 20px;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease;
}

.cv-icon-button:hover {
    transform: translateY(-1px);
}

/* ==========================================================
   AUTHENTICATION BUTTONS
========================================================== */

.cv-login-button,
.cv-signup-button,
.cv-logout-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    padding: 10px 15px;

    min-height: 40px;

    border-radius: 10px;

    font-family: inherit;
    font-size: 13px;
    font-weight: 700;

    text-decoration: none;

    white-space: nowrap;

    cursor: pointer;
}

.cv-login-button {
    background: transparent;

    color: var(--text, #202b40);

    border: 1px solid
        var(--border, #e6eaf1);
}

.cv-signup-button,
.cv-logout-button {
    background: #3157a4;

    color: #ffffff;

    border: 1px solid #3157a4;
}

.cv-signup-button:hover,
.cv-logout-button:hover {
    background: #24427f;
}

/* ==========================================================
   USER DETAILS
========================================================== */

.cv-user-avatar {
    display: grid;
    place-items: center;

    width: 38px;
    height: 38px;

    flex-shrink: 0;

    border-radius: 50%;

    background: #3157a4;

    color: #ffffff;

    font-size: 15px;
    font-weight: 800;
}

.cv-user-name {
    max-width: 155px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    font-size: 13px;
    font-weight: 700;
}

/* ==========================================================
   MOBILE NAVIGATION
========================================================== */

.cv-mobile-toggle {
    display: none;
}

@media (max-width: 950px) {

    .cv-navbar {
        flex-wrap: wrap;

        gap: 12px;
    }

    .cv-nav-actions {
        margin-left: auto;
    }

    .cv-mobile-toggle {
        display: inline-flex;
    }

    .cv-nav-links {
        display: none;

        order: 3;

        width: 100%;

        margin: 0;

        flex-direction: column;
        align-items: stretch;

        gap: 0;
    }

    .cv-nav-links.cv-open {
        display: flex;
    }

    .cv-nav-links a {
        display: block;

        padding: 13px 10px;

        border-top: 1px solid
            var(--border, #e6eaf1);
    }
}

@media (max-width: 600px) {

    .cv-navbar {
        padding: 10px 14px;
    }

    .cv-brand {
        font-size: 18px;
    }

    .cv-brand img {
        width: 34px;
        height: 34px;
    }

    .cv-nav-actions {
        gap: 6px;
    }

    .cv-icon-button {
        width: 36px;
        height: 36px;
    }

    .cv-user-name {
        display: none;
    }

    .cv-login-button,
    .cv-signup-button,
    .cv-logout-button {
        padding: 8px 10px;

        min-height: 36px;

        font-size: 11px;
    }
}

/* ==========================================================
   DARK MODE
========================================================== */

body.dark-mode .cv-navbar,
body.dark .cv-navbar,
html.dark .cv-navbar,
html[data-theme="dark"] .cv-navbar {
    background: #172235;

    color: #f1f5f9;

    border-bottom-color: #34445d;
}

body.dark-mode .cv-navbar a,
body.dark .cv-navbar a,
html.dark .cv-navbar a,
html[data-theme="dark"] .cv-navbar a {
    color: #e2e8f0;
}

body.dark-mode .cv-icon-button,
body.dark .cv-icon-button,
html.dark .cv-icon-button,
html[data-theme="dark"] .cv-icon-button {
    background: #24344c;

    color: #f8fafc;

    border-color: #40516c;
}

body.dark-mode .cv-login-button,
body.dark .cv-login-button,
html.dark .cv-login-button,
html[data-theme="dark"] .cv-login-button {
    color: #f8fafc;

    border-color: #40516c;
}
`;

/* ==========================================================
   SHARED NAVBAR LOADER
========================================================== */

const NAVBAR_LOADER = `
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
`;

/* ==========================================================
   SHARED FILE PATHS
========================================================== */

const SHARED_FILES = [
    {
        file: path.join(
            COMPONENT_DIR,
            "navbar.html"
        ),
        content: NAVBAR_HTML
    },
    {
        file: path.join(
            CSS_DIR,
            "navbar.css"
        ),
        content: NAVBAR_CSS
    },
    {
        file: path.join(
            JS_DIR,
            "navbar-loader.js"
        ),
        content: NAVBAR_LOADER
    }
];

/* ==========================================================
   FILE UTILITIES
========================================================== */

function backupFile(file) {

    const backup = file + BACKUP_SUFFIX;

    if (!fs.existsSync(backup)) {

        fs.copyFileSync(
            file,
            backup
        );

    }

}

function writeWithBackup(file, content) {

    if (fs.existsSync(file)) {

        const original =
            fs.readFileSync(file, "utf8");

        if (original === content) {
            return false;
        }

        backupFile(file);

    }

    fs.mkdirSync(
        path.dirname(file),
        {
            recursive: true
        }
    );

    fs.writeFileSync(
        file,
        content,
        "utf8"
    );

    return true;
}

/* ==========================================================
   RECURSIVE HTML DISCOVERY
========================================================== */

function findHTMLFiles(directory) {

    let result = [];

    const entries = fs.readdirSync(
        directory,
        {
            withFileTypes: true
        }
    );

    for (const entry of entries) {

        const fullPath = path.join(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {

            result.push(
                ...findHTMLFiles(fullPath)
            );

        } else if (
            entry.isFile() &&
            /\.html?$/i.test(entry.name)
        ) {

            result.push(fullPath);

        }

    }

    return result;
}

/* ==========================================================
   IDENTIFY EXISTING NAVBAR
========================================================== */

const OLD_NAVBAR_PATTERN =
    /<header\b(?=[^>]*\bclass\s*=\s*["'][^"']*\bnavbar\b[^"']*["'])[^>]*>[\s\S]*?<\/header\s*>/i;

const NEW_NAVBAR_PATTERN =
    /<div\b(?=[^>]*\bid\s*=\s*["']navbarContainer["'])[^>]*>\s*<\/div\s*>/i;

/* ==========================================================
   OLD NAVBAR COMPATIBILITY

   Existing book JavaScript may still call:

   document.getElementById("themeToggle")
   document.getElementById("menuToggle")
   document.getElementById("navLinks")

   We retain hidden compatibility elements so that scripts
   using these IDs do not immediately fail because of null
   references.

   The new navbar has its own separate IDs.
========================================================== */

const COMPATIBILITY_HTML = `
<div
    id="cvLegacyNavCompatibility"
    hidden
    aria-hidden="true"
    style="display:none!important"
>
    <button
        type="button"
        id="themeToggle"
    >
        Theme
    </button>

    <span id="themeIcon"></span>

    <button
        type="button"
        id="menuToggle"
        aria-expanded="false"
    >
        Menu
    </button>

    <nav id="navLinks"></nav>
</div>
`;

/* ==========================================================
   UPDATE HTML
========================================================== */

function updateHTML(original) {

    let html = original;

    const hasNewNavbar =
        NEW_NAVBAR_PATTERN.test(html);

    const hasOldNavbar =
        OLD_NAVBAR_PATTERN.test(html);

    if (!hasOldNavbar && !hasNewNavbar) {

        return {
            changed: false,
            reason: "No recognized navbar",
            html: original
        };

    }

    if (
        !/<\/head\s*>/i.test(html) ||
        !/<\/body\s*>/i.test(html)
    ) {

        return {
            changed: false,
            reason: "Missing head/body closing tag",
            html: original
        };

    }

    /* ======================================================
       REPLACE OLD NAVBAR
    ====================================================== */

    if (hasOldNavbar && !hasNewNavbar) {

        html = html.replace(
            OLD_NAVBAR_PATTERN,
            '<div id="navbarContainer"></div>'
        );

    }

    /* ======================================================
       ADD LEGACY COMPATIBILITY ELEMENTS
    ====================================================== */

    if (
        !html.includes(
            'id="cvLegacyNavCompatibility"'
        )
    ) {

        html = html.replace(
            /<div\s+id=["']navbarContainer["']\s*><\/div>/i,
            match =>
                match + "\n" + COMPATIBILITY_HTML
        );

    }

    /* ======================================================
       REMOVE OLD AUTH NAV SCRIPT

       Only remove the known external auth navbar script.
       Leave all book-specific inline JavaScript intact.
    ====================================================== */

    html = html.replace(
        /<script\b(?=[^>]*\bsrc\s*=\s*["']\/js\/auth-nav\.js["'])[^>]*>\s*<\/script\s*>/gi,
        ""
    );

    /* ======================================================
       ADD SHARED CSS
    ====================================================== */

    if (
        !/href\s*=\s*["']\/css\/navbar\.css["']/i.test(html)
    ) {

        html = html.replace(
            /<\/head\s*>/i,
            '    <link rel="stylesheet" href="/css/navbar.css">\n</head>'
        );

    }

    /* ======================================================
       ADD SHARED JAVASCRIPT
    ====================================================== */

    if (
        !/src\s*=\s*["']\/js\/navbar-loader\.js["']/i.test(html)
    ) {

        html = html.replace(
            /<\/body\s*>/i,
            '    <script src="/js/navbar-loader.js" defer></script>\n</body>'
        );

    }

    return {
        changed: html !== original,
        reason: "Updated",
        html
    };
}

/* ==========================================================
   RESTORE BACKUPS
========================================================== */

function restoreBackups() {

    const htmlFiles =
        findHTMLFiles(BOOKS_DIR);

    let restored = 0;

    for (const file of htmlFiles) {

        const backup =
            file + BACKUP_SUFFIX;

        if (!fs.existsSync(backup)) {
            continue;
        }

        fs.copyFileSync(
            backup,
            file
        );

        console.log(
            "RESTORED:",
            path.relative(ROOT, file)
        );

        restored++;
    }

    for (const shared of SHARED_FILES) {

        const backup =
            shared.file + BACKUP_SUFFIX;

        if (fs.existsSync(backup)) {

            fs.copyFileSync(
                backup,
                shared.file
            );

            console.log(
                "RESTORED SHARED FILE:",
                path.relative(
                    ROOT,
                    shared.file
                )
            );

        }

    }

    console.log("");
    console.log("====================================");
    console.log("RESTORE COMPLETE");
    console.log("HTML files restored:", restored);
    console.log("====================================");
}

/* ==========================================================
   MAIN EXECUTION
========================================================== */

function main() {

    if (RESTORE) {

        restoreBackups();

        return;
    }

    console.log("");
    console.log("====================================");
    console.log("CODEVERSE NAVBAR UPDATER V2");
    console.log("====================================");

    if (DRY_RUN) {

        console.log(
            "PREVIEW MODE - NO FILES WILL BE CHANGED"
        );

    }

    /* ======================================================
       SHARED FILES
    ====================================================== */

    for (const shared of SHARED_FILES) {

        const exists =
            fs.existsSync(shared.file);

        const current = exists
            ? fs.readFileSync(
                shared.file,
                "utf8"
            )
            : null;

        if (current === shared.content) {

            console.log(
                "UNCHANGED SHARED:",
                path.relative(
                    ROOT,
                    shared.file
                )
            );

            continue;
        }

        if (DRY_RUN) {

            console.log(
                "WOULD WRITE SHARED:",
                path.relative(
                    ROOT,
                    shared.file
                )
            );

        } else {

            writeWithBackup(
                shared.file,
                shared.content
            );

            console.log(
                "WROTE SHARED:",
                path.relative(
                    ROOT,
                    shared.file
                )
            );

        }

    }

    /* ======================================================
       HTML FILES
    ====================================================== */

    const htmlFiles =
        findHTMLFiles(BOOKS_DIR);

    let updated = 0;
    let unchanged = 0;
    let skipped = 0;

    for (const file of htmlFiles) {

        const original =
            fs.readFileSync(file, "utf8");

        const result =
            updateHTML(original);

        const relative =
            path.relative(ROOT, file);

        if (
            result.reason ===
            "No recognized navbar"
        ) {

            console.log(
                "SKIPPED:",
                relative
            );

            skipped++;

            continue;
        }

        if (!result.changed) {

            console.log(
                "ALREADY UPDATED:",
                relative
            );

            unchanged++;

            continue;
        }

        if (DRY_RUN) {

            console.log(
                "WOULD UPDATE:",
                relative
            );

        } else {

            backupFile(file);

            fs.writeFileSync(
                file,
                result.html,
                "utf8"
            );

            console.log(
                "UPDATED:",
                relative
            );

        }

        updated++;

    }

    /* ======================================================
       FINAL REPORT
    ====================================================== */

    console.log("");
    console.log("====================================");
    console.log("CODEVERSE NAVBAR UPDATE COMPLETE");
    console.log("====================================");

    console.log(
        "Total HTML files:",
        htmlFiles.length
    );

    console.log(
        DRY_RUN
            ? "Would update:"
            : "Updated:",
        updated
    );

    console.log(
        "Already updated:",
        unchanged
    );

    console.log(
        "Skipped:",
        skipped
    );

    console.log(
        "Backup suffix:",
        BACKUP_SUFFIX
    );

    console.log("====================================");

    if (DRY_RUN) {

        console.log(
            "Preview complete. Run without --dry-run to apply."
        );

    } else {

        console.log(
            "Review the website locally before deploying."
        );

    }

}

main();

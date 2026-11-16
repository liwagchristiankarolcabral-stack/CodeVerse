
/* ==========================================
   CODEVERSE - COMPLETE BOOK PASSKEY SYSTEM
   Supports Books 1–30

   1st Year IT: Books 11–20
   2nd Year IT: Books 21–30
   3rd Year IT: Books 1–10

   FEATURES:
   - Year-level passkey protection
   - Server-side session verification
   - Automatic opening of unlocked books
   - Secure book URL validation
   - Four-digit passkey validation
   - Show / hide passkey
   - Loading and error messages
   - Works with dynamically generated books
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* ======================================
       1. ELEMENT REFERENCES
    ====================================== */

    const modal =
        document.getElementById("bookLockModal");

    const form =
        document.getElementById("bookLockForm");

    const input =
        document.getElementById("bookPasskey");

    const message =
        document.getElementById("bookLockMessage");

    const unlockButton =
        document.getElementById("unlockBookButton");

    const closeButton =
        document.getElementById("closeBookLock");

    const description =
        document.getElementById("bookLockDescription");

    const titleElement =
        document.getElementById("bookLockTitle");

    const showPasskey =
        document.getElementById("showBookPasskey");

    /* ======================================
       2. VALIDATE HTML ELEMENTS
    ====================================== */

    if (
        !modal ||
        !form ||
        !input ||
        !message ||
        !unlockButton ||
        !closeButton ||
        !description
    ) {

        console.error(
            "CodeVerse: Missing book passkey HTML elements."
        );

        return;
    }

    /* ======================================
       3. BOOK CONFIGURATION
    ====================================== */

    const yearLevels = {

        1: {
            name: "1st Year IT",
            subject: "Introduction to Computing",
            bookIds: [
                11, 12, 13, 14, 15,
                16, 17, 18, 19, 20
            ]
        },

        2: {
            name: "2nd Year IT",
            subject: "Platform Technologies",
            bookIds: [
                21, 22, 23, 24, 25,
                26, 27, 28, 29, 30
            ]
        },

        3: {
            name: "3rd Year IT",
            subject: "Web Technologies",
            bookIds: [
                1, 2, 3, 4, 5,
                6, 7, 8, 9, 10
            ]
        }

    };

    /* ======================================
       4. APPLICATION STATE
    ====================================== */

    let selectedBookId = null;

    let selectedYear = null;

    let isChecking = false;

    let isOpeningBook = false;

    const unlockedYears = new Set();

    /* ======================================
       5. GET YEAR FROM BOOK ID
    ====================================== */

    function getYearFromBookId(bookId) {

        const id = Number(bookId);

        if (!Number.isInteger(id)) {
            return null;
        }

        for (const [year, collection] of
            Object.entries(yearLevels)) {

            if (collection.bookIds.includes(id)) {
                return Number(year);
            }

        }

        return null;
    }

    /* ======================================
       6. DISPLAY MESSAGE
    ====================================== */

    function showMessage(text, isError = true) {

        message.textContent = text;

        message.style.color = isError
            ? "#dc3545"
            : "#198754";
    }

    function clearMessage() {

        message.textContent = "";

    }

    /* ======================================
       7. LOADING STATE
    ====================================== */

    function setLoading(loading) {

        isChecking = loading;

        unlockButton.disabled = loading;

        unlockButton.textContent = loading
            ? "Checking Passkey..."
            : "Unlock Collection";

    }

    /* ======================================
       8. CLOSE MODAL
    ====================================== */

    function closeModal() {

        if (isChecking) {
            return;
        }

        modal.hidden = true;

        selectedBookId = null;

        selectedYear = null;

        form.reset();

        input.type = "password";

        if (showPasskey) {
            showPasskey.checked = false;
        }

        clearMessage();

    }

    /* ======================================
       9. OPEN MODAL
    ====================================== */

    function openModal(bookId, bookTitle) {

        const year = getYearFromBookId(bookId);

        if (!year) {

            console.error(
                "CodeVerse: Invalid book ID:",
                bookId
            );

            return;
        }

        const collection = yearLevels[year];

        selectedBookId = bookId;

        selectedYear = year;

        form.reset();

        input.type = "password";

        if (showPasskey) {
            showPasskey.checked = false;
        }

        clearMessage();

        if (titleElement) {

            titleElement.textContent =
                `${collection.name} Access Required`;

        }

        description.textContent =
            `Enter your 4-digit passkey to unlock ` +
            `${collection.subject} and open "${bookTitle}". ` +
            `Unlocking another year level will automatically ` +
            `lock this collection again.`;

        modal.hidden = false;

        input.focus();

    }

    /* ======================================
       10. UPDATE ACCESS INDICATORS
    ====================================== */

    function updateAccessIndicators() {

        document.querySelectorAll(
            ".cv-access-status[data-access-year]"
        ).forEach(element => {

            const year = Number(
                element.dataset.accessYear
            );

            element.textContent =
                unlockedYears.has(year)
                    ? "🔓 Unlocked"
                    : "🔒 Protected";

        });

        window.dispatchEvent(
            new CustomEvent(
                "codeverse:access-updated"
            )
        );

    }

    /* ======================================
       11. REFRESH ACCESS STATUS
    ====================================== */

    async function refreshAccessStatus() {

        try {

            const response = await fetch(
                "/api/books/access-status",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

            
if (response.status === 401) {

    // Confirm whether the login session has expired.
    const authResponse = await fetch(
        "/api/auth/status",
        {
            credentials: "same-origin",
            cache: "no-store"
        }
    );

    if (!authResponse.ok) {
        throw new Error(
            "Unable to verify your login session."
        );
    }

    const authData = await authResponse.json();

    if (!authData.loggedIn) {
        window.location.assign("/LogIn.html");
        return;
    }

    // A logged-in user should see the actual
    // passkey error instead of being redirected.
    throw new Error(
        result.message ||
        "Unable to unlock the collection."
    );
}


            if (!response.ok) {

                throw new Error(
                    "Unable to retrieve collection access."
                );

            }

            const result = await response.json();

            unlockedYears.clear();

            if (Array.isArray(result.unlockedYears)) {

                result.unlockedYears.forEach(year => {

                    const number = Number(year);

                    if (yearLevels[number]) {
                        unlockedYears.add(number);
                    }

                });

            }

            updateAccessIndicators();

            return true;

        } catch (error) {

            console.error(
                "CodeVerse access status error:",
                error
            );

            return false;

        }

    }

    /* ======================================
       12. VALIDATE BOOK URL
    ====================================== */

    function validateBookUrl(bookUrl) {

        if (
            typeof bookUrl !== "string" ||
            !bookUrl.trim()
        ) {

            throw new Error(
                "The server did not provide a book URL."
            );

        }

        const redirectUrl = new URL(
            bookUrl,
            window.location.origin
        );

        if (
            redirectUrl.origin !== window.location.origin
        ) {

            throw new Error(
                "Invalid book destination."
            );

        }

        return redirectUrl.href;

    }

    /* ======================================
       13. GET BOOK ACCESS FROM SERVER
    ====================================== */

    async function getBookAccess(bookId) {

        const response = await fetch(
            `/api/books/open/${bookId}`,
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {

            throw new Error(
                "The server returned an unexpected response."
            );

        }

        const result = await response.json();

        console.log(
            "CodeVerse book access response:",
            result
        );

        /* ==================================
           LOGIN REQUIRED
        ================================== */

        if (response.status === 401) {

            window.location.assign(
                "/LogIn.html"
            );

            return null;
        }

        /* ==================================
           PASSKEY REQUIRED
        ================================== */

        if (
            result.requiresPasskey === true
        ) {

            return {
                requiresPasskey: true
            };

        }

        /* ==================================
           SERVER ERROR
        ================================== */

        if (
            !response.ok ||
            result.success !== true
        ) {

            throw new Error(
                result.message ||
                "Unable to open the selected book."
            );

        }

        /* ==================================
           SUCCESSFUL BOOK ACCESS
        ================================== */

        const redirectUrl = validateBookUrl(
            result.redirectUrl
        );

        return {
            requiresPasskey: false,
            redirectUrl: redirectUrl
        };

    }

    /* ======================================
       14. OPEN BOOK
    ====================================== */

    async function openBook(bookId, bookTitle) {

        if (isOpeningBook) {
            return;
        }

        const year = getYearFromBookId(bookId);

        if (!year) {

            console.error(
                "CodeVerse: Invalid book ID:",
                bookId
            );

            return;
        }

        isOpeningBook = true;

        try {

            const access = await getBookAccess(
                bookId
            );

            if (!access) {
                return;
            }

            /* ==================================
               PASSKEY REQUIRED
            ================================== */

            if (access.requiresPasskey) {

                openModal(bookId, bookTitle);

                return;
            }

            /* ==================================
               ACCESS GRANTED
        ================================== */

            if (access.redirectUrl) {

                unlockedYears.clear();
                unlockedYears.add(year);

                updateAccessIndicators();

                window.location.assign(
                    access.redirectUrl
                );

            }

        } catch (error) {

            console.error(
                "CodeVerse open book error:",
                error
            );

            alert(
                error.message ||
                "Unable to open the selected book."
            );

        } finally {

            isOpeningBook = false;

        }

    }

    /* ======================================
       15. READ BOOK BUTTONS
    ====================================== */

    document.addEventListener("click", event => {

        const readButton = event.target.closest(
            ".read-book-btn[data-book-id]"
        );

        if (!readButton) {
            return;
        }

        event.preventDefault();

        const bookId = Number(
            readButton.dataset.bookId
        );

        if (!Number.isInteger(bookId)) {

            console.error(
                "CodeVerse: Invalid book ID."
            );

            return;
        }

        const card =
            readButton.closest(".book-card");

        const bookTitle =
            card?.querySelector("h3")
                ?.textContent?.trim() ||
            `Book ${bookId}`;

        openBook(bookId, bookTitle);

    });

    /* ======================================
       16. CLOSE MODAL BUTTON
    ====================================== */

    closeButton.addEventListener("click", () => {

        closeModal();

    });

    /* ======================================
       17. CLICK OUTSIDE MODAL
    ====================================== */

    modal.addEventListener("click", event => {

        if (event.target === modal) {

            closeModal();

        }

    });

    /* ======================================
       18. ESCAPE KEY
    ====================================== */

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            !modal.hidden
        ) {

            closeModal();

        }

    });

    /* ======================================
       19. SHOW / HIDE PASSKEY
    ====================================== */

    if (showPasskey) {

        showPasskey.addEventListener("change", () => {

            input.type = showPasskey.checked
                ? "text"
                : "password";

        });

    }

    /* ======================================
       20. NUMERIC INPUT VALIDATION
    ====================================== */

    input.addEventListener("input", () => {

        input.value = input.value
            .replace(/\D/g, "")
            .slice(0, 4);

        clearMessage();

    });

    /* ======================================
       21. VERIFY YEAR-LEVEL PASSKEY
    ====================================== */

    form.addEventListener("submit", async event => {

        event.preventDefault();

        if (isChecking) {
            return;
        }

        if (
            selectedBookId === null ||
            selectedYear === null
        ) {

            showMessage(
                "Please select a valid book."
            );

            return;
        }

        const passkey = input.value.trim();

        if (!/^[0-9]{4}$/.test(passkey)) {

            showMessage(
                "Please enter a valid 4-digit passkey."
            );

            input.focus();

            return;
        }

        setLoading(true);

        clearMessage();

        try {

            /* ==================================
               SEND PASSKEY TO SERVER
            ================================== */

            const response = await fetch(
                "/api/books/unlock",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "same-origin",

                    body: JSON.stringify({
                        year: selectedYear,
                        bookId: selectedBookId,
                        passkey: passkey
                    })
                }
            );

            const contentType =
                response.headers.get("content-type") || "";

            if (!contentType.includes("application/json")) {

                throw new Error(
                    `Unexpected server response (${response.status}).`
                );

            }

            const result = await response.json();

            console.log(
                "CodeVerse unlock response:",
                result
            );

            /* ==================================
               LOGIN REQUIRED
            ================================== */

            if (response.status === 401) {

                window.location.assign(
                    "/LogIn.html"
                );

                return;
            }

            /* ==================================
               INVALID PASSKEY
            ================================== */

            if (
                !response.ok ||
                result.success !== true
            ) {

                throw new Error(
                    result.message ||
                    "Unable to unlock this collection."
                );

            }

            /* ==================================
               PASSKEY VERIFIED
            ================================== */

            unlockedYears.clear();
            unlockedYears.add(selectedYear);

            updateAccessIndicators();

            showMessage(
                "Collection unlocked successfully! Opening your book...",
                false
            );

            /* ==================================
               REQUEST ACTUAL BOOK URL

               IMPORTANT:
               /api/books/unlock may not
               return redirectUrl.

               We request it separately from
               /api/books/open/:bookId.
            ================================== */

            const access = await getBookAccess(
                selectedBookId
            );

            if (!access) {
                return;
            }

            if (access.requiresPasskey) {

                throw new Error(
                    "The server still requires a passkey. Please try again."
                );

            }

            if (!access.redirectUrl) {

                throw new Error(
                    "The server did not provide a book URL."
                );

            }

            /* ==================================
               OPEN PROTECTED BOOK
            ================================== */

            window.location.assign(
                access.redirectUrl
            );

        } catch (error) {

            console.error(
                "CodeVerse unlock error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to connect to the server."
            );

            input.focus();

        } finally {

            setLoading(false);

        }

    });

    /* ======================================
       22. INITIALIZE ACCESS STATUS
    ====================================== */

    refreshAccessStatus();

    console.log(
        "CodeVerse book passkey system ready."
    );

});


/* ==========================================
   CODEVERSE - EXPLORE BOOKS
   SINGLE ACTIVE YEAR-LEVEL ACCESS
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    
const collections = {
    1: {
        name: "1st Year IT",
        subject: "Introduction to Computing",
        ids: [11,12,13,14,15,16,17,18,19,20],
        icon: "📘"
    },
    2: {
        name: "2nd Year IT",
        subject: "Platform Technologies",
        ids: [21,22,23,24,25,26,27,28,29,30],
        icon: "💻"
    },
    3: {
        name: "3rd Year IT",
        subject: "Web Technologies",
        ids: [1,2,3,4,5,6,7,8,9,10],
        icon: "🌐"
    }
};

const bookTitles = {
    // 1ST YEAR IT
    11: "The History of Computers and Computing Systems",
    12: "Computer Generations and System Classifications",
    13: "Computer Hardware and Software Fundamentals",
    14: "The IPOS Cycle: Input, Processing, Output, and Storage",
    15: "Data, Information, and Number Systems",
    16: "Operating System Fundamentals",
    17: "Programs and Processes of Computer",
    18: "Computer Networks and the Internet",
    19: "Cybersecurity, Privacy, and Computer Ethics",
    20: "Emerging Technologies and Artificial Intelligence",

    // 2ND YEAR IT
    21: "Command-Line Interfaces and System Utilities",
    22: "Computer System Platforms and Architecture",
    23: "Deadlocks and Resource Allocation",
    24: "Device and Input/Output Management",
    25: "File Systems and Storage Management",
    26: "Memory Management and Virtual Memory",
    27: "Mobile and Application Platforms",
    28: "Operating System Concepts and Functions",
    29: "Processes, Threads, and Process Scheduling",
    30: "Virtualization and Virtual Machines",

    // 3RD YEAR IT
    1: "Internet Fundamentals",
    2: "Web, Server, and HTTP/HTTPS",
    3: "HTML Structure and Semantic Elements",
    4: "CSS Styling, Layout, Flexbox, and Grid",
    5: "JavaScript Fundamentals and DOM Manipulation",
    6: "Responsive Web Design",
    7: "Forms and Input Validation",
    8: "User Interface Design and Accessibility",
    9: "Authentication, Authorization, and Web Security",
    10: "Website Testing, Hosting, Deployment, and Maintenance"
};


    const modal = document.getElementById("bookLockModal");
    const form = document.getElementById("bookLockForm");
    const input = document.getElementById("bookPasskey");
    const message = document.getElementById("bookLockMessage");
    const title = document.getElementById("bookLockTitle");
    const description = document.getElementById("bookLockDescription");
    const closeButton = document.getElementById("closeBookLock");
    const unlockButton = document.getElementById("unlockBookButton");
    const showPasskey = document.getElementById("showBookPasskey");
    const activeAccess = document.getElementById("activeAccess");

    let activeYear = null;
    let requestedYear = null;
    let requestedBookId = null;
    let busy = false;

    function getYear(bookId) {
        return Object.keys(collections)
            .map(Number)
            .find(year => collections[year].ids.includes(bookId))
            || null;
    }

    function createCards() {
        for (const [year, collection] of Object.entries(collections)) {
            const grid = document.getElementById(`year${year}Books`);
            if (!grid) continue;

            grid.replaceChildren();

            collection.ids.forEach((bookId, index) => {
                const card = document.createElement("article");
                card.className = "library-book-card book-card";

                /* ==========================================
                BOOK COVER IMAGE CONTAINER
                ========================================== */

                const cover = document.createElement("div");
                cover.className = "library-book-cover";

                const coverImage = document.createElement("img");
                coverImage.className = "library-book-cover-image";

                // Each book uses its own cover image.
                coverImage.src = `/images/book-covers/book-${bookId}.jpg`;

                coverImage.alt =
                    `Cover of ${bookTitles[bookId] || `Book ${bookId}`}`;

                coverImage.loading = "lazy";

                // Use a placeholder when the cover is missing.
                coverImage.onerror = function () {
                    this.onerror = null;
                    this.src = "/images/book-covers/placeholder.svg";
                };

                cover.appendChild(coverImage);

                const info = document.createElement("div");
                info.className = "library-book-info";

                const number = document.createElement("span");
                number.className = "library-book-number";
                number.textContent = `BOOK ${String(index + 1).padStart(2, "0")}`;

                const heading = document.createElement("h3");
                heading.textContent = bookTitles[bookId] || `Book ${bookId}`;

                const summary = document.createElement("p");
                summary.textContent = collection.subject;

                const button = document.createElement("button");
                button.type = "button";
                button.className = "library-read-btn read-book-btn";
                button.dataset.bookId = String(bookId);
                button.textContent = "Read Book";

                info.append(number, heading, summary, button);
                card.append(cover, info);
                grid.appendChild(card);
            });
        }
    }

    function updateIndicators() {
        document.querySelectorAll("[data-access-year]").forEach(element => {
            const year = Number(element.dataset.accessYear);
            element.textContent =
                year === activeYear ? "🔓 Unlocked" : "🔒 Protected";
        });

        document.querySelectorAll("[data-unlock-year]").forEach(button => {
            const year = Number(button.dataset.unlockYear);
            button.textContent =
                year === activeYear ? "Collection Unlocked" : "Unlock Collection";
        });

        activeAccess.textContent = activeYear
            ? `🔓 ${collections[activeYear].name} Active`
            : "🔒 No collection unlocked";
    }

    async function requestJSON(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            cache: "no-store",
            ...options
        });

        const result = await response.json().catch(() => ({}));

        if (response.status === 401 &&
            url !== "/api/books/unlock") {
            window.location.assign("/LogIn.html");
            return null;
        }

        return { response, result };
    }

    async function refreshAccess() {
        try {
            const data = await requestJSON("/api/books/access-status");
            if (!data) return;

            if (!data.response.ok) {
                throw new Error("Unable to check access status.");
            }

            const years = data.result.unlockedYears || [];
            activeYear = years.length ? Number(years[0]) : null;
            updateIndicators();
        } catch (error) {
            console.error(error);
            activeYear = null;
            updateIndicators();
        }
    }

    function openModal(year, bookId = null) {
        if (!collections[year]) return;

        requestedYear = year;
        requestedBookId = bookId;

        title.textContent = `${collections[year].name} Access Required`;

        description.textContent =
            `Enter your 4-digit passkey to unlock ` +
            `${collections[year].subject}. ` +
            `Any previously unlocked year level will be locked.`;

        form.reset();
        input.type = "password";
        message.textContent = "";
        modal.hidden = false;
        input.focus();
    }

    function closeModal() {
        if (busy) return;

        modal.hidden = true;
        requestedYear = null;
        requestedBookId = null;
        form.reset();
        input.type = "password";
        message.textContent = "";
    }

    function showError(text) {
        message.textContent = text;
        message.style.color = "#dc3545";
    }

    function setBusy(value) {
        busy = value;
        unlockButton.disabled = value;
        unlockButton.textContent = value
            ? "Verifying Passkey..."
            : "Unlock Collection";
    }

    async function openBook(bookId) {
        if (busy) return;

        const year = getYear(bookId);
        if (!year) return;

        try {
            const data = await requestJSON(`/api/books/open/${bookId}`);
            if (!data) return;

            if (data.response.status === 403 &&
                data.result.requiresPasskey) {
                activeYear = null;
                updateIndicators();
                openModal(year, bookId);
                return;
            }

            if (!data.response.ok || !data.result.success) {
                throw new Error(
                    data.result.message || "Unable to open book."
                );
            }

            const destination = new URL(
                data.result.redirectUrl,
                window.location.origin
            );

            if (destination.origin !== window.location.origin ||
                destination.pathname !== `/cover/${bookId}`) {
                throw new Error("Invalid book destination.");
            }

            window.location.assign(destination.href);

        } catch (error) {
            alert(error.message);
        }
    }

    document.addEventListener("click", event => {
        const readButton = event.target.closest(
            ".read-book-btn[data-book-id]"
        );

        if (readButton) {
            event.preventDefault();
            openBook(Number(readButton.dataset.bookId));
            return;
        }

        const yearButton = event.target.closest(
            "[data-unlock-year]"
        );

        if (yearButton) {
            event.preventDefault();

            const year = Number(yearButton.dataset.unlockYear);

            if (year !== activeYear) {
                openModal(year);
            }
        }
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (busy || !requestedYear) return;

        const passkey = input.value.trim();

        if (!/^\d{4}$/.test(passkey)) {
            showError("Enter a valid 4-digit passkey.");
            return;
        }

        setBusy(true);
        message.textContent = "";

        try {
            const body = {
                year: requestedYear,
                passkey
            };

            if (requestedBookId !== null) {
                body.bookId = requestedBookId;
            }

            const data = await requestJSON("/api/books/unlock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!data) return;

            if (!data.response.ok || !data.result.success) {
                throw new Error(
                    data.result.message || "Incorrect passkey."
                );
            }

            const bookToOpen = requestedBookId;

            activeYear = Number(requestedYear);
            updateIndicators();

            closeModalAfterSuccess();

            if (bookToOpen !== null) {
                await openBook(bookToOpen);
            }

        } catch (error) {
            showError(error.message);
        } finally {
            setBusy(false);
        }
    });

    function closeModalAfterSuccess() {
        modal.hidden = true;
        requestedYear = null;
        requestedBookId = null;
        form.reset();
        input.type = "password";
        message.textContent = "";
    }

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    showPasskey.addEventListener("change", () => {
        input.type = showPasskey.checked ? "text" : "password";
    });

    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 4);
        message.textContent = "";
    });

    // Theme support
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    function updateTheme() {
        const dark = document.body.classList.contains("dark-mode");
        themeIcon.textContent = dark ? "☀" : "☾";
    }

    if (localStorage.getItem("readerTheme") === "dark") {
        document.body.classList.add("dark-mode");
    }

    updateTheme();

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        localStorage.setItem(
            "readerTheme",
            document.body.classList.contains("dark-mode")
                ? "dark"
                : "light"
        );

        updateTheme();
    });

    // Mobile navigation
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    menuToggle.addEventListener("click", () => {
        const opened = navLinks.classList.toggle("show");
        menuToggle.setAttribute("aria-expanded", String(opened));
    });

    createCards();
    updateIndicators();
    refreshAccess();

});

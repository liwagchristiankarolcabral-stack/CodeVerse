
/* ==========================================
   CODEVERSE - YEAR-LEVEL COLLECTIONS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const browseButtons =
        document.querySelectorAll(".cv-browse-btn");

    const selectedCollection =
        document.getElementById("selectedCollection");

    const selectedYearTitle =
        document.getElementById("selectedYearTitle");

    const selectedYearDescription =
        document.getElementById("selectedYearDescription");

    const bookGrid =
        document.getElementById("bookGrid");

    const closeCollection =
        document.getElementById("closeCollection");

    if (
        !selectedCollection ||
        !selectedYearTitle ||
        !selectedYearDescription ||
        !bookGrid
    ) {
        console.error(
            "CodeVerse: Missing collection HTML elements."
        );
        return;
    }

    /* ==========================================
       BOOK COVER DIRECTORY
    ========================================== */

    const COVER_DIRECTORY = "/images/book-covers/";
    const DEFAULT_COVER =
        COVER_DIRECTORY + "placeholder.svg";

    function getBookCover(bookId) {
        return `${COVER_DIRECTORY}book-${bookId}.jpg`;
    }

    /* ==========================================
       YEAR LEVELS
    ========================================== */

    const yearLevels = {
        1: {
            title: "1st Year IT",
            subject: "Introduction to Computing",
            bookIds: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        },

        2: {
            title: "2nd Year IT",
            subject: "Platform Technologies",
            bookIds: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
        },

        3: {
            title: "3rd Year IT",
            subject: "Web Technologies",
            bookIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }
    };

    /* ==========================================
       BOOK TITLES
    ========================================== */

    const bookTitles = {

        // FIRST YEAR IT
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

        // SECOND YEAR IT
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

        // THIRD YEAR IT
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

    /* ==========================================
       CREATE BOOK CARD
    ========================================== */

    function createBookCard(bookId) {

        const title =
            bookTitles[bookId] || `Book ${bookId}`;

        const card = document.createElement("article");
        card.className = "book-card";

        const bookCover = document.createElement("div");
        bookCover.className = "book-cover-container";

        const coverImage = document.createElement("img");
        coverImage.className = "book-cover-image";

        coverImage.src = getBookCover(bookId);
        coverImage.alt = `Cover of ${title}`;
        coverImage.loading = "lazy";
        coverImage.decoding = "async";

        coverImage.onerror = function () {

            console.warn(
                `CodeVerse: Cover missing for Book ${bookId}`,
                this.src
            );

            this.onerror = null;
            this.src = DEFAULT_COVER;
        };

        bookCover.appendChild(coverImage);

        const heading = document.createElement("h3");
        heading.textContent = title;

        const readButton = document.createElement("button");
        readButton.type = "button";
        readButton.className = "read-book-btn";
        readButton.dataset.bookId = String(bookId);
        readButton.textContent = "Read Book";

        const bookInfo = document.createElement("div");
        bookInfo.className = "book-info";

        bookInfo.append(heading, readButton);

        card.append(bookCover, bookInfo);

        return card;
    }

    /* ==========================================
       DISPLAY COLLECTION
    ========================================== */

    function showCollection(year) {

        const collection = yearLevels[year];

        if (!collection) {
            console.error("Invalid year:", year);
            return;
        }

        selectedYearTitle.textContent =
            `${collection.title} — ${collection.subject}`;

        selectedYearDescription.textContent =
            `Explore the ${collection.bookIds.length} e-books available in ${collection.subject}.`;

        const fragment = document.createDocumentFragment();

        collection.bookIds.forEach(bookId => {
            fragment.appendChild(createBookCard(bookId));
        });

        bookGrid.replaceChildren(fragment);

        selectedCollection.hidden = false;

        console.log(
            "CodeVerse collection displayed:",
            collection.title,
            "Books:",
            bookGrid.children.length
        );

        selectedCollection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /* ==========================================
       BROWSE BUTTONS
    ========================================== */

    document.addEventListener("click", event => {

        const button = event.target.closest(
            ".cv-browse-btn[data-year]"
        );

        if (!button) return;

        event.preventDefault();

        const year = Number(button.dataset.year);

        showCollection(year);
    });

    /* ==========================================
       CLOSE COLLECTION
    ========================================== */

    if (closeCollection) {

        closeCollection.addEventListener("click", () => {
            selectedCollection.hidden = true;
        });
    }

    console.log(
        "CodeVerse Browse system ready.",
        "Buttons found:",
        browseButtons.length
    );

});


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

    // Check required HTML elements
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

    function showCollection(year) {

        const collection = yearLevels[year];

        if (!collection) {
            console.error("Invalid year:", year);
            return;
        }

        selectedYearTitle.textContent =
            collection.title + " — " + collection.subject;

        selectedYearDescription.textContent =
            "Explore the 10 e-books available in " +
            collection.subject + ".";

        bookGrid.replaceChildren();

        collection.bookIds.forEach(bookId => {

            const card = document.createElement("article");
            card.className = "book-card";

            const heading = document.createElement("h3");
            heading.textContent = "Book " + bookId;

            const readButton = document.createElement("button");
            readButton.type = "button";
            readButton.className = "read-book-btn";
            readButton.dataset.bookId = String(bookId);
            readButton.textContent = "Read Book";

            const bookInfo = document.createElement("div");
            bookInfo.className = "book-info";

            bookInfo.append(heading, readButton);
            card.appendChild(bookInfo);

            bookGrid.appendChild(card);

        });

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

    // Event delegation supports the existing buttons
    document.addEventListener("click", event => {

        const button = event.target.closest(
            ".cv-browse-btn[data-year]"
        );

        if (!button) return;

        event.preventDefault();

        const year = Number(button.dataset.year);

        showCollection(year);

    });

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

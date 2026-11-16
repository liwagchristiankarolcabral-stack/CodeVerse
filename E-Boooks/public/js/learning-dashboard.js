
/* ==========================================================
   CODEVERSE - PERSONAL LEARNING DASHBOARD
   READING HISTORY, QUIZ RESULTS AND SECURE DOWNLOAD

   FEATURES:
   - Displays actual book titles instead of book numbers
   - Groups books by year level
   - Reading history
   - Completed books
   - Quiz results
   - Average quiz score
   - Secure download with passkey
   - Refresh learning progress
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* ======================================================
       HELPERS
    ====================================================== */

    const $ = id => document.getElementById(id);

    const dateText = value =>
        value
            ? new Date(value).toLocaleString()
            : "—";

    const create = (tag, className, value) => {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (value != null) {
            element.textContent = value;
        }

        return element;
    };

    /* ======================================================
       COMPLETE CODEVERSE BOOK TITLE CATALOG

       IMPORTANT:
       Keep the existing numeric IDs because your backend
       uses them for reading, downloads and quiz results.
    ====================================================== */

    const BOOK_TITLES = {

        /* ==============================================
           1ST YEAR IT
           BOOK IDs: 11 - 20
        ============================================== */

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


        /* ==============================================
           2ND YEAR IT
           BOOK IDs: 21 - 30
        ============================================== */

        21: "Command Line Fundamentals",

        22: "Computer Platforms",

        23: "Deadlock",

        24: "Device and I/O Management",

        25: "File Systems",

        26: "Memory Management",

        27: "Mobile and Application Development",

        28: "Operating System Services",

        29: "Processes, Threads, and Synchronization",

        30: "Virtualization",


        /* ==============================================
           3RD YEAR IT
           BOOK IDs: 1 - 10
        ============================================== */

        1: "Internet Fundamentals",

        2: "HTML Structure and Semantic Elements",

        3: "CSS Styling, Layout, Flexbox, and Grid",

        4: "JavaScript Fundamentals and DOM Manipulation",

        5: "Forms and Input Validation",

        6: "Responsive Web Design",

        7: "User Interface Design and Accessibility",

        8: "Authentication, Authorization, and Web Security",

        9: "Web Browsers, Servers, and HTTP/HTTPS",

        10: "Website Testing, Hosting, Deployment, and Maintenance"

    };

    /* ======================================================
       YEAR LEVEL HELPERS
    ====================================================== */

    const yearFor = id => {

        id = Number(id);

        if (id >= 11 && id <= 20) {
            return 1;
        }

        if (id >= 21 && id <= 30) {
            return 2;
        }

        return 3;
    };

    const yearLabel = year => {

        const suffix =
            year === 1
                ? "st"
                : year === 2
                    ? "nd"
                    : "rd";

        return `${year}${suffix} Year IT`;
    };

    /* ======================================================
       BOOK TITLE HELPER
    ====================================================== */

    const titleFor = id => {

        id = Number(id);

        // Use the central catalog first.
        if (BOOK_TITLES[id]) {
            return BOOK_TITLES[id];
        }

        // Fallback to a matching book card.
        const book = document.querySelector(
            `[data-book-id="${id}"]`
        );

        const title = book
            ?.querySelector(
                ".book-title, .library-book-title, h3, h4"
            )
            ?.textContent
            ?.trim();

        return title || `Book ${id}`;
    };

    /* ======================================================
       DOWNLOAD BOOK DROPDOWN
    ====================================================== */

    const bookSelect = $("downloadBookSelect");

    if (bookSelect) {

        // Remove existing Book 1, Book 2, etc.
        bookSelect.replaceChildren();

        const yearGroups = [

            {
                year: 1,
                start: 11,
                end: 20
            },

            {
                year: 2,
                start: 21,
                end: 30
            },

            {
                year: 3,
                start: 1,
                end: 10
            }

        ];

        yearGroups.forEach(groupData => {

            const group =
                document.createElement("optgroup");

            group.label =
                yearLabel(groupData.year);

            for (
                let id = groupData.start;
                id <= groupData.end;
                id++
            ) {

                const option =
                    document.createElement("option");

                // Preserve the original backend ID.
                option.value = String(id);

                // Display the actual title.
                option.textContent = titleFor(id);

                group.appendChild(option);

            }

            bookSelect.appendChild(group);

        });

    }

    /* ======================================================
       DOWNLOAD MODAL ELEMENTS
    ====================================================== */

    const modal = $("downloadModal");

    const downloadMessage =
        $("downloadMessage");

    const form = $("downloadForm");

    let downloadingId = null;

    /* ======================================================
       OPEN DOWNLOAD MODAL
    ====================================================== */

    function openDownload(id) {

        id = Number(id);

        if (!Number.isInteger(id) || id < 1) {
            return;
        }

        if (!modal || !form) {
            return;
        }

        downloadingId = id;

        const bookName =
            $("downloadBookName");

        if (bookName) {

            bookName.textContent =
                `${titleFor(id)} · ` +
                `${yearLabel(yearFor(id))}. ` +
                `Enter this collection's four-digit ` +
                `passkey to download.`;

        }

        form.reset();

        if (downloadMessage) {
            downloadMessage.textContent = "";
        }

        modal.hidden = false;

        const passkeyInput =
            $("downloadPasskey");

        if (passkeyInput) {
            passkeyInput.focus();
        }

    }

    /* ======================================================
       CLOSE DOWNLOAD MODAL
    ====================================================== */

    function closeDownload() {

        if (!modal || !form) {
            return;
        }

        modal.hidden = true;

        downloadingId = null;

        form.reset();

        if (downloadMessage) {
            downloadMessage.textContent = "";
        }

    }

    /* ======================================================
       DOWNLOAD BUTTON
    ====================================================== */

    const downloadSelectedButton =
        $("downloadSelectedBook");

    if (downloadSelectedButton && bookSelect) {

        downloadSelectedButton.addEventListener(
            "click",
            () => {

                const id =
                    Number(bookSelect.value);

                openDownload(id);

            }
        );

    }

    /* ======================================================
       MODAL CLOSE EVENTS
    ====================================================== */

    const closeDownloadButton =
        $("closeDownloadModal");

    if (closeDownloadButton) {

        closeDownloadButton.addEventListener(
            "click",
            closeDownload
        );

    }

    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {
                    closeDownload();
                }

            }
        );

    }

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal &&
                !modal.hidden
            ) {

                closeDownload();

            }

        }
    );

    /* ======================================================
       SECURE BOOK DOWNLOAD
    ====================================================== */

    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                if (!downloadingId) {
                    return;
                }

                const id = downloadingId;

                const button =
                    $("confirmDownload");

                if (button) {
                    button.disabled = true;
                }

                if (downloadMessage) {

                    downloadMessage.textContent =
                        "Verifying passkey...";

                }

                try {

                    const response = await fetch(
                        `/api/books/${id}/download`,
                        {
                            method: "POST",

                            credentials: "same-origin",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                passkey:
                                    $("downloadPasskey").value
                            })
                        }
                    );

                    if (!response.ok) {

                        const error = await response
                            .json()
                            .catch(() => ({}));

                        throw new Error(
                            error.message ||
                            `Download failed (${response.status}).`
                        );

                    }

                    const blob =
                        await response.blob();

                    const url =
                        URL.createObjectURL(blob);

                    const anchor =
                        document.createElement("a");

                    anchor.href = url;

                    // Preserve original download filename.
                    anchor.download =
                        `CodeVerse-Book-${id}.html`;

                    document.body.appendChild(anchor);

                    anchor.click();

                    anchor.remove();

                    setTimeout(
                        () => URL.revokeObjectURL(url),
                        30000
                    );

                    closeDownload();

                } catch (error) {

                    if (downloadMessage) {

                        downloadMessage.textContent =
                            error.message;

                    }

                } finally {

                    if (button) {
                        button.disabled = false;
                    }

                }

            }
        );

    }

    /* ======================================================
       API JSON HELPER
    ====================================================== */

    async function getJSON(url) {

        const response = await fetch(
            url,
            {
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        const data = await response
            .json()
            .catch(() => ({}));

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                `Unable to load (${response.status}).`
            );

        }

        return data;
    }

    /* ======================================================
       CREATE READING HISTORY ROW
    ====================================================== */

    function readingRow(book) {

        const id =
            Number(book.bookId);

        const row = create(
            "article",
            "cv-learning-item"
        );

        const info = create(
            "div",
            "cv-learning-item-info"
        );

        /* BOOK TITLE */

        info.append(
            create(
                "strong",
                "",
                titleFor(id)
            )
        );

        /* YEAR LEVEL AND LAST OPENED */

        info.append(
            create(
                "small",
                "",
                `${yearLabel(yearFor(id))} · ` +
                `Last opened: ` +
                `${dateText(book.lastOpenedAt)}`
            )
        );

        /* READING STATUS */

        info.append(
            create(
                "span",
                book.completedAt
                    ? "cv-reading-complete"
                    : "cv-reading-progress",

                book.completedAt
                    ? `✓ Completed ${dateText(book.completedAt)}`
                    : "In progress"
            )
        );

        /* ACTION BUTTONS */

        const actions = create(
            "div",
            "cv-learning-actions"
        );

        /* READ */

        const read = create(
            "a",
            "cv-action-secondary",
            "Read"
        );

        read.href = `/read/${id}`;

        actions.append(read);

        /* MARK COMPLETE */

        if (!book.completedAt) {

            const complete = create(
                "button",
                "cv-action-secondary",
                "Mark Complete"
            );

            complete.type = "button";

            complete.addEventListener(
                "click",
                async () => {

                    complete.disabled = true;

                    try {

                        const response = await fetch(
                            `/api/books/${id}/complete`,
                            {
                                method: "POST",
                                credentials: "same-origin"
                            }
                        );

                        const data = await response
                            .json()
                            .catch(() => ({}));

                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Unable to mark completed."
                            );

                        }

                        await loadReading();

                    } catch (error) {

                        alert(error.message);

                        complete.disabled = false;

                    }

                }
            );

            actions.append(complete);

        }

        /* DOWNLOAD */

        const download = create(
            "button",
            "cv-action-primary",
            "↓ Download"
        );

        download.type = "button";

        download.addEventListener(
            "click",
            () => openDownload(id)
        );

        actions.append(download);

        row.append(info, actions);

        return row;
    }

    /* ======================================================
       LOAD READING HISTORY
    ====================================================== */

    async function loadReading() {

        const status =
            $("readingStatus");

        const list =
            $("readingHistory");

        if (!status || !list) {
            return;
        }

        status.textContent =
            "Loading reading history...";

        list.replaceChildren();

        try {

            const data = await getJSON(
                "/api/reading-history"
            );

            const books =
                data.books || [];

            const openedCount =
                $("openedCount");

            const completedCount =
                $("completedCount");

            if (openedCount) {

                openedCount.textContent =
                    String(books.length);

            }

            if (completedCount) {

                completedCount.textContent =
                    String(
                        books.filter(
                            book => book.completedAt
                        ).length
                    );

            }

            status.textContent = books.length
                ? ""
                : "No books opened yet. Choose a year-level collection and start reading.";

            books.forEach(book => {

                list.append(
                    readingRow(book)
                );

            });

        } catch (error) {

            if ($("openedCount")) {
                $("openedCount").textContent = "—";
            }

            if ($("completedCount")) {
                $("completedCount").textContent = "—";
            }

            status.textContent =
                error.message;

        }

    }

    /* ======================================================
       LOAD QUIZ RESULTS
    ====================================================== */

    async function loadQuizzes() {

        const status =
            $("quizStatus");

        const list =
            $("quizHistory");

        if (!status || !list) {
            return;
        }

        status.textContent =
            "Loading quiz results...";

        list.replaceChildren();

        try {

            const data = await getJSON(
                "/api/quiz-results"
            );

            const results =
                data.results || [];

            const quizCount =
                $("quizCount");

            const averageScore =
                $("averageScore");

            if (quizCount) {

                quizCount.textContent =
                    String(results.length);

            }

            if (averageScore) {

                averageScore.textContent =
                    results.length

                        ? `${
                            Math.round(
                                results.reduce(
                                    (sum, result) =>
                                        sum +
                                        Number(
                                            result.percentage
                                        ),
                                    0
                                ) / results.length
                            )
                        }%`

                        : "—";

            }

            status.textContent =
                results.length
                    ? ""
                    : "No quiz results saved yet.";

            results.forEach(result => {

                const row = create(
                    "article",
                    "cv-learning-item"
                );

                const info = create(
                    "div",
                    "cv-learning-item-info"
                );

                /* BOOK TITLE */

                info.append(
                    create(
                        "strong",
                        "",
                        titleFor(
                            Number(result.bookId)
                        )
                    )
                );

                /* QUIZ DATE */

                info.append(
                    create(
                        "small",
                        "",
                        dateText(
                            result.completedAt
                        )
                    )
                );

                /* CORRECT ANSWERS */

                info.append(
                    create(
                        "span",
                        "",
                        `${result.score} / ` +
                        `${result.totalQuestions} correct`
                    )
                );

                /* QUIZ SCORE */

                const score = create(
                    "strong",
                    "cv-quiz-score",
                    `${result.percentage}%`
                );

                row.append(
                    info,
                    score
                );

                list.append(row);

            });

        } catch (error) {

            if ($("quizCount")) {
                $("quizCount").textContent = "—";
            }

            if ($("averageScore")) {
                $("averageScore").textContent = "—";
            }

            status.textContent =
                error.message;

        }

    }

    /* ======================================================
       REFRESH LEARNING DASHBOARD
    ====================================================== */

    async function refresh() {

        await Promise.all([
            loadReading(),
            loadQuizzes()
        ]);

    }

    const refreshButton =
        $("refreshLearning");

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refresh
        );

    }

    window.addEventListener(
        "pageshow",
        refresh
    );

    refresh();

});

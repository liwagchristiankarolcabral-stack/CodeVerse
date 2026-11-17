
"use strict";

/* ==========================================
   CODEVERSE OFFLINE BOOK MANAGER
========================================== */

(() => {
    const CACHE =
        "codeverse-offline-v1-books";

    const STORAGE_KEY =
        "codeverse-offline-books";

    /* ======================================
       GET SAVED BOOKS
    ====================================== */

    function getSaved() {
        try {
            return JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "[]"
            );
        } catch {
            return [];
        }
    }

    /* ======================================
       STORE SAVED BOOK IDS
    ====================================== */

    function setSaved(value) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(value)
        );
    }

    /* ======================================
       REGISTER SERVICE WORKER
    ====================================== */

    async function ready() {
        if (
            !("serviceWorker" in navigator) ||
            !("caches" in window)
        ) {
            throw new Error(
                "Offline reading requires HTTPS or localhost and a supported browser."
            );
        }

        await navigator.serviceWorker
            .register("/sw.js");

        await navigator.serviceWorker.ready;
    }

    /* ======================================
       DOWNLOAD AUTHORIZED BOOK
    ====================================== */

    async function saveBook(bookId) {
        const id = Number(bookId);

        if (
            !Number.isInteger(id) ||
            id < 1 ||
            id > 30
        ) {
            throw new Error(
                "Invalid book ID."
            );
        }

        if (!navigator.onLine) {
            throw new Error(
                "Connect to the internet to download a book."
            );
        }

        await ready();

        const access = await fetch(
            "/api/books/access-status",
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        if (!access.ok) {
            throw new Error(
                "Log in and unlock the collection first."
            );
        }

        const url = "/read/" + id;

        const response = await fetch(
            url,
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Book access denied. Unlock the year-level collection first."
            );
        }

        const html = await response.text();

        if (
            !/<html[\s>]/i.test(html)
        ) {
            throw new Error(
                "Unexpected book response."
            );
        }

        const cache = await caches.open(
            CACHE
        );

        await cache.put(
            url,
            new Response(
                html,
                {
                    headers: {
                        "Content-Type":
                            "text/html; charset=utf-8"
                    }
                }
            )
        );

        setSaved([
            ...new Set([
                ...getSaved(),
                id
            ])
        ]);

        return url;
    }

    /* ======================================
       REMOVE DOWNLOADED BOOK
    ====================================== */

    async function removeBook(bookId) {
        const id = Number(bookId);

        const cache = await caches.open(
            CACHE
        );

        await cache.delete(
            "/read/" + id
        );

        setSaved(
            getSaved().filter(
                value => value !== id
            )
        );
    }

    /* ======================================
       CLEAR OFFLINE DATA
    ====================================== */

    async function clearOffline() {
        await caches.delete(CACHE);

        setSaved([]);

        if (
            navigator.serviceWorker.controller
        ) {
            navigator.serviceWorker.controller
                .postMessage({
                    type: "CLEAR_OFFLINE"
                });
        }
    }

    /* ======================================
       SYNCHRONIZE PENDING DATA
    ====================================== */

    async function sync() {
        await ready();

        navigator.serviceWorker.controller
            ?.postMessage({
                type: "SYNC"
            });
    }

    /* ======================================
       EXPOSE FUNCTIONS
    ====================================== */

    window.CodeVerseOffline = {
        saveBook,
        removeBook,
        clearOffline,
        sync,
        listBooks: getSaved
    };

    /* ======================================
       DOWNLOAD BUTTON HANDLER
    ====================================== */

    document.addEventListener(
        "click",
        async event => {
            const button =
                event.target.closest(
                    "[data-offline-book]"
                );

            if (!button) {
                return;
            }

            event.preventDefault();

            const previousText =
                button.textContent;

            button.disabled = true;
            button.textContent =
                "Saving...";

            try {
                await saveBook(
                    button.dataset.offlineBook
                );

                button.textContent =
                    "Saved for offline reading";

            } catch (error) {
                button.textContent =
                    previousText;

                alert(error.message);

            } finally {
                button.disabled = false;
            }
        }
    );

    /* ======================================
       AUTO SYNC ON RECONNECTION
    ====================================== */

    window.addEventListener(
        "online",
        () => {
            sync().catch(console.error);
        }
    );

    /* ======================================
       INITIALIZE
    ====================================== */

    window.addEventListener(
        "load",
        () => {
            ready()
                .then(() => {
                    if (navigator.onLine) {
                        sync();
                    }
                })
                .catch(console.error);
        }
    );
})();

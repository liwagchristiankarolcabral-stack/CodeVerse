
"use strict";

const VERSION = "codeverse-offline-v1";
const SHELL = VERSION + "-shell";
const BOOKS = VERSION + "-books";

const DB = "codeverse-offline-queue";
const DB_VERSION = 1;

const CORE = [
    "/",
    "/index.html",
    "/offline.html",
    "/manifest.json"
];

const PRIVATE_PREFIXES = [
    "/api/",
    "/read/",
    "/cover/",
    "/protected-books/",
    "/books/"
];

/* ==========================================
   INDEXEDDB
========================================== */

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(
            DB,
            DB_VERSION
        );

        request.onupgradeneeded = () => {
            if (
                !request.result.objectStoreNames
                    .contains("pending")
            ) {
                request.result.createObjectStore(
                    "pending",
                    {
                        keyPath: "id"
                    }
                );
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function pending(action, record) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            "pending",
            action === "list"
                ? "readonly"
                : "readwrite"
        );

        const store =
            transaction.objectStore("pending");

        const request =
            action === "add"
                ? store.put(record)
                : action === "delete"
                    ? store.delete(record)
                    : store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.oncomplete = () => {
            db.close();
        };
    });
}

/* ==========================================
   JSON RESPONSE HELPER
========================================== */

function json(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type":
                    "application/json",
                "Cache-Control": "no-store"
            }
        }
    );
}

/* ==========================================
   SERVICE WORKER INSTALLATION
========================================== */

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(SHELL)
            .then(async cache => {
                await Promise.allSettled(
                    CORE.map(url => cache.add(url))
                );
            })
            .then(() => self.skipWaiting())
    );
});

/* ==========================================
   SERVICE WORKER ACTIVATION
========================================== */

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();

        for (const name of cacheNames) {
            if (
                name.startsWith(
                    "codeverse-offline-"
                ) &&
                !name.startsWith(VERSION)
            ) {
                await caches.delete(name);
            }
        }

        await self.clients.claim();
    })());
});

/* ==========================================
   SYNCHRONIZE PENDING UPDATES
========================================== */

async function sync() {
    const items = await pending("list");

    let synced = 0;

    for (const item of items) {
        try {
            const response = await fetch(
                item.url,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(
                        item.body
                    ),
                    cache: "no-store"
                }
            );

            if (response.ok) {
                await pending(
                    "delete",
                    {
                        id: item.id
                    }
                );

                synced++;
            } else if (
                response.status === 401 ||
                response.status === 403
            ) {
                break;
            } else {
                break;
            }

        } catch (error) {
            break;
        }
    }

    return {
        synced,
        pending:
            (await pending("list")).length
    };
}

/* ==========================================
   SERVICE WORKER MESSAGES
========================================== */

self.addEventListener("message", event => {
    if (event.data?.type === "SYNC") {
        event.waitUntil(
            sync().then(result => {
                event.source?.postMessage({
                    type: "SYNC_RESULT",
                    ...result
                });
            })
        );
    }

    if (
        event.data?.type ===
        "CLEAR_OFFLINE"
    ) {
        event.waitUntil((async () => {
            await caches.delete(BOOKS);

            const items =
                await pending("list");

            for (const item of items) {
                await pending(
                    "delete",
                    item
                );
            }

            event.source?.postMessage({
                type: "OFFLINE_CLEARED"
            });
        })());
    }
});

/* ==========================================
   FETCH INTERCEPTION
========================================== */

self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        url.origin !==
        self.location.origin
    ) {
        return;
    }

    const pathname = url.pathname;

    /* ======================================
       QUIZ / COMPLETION OFFLINE QUEUE
    ====================================== */

    if (
        request.method === "POST" &&
        (
            pathname ===
                "/api/quiz-results" ||
            /^\/api\/books\/\d+\/complete$/
                .test(pathname)
        )
    ) {
        event.respondWith((async () => {
            let body;

            try {
                body =
                    await request.clone().json();
            } catch {
                return fetch(request);
            }

            if (
                pathname ===
                "/api/quiz-results"
            ) {
                if (
                    !Number.isInteger(
                        body.bookId
                    ) ||
                    !Number.isInteger(
                        body.score
                    ) ||
                    !Number.isInteger(
                        body.totalQuestions
                    ) ||
                    body.totalQuestions < 1 ||
                    body.score < 0 ||
                    body.score >
                        body.totalQuestions
                ) {
                    return fetch(request);
                }

                body.clientSubmissionId ||=
                    crypto.randomUUID()
                        .replaceAll("-", "");
            }

            try {
                return await fetch(
                    new Request(request, {
                        body: JSON.stringify(
                            body
                        )
                    })
                );
            } catch {
                const id =
                    pathname + ":" +
                    (
                        body.clientSubmissionId ||
                        crypto.randomUUID()
                    );

                await pending("add", {
                    id,
                    url: pathname,
                    body,
                    createdAt: Date.now()
                });

                return json({
                    success: true,
                    offline: true,
                    queued: true,
                    message:
                        "Saved on this device; will sync when online."
                });
            }
        })());

        return;
    }

    if (request.method !== "GET") {
        return;
    }

    /* ======================================
       OFFLINE BOOK READING
    ====================================== */

    if (
        /^\/read\/\d+$/.test(pathname)
    ) {
        event.respondWith((async () => {
            try {
                return await fetch(request);
            } catch {
                const cache =
                    await caches.open(BOOKS);

                const savedBook =
                    await cache.match(request);

                return savedBook ||
                    new Response(
                        "This book was not saved for offline reading.",
                        {
                            status: 503,
                            headers: {
                                "Content-Type":
                                    "text/plain"
                            }
                        }
                    );
            }
        })());

        return;
    }

    /* ======================================
       DO NOT CACHE PRIVATE API ROUTES
    ====================================== */

    if (
        PRIVATE_PREFIXES.some(prefix =>
            pathname.startsWith(prefix)
        )
    ) {
        return;
    }

    /* ======================================
       OFFLINE LIBRARY PAGE
    ====================================== */

    if (
        pathname === "/library.html"
    ) {
        event.respondWith((async () => {
            try {
                const response =
                    await fetch(request);

                if (response.ok) {
                    const cache =
                        await caches.open(
                            SHELL
                        );

                    await cache.put(
                        request,
                        response.clone()
                    );
                }

                return response;

            } catch {
                return (
                    await caches.match(
                        request
                    )
                ) || caches.match(
                    "/offline.html"
                );
            }
        })());

        return;
    }

    /* ======================================
       OFFLINE NAVIGATION
    ====================================== */

    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const response =
                    await fetch(request);

                if (response.ok) {
                    const cache =
                        await caches.open(
                            SHELL
                        );

                    await cache.put(
                        request,
                        response.clone()
                    );
                }

                return response;

            } catch {
                return (
                    await caches.match(
                        request
                    )
                ) || caches.match(
                    "/offline.html"
                );
            }
        })());

        return;
    }

    /* ======================================
       CSS, JS, IMAGES, FONTS
    ====================================== */

    if (
        /\.(css|js|png|jpg|jpeg|webp|svg|woff2?|ico)$/i
            .test(pathname)
    ) {
        event.respondWith((async () => {
            const cached =
                await caches.match(request);

            if (cached) {
                return cached;
            }

            try {
                const response =
                    await fetch(request);

                if (
                    response.ok &&
                    response.type === "basic"
                ) {
                    const cache =
                        await caches.open(
                            SHELL
                        );

                    await cache.put(
                        request,
                        response.clone()
                    );
                }

                return response;

            } catch {
                return Response.error();
            }
        })());
    }
});

"use strict";

const CACHE_NAME = "codeverse-public-v1";

const OFFLINE_ASSETS = [
    "/",
    "/index.html",
    "/offline.html",
    "/manifest.json",
    "/images/CodeVerseLogo.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(OFFLINE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return;

    // Never automatically cache authentication,
    // private APIs, protected books or cover pages.
    const protectedPaths = [
        "/api/",
        "/read/",
        "/cover/",
        "/protected-books/",
        "/library.html"
    ];

    if (protectedPaths.some(path =>
        url.pathname.startsWith(path)
    )) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(async () => {
                const cached = await caches.match(request);

                return cached ||
                    caches.match("/offline.html");
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => {
            return cached || fetch(request);
        })
    );
});
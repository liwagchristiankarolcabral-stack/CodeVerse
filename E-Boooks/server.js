
/* ==========================================
   CODEVERSE - COMPLETE SERVER
   Node.js + Express + SQLite

   FEATURES:
   - User registration and login
   - SQLite database
   - Session authentication
   - 30 protected e-books
   - 3 year-level collections
   - One passkey per year level
   - Protected book cover pages
   - Protected reading content
   - Quiz results and history
========================================== */

"use strict";

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const PUBLIC_FOLDER = path.join(__dirname, "public");
const DATA_FOLDER = path.join(__dirname, "data");
const PROTECTED_FOLDER = path.join(__dirname, "protected-books");

const BOOK_MANIFEST_FILE =
    path.join(__dirname, "book-manifest.json");

const COVER_MANIFEST_FILE =
    path.join(__dirname, "book-cover-manifest.json");


/* ==========================================
   1. REQUIRED FOLDERS
========================================== */

fs.mkdirSync(DATA_FOLDER, { recursive: true });
fs.mkdirSync(PROTECTED_FOLDER, { recursive: true });


/* ==========================================
   2. DATABASE
========================================== */

const db = new Database(
    path.join(DATA_FOLDER, "codeverse.db")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);


/* ==========================================
   3. EXPRESS MIDDLEWARE
========================================== */

app.disable("x-powered-by");

app.use(express.json({
    limit: "100kb"
}));

app.use(express.urlencoded({
    extended: false
}));


/* ==========================================
   4. SESSION CONFIGURATION
========================================== */

const isProduction =
    process.env.NODE_ENV === "production";

const SESSION_SECRET =
    process.env.SESSION_SECRET ||
    "CHANGE-THIS-SECRET-BEFORE-DEPLOYMENT";

if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error(
        "SESSION_SECRET must be configured in production."
    );
}

if (isProduction) {
    app.set("trust proxy", 1);
}

app.use(session({
    name: "codeverse.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));


/* ==========================================
   5. AUTHENTICATION HELPERS
========================================== */

function isLoggedIn(req) {
    return Boolean(req.session?.user?.id);
}

function requireLogin(req, res, next) {

    if (!isLoggedIn(req)) {
        return res.redirect("/LogIn.html");
    }

    next();
}

function requireApiLogin(req, res, next) {

    if (!isLoggedIn(req)) {
        return res.status(401).json({
            success: false,
            message: "Please log in first."
        });
    }

    next();
}


/* ==========================================
   6. YEAR-LEVEL CONFIGURATION

   IMPORTANT:
   Book IDs follow your existing manifest.

   1st Year: 11-20
   2nd Year: 21-30
   3rd Year: 1-10
========================================== */

const YEAR_LEVELS = {

    1: {
        name: "1st Year IT",
        subject: "Introduction to Computing",
        bookIds: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        passkey: process.env.BOOK_CODE_2 || "5211"
    },

    2: {
        name: "2nd Year IT",
        subject: "Platform Technologies",
        bookIds: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        passkey: process.env.BOOK_CODE_3 || "0071"
    },

    3: {
        name: "3rd Year IT",
        subject: "Web Technologies",
        bookIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        passkey: process.env.BOOK_CODE_1 || "1047"
    }

};

const MAX_BOOK_ID = 30;

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000;

const failedAttempts = new Map();


/* ==========================================
   7. BOOK HELPERS
========================================== */

function isValidBookId(bookId) {

    return Number.isInteger(bookId) &&
        bookId >= 1 &&
        bookId <= MAX_BOOK_ID;
}

function getYearFromBookId(bookId) {

    if (!isValidBookId(bookId)) {
        return null;
    }

    for (const [year, collection] of
        Object.entries(YEAR_LEVELS)) {

        if (collection.bookIds.includes(bookId)) {
            return Number(year);
        }
    }

    return null;
}

function isValidYear(year) {

    return Number.isInteger(year) &&
        Object.prototype.hasOwnProperty.call(
            YEAR_LEVELS,
            year
        );
}

function getUnlockedYears(req) {

    if (!Array.isArray(req.session.unlockedYears)) {
        return [];
    }

    return req.session.unlockedYears.filter(
        year => isValidYear(year)
    );
}

function hasYearAccess(req, bookId) {

    const year = getYearFromBookId(bookId);

    if (!year) {
        return false;
    }

    return getUnlockedYears(req).includes(year);
}


/* ==========================================
   8. SECURE PASSKEY COMPARISON
========================================== */

function secureCompare(first, second) {

    if (
        typeof first !== "string" ||
        typeof second !== "string"
    ) {
        return false;
    }

    const firstHash = crypto
        .createHash("sha256")
        .update(first)
        .digest();

    const secondHash = crypto
        .createHash("sha256")
        .update(second)
        .digest();

    return crypto.timingSafeEqual(
        firstHash,
        secondHash
    );
}


/* ==========================================
   9. LOAD BOOK MANIFESTS
========================================== */

function loadManifest(filePath) {

    if (!fs.existsSync(filePath)) {

        console.warn(
            "Manifest not found:",
            path.basename(filePath)
        );

        return {};
    }

    try {

        const contents = fs.readFileSync(
            filePath,
            "utf8"
        );

        const manifest = JSON.parse(contents);

        if (
            !manifest ||
            typeof manifest !== "object" ||
            Array.isArray(manifest)
        ) {
            throw new Error(
                "Manifest must contain a JSON object."
            );
        }

        return manifest;

    } catch (error) {

        console.error(
            "Unable to load manifest:",
            error.message
        );

        return {};
    }
}

const bookManifest =
    loadManifest(BOOK_MANIFEST_FILE);

const coverManifest =
    loadManifest(COVER_MANIFEST_FILE);


/* ==========================================
   10. RESOLVE PROTECTED BOOK FILES
========================================== */

function getProtectedHtmlFile(manifest, bookId) {

    if (!isValidBookId(bookId)) {
        return null;
    }

    const filename = manifest[String(bookId)];

    if (
        typeof filename !== "string" ||
        !filename.trim()
    ) {
        return null;
    }

    const absolutePath = path.resolve(
        PROTECTED_FOLDER,
        filename
    );

    const relativePath = path.relative(
        PROTECTED_FOLDER,
        absolutePath
    );

    if (
        !relativePath ||
        relativePath === ".." ||
        relativePath.startsWith(".." + path.sep) ||
        path.isAbsolute(relativePath)
    ) {
        return null;
    }

    if (
        path.extname(absolutePath).toLowerCase()
        !== ".html"
    ) {
        return null;
    }

    try {

        const root = fs.realpathSync(
            PROTECTED_FOLDER
        );

        const file = fs.realpathSync(
            absolutePath
        );

        const realRelative = path.relative(
            root,
            file
        );

        if (
            !realRelative ||
            realRelative === ".." ||
            realRelative.startsWith(".." + path.sep) ||
            path.isAbsolute(realRelative)
        ) {
            return null;
        }

        if (!fs.statSync(file).isFile()) {
            return null;
        }

        return file;

    } catch {
        return null;
    }
}

function getProtectedBookFile(bookId) {

    return getProtectedHtmlFile(
        bookManifest,
        bookId
    );
}

function getProtectedCoverFile(bookId) {

    return getProtectedHtmlFile(
        coverManifest,
        bookId
    );
}


/* ==========================================
   11. PROTECTED LIBRARY
========================================== */

app.get(
    "/library.html",
    requireLogin,
    (req, res) => {

        res.sendFile(
            path.join(PUBLIC_FOLDER, "library.html")
        );
    }
);


/* ==========================================
   12. BLOCK DIRECT FILE ACCESS
========================================== */

app.use((req, res, next) => {

    const pathname = req.path
        .replace(/\\/g, "/")
        .toLowerCase();

    const blocked =
        pathname === "/protected-books" ||
        pathname.startsWith("/protected-books/") ||
        pathname === "/books" ||
        pathname.startsWith("/books/") ||
        pathname === "/reader.html" ||
        pathname === "/book covers" ||
        pathname.startsWith("/book covers/");

    if (blocked) {

        return res.status(403).send(
            "Access denied. Open books through CodeVerse."
        );
    }

    next();
});


/* ==========================================
   13. ACCOUNT STATUS

   Used by codeverse-home.js
========================================== */

app.get("/api/auth/status", (req, res) => {

    return res.json({
        success: true,
        loggedIn: isLoggedIn(req),
        user: isLoggedIn(req)
            ? req.session.user
            : null
    });
});


/* ==========================================
   14. YEAR-LEVEL ACCESS STATUS
========================================== */

app.get(
    "/api/books/access-status",
    requireApiLogin,
    (req, res) => {

        return res.json({
            success: true,
            unlockedYears: getUnlockedYears(req)
        });
    }
);


/* ==========================================
   15. UNLOCK YEAR-LEVEL COLLECTION
========================================== */

app.post(
    "/api/books/unlock",
    requireApiLogin,
    (req, res) => {

        const {
            year,
            bookId,
            passkey
        } = req.body || {};

        let selectedYear = Number(year);

        // Compatibility with the original
        // per-book unlock request.
        if (!isValidYear(selectedYear) &&
            Number.isInteger(bookId)) {

            selectedYear = getYearFromBookId(bookId);
        }

        if (
            !isValidYear(selectedYear) ||
            typeof passkey !== "string" ||
            !/^[0-9]{4}$/.test(passkey)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid 4-digit year-level passkey."
            });
        }

        // Ensure the supplied book belongs
        // to the selected year.
        if (
            bookId !== null &&
            bookId !== undefined &&
            (
                !isValidBookId(bookId) ||
                getYearFromBookId(bookId) !== selectedYear
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "The selected book does not belong to this year level."
            });
        }

        const collection =
            YEAR_LEVELS[selectedYear];

        // Already unlocked in this session.
        if (
            getUnlockedYears(req).includes(selectedYear)
        ) {

            return res.json({
                success: true,
                message: "Collection already unlocked.",
                year: selectedYear,
                unlockedYears: getUnlockedYears(req)
            });
        }

        const attemptKey =
            `${req.session.user.id}:${req.ip}`;

        const now = Date.now();

        let attempts = failedAttempts.get(
            attemptKey
        ) || {
            count: 0,
            blockedUntil: 0
        };

        if (attempts.blockedUntil > now) {

            const remaining = Math.ceil(
                (attempts.blockedUntil - now) / 60000
            );

            return res.status(429).json({
                success: false,
                message:
                    `Too many attempts. Try again in ${remaining} minute(s).`
            });
        }

        if (
            attempts.blockedUntil &&
            attempts.blockedUntil <= now
        ) {

            attempts = {
                count: 0,
                blockedUntil: 0
            };
        }

        const validPasskey = secureCompare(
            passkey,
            collection.passkey
        );

        if (!validPasskey) {

            attempts.count++;

            if (attempts.count >= MAX_ATTEMPTS) {
                attempts.blockedUntil =
                    now + LOCK_DURATION;
            }

            failedAttempts.set(
                attemptKey,
                attempts
            );

            return res.status(401).json({
                success: false,
                message: attempts.blockedUntil
                    ? "Too many incorrect attempts. Try again in 15 minutes."
                    : "Incorrect year-level passkey."
            });
        }

        failedAttempts.delete(attemptKey);

        // Store the unlocked YEAR,
        // not the individual book.
        req.session.unlockedYears = [
            ...new Set([
                ...getUnlockedYears(req),
                selectedYear
            ])
        ];

        req.session.save(error => {

            if (error) {

                console.error(
                    "Unable to save year-level access:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to save collection access."
                });
            }

            return res.json({
                success: true,
                message:
                    `${collection.name} unlocked successfully!`,
                year: selectedYear,
                unlockedYears: getUnlockedYears(req)
            });
        });
    }
);


/* ==========================================
   16. OPEN BOOK ACCESS API

   Used by book-passkey.js
========================================== */

app.get(
    "/api/books/open/:bookId",
    requireApiLogin,
    (req, res) => {

        const bookId = Number(
            req.params.bookId
        );

        if (!isValidBookId(bookId)) {

            return res.status(404).json({
                success: false,
                message: "Invalid book ID."
            });
        }

        const year =
            getYearFromBookId(bookId);

        if (!hasYearAccess(req, bookId)) {

            return res.status(403).json({
                success: false,
                requiresPasskey: true,
                year,
                message:
                    "Unlock this year-level collection first."
            });
        }

        const bookFile =
            getProtectedBookFile(bookId);

        if (!bookFile) {

            return res.status(404).json({
                success: false,
                message:
                    `Book ${bookId} is not installed.`
            });
        }

        const coverFile =
            getProtectedCoverFile(bookId);

        if (!coverFile) {

            return res.status(404).json({
                success: false,
                message:
                    `Book ${bookId} cover is not installed.`
            });
        }

        return res.json({
            success: true,
            year,
            redirectUrl: `/cover/${bookId}`
        });
    }
);


/* ==========================================
   17. OPEN PROTECTED BOOK COVER
========================================== */

app.get(
    "/cover/:bookId",
    requireLogin,
    (req, res) => {

        const bookId = Number(
            req.params.bookId
        );

        if (!isValidBookId(bookId)) {

            return res.status(404).send(
                "Invalid book ID."
            );
        }

        if (!hasYearAccess(req, bookId)) {

            return res.status(403).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>CodeVerse | Access Required</title>
                </head>
                <body style="
                    font-family:Arial,sans-serif;
                    text-align:center;
                    padding:60px 20px;
                    background:#f7f9fd;
                    color:#202b40;
                ">
                    <h2>Collection Access Required</h2>

                    <p>
                        Please unlock your year-level
                        collection before opening this book.
                    </p>

                    <a href="/index.html#books"
                       style="color:#3157a4;">
                        Return to CodeVerse
                    </a>
                </body>
                </html>
            `);
        }

        const coverFile =
            getProtectedCoverFile(bookId);

        if (!coverFile) {

            return res.status(404).send(
                "Book cover file not found."
            );
        }

        res.set({
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff"
        });

        return res.sendFile(coverFile);
    }
);


/* ==========================================
   18. OPEN PROTECTED BOOK CONTENT
========================================== */

app.get(
    "/read/:bookId",
    requireLogin,
    (req, res) => {

        const bookId = Number(
            req.params.bookId
        );

        if (!isValidBookId(bookId)) {

            return res.status(404).send(
                "Invalid book ID."
            );
        }

        if (!hasYearAccess(req, bookId)) {

            return res.status(403).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>CodeVerse | Access Denied</title>
                </head>
                <body style="
                    font-family:Arial,sans-serif;
                    text-align:center;
                    padding:60px 20px;
                    background:#f7f9fd;
                    color:#202b40;
                ">
                    <h2>Year-Level Access Required</h2>

                    <p>
                        Unlock the collection containing
                        this book before reading.
                    </p>

                    <a href="/index.html#books"
                       style="color:#3157a4;">
                        Return to CodeVerse
                    </a>
                </body>
                </html>
            `);
        }

        const bookFile =
            getProtectedBookFile(bookId);

        if (!bookFile) {

            return res.status(404).send(
                "Book content file not found."
            );
        }

        res.set({
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff"
        });

        return res.sendFile(bookFile);
    }
);


/* ==========================================
   19. USER REGISTRATION
========================================== */

app.post("/api/register", async (req, res) => {

    try {

        const {
            fullName,
            email,
            password
        } = req.body || {};

        if (!fullName || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please complete all fields."
            });
        }

        const name =
            String(fullName).trim();

        const userEmail =
            String(email).trim().toLowerCase();

        const userPassword =
            String(password);

        if (
            name.length < 2 ||
            name.length > 80
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Full name must be between 2 and 80 characters."
            });
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) ||
            userEmail.length > 254
        ) {

            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (
            userPassword.length < 10 ||
            Buffer.byteLength(userPassword, "utf8") > 72
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 10 characters and no more than 72 bytes."
            });
        }

        const existing = db.prepare(`
            SELECT id
            FROM users
            WHERE email = ?
        `).get(userEmail);

        if (existing) {

            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        const hash = await bcrypt.hash(
            userPassword,
            12
        );

        const result = db.prepare(`
            INSERT INTO users (
                full_name,
                email,
                password_hash
            )
            VALUES (?, ?, ?)
        `).run(
            name,
            userEmail,
            hash
        );

        req.session.regenerate(error => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Account created. Please log in."
                });
            }

            req.session.user = {
                id: Number(result.lastInsertRowid),
                fullName: name,
                email: userEmail
            };

            req.session.save(saveError => {

                if (saveError) {

                    return res.status(500).json({
                        success: false,
                        message:
                            "Account created. Please log in."
                    });
                }

                return res.status(201).json({
                    success: true,
                    message:
                        "Welcome to CodeVerse! Account created successfully.",
                    user: req.session.user
                });
            });
        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to create your account."
        });
    }
});


/* ==========================================
   20. USER LOGIN
========================================== */

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body || {};

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter your email and password."
            });
        }

        const userEmail =
            String(email).trim().toLowerCase();

        const user = db.prepare(`
            SELECT
                id,
                full_name,
                email,
                password_hash
            FROM users
            WHERE email = ?
        `).get(userEmail);

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });
        }

        const matches = await bcrypt.compare(
            String(password),
            user.password_hash
        );

        if (!matches) {

            return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });
        }

        req.session.regenerate(error => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message: "Unable to start your session."
                });
            }

            req.session.user = {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            };

            req.session.save(saveError => {

                if (saveError) {

                    return res.status(500).json({
                        success: false,
                        message: "Unable to save your session."
                    });
                }

                return res.json({
                    success: true,
                    message: "Welcome back to CodeVerse!",
                    user: req.session.user
                });
            });
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to log in."
        });
    }
});


/* ==========================================
   21. CURRENT USER
========================================== */

app.get("/api/user", (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({
            success: false,
            message: "Not logged in."
        });
    }

    return res.json({
        success: true,
        user: req.session.user
    });
});


/* ==========================================
   22. LOGOUT
========================================== */

app.post("/api/logout", (req, res) => {

    req.session.destroy(error => {

        if (error) {

            return res.status(500).json({
                success: false,
                message: "Unable to log out."
            });
        }

        res.clearCookie("codeverse.sid", {
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction
        });

        return res.json({
            success: true,
            message:
                "You have logged out successfully."
        });
    });
});


/* ==========================================
   23. SAVE QUIZ RESULTS
========================================== */

app.post(
    "/api/quiz-results",
    requireApiLogin,
    (req, res) => {

        const userId =
            req.session.user.id;

        const {
            bookId,
            score,
            totalQuestions
        } = req.body || {};

        if (
            !isValidBookId(bookId) ||
            !Number.isInteger(score) ||
            !Number.isInteger(totalQuestions) ||
            totalQuestions < 1 ||
            score < 0 ||
            score > totalQuestions
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid quiz result."
            });
        }

        // The student must have access
        // to the book's year-level collection.
        if (!hasYearAccess(req, bookId)) {

            return res.status(403).json({
                success: false,
                message:
                    "Unlock this book's collection before submitting a quiz."
            });
        }

        const percentage = Math.round(
            (score / totalQuestions) * 100
        );

        try {

            const result = db.prepare(`
                INSERT INTO quiz_results (
                    user_id,
                    book_id,
                    score,
                    total_questions,
                    percentage
                )
                VALUES (?, ?, ?, ?, ?)
            `).run(
                userId,
                bookId,
                score,
                totalQuestions,
                percentage
            );

            return res.json({
                success: true,
                message:
                    "Quiz score saved successfully!",
                resultId:
                    Number(result.lastInsertRowid),
                score,
                totalQuestions,
                percentage
            });

        } catch (error) {

            console.error(
                "Quiz save error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to save quiz score."
            });
        }
    }
);


/* ==========================================
   24. QUIZ HISTORY
========================================== */

app.get(
    "/api/quiz-results",
    requireApiLogin,
    (req, res) => {

        try {

            const results = db.prepare(`
                SELECT
                    id,
                    book_id AS bookId,
                    score,
                    total_questions AS totalQuestions,
                    percentage,
                    completed_at AS completedAt
                FROM quiz_results
                WHERE user_id = ?
                ORDER BY completed_at DESC, id DESC
            `).all(req.session.user.id);

            return res.json({
                success: true,
                results
            });

        } catch (error) {

            console.error(
                "Quiz history error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load quiz history."
            });
        }
    }
);


/* ==========================================
   25. PUBLIC STATIC FILES
========================================== */

app.use(express.static(PUBLIC_FOLDER, {
    index: "index.html",
    dotfiles: "deny"
}));


/* ==========================================
   26. API NOT FOUND
========================================== */

app.use("/api", (req, res) => {

    return res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});


/* ==========================================
   27. ERROR HANDLER
========================================== */

app.use((error, req, res, next) => {

    console.error(
        "CodeVerse server error:",
        error
    );

    if (res.headersSent) {
        return next(error);
    }

    const status =
        error.status || error.statusCode || 500;

    if (req.path.startsWith("/api/")) {

        return res.status(status).json({
            success: false,
            message:
                status === 400
                    ? "Invalid request data."
                    : "An unexpected server error occurred."
        });
    }

    return res.status(status).send(
        "An unexpected server error occurred."
    );
});


/* ==========================================
   28. START SERVER
========================================== */

app.listen(PORT, () => {

    console.log("");
    console.log("====================================");
    console.log("         CODEVERSE SERVER");
    console.log("====================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Database: data/codeverse.db");
    console.log("Book access: Year-level collections");
    console.log("====================================");
    console.log("");

});

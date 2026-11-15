CODEVERSE REPAIRED WEBSITE — 2026-11-15

INSTALL
1. Extract the E-Boooks folder.
2. To preserve existing accounts and quiz history, copy your ORIGINAL data/codeverse.db into E-Boooks/data/ BEFORE running the server. Do not copy a live SQLite database while the original server is running.
3. Open PowerShell in the E-Boooks folder.
4. Run: npm.cmd install
5. Run: npm.cmd start
6. Open: http://localhost:3000

If better-sqlite3 fails to build under Node 26, install the Visual Studio Desktop development with C++ workload and MSVC toolset, then rerun npm.cmd install.

FIXES
- Repaired hundreds of asset/navigation URLs.
- Corrected Books 2, 4, and 7 to load their actual reading pages from protected-books.
- Ensured all 30 cover and all 30 reading manifest targets exist.
- Repaired links to CSS, JavaScript, navigation, and images for protected routes.
- Added fallback image for 40 missing illustrations in the original archive. These illustrations cannot be reconstructed from the supplied files.
- Removed publicly accessible duplicate reading pages for Books 2, 4, and 7.
- Added npm start command.

LIMITATIONS
- Reference PDFs, SQLite database, and original public book covers.rar are excluded to keep download small.
- This environment could not install npm dependencies offline; full live login/passkey/browser testing has NOT been completed.
- Existing content accuracy, quiz scoring, and all browser behaviors are not guaranteed.
- Do not deploy publicly without setting a strong SESSION_SECRET and reviewing passkey configuration.

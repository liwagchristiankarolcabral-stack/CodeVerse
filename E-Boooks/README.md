# CodeVerse 📚

**CodeVerse** is a web-based digital library for Information Technology learning. Students can browse educational books, read lessons directly in their browser, and assess their understanding through quizzes.

> **Project status:** Educational project. Some features and deployment settings depend on the version of the source code being used.

## Features

- **Digital book library:** Browse IT-related ebooks and open lessons online.
- **HTML-based reading:** Book content is presented as webpages rather than downloadable PDFs.
- **Organized lessons:** Book chapters include a table of contents for navigation. Updated editions of several books contain 30 lessons.
- **Reader preferences:** Adjustable font size and font family, with a dark-mode reading option.
- **Knowledge assessments:** Interactive quizzes are included in supported books; quiz-result saving requires the corresponding backend endpoint and database configuration.
- **Glossary:** Searchable terminology sections in supported books.
- **User accounts:** Registration, login, and session-based access are supported by the backend.
- **Responsive interface:** Designed for desktop and mobile browsers.

## Learning Topics

## 📚 CodeVerse Book Collection

The CodeVerse digital library includes **30 Information Technology learning titles**, covering computer fundamentals, web development, programming, databases, networking, cybersecurity, and emerging technologies.


1. Internet Fundamentals
2. Web Browsers, Servers, and HTTP/HTTPS
3. HTML Structure and Semantic Elements
4. CSS Styling, Layout, Flexbox, and Grid
5. Responsive Web Design
6. JavaScript Fundamentals and DOM Manipulation
7. Forms and Input Validation
8. User Interface Design and Accessibility
9. Authentication, Authorization, and Web Security
10. Website Testing, Hosting, Deployment, and Maintenance
11. The History of Computers and Computing Systems
12. Computer Generations and System Classifications
13. Computer Hardware and Software Fundamentals
14. The IPOS Cycle: Input, Processing, Output, and Storage
15. Data, Information, and Number Systems
16. Operating System Fundamentals
17. Programs and Processes of Computers
18. Computer Networks and the Internet
19. Cybersecurity, Privacy, and Computer Ethics
20. Emerging Technologies and Artificial Intelligence
21. Introduction to Computer Programming
22. Programming Logic and Algorithms
23. Data Structures and Algorithms
24. Object-Oriented Programming
25. Database Management Systems
26. SQL and Relational Databases
27. Software Engineering Fundamentals
28. Systems Analysis and Design
29. Cloud Computing Fundamentals
30. Information Technology Project Management

CodeVerse aims to provide students with accessible, organized, and interactive learning materials that support their development of practical Information Technology knowledge and skills.

Book content and lesson counts may vary by edition. Some books have been expanded to 30 lessons, while the Web Security book may contain more.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express |
| Authentication | Sessions, password hashing with bcryptjs |
| Database | PostgreSQL (Neon) in the cloud configuration; SQLite in earlier local versions |
| Deployment | Vercel |
| Version control | Git and GitHub |

## Project Structure

The following is an **illustrative** structure; actual names and directories may differ in your repository.

```text
CodeVerse/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── css/
│   ├── js/
│   └── images/
│       └── book-covers/
├── protected-books/
│   └── ... HTML-based ebook lessons ...
├── server.js
├── package.json
├── .env                 # local secrets; do not commit
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Git (optional for local use)
- A PostgreSQL database if using the current Neon-based backend

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Replace the placeholder repository URL with your actual CodeVerse GitHub repository address.

### 2. Install dependencies

```bash
npm install
```

On Windows PowerShell, if the `npm` command is blocked by the execution policy, you can try:

```powershell
npm.cmd install
```

### 3. Configure environment variables

Create a `.env` file in the project root for local development:

```dotenv
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST/DATABASE?sslmode=require
SESSION_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
PORT=3000
```

- Obtain `DATABASE_URL` from your PostgreSQL provider (for example, Neon).
- Generate a strong, unpredictable `SESSION_SECRET` and keep it private.
- **Never commit `.env`, credentials, or database connection strings to GitHub.**
- Check `server.js` for any additional required variables.

### 4. Start the server

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

If your `package.json` defines a development script, you may use that instead.

## Using CodeVerse

1. Open the CodeVerse homepage.
2. Register an account or sign in if the book requires authentication.
3. Browse the library or select a year-level collection.
4. Choose a book and open its HTML reader.
5. Navigate chapters using the table of contents.
6. Customize font settings or reading theme.
7. Complete the assessment quiz, when available.

## Deployment on Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel, or deploy with the Vercel CLI.
3. Configure the same required environment variables in **Vercel Project Settings → Environment Variables**.
4. Confirm that the Vercel build/function configuration matches your Express application.
5. Deploy and test the homepage, authentication routes, protected books, and quiz-result endpoint.

Technology Stack and Development Tools

CodeVerse identifies the technologies and tools used to develop, maintain, and deploy the website. The following stack reflects the current Node.js, Express, and Neon PostgreSQL implementation.

Category                                        Technologies and Tools Used                                     Purpose

Frontend                                        HTML5, CSS3, JavaScript                 Page structure, responsive styling, interactive book reader, and client-side functionality

Backend                                           Node.js, Express.js                   Web server, application routes, authentication APIs, and protected book access

Database                                            Neon PostgreSQL                     Cloud database for user accounts, quiz results, and reading progress

Authentication and Sessions         bcryptjs, express-session, connect-pg-simple        Password hashing and persistent database-backed login sessions

Database Connection                                 pg (node-postgres)                  Connects the Express application to PostgreSQL

Development Environment                         Visual Studio Code, npm                      Code editing and package management

Version Control                                         Git, GitHub                      Source-code tracking and repository hosting

Deployment and Hosting                                     Vercel                       Hosting and deployment of the CodeVerse website

Environment Configuration                                 dotenv                        Loads local environment variables such as database configuration and session secrets

Earlier implementation: CodeVerse previously used SQLite for local development; the current backend uses Neon PostgreSQL.


**Note:** Running an Express application on Vercel requires a compatible serverless entry point or adapter. A locally working `node server.js` setup does not, by itself, guarantee a successful Vercel deployment. Database-backed sessions should use a persistent shared session store rather than in-memory sessions.

## Security Notes

- Hash passwords; never store plaintext passwords.
- Store secrets in environment variables.
- Use HTTPS in production.
- Validate inputs on the server, even when client-side validation exists.
- Protect restricted book routes and quiz-result APIs with appropriate authorization checks.
- Keep dependencies updated and back up important database data.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| `DATABASE_URL is missing` | Set `DATABASE_URL` in local `.env` or Vercel environment variables. |
| Login redirects unexpectedly | Verify session persistence, cookie settings, and authentication middleware. |
| JavaScript file returns `404` | Check the file path, filename capitalization, static directory, and deployment output. |
| Script rejected due to MIME type `text/html` | The requested `.js` URL may be returning an HTML 404 or fallback page. Fix the asset path. |
| Vercel `FUNCTION_INVOCATION_FAILED` | Inspect function logs, environment variables, database connectivity, and serverless configuration. |
| Quiz results do not save | Check the quiz API route, authenticated session, database schema, and browser Network panel. |

## Future Improvements

- More IT-related books and updated lesson material
- Reading progress tracking and bookmarks
- Improved search and filtering
- Quiz history and learning analytics
- Accessibility and performance enhancements

## License

No license has been specified for this project. Add a `LICENSE` file if you intend to grant others permission to reuse or distribute the code.

---

**CodeVerse — Learn, Explore, and Grow Through Technology.**

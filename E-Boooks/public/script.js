
// ======================================
// CODEVERSE - HOMEPAGE JAVASCRIPT
// ======================================


// ======================================
// GET HTML ELEMENTS
// ======================================

const featuredContainer = document.getElementById("featuredBooks");
const recentContainer = document.getElementById("recentBooks");

const searchInput = document.getElementById("bookSearch");
const searchForm = document.getElementById("searchForm");


// ======================================
// BOOKMARK FUNCTIONS
// ======================================

function getBookmarks() {
    return JSON.parse(localStorage.getItem("readspaceBookmarks")) || [];
}

function toggleBookmark(bookId) {

    let bookmarks = getBookmarks();

    if (bookmarks.includes(bookId)) {
        bookmarks = bookmarks.filter(id => id !== bookId);
    } else {
        bookmarks.push(bookId);
    }

    localStorage.setItem("readspaceBookmarks", JSON.stringify(bookmarks));

    displayBooks(books);
}


// ======================================
// DISPLAY BOOKS
// ======================================

function createBookCard(book) {

    const bookmarks = getBookmarks();
    const isSaved = bookmarks.includes(book.id);

    return `
        <article class="book-card">

            <div class="book-cover">

                <img
                    src="${book.cover}"
                    alt="${book.title} book cover"
                    loading="lazy"
                >

                <span class="book-category">
                    ${book.category}
                </span>

            </div>

            <div class="book-info">

                <h3>${book.title}</h3>

                <span class="book-author">
                    By ${book.author}
                </span>

                <p class="book-description">
                    ${book.description}
                </p>

                <div class="book-actions">

                    <a href="${book.readerPage}" class="read-btn">
                        Read Book →
                    </a>

                    <button
                        class="bookmark-btn ${isSaved ? "saved" : ""}"
                        onclick="toggleBookmark(${book.id})"
                        aria-label="${isSaved ? "Remove bookmark" : "Bookmark"} ${book.title}"
                        title="${isSaved ? "Remove Bookmark" : "Add Bookmark"}"
                    >
                        ${isSaved ? "★" : "☆"}
                    </button>

                </div>

            </div>

        </article>
    `;
}


// ======================================
// RENDER BOOKS
// ======================================

function displayBooks(bookList) {

    if (!featuredContainer || !recentContainer) return;

    const featuredBooks = bookList.filter(book => book.featured);

    const recentBooks = [...bookList]
        .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));

    featuredContainer.innerHTML = featuredBooks.length
        ? featuredBooks.map(createBookCard).join("")
        : `<p class="empty-results">No featured books found.</p>`;

    recentContainer.innerHTML = recentBooks.length
        ? recentBooks.map(createBookCard).join("")
        : `<p class="empty-results">No books found.</p>`;
}


// ======================================
// SEARCH BOOKS
// ======================================

function searchBooks(keyword) {

    const searchTerm = keyword.toLowerCase().trim();

    const filteredBooks = books.filter(book => {

        return (
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );

    });

    document.getElementById("featured")
        ?.scrollIntoView({ behavior: "smooth" });

    if (searchTerm === "") {
        displayBooks(books);
        return;
    }

    featuredContainer.innerHTML = filteredBooks.length
        ? filteredBooks.map(createBookCard).join("")
        : `<p class="empty-results">No matching books found.</p>`;

    recentContainer.innerHTML = "";
}


// Search button

if (searchForm && searchInput) {

    searchForm.addEventListener("submit", function(event) {

        event.preventDefault();

        searchBooks(searchInput.value);

    });


    // Live search

    searchInput.addEventListener("input", function() {

        if (searchInput.value.trim() === "") {
            displayBooks(books);
        } else {
            searchBooksWithoutScroll(searchInput.value);
        }

    });

}


function searchBooksWithoutScroll(keyword) {

    const searchTerm = keyword.toLowerCase().trim();

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
    );

    featuredContainer.innerHTML = filteredBooks.length
        ? filteredBooks.map(createBookCard).join("")
        : `<p class="empty-results">No matching books found.</p>`;

    recentContainer.innerHTML = "";
}


// ======================================
// CATEGORY FILTER
// ======================================

document.querySelectorAll(".category-card").forEach(button => {

    button.addEventListener("click", function() {

        const selectedCategory = this.dataset.category;

        const filteredBooks = books.filter(book =>
            book.category === selectedCategory
        );

        if (searchInput) searchInput.value = "";

        featuredContainer.innerHTML = filteredBooks.length
            ? filteredBooks.map(createBookCard).join("")
            : `<p class="empty-results">No books in this category yet.</p>`;

        recentContainer.innerHTML = "";

        document.getElementById("featured")
            ?.scrollIntoView({ behavior: "smooth" });

    });

});



// ======================================
// DARK MODE
// ======================================

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// Apply saved theme
function loadTheme() {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");

        if (themeIcon) {
            themeIcon.textContent = "☀";
        }

    } else {
        document.body.classList.remove("dark-mode");

        if (themeIcon) {
            themeIcon.textContent = "☾";
        }
    }

}

// Load theme when page opens
loadTheme();

// Toggle theme when clicked
if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        const isDarkMode = document.body.classList.contains("dark-mode");

        if (isDarkMode) {

            localStorage.setItem("theme", "dark");

            if (themeIcon) {
                themeIcon.textContent = "☀";
            }

        } else {

            localStorage.setItem("theme", "light");

            if (themeIcon) {
                themeIcon.textContent = "☾";
            }

        }

        console.log("Dark mode:", isDarkMode ? "ON" : "OFF");

    });

} else {
    console.error("Theme toggle button was not found.");
}


// ======================================
// MOBILE NAVIGATION
// ======================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function() {

        navLinks.classList.toggle("show");

    });


    // Close mobile menu after clicking a link

    navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", function() {

            navLinks.classList.remove("show");

        });

    });

}


// ======================================
// INITIALIZE HOMEPAGE
// ======================================

if (typeof books !== "undefined") {
    displayBooks(books);
} else {
    console.error("Books data was not loaded. Check books.js.");
}


// ===============================
// DISPLAY ALL BOOKS ON HOMEPAGE
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const featuredContainer = document.getElementById("featuredBooks");

    if (!featuredContainer) return;

    if (typeof books === "undefined" || !Array.isArray(books)) {
        featuredContainer.innerHTML = "<p>Unable to load books.</p>";
        return;
    }

    featuredContainer.innerHTML = books.map(book => `
        <div class="featured-book-card">

            <img
                src="${book.cover}"
                alt="${book.title}"
                loading="lazy"
            >

            <div class="featured-book-info">

                <span class="featured-category">
                    ${book.category}
                </span>

                <h3>${book.title}</h3>

                <p class="book-author">
                    By ${book.author}
                </p>

                <p class="book-description">
                    ${book.description}
                </p>

                <a href="${book.readerPage}" class="read-book-btn">
                    Read Book →
                </a>

            </div>

        </div>
    `).join("");

});

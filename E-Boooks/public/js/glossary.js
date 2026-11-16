
"use strict";

/* ============================================================
   CODEVERSE GLOSSARY SEARCH
============================================================ */

(function () {

    function initializeGlossaries() {

        const glossaries =
            document.querySelectorAll(".cv-glossary");

        glossaries.forEach(function (glossary) {

            const input =
                glossary.querySelector(
                    ".cv-glossary-search"
                );

            const items = Array.from(
                glossary.querySelectorAll(
                    ".cv-glossary-item"
                )
            );

            const count =
                glossary.querySelector(
                    ".cv-glossary-count"
                );

            const empty =
                glossary.querySelector(
                    ".cv-glossary-empty"
                );

            if (!input) {
                return;
            }

            function updateSearch() {

                const query =
                    input.value.trim().toLowerCase();

                let visible = 0;

                items.forEach(function (item) {

                    const term =
                        item.querySelector("h3");

                    const definition =
                        item.querySelector("p");

                    const searchableText = [
                        term ? term.textContent : "",
                        definition
                            ? definition.textContent
                            : ""
                    ].join(" ").toLowerCase();

                    const matches =
                        searchableText.includes(query);

                    item.hidden = !matches;

                    if (matches) {
                        visible++;
                    }

                });

                if (count) {

                    count.textContent =
                        visible +
                        " of " +
                        items.length +
                        " terms";

                }

                if (empty) {
                    empty.hidden = visible !== 0;
                }

            }

            input.addEventListener(
                "input",
                updateSearch
            );

            updateSearch();

        });

    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeGlossaries,
            { once: true }
        );

    } else {

        initializeGlossaries();

    }

})();

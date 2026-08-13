let media = [];

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupFilters();
    setupModal();
    loadMedia();
});


/* =====================================================
   LOAD MEDIA
===================================================== */

async function loadMedia() {
    const grid = document.querySelector("#library-grid");
    const count = document.querySelector("#results-count");

    try {
        const response = await fetch("./data/media.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `media.json returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("media.json does not contain an array.");
        }

        media = data;

        console.log(`Loaded ${media.length} media entries.`);

        populateGenres();
        displayMedia();

    } catch (error) {
        console.error("Library error:", error);

        if (count) {
            count.textContent = "Unable to load media";
        }

        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load the media library.</h3>
                    <p>
                        There was a problem loading the media data.
                    </p>
                </div>
            `;
        }
    }
}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {
    const menuButton = document.querySelector("#menu-button");
    const siteNav = document.querySelector("#site-nav");

    if (!menuButton || !siteNav) {
        return;
    }

    menuButton.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("open");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );
    });
}


/* =====================================================
   FILTER SETUP
===================================================== */

function setupFilters() {
    document
        .querySelector("#search-input")
        ?.addEventListener("input", displayMedia);

    document
        .querySelector("#type-filter")
        ?.addEventListener("change", displayMedia);

    document
        .querySelector("#genre-filter")
        ?.addEventListener("change", displayMedia);

    document
        .querySelector("#rating-filter")
        ?.addEventListener("change", displayMedia);

    document
        .querySelector("#clear-filters")
        ?.addEventListener("click", clearFilters);
}


/* =====================================================
   GENRES
===================================================== */

function populateGenres() {
    const genreFilter = document.querySelector("#genre-filter");

    if (!genreFilter) {
        return;
    }

    const genres = [
        ...new Set(
            media.flatMap(item =>
                Array.isArray(item.genre)
                    ? item.genre
                    : []
            )
        )
    ].sort();

    genreFilter.innerHTML = `
        <option value="all">All Genres</option>
    `;

    genres.forEach(genre => {
        const option = document.createElement("option");

        option.value = genre;
        option.textContent = genre;

        genreFilter.appendChild(option);
    });
}


/* =====================================================
   FILTERING
===================================================== */

function getFilteredMedia() {
    const searchInput =
        document.querySelector("#search-input");

    const typeFilter =
        document.querySelector("#type-filter");

    const genreFilter =
        document.querySelector("#genre-filter");

    const ratingFilter =
        document.querySelector("#rating-filter");

    const searchTerm =
        searchInput?.value.trim().toLowerCase() ?? "";

    const selectedType =
        typeFilter?.value ?? "all";

    const selectedGenre =
        genreFilter?.value ?? "all";

    const minimumRating =
        Number(ratingFilter?.value ?? 0);

    return media.filter(item => {

        const title =
            String(item.title ?? "").toLowerCase();

        const matchesSearch =
            !searchTerm ||
            title.includes(searchTerm);

        const matchesType =
            selectedType === "all" ||
            item.mediaType === selectedType;

        const matchesGenre =
            selectedGenre === "all" ||
            (
                Array.isArray(item.genre) &&
                item.genre.includes(selectedGenre)
            );

        const matchesRating =
            Number(item.rating) >= minimumRating;

        return (
            matchesSearch &&
            matchesType &&
            matchesGenre &&
            matchesRating
        );
    });
}


/* =====================================================
   DISPLAY MEDIA
===================================================== */

function displayMedia() {
    const grid =
        document.querySelector("#library-grid");

    const count =
        document.querySelector("#results-count");

    if (!grid) {
        return;
    }

    const filteredMedia =
        getFilteredMedia();

    if (count) {
        count.textContent =
            `${filteredMedia.length} title${filteredMedia.length === 1 ? "" : "s"}`;
    }

    if (filteredMedia.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No titles found</h3>
                <p>
                    Try changing your search or filters.
                </p>
            </div>
        `;

        return;
    }

    grid.innerHTML = "";

    filteredMedia.forEach(item => {
        grid.appendChild(createMediaCard(item));
    });
}


/* =====================================================
   MEDIA CARD
===================================================== */

function createMediaCard(item) {
    const card =
        document.createElement("article");

    card.className = "media-card";

    const primaryGenre =
        Array.isArray(item.genre) &&
        item.genre.length > 0
            ? item.genre[0]
            : "Unknown";

    card.innerHTML = `
        <button
            class="card-button"
            type="button"
            data-media-id="${item.id}"
            aria-label="View details for ${escapeHTML(item.title)}"
        >

            <div class="media-card-image">

                <img
                    src="${escapeHTML(item.image || "")}"
                    alt="${escapeHTML(item.title)} poster"
                    loading="lazy"
                >

            </div>

            <div class="media-card-content">

                <h3>
                    ${escapeHTML(item.title)}
                </h3>

                <p class="rating">
                    ★ ${formatRating(item.rating)}
                </p>

                <p class="media-meta">
                    ${escapeHTML(item.studio || "Unknown Studio")}
                </p>

                <p class="media-type">
                    ${escapeHTML(item.mediaType || "Unknown")}
                </p>

                <p class="media-genre">
                    ${escapeHTML(primaryGenre)}
                </p>

            </div>

        </button>
    `;

    const image =
        card.querySelector("img");

    if (image) {
        image.addEventListener("error", () => {

            image.style.display = "none";

            const container =
                image.parentElement;

            container.classList.add(
                "image-placeholder"
            );

            container.innerHTML = `
                <span>Image unavailable</span>
            `;
        });
    }

    return card;
}


/* =====================================================
   MODAL
===================================================== */

function setupModal() {
    const modal =
        document.querySelector("#media-modal");

    const closeButton =
        document.querySelector("#modal-close");

    const grid =
        document.querySelector("#library-grid");

    if (!modal || !closeButton || !grid) {
        return;
    }

    grid.addEventListener("click", event => {

        const button =
            event.target.closest(
                "[data-media-id]"
            );

        if (!button) {
            return;
        }

        const id =
            Number(button.dataset.mediaId);

        const item =
            media.find(
                mediaItem =>
                    mediaItem.id === id
            );

        if (item) {
            openModal(item);
        }
    });

    closeButton.addEventListener(
        "click",
        () => {
            modal.close();
        }
    );

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                modal.close();
            }

        }
    );
}


/* =====================================================
   OPEN MODAL
===================================================== */

function openModal(item) {
    const modal =
        document.querySelector("#media-modal");

    const details =
        document.querySelector("#modal-details");

    if (!modal || !details) {
        return;
    }

    const isSeries =
        item.mediaType === "TV Series" ||
        item.mediaType === "Anime Series";

    const lengthText = isSeries
        ? `${item.episodes ?? 0} episodes`
        : `${item.runtime ?? 0} minutes`;

    const genres =
        Array.isArray(item.genre)
            ? item.genre.join(", ")
            : "Unknown";

    const collection =
        getCollection();

    const id =
        Number(item.id);

    const isFavorite =
        collection.favorites.includes(id);

    const isWatching =
        collection.watching.includes(id);

    const isCompleted =
        collection.completed.includes(id);

    details.innerHTML = `
        <div class="modal-body">

            <div class="modal-poster">

                <img
                    src="${escapeHTML(item.image || "")}"
                    alt="${escapeHTML(item.title)} poster"
                    loading="lazy"
                >

            </div>


            <div class="modal-details">

                <p class="eyebrow">
                    ${escapeHTML(item.mediaType || "Unknown")}
                </p>

                <h2>
                    ${escapeHTML(item.title)}
                </h2>

                <p class="rating">
                    ★ ${formatRating(item.rating)}
                </p>

                <p>
                    <strong>Studio:</strong>
                    ${escapeHTML(item.studio || "Unknown")}
                </p>

                <p>
                    <strong>Year:</strong>
                    ${item.year ?? "Unknown"}
                </p>

                <p>
                    <strong>
                        ${isSeries ? "Episodes" : "Runtime"}:
                    </strong>
                    ${escapeHTML(lengthText)}
                </p>

                <p>
                    <strong>Genre:</strong>
                    ${escapeHTML(genres)}
                </p>

                <p>
                    ${escapeHTML(
                        item.description ||
                        "No description available."
                    )}
                </p>

            </div>


            <!--
                IMPORTANT:
                These buttons are outside .modal-details.
                This allows them to occupy the entire
                bottom row of the modal.
            -->

            <div class="modal-actions">

                <button
                    class="button"
                    type="button"
                    data-favorite-id="${item.id}"
                >
                    ${isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"}
                </button>

                <button
                    class="button secondary"
                    type="button"
                    data-watching-id="${item.id}"
                >
                    ${isWatching
                        ? "Remove from Watching"
                        : "Add to Watching"}
                </button>

                <button
                    class="button secondary"
                    type="button"
                    data-completed-id="${item.id}"
                >
                    ${isCompleted
                        ? "Mark as Uncompleted"
                        : "Mark as Completed"}
                </button>

            </div>

        </div>
    `;


    /* =================================================
       MODAL IMAGE
    ================================================= */

    const modalImage =
        details.querySelector(".modal-poster img");

    if (modalImage) {

        modalImage.addEventListener(
            "error",
            () => {

                modalImage.style.display =
                    "none";

                const poster =
                    modalImage.parentElement;

                poster.classList.add(
                    "image-placeholder"
                );

                poster.innerHTML = `
                    <span>Image unavailable</span>
                `;
            }
        );
    }


    /* =================================================
       COLLECTION BUTTONS
    ================================================= */

    setupCollectionButtons(item);

    modal.showModal();
}


/* =====================================================
   COLLECTION STORAGE
===================================================== */

const COLLECTION_KEY =
    "mywatchlist-collection";


function getCollection() {

    try {

        const saved =
            localStorage.getItem(
                COLLECTION_KEY
            );

        if (!saved) {

            return {
                favorites: [],
                watching: [],
                completed: []
            };

        }

        const collection =
            JSON.parse(saved);

        return {
            favorites:
                Array.isArray(collection.favorites)
                    ? collection.favorites
                    : [],

            watching:
                Array.isArray(collection.watching)
                    ? collection.watching
                    : [],

            completed:
                Array.isArray(collection.completed)
                    ? collection.completed
                    : []
        };

    } catch (error) {

        console.error(
            "Unable to read collection:",
            error
        );

        return {
            favorites: [],
            watching: [],
            completed: []
        };
    }
}


function saveCollection(collection) {

    localStorage.setItem(
        COLLECTION_KEY,
        JSON.stringify(collection)
    );
}


/* =====================================================
   COLLECTION BUTTONS
===================================================== */

function setupCollectionButtons(item) {

    const favoriteButton =
        document.querySelector(
            "[data-favorite-id]"
        );

    const watchingButton =
        document.querySelector(
            "[data-watching-id]"
        );

    const completedButton =
        document.querySelector(
            "[data-completed-id]"
        );

    const id =
        Number(item.id);


    /* =================================================
       FAVORITES
    ================================================= */

    if (favoriteButton) {

        favoriteButton.addEventListener(
            "click",
            () => {

                const collection =
                    getCollection();

                const index =
                    collection.favorites.indexOf(id);

                if (index === -1) {

                    collection.favorites.push(id);

                    favoriteButton.textContent =
                        "Remove from Favorites";

                } else {

                    collection.favorites.splice(
                        index,
                        1
                    );

                    favoriteButton.textContent =
                        "Add to Favorites";
                }

                saveCollection(collection);
            }
        );
    }


    /* =================================================
       WATCHING
    ================================================= */

    if (watchingButton) {

        watchingButton.addEventListener(
            "click",
            () => {

                const collection =
                    getCollection();

                const index =
                    collection.watching.indexOf(id);

                if (index === -1) {

                    collection.watching.push(id);

                    watchingButton.textContent =
                        "Remove from Watching";

                } else {

                    collection.watching.splice(
                        index,
                        1
                    );

                    watchingButton.textContent =
                        "Add to Watching";
                }

                saveCollection(collection);
            }
        );
    }


    /* =================================================
       COMPLETED
    ================================================= */

    if (completedButton) {

        completedButton.addEventListener(
            "click",
            () => {

                const collection =
                    getCollection();

                const index =
                    collection.completed.indexOf(id);

                if (index === -1) {

                    collection.completed.push(id);

                    completedButton.textContent =
                        "Mark as Uncompleted";

                    /*
                     * If something is completed,
                     * remove it from Continue Watching.
                     */
                    const watchingIndex =
                        collection.watching.indexOf(id);

                    if (watchingIndex !== -1) {

                        collection.watching.splice(
                            watchingIndex,
                            1
                        );
                    }

                } else {

                    collection.completed.splice(
                        index,
                        1
                    );

                    completedButton.textContent =
                        "Mark as Completed";
                }

                saveCollection(collection);
            }
        );
    }
}


/* =====================================================
   CLEAR FILTERS
===================================================== */

function clearFilters() {

    const searchInput =
        document.querySelector(
            "#search-input"
        );

    const typeFilter =
        document.querySelector(
            "#type-filter"
        );

    const genreFilter =
        document.querySelector(
            "#genre-filter"
        );

    const ratingFilter =
        document.querySelector(
            "#rating-filter"
        );

    if (searchInput) {
        searchInput.value = "";
    }

    if (typeFilter) {
        typeFilter.value = "all";
    }

    if (genreFilter) {
        genreFilter.value = "all";
    }

    if (ratingFilter) {
        ratingFilter.value = "0";
    }

    displayMedia();
}


/* =====================================================
   HELPERS
===================================================== */

function formatRating(value) {

    const rating =
        Number(value);

    return Number.isFinite(rating)
        ? rating.toFixed(1)
        : "N/A";
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
const DATA_URL = "data/media.json";
const COLLECTION_KEY = "mywatchlist-collection";

let media = [];


// ==================================================
// LOAD MEDIA
// ==================================================

async function loadMedia() {

    try {

        const response = await fetch(DATA_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "media.json does not contain an array."
            );
        }

        media = data;

        console.log(
            `Loaded ${media.length} media entries.`
        );

        initializeHomePage();

    } catch (error) {

        console.error(
            "Unable to load media.json:",
            error
        );

        showLoadingError("continue-watching");
        showLoadingError("featured-picks");
        showLoadingError("recommendation");
    }
}


// ==================================================
// HOME PAGE
// ==================================================

function initializeHomePage() {

    const continueWatching =
        document.querySelector("#continue-watching");

    const featuredPicks =
        document.querySelector("#featured-picks");

    const recommendation =
        document.querySelector("#recommendation");

    const stats =
        document.querySelector("#collection-stats");


    if (continueWatching) {
        renderContinueWatching(continueWatching);
    }

    if (featuredPicks) {
        renderFeaturedPicks(featuredPicks);
    }

    if (recommendation) {
        renderRecommendation(recommendation);
    }

    if (stats) {
        renderCollectionStats(stats);
    }
}


// ==================================================
// CONTINUE WATCHING
// ==================================================

function renderContinueWatching(container) {

    const collection = getCollection();

    const watchingIds =
        collection.watching || [];

    const watching = watchingIds
        .map(id => findMedia(id))
        .filter(Boolean)
        .slice(0, 5);


    if (watching.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <p>
                    You aren't currently watching anything.
                </p>

                <a
                    class="button"
                    href="library.html"
                >
                    Browse Library
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML = watching
        .map(createMediaCard)
        .join("");

    attachMediaCardEvents(container);
}


// ==================================================
// FEATURED PICKS
// ==================================================

function renderFeaturedPicks(container) {

    if (!media.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>No featured picks available.</p>
            </div>
        `;

        return;
    }


    const featured = [...media]
        .sort(
            (a, b) =>
                Number(b.rating) - Number(a.rating)
        )
        .slice(0, 5);


    container.innerHTML = featured
        .map(createMediaCard)
        .join("");

    attachMediaCardEvents(container);
}


// ==================================================
// RANDOM RECOMMENDATIONS
// ==================================================

function renderRecommendation(container) {

    if (!media.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>No recommendations available.</p>
            </div>
        `;

        return;
    }


    const shuffled = [...media]
        .sort(() => Math.random() - 0.5);

    const recommendations =
        shuffled.slice(0, 2);


    container.innerHTML = `
        <div class="recommendation-grid">

            ${recommendations
                .map(createRecommendationCard)
                .join("")}

        </div>
    `;
}


// ==================================================
// RECOMMENDATION CARD
// ==================================================

function createRecommendationCard(item) {

    return `
        <article
            class="recommendation-card"
        >

            <div class="recommendation-image">

                <img
                    src="${escapeHTML(item.image || "")}"
                    alt="${escapeHTML(item.title)} poster"
                    loading="lazy"
                >

            </div>


            <div class="recommendation-content">

                <p class="eyebrow">
                    RECOMMENDED FOR YOU
                </p>


                <h3>
                    ${escapeHTML(item.title)}
                </h3>


                <p>
                    ${escapeHTML(
                        item.description ||
                        "No description available."
                    )}
                </p>


                <div class="media-meta">

                    ${item.year ?? "Unknown"}
                    ·
                    ${escapeHTML(
                        item.studio ||
                        "Unknown Studio"
                    )}
                    ·
                    ⭐ ${formatRating(item.rating)}

                </div>


                <button
                    class="button recommendation-details"
                    type="button"
                    data-media-id="${item.id}"
                >
                    View Details
                </button>

            </div>

        </article>
    `;
}


// ==================================================
// COLLECTION STATISTICS
// ==================================================

function renderCollectionStats(container) {

    const collection = getCollection();

    const favorites =
        collection.favorites || [];

    const watching =
        collection.watching || [];

    const completed =
        collection.completed || [];


    const stats = [

        {
            value: media.length,
            label: "Media Available"
        },

        {
            value: favorites.length,
            label: "Favorites"
        },

        {
            value: watching.length,
            label: "Watching"
        },

        {
            value: completed.length,
            label: "Completed"
        }

    ];


    container.innerHTML = stats
        .map(stat => `

            <div class="stat-card">

                <strong>
                    ${stat.value}
                </strong>

                <span>
                    ${stat.label}
                </span>

            </div>

        `)
        .join("");
}


// ==================================================
// MEDIA CARDS
// ==================================================

function createMediaCard(item) {

    const image =
        item.image ||
        "images/placeholder.jpg";


    return `
        <article
            class="media-card"
            data-media-id="${item.id}"
            tabindex="0"
            role="button"
            aria-label="View details for ${escapeHTML(item.title)}"
        >

            <div class="media-card-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(item.title)} poster"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >

            </div>


            <div class="media-card-content">

                <h3>
                    ${escapeHTML(item.title)}
                </h3>

                <p class="media-meta">
                    ${item.year ?? "Unknown"}
                    ·
                    ${escapeHTML(
                        item.studio ||
                        "Unknown Studio"
                    )}
                </p>

                <p class="rating">
                    ★ ${formatRating(item.rating)}
                </p>

            </div>

        </article>
    `;
}


// ==================================================
// CARD EVENTS
// ==================================================

function attachMediaCardEvents(container) {

    if (container.dataset.eventsAttached === "true") {
        return;
    }

    container.dataset.eventsAttached = "true";


    container.addEventListener("click", event => {

        if (
            event.target.closest(
                ".recommendation-details"
            )
        ) {
            return;
        }


        const card =
            event.target.closest(
                ".media-card"
            );


        if (
            !card ||
            !container.contains(card)
        ) {
            return;
        }


        const id =
            Number(
                card.dataset.mediaId
            );


        openMediaDetails(id);
    });


    container.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }


            const card =
                event.target.closest(
                    ".media-card"
                );


            if (
                !card ||
                !container.contains(card)
            ) {
                return;
            }


            event.preventDefault();


            const id =
                Number(
                    card.dataset.mediaId
                );


            openMediaDetails(id);
        }
    );
}


// ==================================================
// FIND MEDIA
// ==================================================

function findMedia(id) {

    return media.find(
        item =>
            Number(item.id) === Number(id)
    );
}


// ==================================================
// COLLECTION
// ==================================================

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
                (collection.favorites || [])
                    .map(Number),

            watching:
                (collection.watching || [])
                    .map(Number),

            completed:
                (collection.completed || [])
                    .map(Number)

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


// ==================================================
// UPDATE COLLECTION
// ==================================================

function updateCollection(type, id) {

    const collection =
        getCollection();

    const numericId =
        Number(id);


    if (!collection[type]) {
        collection[type] = [];
    }


    const index =
        collection[type].indexOf(
            numericId
        );


    let added;


    if (index === -1) {

        collection[type].push(
            numericId
        );

        added = true;

    } else {

        collection[type].splice(
            index,
            1
        );

        added = false;
    }


    localStorage.setItem(
        COLLECTION_KEY,
        JSON.stringify(collection)
    );


    const continueWatching =
        document.querySelector(
            "#continue-watching"
        );


    if (continueWatching) {

        renderContinueWatching(
            continueWatching
        );

    }


    const stats =
        document.querySelector(
            "#collection-stats"
        );


    if (stats) {

        renderCollectionStats(
            stats
        );

    }


    return added;
}


// ==================================================
// CREATE HOMEPAGE MODAL
// ==================================================

function setupHomeModal() {

    let modal =
        document.querySelector(
            "#media-modal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "dialog"
            );


        modal.id =
            "media-modal";

        modal.className =
            "media-modal";


        modal.innerHTML = `

            <div class="modal-content">

                <button
                    id="modal-close"
                    class="modal-close"
                    type="button"
                    aria-label="Close details"
                >
                    &times;
                </button>


                <div id="modal-details"></div>

            </div>

        `;


        document.body.appendChild(
            modal
        );
    }


    const closeButton =
        modal.querySelector(
            "#modal-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {
                modal.close();
            }
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {
                modal.close();
            }

        }
    );
}


// ==================================================
// HOMEPAGE DETAILS BUTTON
// ==================================================

function setupMediaDetailsEvents() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".recommendation-details"
                );


            if (!button) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            const id =
                Number(
                    button.dataset.mediaId
                );


            openMediaDetails(id);

        }
    );
}


// ==================================================
// OPEN MEDIA DETAILS
// ==================================================

function openMediaDetails(id) {

    const item =
        findMedia(id);


    if (!item) {

        console.error(
            "Could not find media with ID:",
            id
        );

        return;
    }


    const modal =
        document.querySelector(
            "#media-modal"
        );


    const details =
        document.querySelector(
            "#modal-details"
        );


    if (!modal || !details) {

        console.error(
            "Media modal was not found."
        );

        return;
    }


    const isSeries =
        item.mediaType === "TV Series" ||
        item.mediaType === "Anime Series";


    const lengthText =
        isSeries
            ? `${item.episodes ?? 0} episodes`
            : `${item.runtime ?? 0} minutes`;


    const genres =
        Array.isArray(item.genre)
            ? item.genre.join(", ")
            : "Unknown";


    /*
     * IMPORTANT:
     *
     * .modal-actions is now OUTSIDE .modal-details.
     * This keeps the buttons in the modal footer/action
     * area instead of making them part of the details
     * column.
     */

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
                    ${escapeHTML(
                        item.mediaType ||
                        item.type ||
                        "Unknown"
                    )}
                </p>


                <h2>
                    ${escapeHTML(item.title)}
                </h2>


                <p class="rating">
                    ★ ${formatRating(item.rating)}
                </p>


                <p>
                    <strong>Studio:</strong>
                    ${escapeHTML(
                        item.studio ||
                        "Unknown Studio"
                    )}
                </p>


                <p>
                    <strong>Year:</strong>
                    ${item.year ?? "Unknown"}
                </p>


                <p>
                    <strong>
                        ${isSeries
                            ? "Episodes"
                            : "Runtime"}:
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


            <div class="modal-actions">

                <button
                    class="button"
                    type="button"
                    data-favorite-id="${item.id}"
                >
                    Add to Favorites
                </button>

                <button
                    class="button secondary"
                    type="button"
                    data-watching-id="${item.id}"
                >
                    Add to Watching
                </button>

                <button
                    class="button secondary"
                    type="button"
                    data-completed-id="${item.id}"
                >
                    Mark as Completed
                </button>

            </div>

        </div>
    `;


    // ==================================================
    // COLLECTION BUTTON STATE
    // ==================================================

    const collection =
        getCollection();


    const favoriteButton =
        details.querySelector(
            "[data-favorite-id]"
        );


    const watchingButton =
        details.querySelector(
            "[data-watching-id]"
        );


    const completedButton =
        details.querySelector(
            "[data-completed-id]"
        );


    // ==================================================
    // FAVORITES
    // ==================================================

    if (favoriteButton) {

        const isFavorite =
            collection.favorites.includes(
                Number(item.id)
            );


        favoriteButton.textContent =
            isFavorite
                ? "Remove from Favorites"
                : "Add to Favorites";


        favoriteButton.addEventListener(
            "click",
            () => {

                const added =
                    updateCollection(
                        "favorites",
                        item.id
                    );


                favoriteButton.textContent =
                    added
                        ? "Remove from Favorites"
                        : "Add to Favorites";

            }
        );
    }


    // ==================================================
    // CURRENTLY WATCHING
    // ==================================================

    if (watchingButton) {

        const isWatching =
            collection.watching.includes(
                Number(item.id)
            );


        watchingButton.textContent =
            isWatching
                ? "Remove from Watching"
                : "Add to Watching";


        watchingButton.addEventListener(
            "click",
            () => {

                const added =
                    updateCollection(
                        "watching",
                        item.id
                    );


                watchingButton.textContent =
                    added
                        ? "Remove from Watching"
                        : "Add to Watching";

            }
        );
    }


    // ==================================================
    // COMPLETED
    // ==================================================

    if (completedButton) {

        const isCompleted =
            collection.completed.includes(
                Number(item.id)
            );


        completedButton.textContent =
            isCompleted
                ? "Mark as Uncompleted"
                : "Mark as Completed";


        completedButton.addEventListener(
            "click",
            () => {

                const completed =
                    updateCollection(
                        "completed",
                        item.id
                    );


                completedButton.textContent =
                    completed
                        ? "Mark as Uncompleted"
                        : "Mark as Completed";


                if (completed) {

                    const currentCollection =
                        getCollection();


                    if (
                        currentCollection.watching.includes(
                            Number(item.id)
                        )
                    ) {

                        updateCollection(
                            "watching",
                            item.id
                        );

                    }

                }

            }
        );

    }


    // ==================================================
    // SHOW MODAL
    // ==================================================

    modal.showModal();
}


// ==================================================
// ERROR STATE
// ==================================================

function showLoadingError(id) {

    const container =
        document.querySelector(
            `#${id}`
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <p>
                Unable to load content data.
            </p>

            <p>
                Please make sure
                <strong>
                    data/media.json
                </strong>
                exists.
            </p>

        </div>

    `;
}


// ==================================================
// HTML SAFETY
// ==================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==================================================
// RATING
// ==================================================

function formatRating(value) {

    const rating =
        Number(value);


    return Number.isFinite(rating)
        ? rating.toFixed(1)
        : "N/A";
}


// ==================================================
// START
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupHomeModal();

        setupMediaDetailsEvents();

        loadMedia();

    }
);
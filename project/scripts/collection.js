let media = [];
let currentTierList = null;
let currentEditorMode = null;

const COLLECTION_KEY = "mywatchlist-collection";
const TIER_LIST_KEY = "mywatchlist-tier-lists";

const TIER_NAMES = ["S", "A", "B", "C", "D", "F"];


// ==================================================
// START
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {

    setupNavigation();
    setupModal();
    setupTierForm();
    setupFilterEvents();

    setupDragAutoScroll();

    await loadMedia();

    displayFavorites();
    displayWatching();
    displayCompleted();
    displaySavedTierLists();

});


// ==================================================
// LOAD MEDIA
// ==================================================

async function loadMedia() {

    try {

        const response = await fetch(
            "./data/media.json",
            {
                cache: "no-store"
            }
        );

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

        updateFilterValues();

    } catch (error) {

        console.error(
            "Could not load media:",
            error
        );

        [
            "#favorites-grid",
            "#collection-watching",
            "#collection-completed"
        ].forEach(selector => {

            const container =
                document.querySelector(selector);

            if (!container) {
                return;
            }

            container.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load media</h3>
                    <p>
                        There was a problem loading
                        the media data.
                    </p>
                </div>
            `;

        });

    }

}


// ==================================================
// NAVIGATION
// ==================================================

function setupNavigation() {

    const button =
        document.querySelector("#menu-button");

    const nav =
        document.querySelector("#site-nav");

    if (!button || !nav) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            const open =
                nav.classList.toggle("open");

            button.setAttribute(
                "aria-expanded",
                String(open)
            );

            button.setAttribute(
                "aria-label",
                open
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

        }
    );

}


// ==================================================
// COLLECTION STORAGE
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
                Array.isArray(collection.favorites)
                    ? collection.favorites.map(Number)
                    : [],

            watching:
                Array.isArray(collection.watching)
                    ? collection.watching.map(Number)
                    : [],

            completed:
                Array.isArray(collection.completed)
                    ? collection.completed.map(Number)
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


// ==================================================
// FAVORITES
// ==================================================

function displayFavorites() {

    const container =
        document.querySelector(
            "#favorites-grid"
        );

    if (!container) {
        return;
    }

    const collection =
        getCollection();

    const favorites =
        collection.favorites
            .map(id => findMedia(id))
            .filter(Boolean);

    if (favorites.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    You haven't added any favorites yet.
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

    container.innerHTML =
        favorites
            .map(createCard)
            .join("");

    attachCollectionCardEvents(container);

}


// ==================================================
// WATCHING
// ==================================================

function displayWatching() {

    const container =
        document.querySelector(
            "#collection-watching"
        );

    if (!container) {
        return;
    }

    const collection =
        getCollection();

    const watching =
        collection.watching
            .map(id => findMedia(id))
            .filter(Boolean);

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
                    Find Something to Watch
                </a>
            </div>
        `;

        return;
    }

    container.innerHTML =
        watching
            .map(createCard)
            .join("");

    attachCollectionCardEvents(container);

}


// ==================================================
// COMPLETED
// ==================================================

function displayCompleted() {

    const container =
        document.querySelector(
            "#collection-completed"
        );

    if (!container) {
        return;
    }

    const collection =
        getCollection();

    const completed =
        collection.completed
            .map(id => findMedia(id))
            .filter(Boolean);

    if (completed.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>
                    You haven't completed any titles yet.
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

    container.innerHTML =
        completed
            .map(createCard)
            .join("");

    attachCollectionCardEvents(container);

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
// MEDIA CARD
// ==================================================

function createCard(item) {

    const primaryGenre =
        Array.isArray(item.genre) &&
        item.genre.length > 0
            ? item.genre[0]
            : "Unknown";

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
                    ${escapeHTML(
                        item.studio ||
                        "Unknown Studio"
                    )}
                </p>

                <p class="media-type">
                    ${escapeHTML(
                        item.mediaType ||
                        "Unknown"
                    )}
                </p>

                <p class="media-genre">
                    ${escapeHTML(primaryGenre)}
                </p>

            </div>

        </article>
    `;

}


// ==================================================
// COLLECTION CARD EVENTS
// ==================================================

function attachCollectionCardEvents(container) {

    container
        .querySelectorAll("[data-media-id]")
        .forEach(card => {

            const id =
                Number(card.dataset.mediaId);

            card.addEventListener(
                "click",
                () => {

                    const item =
                        findMedia(id);

                    if (item) {
                        openModal(item);
                    }

                }
            );

            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key !== "Enter" &&
                        event.key !== " "
                    ) {
                        return;
                    }

                    event.preventDefault();

                    const item =
                        findMedia(id);

                    if (item) {
                        openModal(item);
                    }

                }
            );

        });

}


// ==================================================
// MODAL
// ==================================================

function setupModal() {

    const modal =
        document.querySelector(
            "#media-modal"
        );

    const closeButton =
        document.querySelector(
            "#modal-close"
        );

    if (!modal || !closeButton) {
        return;
    }

    closeButton.addEventListener(
        "click",
        () => modal.close()
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


function openModal(item) {

    const modal =
        document.querySelector(
            "#media-modal"
        );

    const details =
        document.querySelector(
            "#modal-details"
        );

    if (!modal || !details) {
        return;
    }

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

                <div class="modal-actions">

                    <button
                        class="button"
                        type="button"
                        id="modal-favorite-button"
                    >
                        ${
                            isFavorite
                                ? "Remove from Favorites"
                                : "Add to Favorites"
                        }
                    </button>

                    <button
                        class="button secondary"
                        type="button"
                        id="modal-watching-button"
                    >
                        ${
                            isWatching
                                ? "Remove from Watching"
                                : "Add to Watching"
                        }
                    </button>

                    <button
                        class="button secondary"
                        type="button"
                        id="modal-completed-button"
                    >
                        ${
                            isCompleted
                                ? "Mark as Uncompleted"
                                : "Mark as Completed"
                        }
                    </button>

                </div>

            </div>

        </div>
    `;

    const favoriteButton =
        details.querySelector(
            "#modal-favorite-button"
        );

    favoriteButton?.addEventListener(
        "click",
        () => {

            toggleCollection(
                "favorites",
                id
            );

            const updated =
                getCollection();

            favoriteButton.textContent =
                updated.favorites.includes(id)
                    ? "Remove from Favorites"
                    : "Add to Favorites";

            refreshCollectionSections();

        }
    );

    const watchingButton =
        details.querySelector(
            "#modal-watching-button"
        );

    watchingButton?.addEventListener(
        "click",
        () => {

            toggleCollection(
                "watching",
                id
            );

            const updated =
                getCollection();

            watchingButton.textContent =
                updated.watching.includes(id)
                    ? "Remove from Watching"
                    : "Add to Watching";

            refreshCollectionSections();

        }
    );

    const completedButton =
        details.querySelector(
            "#modal-completed-button"
        );

    completedButton?.addEventListener(
        "click",
        () => {

            const collection =
                getCollection();

            const index =
                collection.completed.indexOf(id);

            if (index === -1) {

                collection.completed.push(id);

                const watchingIndex =
                    collection.watching.indexOf(id);

                if (watchingIndex !== -1) {

                    collection.watching.splice(
                        watchingIndex,
                        1
                    );

                }

                completedButton.textContent =
                    "Mark as Uncompleted";

            } else {

                collection.completed.splice(
                    index,
                    1
                );

                completedButton.textContent =
                    "Mark as Completed";

            }

            saveCollection(collection);

            refreshCollectionSections();

        }
    );

    modal.showModal();

}


function toggleCollection(type, id) {

    const collection =
        getCollection();

    const numericId =
        Number(id);

    const index =
        collection[type].indexOf(numericId);

    if (index === -1) {

        collection[type].push(
            numericId
        );

    } else {

        collection[type].splice(
            index,
            1
        );

    }

    saveCollection(collection);

}


function refreshCollectionSections() {

    displayFavorites();
    displayWatching();
    displayCompleted();

}


// ==================================================
// TIER FORM
// ==================================================

function setupTierForm() {

    const form =
        document.querySelector(
            "#tier-form"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            generateNewTierList();

        }
    );

}


// ==================================================
// FILTER EVENTS
// ==================================================

function setupFilterEvents() {

    const filter =
        document.querySelector(
            "#tier-filter"
        );

    const type =
        document.querySelector(
            "#tier-type"
        );

    filter?.addEventListener(
        "change",
        updateFilterValues
    );

    type?.addEventListener(
        "change",
        updateFilterValues
    );

}


// ==================================================
// FILTER VALUES
// ==================================================

function updateFilterValues() {

    const filter =
        document.querySelector(
            "#tier-filter"
        );

    const select =
        document.querySelector(
            "#tier-filter-value"
        );

    const type =
        document.querySelector(
            "#tier-type"
        );

    if (!filter || !select) {
        return;
    }

    const selectedType =
        type?.value || "all";

    const available =
        getMediaForType(
            selectedType
        );

    let values = [];

    if (filter.value === "genre") {

        values = [
            ...new Set(
                available.flatMap(
                    item =>
                        Array.isArray(item.genre)
                            ? item.genre
                            : []
                )
            )
        ].sort();

    } else if (filter.value === "studio") {

        values = [
            ...new Set(
                available
                    .map(item => item.studio)
                    .filter(Boolean)
            )
        ].sort();

    } else if (filter.value === "rating") {

        values = [
            "9",
            "8",
            "7"
        ];

    }

    select.innerHTML = `
        <option value="all">
            All
        </option>
    `;

    values.forEach(value => {

        const option =
            document.createElement(
                "option"
            );

        option.value = value;

        option.textContent =
            filter.value === "rating"
                ? `${value}.0+`
                : value;

        select.appendChild(option);

    });

}


// ==================================================
// MEDIA TYPE FILTERING
// ==================================================

function getMediaForType(type) {

    if (!type || type === "all") {
        return [...media];
    }

    /*
     * Anime intentionally includes:
     *
     * Anime Series
     * Anime Movie
     *
     * This allows both shows and movies to be
     * placed into one tier list without using
     * All Media.
     */

    if (type === "Anime") {

        return media.filter(
            item =>
                item.mediaType === "Anime Series" ||
                item.mediaType === "Anime Movie"
        );

    }

    return media.filter(
        item =>
            item.mediaType === type
    );

}


// ==================================================
// APPLY FILTER
// ==================================================

function getFilteredMedia(
    type,
    filter,
    filterValue
) {

    let available =
        getMediaForType(type);

    if (
        filterValue === "all" ||
        !filterValue
    ) {
        return available;
    }

    if (filter === "genre") {

        return available.filter(
            item =>
                Array.isArray(item.genre) &&
                item.genre.includes(
                    filterValue
                )
        );

    }

    if (filter === "studio") {

        return available.filter(
            item =>
                item.studio === filterValue
        );

    }

    if (filter === "rating") {

        return available.filter(
            item =>
                Number(item.rating) >=
                Number(filterValue)
        );

    }

    return available;

}


// ==================================================
// CREATE NEW TIER LIST
// ==================================================

function generateNewTierList() {

    const name =
        document.querySelector(
            "#tier-name"
        )?.value.trim();

    const type =
        document.querySelector(
            "#tier-type"
        )?.value;

    const filter =
        document.querySelector(
            "#tier-filter"
        )?.value;

    const filterValue =
        document.querySelector(
            "#tier-filter-value"
        )?.value;

    if (!name || !type) {
        return;
    }

    const available =
        getFilteredMedia(
            type,
            filter,
            filterValue
        );

    currentTierList = {

        id: Date.now(),

        name,

        mediaType: type,

        filter:
            filter || "genre",

        filterValue:
            filterValue || "all",

        tiers: {

            S: [],
            A: [],
            B: [],
            C: [],
            D: [],
            F: []

        },

        available:
            available.map(
                item =>
                    Number(item.id)
            )

    };

    currentEditorMode =
        "new";

    renderNewTierBuilder();

}


// ==================================================
// RENDER NEW BUILDER
// ==================================================

function renderNewTierBuilder() {

    removeNewBuilder();

    const form =
        document.querySelector(
            "#tier-form"
        );

    if (!form || !currentTierList) {
        return;
    }

    const builder =
        createTierBuilder(
            currentTierList,
            true
        );

    form.insertAdjacentElement(
        "afterend",
        builder
    );

    setupTierBuilderEvents(
        builder,
        currentTierList,
        "new"
    );

    builder.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==================================================
// REMOVE NEW BUILDER
// ==================================================

function removeNewBuilder() {

    document
        .querySelector(
            "#new-tier-builder"
        )
        ?.remove();

}


// ==================================================
// CREATE TIER BUILDER
// ==================================================

function createTierBuilder(
    tierList,
    isNew
) {

    const builder =
        document.createElement(
            "section"
        );

    builder.className =
        "tier-builder";

    builder.id =
        isNew
            ? "new-tier-builder"
            : `tier-builder-${tierList.id}`;

    builder.innerHTML = `

        <div class="section-heading">

            <div>

                <p class="eyebrow">
                    TIER BUILDER
                </p>

                <h2>
                    ${escapeHTML(
                        tierList.name
                    )}
                </h2>

            </div>

        </div>

        <div class="tier-board">

            ${TIER_NAMES
                .map(
                    tier =>
                        createTierRow(
                            tier,
                            tierList
                        )
                )
                .join("")}

        </div>

        <div class="available-titles">

            <h3>
                Unranked Titles
            </h3>

            <p>
                Drag titles into a tier to rank them.
                Drag a ranked title back here to remove
                it from its tier.
            </p>

            <div
                class="poster-grid tier-unranked"
                data-unranked="true"
            ></div>

        </div>

        <div class="tier-builder-actions">

            <button
                type="button"
                class="button"
                data-tier-save
            >
                ${
                    isNew
                        ? "Save Tier List"
                        : "Save Changes"
                }
            </button>

            <button
                type="button"
                class="button secondary"
                data-tier-cancel
            >
                ${
                    isNew
                        ? "Cancel"
                        : "Cancel Edit"
                }
            </button>

        </div>

    `;

    renderBuilderContents(
        builder,
        tierList
    );

    return builder;

}


// ==================================================
// TIER ROW
// ==================================================

function createTierRow(
    tier,
    tierList
) {

    return `
        <div
            class="tier-row tier-${tier.toLowerCase()}"
        >

            <div class="tier-label">
                ${tier}
            </div>

            <div
                class="tier-drop-zone"
                data-tier="${tier}"
                data-tier-list-id="${tierList.id}"
            ></div>

        </div>
    `;

}


// ==================================================
// RENDER BUILDER CONTENTS
// ==================================================

function renderBuilderContents(
    builder,
    tierList
) {

    if (!builder) {
        return;
    }

    TIER_NAMES.forEach(tier => {

        const zone =
            builder.querySelector(
                `.tier-drop-zone[data-tier="${tier}"]`
            );

        if (!zone) {
            return;
        }

        zone.innerHTML =
            tierList.tiers[tier]
                .map(
                    id =>
                        createTierItem(id)
                )
                .join("");

    });

    const unranked =
        builder.querySelector(
            "[data-unranked]"
        );

    if (!unranked) {
        return;
    }

    const rankedIds =
        getRankedIds(tierList);

    const unrankedIds =
        tierList.available.filter(
            id =>
                !rankedIds.includes(
                    Number(id)
                )
        );

    unranked.innerHTML =
        unrankedIds
            .map(
                id =>
                    createPosterItem(id)
            )
            .join("");

}


// ==================================================
// CREATE RANKED ITEM
// ==================================================

function createTierItem(id) {

    const item =
        findMedia(id);

    if (!item) {
        return "";
    }

    return `
        <div
            class="tier-item"
            draggable="true"
            data-media-id="${item.id}"
        >

            <img
                src="${escapeHTML(
                    item.image || ""
                )}"
                alt="${escapeHTML(
                    item.title
                )} poster"
                loading="lazy"
            >

            <span class="tier-item-title">
                ${escapeHTML(
                    item.title
                )}
            </span>

        </div>
    `;

}


// ==================================================
// CREATE UNRANKED ITEM
// ==================================================

function createPosterItem(id) {

    const item =
        findMedia(id);

    if (!item) {
        return "";
    }

    return `
        <div
            class="poster-item"
            draggable="true"
            data-media-id="${item.id}"
        >

            <img
                src="${escapeHTML(
                    item.image || ""
                )}"
                alt="${escapeHTML(
                    item.title
                )} poster"
                loading="lazy"
            >

            <p>
                ${escapeHTML(
                    item.title
                )}
            </p>

        </div>
    `;

}


// ==================================================
// TIER BUILDER EVENTS
// ==================================================

function setupTierBuilderEvents(
    builder,
    tierList,
    mode
) {

    if (!builder) {
        return;
    }

    /*
     * Use event delegation instead of attaching
     * listeners to every single poster.
     *
     * This is one of the major performance
     * improvements in this version.
     */

    if (
        builder.dataset.eventsAttached === "true"
    ) {
        return;
    }

    builder.dataset.eventsAttached = "true";


    // ==================================================
    // DRAG START
    // ==================================================

    builder.addEventListener(
        "dragstart",
        event => {

            const item =
                event.target.closest(
                    "[data-media-id][draggable='true']"
                );

            if (!item) {
                return;
            }

            if (mode === "view") {
                event.preventDefault();
                return;
            }

            const id =
                Number(
                    item.dataset.mediaId
                );

            if (!id) {
                return;
            }

            event.dataTransfer.effectAllowed =
                "move";

            event.dataTransfer.setData(
                "text/plain",
                String(id)
            );

            item.classList.add(
                "dragging"
            );

            builder.dataset.draggingId =
                String(id);

        }
    );


    // ==================================================
    // DRAG END
    // ==================================================

    builder.addEventListener(
        "dragend",
        event => {

            const item =
                event.target.closest(
                    "[data-media-id]"
                );

            item?.classList.remove(
                "dragging"
            );

            delete builder.dataset.draggingId;

        }
    );


    // ==================================================
    // TIER DRAG OVER
    // ==================================================

    builder.addEventListener(
        "dragover",
        event => {

            const zone =
                event.target.closest(
                    ".tier-drop-zone"
                );

            if (!zone || mode === "view") {
                return;
            }

            event.preventDefault();

            event.dataTransfer.dropEffect =
                "move";

            showDropIndicator(
                zone,
                event
            );

        }
    );


    // ==================================================
    // TIER DROP
    // ==================================================

    builder.addEventListener(
        "drop",
        event => {

            const zone =
                event.target.closest(
                    ".tier-drop-zone"
                );

            if (!zone || mode === "view") {
                return;
            }

            event.preventDefault();

            clearDropIndicators(
                builder
            );

            const id =
                Number(
                    event.dataTransfer.getData(
                        "text/plain"
                    )
                );

            if (!id) {
                return;
            }

            moveMediaToTier(
                tierList,
                id,
                zone.dataset.tier
            );

            moveExistingDOMItem(
                builder,
                id,
                zone,
                event
            );

        }
    );


    // ==================================================
    // UNRANKED DRAG OVER
    // ==================================================

    builder.addEventListener(
        "dragover",
        event => {

            const unranked =
                event.target.closest(
                    "[data-unranked]"
                );

            if (
                !unranked ||
                mode === "view"
            ) {
                return;
            }

            event.preventDefault();

            event.dataTransfer.dropEffect =
                "move";

            unranked.classList.add(
                "drag-over"
            );

        }
    );


    // ==================================================
    // UNRANKED DRAG LEAVE
    // ==================================================

    builder.addEventListener(
        "dragleave",
        event => {

            const unranked =
                event.target.closest(
                    "[data-unranked]"
                );

            if (!unranked) {
                return;
            }

            if (
                !unranked.contains(
                    event.relatedTarget
                )
            ) {

                unranked.classList.remove(
                    "drag-over"
                );

            }

        }
    );


    // ==================================================
    // UNRANKED DROP
    // ==================================================

    builder.addEventListener(
        "drop",
        event => {

            const unranked =
                event.target.closest(
                    "[data-unranked]"
                );

            if (
                !unranked ||
                mode === "view"
            ) {
                return;
            }

            event.preventDefault();

            unranked.classList.remove(
                "drag-over"
            );

            clearDropIndicators(
                builder
            );

            const id =
                Number(
                    event.dataTransfer.getData(
                        "text/plain"
                    )
                );

            if (!id) {
                return;
            }

            removeMediaFromTiers(
                tierList,
                id
            );

            moveExistingDOMItemToUnranked(
                builder,
                id,
                unranked,
                event
            );

        }
    );


    // ==================================================
    // SAVE
    // ==================================================

    const saveButton =
        builder.querySelector(
            "[data-tier-save]"
        );

    saveButton?.addEventListener(
        "click",
        () => {

            if (mode === "new") {

                saveNewTierList(
                    tierList
                );

            } else {

                saveEditedTierList(
                    tierList
                );

            }

        }
    );


    // ==================================================
    // CANCEL
    // ==================================================

    const cancelButton =
        builder.querySelector(
            "[data-tier-cancel]"
        );

    cancelButton?.addEventListener(
        "click",
        () => {

            if (mode === "new") {

                builder.remove();

                currentTierList = null;
                currentEditorMode = null;

            } else {

                collapseSavedTierList(
                    Number(tierList.id)
                );

            }

        }
    );

}


// ==================================================
// MOVE MEDIA TO TIER
// ==================================================

function moveMediaToTier(
    tierList,
    id,
    tier
) {

    const numericId =
        Number(id);

    if (
        !tierList.available.includes(
            numericId
        )
    ) {

        tierList.available.push(
            numericId
        );

    }

    removeMediaFromTiers(
        tierList,
        numericId
    );

    if (
        !tierList.tiers[tier]
    ) {

        tierList.tiers[tier] = [];

    }

    tierList.tiers[tier].push(
        numericId
    );

}


// ==================================================
// REMOVE MEDIA FROM TIERS
// ==================================================

function removeMediaFromTiers(
    tierList,
    id
) {

    const numericId =
        Number(id);

    TIER_NAMES.forEach(
        tier => {

            tierList.tiers[tier] =
                tierList.tiers[tier]
                    .filter(
                        existingId =>
                            Number(existingId) !==
                            numericId
                    );

        }
    );

}


// ==================================================
// MOVE EXISTING DOM ITEM
// ==================================================

function moveExistingDOMItem(
    builder,
    id,
    zone,
    event
) {

    const item =
        builder.querySelector(
            `[data-media-id="${id}"]`
        );

    if (!item) {
        return;
    }

    const existingItems =
        [
            ...zone.querySelectorAll(
                "[data-media-id]"
            )
        ].filter(
            element =>
                element !== item
        );

    if (existingItems.length === 0) {

        zone.appendChild(item);

        return;

    }

    const target =
        findDropTarget(
            existingItems,
            event.clientX
        );

    if (target) {

        zone.insertBefore(
            item,
            target
        );

    } else {

        zone.appendChild(item);

    }

}


// ==================================================
// MOVE DOM ITEM TO UNRANKED
// ==================================================

function moveExistingDOMItemToUnranked(
    builder,
    id,
    unranked,
    event
) {

    const item =
        builder.querySelector(
            `.tier-drop-zone [data-media-id="${id}"]`
        );

    if (!item) {
        return;
    }

    const mediaItem =
        findMedia(id);

    if (!mediaItem) {
        return;
    }

    /*
     * Ranked items have a different HTML structure
     * from unranked posters, so convert the element
     * only once when it returns to unranked.
     */

    const newItem =
        document.createElement(
            "div"
        );

    newItem.className =
        "poster-item";

    newItem.draggable =
        true;

    newItem.dataset.mediaId =
        String(id);

    newItem.innerHTML = `
        <img
            src="${escapeHTML(
                mediaItem.image || ""
            )}"
            alt="${escapeHTML(
                mediaItem.title
            )} poster"
            loading="lazy"
        >

        <p>
            ${escapeHTML(
                mediaItem.title
            )}
        </p>
    `;

    item.remove();

    const existingItems =
        [
            ...unranked.querySelectorAll(
                "[data-media-id]"
            )
        ];

    if (existingItems.length === 0) {

        unranked.appendChild(
            newItem
        );

        return;

    }

    const target =
        findDropTarget(
            existingItems,
            event.clientX
        );

    if (target) {

        unranked.insertBefore(
            newItem,
            target
        );

    } else {

        unranked.appendChild(
            newItem
        );

    }

}


// ==================================================
// FIND DROP TARGET
// ==================================================

function findDropTarget(
    elements,
    mouseX
) {

    let closest = null;
    let closestDistance = Infinity;

    elements.forEach(element => {

        const rect =
            element.getBoundingClientRect();

        const center =
            rect.left +
            rect.width / 2;

        const distance =
            Math.abs(
                mouseX - center
            );

        if (
            mouseX < center &&
            distance < closestDistance
        ) {

            closest =
                element;

            closestDistance =
                distance;

        }

    });

    return closest;

}


// ==================================================
// DROP INDICATOR
// ==================================================

function showDropIndicator(
    zone,
    event
) {

    clearDropIndicators(
        zone.closest(
            ".tier-builder"
        )
    );

    zone.classList.add(
        "drop-target"
    );

}


function clearDropIndicators(
    builder
) {

    if (!builder) {
        return;
    }

    builder
        .querySelectorAll(
            ".drop-target"
        )
        .forEach(element => {

            element.classList.remove(
                "drop-target"
            );

        });

    builder
        .querySelectorAll(
            ".drag-over"
        )
        .forEach(element => {

            element.classList.remove(
                "drag-over"
            );

        });

}


// ==================================================
// GET RANKED IDS
// ==================================================

function getRankedIds(
    tierList
) {

    return TIER_NAMES
        .flatMap(
            tier =>
                tierList.tiers[tier] || []
        )
        .map(Number);

}


// ==================================================
// SAVE NEW TIER LIST
// ==================================================

function saveNewTierList(
    tierList
) {

    const saved =
        getSavedTierLists();

    saved.push(
        normalizeTierList(
            tierList
        )
    );

    saveTierLists(
        saved
    );

    removeNewBuilder();

    currentTierList = null;
    currentEditorMode = null;

    displaySavedTierLists();

}


// ==================================================
// SAVE EDITED TIER LIST
// ==================================================

function saveEditedTierList(
    tierList
) {

    const saved =
        getSavedTierLists();

    const index =
        saved.findIndex(
            list =>
                Number(list.id) ===
                Number(tierList.id)
        );

    if (index === -1) {
        return;
    }

    saved[index] =
        normalizeTierList(
            tierList
        );

    saveTierLists(
        saved
    );

    displaySavedTierLists();

    setTimeout(
        () => {

            openSavedTierList(
                Number(tierList.id),
                false
            );

        },
        0
    );

}


// ==================================================
// NORMALIZE TIER LIST
// ==================================================

function normalizeTierList(
    tierList
) {

    const normalized = {

        id:
            Number(tierList.id),

        name:
            String(tierList.name),

        mediaType:
            tierList.mediaType ||
            "all",

        filter:
            tierList.filter ||
            "genre",

        filterValue:
            tierList.filterValue ||
            "all",

        tiers: {},

        available:
            Array.isArray(
                tierList.available
            )
                ? tierList.available.map(Number)
                : []

    };

    TIER_NAMES.forEach(
        tier => {

            normalized.tiers[tier] =
                Array.isArray(
                    tierList.tiers?.[tier]
                )
                    ? tierList.tiers[tier]
                        .map(Number)
                    : [];

        }
    );

    getRankedIds(
        normalized
    ).forEach(
        id => {

            if (
                !normalized.available.includes(id)
            ) {

                normalized.available.push(id);

            }

        }
    );

    return normalized;

}


// ==================================================
// SAVED TIER LIST STORAGE
// ==================================================

function getSavedTierLists() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    TIER_LIST_KEY
                )
            );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.map(
            normalizeTierList
        );

    } catch {

        return [];

    }

}


function saveTierLists(
    lists
) {

    localStorage.setItem(
        TIER_LIST_KEY,
        JSON.stringify(lists)
    );

}


// ==================================================
// DISPLAY SAVED TIER LISTS
// ==================================================

function displaySavedTierLists() {

    const container =
        document.querySelector(
            "#tier-list-container"
        );

    if (!container) {
        return;
    }

    const lists =
        getSavedTierLists();

    if (lists.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <p>
                    You haven't created any tier lists yet.
                </p>

            </div>
        `;

        return;

    }

    container.innerHTML =
        lists
            .map(
                createSavedTierListEntry
            )
            .join("");

    attachSavedTierListEvents(
        container
    );

}


// ==================================================
// SAVED TIER LIST ENTRY
// ==================================================

function createSavedTierListEntry(
    list
) {

    const rankedCount =
        getRankedIds(
            list
        ).length;

    const totalCount =
        list.available.length;

    return `
        <article
            class="saved-tier-list"
            data-tier-list-id="${list.id}"
        >

            <div class="saved-tier-list-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            list.name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            getTierTypeLabel(
                                list.mediaType
                            )
                        )}
                    </p>

                    <p class="media-meta">
                        ${rankedCount}
                        ranked titles of
                        ${totalCount}
                        total
                    </p>

                </div>

                <div class="saved-tier-list-actions">

                    <button
                        type="button"
                        class="button secondary"
                        data-tier-view
                    >
                        View
                    </button>

                    <button
                        type="button"
                        class="button secondary"
                        data-tier-edit
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="button secondary"
                        data-tier-delete
                    >
                        Delete
                    </button>

                </div>

            </div>

            <div
                class="saved-tier-list-expanded"
                hidden
            ></div>

        </article>
    `;

}


// ==================================================
// TIER TYPE LABEL
// ==================================================

function getTierTypeLabel(
    type
) {

    if (type === "all") {
        return "All Media";
    }

    if (type === "Anime") {
        return "Anime";
    }

    if (type === "TV Movie") {
        return "TV Movie";
    }

    if (type === "Anime Movie") {
        return "Anime Movie";
    }

    if (type === "Anime Series") {
        return "Anime Series";
    }

    if (type === "TV Series") {
        return "TV Series";
    }

    return type || "All Media";

}


// ==================================================
// SAVED TIER LIST EVENTS
// ==================================================

function attachSavedTierListEvents(
    container
) {

    container
        .querySelectorAll(
            "[data-tier-list-id]"
        )
        .forEach(entry => {

            const id =
                Number(
                    entry.dataset.tierListId
                );

            const viewButton =
                entry.querySelector(
                    "[data-tier-view]"
                );

            const editButton =
                entry.querySelector(
                    "[data-tier-edit]"
                );

            const deleteButton =
                entry.querySelector(
                    "[data-tier-delete]"
                );

            viewButton?.addEventListener(
                "click",
                () => {

                    const expanded =
                        entry.querySelector(
                            ".saved-tier-list-expanded"
                        );

                    if (
                        expanded &&
                        !expanded.hidden
                    ) {

                        collapseSavedTierList(
                            id
                        );

                    } else {

                        openSavedTierList(
                            id,
                            false
                        );

                    }

                }
            );

            editButton?.addEventListener(
                "click",
                () => {

                    openSavedTierList(
                        id,
                        true
                    );

                }
            );

            deleteButton?.addEventListener(
                "click",
                () => {

                    deleteSavedTierList(
                        id
                    );

                }
            );

        });

}


// ==================================================
// OPEN SAVED TIER LIST
// ==================================================

function openSavedTierList(
    id,
    editMode
) {

    const list =
        getSavedTierLists()
            .find(
                tierList =>
                    Number(tierList.id) ===
                    Number(id)
            );

    if (!list) {
        return;
    }

    const entry =
        document.querySelector(
            `[data-tier-list-id="${id}"]`
        );

    if (!entry) {
        return;
    }

    const expanded =
        entry.querySelector(
            ".saved-tier-list-expanded"
        );

    const viewButton =
        entry.querySelector(
            "[data-tier-view]"
        );

    if (!expanded) {
        return;
    }

    /*
     * If the same list is already open in edit
     * mode and Edit is clicked again, do nothing.
     */

    if (
        !expanded.hidden &&
        currentEditorMode === "edit" &&
        editMode
    ) {
        return;
    }

    expanded.innerHTML = "";

    const builder =
        createTierBuilder(
            list,
            false
        );

    expanded.appendChild(
        builder
    );

    expanded.hidden = false;

    if (viewButton) {

        viewButton.textContent =
            "Hide";

    }

    currentTierList =
        list;

    currentEditorMode =
        editMode
            ? "edit"
            : "view";

    if (editMode) {

        builder.classList.add(
            "tier-builder-editing"
        );

        setupTierBuilderEvents(
            builder,
            list,
            "edit"
        );

    } else {

        builder.classList.add(
            "tier-builder-viewing"
        );

        disableTierDragging(
            builder
        );

        builder
            .querySelector(
                "[data-tier-save]"
            )
            ?.remove();

        builder
            .querySelector(
                "[data-tier-cancel]"
            )
            ?.remove();

    }

}


// ==================================================
// DISABLE DRAGGING
// ==================================================

function disableTierDragging(
    builder
) {

    builder
        .querySelectorAll(
            "[draggable='true']"
        )
        .forEach(item => {

            item.setAttribute(
                "draggable",
                "false"
            );

        });

}


// ==================================================
// COLLAPSE SAVED TIER LIST
// ==================================================

function collapseSavedTierList(
    id
) {

    const entry =
        document.querySelector(
            `[data-tier-list-id="${id}"]`
        );

    if (!entry) {
        return;
    }

    const expanded =
        entry.querySelector(
            ".saved-tier-list-expanded"
        );

    const viewButton =
        entry.querySelector(
            "[data-tier-view]"
        );

    if (expanded) {

        expanded.hidden = true;
        expanded.innerHTML = "";

    }

    if (viewButton) {

        viewButton.textContent =
            "View";

    }

    if (
        currentTierList &&
        Number(currentTierList.id) ===
        Number(id)
    ) {

        currentTierList = null;
        currentEditorMode = null;

    }

}


// ==================================================
// DELETE SAVED TIER LIST
// ==================================================

function deleteSavedTierList(
    id
) {

    const list =
        getSavedTierLists()
            .find(
                tierList =>
                    Number(tierList.id) ===
                    Number(id)
            );

    if (!list) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete "${list.name}"?`
        );

    if (!confirmed) {
        return;
    }

    const remaining =
        getSavedTierLists()
            .filter(
                tierList =>
                    Number(tierList.id) !==
                    Number(id)
            );

    saveTierLists(
        remaining
    );

    if (
        currentTierList &&
        Number(currentTierList.id) ===
        Number(id)
    ) {

        currentTierList = null;
        currentEditorMode = null;

    }

    displaySavedTierLists();

}


// ==================================================
// AUTO SCROLL WHILE DRAGGING
// ==================================================

let autoScrollActive = false;
let autoScrollFrame = null;


function setupDragAutoScroll() {

    document.addEventListener(
        "dragover",
        event => {

            if (
                !document.querySelector(
                    ".tier-builder-editing"
                ) &&
                !document.querySelector(
                    "#new-tier-builder"
                )
            ) {
                return;
            }

            autoScrollActive = true;

            updateAutoScroll(
                event.clientY
            );

        }
    );


    document.addEventListener(
        "dragend",
        stopAutoScroll
    );


    document.addEventListener(
        "drop",
        stopAutoScroll
    );

}


function updateAutoScroll(
    mouseY
) {

    const viewportHeight =
        window.innerHeight;

    const edgeSize =
        100;

    let speed = 0;

    if (
        mouseY < edgeSize
    ) {

        const intensity =
            1 -
            mouseY / edgeSize;

        speed =
            -Math.max(
                4,
                intensity * 16
            );

    } else if (
        mouseY >
        viewportHeight - edgeSize
    ) {

        const distanceFromBottom =
            viewportHeight -
            mouseY;

        const intensity =
            1 -
            distanceFromBottom /
            edgeSize;

        speed =
            Math.max(
                4,
                intensity * 16
            );

    }

    if (speed === 0) {

        if (autoScrollFrame) {

            cancelAnimationFrame(
                autoScrollFrame
            );

            autoScrollFrame =
                null;

        }

        return;

    }

    if (autoScrollFrame) {
        return;
    }

    const scroll = () => {

        if (!autoScrollActive) {

            autoScrollFrame =
                null;

            return;

        }

        window.scrollBy(
            0,
            speed
        );

        autoScrollFrame =
            requestAnimationFrame(
                scroll
            );

    };

    autoScrollFrame =
        requestAnimationFrame(
            scroll
        );

}


function stopAutoScroll() {

    autoScrollActive =
        false;

    if (autoScrollFrame) {

        cancelAnimationFrame(
            autoScrollFrame
        );

        autoScrollFrame =
            null;

    }

}


// ==================================================
// HELPERS
// ==================================================

function countTierItems(
    list
) {

    return getRankedIds(
        list
    ).length;

}


function formatRating(value) {

    const rating =
        Number(value);

    return Number.isFinite(rating)
        ? rating.toFixed(1)
        : "N/A";

}


function escapeHTML(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}
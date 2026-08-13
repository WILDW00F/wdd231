const modal = document.querySelector("#media-modal");

const modalContent = document.querySelector(
    "#modal-content"
);


export function openMediaModal(item) {

    if (!modal || !modalContent) {
        return;
    }

    const watchlist =
        JSON.parse(
            localStorage.getItem("myWatchlist")
        ) || [];

    const isSaved = watchlist.includes(item.id);

    modalContent.innerHTML = `
        <button
            class="modal-close"
            type="button"
            aria-label="Close media details"
        >
            ✕
        </button>

        <div class="modal-grid">

            <img
                class="modal-poster"
                src="${item.image}"
                alt="${item.title} poster"
                width="300"
                height="450"
                loading="lazy"
            >

            <div class="modal-details">

                <h2 id="modal-title">
                    ${item.title}
                </h2>

                <div class="modal-meta">

                    <span class="meta-tag">
                        ${item.type}
                    </span>

                    <span class="meta-tag">
                        ${item.year}
                    </span>

                    <span class="meta-tag">
                        ${item.genre}
                    </span>

                    <span class="meta-tag">
                        ★ ${item.rating}
                    </span>

                </div>

                <p>
                    <strong>Studio:</strong>
                    ${item.studio}
                </p>

                <p>
                    ${item.description}
                </p>

                <button
                    class="button button-primary"
                    id="watchlist-button"
                    type="button"
                >
                    ${isSaved
                        ? "Remove from Watchlist"
                        : "Add to Watchlist"}
                </button>

            </div>

        </div>
    `;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const closeButton =
        modal.querySelector(".modal-close");

    closeButton.focus();

    closeButton.addEventListener(
        "click",
        closeMediaModal
    );

    const watchlistButton =
        modal.querySelector("#watchlist-button");

    watchlistButton.addEventListener(
        "click",
        () => toggleWatchlist(item)
    );
}


function closeMediaModal() {

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


function toggleWatchlist(item) {

    let watchlist =
        JSON.parse(
            localStorage.getItem("myWatchlist")
        ) || [];

    if (watchlist.includes(item.id)) {

        watchlist = watchlist.filter(
            id => id !== item.id
        );

    } else {

        watchlist.push(item.id);
    }

    localStorage.setItem(
        "myWatchlist",
        JSON.stringify(watchlist)
    );

    openMediaModal(item);
}


if (modal) {

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                closeMediaModal();
            }

        }
    );
}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modal?.classList.contains("open")
        ) {
            closeMediaModal();
        }

    }
);
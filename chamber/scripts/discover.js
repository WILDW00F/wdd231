import { discoverItems } from "../data/discover.mjs";

const discoverGrid = document.querySelector("#discover-grid");
const visitorMessage = document.querySelector("#visitor-message");

function displayDiscoverItems() {
    discoverGrid.innerHTML = "";

    discoverItems.forEach((item, index) => {
        const card = document.createElement("article");

        card.classList.add("discover-card");
        card.classList.add(`card-${index + 1}`);

        card.innerHTML = `
            <h2>${item.name}</h2>

            <figure>
                <img 
                    src="${item.image}" 
                    alt="${item.alt}"
                    width="300"
                    height="200"
                    loading="lazy"
                >
            </figure>

            <address>${item.address}</address>

            <p>${item.description}</p>

            <button 
                class="learn-more"
                type="button"
                data-link="${item.link}"
                aria-label="Learn more about ${item.name}"
            >
                Learn More
            </button>
        `;

        discoverGrid.appendChild(card);
    });

    addLearnMoreEvents();
}

function addLearnMoreEvents() {
    const buttons = document.querySelectorAll(".learn-more");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const link = button.dataset.link;

            if (link) {
                window.open(link, "_blank", "noopener,noreferrer");
            }
        });
    });
}

function displayVisitorMessage() {
    const storageKey = "gilbertDiscoverLastVisit";
    const currentVisit = Date.now();
    const previousVisit = localStorage.getItem(storageKey);

    let message = "";

    if (!previousVisit) {
        message = "Welcome! Let us know if you have any questions.";
    } else {
        const previousTime = Number(previousVisit);
        const timeDifference = currentVisit - previousTime;
        const oneDay = 1000 * 60 * 60 * 24;

        if (timeDifference < oneDay) {
            message = "Back so soon! Awesome!";
        } else {
            const days = Math.floor(timeDifference / oneDay);
            const dayWord = days === 1 ? "day" : "days";

            message = `You last visited ${days} ${dayWord} ago.`;
        }
    }

    visitorMessage.textContent = message;

    localStorage.setItem(storageKey, currentVisit);
}

displayDiscoverItems();
displayVisitorMessage();
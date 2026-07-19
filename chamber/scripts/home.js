const weatherURL =
    "https://api.openweathermap.org/data/2.5/forecast?lat=33.3528&lon=-111.7890&units=imperial&appid=599b3dc706f49bef7dfccbac55b8c2c5";

const membersURL = "data/members.json";

const weatherContainer = document.querySelector("#weather");
const spotlightContainer = document.querySelector("#spotlightCards");

async function getWeather() {

    try {

        const response = await fetch(weatherURL);

        if (!response.ok) {
            throw new Error(`Weather Error: ${response.status}`);
        }

        const data = await response.json();

        displayWeather(data);

    }

    catch (error) {

        console.error(error);

        weatherContainer.innerHTML = `
            <p>Unable to load weather information.</p>
        `;

    }

}

function displayWeather(data) {

    const current = data.list[0];

    const currentTemp = Math.round(current.main.temp);

    const description = current.weather[0].description;

    const forecast = [];

    const today = new Date().getDate();

    data.list.forEach(item => {

        const date = new Date(item.dt_txt);

        if (
            date.getHours() === 12 &&
            date.getDate() !== today &&
            forecast.length < 3
        ) {

            forecast.push(item);

        }

    });

    weatherContainer.innerHTML = `
        <p><strong>Current:</strong> ${currentTemp}&deg;F</p>

        <p>${description}</p>

        <h3>3-Day Forecast</h3>

        <ul>

            ${forecast.map(day => `
                <li>
                    ${new Date(day.dt_txt).toLocaleDateString("en-US", {
                        weekday: "long"
                    })}
                    :
                    ${Math.round(day.main.temp)}&deg;F
                </li>
            `).join("")}

        </ul>
    `;

}

async function getSpotlights() {

    try {

        const response = await fetch(membersURL);

        if (!response.ok) {
            throw new Error(`Member Error: ${response.status}`);
        }

        const members = await response.json();

        displaySpotlights(members);

    }

    catch (error) {

        console.error(error);

        spotlightContainer.innerHTML = `
            <p>Unable to load spotlight members.</p>
        `;

    }

}

function displaySpotlights(members) {

    const featured = members.filter(member => member.membership >= 2);

    featured.sort(() => Math.random() - 0.5);

    const selected = featured.slice(0, 3);

    spotlightContainer.innerHTML = "";

    selected.forEach(member => {

        const card = document.createElement("section");

        card.classList.add("spotlight-card");

        card.innerHTML = `
            <img
                src="images/${member.image}"
                alt="${member.name} Logo"
                loading="lazy"
                width="300"
                height="200">

            <h3>${member.name}</h3>

            <p>${member.address}</p>

            <p>${member.phone}</p>

            <p>
                <strong>
                    ${getMembership(member.membership)}
                </strong>
            </p>

            <a
                href="${member.website}"
                target="_blank"
                rel="noopener">
                Visit Website
            </a>
        `;

        spotlightContainer.appendChild(card);

    });

}

function getMembership(level) {

    switch (level) {

        case 2:
            return "Silver Member";

        case 3:
            return "Gold Member";

        default:
            return "Member";

    }

}

getWeather();

getSpotlights();
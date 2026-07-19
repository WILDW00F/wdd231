const url = "data/members.json";

const membersContainer = document.querySelector("#members");

const gridBtn = document.querySelector("#gridBtn");
const listBtn = document.querySelector("#listBtn");

async function getMembers() {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const members = await response.json();

        displayMembers(members);

    } catch (error) {
        console.error("Unable to load member data:", error);

        membersContainer.innerHTML = `
            <p class="error">
                Sorry, the member directory is unavailable at this time.
            </p>
        `;
    }
}

function displayMembers(members) {

    membersContainer.innerHTML = "";

    members.forEach(member => {

        const card = document.createElement("section");

        const image = document.createElement("img");
        image.src = `images/${member.image}`;
        image.alt = `${member.name} Logo`;
        image.loading = "lazy";
        image.width = 300;
        image.height = 200;

        const name = document.createElement("h3");
        name.textContent = member.name;

        const description = document.createElement("p");
        description.textContent = member.description;

        const address = document.createElement("p");
        address.innerHTML = `<strong>Address:</strong> ${member.address}`;

        const phone = document.createElement("p");
        phone.innerHTML = `<strong>Phone:</strong> ${member.phone}`;

        const membership = document.createElement("p");
        membership.innerHTML = `<strong>Membership:</strong> ${getMembershipLevel(member.membership)}`;

        const website = document.createElement("a");
        website.href = member.website;
        website.target = "_blank";
        website.rel = "noopener";
        website.textContent = member.name;

        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(address);
        card.appendChild(phone);
        card.appendChild(membership);
        card.appendChild(website);

        membersContainer.appendChild(card);

    });

}

function getMembershipLevel(level) {

    switch (level) {

        case 1:
            return "Member";

        case 2:
            return "Silver Member";

        case 3:
            return "Gold Member";

        default:
            return "Member";
    }

}

gridBtn.addEventListener("click", () => {

    membersContainer.classList.add("grid");
    membersContainer.classList.remove("list");

});

listBtn.addEventListener("click", () => {

    membersContainer.classList.add("list");
    membersContainer.classList.remove("grid");

});

getMembers();
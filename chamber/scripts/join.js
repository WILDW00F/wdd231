document.addEventListener("DOMContentLoaded", () => {

    const timestampField = document.getElementById("timestamp");

    if (timestampField) {
        timestampField.value = new Date().toISOString();
    }

});

const npModal = document.getElementById("npModal");
const bronzeModal = document.getElementById("bronzeModal");
const silverModal = document.getElementById("silverModal");
const goldModal = document.getElementById("goldModal");

document.getElementById("npLink").addEventListener("click", (event) => {
    event.preventDefault();
    npModal.showModal();
});

document.getElementById("bronzeLink").addEventListener("click", (event) => {
    event.preventDefault();
    bronzeModal.showModal();
});

document.getElementById("silverLink").addEventListener("click", (event) => {
    event.preventDefault();
    silverModal.showModal();
});

document.getElementById("goldLink").addEventListener("click", (event) => {
    event.preventDefault();
    goldModal.showModal();
});

document.querySelectorAll(".close-btn").forEach(button => {

    button.addEventListener("click", () => {

        button.closest("dialog").close();

    });

});

document.querySelectorAll("dialog").forEach(dialog => {

    dialog.addEventListener("click", (event) => {

        const rect = dialog.getBoundingClientRect();

        const clickedInside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        if (!clickedInside) {
            dialog.close();
        }

    });

});
const menuBtn = document.querySelector("#menuBtn");
const navigation = document.querySelector("#primaryNav");

menuBtn.addEventListener("click", () => {
    navigation.classList.toggle("open");

    if (navigation.classList.contains("open")) {
        menuBtn.textContent = "✕";
        menuBtn.setAttribute("aria-label", "Close Navigation");
    } else {
        menuBtn.textContent = "☰";
        menuBtn.setAttribute("aria-label", "Open Navigation");
    }
});
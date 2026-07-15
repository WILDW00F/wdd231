const menuBtn = document.querySelector("#menuBtn");
const navigation = document.querySelector("#primaryNav");

menuBtn.addEventListener("click", () => {
    navigation.classList.toggle("open");

    const expanded = navigation.classList.contains("open");

    menuBtn.setAttribute("aria-expanded", expanded);

    menuBtn.textContent = expanded ? "✕" : "☰";
});
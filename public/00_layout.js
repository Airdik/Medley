const nav = document.querySelector(".navbar");
const checkbox = document.querySelector("#check");
let lastScrollY = window.scrollY;


window.addEventListener("scroll", () => {
    let offset = window.pageYOffset;
    checkbox.checked = false;


    if (lastScrollY < window.scrollY && offset > 50) { // Scrolling down
        nav.classList.add("nav--hidden");
    } else { // Scrolling up
        nav.classList.remove("nav--hidden");
    }
    lastScrollY = window.scrollY;
})

console.log("Layout.js")
const nav = document.querySelector(".navbar");
let lastScrollY = window.scrollY;


window.addEventListener("scroll", () => {
    let offset = window.pageYOffset;

    if (lastScrollY < window.scrollY && offset > 50) { // Scrolling down
        nav.classList.add("nav--hidden");
    } else { // Scrolling up
        nav.classList.remove("nav--hidden");
    }
    lastScrollY = window.scrollY;
})

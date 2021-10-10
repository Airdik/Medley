const nav = document.querySelector(".navbar");
const parallax2 = document.getElementById("parallax2");
//const parallax3 = document.getElementById("parallax3");
let lastScrollY = window.scrollY;


window.addEventListener("scroll", () => {
    let offset = window.pageYOffset;
    parallax2.style.backgroundPositionY = ((offset * .7)) + "px";
    //parallax3.style.backgroundPositionY = ((offset * .7)) + "px";

    if (lastScrollY < window.scrollY && offset > 50) { // Scrolling down
        nav.classList.add("nav--hidden");
    } else { // Scrolling up
        nav.classList.remove("nav--hidden");
    }
    lastScrollY = window.scrollY;
})

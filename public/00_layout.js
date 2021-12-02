const nav = document.querySelector(".navbar");
const checkbox = document.querySelector("#check");
let lastScrollY = window.scrollY;
const Toast = {
    init() {
        this.hideTimeout = null;

        this.el = document.createElement("div");
        this.el.className = "toast";
        document.body.appendChild(this.el);
    },

    show(message, state) {
        clearTimeout(this.hideTimeout);
        console.log("Showing toast");

        this.el.innerHTML = message;
        this.el.className = "toast toast--visible";

        if (state) {
            this.el.classList.add(`toast--${state}`);
        }

        this.hideTimeout = setTimeout(() => {
            this.el.classList.remove('toast--visible');
        }, 5000);
    }
}


window.addEventListener("scroll", () => {
    let offset = window.pageYOffset;
    checkbox.checked = false;


    if (lastScrollY < window.scrollY && offset > 50) { // Scrolling down
        nav.classList.add("nav--hidden");
    } else { // Scrolling up
        nav.classList.remove("nav--hidden");
    }
    lastScrollY = window.scrollY;
});


document.addEventListener("DOMContentLoaded", () => {
    Toast.init();
})

console.log("Layout.js")
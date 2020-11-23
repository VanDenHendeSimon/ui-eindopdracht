"use strict";

// Construct navigation and other static elements
const listenToHamburger = function () {
    const hamburgerIcon = document.querySelector(".js-hamburger-menu");
    const properties = document.querySelector(".js-properties");

    hamburgerIcon.addEventListener("click", () => {
        hamburgerIcon.classList.toggle("change");
        properties.classList.toggle("c-sidebar__properties--force-show");
    });
};

document.addEventListener("DOMContentLoaded", listenToHamburger);

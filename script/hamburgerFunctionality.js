"use strict";

// Construct navigation and other static elements
const listenToHamburger = function () {
    const hamburgerIcon = document.querySelector(".js-hamburger-menu");
    const properties = document.querySelector(".js-properties");

    hamburgerIcon.addEventListener("input", () => {
        if (hamburgerIcon.checked) {
            properties.classList.add("c-sidebar__properties--force-show");
        }   else {
            properties.classList.remove("c-sidebar__properties--force-show");
        }
    });
};

document.addEventListener("DOMContentLoaded", listenToHamburger);

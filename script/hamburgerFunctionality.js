"use strict";

// Construct navigation and other static elements
const listenToHamburger = function () {
    const propertyPanel = document.querySelector(".js-property-panel");
    const hamburgerIcon = document.querySelector(".hamburger-menu");

    hamburgerIcon.addEventListener("click", () => {
        propertyPanel.classList.toggle("show");
        hamburgerIcon.classList.toggle("change");
    });
};

document.addEventListener("DOMContentLoaded", listenToHamburger);

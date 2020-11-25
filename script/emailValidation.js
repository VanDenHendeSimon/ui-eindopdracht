"use strict";
let email = {},
    signInButton;

const getDOMElements = function () {
    email.field = document.querySelector(".js-username");
    email.input = document.getElementById("username");
    email.errorMessage = document.querySelector(".js-email-error-message");

    signInButton = document.querySelector(".js-sign-in-button");
};

const isValidEmailAddress = function (emailAddress) {
    // Basis manier om e-mailadres te checken.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
};

const isEmpty = function (fieldValue) {
    return !fieldValue || !fieldValue.length;
};

const addErrors = function (elementObject, errorMessage) {
    elementObject.field.classList.add("has-error");

    elementObject.errorMessage.innerHTML = errorMessage;
    // TODO: Met een class ipv zo display te zetten
    elementObject.errorMessage.style.display = "block";
};

const removeErrors = function (elementObject) {
    elementObject.field.classList.remove("has-error");

    // TODO: Met een class ipv zo display te zetten
    elementObject.errorMessage.style.display = "none";
};

const doubleCheckEmailAddress = function () {
    if (isValidEmailAddress(email.input.value)) {
        // Het is geldig
        removeErrors(email);
        email.input.removeEventListener("input", doubleCheckEmailAddress);
    } else {
        // Invalid email address
        if (isEmpty(email.input.value)) {
            // Als het leeg is weer efkes alles eraf te halen,
            // tenzij ge uit het veld klikt, dan firet blur opnieuw en komt de error er weer op
            removeErrors(email);
            email.input.removeEventListener("input", doubleCheckEmailAddress);
        } else {
            addErrors(email, "Invalid email address");
        }
    }
};

const addBadEmailButtonStyling = function () {
    signInButton.classList.add("c-lead-capture__submit--failed");
    signInButton.innerHTML = "Invalid email address";
};

const removeBadEmailButtonStyling = function () {
    signInButton.classList.remove("c-lead-capture__submit--failed");
    signInButton.classList.remove("c-lead-capture__submit--success");
    signInButton.innerHTML = "Submit";
};

const enableListeners = function () {
    email.input.addEventListener("blur", function () {
        if (isEmpty(email.input.value)) {
            addErrors(email, "This field is required");
            email.input.addEventListener("input", doubleCheckEmailAddress);
        } else {
            if (!isValidEmailAddress(email.input.value)) {
                addErrors(email, "Invalid email address");
                email.input.addEventListener("input", doubleCheckEmailAddress);
            }
        }
    });

    signInButton.addEventListener("click", function (e) {
        // Prevent submission
        e.preventDefault();

        // Client side validation
        if (isValidEmailAddress(email.input.value)) {
            console.log("Email: " + email.input.value);

            signInButton.classList.add("c-lead-capture__submit--success");
            signInButton.innerHTML = "Thanks! Check your mailbox and spam";
        }   else {
            addBadEmailButtonStyling();
        }
    });

    email.input.addEventListener("focus", function () {
        removeBadEmailButtonStyling();
    });
};

const init = function () {
    getDOMElements();
    enableListeners();
};

document.addEventListener("DOMContentLoaded", init);

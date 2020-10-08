"use strict";

/* Global variables */
let map;

// Filter circle layers
let circlesLayer = L.geoJSON();

// Base of the API
const baseAPI = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson";

const constructElements = function () {
    const propertyPanel = document.querySelector(".property-panel");
    const hamburgerIcon = document.querySelector(".hamburger-menu");
    const logo = document.querySelector(".logo");

    hamburgerIcon.addEventListener("click", () => {
        propertyPanel.classList.toggle("show");
        hamburgerIcon.classList.toggle("change");
        logo.classList.toggle("light-color");
    });
};

/* Adding overlay components */
const addMarker = function (latlng, label, layer, categoryID) {
    let marker = L.marker(latlng, {
        icon: createIconObject(`icons/${categoryID}.svg`, [20, 20], false),
    }).addTo(layer);
    marker.bindPopup(label);
};

const addCircle = function (latlng, categoryID, popupLabel) {
    const circle = {
        type: "Feature",
        properties: {
            category: categoryID,
            show_on_map: true,
            label: popupLabel,
        },
        geometry: {
            type: "Point",
            coordinates: [latlng[1], latlng[0]],
        },
    };
    return circle;
};

const createIconObject = function (iconLocation, size, alignTop) {
    let myIcon = null;

    if (alignTop) {
        myIcon = L.icon({
            iconUrl: iconLocation,
            iconSize: size,
            iconAnchor: [size[0] * 0.5, 0], // From the top left, Centered on the bottom
            popupAnchor: [0, -size[1]], // From the anchor
        });
    } else {
        myIcon = L.icon({
            iconUrl: iconLocation,
            iconSize: size,
            iconAnchor: [size[0] * 0.5, size[1]], // From the top left, Centered on the bottom
            popupAnchor: [0, -size[1]], // From the anchor
        });
    }

    return myIcon;
};

const addIcon = function (iconLocation, latlng, layer, popupLabel, size, alignTop) {
    const myIcon = createIconObject(iconLocation, size, alignTop);

    let marker = null;
    if (popupLabel) {
        marker = L.marker(latlng, {
            icon: myIcon,
            opacity: 0.8,
        })
            .addTo(layer)
            .bindPopup(popupLabel);
    } else {
        marker = L.marker(latlng, {
            icon: myIcon,
        }).addTo(layer);
    }

    return marker;
};

/* Creating the map */
const createMap = function () {
    const view = [25, 10.5];
    map = L.map("mapid", {
        zoomControl: false,
        maxZoom: 12,
    }).setView(view, 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // GeoJSON
    circlesLayer.addTo(map);

    // Scale and zoom positioning
    L.control
        .scale({
            position: "bottomright",
            updateWhenIdle: true,
            imperial: false,
            maxWidth: 150,
        })
        .addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Custom locations
    // const searchControl = L.esri.Geocoding.geosearch().addto(map);
};

const trackUser = function () {
    map.on("moveend", function (e) {
        const zoomLevel = e.target._animateToZoom;

        const viewBounds = map.getBounds();
        // Grow the bounds a bit to include locations that are just outside,
        // but their perimeter still reaches inside the current view
        const biggestRadius = 0;

        let minLat = String(viewBounds._southWest.lat - biggestRadius).replace(".", "-");
        let maxLat = String(viewBounds._northEast.lat + biggestRadius).replace(".", "-");
        let minLong = String(viewBounds._southWest.lng - biggestRadius).replace(".", "-");
        let maxLong = String(viewBounds._northEast.lng + biggestRadius).replace(".", "-");
    });
};

const getScaleColor = function (mag) {
    if (mag < 4) {
        // Below 4 is minor
        return "#50C878";
    } else if (mag >= 4 && mag < 5) {
        // 4 - 5.5 is moderate
        return "#FFDA29";
    } else if (mag >= 5 && mag < 7.5) {
        // 5.5 - 7.5 is strong
        return "#FC8A17";
    } else {
        // Above 7/8 is major/great
        return "#ED2939";
    }
};

const apiError = function (error) {
    console.log(error);
};

const showFeatures = function (jsonObject) {
    console.log(jsonObject);

    L.geoJSON(jsonObject.features, {
        pointToLayer: function (feature, latlng) {
            const mag = feature.properties.mag;
            const color = getScaleColor(mag);

            return L.circleMarker(latlng, {
                // kwadraat voor meer verschil
                radius: Math.pow(feature.properties.mag, 2),

                // Fill
                // fillColor: "#28636F",
                fillColor: color,
                fillOpacity: 0.5,

                // Border
                weight: 1,
                color: color,
            });
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                const mag = feature.properties.mag;
                const popup = L.popup().setContent(`
                    <div>
                        <h2 class="c-popup__title">${feature.properties.place}</h2>
                        <p class="c-popup__date">${new Date(feature.properties.time).toLocaleDateString("en-NL")}</p>
                        <p class="c-popup__text">${mag} on the Richter scale</p>
                        <div class="c-popup__richter-container">
                            <div class="c-popup__richter-bar c-popup__richter-bar--background"></div>
                            <div class="c-popup__richter-bar c-popup__richter-bar--foreground" style="width:${
                                (mag / 12) * 100
                            }%; background-color:${getScaleColor(mag)}"></div>
                        </div>
                        <div class="c-popup__richter-labels">
                            <p>😴</p>
                            <!-- <p>😨</p> -->
                            <p>😱</p>
                            <!-- <p>🤕</p> -->
                        </div>
                    </div>
                    `);

                layer.bindPopup(popup);
            }
        },
    }).addTo(map);
};

const getFeatures = function () {
    handleData(`${baseAPI}&starttime=2020-01-20&endtime=2020-01-30&minmagnitude=2.5`, showFeatures, apiError);
};

/* init */
const init = function () {
    console.log("DOM Content Loaded");

    // Define map stuff
    createMap();

    // Construct navigation and other static elements
    constructElements();

    // Track user
    trackUser();

    // Get features ( data )
    getFeatures();
};

document.addEventListener("DOMContentLoaded", init);

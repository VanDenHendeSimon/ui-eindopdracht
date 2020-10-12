"use strict";

let map;
const baseAPI = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson";

const constructElements = function () {
    const propertyPanel = document.querySelector(".property-panel");
    const hamburgerIcon = document.querySelector(".hamburger-menu");
    const logo = document.querySelector(".c-logo");

    hamburgerIcon.addEventListener("click", () => {
        propertyPanel.classList.toggle("show");
        hamburgerIcon.classList.toggle("change");
        logo.classList.toggle("light-color");
    });
};

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

const createMap = function () {
    const view = [25, 10.5];
    map = L.map("mapid", {
        zoomControl: false,
        maxZoom: 12,
    }).setView(view, 3);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

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
                radius: Math.pow(mag, 2.1),

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
                        <div class="c-popup__date">
                            <!-- <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>  -->
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path></svg>
                            <p>${new Date(feature.properties.time).toLocaleDateString("en-NL")}</p>
                        </div>
                        <p class="c-popup__text">${mag} on the Richter scale</p>
                        <div class="c-popup__richter-container">
                            <div class="c-popup__richter-bar c-popup__richter-bar--background"></div>
                            <div class="c-popup__richter-bar c-popup__richter-bar--foreground" style="width:${(mag / 12) * 100}%; background-color:${getScaleColor(mag)}"></div>
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

let viewer;
let tousLesMarqueurs = [];

async function chargerConfig() {
    const configResponse = await fetch("data/config.json");
    const config = await configResponse.json();

    const markersResponse = await fetch("data/markers.json");
    const markers = await markersResponse.json();

    tousLesMarqueurs = markers;

    lancerCarte(config.mapImage, markers);
}

function lancerCarte(imageCarte, markers) {
    viewer = OpenSeadragon({
        id: "map",
        prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/5.0.1/images/",
        tileSources: {
            type: "image",
            url: imageCarte
        },

        showNavigator: true,

        minZoomLevel: 0.5,
        maxZoomPixelRatio: 12,
        visibilityRatio: 0.5,
        constrainDuringPan: false,

        gestureSettingsMouse: {
            clickToZoom: false,
            scrollToZoom: true,
            dragToPan: true
        }
    });

    viewer.addHandler("open", function () {
        markers.forEach(marker => {
            const element = document.createElement("div");

            element.className = "marker";
            //element.title = marker.name;

            element.addEventListener("mouseenter", (event) => {
                afficherTooltip(marker, event);
            });

            element.addEventListener("mousemove", (event) => {
                deplacerTooltip(event);
            });

            element.addEventListener("mouseleave", () => {
                cacherTooltip();
            });

            element.addEventListener("click", () => {
                afficherInfos(marker);
            });

            viewer.addOverlay({
                element: element,
                location: new OpenSeadragon.Point(marker.x, marker.y),
                placement: OpenSeadragon.Placement.CENTER
            });
        });
    });

    document.getElementById("fullscreenBtn").addEventListener("click", () => {
        const map = document.getElementById("map");

        if (!document.fullscreenElement) {
            map.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    document.getElementById("closePanel").addEventListener("click", () => {
        document.getElementById("infoPanel").style.display = "none";
    });

    activerRecherche();

    viewer.addHandler("canvas-click", function(event) {
        const viewportPoint = viewer.viewport.pointFromPixel(event.position);

        alert(
            'Coordonnées du marqueur :\n' +
            '"x": ' + viewportPoint.x.toFixed(3) + ',\n' +
            '"y": ' + viewportPoint.y.toFixed(3)
        );
    });
}

function afficherInfos(marker) {
    document.getElementById("markerTitle").textContent = marker.name;
    document.getElementById("markerDescription").textContent = marker.description;
    document.getElementById("infoPanel").style.display = "block";
}

function activerRecherche() {
    const input = document.getElementById("searchInput");

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            rechercherLieu(input.value);
        }
    });
}

function rechercherLieu(texteRecherche) {
    const recherche = texteRecherche.toLowerCase().trim();

    if (recherche === "") {
        return;
    }

    const marker = tousLesMarqueurs.find(lieu =>
        lieu.name.toLowerCase().includes(recherche)
    );

    if (!marker) {
        alert("Aucun lieu trouvé.");
        return;
    }

    const point = new OpenSeadragon.Point(marker.x, marker.y);

    viewer.viewport.panTo(point);
    viewer.viewport.zoomTo(2.5);

    afficherInfos(marker);
}

function afficherTooltip(marker, event) {
    const tooltip = document.getElementById("tooltip");

    tooltip.innerHTML = `
        <strong>${marker.name}</strong>
        <span>${marker.description || ""}</span>
        ${marker.coords ? `<small>${marker.coords}</small>` : ""}
    `;

    tooltip.style.display = "block";

    deplacerTooltip(event);
}

function deplacerTooltip(event) {
    const tooltip = document.getElementById("tooltip");

    tooltip.style.left = event.clientX + 25 + "px";
    tooltip.style.top = event.clientY - 10 + "px";
}

function cacherTooltip() {
    document.getElementById("tooltip").style.display = "none";
}

chargerConfig();
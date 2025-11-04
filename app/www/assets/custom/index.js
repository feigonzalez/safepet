// ======================
// MAPA SAFEPET
// ======================

// Variables
let map = null;
let userMarker = null;
let mapInitialized = false;
let shelterMarkers = [];
let showShelters = true;
let userLocation = null;

// ======================
// INICIALIZAR MAPA
// ======================

function initMap() {
    console.log('Inicializando mapa Leaflet...');

    if (mapInitialized && map) return;

    if (typeof L === 'undefined') {
        console.error('Leaflet.js no cargado');
        document.getElementById('map').innerHTML =
            '<div style="padding:20px;text-align:center;color:#666;">Error: No se pudo cargar el mapa</div>';
        return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Contenedor #map no encontrado');
        return;
    }

    mapContainer.innerHTML = '';

    const defaultLat = -33.4489;
    const defaultLng = -70.6693;

    map = L.map('map', {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
    });

    mapInitialized = true;

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 1,
        subdomains: ['a', 'b', 'c'],
        crossOrigin: true
    });
    tileLayer.addTo(map);

    setTimeout(() => {
        if (map) map.invalidateSize(true);
    }, 250);

    addRealSheltersAndServices();

    // Obtener ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                userLocation = { lat: userLat, lng: userLng };
                map.setView([userLat, userLng], 15);

                // Añadir marcador del usuario
                if (userMarker) map.removeLayer(userMarker);

                userMarker = L.marker([userLat, userLng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div style="background-color:#007bff;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📍</div>',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13]
                    })
                }).addTo(map);

                getAddressFromCoordinates(userLat, userLng, address => {
                    userMarker.bindPopup(`
                        <div class="popup-content">
                            <div class="popup-title">Tu ubicación</div>
                            <div class="popup-description">${address}</div>
                        </div>
                    `).openPopup();
                });
            },
            function (error) {
                console.warn('Error obteniendo geolocalización:', error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }
}

// ======================
// OBTENER DIRECCIÓN EXACTA
// ======================

function getAddressFromCoordinates(lat, lng, callback) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    fetch(url, {
        headers: {
            "User-Agent": "SafePetApp/1.0 (contacto@safepet.cl)",
            "Accept-Language": "es"
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data && data.address) {
                const a = data.address;
                let address = "";

                if (a.road && a.house_number) address = `${a.road} ${a.house_number}`;
                else if (a.road) address = a.road;
                else if (a.neighbourhood) address = a.neighbourhood;
                else if (a.suburb) address = a.suburb;
                else address = data.display_name?.split(",")[0] || "Dirección no disponible";

                if (a.city || a.town || a.village) address += `, ${a.city || a.town || a.village}`;
                callback(address);
            } else {
                callback("Dirección no disponible");
            }
        })
        .catch(err => {
            console.error("Error obteniendo dirección:", err);
            callback("Dirección no disponible");
        });
}

//refugios

function addRealSheltersAndServices() {
    const places = [
        // 🐾 Quilicura
        {
            nombre: "Centro Veterinario Municipal de Quilicura",
            direccion: "Dr. Víctor Manuel Avilés, Quilicura",
            lat: -33.3720,
            lon: -70.7240,
        },
        {
            nombre: "Unidad de Higiene Ambiental y Zoonosis Quilicura",
            direccion: "San Luis 320, Quilicura",
            lat: -33.3765,
            lon: -70.7315,
           
        },
        {
            nombre: "Refugio Santa Luisa",
            direccion: "Santa Luisa 780, Quilicura",lat: -33.3748, lon: -70.7260,
        },

        // 🏥 Huechuraba
        {
            nombre: "Centro de Esterilización de Mascotas de Huechuraba",
            direccion: "Av. Recoleta 5315, Huechuraba",lat: -33.3795, lon: -70.6768,
        },

        // 🐕 Recoleta
        {
            nombre: "Centro Veterinario Municipal de Recoleta",
            direccion: "Av. Recoleta 3000, Recoleta",
            lat: -33.4070,
            lon: -70.6445,
        },

        // 🐶 Santiago
        {
            nombre: "Fundación Garras y Patas",
            direccion: "Sotero del Río 508, Santiago",
            lat: -33.4489,
            lon: -70.6737,
            web: "https://www.garrasypatas.cl/"
        },
        {
            nombre: "Refugio San Francisco de Asís",
            direccion: "Av. Independencia 2200, Santiago",
            lat: -33.4251,
            lon: -70.6535,
        
        },

        // 🐱 Ñuñoa
        {
            nombre: "Centro de Rescate Canino Ñuñoa",
            direccion: "Av. Vicuña Mackenna 1590, Ñuñoa",
            lat: -33.4636,
            lon: -70.5987,
            web: "https://adopcionescrcnunoa.cl/"
        },

        // 🦴 Providencia
        {
            nombre: "Fundación Julieta",
            direccion: "Av. Salvador 1176, Providencia",
            lat: -33.4395,
            lon: -70.6248,
            web: "https://fundacionjulieta.cl/"
        }
    ];

    const icon = L.divIcon({
        className: 'custom-div-icon shelter-marker',
        html: '<div style="background-color:#28a745;color:white;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.4);">🏠</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    places.forEach(item => {
        const webLink = item.web ? `<div><a href="${item.web}" target="_blank">🌐 Sitio web</a></div>` : "";
        const marker = L.marker([item.lat, item.lon], { icon })
            .addTo(map)
            .bindPopup(`
                <div class="popup-content shelter-popup">
                    <div class="popup-title">${item.nombre}</div>
                    <div><strong>Dirección:</strong> ${item.direccion}</div>
                    ${webLink}
                </div>
            `);
        shelterMarkers.push(marker);
    });

    console.log(`✅ Refugios y servicios cargados: ${places.length}`);
}
// FUNCIONES DE INTERFAZ

function centerOnUser() {
    if (!map) {
        alert('El mapa no está listo. Espera un momento e intenta de nuevo.');
        return;
    }
    if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 15);
        if (userMarker) userMarker.openPopup();
    } else {
        alert('Ubicación no disponible todavía.');
    }
}

function toggleShelters() {
    showShelters = !showShelters;
    shelterMarkers.forEach(marker => {
        if (showShelters) map.addLayer(marker);
        else map.removeLayer(marker);
    });
}

// EVENTOS

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => initMap(), 500);
});

window.addEventListener('load', () => {
    if (!mapInitialized) setTimeout(() => initMap(), 200);
});

function verifyAccountAndRedirect() {
    window.location.href = "petList.html";
}

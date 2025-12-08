// ======================
// MAPA SAFEPET
// ======================

// Variables
let map = null;
let userMarker = null;
let mapInitialized = false;
let shelterMarkers = [];	let showShelters = true;
let alertMarkers = [];		let showAlerts = true;
let userLocation = null;
let updatingPosition=false;

// marcador móvil si se debe mostrar un rastreador
var tracker=null;
// circulo que muestra la precision del rastreado
var trackerAccuracy=null;

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
				localStorage.setItem("latitude",userLat)
				localStorage.setItem("longitude",userLng)
				// Si se pasó algún parámetro, no se centra en el usuario.
                if(Object.keys(URLparams).length == 0)
					map.setView([userLat, userLng], 15);

                // Añadir marcador del usuario
                if (userMarker) map.removeLayer(userMarker);
				
				let popup = L.popup({interactive: true, bubblingMouseEvents: true})
					.setContent(`<div class="popup-content">
									<div class="popup-title">Tu ubicación</div>
								</div>`)

                userMarker = L.marker([userLat, userLng], {
						icon: L.divIcon({
							className: 'user-location-marker',
							html: '<div class="marker-content"><span class="icon" data-icon="location"></span></div>',
							iconSize: [26, 26],
							iconAnchor: [13, 13]
						}),
						zIndexOffset:100
					})
					.addTo(map)
					.bindPopup(popup)
					.on("click",()=>{
						map.setView([userLat, userLng])
						userMarker._popup._container._leaflet_disable_click=false;
					})
				processContents(userMarker._icon)
				// se actualiza la posición del usuario cada diez segundos
				setInterval(()=>{
					if(!updatingPosition){
					console.log("updating user location");
						updatingPosition=true;
						locate(pos=>{
							updatingPosition=false;
							console.log("updated");
							userMarker.setLatLng([pos.coords.latitude,pos.coords.longitude])
						})
					} else {
						console.log("still updating")
					}
					},20000)
/*
                getAddressFromCoordinates(userLat, userLng, address => {
                    userMarker.bindPopup(`
                        <div class="popup-content">
                            <div class="popup-title">Tu ubicación</div>
                            <div class="popup-description">${address}</div>
                        </div>
                    `).openPopup();
                });*/
            },
            function (error) {
                console.warn('Error obteniendo geolocalización:', error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }
	
	if("marker" in URLparams){
		// "marker" tiene el formato CLASE;LATITUDE;LONGITUD, donde CLASE es una clase .css que se aplica al marcador
		let markData = URLparams["marker"].split(";")
		console.log("markData: ",markData)
		let marker = L.marker([parseFloat(markData[1]),parseFloat(markData[2])], {
			icon: L.divIcon({
				className: 'marker-'+markData[0],
				html: '<div class="marker-content"></div>',
				iconSize: [26, 26],
				iconAnchor: [13, 13]
			})
		}).addTo(map);
		map.setView([parseFloat(markData[1]), parseFloat(markData[2])], 15);
	}
	
	if("area" in URLparams){
		// "area" tiene el formato LATITUDE;LONGITUDE;RADIUS
		let areaData = URLparams["area"].split(";")
		console.log("areaData: ",areaData)
		let circle = L.circle([parseFloat(areaData[0]),parseFloat(areaData[1])], {
			radius: parseFloat(areaData[2])
		}).addTo(map);
		map.setView([parseFloat(areaData[0]), parseFloat(areaData[1])], 19);
	}
	
	if("tracker" in URLparams){
		// "area" tiene el formato ID;LATITUDE;LONGITUDE
		let trackerData = URLparams["tracker"].split(";")
		console.log("trackerData:",trackerData);
		trackerAccuracy = L.circle([parseFloat(trackerData[1]),parseFloat(trackerData[2])], {
			radius: parseFloat(trackerData[3]),
			zIndexOffset:199
		}).addTo(map);
		trackerAccuracy._path.setAttribute("stroke","#a3c");
		trackerAccuracy._path.setAttribute("fill","#a3c");
		tracker = L.marker([parseFloat(trackerData[1]),parseFloat(trackerData[2])], {
			icon: L.divIcon({
				className: 'marker-tracker',
				html: '<div class="marker-content"><span class="icon" data-icon="pets"></span></div>',
				iconSize: [26, 26],
				iconAnchor: [13, 13]
			}),
			zIndexOffset:200
		}).addTo(map);
		map.setView([parseFloat(trackerData[1]), parseFloat(trackerData[2])], 19);
		processContents(tracker._icon)
		// se actualiza la posición del rastreador cada 10 segundos
		setInterval(()=>{locateTracker(trackerData)},10000)
	}
}

async function locateTracker(trackerData){
	req = await request(SERVER_URL+"getTrackerInfo.php",{tracker_id:trackerData[0]})
	if(req.status=="GOOD"){
		trackerAccuracy.setLatLng([parseFloat(req.latitude),parseFloat(req.longitude)])
		tracker.setLatLng([parseFloat(req.latitude),parseFloat(req.longitude)])
	} else {
		console.log("couldn't update tracker position");
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
        html: '<div class="marker-content"><span class="icon" data-icon="home"></span></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    places.forEach(item => {
        const webLink = item.web ? `<div><a href="${item.web}" target="_blank">🌐 Sitio web</a></div>` : "";
		let popup = L.popup({interactive: true, bubblingMouseEvents: true})
			.setContent(`
                <div class="popup-content shelter-popup">
                    <div class="popup-title">${item.nombre}</div>
                    <div><strong>Dirección:</strong> ${item.direccion}</div>
                    ${webLink}
                </div>
            `)
        const marker = L.marker([item.lat, item.lon], { icon })
            .addTo(map)
            .bindPopup(popup)
			.on("click",()=>{
				map.setView([item.lat, item.lon])
				marker._popup._container._leaflet_disable_click=false;
			});
			processContents(marker._icon);
			shelterMarkers.push(marker);
    });

    console.log(`�?Refugios y servicios cargados: ${places.length}`);
}
// FUNCIONES DE INTERFAZ

function centerOnUser() {
    if (!map) {
        alert('El mapa no est�� listo. Espera un momento e intenta de nuevo.');
        return;
    }
    if (userLocation) {
        if (userMarker) userMarker.openPopup();
        map.setView([userLocation.lat, userLocation.lng], 15);
    } else {
        alert('Ubicación no disponible todavía.');
    }
}

function toggleShelters() {
    showShelters = !showShelters;
    shelterMarkers.forEach(marker => {
        if (showShelters) marker._icon.classList.remove("invisible")
        else marker._icon.classList.add("invisible")
    });
}

function toggleAlerts() {
    showAlerts = !showAlerts;
    alertMarkers.forEach(marker => {
        if (showAlerts) marker._icon.classList.remove("invisible")
        else marker._icon.classList.add("invisible")
    });
}

// EVENTOS

document.addEventListener('DOMContentLoaded', async () => {
    setTimeout(() => initMap(), 500);
});

window.addEventListener('load', async () => {
	
	
	// Si se pasó algún parámetro, se quitan los botones a otras paginas para evitar que pueda formar una historia de navegacion infinita
	if(Object.keys(URLparams).length > 0){
		document.querySelector(".footer").remove();
		document.querySelector("#notificationsBtnHolder").remove();
	}
	
    if (!mapInitialized) setTimeout(() => initMap(), 200);
	let dID = await window.getDeviceId();
	localStorage.setItem("deviceID",dID.identifier)
	
    request(SERVER_URL+"getAlerts.php",{latitude:localStorage.latitude, longitude:localStorage.longitude}).then(r=>{
        if(!Array.isArray(r)) return;
        r.forEach(item => {
            const icon = L.divIcon({
                className: 'custom-div-icon alert-marker',
                html: '<div class="marker-content"><span class="icon" data-icon="warning"></span></div>',
                iconSize: [34, 34],
                iconAnchor: [17, 17]
            });
		let popup = L.popup({interactive: true, bubblingMouseEvents: true})
			.setContent(`
				<div class="popup-content alert-popup">
					<div class="popup-title">${item.petName}</div>
					<div>${getRecency(item.timestamp)}</div>
				</div>
			`)
		const marker = L.marker([item.latitude, item.longitude], {icon })
			.addTo(map)
			.bindPopup(popup)
			.on("click",()=>{
				map.setView([item.latitude, item.longitude])
				marker._popup._container._leaflet_disable_click=false;
			});
			processContents(marker._icon);
			alertMarkers.push(marker);
		});
	})
});

function verifyAccountAndRedirect() {
	let userData = localStorage.getItem("userData");
	if(!userData){
		if(!localStorage.getItem("shownAccountTutorial")){
			window.location.href = "registerAccount.html";
		} else 
			window.location.href = "login.html";
	}
	else
		window.location.href = "petList.html";
}

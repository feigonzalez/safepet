
		// Variables globales para el mapa
		let map = null;
		let userMarker = null;
		let mapInitialized = false;
		let petMarkers = [];
		let alertMarkers = [];
		let shelterMarkers = [];
		let showShelters = true;
		let showingPets = true;
		let showingAlerts = true;
		let userLocation = null; // Para almacenar la ubicación del usuario

		// Inicializar el mapa con configuración optimizada para Leaflet
		function initMap() {
			console.log('Inicializando mapa Leaflet...');
			
			// Verificar si el mapa ya está inicializado
			if (mapInitialized && map) {
				console.log('Mapa ya está inicializado, saltando...');
				return;
			}
			
			// Verificar que Leaflet esté disponible
			if (typeof L === 'undefined') {
				console.error('Leaflet.js no está cargado correctamente');
				document.getElementById('map').innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Error: No se pudo cargar el mapa</div>';
				return;
			}
			
			// Verificar que el contenedor del mapa exista
			const mapContainer = document.getElementById('map');
			if (!mapContainer) {
				console.error('Contenedor #map no encontrado en el DOM');
				return;
			}
			
			console.log('Contenedor del mapa encontrado:', mapContainer);
			
			try {
				// Limpiar el contenedor si ya tiene contenido
				mapContainer.innerHTML = '';
				
				// Coordenadas por defecto (Santiago, Chile)
				const defaultLat = -33.4489;
				const defaultLng = -70.6693;

				// Crear el mapa con configuración específica de Leaflet
				map = L.map('map', {
					center: [defaultLat, defaultLng],
					zoom: 13,
					zoomControl: true,
					attributionControl: true,
					scrollWheelZoom: true,
					doubleClickZoom: true,
					boxZoom: true,
					keyboard: true,
					dragging: true,
					touchZoom: true
				});
				
				console.log('Mapa Leaflet inicializado correctamente');
				
				// Marcar como inicializado
				mapInitialized = true;

				// Agregar capa de tiles de OpenStreetMap con manejo de errores
				const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					maxZoom: 19,
					minZoom: 1,
					subdomains: ['a', 'b', 'c'],
					errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXBhIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+',
					crossOrigin: true
				});
				
				// Manejar errores de carga de tiles
				tileLayer.on('tileerror', function(error) {
					console.warn('Error cargando tile del mapa:', error);
				});
				
				tileLayer.addTo(map);
				console.log('Capa de tiles agregada correctamente');

				// Forzar que el mapa se redimensione correctamente
				setTimeout(() => {
					if (map) {
						map.invalidateSize(true);
						console.log('Mapa redimensionado y actualizado');
					}
				}, 250);

				// Agregar marcadores de ejemplo
				addSamplePetMarkers();
				addSampleAlertMarkers();
				addSampleShelterMarkers();
				console.log('Marcadores de ejemplo agregados');

				// Intentar obtener geolocalización del usuario
				if (navigator.geolocation) {
					console.log('Solicitando geolocalización...');
					navigator.geolocation.getCurrentPosition(
						function(position) {
							const userLat = position.coords.latitude;
							const userLng = position.coords.longitude;
							console.log('Ubicación obtenida:', userLat, userLng);
							
							// Almacenar la ubicación del usuario
							userLocation = { lat: userLat, lng: userLng };
							
							// Centrar el mapa en la ubicación del usuario
							if (map) {
								map.setView([userLat, userLng], 15);
								
								// Remover marcador anterior si existe
								if (userMarker) {
									map.removeLayer(userMarker);
								}
								
								// Agregar marcador del usuario con icono personalizado
								userMarker = L.marker([userLat, userLng], {
									icon: L.divIcon({
										className: 'user-location-marker',
										html: '<div style="background-color: #007bff; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍</div>',
										iconSize: [26, 26],
										iconAnchor: [13, 13]
									})
								})
								.addTo(map)
								.bindPopup('<div class="popup-content"><div class="popup-title">Tu ubicación</div><div class="popup-description">Estás aquí</div></div>')
								.openPopup();
								
								// Actualizar refugios y alertas basados en la ubicación
								updateLocationBasedContent();
							}
						},
						function(error) {
							console.log('Error obteniendo geolocalización:', error.message);
							console.log('Código de error:', error.code);
							
							// Usar ubicación por defecto de Santiago y generar contenido
							const defaultLat = -33.4489;
							const defaultLng = -70.6693;
							userLocation = { lat: defaultLat, lng: defaultLng };
							
							console.log('Usando ubicación por defecto de Santiago:', userLocation);
							
							// Actualizar refugios y alertas basados en la ubicación por defecto
							updateLocationBasedContent();
							
							// Mantener ubicación por defecto en Santiago
						},
						{
							enableHighAccuracy: true,
							timeout: 10000,
							maximumAge: 300000
						}
					);
					} else {
						console.log('Geolocalización no disponible en este navegador');
						
						// Usar ubicación por defecto de Santiago y generar contenido
						const defaultLat = -33.4489;
						const defaultLng = -70.6693;
						userLocation = { lat: defaultLat, lng: defaultLng };
						
						console.log('Usando ubicación por defecto de Santiago (navegador sin geolocalización):', userLocation);
						
						// Actualizar refugios y alertas basados en la ubicación por defecto
						updateLocationBasedContent();
					}
				
			} catch (error) {
				console.error('Error crítico inicializando el mapa:', error);
				// Resetear el estado si hay error
				mapInitialized = false;
				map = null;
				document.getElementById('map').innerHTML = '<div style="padding: 20px; text-align: center; color: #ff0000;">Error: ' + error.message + '</div>';
			}
		}

		// Centrar en la ubicación del usuario
		function centerOnUser() {
			console.log('Botón de ubicación presionado');
			if (!map) {
				console.error('Mapa no está inicializado');
				alert('El mapa no está listo. Espera un momento e intenta de nuevo.');
				return;
			}

			if (navigator.geolocation) {
				console.log('Solicitando ubicación del usuario...');
				
				// Mostrar indicador de carga
				const loadingDiv = document.createElement('div');
				loadingDiv.id = 'location-loading';
				loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; text-align: center;';
				loadingDiv.innerHTML = '<div>📍 Obteniendo tu ubicación...</div>';
				document.body.appendChild(loadingDiv);

				navigator.geolocation.getCurrentPosition(
					function(position) {
						console.log('Ubicación obtenida exitosamente:', position.coords.latitude, position.coords.longitude);
						const userLat = position.coords.latitude;
						const userLng = position.coords.longitude;
						
						// Validar coordenadas obtenidas
						const coordValidation = GeolocationUtils.validateCoordinates(userLat, userLng);
						if (!coordValidation.isValid) {
							console.error('Coordenadas inválidas:', coordValidation.errors);
							GeolocationUtils.showGeolocationError('Coordenadas obtenidas no son válidas');
							return;
						}
						
						// Almacenar la ubicación del usuario
						userLocation = { lat: userLat, lng: userLng };
						
						// Remover indicador de carga
						document.body.removeChild(loadingDiv);
						
						// Mostrar mensaje de éxito
						GeolocationUtils.showGeolocationSuccess('Ubicación obtenida correctamente');
						
						// Centrar el mapa en la ubicación del usuario
						map.setView([userLat, userLng], 16);
						
						// Remover marcador anterior si existe
						if (userMarker) {
							map.removeLayer(userMarker);
						}
						
						// Agregar marcador del usuario
						userMarker = L.marker([userLat, userLng], {
							icon: L.divIcon({
								className: 'user-location-marker',
								html: '<div style="background-color: #007bff; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">📍</div>',
								iconSize: [30, 30],
								iconAnchor: [15, 15]
							})
						})
						.addTo(map);
						
						// Obtener dirección usando geocodificación inversa
						getAddressFromCoordinates(userLat, userLng, function(address) {
							userMarker.bindPopup('<div class="popup-content"><div class="popup-title">Tu ubicación actual</div><div class="popup-description">' + address + '</div></div>')
							.openPopup();
						});
						
						// Actualizar refugios y alertas basados en la ubicación
						updateLocationBasedContent();
						
						console.log('Marcador de usuario agregado correctamente');
					},
					function(error) {
						console.error('Error obteniendo geolocalización:', error.message || error);
						
						// Remover indicador de carga si existe
						const loadingElement = document.getElementById('location-loading');
						if (loadingElement) {
							document.body.removeChild(loadingElement);
						}
						
						let errorMessage = 'No se pudo obtener tu ubicación. ';
						switch(error.code) {
							case error.PERMISSION_DENIED:
								errorMessage += 'Permisos de ubicación denegados.';
								break;
							case error.POSITION_UNAVAILABLE:
								errorMessage += 'Ubicación no disponible.';
								break;
							case error.TIMEOUT:
								errorMessage += 'Tiempo de espera agotado.';
								break;
							default:
								errorMessage += 'Error desconocido.';
								break;
						}
						
						console.log(errorMessage);
						
						// Mostrar error usando el sistema de validación
						GeolocationUtils.showGeolocationError(errorMessage + ' Usando ubicación por defecto.');
						
						// Usar ubicación por defecto de Santiago
						const defaultLat = -33.4489;
						const defaultLng = -70.6693;
						userLocation = { lat: defaultLat, lng: defaultLng };
						
						// Centrar el mapa en la ubicación por defecto
						map.setView([defaultLat, defaultLng], 13);
						
						// Remover marcador anterior si existe
						if (userMarker) {
							map.removeLayer(userMarker);
						}
						
						// Agregar marcador en la ubicación por defecto
						userMarker = L.marker([defaultLat, defaultLng], {
							icon: L.divIcon({
								className: 'user-location-marker',
								html: '<div style="background-color: #6c757d; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">📍</div>',
								iconSize: [30, 30],
								iconAnchor: [15, 15]
							})
						})
						.addTo(map);
						
						// Obtener dirección para la ubicación por defecto
						getAddressFromCoordinates(defaultLat, defaultLng, function(address) {
							userMarker.bindPopup('<div class="popup-content"><div class="popup-title">Ubicación por defecto</div><div class="popup-description">' + address + '</div></div>');
						});
						
						// Actualizar refugios y alertas basados en la ubicación por defecto
						updateLocationBasedContent();
					},
					{
						enableHighAccuracy: true,
						timeout: 15000,
						maximumAge: 60000
					}
				);
			} else {
				alert('Tu navegador no soporta geolocalización.');
			}
		}

		// Alternar visibilidad de marcadores de mascotas
		function togglePetMarkers() {
			showingPets = !showingPets;
			petMarkers.forEach(marker => {
				if (showingPets) {
					map.addLayer(marker);
				} else {
					map.removeLayer(marker);
				}
			});
		}

		// Alternar visibilidad de marcadores de alertas
		function toggleAlerts() {
			showingAlerts = !showingAlerts;
			alertMarkers.forEach(marker => {
				if (showingAlerts) {
					map.addLayer(marker);
				} else {
					map.removeLayer(marker);
				}
			});
		}

		// Alternar visibilidad de marcadores de refugios
		function toggleShelters() {
			showShelters = !showShelters;
			shelterMarkers.forEach(marker => {
				if (showShelters) {
					map.addLayer(marker);
				} else {
					map.removeLayer(marker);
				}
			});
		}

		// Función para actualizar contenido basado en la ubicación del usuario
		function updateLocationBasedContent() {
			if (!userLocation) {
				console.log('No hay ubicación del usuario disponible');
				return;
			}
			
			console.log('Actualizando contenido basado en ubicación:', userLocation);
			
			// Limpiar marcadores existentes
			clearAllMarkers();
			
			// Generar refugios cerca del usuario
			generateNearbyContent();
		}
		
		// Función para limpiar todos los marcadores
		function clearAllMarkers() {
			// Limpiar refugios
			shelterMarkers.forEach(marker => {
				if (map.hasLayer(marker)) {
					map.removeLayer(marker);
				}
			});
			shelterMarkers = [];
			
			// Limpiar alertas
			alertMarkers.forEach(marker => {
				if (map.hasLayer(marker)) {
					map.removeLayer(marker);
				}
			});
			alertMarkers = [];
			
			// Limpiar mascotas (mantener las existentes por ahora)
			petMarkers.forEach(marker => {
				if (map.hasLayer(marker)) {
					map.removeLayer(marker);
				}
			});
			petMarkers = [];
		}
		
		// Función para generar contenido cerca del usuario
		function generateNearbyContent() {
			if (!userLocation) return;
			
			// Generar refugios cerca del usuario (radio de ~2-5 km)
			const nearbyRefuges = [
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.04,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.04,
					name: "Refugio Esperanza Local",
					description: "Refugio para perros y gatos abandonados",
					address: "Cerca de tu ubicación",
					phone: "+56 2 2345 6789",
					hours: "Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00"
				},
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.03,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.03,
					name: "Hogar Animal Cercano",
					description: "Centro de rescate y adopción",
					address: "En tu zona",
					phone: "+56 2 2876 5432",
					hours: "Mar-Dom: 10:00-17:00"
				},
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.025,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.025,
					name: "Fundación Patitas Local",
					description: "Refugio especializado en animales heridos",
					address: "Cerca de ti",
					phone: "+56 2 2654 3210",
					hours: "Lun-Sáb: 8:00-20:00"
				}
			];
			
			// Agregar marcadores de refugios
			nearbyRefuges.forEach(shelter => {
				const marker = L.marker([shelter.lat, shelter.lng], {
					icon: L.divIcon({
						className: 'custom-div-icon',
						html: '<div style="background-color: #28a745; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏠</div>',
						iconSize: [32, 32],
						iconAnchor: [16, 16]
					})
				})
				.addTo(map)
				.bindPopup(`
					<div class="shelter-popup">
						<div class="popup-title">${shelter.name}</div>
						<div class="shelter-details">
							<div class="popup-description">${shelter.description}</div>
							<div class="shelter-info">
								<div><strong>📍 Dirección:</strong> ${shelter.address}</div>
								<div><strong>📞 Teléfono:</strong> <a href="tel:${shelter.phone}">${shelter.phone}</a></div>
								<div><strong>🕒 Horarios:</strong> ${shelter.hours}</div>
							</div>
						</div>
					</div>
				`);
				
				if (showShelters) {
					shelterMarkers.push(marker);
				}
			});
			
			// Generar alertas/reportes cerca del usuario
			const nearbyAlerts = [
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.02,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.02,
					title: "Mascota encontrada cerca",
					description: "Perro encontrado en tu zona - hace 1 hora"
				},
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.015,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.015,
					title: "Avistamiento local",
					description: "Gato visto en tu área - hace 30 min"
				},
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
					title: "Reporte cercano",
					description: "Mascota perdida reportada cerca de ti"
				}
			];
			
			// Agregar marcadores de alertas
			nearbyAlerts.forEach(alert => {
				const marker = L.marker([alert.lat, alert.lng], {
					icon: L.divIcon({
						className: 'custom-div-icon',
						html: '<div style="background-color: #4ecdc4; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">⚠️</div>',
						iconSize: [30, 30],
						iconAnchor: [15, 15]
					})
				})
				.addTo(map)
				.bindPopup(`<div class="popup-content"><div class="popup-title">${alert.title}</div><div class="popup-description">${alert.description}</div></div>`);
				
				if (showingAlerts) {
					alertMarkers.push(marker);
				}
			});
			
			// Generar mascotas perdidas cerca del usuario
			const nearbyPets = [
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.018,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.018,
					name: "Luna",
					description: "Gata perdida cerca de tu ubicación - hace 2 horas",
					type: "lost"
				},
				{
					lat: userLocation.lat + (Math.random() - 0.5) * 0.012,
					lng: userLocation.lng + (Math.random() - 0.5) * 0.012,
					name: "Max",
					description: "Perro perdido en tu zona - reportado hace 1 hora",
					type: "lost"
				}
			];
			
			// Agregar marcadores de mascotas
			nearbyPets.forEach(pet => {
				const marker = L.marker([pet.lat, pet.lng], {
					icon: L.divIcon({
						className: 'custom-div-icon',
						html: '<div style="background-color: #ff6b6b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🐕</div>',
						iconSize: [30, 30],
						iconAnchor: [15, 15]
					})
				})
				.addTo(map)
				.bindPopup(`<div class="popup-content"><div class="popup-title">${pet.name}</div><div class="popup-description">${pet.description}</div></div>`);
				
				if (showingPets) {
					petMarkers.push(marker);
				}
			});
			
			console.log('Contenido basado en ubicación generado:', {
				refugios: nearbyRefuges.length,
				alertas: nearbyAlerts.length,
				mascotas: nearbyPets.length
			});
		}

		// Agregar marcadores de ejemplo de mascotas
		function addSamplePetMarkers() {
			const samplePets = [
				{
					lat: -33.4489 + 0.01,
					lng: -70.6693 + 0.01,
					name: "Covellina",
					description: "Gata perdida - Última vez vista aquí",
					type: "lost"
				},
				{
					lat: -33.4489 - 0.008,
					lng: -70.6693 + 0.015,
					name: "Dargón",
					description: "Perro perdido - Reportado hace 2 horas",
					type: "lost"
				}
			];

			samplePets.forEach(pet => {
				const marker = L.marker([pet.lat, pet.lng], {
					icon: L.divIcon({
						className: 'custom-div-icon',
						html: '<div style="background-color: #ff6b6b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🐕</div>',
						iconSize: [30, 30],
						iconAnchor: [15, 15]
					})
				})
				.addTo(map)
				.bindPopup(`<div class="popup-content"><div class="popup-title">${pet.name}</div><div class="popup-description">${pet.description}</div></div>`);
				
				petMarkers.push(marker);
			});
		}

		// Agregar marcadores de ejemplo de alertas
		function addSampleAlertMarkers() {
			const sampleAlerts = [
				{
					lat: -33.4489 + 0.005,
					lng: -70.6693 - 0.01,
					title: "Mascota encontrada",
					description: "Perro encontrado en el parque"
				},
				{
					lat: -33.4489 - 0.012,
					lng: -70.6693 - 0.008,
					title: "Avistamiento",
					description: "Gato visto en esta zona"
				}
			];

			sampleAlerts.forEach(alert => {
				const marker = L.marker([alert.lat, alert.lng], {
					icon: L.divIcon({
						className: 'custom-div-icon',
						html: '<div style="background-color: #4ecdc4; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">⚠️</div>',
						iconSize: [30, 30],
						iconAnchor: [15, 15]
					})
				})
				.addTo(map)
				.bindPopup(`<div class="popup-content"><div class="popup-title">${alert.title}</div><div class="popup-description">${alert.description}</div></div>`);
				
				alertMarkers.push(marker);
			});
		}

		// Agregar marcadores de ejemplo de refugios
		function addSampleShelterMarkers() {
			const sampleShelters = [
				{
					lat: -33.4489 + 0.02,
					lng: -70.6693 + 0.005,
					name: "Refugio Esperanza",
					description: "Refugio para perros y gatos abandonados",
					address: "Av. Providencia 1234, Santiago",
					phone: "+56 2 2345 6789",
					hours: "Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00"
				},
				{
					lat: -33.4489 - 0.015,
					lng: -70.6693 - 0.02,
					name: "Hogar Animal Feliz",
					description: "Centro de rescate y adopción",
					address: "Calle Los Aromos 567, Santiago",
					phone: "+56 2 2876 5432",
					hours: "Mar-Dom: 10:00-17:00"
				},
				{
					lat: -33.4489 + 0.008,
					lng: -70.6693 - 0.025,
					name: "Fundación Patitas",
					description: "Refugio especializado en animales heridos",
					address: "Pasaje San Juan 890, Santiago",
					phone: "+56 2 2654 3210",
					hours: "Lun-Sáb: 8:00-19:00"
				},
				{
					lat: -33.4489 - 0.005,
					lng: -70.6693 + 0.03,
					name: "Casa Cuna Animal",
					description: "Refugio temporal y adopciones",
					address: "Av. Las Condes 2345, Santiago",
					phone: "+56 2 2987 6543",
					hours: "Lun-Vie: 9:30-17:30"
				}
			];

			sampleShelters.forEach(shelter => {
				const marker = L.marker([shelter.lat, shelter.lng], {
					icon: L.divIcon({
						className: 'custom-div-icon shelter-marker',
						html: '<div style="background-color: #28a745; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);">🏠</div>',
						iconSize: [32, 32],
						iconAnchor: [16, 16]
					})
				})
				.addTo(map)
				.bindPopup(`
					<div class="popup-content shelter-popup">
						<div class="popup-title">${shelter.name}</div>
						<div class="popup-description">${shelter.description}</div>
						<div class="shelter-details">
							<div class="shelter-info">
								<strong>📍 Dirección:</strong><br>
								${shelter.address}
							</div>
							<div class="shelter-info">
								<strong>📞 Teléfono:</strong><br>
								<a href="tel:${shelter.phone}">${shelter.phone}</a>
							</div>
							<div class="shelter-info">
								<strong>🕒 Horarios:</strong><br>
								${shelter.hours}
							</div>
						</div>
					</div>
				`);
				
				shelterMarkers.push(marker);
			});
		}
		
		// Función para obtener dirección desde coordenadas usando geocodificación inversa
		function getAddressFromCoordinates(lat, lng, callback) {
			// Usar el servicio de Nominatim de OpenStreetMap para geocodificación inversa
			const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
			
			fetch(url)
				.then(response => response.json())
				.then(data => {
					if (data && data.display_name) {
						// Formatear la dirección de manera más específica y exacta
						let address = '';
						
						// Si hay información de dirección estructurada, usarla
						if (data.address) {
							const addr = data.address;
							
							// Priorizar calle y número de casa (dirección exacta)
							if (addr.road && addr.house_number) {
								address = `${addr.road} ${addr.house_number}`;
							} else if (addr.road) {
								address = addr.road;
								// Si no hay número de casa, agregar información adicional para ser más específico
								if (addr.neighbourhood) {
									address += `, ${addr.neighbourhood}`;
								} else if (addr.suburb) {
									address += `, ${addr.suburb}`;
								}
							} else if (addr.neighbourhood) {
								address = addr.neighbourhood;
							} else if (addr.suburb) {
								address = addr.suburb;
							} else {
								// Usar el nombre completo si no hay información específica
								address = data.display_name.split(',')[0];
							}
							
							// Si la dirección es muy corta o genérica, agregar más contexto
							if (address.length < 10 || !addr.house_number) {
								if (addr.city || addr.town) {
									address += `, ${addr.city || addr.town}`;
								}
							}
						} else {
							// Si no hay dirección estructurada, usar solo la primera parte del display_name
							address = data.display_name.split(',')[0];
						}
						
						callback(address);
					} else {
						// Si no se puede obtener la dirección, mostrar mensaje genérico sin coordenadas
						callback('Ubicación no disponible');
					}
				})
				.catch(error => {
					console.error('Error obteniendo dirección:', error);
					// En caso de error, mostrar mensaje genérico sin coordenadas
					callback('Ubicación no disponible');
				});
		}
		
		document.addEventListener('DOMContentLoaded', function() {
			console.log('DOM cargado, esperando 500ms antes de inicializar mapa...');
			setTimeout(() => {
				initMap();
			}, 500);
		});

		// También inicializar cuando la ventana se carga completamente
		window.addEventListener('load', function() {
			console.log('Ventana cargada completamente');
			if (!mapInitialized) {
				console.log('Mapa no inicializado, intentando nuevamente...');
				setTimeout(() => {
					initMap();
				}, 200);
			}
		});
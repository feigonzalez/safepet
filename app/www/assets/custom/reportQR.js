
		// Función para inicializar el escáner QR cuando se carga la página
		document.addEventListener('DOMContentLoaded', async function() {
			try {
				// Mostrar mensaje de carga
				const cameraBox = document.querySelector('.cameraBox');
				cameraBox.innerHTML = '<p class="ta-center">Iniciando cámara...</p>';
				
				// Iniciar el escáner QR automáticamente
				const qrContent = await CameraManager.showQRScanner();
				
				// Procesar el resultado del QR
				if (qrContent) {
					console.log('QR escaneado:', qrContent);
					
					// Aquí puedes procesar el contenido del QR
					// Por ejemplo, si contiene información de la mascota
					if (qrContent.includes('safepet') || qrContent.includes('pet-id')) {
						// Redirigir al formulario de reporte con datos prellenados
						window.location.href = `reportManual.html?qr=${encodeURIComponent(qrContent)}`;
					} else {
						// Mostrar el contenido del QR y permitir continuar
						alert(`Código QR detectado: ${qrContent}\n\nSerás redirigido al formulario de reporte.`);
						window.location.href = 'reportManual.html';
					}
				}
			} catch (error) {
				console.error('Error al inicializar escáner:', error);
				const cameraBox = document.querySelector('.cameraBox');
				cameraBox.innerHTML = `
					<div class="ta-center">
						<p>Error al inicializar la cámara</p>
						<button class="button bg-red" onclick="location.reload()">Reintentar</button>
						<button class="button" onclick="window.location.href='reportManual.html'">Continuar sin QR</button>
					</div>
				`;
			}
		});
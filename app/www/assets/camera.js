/**
 * SafePet Camera Module
 * Maneja las funcionalidades de cámara para captura de fotos y escaneo de QR
 */

// Verificar si Capacitor está disponible
const isCapacitorAvailable = () => {
    return typeof window !== 'undefined' && window.Capacitor;
};

// Simulación de plugins para entorno web
const MockCamera = {
    getPhoto: async (options) => {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = options.source === 'CAMERA' ? 'environment' : undefined;
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            webPath: e.target.result,
                            format: 'jpeg'
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    reject(new Error('No se seleccionó ninguna imagen'));
                }
            };
            
            input.click();
        });
    }
};

const MockBarcodeScanner = {
    startScan: async () => {
        return new Promise((resolve) => {
            alert('Escáner QR simulado - En dispositivo real funcionará correctamente');
            resolve({ hasContent: true, content: 'QR_SIMULADO_123' });
        });
    },
    stopScan: () => {
        console.log('Deteniendo escáner simulado');
    }
};

// Obtener plugins (reales o simulados)
const getCamera = () => {
    if (isCapacitorAvailable() && window.Capacitor.Plugins.Camera) {
        return window.Capacitor.Plugins.Camera;
    }
    return MockCamera;
};

const getBarcodeScanner = () => {
    if (isCapacitorAvailable() && window.Capacitor.Plugins.BarcodeScanner) {
        return window.Capacitor.Plugins.BarcodeScanner;
    }
    return MockBarcodeScanner;
};

class CameraManager {
    constructor() {
        this.isScanning = false;
    }

    /**
     * Método para capturar foto desde HTML (compatibilidad)
     * @param {string} inputId - ID del input de archivo
     * @param {string} displayId - ID del elemento para mostrar la imagen
     */
    async capturePhoto(inputId, displayId) {
        try {
            const image = await this.takePhoto();
            
            // Mostrar la imagen en el elemento display
            if (displayId) {
                const displayElement = document.getElementById(displayId);
                if (displayElement) {
                    displayElement.style.backgroundImage = `url(${image.webPath})`;
                    displayElement.style.backgroundSize = 'cover';
                    displayElement.style.backgroundPosition = 'center';
                }
            }
            
            // Actualizar el input si existe
            if (inputId) {
                const inputElement = document.getElementById(inputId);
                if (inputElement) {
                    // Crear un archivo simulado para el input
                    const dataTransfer = new DataTransfer();
                    inputElement.files = dataTransfer.files;
                }
            }
            
            return image;
        } catch (error) {
            console.error('Error en capturePhoto:', error);
            alert('Error al capturar foto: ' + error.message);
        }
    }

    /**
     * Método para escanear QR desde HTML (compatibilidad)
     */
    async scanQRCode() {
        try {
            const result = await this.showQRScanner();
            if (result) {
                alert('Código QR escaneado: ' + result);
                return result;
            }
        } catch (error) {
            console.error('Error en scanQRCode:', error);
            alert('Error al escanear QR: ' + error.message);
        }
    }

    /**
     * Captura una foto usando la cámara del dispositivo
     * @param {Object} options - Opciones de configuración para la cámara
     * @returns {Promise<Photo>} - Promesa que resuelve con la foto capturada
     */
    async takePhoto(options = {}) {
        try {
            const defaultOptions = {
                quality: 90,
                allowEditing: true,
                resultType: 'uri', // CameraResultType.Uri
                source: 'camera', // CameraSource.Camera
                width: 800,
                height: 800
            };

            const finalOptions = { ...defaultOptions, ...options };
            
            const camera = getCamera();
            const image = await camera.getPhoto(finalOptions);
            
            console.log('Foto capturada exitosamente:', image.webPath);
            return image;
        } catch (error) {
            console.error('Error al capturar foto:', error);
            throw new Error('No se pudo capturar la foto: ' + error.message);
        }
    }

    /**
     * Selecciona una foto de la galería del dispositivo
     * @param {Object} options - Opciones de configuración
     * @returns {Promise<Photo>} - Promesa que resuelve con la foto seleccionada
     */
    async selectFromGallery(options = {}) {
        try {
            const defaultOptions = {
                quality: 90,
                allowEditing: true,
                resultType: 'uri', // CameraResultType.Uri
                source: 'photos', // CameraSource.Photos
                width: 800,
                height: 800
            };

            const finalOptions = { ...defaultOptions, ...options };
            
            const camera = getCamera();
            const image = await camera.getPhoto(finalOptions);
            
            console.log('Foto seleccionada de galería:', image.webPath);
            return image;
        } catch (error) {
            console.error('Error al seleccionar foto de galería:', error);
            throw new Error('No se pudo seleccionar la foto: ' + error.message);
        }
    }

    /**
     * Muestra un modal para elegir entre cámara o galería
     * @returns {Promise<Photo>} - Promesa que resuelve con la foto seleccionada
     */
    async showPhotoOptions() {
        return new Promise((resolve, reject) => {
            const modal = document.createElement('div');
            modal.className = 'modalBackdrop';
            modal.innerHTML = `
                <div class="modal">
                    <div class="column mh-1">
                        <div class="row ta-center">
                            <h2 style="margin:0.5rem 0">Seleccionar Foto</h2>
                            <p class="metaText" style="margin:0.5rem 1rem">¿Cómo quieres agregar la foto de tu mascota?</p>
                        </div>
                        <div class="row compact">
                            <div class="column">
                                <button class="button bg-red" id="takePhotoBtn">
                                    <span class="icon" data-icon="camera"></span>
                                    &nbsp;&nbsp;Tomar Foto
                                </button>
                                <button class="button" id="selectPhotoBtn">
                                    <span class="icon" data-icon="image"></span>
                                    &nbsp;&nbsp;Seleccionar de Galería
                                </button>
                                <button class="button" id="cancelPhotoBtn">
                                    <span class="icon" data-icon="x"></span>
                                    &nbsp;&nbsp;Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            modal.querySelector('#takePhotoBtn').addEventListener('click', async () => {
                try {
                    const photo = await this.capturePhoto();
                    modal.remove();
                    resolve(photo);
                } catch (error) {
                    modal.remove();
                    reject(error);
                }
            });

            modal.querySelector('#selectPhotoBtn').addEventListener('click', async () => {
                try {
                    const photo = await this.selectFromGallery();
                    modal.remove();
                    resolve(photo);
                } catch (error) {
                    modal.remove();
                    reject(error);
                }
            });

            modal.querySelector('#cancelPhotoBtn').addEventListener('click', () => {
                modal.remove();
                reject(new Error('Operación cancelada por el usuario'));
            });
        });
    }

    /**
     * Inicia el escaneo de códigos QR
     * @returns {Promise<string>} - Promesa que resuelve con el contenido del código QR
     */
    async startQRScan() {
        try {
            this.isScanning = true;
            
            const scanner = getBarcodeScanner();
            const result = await scanner.startScan();
            
            this.isScanning = false;
            
            if (result.hasContent) {
                console.log('QR escaneado:', result.content);
                return result.content;
            } else {
                throw new Error('No se detectó ningún código QR');
            }
        } catch (error) {
            this.isScanning = false;
            console.error('Error al escanear QR:', error);
            throw new Error('Error en el escáner QR: ' + error.message);
        }
    }

    /**
     * Detiene el escaneo de códigos QR
     */
    stopQRScan() {
        if (this.isScanning) {
            const scanner = getBarcodeScanner();
            scanner.stopScan();
            this.isScanning = false;
            document.body.classList.remove('scanner-active');
        }
    }

    /**
     * Muestra la interfaz de escaneo QR con botón de cancelar
     * @returns {Promise<string>} - Promesa que resuelve con el contenido del código QR
     */
    async showQRScanner() {


        return new Promise(async (resolve, reject) => {
            try {
                // Crear overlay con botón de cancelar
                const overlay = document.createElement('div');
                overlay.className = 'qr-scanner-overlay';
                overlay.innerHTML = `
                    <div class="qr-scanner-controls">
                        <h3>Escanear Código QR</h3>
                        <p>Apunta la cámara hacia el código QR</p>
                        <button class="button" id="cancelQRBtn">
                            <span class="icon" data-icon="x"></span>
                            &nbsp;&nbsp;Cancelar
                        </button>
                    </div>
                `;

                document.body.appendChild(overlay);

                // Event listener para cancelar
                overlay.querySelector('#cancelQRBtn').addEventListener('click', () => {
                    this.stopQRScan();
                    overlay.remove();
                    reject(new Error('Escaneo cancelado por el usuario'));
                });

                // Iniciar escaneo
                const result = await this.startQRScan();
                overlay.remove();
                resolve(result);

            } catch (error) {
                const overlay = document.querySelector('.qr-scanner-overlay');
                if (overlay) overlay.remove();
                reject(error);
            }
        });
    }

    /**
     * Convierte una imagen a base64 para almacenamiento
     * @param {Photo} photo - Objeto foto de Capacitor
     * @returns {Promise<string>} - Promesa que resuelve con la imagen en base64
     */
    async photoToBase64(photo) {
        try {
            if (photo.base64String) {
                return photo.base64String;
            }

            // Si no hay base64, convertir desde webPath
            const response = await fetch(photo.webPath);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error al convertir foto a base64:', error);
            throw new Error('No se pudo procesar la imagen');
        }
    }
}

// Crear instancia global
const cameraManager = new CameraManager();

// Exportar para uso en otros archivos
window.CameraManager = cameraManager;

// CSS para el escáner QR
const qrScannerStyles = `
    .scanner-active {
        background: transparent !important;
    }
    
    .qr-scanner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .qr-scanner-controls {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 300px;
        margin: 1rem;
    }
    
    .qr-scanner-controls h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
    }
    
    .qr-scanner-controls p {
        margin: 0 0 1.5rem 0;
        color: #666;
        font-size: 0.9rem;
    }
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = qrScannerStyles;
document.head.appendChild(styleSheet);

console.log('Camera Manager inicializado correctamente');
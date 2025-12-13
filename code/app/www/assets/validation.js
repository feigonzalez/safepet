// Configuración de validaciones
const ValidationConfig = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Por favor ingresa un email válido'
    },
    phone: {
        pattern: /^(\+56\s?)?[0-9]{1}\s?[0-9]{4}\s?[0-9]{4}$/,
        message: 'Formato: +56 9 1234 5678 o 912345678'
    },
    name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'Solo letras y espacios, mínimo 2 caracteres'
    },
    password: {
        minLength: 6,
        pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])/,
        message: 'Mínimo 6 caracteres, debe incluir letras y números'
    },
    petName: {
        minLength: 1,
        maxLength: 30,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'Solo letras y espacios, máximo 30 caracteres'
    },
    petSpecies: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'Solo letras, mínimo 3 caracteres'
    },
    petBreed: {
        minLength: 2,
        maxLength: 30,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'Solo letras y espacios, mínimo 2 caracteres'
    },
    petColor: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        message: 'Solo letras y espacios, mínimo 3 caracteres'
    },
    address: {
        minLength: 10,
        maxLength: 100,
        message: 'Dirección debe tener entre 10 y 100 caracteres'
    }
};

// Función principal de validación
function validateField(field, customConfig = {}) {
	let fieldName = field.getAttribute("name");
	let value = field.value;
	const trimmedValue = value.trim();
	let result = {isValid:true, errors:[], value:trimmedValue}
	
	// console.log(`Validating ${fieldName} ${field.hasAttribute("required")?"(Req)":""}: [${trimmedValue}]`)
	
	if(trimmedValue==="" && !field.hasAttribute("required")){
		// console.log(`\tSkipped: empty and not required`);
		return result;
	}
	
    const config = { ...ValidationConfig[fieldName], ...customConfig };

    // Validar longitud mínima
    if (config.minLength && trimmedValue.length < config.minLength) {
        result.errors.push(`Mínimo ${config.minLength} caracteres`);
    }

    // Validar longitud máxima
    if (config.maxLength && trimmedValue.length > config.maxLength) {
        result.errors.push(`Máximo ${config.maxLength} caracteres`);
    }

    // Validar patrón
    if (config.pattern && !config.pattern.test(trimmedValue)) {
        result.errors.push(config.message || 'Formato inválido');
    }
	result.isValid = result.errors.length === 0;
    return result;
}

// Validar formulario completo
function validateForm(formElement, validationRules) {
    const results = {};
    let isFormValid = true;

    // Limpiar errores previos
    clearFormErrors(formElement);

    Object.keys(validationRules).forEach(fieldName => {
        const field = formElement.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        const validation = validateField(field, validationRules[fieldName]);
        
        results[fieldName] = validation;

        if (!validation.isValid) {
            isFormValid = false;
			console.log(`Validation failed on field [${fieldName}] = [${field.value}]`)
            showFieldError(field, validation.errors[0]);
        } else {
            clearFieldError(field);
        }
    });

    return {
        isValid: isFormValid,
        results: results
    };
}

// Mostrar error en campo específico
function showFieldError(field, message) {
    // Remover error previo
    clearFieldError(field);

    // Agregar clase de error al campo
    field.classList.add('error');

    // Crear elemento de error
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;

    // Insertar después del campo
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

// Limpiar error de campo específico
function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Limpiar todos los errores del formulario
function clearFormErrors(formElement) {
    const errorElements = formElement.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());

    const errorFields = formElement.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

// Validación en tiempo real
function setupRealTimeValidation(formElement, validationRules) {
    Object.keys(validationRules).forEach(fieldName => {
        const field = formElement.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        // Validar al perder el foco
        field.addEventListener('blur', function() {
            const validation = validateField(this, validationRules[fieldName]);
            if (!validation.isValid) {
                showFieldError(this, validation.errors[0]);
            } else {
                clearFieldError(this);
            }
        });

        // Limpiar error al escribir
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                clearFieldError(this);
            }
        });
    });
}

// Validaciones específicas para SafePet
const SafePetValidations = {
    // Validación para formulario de registro
    registerForm: {
        name: ValidationConfig.name,
        email: ValidationConfig.email,
        phone: ValidationConfig.phone,
        password: ValidationConfig.password
    },

    // Validación para formulario de login
    loginForm: {
        email: ValidationConfig.email,
        password: { minLength: 1, message: 'Ingresa tu contraseña' }
    },

    // Validación para registro de mascota
    petRegisterForm: {
        petName: ValidationConfig.petName,
        petSpecies: ValidationConfig.petSpecies,
        petColor: ValidationConfig.petColor,
        petSex: { required: true, message: 'Selecciona el sexo de la mascota' }
    },

    // Validación para reporte de mascota
    petReportForm: {
        petSpecies: ValidationConfig.petSpecies,
        petColor: ValidationConfig.petColor,
        petBreed: ValidationConfig.petBreed,
        petSex: { required: true, message: 'Selecciona el sexo de la mascota' }
    },

    // Validación para perfil de usuario
	// Movido a editProfile.js
};

// Validar radio buttons y checkboxes
function validateRadioGroup(formElement, groupName, errorMessage = 'Selecciona una opción') {
    const radioButtons = formElement.querySelectorAll(`input[name="${groupName}"]`);
    const isSelected = Array.from(radioButtons).some(radio => radio.checked);
    
    if (!isSelected) {
        const firstRadio = radioButtons[0];
        if (firstRadio) {
            showFieldError(firstRadio, errorMessage);
        }
        return false;
    }
    
    return true;
}

// Validar archivo subido
function validateFile(fileInput, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024) {
    const file = fileInput.files[0];
    const errors = [];

    if (!file) {
        return { isValid: true, errors: [] }; // Archivo opcional
    }

    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
        errors.push('Tipo de archivo no permitido. Solo imágenes JPG, PNG o GIF');
    }

    // Validar tamaño
    if (file.size > maxSize) {
        errors.push(`Archivo muy grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        file: file
    };
}

// Mostrar mensaje de éxito
function showSuccessMessage(message, duration = 3000) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, duration);
}

// Mostrar mensaje de error general
function showErrorMessage(message, duration = 4000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc3545;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, duration);
}

// Configuración de validaciones para geolocalización y mapas
const GeolocationValidations = {
    // Validar coordenadas de latitud
    latitude: {
        pattern: /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
        message: 'Latitud debe estar entre -90 y 90 grados'
    },
    
    // Validar coordenadas de longitud
    longitude: {
        pattern: /^-?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$|^-?180(\.0+)?$/,
        message: 'Longitud debe estar entre -180 y 180 grados'
    },
    
    // Validar dirección
    address: {
        pattern: /^[a-zA-ZÀ-ÿ0-9\s,.-]{5,100}$/,
        message: 'Dirección debe tener entre 5 y 100 caracteres'
    },
    
    // Validar radio de búsqueda
    searchRadius: {
        pattern: /^[1-9]\d{0,2}$/,
        message: 'Radio debe ser entre 1 y 999 kilómetros'
    }
};

// Función para validar coordenadas
function validateCoordinates(lat, lng) {
    const errors = [];
    
    // Validar latitud
    if (!GeolocationValidations.latitude.pattern.test(lat)) {
        errors.push(GeolocationValidations.latitude.message);
    }
    
    // Validar longitud
    if (!GeolocationValidations.longitude.pattern.test(lng)) {
        errors.push(GeolocationValidations.longitude.message);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Función para validar dirección
function validateAddress(address) {
    if (!address || address.trim().length === 0) {
        return {
            isValid: false,
            errors: ['La dirección es requerida']
        };
    }
    
    if (!GeolocationValidations.address.pattern.test(address.trim())) {
        return {
            isValid: false,
            errors: [GeolocationValidations.address.message]
        };
    }
    
    return {
        isValid: true,
        errors: []
    };
}

// Función para validar radio de búsqueda
function validateSearchRadius(radius) {
    if (!radius || radius.toString().trim().length === 0) {
        return {
            isValid: false,
            errors: ['El radio de búsqueda es requerido']
        };
    }
    
    if (!GeolocationValidations.searchRadius.pattern.test(radius.toString())) {
        return {
            isValid: false,
            errors: [GeolocationValidations.searchRadius.message]
        };
    }
    
    return {
        isValid: true,
        errors: []
    };
}

// Función para validar datos de geolocalización
function validateGeolocationData(data) {
    const errors = [];
    
    // Validar coordenadas si están presentes
    if (data.latitude !== undefined && data.longitude !== undefined) {
        const coordValidation = validateCoordinates(data.latitude, data.longitude);
        if (!coordValidation.isValid) {
            errors.push(...coordValidation.errors);
        }
    }
    
    // Validar dirección si está presente
    if (data.address !== undefined) {
        const addressValidation = validateAddress(data.address);
        if (!addressValidation.isValid) {
            errors.push(...addressValidation.errors);
        }
    }
    
    // Validar radio de búsqueda si está presente
    if (data.searchRadius !== undefined) {
        const radiusValidation = validateSearchRadius(data.searchRadius);
        if (!radiusValidation.isValid) {
            errors.push(...radiusValidation.errors);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Función para mostrar error de geolocalización
function showGeolocationError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc3545;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
        max-width: 300px;
    `;
    errorDiv.innerHTML = `📍 ${message}`;
    document.body.appendChild(errorDiv);
    
    // Remover mensaje después de 4 segundos
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 4000);
}

// Función para mostrar éxito de geolocalización
function showGeolocationSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
        max-width: 300px;
    `;
    successDiv.innerHTML = `📍 ${message}`;
    document.body.appendChild(successDiv);
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, 3000);
}

// Exportar funciones de geolocalización
window.GeolocationUtils = {
    validateCoordinates,
    validateAddress,
    validateSearchRadius,
    validateGeolocationData,
    showGeolocationError,
    showGeolocationSuccess,
    GeolocationValidations
};

// Exportar funciones para uso global
window.ValidationUtils = {
    validateField,
    validateForm,
    setupRealTimeValidation,
    validateRadioGroup,
    validateFile,
    showSuccessMessage,
    showErrorMessage,
    SafePetValidations
};
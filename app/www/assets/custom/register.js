
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const validationRules = ValidationUtils.SafePetValidations.petReportForm;
            
            // Configurar validación en tiempo real
            ValidationUtils.setupRealTimeValidation(form, validationRules);
            
            // Validación especial para archivo de imagen
            const imageInput = document.getElementById('reg_petImage');
            imageInput.addEventListener('change', function() {
                const validation = ValidationUtils.validateFile(this, ['image/jpeg', 'image/png', 'image/gif'], 5 * 1024 * 1024);
                if (!validation.isValid) {
                    ValidationUtils.showErrorMessage(validation.errors[0]);
                    this.value = '';
                    document.getElementById('petImageDisplay').style.backgroundImage = '';
                }
            });
            
            // Manejar envío del formulario
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Validar campos de texto
                const validation = ValidationUtils.validateForm(form, validationRules);
                
                // Validar radio buttons de sexo
                const sexValid = ValidationUtils.validateRadioGroup(form, 'petSex', 'Selecciona el sexo de la mascota');
                
                if (validation.isValid && sexValid) {
                    // Mostrar modal de confirmación antes de registrar
                    const confirmed = await showVerificationModal(
                        'Confirmar Registro',
                        '¿Estás seguro de que quieres registrar esta mascota con la información proporcionada?',
                        'Registrar Mascota',
                        'Revisar Datos'
                    );
                    
                    if (confirmed) {
                        // Simular proceso de registro
                        const submitButton = form.querySelector('input[type="submit"]');
                        const originalValue = submitButton.value;
                        
                        submitButton.disabled = true;
                        submitButton.value = 'Registrando...';
                        
                        setTimeout(() => {
                            ValidationUtils.showSuccessMessage('Mascota registrada exitosamente');
                            
                            // Redirigir después del éxito
                            setTimeout(() => {
                                window.location.href = 'alertList.html';
                            }, 1500);
                        }, 1500);
                    }
                } else {
                    ValidationUtils.showErrorMessage('Por favor corrige los errores en el formulario');
                }
            });
        });
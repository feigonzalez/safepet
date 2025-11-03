
async function beforeLoad() {
            try {
                // Cargar información del usuario
                let db = await selectAll();
                let account = db ? db.account : null;
                
                // Datos de prueba si no hay cuenta configurada (mismos que en settings)
                if (!account) {
                    account = {
                        name: "Francisca Espinosa",
                        email: "fran@example.com",
                        phone: "+56 9 8765 4321",
                        address: "Valparaíso, Chile"
                    };
                }
                
                // Llenar el formulario con los datos actuales
                fillForm(account);
            } catch (error) {
                console.log('Error loading data, using default values:', error);
                // Usar los mismos datos por defecto que en settings
                const defaultAccount = {
                    name: "Francisca Espinosa",
                    email: "fran@example.com",
                    phone: "+56 9 8765 4321",
                    address: "Valparaíso, Chile"
                };
                fillForm(defaultAccount);
            }
        }
        
        function fillForm(account) {
            // Llenar campos del formulario
            document.getElementById('fullName').value = account.name || '';
            document.getElementById('email').value = account.email || '';
            document.getElementById('phone').value = account.phone || '';
            document.getElementById('address').value = account.address || '';
            
            // Actualizar iniciales en la foto
            if (account.name) {
                const initials = account.name
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                const initialsEl = document.getElementById('profileInitials');
                if (initialsEl) {
                    initialsEl.textContent = initials || 'U';
                }
            }
        }

        function changePhoto() {
            alert('Funcionalidad de cambio de foto próximamente disponible');
        }

        // Cargar datos al inicializar la página
        document.addEventListener('DOMContentLoaded', function() {
            beforeLoad();
            
            // Preparar referencias a formulario y reglas de validación
            const form = document.getElementById('profileForm');
            const validationRules = ValidationUtils.SafePetValidations.profileForm;

            // Configurar validaciones en tiempo real
            ValidationUtils.setupRealTimeValidation(form, validationRules);

            // Configurar manejo del formulario
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Validar formulario
                const validation = ValidationUtils.validateForm(form, validationRules);
                
                if (validation.isValid) {
                    // Obtener datos del formulario
                    const formData = {
                        name: document.getElementById('fullName').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value
                    };
                    
                    // Simular guardado (aquí se conectaría con la base de datos)
                    console.log('Guardando perfil:', formData);
                    
                    // Mostrar modal de éxito
                    loadModal('templates/profileUpdatedModal.html');
                } else {
                    ValidationUtils.showErrorMessage('Por favor, corrige los errores en el formulario');
                }
            });
            
            // Configurar botón de cancelar
            const cancelButton = document.querySelector('.cancel-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', function() {
                    NavigationUtils.goBack();
                });
            }
        });
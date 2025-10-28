
        async function beforeLoad() {
            try {
                // Cargar información del usuario
                let db = await selectAll();
                let account = db ? db.account : null;
                
                // Datos de prueba si no hay cuenta configurada
                if (!account) {
                    account = {
                        name: "Juan Pérez",
                        email: "juan.perez@email.com"
                    };
                }
                
                // Actualizar información del perfil
                updateProfileInfo(account);
            } catch (error) {
                console.log('Error loading data, using default values:', error);
                // Usar datos por defecto en caso de error
                const defaultAccount = {
                    name: "Francisca Espinosa",
                    email: "fran@example.com"
                };
                updateProfileInfo(defaultAccount);
            }
        }
        
        function updateProfileInfo(account) {
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileInitials = document.getElementById('profileInitials');
            
            if (profileName) profileName.textContent = account.name || 'Usuario';
            if (profileEmail) profileEmail.textContent = account.email || 'Sin correo';
            
            // Generar iniciales
            if (profileInitials && account.name) {
                const initials = account.name
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                profileInitials.textContent = initials || 'U';
            }
        }

        function goBack() {
            // Navegar de vuelta a la página anterior o al índice
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        }

        async function confirmLogout() {
            const confirmed = await showVerificationModal(
                'Cerrar Sesión',
                '¿Estás seguro de que quieres cerrar sesión?',
                'Cerrar Sesión',
                'Cancelar'
            );
            
            if (confirmed) {
                logout();
            }
        }

        function logout() {
            // Limpiar datos de sesión
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirigir a la página de autenticación
            window.location.href = 'auth.html';
        }

        // Cargar datos al inicializar la página
        document.addEventListener('DOMContentLoaded', beforeLoad);
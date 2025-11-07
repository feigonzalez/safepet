async function beforeLoad() {
    try {
        // Buscar sesión activa
        const activeUser = JSON.parse(localStorage.getItem('activeUser'));
        if (activeUser) {
            // Si hay usuario activo, mostrarlo
            updateProfileInfo(activeUser);
            return;
        }

    } catch (error) {
        console.error('Error al cargar datos de usuario:', error);
        // Redirigir a autenticación si algo falla
        window.location.href = 'requireAccount.html';
    }
}

function updateProfileInfo(account) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileInitials = document.getElementById('profileInitials');

    if (profileName) profileName.textContent = account.name || 'Usuario';
    if (profileEmail) profileEmail.textContent = account.email || 'Sin correo';

    // Generar iniciales del nombre
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

async function confirmLogout() {
    const confirmed = await showVerificationModal(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        'Cerrar Sesión',
        'Cancelar'
    );
    
    if (confirmed) logout();
}

function logout() {
    // Limpiar datos de sesión
    localStorage.removeItem('activeUser');
    sessionStorage.clear();

    // Redirigir a autenticación
    window.location.href = 'requireAccount.html';
}

// Inicializar
document.addEventListener('DOMContentLoaded', beforeLoad);

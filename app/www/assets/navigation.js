// Utilidades de navegación para SafePet
// Este archivo proporciona funciones para manejar la navegación entre páginas

var URLparams;

// Función para navegar hacia atrás
function goBack() {
    // Verificar si hay historial disponible
    if (window.history.length > 1) {
		localStorage.setItem("navigationAction","reload");
        window.history.back();
    } else {
        // Si no hay historial, ir a la página principal
        window.location.href = 'index.html';
    }
}

// Función para navegar a una página específica
function navigateTo(page) {
    if (page && typeof page === 'string') {
        window.location.href = page;
    }
}

// Función para navegar con parámetros
function navigateWithParams(page, params = {}) {
    if (!page) return;
    
    const url = new URL(page, window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1));
    
    // Agregar parámetros a la URL
    Object.keys(params).forEach(key => {
        url.searchParams.set(key, params[key]);
    });
    
    window.location.href = url.toString();
}

// Función para obtener parámetros de la URL actual
function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    
    return params;
}

// Función para reemplazar la página actual en el historial
function replacePage(page) {
    if (page && typeof page === 'string') {
        window.location.replace(page);
    }
}

// Función para recargar la página actual
function reloadPage() {
    window.location.reload();
}

// Función para verificar si estamos en una página específica
function isCurrentPage(page) {
    const currentPage = window.location.pathname.split('/').pop();
    return currentPage === page;
}

// Función para configurar botones de navegación automáticamente
function setupNavigationButtons() {
    // Configurar todos los botones con clase 'back-button'
    const backButtons = document.querySelectorAll('.back-button, [data-action="back"]');
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            goBack();
        });
    });
    
    // Configurar botones con atributo data-navigate
    const navButtons = document.querySelectorAll('[data-navigate]');
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-navigate');
            navigateTo(target);
        });
    });
}

// Regresa a la primera página de la historia de navegación
function restart(){
	for(let i=0; i < window.history.length; i++){
		window.history.back();
	}
}

// Configurar navegación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
	URLparams=getUrlParams();
	setupNavigationButtons();
});

// Exportar funciones globalmente
window.NavigationUtils = {
    goBack,
    navigateTo,
    navigateWithParams,
    getUrlParams,
    replacePage,
    reloadPage,
    isCurrentPage,
    setupNavigationButtons,
	restart
};

// También exportar funciones individuales para compatibilidad
window.goBack = goBack;
window.navigateTo = navigateTo;
window.getUrlParams = getUrlParams;

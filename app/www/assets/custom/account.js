const accountMenu = {
	"Editar Datos":()=>{window.location.href="editProfile.html"},
	"Gestionar Suscripción":()=>{showAlertModal("Función no Implementada","La aplicación aún no permite gestionar suscripciones")},	// TODO
	"Cerrar Sesión":confirmLogout,
	"Eliminar Cuenta":()=>{showAlertModal("Función no Implementada","La aplicación aún no permite eliminar una cuenta")},	// TODO
}
	
function beforeLoad(){
	document.querySelector("#profileName").textContent=userData.name
	document.querySelector("#profileEmail").textContent=userData.email
	document.querySelector("#profilePhone").textContent=userData.phone
	document.querySelector("#profileSubStatus").textContent=userData.subStatus
}

async function confirmLogout() {
	showConfirmModal(
		'Cerrar Sesión',
		'¿Estás seguro de que quieres cerrar sesión?',
		logout
	);
}

function logout() {
	localStorage.removeItem('userData');
	window.location.href = 'index.html';
}

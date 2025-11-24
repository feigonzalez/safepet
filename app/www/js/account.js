const planDict = {
	"free": "Gratuito",
	"basic": "Básico",
	"premium": "Premium"
}

const accountMenu = {
	"Editar Datos":()=>{window.location.href="editProfile.html"},
	"Gestionar Suscripción":()=>{window.location.href="subscription.html"},
	"Cerrar Sesión":confirmLogout,
	"Eliminar Cuenta":()=>{showAlertModal("Función no Implementada","La aplicación aún no permite eliminar una cuenta")},	// TODO
}
	
function beforeLoad(){
	document.querySelector("#profileName").textContent=userData.name
	document.querySelector("#profileEmail").textContent=userData.email
	document.querySelector("#profilePhone").textContent=userData.phone
	document.querySelector("#profileSubStatus").textContent=planDict[userData.plan]
	document.querySelector(".profileImageDisplay").style.filter="hue-rotate("+(-10*(parseInt(hash(userData.name),36)%12))+"deg)";
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

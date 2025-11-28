const planDict = {
	"free": "Gratuito",
	"basic": "Básico",
	"premium": "Premium"
}

const accountMenu = {
	"Editar Datos":()=>{window.location.href="editProfile.html"},
	"Gestionar Suscripción":()=>{window.location.href="subscription.html"},
	"Cerrar Sesión":confirmLogout,
	"Eliminar Cuenta":confirmDelete
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

async function confirmDelete(){
	showConfirmModal(
		"¿Eliminar Cuenta?",
		`<li>Se borrarán todos tus datos</li>
		<li>Se borrarán los datos de tus mascotas, a menos que tengan otro dueño registrado.</li>
		<li>Perderás todos los beneficios de tu suscripción</li>`,
		()=>{	// On confirm
			deleteAccount
		}
	)
}

function logout() {
	localStorage.removeItem('userData');
	NavigationUtils.restart();
}

async function deleteAcount(){
	showAwaitModal(
		"Eliminando Cuenta",
		"",
		async ()=>{
			return request(SERVER_URL+"deleteAccount.php",{account_id:userData.account_id})
		},
		(req)=>{
			showAlertModal(
				"Cuenta Eliminada",
				"Esperamos que te vaya bien ",
				NavigationUtils.restart
			)
		}
	)
}

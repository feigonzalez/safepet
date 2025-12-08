const planDict = {
	"free": "Gratuito",
	"basic": "Básico",
	"premium": "Premium"
}

const accountMenu = {
	"Editar Datos":()=>{ window.location.href = new URL('editProfile.html', window.location.href).toString(); },
	"Gestionar Suscripción":()=>{ window.location.href = new URL('subscription.html', window.location.href).toString(); },
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
		`<div><p>• Se borrarán todos tus datos</p>
		<p>• Se borrarán los datos de tus mascotas, a menos que tengan otro dueño registrado.</p>
		<p>• Perderás todos los beneficios de tu suscripción</p></div>`,
		deleteAccount	// On confirm
	)
}

function logout() {
	localStorage.removeItem('userData');
	NavigationUtils.restart();
}

function deleteAccount(){
	showAwaitModal(
		"Eliminando Cuenta",
		"",
		async ()=>{
			return request(SERVER_URL+"deleteAccount.php",{account_id:userData.account_id})
		},
		(req)=>{
			localStorage.removeItem("userData");
			showAlertModal(
				"Cuenta Eliminada",
				"Esperamos que te vaya bien ",
				restart
			)
		}
	)
}

async function cancelSubscription(){
    showConfirmModal(
        'Cancelar Suscripción',
        '¿Deseas cancelar tu suscripción y volver al Plan Gratis?',
        ()=>{
            showAwaitModal('Cancelando suscripción','',
                async ()=>{
                    return await request(SERVER_URL+'updatePlan.php',{ idUsuario:userData.account_id, plan:'gratis' });
                },
                (upd)=>{
                    if (upd && (upd.success || upd.status==='GOOD')){
                        const u = JSON.parse(localStorage.getItem('userData')||'{}');
                        u.plan = 'free';
                        localStorage.setItem('userData', JSON.stringify(u));
                        document.querySelector('#profileSubStatus').textContent = planDict['free'];
                        showAlertModal('Suscripción cancelada','Tu plan fue cambiado a Gratis');
                    } else {
                        showAlertModal('No se pudo cancelar','Intenta nuevamente más tarde');
                    }
                }
            )
        }
    )
}

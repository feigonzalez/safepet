async function beforeLoad() {
	if(!localStorage.getItem("shownPersonalDataDisclaimer")){
		loadModal("templates/accountDataDisclaimerModal.html");
		localStorage.setItem("shownPersonalDataDisclaimer",true)
	}
	// Llenar campos del formulario
	document.getElementById('fullName').value = userData.name || '';
	document.getElementById('email').value = userData.email || '';
	document.getElementById('phone').value = userData.phone || '';
	document.getElementById('address').value = userData.address || '';
	
	// Actualizar iniciales en la foto
	if (userData.name) {
		const initials = userData.name
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

function previewProfileImage(event) {
	const file = event.target.files[0];
	const imageDisplay = document.getElementById('profileImageDisplay');
	const placeholder = document.getElementById('profilePhotoPlaceholder');
	if (file) {
		const reader = new FileReader();
		reader.onload = function(e) {
			imageDisplay.src = e.target.result;
			imageDisplay.style.display = 'block';
			placeholder.style.display = 'none';
		};
	reader.readAsDataURL(file);
	}
}

function changePhoto() {
	alert('Funcionalidad de cambio de foto próximamente disponible');
}

// Cargar datos al inicializar la página
document.addEventListener('DOMContentLoaded', function() {
	
	// Preparar referencias a formulario y reglas de validación
	const form = document.getElementById('profileForm');
	const validationRules = {
		fullName: ValidationConfig.name,
		phone: ValidationConfig.phone,
		address: ValidationConfig.address
	}

	// Configurar validaciones en tiempo real
	ValidationUtils.setupRealTimeValidation(form, validationRules);

	// Configurar manejo del formulario
	form.addEventListener('submit', function(ev) {
		ev.preventDefault();
		const validation = ValidationUtils.validateForm(form, validationRules);
		if (validation.isValid) {
			const formData = {
				fullName: document.getElementById('fullName').value,
				email: document.getElementById('email').value,
				phone: document.getElementById('phone').value,
				address: document.getElementById('address').value
			};
			showConfirmModal(
				"Actualizar Datos",
				"¿Deseas actualizar tus datos?",
				()=>{
					showAwaitModal("Actualizando Datos","",
					async ()=>{ return request(SERVER_URL+"updateAccount.php",{account_id:userData.account_id,...formData})},
					(update)=>{
						if(update.status == "GOOD"){
							userData.name = update.fullName;
							userData.phone = update.phone;
							localStorage.setItem("userData",JSON.stringify(userData))
							showAlertModal("Datos actualizados","Tus datos fueron actualizados correctamente",goBack)
						} else{
							showAlertModal("Error","Hubo un error al actualizar tus datos :c")
						}
					})
				})
		} else {
			ValidationUtils.showErrorMessage('Por favor, corrige los errores en el formulario');
		}
	});
});
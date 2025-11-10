function showUploadedImage(input, imgId) {
	const file = input.files && input.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = () => {
		const img = document.getElementById(imgId);
		const placeholder = document.getElementById('photoPlaceholder');
		img.src = reader.result;
		img.style.display = 'block';
		img.style.objectFit = 'cover';
		placeholder.style.display = 'none';
	};
	reader.readAsDataURL(file);
}

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
	form.addEventListener('submit',function(e) {
		e.preventDefault();
		
		// Validar campos de texto
		const validation = ValidationUtils.validateForm(form, validationRules);
		
		// Validar radio buttons de sexo
		const sexValid = ValidationUtils.validateRadioGroup(form, 'petSex', 'Selecciona el sexo de la mascota');
		
		if (validation.isValid && sexValid) {
			// Mostrar modal de confirmación antes de registrar
			showConfirmModal(
				'Confirmar Registro',
				'¿Estás seguro de que quieres registrar esta mascota con la información proporcionada?',
				async ()=>{
					reqBody = {account_id:userData.account_id}
					new FormData(form).entries().forEach(e=>{
						reqBody[e[0]]=e[1]
					})
					console.log(reqBody);
					let register = await request(SERVER_URL+"registerPet.php",reqBody)
					if(register.status=="GOOD"){
						loadModal('templates/petAddedModal.html',()=>{
							window.location=document.referrer
						});
					} else {
						console.log("Couldn't register pet:",register)
					}
				}
			);
		} else {
			ValidationUtils.showErrorMessage('Por favor corrige los errores en el formulario');
		}
	});
});
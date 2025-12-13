async function beforeLoad() {
    let pet = await request(SERVER_URL + "getPet.php", {pet_id:URLparams["id"]});
    if (pet.status !== "GOOD") {
        showAlertModal("Error", "No se pudieron obtener los datos de la mascota.");
        return;
    }
    // === CARGAR DATOS EN EL FORMULARIO ===
    document.getElementById("petName").value = pet.name;
    document.getElementById("petSpecies").value = pet.species;
    document.getElementById("petBreed").value = pet.breed;
    document.getElementById("petColor").value = pet.color;
    document.getElementById("petSex").value = pet.sex;
}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("updatePetForm").addEventListener("submit", async (e) => {
        e.preventDefault();
		
		// Preparar referencias a formulario y reglas de validación
		const form = document.getElementById('updatePetForm');
		const validationRules = {
			petName: ValidationConfig.name,
			petBreed: ValidationConfig.name,
			petColor: ValidationConfig.name
		}

		const validation = ValidationUtils.validateForm(form, validationRules);
		if (validation.isValid) {
			const formData = {
				"pet_id": URLparams.id,
				"petName": document.getElementById("petName").value,
				"petBreed": document.getElementById("petBreed").value,
				"petColor": document.getElementById("petColor").value
			}
			showAwaitModal("Actualizando Datos","",
				async ()=>{ return request(SERVER_URL + "updatePet.php", {account_id:userData.account_id, ...formData});},
				(payload)=>{
					if (payload.status === "GOOD") {
						showAlertModal("Mascota actualizada.","",goBack);
					} else {
						showAlertModal("Hubo un error", "No se pudo actualizar la mascota.");
					}
				})
		} else {
			ValidationUtils.showErrorMessage('Por favor, corrige los errores en el formulario');
		}
    });

});

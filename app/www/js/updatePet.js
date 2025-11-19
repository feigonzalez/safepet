async function beforeLoad() {
    const pet = JSON.parse(localStorage.getItem("selectedPet"));

    if (!pet) {
        showAlertModal("Error", "No se pudo cargar la mascota.");
        return;
    }

    // Llenar campos
    document.getElementById("update_petName").value = pet.name || "";
    document.getElementById("update_petSpecies").value = pet.species || "";
    document.getElementById("update_petBreed").value = pet.breed || "";
    document.getElementById("update_petColor").value = pet.color || "";
    document.getElementById("update_petSex").value = pet.sex || "";

    // Foto
    const img = document.getElementById("update_petImageDisplay");
    if (pet.photo_url) {
        img.src = pet.photo_url;
        img.style.display = "block";
        document.getElementById("update_photoPlaceholder").style.display = "none";
    }
}

function previewPetImage(event) {
    const file = event.target.files[0];
    const display = document.getElementById("update_petImageDisplay");
    const placeholder = document.getElementById("update_photoPlaceholder");

    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            display.src = e.target.result;
            display.style.display = "block";
            placeholder.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("updatePetForm");

    const validationRules = {
        update_petName: ValidationConfig.name,
        update_petBreed: ValidationConfig.name,
        update_petColor: ValidationConfig.name
    };

    ValidationUtils.setupRealTimeValidation(form, validationRules);

    form.addEventListener("submit", ev => {
        ev.preventDefault();

        const validation = ValidationUtils.validateForm(form, validationRules);
        if (!validation.isValid) {
            ValidationUtils.showErrorMessage("Corrige los errores en el formulario.");
            return;
        }

        const pet = JSON.parse(localStorage.getItem("selectedPet"));
        const payload = {
            pet_id: pet.id,
            name: document.getElementById("update_petName").value,
            breed: document.getElementById("update_petBreed").value,
            color: document.getElementById("update_petColor").value
        };

        showConfirmModal(
            "Actualizar Mascota",
            "¿Deseas guardar los cambios?",
            async () => {

                let response = await request(SERVER_URL + "updatePet.php", payload);

                if (response.status === "GOOD") {
                    showAlertModal("Mascota Actualizada", "Los datos fueron guardados correctamente.");

                    // Actualizar localStorage
                    pet.name = payload.name;
                    pet.breed = payload.breed;
                    pet.color = payload.color;
                    localStorage.setItem("selectedPet", JSON.stringify(pet));
                } else {
                    showAlertModal("Error", "No se pudo actualizar la mascota.");
                }
            }
        );
    });

});

async function beforeLoad() {
    const stored = JSON.parse(localStorage.getItem("selectedPet"));

    if (!stored || !stored.pet_id) {
        showAlertModal("Error", "No se encontró la mascota seleccionada.");
        return;
    }

    // === OBTENER DATOS REALES DESDE EL SERVIDOR ===
    const formData = new FormData();
    formData.append("pet_id", stored.pet_id);

    const response = await fetch(SERVER_URL + "getPet.php", {
        method: "POST",
        body: formData
    });

    const pet = await response.json();
    console.log("PET DATA:", pet);

    if (pet.status !== "GOOD") {
        showAlertModal("Error", "No se pudieron obtener los datos de la mascota.");
        return;
    }

    // === CARGAR DATOS EN EL FORMULARIO ===
    document.getElementById("update_petName").value = pet.name;
    document.getElementById("update_petSpecies").value = pet.species;
    document.getElementById("update_petBreed").value = pet.breed;
    document.getElementById("update_petColor").value = pet.color;
    document.getElementById("update_petSex").value = pet.sex;

    localStorage.setItem("selectedPet", JSON.stringify(pet));
}

document.addEventListener("DOMContentLoaded", () => {

    beforeLoad(); // <<-- IMPORTANTE

    document.getElementById("updatePetForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const pet = JSON.parse(localStorage.getItem("selectedPet"));

        const formData = new FormData();
        formData.append("pet_id", pet.pet_id);
        formData.append("petName", document.getElementById("update_petName").value);
        formData.append("petBreed", document.getElementById("update_petBreed").value);
        formData.append("petColor", document.getElementById("update_petColor").value);

        const resp = await fetch(SERVER_URL + "updatePet.php", {
            method: "POST",
            body: formData
        });

        const payload = await resp.json();
        console.log("UPDATE RESPONSE:", payload);

        if (payload.status === "GOOD") {
            showAlertModal("Éxito", "Mascota actualizada.");

            // Actualizar localStorage
            pet.name = payload.name;
            pet.breed = payload.breed;
            pet.color = payload.color;

            localStorage.setItem("selectedPet", JSON.stringify(pet));

        } else {
            showAlertModal("Error", "No se pudo actualizar la mascota.");
        }
    });

});

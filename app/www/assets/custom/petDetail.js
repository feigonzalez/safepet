const petDetailMenu = {
	"Editar Datos":()=>{console.log("editar datos")},
	"Añadir Dueño":()=>{console.log("añadir dueño")},
	"Eliminar Mascota":()=>{console.log("eliminar mascota")}
}

async function beforeLoad(){
	petData = await request(SERVER_URL+"getPet.php",{account_id:userData.account_id,pet_id:URLparams.id})
	
	/*
	// Actualizar imagen
	const petImage = document.querySelector('#petImageDisplay');
	if(pet.images && pet.images[0]){
		petImage.style.backgroundImage = `url(media/${pet.images[0]})`;
	}
	*/
	
	// Actualizar información básica
	const sexSymbol = petData.sex?.toLowerCase().startsWith('h') ? '♀️' : '♂️';
	document.querySelector('#petName').textContent = `${petData.name} ${sexSymbol}`;
	
	// Actualizar detalles
	document.querySelector('#detailSpecies').textContent = petData.species || 'No especificado';
	document.querySelector('#detailBreed').textContent = petData.breed || 'No especificado';
	document.querySelector('#detailColor').textContent = petData.color || 'No especificado';
}

function reportLoss() {
	const petId = URLparams.id;
	
	if(!petId) {
		alert('Error: No se pudo identificar la mascota');
		return;
	}
	
	showConfirmModal(
		'Alertar Pérdida',
		'¿Estás seguro de que quieres generar una alerta por la pérdida de esta mascota? Se notificará a la comunidad.',
		()=>{
			showAlertModal("Alerta exitosa","Los datos de tu mascota podrán ser vistos cuando alguien encuentre un animal perdido")
		}
	);
}
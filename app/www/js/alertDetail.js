const statusDict={
	"HOME": "En casa",
	"LOST": "Extraviada"
}

var currentLocation;

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
	const sexSymbol = petData.sex?.toLowerCase().startsWith('h') ? 'female' : 'male';
	document.querySelector('#petName').textContent = petData.name;
	document.querySelector('#detailSpecies').textContent = petData.species;
	document.querySelector('#detailBreed').textContent = petData.breed;
	document.querySelector('#detailColor').textContent = petData.color;
	setIcon(document.querySelector('#sexIndicator'),sexSymbol);
	
	locate((pos)=>{
		currentLocation = pos;
	})
}

function reportFinding(){
	const petId = URLparams.id;
	if(!petId) {
		alert('Error: No se pudo identificar la mascota');
		return;
	}
	showConfirmModal(
		'Confirmar Reporte',
		'¿Éste es el animal que encontraste? Si es así, se le avisará al dueño para que se ponga en contacto contigo',
		async ()=>{
			let reqParams = {
				account_id:userData.account_id,
				pet_id:petData.pet_id
			}
			if(currentLocation){
				reqParams["latitude"] = currentLocation.coords.latitude;
				reqParams["longitude"] = currentLocation.coords.longitude;
			}
			alertData = await request(SERVER_URL+"respondAlert.php",reqParams)
			if(alertData.status=="GOOD")
				showAlertModal("Le avisamos a su dueño","Cundo se ponga en contacto contigo te llegará una notificación")
			else{
				showAlertModal("Hubo un problema","No se pudo generar el reporte")
			}
		}
	)
}
let account_id = deviceIDToUID();

const statusDict={
	"HOME": "En casa",
	"LOST": "Extraviada",
	"AWAY": "Fuera de la zona segura"
}

var currentLocation;

async function beforeLoad(){
	if(userData.account_id) account_id=userData.account_id;
	petData = await request(SERVER_URL+"getPet.php",{account_id:account_id,pet_id:URLparams.id})
	
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
	document.querySelector("#petImageDisplay").classList.add(getAnimalClass(petData.species))
	document.querySelector("#petImageDisplay").style.filter="hue-rotate("+(-10*(parseInt(hash(petData.name),36)%12))+"deg)";
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
		()=>{showAwaitModal(
			"Reportando Hallazgo","",
			async ()=>{
				return await request(SERVER_URL+"postReport.php",{
					command:"POST REPORT",
					account_id:account_id,
					pet_id:petData.pet_id,
					timestamp: Math.floor(new Date().getTime()/1000),
					latitude: localStorage.latitude,
					longitude: localStorage.longitude
				});
			},
			(alertData)=>{
				if(alertData.status=="GOOD")
					showAlertModal("Le avisamos a su dueño","Cundo se ponga en contacto contigo te llegará una notificación",restart)
				else{
					showAlertModal("Hubo un problema","No se pudo generar el reporte")
				}
			}
		)}
	)
}
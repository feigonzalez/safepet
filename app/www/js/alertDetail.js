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
const statusDict={
	"HOME": "En casa",
	"LOST": "Extraviada",
	"AWAY": "Fuera de la zona segura",
}
var petDetailMenu = {
	"Editar Datos":()=>{ navigateWithParams("updatePet.html",{id:URLparams["id"]}) },
	"Ver Código QR":showPetQR,
	"Añadir Dueño":addOwner,
	"Añadir Rastreador":null,
	"Quitar Rastreador":null,
	"Eliminar Mascota":confirmDeletePet
}

async function downloadQR(){
	let dataBlob = await fetch(getQR(SERVER_URL+"?petID="+URLparams["id"]))
		.then(r=>r.ok?r.blob():null);
	let qrFile = new FileReader();
		qrFile.readAsDataURL(dataBlob);
	qrFile.addEventListener("loadend",()=>{
		let petQRURL = qrFile.result;
		downloadFile(petData.name+"_QR.png", petQRURL.substring(petQRURL.indexOf(",")+1))
		/*dLink = document.querySelector("#qrDownload");
		dLink.setAttribute("href",petQRURL);
		dLink.setAttribute("download",petData.name+"_QR.png")
		dLink.click();*/
	})
}

async function beforeLoad(){
    petData = await request(SERVER_URL+"getPet.php",{account_id:userData.account_id,pet_id:URLparams.id})
    if(!petData || petData.status !== "GOOD"){
        showAlertModal("No se pudo cargar la mascota","Intenta nuevamente o verifica tu conexión")
        return;
    }
    trackerData = await request(SERVER_URL+"getTrackerInfo.php",{pet_id:URLparams.id})
    if(userData.plan === "free"){
        petDetailMenu["Añadir Dueño"] = null;
    }
	if(userData.plan == "premium"){
		document.querySelector("#trackerInfo").classList.remove("hidden");
		switch(trackerData.status){
			case "MISS":	// Pet has no tracker. Allow user to add one
				petDetailMenu["Añadir Rastreador"]=()=>{
					navigateTo("addTracker.html?pet_id="+URLparams.id);
				}
				break;
			case "GOOD":	// Pet has a tracker. Allow user to remove it
				petDetailMenu["Quitar Rastreador"]=()=>{
					showAlertModal("Función no implementada","En progreso")	//TODO
				};
				let unit = "m";
				let distance = Math.round(distanceGeo(
					parseFloat(localStorage.latitude), parseFloat(localStorage.longitude),
					parseFloat(trackerData.latitude), parseFloat(trackerData.longitude)));
				if(distance > 1000){ distance = Math.round(distance/100)/10; unit="Km";}
				document.querySelector('#trackerDistance').textContent = distance + unit;
				document.querySelector('#trackerBattery').textContent = trackerData.battery;
				break;
		}
	}
	
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
	document.querySelector('#detailStatus').textContent = statusDict[petData.petStatus];
	document.querySelector(".petImageDisplay").classList.add(getAnimalClass(petData.species))
	document.querySelector(".petImageDisplay").style.filter="hue-rotate("+(-10*(parseInt(hash(petData.name),36)%12))+"deg)";
	setIcon(document.querySelector('#sexIndicator'),sexSymbol);
	
	
	let statusButtonText="";
	switch(petData.petStatus){
		case "HOME": statusButtonText="Mi mascota se perdió"; break;
		case "LOST": statusButtonText="Encontré mi mascota"; break;
		default: break;
	}
	
	document.querySelector("#changeStatusBtn").textContent=statusButtonText;
}

function addOwner(){
	showAlertModal(
		"Añadir Dueño",
		`<div class="column">
			<div class="row">Para añadir a otra persona como dueña de esta mascota, debe:</div>
			<div class="row"><ol class="column">
				<li>Abrir el menú de mascotas en su aplicación</li>
				<li>Presionar "Añadir Mascota"</li>
				<li>Presionar <span class="icon" data-icon="qr-code"></span> en la esquina superior derecha.</li>
				<li>Escanear este código QR:</li>
			</ol></div>
			<div class="row">
				<a id="qrDownload" download>
					<img id="qrCode" class="loading" src="${getQR("registerowner{account_id:"+userData.account_id+";pet_id:"+URLparams["id"]+"}")}">
				</a>
			</div>
		</div>`
	);
}

function showPetQR(){
	showAlertModal(
		"QR de tu mascota",
		`<div class="column">
			<div class="row">
				<a id="qrDownload" download>
					<img id="qrCode" class="loading" onclick="downloadQR()" src="${getQR(SERVER_URL+"report.php?petID="+URLparams["id"])}">
				</a>
			</div>
			<div class="row"><p>Cuando alguien escanee este código, se te alertará dónde ocurrió.</p></div>
			<div class="row"><button class="bg-primary" onclick="downloadQR()">Descargar Código</button></div>
		</div>`
	);
}

function confirmDeletePet(){
	showConfirmModal(
		"¿Eliminar Mascota?",
		"Ya no serás su dueño, pero otras personas que sean dueños de ella aún la tendrán registrada.",
		()=>{
			deletePet();
		}
	)
}

async function deletePet(){
	showAwaitModal(
		"Eliminando Mascota", "",
		()=>{
			return request(SERVER_URL+"deletePet.php",{account_id:userData.account_id,pet_id:URLparams["id"]})
		},
		async (req)=>{
			showAlertModal(
				"Mascota Eliminada",
				"",
				goBack
			)
		}
	)
}

function updateStatus(){
	switch(petData.petStatus){
		case "HOME": confirmAlert(); break;
		case "LOST": confirmFound(); break;
		default: alert("Estado de mascota no especificado."); break;
	}
}

function confirmAlert() {
	const petId = URLparams.id;
	
	if(!petId) {
		alert('Error: No se pudo identificar la mascota');
		return;
	}
	showConfirmModal(
		'Alertar Pérdida',
		'¿Estás seguro de que quieres generar una alerta por la pérdida de esta mascota? Se notificará a la comunidad.',
		alertMissingPet
	)
}

function confirmFound(){
	showConfirmModal(
		'¿Encontraste a tu mascota?',
		'Se quitará la alerta que hiciste previamente',
		alertFoundPet
	)
}

async function alertMissingPet(){
	showAwaitModal(
		"Generando Alerta", "",
		async ()=>{
			return request(SERVER_URL+"postAlert.php",{
				account_id:userData.account_id,
				pet_id:petData.pet_id,
				timestamp:Math.floor(new Date().getTime()/1000),
				latitude:localStorage.latitude,
				longitude:localStorage.longitude
			})
		},
		(req)=>{
			if(req.status=="GOOD")
				showAlertModal(
					"Se ha creado la alerta",
					"Los datos de tu mascota podrán ser vistos cuando alguien encuentre un animal perdido",
					goBack
				)
			else{
				showAlertModal(
					"Hubo un problema",
					"No se pudo generar la alerta"
				)
			}
			
		}
	)
}

async function alertFoundPet(){
	showAwaitModal(
		"Quitando Alerta", "",
		async ()=>{
			return request(SERVER_URL+"deleteAlert.php",{
				account_id:userData.account_id,
				pet_id:petData.pet_id,
			})
		},
		(req)=>{
			if(req.status=="GOOD")
				showAlertModal(
					"Se ha eliminado la alerta",
					`¡Esperamos que ${petData.name} no se pierda otra vez!`,
					goBack
				)
			else{
				showAlertModal(
					"Hubo un problema",
					"No se pudo eliminar la alerta. Inténtalo más tarde"
				)
			}
			
		}
	)
	
}

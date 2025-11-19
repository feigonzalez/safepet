const statusDict={
	"HOME": "En casa",
	"LOST": "Extraviada"
}
const petDetailMenu = {
	"Ver Código QR":()=>{
		showAlertModal("QR de tu mascota",
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
	},
	"Editar Datos":()=>{
		navigateWithParams("updatePet.html",{id:URLparams["id"]})
	},
	"Añadir Dueño":()=>{
		showAlertModal("Añadir Dueño",
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
		
	},
	"Eliminar Mascota":()=>{console.log("eliminar mascota")}	// TODO
}

async function downloadQR(){
	let dataBlob = await fetch(getQR(SERVER_URL+"?petID="+URLparams["id"]))
		.then(r=>r.ok?r.blob():null);
	let qrFile = new FileReader();
		qrFile.readAsDataURL(dataBlob);
	qrFile.addEventListener("loadend",()=>{
		let petQRURL = qrFile.result;
		dLink = document.querySelector("#qrDownload");
		dLink.setAttribute("href",petQRURL);
		dLink.setAttribute("download",petData.name+"_QR.png")
		dLink.click();
	})
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
	const sexSymbol = petData.sex?.toLowerCase().startsWith('h') ? 'female' : 'male';
	document.querySelector('#petName').textContent = petData.name;
	document.querySelector('#detailSpecies').textContent = petData.species;
	document.querySelector('#detailBreed').textContent = petData.breed;
	document.querySelector('#detailColor').textContent = petData.color;
	document.querySelector('#detailStatus').textContent = statusDict[petData.petStatus];
	setIcon(document.querySelector('#sexIndicator'),sexSymbol);
	
	
	let statusButtonText="";
	switch(petData.petStatus){
		case "HOME": statusButtonText="Mi mascota se perdió"; break;
		case "LOST": statusButtonText="Encontré mi mascota"; break;
		default: break;
	}
	
	document.querySelector("#changeStatusBtn").textContent=statusButtonText;
}

function updateStatus(){
	switch(petData.petStatus){
		case "HOME": reportLoss(); break;
		case "LOST": alert("Se debe registrar que la mascota fue hallada"); break;
		default: alert("Estado de mascota no especificado."); break;
	}
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
		async ()=>{
			showAwaitModal("Obteniendo posición","",()=>{
				locate(async (pos)=>{
					document.querySelector("#modalTitle").textContent="Generando alerta";
					alertData = await request(SERVER_URL+"postAlert.php",{
						account_id:userData.account_id,
						pet_id:petData.pet_id,
						timestamp:Math.floor(new Date().getTime()/1000),
						latitude:pos.coords.latitude,
						longitude:pos.coords.longitude
					})
					if(alertData.status=="GOOD")
						showAlertModal("Se ha creado la alerta","Los datos de tu mascota podrán ser vistos cuando alguien encuentre un animal perdido")
					else{
						showAlertModal("Hubo un problema","No se pudo generar la alerta")
					}
				},
				(error)=>{
					showAlertModal("No se pudo obtener tu ubicación","No se puede generar una alerta sin la ubicación de tu dispositivo.")
				})
			})
		}
	)
}
function viewSafeZone(){
	// TODO
	showAlertModal(
		"Función no Implementada",
		"Esta función redirigirá al mapa y mostrará un círculo transparente azul, correspondiente a la zona segura."
	)
}

function confirmSafeZone(){
	let szRadius = document.querySelector("#safezone_radius").value
	let errMsg = "";
	if(szRadius.trim()==""){	errMsg = "Ingresa una distancia máxima";}
	if(isNaN(szRadius)){		errMsg = "Distancia máxima debe ser un número";}
	if(parseInt(szRadius)<1){	errMsg = "Distancia máxima debe ser mayor a 0";}
	if(errMsg==""){
		showConfirmModal("¿Definir Zona Segura?",`Se te avisará si tu mascota se aleja más de ${szRadius} metros de la posición en la que te encuentras ahora.`,()=>{postSafeZone(szRadius)})
	} else {
		showAlertModal("Ingresa un valor válido",errMsg);
	}
}

function postSafeZone(szRadius){
	showAwaitModal("Añadiendo Zona Segura","",
		async()=>{ return request(SERVER_URL+"postSafeZone.php",{
			account_id:userData.account_id,
			pet_id:URLparams["pet_id"],
			latitude:localStorage.latitude,
			longitude:localStorage.longitude,
			radius:szRadius})},
		(req)=>{
			if(req.status=="GOOD"){
				showAlertModal("Zona Segura Añadida","Ahora se te avisará cuando tu mascota salga de esta area",goBack)
			} else {
				showAlertModal("Hubo un error","No se pudo definir la zona segura")
			}
		}
	)
}

function confirmRemoveTracker(){
	showConfirmModal("¿Quitar Rastreador?","Podrás volver a vincularlo más tarde con el mismo código QR de antes",removeTracker)
}

function removeTracker(){
	showAwaitModal("Quitando Rastreador","",
		async ()=>{ return request(SERVER_URL+"removeTracker.php",{account_id:userData.account_id,pet_id:URLparams["pet_id"]})},
		(req)=>{
			if(req.status=="GOOD"){
				showAlertModal("Rastreador Quitado","",goBack)
			} else {
				showAlertModal("Hubo un error","No se pudo quitar el rastreador")
			}
		}
	)
}
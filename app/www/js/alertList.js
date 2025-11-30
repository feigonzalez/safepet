function capitalizeFirstLetter(s) {return String(s).charAt(0).toUpperCase()+String(s).slice(1);}

function setError(msg){
	document.querySelector("#alertsList").innerHTML=`
		<div class="row ta-center">
			<div class="column">
				<p class="error">${msg}</p>
				<p>Aquí se mostrarán las alertas cercanas de mascotas que coincidan con tu reporte.</p>
			</div>
		</div>`;
}
async function beforeLoad(){
	
	let pos = [localStorage.getItem("latitude"),localStorage.getItem("longitude")]
	if(pos[0] === null || pos[1] === null){
		showAwaitModal("Determinando tu ubicación","Se necesita tu ubicación para mostrarte las alertas cercanas a tí.",
			()=>{ locate(()=>{ reloadPage(); }) })
		return;
	} else {
		pos[0] = parseFloat(pos[0])
		pos[1] = parseFloat(pos[1])
	}
	
	if(!URLparams.petSpecies){
		showAlertModal("No se puede realizar la búsqueda","Parece que la búsqueda no indica la especie de la mascota.");
		document.querySelector("#alertsList").innerHTML=`
			<div class="row ta-center">
			<p>Aquí se mostrarán las alertas cercanas de mascotas que coincidan con tu reporte.</p>
			</div>`;
		return; }
	
	for(let param in URLparams){
		let v = URLparams[param];
		if(v) document.querySelector("#searchParams").innerHTML+=`<span class="badge">${capitalizeFirstLetter(v)}</span>`
	}
	alerts = await request(SERVER_URL+"getAlerts.php",{
		latitude:pos[0],
		longitude:pos[1],
		petSpecies:URLparams["petSpecies"],
		petBreed:URLparams["petBreed"],
		petColor:URLparams["petColor"],
		petSex:URLparams["petSex"],
		});
	switch(alerts.status){
		case "NULL":
			setError("Hubo un error con el servidor")
			break;
		case "MISS":
			document.querySelector("#alertsList .card").innerHTML="No hay alertas de mascotas perdidas que coincidan con tu reporte";
			break;
		default:
			let alertData = []
			for(let a of alerts){
				a["sexIndicator"] = a.petSex.charAt(0)=="h"?"female":"male";
				a["recency"] = getRecency(a.timestamp)
				let distanceInM = distanceGeo(pos[0], pos[1], parseFloat(a.latitude), parseFloat(a.longitude))
				if(distanceInM < 1000) a["distance"] = Math.floor(distanceInM)+" m."
				else a["distance"] = Math.floor(distanceInM/100)/10+" Km."
				alertData.push(a)
			}
			fillIterable(document.querySelector("[foreach=alerts]"),alertData)
			for(let bI of document.querySelectorAll(".breedIndicator")){
				if(bI.textContent.trim()=="()") bI.remove();
			}
			for(let pI of document.querySelectorAll(".petImageDisplay")){
				pI.style.filter="hue-rotate("+(-10*(parseInt(hash(pI.dataset.petname),36)%12))+"deg)";
			}
			break;
	}
}
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
	
	if(!URLparams.petSpecies){
		showAlertModal("No se puede realizar la búsqueda","Parece que la búsqueda no indica la especie de la mascota.");
		document.querySelector("#alertsList").innerHTML=`
			<div class="row ta-center">
			<p>Aquí se mostrarán las alertas cercanas de mascotas que coincidan con tu reporte.</p>
			</div>`;
		return; }
	
	for(let param in URLparams){
		let v = URLparams[param]
		if(v) document.querySelector("#searchParams").innerHTML+=`<span class="badge">${capitalizeFirstLetter(v)}</span>`
	}
	locate(async (pos)=>{
		console.log(`located @ [${pos.coords.latitude};${pos.coords.longitude}]`)
		alerts = await request(SERVER_URL+"getAlerts.php",{
			latitude:pos.coords.latitude,
			longitude:pos.coords.longitude,
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
					let distanceInM = distanceGeo(pos.coords.latitude, pos.coords.longitude, parseFloat(a.latitude), parseFloat(a.longitude))
					if(distanceInM < 1000) a["distance"] = Math.floor(distanceInM)+" m."
					else a["distance"] = Math.floor(distanceInM/100)/10+" Km."
					alertData.push(a)
				}
				fillIterable(document.querySelector("[foreach=alerts]"),alertData)
				for(let bI of document.querySelectorAll(".breedIndicator")){
					if(bI.textContent.trim()=="()") bI.remove();
				}
				break;
		}
	},
	(err)=>{
		setError("No se pueden buscar las alertas cercanas porque no se ha podido establecer tu ubicación.")
	})
}
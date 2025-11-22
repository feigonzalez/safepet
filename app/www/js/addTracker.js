document.addEventListener("DOMContentLoaded", async function() {
	const reader = document.getElementById("reader");
	const statusText = document.getElementById("statusText");

	try {
		console.log("Getting cameras...")
		const cameras = await Html5Qrcode.getCameras();
		if (!cameras || cameras.length === 0)
			throw new Error("No se encontró ninguna cámara");
		let cameraId = null;
		console.log("Finding back camera...")
		for(let camera of cameras){
			if(camera.label.indexOf("back")!=-1) cameraId = camera.id
		}
		if(cameraId == null){
			console.warn("No se encontró cámara trasera. Usando primera cámara detectada.");
			cameraId = cameras[0].id;
		}
		console.log("Creating reader...")
		const html5QrCode = new Html5Qrcode("reader");

		console.log("Starting reader...")
		await html5QrCode.start(
			cameraId,
			{ fps: 10, qrbox: { width: 200, height: 200 }, facingMode: { exact: "environment"} },
			qrContent => handleQR(qrContent, html5QrCode),
			() => {
				statusText.textContent = "Escaneando...";}
		);
	} catch (error) {
		console.error("Error al inicializar escáner:", error);
		showCameraError();
	}
});

function handleQR(qrContent, html5QrCode) {
	const frame = document.querySelector(".scan-frame");
	if(frame.classList.contains("detected")) return;
	frame.classList.add("detected")
	
	console.log("processing code:",qrContent)
	
	let qrParams = qrContent.match(/^safepet:gpstrackerid=(\d+)$/);
	console.log("got params:",qrParams)
	if(qrParams && qrParams.length == 2){
		console.log(`Register tracker [${qrParams[1]}] to pet [${URLparams.pet_id}]`)
		showAwaitModal("Añadiendo rastreador","",
			async()=>{
				let req = await request(SERVER_URL+"registerTracker.php",{tracker_id:qrParams[1],pet_id:URLparams.pet_id})
				return req;
			},
			(req)=>{
				switch(req.status){
					case "GOOD":
						showAlertModal("Rastreador registrado",`El rastreador ahora está asociado a tu mascota`, ()=>{goBack()});
						break;
					case "MISS":
						showAlertModal("Rastreado en uso",`El rastreador ya se encuentra asociado a otra mascota`, ()=>{goBack()});
						break;
					case "FAIL":
					default:
						showAlertModal("Hubo un error","No pudimos registrar el rastreador", ()=>{frame.classList.remove("detected");});
						break;
				}
			}
		)
	} else {
		showAlertModal("Código QR inválido",`El código QR escaneado no es para registrar un rastreador.`, ()=>{frame.classList.remove("detected");});
	}
}

function showCameraError() {
	const box = document.querySelector(".center-content");
	box.innerHTML = `
		<div style="text-align:center;">
			<p style="color:#666;"> Error al inicializar la cámara</p>
			<button style="background:#e74c3c;color:white;border:none;padding:10px 16px;border-radius:8px;font-weight:600;margin:6px;cursor:pointer;" onclick="location.reload()">Reintentar</button>
			<button style="background:#ccc;color:black;border:none;padding:10px 16px;border-radius:8px;font-weight:600;margin:6px;cursor:pointer;" onclick="window.location.href='reportManual.html'">Continuar sin QR</button>
		</div>`;
}
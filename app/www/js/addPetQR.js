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

		console.log("Strating reader...")
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
	
	let qrParams = qrContent.match(/^registerowner{account_id:(\d+);pet_id:(\d+)}$/);
	if(qrParams.length == 3){
		console.log(`Register user [${qrParams[1]}] as owner of pet [${qrParams[2]}]`)
		showAwaitModal("Añadiendo dueño","",
			async()=>{
				let req = await request(SERVER_URL+"addOwner.php",{account_id:userData.account_id,owner_id:qrParams[1],pet_id:qrParams[2]})
				return req;
			},
			(req)=>{
				switch(req.status){
					case "GOOD":
						showAlertModal("Dueño registrado",`Te has registado como dueño de esta mascota`, ()=>{goBack();goBack()});
						break;
					case "MISS":
						showAlertModal("Mascota ya registrada",`Ya tenías a esta mascota registrada`, ()=>{goBack();goBack()});
						break;
					case "FAIL":
					default:
						showAlertModal("Hubo un error","No pudimos registrarte como dueño de esta mascota", ()=>{frame.classList.remove("detected");});
						break;
				}
			}
		)
	} else {
		showAlertModal("Código QR inválido",`El código QR escaneado no es para registrar una mascota nueva.`, ()=>{frame.classList.remove("detected");});
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
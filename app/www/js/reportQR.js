
let account_id = deviceIDToUID();

document.addEventListener("DOMContentLoaded", async function() {
	if(userData.account_id) account_id=userData.account_id;
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

	let qrparams = qrContent.match(/.*\/safepet\/report.php\?petID=(\d+)/);
	if(qrparams && qrparams.length == 2){
		console.log(`Report pet [${qrparams[1]}] as found`)
		showAwaitModal("Mascota encontrada","Se está avisando al dueño",
			async ()=>{
				return await request(SERVER_URL+"postReport.php",{
					account_id:account_id,
					pet_id:qrparams[1],
					timestamp: Math.floor(new Date().getTime()/1000),
					latitude: localStorage.latitude,
					longitude: localStorage.longitude});
			},
			(req)=>{
				console.log(req)
				switch(req.status){
					case "GOOD":
						showAlertModal("Reporte exitoso",`Se le ha avisado al dueño que hallasta su mascota. Debería ponerse en contacto contigo en cualquier momento.`, ()=>{goBack()});
						break;
					case "MISS":	// When does this happen?
						//showAlertModal("Esta mascota",`Ya tenías a esta mascota registrada`, ()=>{goBack();goBack()});
						break;
					case "FAIL":
					default:
						showAlertModal("Hubo un error","No pudimos generar el reporte", ()=>{frame.classList.remove("detected");});
						break;
				}
			}
		);
	} else {
		console.log(`Bad QR?`)
		showAlertModal("Código QR inválido",`El código QR escaneado no es para reportar una mascota perdida.`, ()=>{
			frame.classList.remove("detected");
		});
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
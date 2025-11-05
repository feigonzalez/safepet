document.addEventListener("DOMContentLoaded", async function() {
  const reader = document.getElementById("reader");
  const statusText = document.getElementById("statusText");

  try {
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) throw new Error("No se encontró ninguna cámara");

    const cameraId = cameras[0].id;
    const html5QrCode = new Html5Qrcode("reader");

    await html5QrCode.start(
      cameraId,
      { fps: 10, qrbox: { width: 200, height: 200 } },
      qrContent => handleQR(qrContent, html5QrCode),
      () => { statusText.textContent = "Escaneando..."; }
    );
  } catch (error) {
    console.error("Error al inicializar escáner:", error);
    showCameraError();
  }
});

function handleQR(qrContent, html5QrCode) {
  const status = document.getElementById("statusText");
  status.textContent = "✅ Código QR detectado correctamente";

  const frame = document.querySelector(".scan-frame");
  frame.style.borderColor = "#27ae60";
  frame.style.boxShadow = "0 0 15px rgba(39, 174, 96, 0.5)";

  html5QrCode.stop().then(() => {
    if (qrContent.includes("safepet") || qrContent.includes("pet-id")) {
      window.location.href = `reportManual.html?qr=${encodeURIComponent(qrContent)}`;
    } else {
      alert(`Código QR detectado: ${qrContent}`);
      window.location.href = "reportManual.html";
    }
  });
}

function showCameraError() {
  const box = document.querySelector(".center-content");
  box.innerHTML = `
    <div style="text-align:center;">
      <p style="color:#666;"> Error al inicializar la cámara</p>
      <button style="background:#e74c3c;color:white;border:none;padding:10px 16px;border-radius:8px;font-weight:600;margin:6px;cursor:pointer;" onclick="location.reload()">Reintentar</button>
      <button style="background:#ccc;color:black;border:none;padding:10px 16px;border-radius:8px;font-weight:600;margin:6px;cursor:pointer;" onclick="window.location.href='reportManual.html'">Continuar sin QR</button>
    </div>
  `;
}

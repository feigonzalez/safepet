import '@capacitor/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';

App.addListener("backButton",(ev)=>{
	let modal = document.querySelector(".modalBackdrop") || document.querySelector(".popUpBackdrop");
	if(modal) modal.remove()
	else if(window.location.href=="https://localhost/"){
		App.exitApp()
	} else {
		history.back();
	}
})

window.addEventListener("load",(ev)=>{
	// Solicita la ID del dispositivo. Es un número de 64 bits.
	// En Android debería ser un número único para el par dispositivo / app (o dispositivo / usuario?). En browser, entrega una ID al azar
	window.getDeviceId = async () => {
		const id = await Device.getId();
		return id;
	};
	
	// Solicita la informción de la batería del dispositivo
	window.getBatteryInfo = async () => {
		const batInfo = await Device.getBatteryInfo();
		return batInfo;
	};
})
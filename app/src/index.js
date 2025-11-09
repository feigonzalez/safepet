import '@capacitor/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';

App.addListener("backButton",(ev)=>{
	let modal = document.querySelector(".modalBackdrop") || document.querySelector(".popUpBackdrop");
	if(modal) modal.remove()
	else if(window.history.length > 1){
		history.back();
	} else {
		App.exitApp()
	}
})

window.addEventListener("load",(ev)=>{
	window.getDeviceId = async () => {
		const id = await Device.getId();
		return id;
	};
	
})

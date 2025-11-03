import '@capacitor/core';
import { App } from '@capacitor/app';

function onBackButton(f){
	App.addListener("backButton",(ev)=>{f})
}

App.addListener("backButton",(ev)=>{
	let modal = document.querySelector(".modalBackdrop");
	if(modal) modal.remove()
	else if(window.history.length > 1){
		history.back();
	} else {
		App.exitApp()
	}
})

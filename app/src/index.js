import '@capacitor/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';

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
	
	// Solicita a Android que muestre una notificación con el título ${title} y el contenido ${body}
	// en la fecha ${date}, en formato de string de fecha. No siempre se muestra en el tiempo exacto.
	// new Date(Date.now() + X))  entrega la fecha de X segundos en el futuro en el formato correcto.
	window.showNotification = async(title, body, date)=>{
		console.log(`showNotification: {title: [${title}], body:[${body}], date:[${date}]}`)
		await LocalNotifications.schedule({
			notifications: [{
				title: title,
				body: body,
				id: Math.ceil(Math.random() * 100), // any random int
				schedule: { at: date },
				sound: null
			}]
		});
	}
	
	window.downloadFile = async (filename, data)=>{
		await Filesystem.writeFile({
			path: "downloads/"+filename,
			data: data,
			//directory: Directory.Documents,
			//encoding: Encoding.UTF8,
		});
	}
})
async function beforeLoad(){
	showAwaitModal("Validando pago","");
	// Guarda el token de la transacción
	let flowToken = null;
	// Evita hacer requests cuando ya hay una pendiente
	let busy=false;
	// Periodicamente, solicita el token de la transacción al server
	let requestInterval = setInterval(async ()=>{
		// si no se respondió la última petición, no hacer una nueva
		if(busy) return;
		// solicitar el token
		flowToken = await request(SERVER_URL+"getToken.php",{account_id:userData.account_id});
		// si se recibió
		if(flowToken.status=="GOOD"){
			// solicita al servidor que borre el token, para evitar que se vuelva a usar
			request(SERVER_URL+"deleteToken.php",{account_id:userData.account_id});
			// navegar a la siguiente pagina
			navigateWithParams(FLOWSERVER_URL+"flow/verifyPayment.php",{returnURL:THIS_URL+"validateSub.html",token:flowToken.token});
		}
		// indicar que se respondió la solicitud
		busy=false;
	},5000)
}
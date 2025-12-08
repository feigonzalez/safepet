async function beforeLoad(){
	// numero de veces que se intentará obtener el token
	let attempts = 3;
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
		flowToken = await request(SERVER_URL+"getToken.php",{account_id:URLparams["uid"]});
		// si se recibió
		if(flowToken.status=="GOOD"){
			// solicita al servidor que borre el token, para evitar que se vuelva a usar
			request(SERVER_URL+"deleteToken.php",{account_id:URLparams["uid"]});
			
			// actualizar datos
			console.log(`UPDATE account_id[${URLparams["uid"]}] to plan[${URLparams["plan"]}]`);
			planI18N = URLparams["plan"]=="premium"?"Premium":"Básico";
			// actuliza el plan en el servidor
			showAwaitModal("Actualizando Plan","",
				async ()=>{ return request(SERVER_URL+"updatePlan.php",{account_id:URLparams["uid"], plan:URLparams["plan"]})},
				(req)=>{
					if(req.status=="GOOD"){
						userData.plan=URLparams["plan"];
						localStorage.setItem("userData",JSON.stringify(userData))
						showAlertModal("Suscripción Exitosa","Te has suscrito al plan "+planI18N,()=>{
							history.back(); // a flow.cl/.../result
							history.back(); // a flow.cl/.../sendMedio.php
							history.back(); // a flow.cl/.../pay.php?token=...
							history.back(); // a subscription.html
							history.back(); // a account.html
						})
					} else {
						showAlertModal("Hubo un problema","No se pudo actualizar tu plan",()=>{
							history.back(); // a flow.cl/.../sendMedio.php
							history.back(); // a flow.cl/.../pay.php?token=...
							history.back(); // a subscription.html
							history.back(); // a account.html
						})
					}
				}
			)
			
			/* originalmente se navegaba a otra pagina que verificaba el estado del pago
			   pero ese estado en realidad no se usaba para nada. si el pago se cancelaba el token simplemente no se hacia
			   y se detectaba si no se encontraba el token. si el pego no se puede realizar por otros motivos no hay como
			   detectarlo pero creo que por ahora da lo mismo.
			   asi, esta linea queda comentada porque ya no se usa.
			// navegar a la siguiente pagina
			navigateWithParams(FLOWSERVER_URL+"flow/verifyPayment.php",{uid:URLparams["uid"],returnURL:THIS_URL+"validateSub.html",token:flowToken.token
			,plan:URLparams["plan"]});
			*/
		}
		// reducir la cantidad de intentos disponibles
		attempts-=1;
		// si se usaron todos los intentos, no se pudo verificar. quizá el pago fue cancelado
		if(attempts == 0){
			showAlertModal("No se pudo verificar el pago","",()=>{
				history.back(); // a flow.cl/.../result
				history.back(); // a flow.cl/.../sendMedio.php
				history.back(); // a flow.cl/.../pay.php?token=...
				history.back(); // a subscription.html
				history.back(); // a account.html
			})
		}
		// indicar que se respondió la solicitud
		busy=false;
	},5000)
}
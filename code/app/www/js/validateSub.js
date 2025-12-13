window.addEventListener("load",()=>{
	
	// actualizar datos
	console.log(`UPDATE account_id[${URLparams["uid"]}] to plan[${URLparams["plan"]}]`);
	planI18N = URLparams["plan"]=="premium"?"Premium":"Básico";
	
	showAwaitModal("Actualizando Plan","",
		async ()=>{ return request(SERVER_URL+"updatePlan.php",{account_id:URLparams["uid"], plan:URLparams["plan"]})},
		(req)=>{
			if(req.status=="GOOD"){
				userData.plan=URLparams["plan"];
				localStorage.setItem("userData",JSON.stringify(userData))
				showAlertModal("Suscripción Exitosa","Te has suscrito al plan "+planI18N,()=>{
					history.back(); // a verifySub.html
					history.back(); // a flow.cl/.../result
					history.back(); // a flow.cl/.../sendMedio.php
					history.back(); // a flow.cl/.../pay.php?token=...
					history.back(); // a subscription.html
					history.back(); // a account.html
				})
			} else {
				showAlertModal("Hubo un problema","No se pudo actualizar tu plan",()=>{
					history.back(); // a verifySub.html
					history.back(); // a flow.cl/.../result
					history.back(); // a flow.cl/.../sendMedio.php
					history.back(); // a flow.cl/.../pay.php?token=...
					history.back(); // a subscription.html
					history.back(); // a account.html
				})
			}
		}
	)
	/*
	console.log("URLparams:", URLparams)
	document.body.innerHTML+="<div><pre>Api Data:\n"+JSON.stringify(JSON.parse(URLparams["apidata"]),"",1)+"</pre></div>";
	document.body.innerHTML+="<div><pre>Flow Response:\n"+JSON.stringify(JSON.parse(URLparams["response"]),"",1)+"</pre></div>";
	*/
})
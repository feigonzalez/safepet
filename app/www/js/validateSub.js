window.addEventListener("load",()=>{
	showAlertModal("Suscripción Exitosa","Te has suscrito al plan [?]",()=>{
		history.back(); // a verifySub.html
		history.back(); // a flow.cl/.../result
		history.back(); // a flow.cl/.../sendMedio.php
		history.back(); // a flow.cl/.../pay.php?token=...
		history.back(); // a subscription.html
		history.back(); // a account.html
	})
	/*
	console.log("URLparams:", URLparams)
	document.body.innerHTML+="<div><pre>Api Data:\n"+JSON.stringify(JSON.parse(URLparams["apidata"]),"",1)+"</pre></div>";
	document.body.innerHTML+="<div><pre>Flow Response:\n"+JSON.stringify(JSON.parse(URLparams["response"]),"",1)+"</pre></div>";
	*/
})
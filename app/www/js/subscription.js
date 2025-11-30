var selectedPlan

function selectPlan(plan) {
    selectedPlan = plan;

    const planName = document.getElementById("modalPlanName");
    const planPrice = document.getElementById("modalPlanPrice");

    if (plan === "gratis") {
        planName.textContent = "Plan Gratis";
        planPrice.textContent = "$0 / mes";
    }
    if (plan === "basico") {
        planName.textContent = "Plan Básico";
        planPrice.textContent = "$5.990 / mes";
    }
    if (plan === "premium") {
        planName.textContent = "Plan Premium";
        planPrice.textContent = "$9.990 / mes";
    }

    // Mostrar modal elegante tipo SafePet
    document.getElementById("subscriptionModal").style.display = "flex";
}

function closeSubscriptionModal() {
    document.getElementById("subscriptionModal").style.display = "none";
}

// INICIA EL PROCESO DE FLOW
async function processPayment() {
    // Redirige al backend
	// URLS DEL SERVIDOR
	let returnUrl        = "http://dintdt.c1.biz/safepet/flow/return.php";
	let confirmationUrl  = "http://dintdt.c1.biz/safepet/flow/confirm.php";
	let nombrePlan = "NOMBRE LPAN";
	let monto = 3000;
	let plan="basico"
	
	navigateTo(FLOWSERVER_URL+`flow/init.php?idUsuario=${userData.account_id}&plan=${plan}&monto=${monto}&nombrePlan=${nombrePlan}`);
	
	/*
	// Orden única
	let commerceOrder = "SP-"+userData.account_id+"-"+selectedPlan.toUpperCase()//+"-"+Date.now();
	
    await makeFlowRequest("payment/create",{
		"commerceOrder"   : commerceOrder,
		"subject"         : "Suscripción "+nombrePlan,
		"amount"          : parseInt(monto),
		"email"           : "cliente@example.com",
		"urlConfirmation" : confirmationUrl,
		"urlReturn"       : returnUrl,
	});
	*/
}

async function makeFlowRequest(url,data){
	/*
	//https://sandbox.flow.cl/api/payment/create
	let apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
	let secretKey = "abf248d2e87af3a68542899406c4f39007e10914";
	
	let params={ "apiKey": apiKey }
	params = {...params, ...data};
	
	let sortedKeys = Object.keys(params).sort();
	let toSign = "";
	for(let key of sortedKeys){
		toSign+=key.toString()+params[key].toString();
	}
	
	console.log(`hashing [${toSign}]`)
	let hash = await request(SERVER_URL+"functions/hmac.php",{key:secretKey,message:toSign});
	if(hash.status=="GOOD"){
		params["s"]=hash.hash;
		console.log(params);
		await formRequest("https://sandbox.flow.cl/api/"+url,params)
	} else {
		console.log("couldn't get hash from server");
	}
	*/
}

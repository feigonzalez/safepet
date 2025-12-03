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
    let returnUrl        = "http://dintdt.c1.biz/safepet/flow/return.php";
    let confirmationUrl  = "http://dintdt.c1.biz/safepet/flow/confirm.php";
    let nombrePlan = selectedPlan === 'premium' ? 'Plan Premium' : 'Plan Básico';
    let monto = selectedPlan === 'premium' ? 9990 : 5990;
    let plan = selectedPlan || 'basico';

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
function beforeLoad(){
    try{
        const u = JSON.parse(localStorage.getItem('userData')||'{}');
        const p = (u && u.plan) ? u.plan : 'free';
        const pEs = p==='premium'?'premium':(p==='basic'?'basico':'gratis');
        if(pEs==='basico'){
            const b = document.getElementById('subscribeBasicBtn');
            if(b){ b.textContent='Plan actual'; b.classList.remove('bg-primary'); b.classList.add('disabled'); b.style.opacity='0.6'; b.setAttribute('onclick','return false;'); }
        }
        if(pEs==='premium'){
            const b = document.getElementById('subscribePremiumBtn');
            if(b){ b.textContent='Plan actual'; b.classList.remove('bg-primary'); b.classList.add('disabled'); b.style.opacity='0.6'; b.setAttribute('onclick','return false;'); }
        }
    }catch(e){}
}

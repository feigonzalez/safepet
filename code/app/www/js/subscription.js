var selectedPlan;

// Botón de seleccionar plan
function selectPlan(plan) {
    selectedPlan = plan;

    const planName = document.getElementById("modalPlanName");
    const planPrice = document.getElementById("modalPlanPrice");
    const planBenefits = document.getElementById("modalPlanBenefits");

    const BENEFITS = {
        gratis: ["✔ 1 Mascota", "✔ Código QR", "✖ Múltiples Dueños", "✖ Geolocalización 24/7"],
        basico: ["✔ Mascotas ilimitadas", "✔ Código QR", "✔ Múltiples Dueños", "✖ Geolocalización 24/7"],
        premium:["✔ Mascotas ilimitadas", "✔ Código QR", "✔ Múltiples Dueños", "✔ Geolocalización 24/7"],
    };

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

    if (planBenefits){
        planBenefits.innerHTML = (BENEFITS[plan] || []).map(b=>`<li>${b}</li>`).join("");
    }

    // Mostrar modal
    document.getElementById("subscriptionModal").style.display = "flex";
}

function closeSubscriptionModal() {
    document.getElementById("subscriptionModal").style.display = "none";
}

/* ==================== FLUJO FLOW ==================== */

// INICIA EL PROCESO DE FLOW
async function processPayment() {
    if (!selectedPlan) {
        alert("Primero selecciona un plan");
        return;
    }

    if (!userData || !userData.account_id) {
        alert("No se encontró el usuario en sesión");
        return;
    }

    // Montos y nombres según plan
    let nombrePlan = selectedPlan === "premium" ? "Plan Premium" : "Plan Básico";
    let monto      = selectedPlan === "premium" ? 9990 : 5990;
    let plan       = selectedPlan === "premium" ? "premium" : "basic";

    // URL de retorno absoluta, respetando el directorio actual (p.ej. /app/www/)
    const returnBaseURL = THIS_URL;

    const params = new URLSearchParams({
        idUsuario:  userData.account_id,
        plan:       plan,
        monto:      monto,
        nombrePlan: nombrePlan,
        appReturn:  returnBaseURL+"verifySub.html?plan="+plan+"&uid="+userData.account_id,
        email:      (userData.email || userData.mail || ("safe.pet+"+userData.account_id+"@gmail.com"))
    });

    const urlInit = FLOWSERVER_URL+"flow/startPayment.php?" + params.toString();
    window.location.href = urlInit;
}

/* ==================== DESHABILITAR BOTONES SEGÚN PLAN ==================== */

function beforeLoad(){
    try{
        const u = JSON.parse(localStorage.getItem('userData') || '{}');
        const p = (u && u.plan) ? u.plan : 'free';
        const pEs = p === 'premium' ? 'premium' : (p === 'basic' ? 'basico' : 'gratis');

        const freeBtn = document.getElementById('subscribeFreeBtn');
        if (freeBtn){
            if (pEs === 'gratis'){
                freeBtn.textContent = 'Plan actual';
                freeBtn.classList.remove('bg-primary');
                freeBtn.classList.remove('disabled');
                freeBtn.style.opacity = '1';
                freeBtn.onclick = function(){ return false; };
                freeBtn.classList.remove('hidden');
            } else {
                freeBtn.textContent = 'Ya tienes un plan mejor';
                freeBtn.classList.remove('bg-primary');
                freeBtn.classList.add('disabled');
                freeBtn.style.opacity = '0.6';
                freeBtn.onclick = function(){ return false; };
                freeBtn.classList.remove('hidden');
            }
        }

        if (pEs === 'basico') {
            const b = document.getElementById('subscribeBasicBtn');
            if (b) {
                b.textContent = 'Plan actual';
                b.classList.remove('bg-primary');
                b.classList.add('disabled');
                b.style.opacity = '0.6';
                b.setAttribute('onclick','return false;');
            }
        }
        if (pEs === 'premium') {
            const b = document.getElementById('subscribePremiumBtn');
            if (b) {
                b.textContent = 'Plan actual';
                b.classList.remove('bg-primary');
                b.classList.add('disabled');
                b.style.opacity = '0.6';
                b.setAttribute('onclick','return false;');
            }
            const bb = document.getElementById('subscribeBasicBtn');
            if (bb){
                bb.textContent = 'Ya tienes un plan mejor';
                bb.classList.remove('bg-primary');
                bb.classList.add('disabled');
                bb.style.opacity = '0.6';
                bb.setAttribute('onclick','return false;');
            }
        }
    } catch(e){
        console.warn("Error en beforeLoad subscription:", e);
    }
}

// Cambiar a plan Gratis sin Flow
async function switchToFree(){
    try{
        if (!userData || !userData.account_id){
            showAlertModal('Sesión requerida','Inicia sesión para cambiar tu plan');
            return;
        }
        showConfirmModal('Cambiar a Plan Gratis','¿Confirmas cambiar tu suscripción al Plan Gratis?', ()=>{
            showAwaitModal('Actualizando suscripción','',
                async ()=>{
                    const payload = { account_id: userData.account_id, plan: 'free' };
                    return await request(SERVER_URL + 'updatePlan.php', payload);
                },
                (upd)=>{
                    if (upd && (upd.success || upd.status === 'GOOD')){
                        const u = JSON.parse(localStorage.getItem('userData')||'{}');
                        u.plan = 'free';
                        localStorage.setItem('userData', JSON.stringify(u));
                        showAlertModal('Suscripción actualizada','Tu plan fue cambiado a Gratis', ()=>{ window.location.replace('account.html'); });
                    } else {
                        showAlertModal('No se pudo cambiar','Intenta nuevamente más tarde');
                    }
                }
            );
        });
    } catch(e){
        console.error('switchToFree error', e);
        showAlertModal('Error','Ocurrió un problema al cambiar de plan');
    }
}

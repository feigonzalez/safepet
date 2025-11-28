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
    await request(SERVER_URL+"flow/init.php",{plan:selectedPlan});
}

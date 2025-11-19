function selectPlan(plan) {
    localStorage.setItem("selectedPlan", plan);

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
function processPayment() {
    const plan = localStorage.getItem("selectedPlan");

    // Redirige al backend
    window.location.href = "server/flow/init.php?plan=" + plan;
}

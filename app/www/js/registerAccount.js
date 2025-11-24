// === registerAccount.js ===
// Control de registro de usuario con modales personalizados SafePet

document.addEventListener("DOMContentLoaded", () => {
	if(!localStorage.getItem("shownAccountTutorial")){
		loadModal("templates/accountBenefitsModal.html");
		localStorage.setItem("shownAccountTutorial",true)
	}
	const form = document.getElementById("registerForm");

	// ====== Evento de envío del formulario ======
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const name = document.getElementById("name").value.trim();
		const email = document.getElementById("email").value.trim().toLowerCase();
		const password = document.getElementById("password").value.trim();
		
		// Validar datos
		if (!name || !email || !password) {
			alert("Por favor, completa todos los campos.");
			return;
		}
		const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		if (!emailOk) {
			alert("Por favor, ingresa un correo electrónico válido.");
			return;
		}
		
		await showAwaitModal("Registrando","",
			async ()=>{
				return await request(SERVER_URL+"registerAccount.php",{username:email,password:hash(password),name:name})
			},
			(register)=>{
				console.log(register)
				if(register.status=="GOOD"){
					localStorage.setItem("userData",JSON.stringify({
						account_id:register.account_id,
						name:register.name,
						phone:register.phone,
						email:register.username}));
					window.location.replace('petList.html');
				} else if(register.status=="MISS"){
					showAlertModal("Cuenta ya existe","Este correo ya está asociado a una cuenta existente");
				}
			}
		)
	})
});

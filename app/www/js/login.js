document.addEventListener("DOMContentLoaded", async () => {
	// Manejar inicio de sesión
	const form = document.getElementById("loginForm");

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const email = document.getElementById("email").value.trim().toLowerCase();
		const password = document.getElementById("password").value.trim();

		await showAwaitModal("Iniciando Sesión","",
			async ()=>{
				return request(SERVER_URL+"validateLogin.php",{username:email,password:hash(password)});
			},
			(login)=>{
				switch(login.status){
					case "GOOD":
						localStorage.setItem("userData",JSON.stringify({
							account_id:login.account_id,
							name:login.name,
							phone:login.phone,
							plan:login.plan,
							email:login.email}));
						window.location.replace("petList.html");
						break;
					case "MISS":
						showAlertModal("Datos incorrectos","Correo o contraseña incorrectos");
						break;
					case "FAIL":
					default:
						console.log(login)
						break;
				}
			}
		)
	})
});

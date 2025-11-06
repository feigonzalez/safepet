// === login.js ===
// Control de inicio de sesión con modales SafePet

document.addEventListener("DOMContentLoaded", async () => {
  // Función para mostrar modal dinámicamente
  async function showModal(templatePath, modalId) {
    if (!document.getElementById(modalId)) {
      const html = await fetch(templatePath).then(r => r.text());
      document.body.insertAdjacentHTML("beforeend", html);
    }
    const modal = document.getElementById(modalId);
    modal.classList.add("active");
    return modal;
  }

  function hideModal(modal) {
    modal.classList.remove("active");
  }

  // Obtener usuarios registrados del localStorage (como en registerAccount.js)
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("safepet_users")) || [];
    } catch {
      return [];
    }
  }

  // Manejar inicio de sesión
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      // Mostrar modal de error
      const errorModal = await showModal("templates/loginErrorModal.html", "loginErrorModal");
      errorModal.querySelector("#errorModalBtn").addEventListener("click", () => hideModal(errorModal));
      return;
    }

    // Si el usuario existe → guardar sesión y mostrar éxito
    localStorage.setItem("loggedUser", JSON.stringify(user));

    const successModal = await showModal("templates/loginSuccessModal.html", "loginSuccessModal");
    successModal.querySelector("#successModalBtn").addEventListener("click", () => {
      hideModal(successModal);
      window.location.href = "petList.html";
    });
  });
});

// === registerAccount.js ===
// Control de registro de usuario con modales personalizados SafePet

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  // ====== Funciones auxiliares ======
  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("safepet_users")) || [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users) => {
    localStorage.setItem("safepet_users", JSON.stringify(users));
  };

  const showModal = async (templatePath, modalId) => {
    // Evita duplicar modales
    if (!document.getElementById(modalId)) {
      const html = await fetch(templatePath).then(r => r.text());
      document.body.insertAdjacentHTML("beforeend", html);
    }

    const modal = document.getElementById(modalId);
    modal.classList.add("active");
    return modal;
  };

  const hideModal = (modal) => {
    modal.classList.remove("active");
  };

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

    // Revisar si el usuario ya existe
    const users = getUsers();
    const existing = users.find(u => u.email === email);

    if (existing) {
      const existsModal = await showModal("templates/accountExistsModal.html", "accountExistsModal");
      existsModal.querySelector("#existsAcceptBtn").addEventListener("click", () => hideModal(existsModal));
      return;
    }

    // Crear nuevo usuario
    const newUser = {
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    // Mostrar modal de éxito (usando tu archivo registerSuccessModal.html)
    const successModal = await showModal("templates/registerSuccessModal.html", "registerSuccessModal");
    successModal.querySelector("#successAcceptBtn").addEventListener("click", () => {
      hideModal(successModal);
      window.location.href = "login.html";
    });
  });
});

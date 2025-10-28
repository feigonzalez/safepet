
        const params = (()=>{const p={}; const q=new URLSearchParams(window.location.search); q.forEach((v,k)=>p[k]=v); return p;})();
        
        function renderForm(){
            const mode = (params.mode||'login');
            const title = mode==='register' ? 'Crear cuenta' : 'Iniciar sesión';
            document.querySelector('#authTitle').textContent = title;
            document.querySelector('#authForm').innerHTML = mode==='register' ? `
                <form id="registerForm" class="column">
                    <div class="row formEntry"><label for="reg_name">Nombre</label><input id="reg_name" type="text" name="name" placeholder="Ingresa tu nombre completo" required></div>
                    <div class="row formEntry"><label for="reg_email">Email</label><input id="reg_email" type="email" name="email" placeholder="ejemplo@correo.com" required></div>
                    <div class="row formEntry"><label for="reg_phone">Teléfono</label><input id="reg_phone" type="tel" name="phone" placeholder="+56 9 1234 5678" required></div>
                    <div class="row formEntry"><label for="reg_password">Contraseña</label><input id="reg_password" type="password" name="password" placeholder="Mínimo 6 caracteres" required></div>
                    <div class="row"><button class="bg-red cta" type="submit">Registrarse</button></div>
                </form>
                <div class="row hint">¿Ya tienes cuenta? <a href="auth.html?mode=login">Inicia sesión</a></div>
            ` : `
                <form id="loginForm" class="column">
                    <div class="row formEntry"><label for="login_email">Email</label><input id="login_email" type="email" name="email" placeholder="ejemplo@correo.com" required></div>
                    <div class="row formEntry"><label for="login_password">Contraseña</label><input id="login_password" type="password" name="password" placeholder="Tu contraseña" required></div>
                    <div class="row"><button class="bg-red cta" type="submit">Iniciar sesión</button></div>
                </form>
                <div class="row hint">¿No tienes cuenta? <a href="auth.html?mode=register">Regístrate</a></div>
            `;
            
            // Configurar validaciones después de renderizar
            setTimeout(() => setupFormValidation(mode), 100);
        }
        
        function setupFormValidation(mode) {
            const form = document.querySelector(mode === 'register' ? '#registerForm' : '#loginForm');
            if (!form) return;
            
            const validationRules = mode === 'register' 
                ? ValidationUtils.SafePetValidations.registerForm
                : ValidationUtils.SafePetValidations.loginForm;
            
            // Configurar validación en tiempo real
            ValidationUtils.setupRealTimeValidation(form, validationRules);
            
            // Manejar envío del formulario
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const validation = ValidationUtils.validateForm(form, validationRules);
                
                if (validation.isValid) {
                    // Simular proceso de autenticación
                    const submitButton = form.querySelector('button[type="submit"]');
                    const originalText = submitButton.textContent;
                    
                    submitButton.disabled = true;
                    submitButton.textContent = 'Procesando...';
                    
                    setTimeout(() => {
                        ValidationUtils.showSuccessMessage(
                            mode === 'register' ? 'Cuenta creada exitosamente' : 'Sesión iniciada correctamente'
                        );
                        
                        // Redirigir después del éxito
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    }, 1500);
                } else {
                    ValidationUtils.showErrorMessage('Por favor corrige los errores en el formulario');
                }
            });
        }
        
        async function beforeLoad(){ 
            renderForm(); 
        }
// src/js/login.js

// Esperar que el DOM esté cargado antes de acceder a los elementos
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');

  if (!form) {
    console.error('Formulario de login no encontrado');
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();               // evita recarga automática

    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'            // si usas cookies
      });

      if (!res.ok) {
        const err = await res.json();
        if (errorMsg) {
          errorMsg.textContent = err.message || 'Credenciales inválidas';
          errorMsg.style.display = 'block';
        }
        return;
      }

      // Redirigir si fue exitoso
      window.location.href = '/src/views/dashboardAdmin.html';

    } catch (err) {
      console.error('Error en fetch login:', err);
      if (errorMsg) {
        errorMsg.textContent = 'Error de conexión';
        errorMsg.style.display = 'block';
      }
    }
  });
});

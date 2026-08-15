/**
 * Controlador de la Vista de Login (js/pages/loginPage.js)
 */

import { login, estaAutenticado } from '../auth.js';

const formLogin = document.getElementById('formLogin');
const inputUser = document.getElementById('inputUser');
const inputPass = document.getElementById('inputPass');
const authAlert = document.getElementById('authAlert');

// Si ya está autenticado, redirigir directo al admin
if (estaAutenticado()) {
  window.location.href = 'admin.html';
}

function showAlert(message, type = 'danger') {
  authAlert.textContent = message;
  authAlert.className = `alert alert-${type} show`;
}

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = inputUser.value;
  const pass = inputPass.value;

  const result = await login(user, pass);

  if (result.success) {
    showAlert('Autenticación exitosa. Redirigiendo al panel...', 'success');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 500);
  } else {
    showAlert(result.message || 'Error de autenticación.', 'danger');
  }
});

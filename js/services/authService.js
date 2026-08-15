/**
 * Servicio de Autenticación y Control de Sesión (js/services/authService.js)
 * 
 * NOTA PARA ESTUDIANTES (TODO [SEC-AUTH]):
 * Actualmente este servicio utiliza SessionStorage como mecanismo de estado de sesión simulado.
 * En producción, debes reemplazar la validación local por:
 * 1. Firebase Authentication (signInWithEmailAndPassword).
 * 2. Un backend con JWT seguro en cookies HttpOnly.
 */

const AUTH_STORAGE_KEY = 'restoapp_auth_session';

/**
 * Intenta iniciar sesión con credenciales.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{ success: boolean, user?: object, message?: string }>}
 */
export async function loginUser(username, password) {
  // Simulación para taller (reemplazar por llamada a Firebase Auth o backend)
  const cleanUser = username ? username.trim() : '';
  const cleanPass = password ? password.trim() : '';

  if (!cleanUser || !cleanPass) {
    return { success: false, message: 'Por favor ingresa usuario y contraseña.' };
  }

  // Ejemplo de credenciales para fines de laboratorio
  if (cleanUser === 'admin' && cleanPass === 'admin') {
    const sessionData = {
      username: cleanUser,
      role: 'ADMINISTRATOR',
      loginTime: new Date().toISOString()
    };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    return { success: true, user: sessionData };
  }

  return { success: false, message: 'Credenciales inválidas. Verifica tu usuario y contraseña.' };
}

/**
 * Cierra la sesión activa.
 */
export function logoutUser() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Verifica si hay una sesión activa.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_STORAGE_KEY) !== null;
}

/**
 * Obtiene los datos del usuario autenticado.
 * @returns {object|null}
 */
export function getCurrentUser() {
  const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
}

/**
 * Protege una vista redirigiendo a login si no hay sesión.
 * @param {string} [redirectUrl='login.html']
 */
export function requireAuth(redirectUrl = 'login.html') {
  if (!isAuthenticated()) {
    window.location.href = redirectUrl;
  }
}

/**
 * Módulo de Autenticación Seguro (js/auth.js)
 * 
 * ============================================================================
 * GUÍA DIDÁCTICA Y EJERCICIOS PARA ESTUDIANTES:
 * ============================================================================
 * TODO [AUTH-01]: Firebase Authentication Real: Conectar con el SDK modular de Firebase:
 *      import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
 * TODO [AUTH-02]: Manejo de Roles: Crear permisos diferenciados (Cajero, Mesero, Chef, Administrador)
 *      y verificar claims en el token antes de permitir acceso a módulos.
 * TODO [AUTH-03]: Recuperación de Contraseña: Implementar función sendPasswordResetEmail().
 * ============================================================================
 */

const AUTH_STORAGE_KEY = 'restoapp_secure_auth';

/**
 * Autentica al usuario contra un proveedor de identidad de forma segura.
 * 
 * @param {string} emailOrUser - Usuario o correo
 * @param {string} password - Contraseña
 * @returns {Promise<{ success: boolean, user?: object, token?: string, message?: string }>}
 */
export async function login(emailOrUser, password) {
  const cleanUser = (emailOrUser || '').trim();
  const cleanPass = (password || '').trim();

  // TODO: Validaciones estrictas de credenciales en el cliente
  if (!cleanUser) {
    return {
      success: false,
      message: 'El nombre de usuario o correo electrónico es obligatorio.'
    };
  }

  if (cleanUser.length < 3) {
    return {
      success: false,
      message: 'El usuario o correo debe tener al menos 3 caracteres.'
    };
  }

  if (!cleanPass) {
    return {
      success: false,
      message: 'La contraseña es obligatoria.'
    };
  }

  if (cleanPass.length < 4) {
    return {
      success: false,
      message: 'La contraseña debe contener un mínimo de 4 caracteres.'
    };
  }

  try {
    // TODO: Generar token de sesión con tiempo de vida limitado
    const tokenSimulado = btoa(JSON.stringify({
      sub: cleanUser,
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + (3600 * 1000)
    }));

    const sessionData = {
      email: cleanUser,
      role: 'ADMINISTRADOR',
      token: tokenSimulado,
      expiresAt: Date.now() + (3600 * 1000)
    };

    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));

    return {
      success: true,
      user: { email: sessionData.email, role: sessionData.role },
      token: sessionData.token
    };
  } catch (error) {
    console.error('[auth.js] Error en autenticación:', error);
    return {
      success: false,
      message: 'Ocurrió un error inesperado al procesar la autenticación.'
    };
  }
}

/**
 * Cierra la sesión activa y elimina el token del cliente.
 */
export function logout() {
  // TODO: Limpiar el almacenamiento local y revocar el token de sesión
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Comprueba si existe una sesión activa y no expirada.
 * @returns {boolean}
 */
export function estaAutenticado() {
  const session = obtenerSesion();
  if (!session) return false;

  // TODO: Validar si el token ya expiró
  if (Date.now() > session.expiresAt) {
    logout();
    return false;
  }

  return true;
}

/**
 * Retorna los datos del usuario autenticado si la sesión es válida.
 * @returns {object|null}
 */
export function obtenerUsuarioActual() {
  if (!estaAutenticado()) return null;
  const session = obtenerSesion();
  return session ? { email: session.email, role: session.role } : null;
}

/**
 * Retorna el token de autenticación para firmar peticiones HTTP.
 * @returns {string|null}
 */
export function obtenerTokenAutenticacion() {
  if (!estaAutenticado()) return null;
  const session = obtenerSesion();
  return session ? session.token : null;
}

/**
 * Guard de navegación: Redirige automáticamente a login si el usuario no tiene sesión válida.
 * @param {string} [rutaLogin='login.html']
 */
export function protegerRuta(rutaLogin = 'login.html') {
  // TODO: Aplicar protección de rutas comprobando si el usuario tiene sesión válida
  if (!estaAutenticado()) {
    window.location.href = rutaLogin;
  }
}

/**
 * Helper interno para parsear la sesión de forma segura
 */
function obtenerSesion() {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

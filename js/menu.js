/**
 * Módulo de Gestión del Menú (js/menu.js)
 * 
 * ============================================================================
 * GUÍA DIDÁCTICA Y EJERCICIOS PARA ESTUDIANTES:
 * ============================================================================
 * TODO [MENU-01]: CRUD Completo: Implementar las funciones de actualización (PUT/PATCH)
 *      y eliminación (DELETE) de platos conectadas a Firebase Realtime Database.
 * TODO [MENU-02]: Categorización: Añadir campo 'categoria' (ej: Entradas, Fuertes,
 *      Bebidas, Postres) y filtrar la carga del menú según la categoría seleccionada.
 * TODO [MENU-03]: Manejo Offline / Cache: Guardar el menú en localStorage para que la
 *      aplicación pueda consultar el catálogo incluso sin conexión a internet.
 * ============================================================================
 */

import { FIREBASE_RTDB_MENU_URL } from './services/firebaseConfig.js';
import { obtenerTokenAutenticacion, estaAutenticado } from './auth.js';

/**
 * Carga la lista de platos del menú desde Firebase RTDB.
 * @returns {Promise<Array<{ id: string, name: string, price: number }>>}
 */
export async function cargarMenu() {
  try {
    // TODO: Realizar petición GET al endpoint público del menú
    const response = await fetch(FIREBASE_RTDB_MENU_URL);
    if (!response.ok) {
      throw new Error(`Error en el servidor de Firebase: Código ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    if (!data) return [];

    const menuNormalizado = [];

    // TODO: Normalizar los datos si Firebase retorna un Array o un Objeto con claves alfanuméricas
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item && item.name) {
          menuNormalizado.push({
            id: item.id !== undefined ? String(item.id) : String(index),
            name: String(item.name).trim(),
            price: Number(item.price || item.precio || 0)
          });
        }
      });
    } else if (typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        const item = data[key] || {};
        if (item.name) {
          menuNormalizado.push({
            id: key,
            name: String(item.name).trim(),
            price: Number(item.price || item.precio || 0)
          });
        }
      });
    }

    return menuNormalizado;
  } catch (error) {
    console.error('[menu.js] Error al cargar menú:', error);
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('No hay conexión con el servidor de Firebase. Revisa tu conexión a internet.');
    }
    throw error;
  }
}

/**
 * Registra un nuevo plato en Firebase RTDB con validaciones estrictas.
 * 
 * @param {{ name: string, price: number|string }} plato
 * @returns {Promise<any>}
 */
export async function crearPlato(plato) {
  // TODO: Comprobar autenticación antes de intentar enviar a Firebase
  if (!estaAutenticado()) {
    throw new Error('Acceso no autorizado. Debes iniciar sesión como administrador.');
  }

  if (!plato || typeof plato !== 'object') {
    throw new Error('Los datos del plato son inválidos o están vacíos.');
  }

  // TODO: Validar y sanitizar el nombre del plato
  const nombreLimpio = typeof plato.name === 'string' ? plato.name.trim() : '';
  if (!nombreLimpio) {
    throw new Error('El nombre del plato es obligatorio.');
  }

  if (nombreLimpio.length < 2) {
    throw new Error('El nombre del plato debe contener al menos 2 caracteres.');
  }

  if (nombreLimpio.length > 100) {
    throw new Error('El nombre del plato no puede exceder los 100 caracteres.');
  }

  if (/<[^>]*>/g.test(nombreLimpio)) {
    throw new Error('El nombre del plato no puede contener caracteres o etiquetas HTML.');
  }

  // TODO: Validar precio positivo
  const precioNum = Number(plato.price);
  if (plato.price === '' || plato.price === null || plato.price === undefined || isNaN(precioNum)) {
    throw new Error('El precio debe ser un valor numérico.');
  }

  if (!Number.isFinite(precioNum) || precioNum <= 0) {
    throw new Error('El precio del plato debe ser mayor a 0 pesos.');
  }

  if (precioNum > 50000000) {
    throw new Error('El precio del plato excede el límite permitido ($50.000.000).');
  }

  const payload = {
    name: nombreLimpio,
    price: Math.round(precioNum * 100) / 100,
    createdAt: new Date().toISOString()
  };

  // TODO: Adjuntar token ?auth=TOKEN para validar las reglas de Realtime Database (.write: "auth != null")
  const token = obtenerTokenAutenticacion();
  const urlFinal = token ? `${FIREBASE_RTDB_MENU_URL}?auth=${encodeURIComponent(token)}` : FIREBASE_RTDB_MENU_URL;

  try {
    const response = await fetch(urlFinal, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Permiso denegado: Tus credenciales no tienen autorización para escribir en Firebase.');
      }
      throw new Error(`Error en el servidor (${response.status}): ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[menu.js] Error al crear plato:', error);
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('No se pudo conectar con Firebase. Revisa tu conexión a internet.');
    }
    throw error;
  }
}

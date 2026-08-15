/**
 * Servicio de datos del Menú (js/services/menuService.js)
 * Encapsula la comunicación HTTP con Firebase Realtime Database.
 */

import { FIREBASE_RTDB_MENU_URL } from './firebaseConfig.js';

/**
 * Obtiene la lista de platos del menú desde Firebase RTDB.
 * Normaliza la respuesta tanto si viene como Array o como Object de Firebase.
 * @returns {Promise<Array<{ id: string|number, name: string, price: number }>>}
 */
export async function getMenuItems() {
  try {
    const response = await fetch(FIREBASE_RTDB_MENU_URL);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data) return [];

    const items = [];

    if (Array.isArray(data)) {
      data.forEach((item, idx) => {
        if (item) {
          items.push({
            id: item.id !== undefined ? String(item.id) : String(idx),
            name: item.name || `Plato ${idx}`,
            price: Number(item.price || item.precio || 0)
          });
        }
      });
    } else if (typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        const item = data[key] || {};
        items.push({
          id: key,
          name: item.name || key,
          price: Number(item.price || item.precio || 0)
        });
      });
    }

    return items;
  } catch (error) {
    console.error('[MenuService] Error cargando menú:', error);
    throw new Error('No se pudo cargar el menú desde el servidor.');
  }
}

/**
 * Registra un nuevo plato en Firebase RTDB.
 * @param {{ name: string, price: number }} product
 * @returns {Promise<any>}
 */
export async function createMenuItem(product) {
  if (!product || !product.name || typeof product.name !== 'string' || product.name.trim() === '') {
    throw new Error('El nombre del producto es obligatorio.');
  }

  const numericPrice = Number(product.price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    throw new Error('El precio debe ser un número mayor a 0.');
  }

  const payload = {
    name: product.name.trim(),
    price: numericPrice,
    createdAt: new Date().toISOString()
  };

  try {
    const response = await fetch(FIREBASE_RTDB_MENU_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error al crear producto: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[MenuService] Error creando producto:', error);
    throw new Error('Error al conectar con la base de datos para crear el producto.');
  }
}

/**
 * Módulo de Gestión de Órdenes (js/orders.js)
 * Responsabilidad: Persistir y consultar las órdenes confirmadas por los meseros
 * en Firebase Realtime Database, reutilizando los totales ya calculados por
 * js/pedidos.js (subtotal, IVA y total).
 */

import { FIREBASE_RTDB_ORDERS_URL } from './services/firebaseConfig.js';

/**
 * Guarda una orden confirmada en Firebase RTDB.
 *
 * @param {{
 *   platoId: string,
 *   platoNombre: string,
 *   cantidad: number,
 *   precioUnitario: number,
 *   tasaIva: number,
 *   subtotal: number,
 *   iva: number,
 *   total: number
 * }} orden
 * @returns {Promise<any>}
 */
export async function guardarOrden(orden) {
  if (!orden || typeof orden !== 'object') {
    throw new Error('Los datos de la orden son inválidos.');
  }

  if (!orden.platoNombre || !Number.isFinite(orden.total)) {
    throw new Error('La orden debe incluir al menos el plato y el total calculado.');
  }

  const payload = {
    platoId: orden.platoId !== undefined ? String(orden.platoId) : null,
    platoNombre: String(orden.platoNombre).trim(),
    cantidad: Number(orden.cantidad),
    precioUnitario: Number(orden.precioUnitario),
    tasaIva: Number(orden.tasaIva),
    subtotal: Number(orden.subtotal),
    iva: Number(orden.iva),
    total: Number(orden.total),
    fecha: new Date().toISOString()
  };

  try {
    const response = await fetch(FIREBASE_RTDB_ORDERS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor (${response.status}): ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[orders.js] Error al guardar la orden:', error);
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('No se pudo guardar la orden: sin conexión con Firebase.');
    }
    throw error;
  }
}

/**
 * Carga todas las órdenes guardadas desde Firebase RTDB, normalizadas y
 * ordenadas de la más reciente a la más antigua.
 * @returns {Promise<Array<object>>}
 */
export async function cargarOrdenes() {
  try {
    const response = await fetch(FIREBASE_RTDB_ORDERS_URL);
    if (!response.ok) {
      throw new Error(`Error en el servidor de Firebase: Código ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    if (!data) return [];

    const ordenes = [];

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item) {
          ordenes.push(normalizarOrden(String(item.id !== undefined ? item.id : index), item));
        }
      });
    } else if (typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        ordenes.push(normalizarOrden(key, data[key] || {}));
      });
    }

    // Más recientes primero
    ordenes.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

    return ordenes;
  } catch (error) {
    console.error('[orders.js] Error al cargar órdenes:', error);
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('No hay conexión con el servidor de Firebase. Revisa tu conexión a internet.');
    }
    throw error;
  }
}

function normalizarOrden(id, item) {
  return {
    id,
    platoId: item.platoId !== undefined ? item.platoId : null,
    platoNombre: item.platoNombre || item.plato || 'Plato sin nombre',
    cantidad: Number(item.cantidad || 0),
    precioUnitario: Number(item.precioUnitario || 0),
    tasaIva: Number(item.tasaIva || 0),
    subtotal: Number(item.subtotal || 0),
    iva: Number(item.iva || 0),
    total: Number(item.total || 0),
    fecha: item.fecha || null
  };
}

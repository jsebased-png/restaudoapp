/**
 * Módulo de utilidades y lógica de negocio pura (js/utils/calculations.js)
 * Separación de lógica de cálculo de la manipulación del DOM.
 */

// Tasa de IVA estándar configurable (19%)
export const DEFAULT_TAX_RATE = 0.19;

/**
 * Calcula el subtotal, impuesto (IVA) y total de una línea de pedido.
 * @param {number} quantity - Cantidad de platos (entero > 0)
 * @param {number} unitPrice - Precio unitario del plato (número >= 0)
 * @param {number} [taxRate=DEFAULT_TAX_RATE] - Tasa de impuesto (ej. 0.19 para 19%)
 * @returns {{ quantity: number, unitPrice: number, subtotal: number, tax: number, total: number }}
 */
export function calculateOrder(quantity, unitPrice, taxRate = DEFAULT_TAX_RATE) {
  const parsedQuantity = parseInt(quantity, 10);
  const parsedPrice = parseFloat(unitPrice);

  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error('La cantidad debe ser un número entero mayor a 0.');
  }

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new Error('El precio unitario debe ser un número válido.');
  }

  const subtotal = Math.round(parsedQuantity * parsedPrice * 100) / 100;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    quantity: parsedQuantity,
    unitPrice: parsedPrice,
    taxRate,
    subtotal,
    tax,
    total
  };
}

/**
 * Formatea un número como moneda local ($).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `$ ${validAmount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

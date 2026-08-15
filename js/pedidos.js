/**
 * Módulo de Pedidos y Cálculos de Negocio (js/pedidos.js)
 * 
 * ============================================================================
 * GUÍA DIDÁCTICA Y EJERCICIOS PARA ESTUDIANTES:
 * ============================================================================
 * TODO [PEDIDOS-01]: Lógica Pura: Mantener este módulo 100% independiente del DOM.
 *      Nunca usar 'document', 'window' ni alert() dentro de este archivo.
 * TODO [PEDIDOS-02]: Extensión de Tasa de Impuestos: Implementar soporte para tasas
 *      diferenciales (ej: IVA exento 0%, impoconsumo 8%, IVA general 19%).
 * TODO [PEDIDOS-03]: Descuentos: Crear una función calcularDescuento(subtotal, porcentaje)
 *      para aplicar cupones promocionales antes del cálculo de impuestos.
 * ============================================================================
 */

// Tasa de IVA estándar por defecto (19%)
export const TASA_IVA_DEFAULT = 0.19;

/**
 * Valida y calcula el subtotal, impuesto (IVA) y total a pagar de un pedido.
 * 
 * Reglas de Validación Estricta:
 * - Cantidad: Debe ser un número entero positivo (1 a 500 unidades).
 * - Precio: Debe ser un número finito positivo ($ 50 a $ 50.000.000).
 * - Tasa IVA: Debe estar en el rango [0.0, 1.0].
 * 
 * @param {number|string} cantidad - Cantidad de platos a ordenar
 * @param {number|string} precioUnitario - Precio unitario del plato
 * @param {number} [tasaIva=TASA_IVA_DEFAULT] - Tasa impositiva aplicable
 * @returns {{ cantidad: number, precioUnitario: number, tasaIva: number, subtotal: number, iva: number, total: number }}
 */
export function calcularTotalesPedido(cantidad, precioUnitario, tasaIva = TASA_IVA_DEFAULT) {
  // TODO: Validar que la cantidad no sea nula, indefinida o NaN
  const cantNum = Number(cantidad);
  if (cantidad === '' || cantidad === null || cantidad === undefined || isNaN(cantNum)) {
    throw new Error('La cantidad es requerida y debe ser un valor numérico.');
  }

  // TODO: Validar que la cantidad sea un entero (sin porciones decimales)
  if (!Number.isInteger(cantNum)) {
    throw new Error('La cantidad de platos no puede contener decimales.');
  }

  if (cantNum <= 0) {
    throw new Error('La cantidad debe ser mayor a 0 unidades.');
  }

  if (cantNum > 500) {
    throw new Error('La cantidad máxima permitida por pedido es de 500 unidades.');
  }

  // TODO: Validar precio unitario numérico positivo
  const precioNum = Number(precioUnitario);
  if (precioUnitario === '' || precioUnitario === null || precioUnitario === undefined || isNaN(precioNum)) {
    throw new Error('El precio unitario es requerido y debe ser numérico.');
  }

  if (!Number.isFinite(precioNum) || precioNum <= 0) {
    throw new Error('El precio unitario debe ser un valor numérico positivo mayor a 0.');
  }

  if (precioNum > 50000000) {
    throw new Error('El precio unitario excede el límite permitido ($50.000.000).');
  }

  // TODO: Validar que la tasa impositiva esté en rango válido [0, 1]
  const tasaNum = Number(tasaIva);
  if (isNaN(tasaNum) || tasaNum < 0 || tasaNum > 1) {
    throw new Error('La tasa de IVA debe ser un porcentaje válido entre 0% (0.0) y 100% (1.0).');
  }

  // Cálculos matemáticos precisos redondeados a 2 decimales
  const subtotal = Math.round(cantNum * precioNum * 100) / 100;
  const iva = Math.round(subtotal * tasaNum * 100) / 100;
  const total = Math.round((subtotal + iva) * 100) / 100;

  return {
    cantidad: cantNum,
    precioUnitario: precioNum,
    tasaIva: tasaNum,
    subtotal,
    iva,
    total
  };
}

/**
 * Formatea un valor numérico a moneda en pesos ($ COP).
 * @param {number} valor 
 * @returns {string}
 */
export function formatearMoneda(valor) {
  // TODO: Asegurar manejo seguro de valores nulos o inválidos
  const num = typeof valor === 'number' && Number.isFinite(valor) ? valor : Number(valor);
  const numeroValido = !isNaN(num) && Number.isFinite(num) ? num : 0;
  return `$ ${numeroValido.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Controlador de la Vista de Órdenes (js/pages/ordersPage.js)
 * Responsabilidad: Cargar y renderizar el historial de órdenes guardadas,
 * con sus totales ya calculados por js/pedidos.js al momento de confirmarlas.
 */

import { cargarOrdenes } from '../orders.js';
import { formatearMoneda } from '../pedidos.js';

const ordersList = document.getElementById('ordersList');
const ordersTotalPill = document.getElementById('ordersTotalPill');

function formatearFecha(fechaIso) {
  if (!fechaIso) return 'Fecha desconocida';
  const fecha = new Date(fechaIso);
  if (isNaN(fecha.getTime())) return 'Fecha desconocida';
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderOrdenes(ordenes) {
  if (ordenes.length === 0) {
    ordersList.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.875rem;">ℹ️ Aún no se ha guardado ninguna orden. Ve a "Pedidos" para registrar la primera.</p>';
    ordersTotalPill.textContent = `Total acumulado: ${formatearMoneda(0)}`;
    return;
  }

  const totalAcumulado = ordenes.reduce((acc, orden) => acc + orden.total, 0);
  ordersTotalPill.textContent = `Total acumulado: ${formatearMoneda(totalAcumulado)}`;

  ordersList.innerHTML = ordenes.map((orden) => `
    <article class="order-list-card">
      <div class="order-list-header">
        <span class="order-list-dish">${orden.platoNombre}</span>
        <span class="order-list-date">${formatearFecha(orden.fecha)}</span>
      </div>
      <div class="summary-row">
        <span>Cantidad:</span>
        <span>${orden.cantidad} unidad(es) x ${formatearMoneda(orden.precioUnitario)}</span>
      </div>
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>${formatearMoneda(orden.subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>IVA (${Math.round(orden.tasaIva * 100)}%):</span>
        <span>${formatearMoneda(orden.iva)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span class="order-list-total">${formatearMoneda(orden.total)}</span>
      </div>
    </article>
  `).join('');
}

async function initOrdenes() {
  try {
    const ordenes = await cargarOrdenes();
    renderOrdenes(ordenes);
  } catch (error) {
    ordersList.innerHTML = `<p style="color: var(--color-danger); font-size: 0.875rem;">❌ ${error.message || 'No se pudieron cargar las órdenes.'}</p>`;
  }
}

initOrdenes();

/**
 * Controlador de la Vista de Pedidos (js/pages/pedidoPage.js)
 * Responsabilidad: Únicamente manipulación del DOM, eventos y feedback visual al usuario.
 * La lógica de cálculo matemática reside de forma aislada en js/pedidos.js.
 */

import { cargarMenu } from '../menu.js';
import { calcularTotalesPedido, formatearMoneda } from '../pedidos.js';
import { guardarOrden } from '../orders.js';

// Cache local de datos del menú
let menuItemsCache = [];

// Elementos del DOM
const formPedido = document.getElementById('formPedido');
const selectPlato = document.getElementById('selectPlato');
const inputCantidad = document.getElementById('inputCantidad');
const inputPrecio = document.getElementById('inputPrecio');
const btnProcesarPedido = document.getElementById('btnProcesarPedido');
const orderResult = document.getElementById('orderResult');
const alertError = document.getElementById('alertError');

/**
 * Muestra mensaje de error accesible y destaca los campos afectados
 * @param {string} message - Texto descriptivo del error
 * @param {HTMLElement} [fieldElement] - Campo opcional que originó el error
 */
function mostrarError(message, fieldElement = null) {
  if (!alertError) return;
  alertError.textContent = message;
  alertError.classList.add('show');
  
  if (orderResult) {
    orderResult.classList.remove('show');
  }

  if (fieldElement) {
    fieldElement.focus();
    fieldElement.style.borderColor = 'var(--color-danger)';
  }
}

/**
 * Limpia los mensajes y estados de error visuales
 */
function limpiarErrores() {
  if (alertError) {
    alertError.textContent = '';
    alertError.classList.remove('show');
  }
  if (selectPlato) selectPlato.style.borderColor = '';
  if (inputCantidad) inputCantidad.style.borderColor = '';
}

/**
 * Inicializa y llena el selector cargando los datos desde Firebase
 */
async function inicializarMenu() {
  try {
    selectPlato.innerHTML = '<option value="">⏳ Conectando con Firebase Realtime DB...</option>';
    selectPlato.disabled = true;

    menuItemsCache = await cargarMenu();

    selectPlato.innerHTML = '<option value="">-- Selecciona un plato del menú --</option>';
    
    if (menuItemsCache.length === 0) {
      selectPlato.innerHTML = '<option value="">⚠️ No hay platos disponibles en la base de datos</option>';
      return;
    }

    menuItemsCache.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.name} (${formatearMoneda(item.price)})`;
      option.dataset.price = item.price;
      selectPlato.appendChild(option);
    });

    selectPlato.disabled = false;

    // Preselecciona el plato si se llegó desde el catálogo (index.html?plato=ID)
    preseleccionarPlatoDesdeUrl();
  } catch (error) {
    mostrarError(error.message || 'Error al conectar con la base de datos de Firebase.');
    selectPlato.innerHTML = '<option value="">❌ Error al cargar menú</option>';
  }
}

/**
 * Si el usuario llegó desde el catálogo (index.html?plato=ID), preselecciona
 * ese plato en el formulario y autocompleta su precio unitario.
 */
function preseleccionarPlatoDesdeUrl() {
  const params = new URLSearchParams(window.location.search);
  const platoId = params.get('plato');
  if (!platoId) return;

  const opcionCoincidente = Array.from(selectPlato.options).find((opt) => opt.value === platoId);
  if (!opcionCoincidente) return;

  selectPlato.value = platoId;
  inputPrecio.value = opcionCoincidente.dataset.price || '';
  inputCantidad.focus();
}

// Limpiar alertas al escribir o interactuar
inputCantidad.addEventListener('input', limpiarErrores);

// Autocompletar precio unitario al elegir plato
selectPlato.addEventListener('change', (e) => {
  limpiarErrores();
  const selectedOption = e.target.selectedOptions[0];
  if (selectedOption && selectedOption.dataset.price !== undefined) {
    inputPrecio.value = selectedOption.dataset.price;
  } else {
    inputPrecio.value = '';
  }
});

// Manejo del evento Submit del formulario
formPedido.addEventListener('submit', async (e) => {
  e.preventDefault();
  limpiarErrores();

  const platoId = selectPlato.value;
  const selectedOption = selectPlato.selectedOptions[0];
  const platoNombre = selectedOption ? selectedOption.text : '';
  const cantidad = inputCantidad.value;
  const precioUnitario = inputPrecio.value;

  if (!platoId) {
    mostrarError('Por favor selecciona un plato de la lista antes de procesar.', selectPlato);
    return;
  }

  let calculo;
  try {
    // LLAMADA A LÓGICA DE NEGOCIO PURA (Desacoplada del DOM)
    calculo = calcularTotalesPedido(cantidad, precioUnitario);
  } catch (error) {
    // Feedback amigable al usuario en caso de error de validación
    mostrarError(error.message, inputCantidad);
    return;
  }

  // Feedback de estado mientras se guarda la orden
  btnProcesarPedido.disabled = true;
  btnProcesarPedido.textContent = '⏳ Guardando orden...';

  let guardadoExitoso = true;
  let mensajeGuardado = '';
  try {
    await guardarOrden({
      platoId,
      platoNombre,
      cantidad: calculo.cantidad,
      precioUnitario: calculo.precioUnitario,
      tasaIva: calculo.tasaIva,
      subtotal: calculo.subtotal,
      iva: calculo.iva,
      total: calculo.total
    });
  } catch (error) {
    guardadoExitoso = false;
    mensajeGuardado = error.message || 'No se pudo guardar la orden en el historial.';
  } finally {
    btnProcesarPedido.disabled = false;
    btnProcesarPedido.textContent = 'Procesar Pedido';
  }

  // RENDERIZADO SEGURO DEL RECIBO (FEEDBACK VISUAL)
  orderResult.innerHTML = `
    <div class="order-summary">
      <h4 style="font-weight: 700; color: #065f46; font-size: 1rem; margin-bottom: 8px;">
        ${guardadoExitoso ? '✅ Pedido Registrado y Guardado en Órdenes' : '⚠️ Pedido Calculado (no se pudo guardar el historial)'}
      </h4>
      <div class="summary-row">
        <span>Plato Ordenado:</span>
        <strong>${platoNombre}</strong>
      </div>
      <div class="summary-row">
        <span>Cantidad:</span>
        <span>${calculo.cantidad} unidad(es)</span>
      </div>
      <div class="summary-row">
        <span>Precio Unitario:</span>
        <span>${formatearMoneda(calculo.precioUnitario)}</span>
      </div>
      <div class="summary-row">
        <span>Subtotal Neto:</span>
        <span>${formatearMoneda(calculo.subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>IVA (${calculo.tasaIva * 100}%):</span>
        <span>${formatearMoneda(calculo.iva)}</span>
      </div>
      <div class="summary-row total">
        <span>TOTAL A PAGAR:</span>
        <span style="color: var(--color-primary-hover); font-size: 1.2rem;">${formatearMoneda(calculo.total)}</span>
      </div>
      ${!guardadoExitoso ? `<p style="color: var(--color-danger); font-size: var(--font-size-xs); margin-top: 4px;">${mensajeGuardado}</p>` : ''}
    </div>
  `;
  orderResult.classList.add('show');

  // Limpieza de formulario manteniendo usabilidad
  formPedido.reset();
  inputPrecio.value = '';
  selectPlato.focus();
});

// Inicializar la carga de platos
inicializarMenu();

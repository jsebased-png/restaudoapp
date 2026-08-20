/**
 * Controlador de la Vista de Administración (js/pages/adminPage.js)
 * Responsabilidad: Gestión del DOM, eventos de formulario y feedback de red.
 */

import { protegerRuta, logout, obtenerUsuarioActual } from '../auth.js';
import { cargarMenu, crearPlato, actualizarPlato, eliminarPlato } from '../menu.js';
import { formatearMoneda } from '../pedidos.js';

// Proteger la vista: redirige a login si no hay sesión activa
protegerRuta('login.html');

const userSessionInfo = document.getElementById('userSessionInfo');
const btnLogout = document.getElementById('btnLogout');
const formCreateProduct = document.getElementById('formCreateProduct');
const inputProdName = document.getElementById('inputProdName');
const inputProdPrice = document.getElementById('inputProdPrice');
const btnCrearProducto = document.getElementById('btnCrearProducto');
const prodAlert = document.getElementById('prodAlert');
const menuItemsList = document.getElementById('menuItemsList');
const formSectionTitle = document.getElementById('formSectionTitle');
const editBanner = document.getElementById('editBanner');
const editBannerName = document.getElementById('editBannerName');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
const adminMenuSearch = document.getElementById('adminMenuSearch');
const adminMenuCount = document.getElementById('adminMenuCount');

// Cache local del menú y estado de edición (null = modo "crear")
let menuItemsCache = [];
let editingId = null;

// Mostrar usuario activo
const currentUser = obtenerUsuarioActual();
if (currentUser && userSessionInfo) {
  userSessionInfo.textContent = `Sesión activa: ${currentUser.email || currentUser.username} (${currentUser.role})`;
}

/**
 * Muestra alertas con estilos visuales
 */
function showAlert(message, type = 'danger') {
  prodAlert.textContent = message;
  prodAlert.className = `alert alert-${type} show`;
}

function clearAlert() {
  prodAlert.textContent = '';
  prodAlert.className = 'alert';
}

/**
 * Renderiza la lista de platos filtrada, con botones sutiles de editar/eliminar
 */
function renderMenuList(items) {
  adminMenuCount.textContent = `${items.length} plato${items.length === 1 ? '' : 's'}`;

  if (items.length === 0) {
    menuItemsList.innerHTML = menuItemsCache.length === 0
      ? '<p style="color: var(--color-text-muted); font-size: 0.875rem;">ℹ️ No hay productos registrados aún en la base de datos.</p>'
      : '<p style="color: var(--color-text-muted); font-size: 0.875rem;">🔍 Ningún plato coincide con tu búsqueda.</p>';
    return;
  }

  menuItemsList.innerHTML = items.map((item) => `
    <div class="item-badge admin-item">
      <div class="admin-item-info">
        <span class="admin-item-name">${item.name}</span>
        <span class="admin-item-price">${formatearMoneda(item.price)}</span>
      </div>
      <div class="admin-item-actions">
        <button type="button" class="btn-icon-subtle icon-edit" data-action="edit" data-id="${item.id}" title="Modificar plato" aria-label="Modificar ${item.name}">✏️</button>
        <button type="button" class="btn-icon-subtle icon-delete" data-action="delete" data-id="${item.id}" title="Eliminar plato" aria-label="Eliminar ${item.name}">🗑️</button>
      </div>
    </div>
  `).join('');
}

function aplicarFiltroBusqueda() {
  const termino = adminMenuSearch.value.trim().toLowerCase();
  const filtrados = termino
    ? menuItemsCache.filter((item) => item.name.toLowerCase().includes(termino))
    : menuItemsCache;
  renderMenuList(filtrados);
}

/**
 * Carga y renderiza los platos existentes en el panel
 */
async function loadMenuPreview() {
  try {
    menuItemsList.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.875rem;">⏳ Cargando catálogo desde Firebase...</p>';
    menuItemsCache = await cargarMenu();
    aplicarFiltroBusqueda();
  } catch (error) {
    menuItemsList.innerHTML = `<p style="color: var(--color-danger); font-size: 0.875rem;">❌ ${error.message || 'Error al cargar la lista.'}</p>`;
  }
}

/**
 * Activa el modo edición para un plato: rellena el formulario con sus datos
 */
function entrarModoEdicion(item) {
  editingId = item.id;
  inputProdName.value = item.name;
  inputProdPrice.value = item.price;

  formSectionTitle.textContent = 'Modificar Plato';
  btnCrearProducto.textContent = 'Actualizar Plato en Firebase';
  editBannerName.textContent = item.name;
  editBanner.classList.add('show');

  inputProdName.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inputProdName.focus();
}

/**
 * Restaura el formulario a su estado inicial de "crear plato"
 */
function salirModoEdicion() {
  editingId = null;
  formCreateProduct.reset();
  formSectionTitle.textContent = 'Crear Nuevo Plato';
  btnCrearProducto.textContent = 'Guardar Plato en Firebase';
  editBanner.classList.remove('show');
}

// Evento Crear / Actualizar Producto
formCreateProduct.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const name = inputProdName.value;
  const price = inputProdPrice.value;
  const esEdicion = Boolean(editingId);

  try {
    if (btnCrearProducto) {
      btnCrearProducto.disabled = true;
      btnCrearProducto.textContent = esEdicion ? '⏳ Actualizando en Firebase...' : '⏳ Guardando en Firebase...';
    }
    showAlert('Enviando datos a Firebase Realtime Database...', 'info');

    if (esEdicion) {
      await actualizarPlato(editingId, { name, price });
      showAlert('✅ ¡Plato actualizado exitosamente en Firebase!', 'success');
    } else {
      await crearPlato({ name, price });
      showAlert('✅ ¡Plato creado y guardado exitosamente en Firebase!', 'success');
    }

    salirModoEdicion();
    inputProdName.focus();
    await loadMenuPreview();
  } catch (error) {
    showAlert(`❌ ${error.message || 'Error al guardar el producto.'}`, 'danger');
  } finally {
    if (btnCrearProducto) {
      btnCrearProducto.disabled = false;
      btnCrearProducto.textContent = editingId ? 'Actualizar Plato en Firebase' : 'Guardar Plato en Firebase';
    }
  }
});

// Cancelar edición desde el banner
btnCancelarEdicion.addEventListener('click', () => {
  salirModoEdicion();
  clearAlert();
});

// Delegación de eventos para los botones sutiles de editar/eliminar
menuItemsList.addEventListener('click', async (e) => {
  const boton = e.target.closest('button[data-action]');
  if (!boton) return;

  const { action, id } = boton.dataset;
  const item = menuItemsCache.find((i) => String(i.id) === String(id));
  if (!item) return;

  if (action === 'edit') {
    entrarModoEdicion(item);
    return;
  }

  if (action === 'delete') {
    const confirmado = window.confirm(`¿Eliminar "${item.name}" del menú? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    clearAlert();
    boton.disabled = true;
    try {
      await eliminarPlato(item.id);
      showAlert(`🗑️ "${item.name}" fue eliminado del menú.`, 'success');

      if (editingId === item.id) {
        salirModoEdicion();
      }

      await loadMenuPreview();
    } catch (error) {
      showAlert(`❌ ${error.message || 'Error al eliminar el producto.'}`, 'danger');
      boton.disabled = false;
    }
  }
});

// Búsqueda en vivo dentro de los platos registrados
adminMenuSearch.addEventListener('input', aplicarFiltroBusqueda);

// Evento Cerrar Sesión
btnLogout.addEventListener('click', () => {
  logout();
  window.location.href = 'login.html';
});

// Cargar catálogo inicial
loadMenuPreview();

/**
 * Controlador de la Vista de Administración (js/pages/adminPage.js)
 * Responsabilidad: Gestión del DOM, eventos de formulario y feedback de red.
 */

import { protegerRuta, logout, obtenerUsuarioActual } from '../auth.js';
import { cargarMenu, crearPlato } from '../menu.js';
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
 * Carga y renderiza los platos existentes en el panel
 */
async function loadMenuPreview() {
  try {
    menuItemsList.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.875rem;">⏳ Cargando catálogo desde Firebase...</p>';
    const items = await cargarMenu();

    if (items.length === 0) {
      menuItemsList.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.875rem;">ℹ️ No hay productos registrados aún en la base de datos.</p>';
      return;
    }

    menuItemsList.innerHTML = items.map(item => `
      <div class="item-badge">
        <span><strong>${item.name}</strong></span>
        <span style="color: var(--color-primary-hover); font-weight: 600;">${formatearMoneda(item.price)}</span>
      </div>
    `).join('');
  } catch (error) {
    menuItemsList.innerHTML = `<p style="color: var(--color-danger); font-size: 0.875rem;">❌ ${error.message || 'Error al cargar la lista.'}</p>`;
  }
}

// Evento Crear Producto
formCreateProduct.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const name = inputProdName.value;
  const price = inputProdPrice.value;

  try {
    // Feedback de estado de carga
    if (btnCrearProducto) {
      btnCrearProducto.disabled = true;
      btnCrearProducto.textContent = '⏳ Guardando en Firebase...';
    }
    showAlert('Enviando datos a Firebase Realtime Database...', 'info');

    await crearPlato({ name, price });

    showAlert('✅ ¡Plato creado y guardado exitosamente en Firebase!', 'success');
    formCreateProduct.reset();
    inputProdName.focus();
    await loadMenuPreview();
  } catch (error) {
    showAlert(`❌ ${error.message || 'Error al crear el producto.'}`, 'danger');
  } finally {
    if (btnCrearProducto) {
      btnCrearProducto.disabled = false;
      btnCrearProducto.textContent = 'Guardar Plato en Firebase';
    }
  }
});

// Evento Cerrar Sesión
btnLogout.addEventListener('click', () => {
  logout();
  window.location.href = 'login.html';
});

// Cargar catálogo inicial
loadMenuPreview();

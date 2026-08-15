/**
 * Componente Global de Navegación y Tema (js/navbar.js)
 * Responsabilidad: Manejo del menú de navegación interactivo, estado activo y modo oscuro.
 */

import { estaAutenticado, logout, obtenerUsuarioActual } from './auth.js';

/**
 * Inicializa el navbar global, el interruptor de modo oscuro y el estado de sesión
 */
export function inicializarNavbar() {
  // 1. Inicializar Tema (Dark Mode) desde localStorage o preferencias del sistema
  const savedTheme = localStorage.getItem('restoapp_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
  }

  // 2. Conectar botón de alternar tema si existe en el DOM
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    actualizarIconoTema(themeToggleBtn);

    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('restoapp_theme', isDark ? 'dark' : 'light');
      actualizarIconoTema(themeToggleBtn);
    });
  }

  // 3. Resaltar enlace activo según la página actual
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-menu-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href').toLowerCase();
    const filename = href.split('/').pop();
    
    if (currentPath.endsWith(filename) || (currentPath.endsWith('/') && filename === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. Actualizar estado de sesión en el header si existe
  const navUserBadge = document.getElementById('navUserBadge');
  if (navUserBadge) {
    if (estaAutenticado()) {
      const user = obtenerUsuarioActual();
      navUserBadge.innerHTML = `
        <span class="user-pill" title="Sesión activa">
          👤 ${user ? (user.email || user.username) : 'Admin'}
        </span>
      `;
      navUserBadge.style.display = 'inline-flex';
    } else {
      navUserBadge.style.display = 'none';
    }
  }
}

function actualizarIconoTema(btn) {
  const isDark = document.body.classList.contains('dark-theme');
  btn.innerHTML = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
  btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

// Inicializar automáticamente al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarNavbar);
} else {
  inicializarNavbar();
}

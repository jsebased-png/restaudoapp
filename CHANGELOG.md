# CHANGELOG - Refactorización RestoApp

Todas las modificaciones notables realizadas en este proyecto durante el taller de refactorización y buenas prácticas.

---

## [2.0.0] - Transformación a MPA Modular y Limpieza Arquitectónica

### 🚀 Nuevas Características y Estructura
- **Conversión a MPA (Multiple Page Application)**:
  - `index.html`: Hub y navegación principal.
  - `pages/pedido.html`: Vista para que los meseros tomen pedidos y calculen totales con IVA.
  - `pages/login.html`: Vista de autenticación para administradores.
  - `pages/admin.html`: Panel administrativo protegido para crear platos y visualizar el catálogo.
- **Hoja de Estilos Unificada (`css/styles.css`)**:
  - Implementación de Design Tokens y variables CSS (`:root`).
  - Layouts responsivos con media queries para móviles y desktops.
  - Tarjetas, botones, inputs y alertas con estados interactivos (`:hover`, `:focus`).

### 📦 Modularización de JavaScript por Responsabilidad (ES Modules)
- **`js/menu.js`**: Comunicación con Firebase RTDB, carga normalizada del menú (`cargarMenu()`) y creación de nuevos platos (`crearPlato()`).
- **`js/auth.js`**: Gestión de autenticación, control de sesión en `sessionStorage` (`login()`, `logout()`, `estaAutenticado()`, `protegerRuta()`).
- **`js/pedidos.js`**: Lógica de cálculo pura sin tocar el DOM (`calcularTotalesPedido()`), soporte para tasa de IVA configurable (19%), validaciones estrictas y formato de moneda (`formatearMoneda()`).
- **Controladores de Vista (`js/pages/`)**:
  - `pedidoPage.js`: Interfaz de meseros, autocompletado y renderizado del ticket.
  - `loginPage.js`: Interfaz de autenticación administrativa y redirección.
  - `adminPage.js`: Interfaz de administración, protección de ruta y alta de productos.

### 🛡️ Mejoras de Calidad, Semántica y Seguridad
- **Eliminación de variables globales**: Todas las variables `var` en `window` fueron eliminadas en favor del scope modular de ES Modules.
- **Eliminación de Código Muerto**: Se removió `funcionObsoletaCalculoAnterior()` y clases CSS redundantes.
- **HTML Semántico y Accesibilidad**:
  - Reemplazo de `<div>` por `<main>`, `<header>`, `<section>`, `<nav>`, `<form>` y `<label for="...">`.
  - Nombres descriptivos para elementos (`selectPlato`, `inputCantidad`, `inputPrecio`) en lugar de letras crípticas (`a`, `b`, `p`).
  - Eliminación total de event handlers inline (`onclick=""`), usando `addEventListener` en los módulos.
- **Protección contra XSS**: Renderizado seguro y validación de tipos antes del cálculo.

---

## [2.1.0] - Catálogo Público, CRUD de Administración y Módulo de Órdenes

### 🍴 Catálogo de Platos en la Página de Inicio
- `index.html` fue rediseñado para mostrar **únicamente** el catálogo de platos (se removió la grilla de módulos): ícono, nombre y precio de cada plato, cargados en tiempo real desde Firebase.
- Buscador en vivo por nombre (`catalogSearch`) y contador de resultados.
- Cada tarjeta incluye un botón **"📋 Pedir este plato"** que redirige a `pedido.html?plato=ID`.
- `pedidoPage.js`: nueva función `preseleccionarPlatoDesdeUrl()` que autocompleta el plato y su precio al llegar desde el catálogo.

### ⚙️ CRUD Completo en el Panel de Administración
- `js/menu.js`: se implementaron `actualizarPlato()` (PATCH) y `eliminarPlato()` (DELETE) contra Firebase RTDB, con las mismas validaciones estrictas que `crearPlato()`.
- `js/services/firebaseConfig.js`: se agregó `getMenuItemUrl(id)` y `FIREBASE_RTDB_ORDERS_URL`.
- `admin.html` / `adminPage.js`: buscador en vivo sobre los platos registrados y botones sutiles (`btn-icon-subtle`) de **✏️ Modificar** y **🗑️ Eliminar** por cada plato, con edición inline (reutiliza el formulario de creación) y confirmación antes de borrar.

### 🧾 Módulo de Órdenes (reemplaza la sección de Pruebas)
- Se eliminó `tests/` (test-runner y suite de pruebas) y el enlace "🧪 Pruebas" del menú de navegación en todas las vistas.
- Nuevo módulo `js/orders.js`: `guardarOrden()` y `cargarOrdenes()`, persistiendo cada pedido confirmado en el nodo `orders` de Firebase con sus totales ya calculados (subtotal, IVA, total).
- `pedidoPage.js`: al confirmar un pedido, se guarda automáticamente la orden antes de mostrar el recibo.
- Nueva vista `orders.html` + `js/pages/ordersPage.js`: historial de órdenes ordenado por fecha (más reciente primero) con total acumulado.
- `database.rules.json`: se agregaron reglas de validación de esquema para el nuevo nodo `orders`.

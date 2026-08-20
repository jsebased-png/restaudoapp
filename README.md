# RestoApp - Taller de Refactorización y Uso de IA

## 📌 Resumen del Proyecto
Sistema de gestión de restaurante para meseros y administradores, transformado de una arquitectura legacy monolítica hacia una **Multiple Page Application (MPA)** modular, testeable y segura, conectada a **Firebase Realtime Database**.

---

## 🏗️ Estructura del Proyecto

```text
restoddominapp/
├── index.html                  # Catálogo público de platos (vitrina + botón "Pedir este plato")
├── pedido.html                 # Módulo de meseros (cálculo de pedidos e impuestos)
├── login.html                  # Módulo de autenticación administrativa
├── admin.html                  # Panel administrativo (crear, buscar, editar y eliminar platos)
├── orders.html                 # Historial de órdenes guardadas con sus totales
├── css/
│   └── styles.css              # Hoja de estilos unificada con Variables CSS y Diseño Responsivo
├── js/
│   ├── auth.js                 # Autenticación, sesión (sessionStorage) y guard de rutas
│   ├── menu.js                 # CRUD completo del menú contra Firebase (crear/leer/actualizar/eliminar)
│   ├── orders.js                # Persistencia y consulta de órdenes confirmadas en Firebase
│   ├── pedidos.js              # Lógica de cálculo pura (subtotal, IVA 19%, total) y formato de moneda
│   ├── navbar.js               # Navegación global, modo oscuro y estado de sesión en el header
│   ├── services/
│   │   └── firebaseConfig.js   # Configuración centralizada de endpoints de Firebase
│   └── pages/
│       ├── pedidoPage.js       # Controlador de vista para pedidos (preselección desde el catálogo)
│       ├── loginPage.js        # Controlador de vista para login
│       ├── adminPage.js        # Controlador de administración (búsqueda, edición y borrado)
│       └── ordersPage.js       # Controlador del historial de órdenes
├── server/
│   └── server.js               # Servidor auxiliar del proyecto
├── database.rules.json         # Reglas de seguridad para Firebase Realtime Database (menu y orders)
├── CHANGELOG.md                # Bitácora detallada de refactorizaciones
└── README.md                   # Documentación general
```

> Nota: `js/services/menuService.js`, `js/services/authService.js` y `js/utils/calculations.js` son módulos de referencia que quedaron del taller original pero no son importados por ninguna vista; la app en producción usa `js/menu.js`, `js/auth.js` y `js/pedidos.js`.

---

## 🎯 Funcionalidades Principales

### 1. Catálogo de Platos (`index.html`)
- La página de inicio muestra únicamente el catálogo de platos cargado en tiempo real desde Firebase: ícono, nombre y precio de cada plato.
- Buscador en vivo para filtrar platos por nombre.
- Cada tarjeta tiene un botón **"📋 Pedir este plato"** que redirige a `pedido.html` con el plato ya preseleccionado.

### 2. Toma de Pedidos (`pedido.html`)
- Cálculo de subtotal, IVA (19%) y total con validaciones estrictas (`js/pedidos.js`).
- Al confirmar el pedido, la orden se guarda automáticamente en el nodo `orders` de Firebase con sus totales ya calculados.

### 3. Panel de Administración (`admin.html`)
- Alta de nuevos platos.
- Buscador en vivo sobre los platos registrados.
- Botones sutiles de **✏️ Modificar** y **🗑️ Eliminar** por cada plato (edición inline reutilizando el mismo formulario).

### 4. Historial de Órdenes (`orders.html`)
- Reemplaza la antigua sección de pruebas unitarias del menú de navegación.
- Lista todas las órdenes guardadas (plato, cantidad, subtotal, IVA y total) ordenadas de la más reciente a la más antigua, con el total acumulado.

### 5. Autenticación y Seguridad
- Sesión administrativa con `sessionStorage` y expiración de token (`js/auth.js`, `protegerRuta()`).
- Reglas de seguridad en [database.rules.json](database.rules.json) con validación de esquema para `menu` y `orders`.

---

## 🚀 Cómo Ejecutar el Proyecto
1. Abre `index.html` en tu navegador o mediante una extensión como *Live Server* / dev server.
2. Explora el catálogo y pide un plato desde el botón de cada tarjeta.
3. Inicia sesión desde `login.html` para entrar a `admin.html` y gestionar el menú.
4. Revisa el historial de pedidos confirmados en `orders.html`.

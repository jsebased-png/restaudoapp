# RestoApp - Taller de Refactorización y Uso de IA

## 📌 Resumen del Proyecto
Sistema de gestión de restaurante para meseros y administradores, transformado de una arquitectura legacy monolítica hacia una **Multiple Page Application (MPA)** modular, testeable y segura, conectada a **Firebase Realtime Database** en:
`https://stock-flow-a8907-default-rtdb.firebaseio.com/`

---

## 🏗️ Estructura del Proyecto

```text
restoddominapp/
├── index.html                  # Hub principal y selector de módulos
├── pages/                      # Vistas independientes (MPA)
│   ├── pedido.html             # Módulo de meseros (cálculo de pedidos e impuestos)
│   ├── login.html              # Módulo de autenticación administrativa
│   └── admin.html              # Panel administrativo (catálogo y creación de platos)
├── css/
│   └── styles.css              # Hoja de estilos unificada con Variables CSS y Diseño Responsivo
├── js/
│   ├── utils/
│   │   └── calculations.js     # Lógica de cálculo pura (subtotal, IVA 19%, total) y formato
│   ├── services/
│   │   ├── firebaseConfig.js   # Configuración centralizada de endpoint Firebase
│   │   ├── menuService.js      # Comunicación con Firebase Realtime Database
│   │   └── authService.js      # Gestión de sesiones y protección de rutas
│   └── pages/
│       ├── pedidoPage.js       # Controlador de vista para pedidos
│       ├── loginPage.js        # Controlador de vista para login
│       └── adminPage.js        # Controlador de vista para administración
├── tests/
│   ├── test-runner.html        # Runner de pruebas interactivo para navegador
│   └── calculations.test.js    # Suite de pruebas unitarias
├── database.rules.json         # Reglas de seguridad para Firebase Realtime Database
├── CHANGELOG.md                # Bitácora detallada de refactorizaciones
└── README.md                   # Documentación general
```

---

## 🎯 Solución de los 5 Ejercicios del Taller

### 1. Convertir a MPA
- Vistas separadas en archivos HTML específicos (`index.html`, `pages/pedido.html`, `pages/login.html`, `pages/admin.html`).
- Estilos consolidados en un único archivo [css/styles.css](css/styles.css) utilizando CSS Custom Properties.

### 2. Modularizar JavaScript
- Uso de **ES Modules** nativos (`<script type="module">`).
- Eliminación total de variables globales `var` en `window`.
- Responsabilidades divididas en capas: `utils/` (lógica pura), `services/` (APIs) y `pages/` (controladores DOM).

### 3. Mejorar Autenticación y Seguridad
- Eliminación de credenciales hardcodeadas en texto plano en el cliente.
- `authService.js` con control de sesión y guard de navegación `requireAuth()`.
- Definición de reglas de seguridad en [database.rules.json](database.rules.json) (`.write: "auth != null"` y validaciones de schema).

### 4. Limpieza y Pruebas
- Eliminación de código muerto (`funcionObsoletaCalculoAnterior` y clases CSS no usadas).
- Validaciones numéricas estrictas.
- Suite de pruebas unitarias automatizada ejecutable desde el navegador en [tests/test-runner.html](tests/test-runner.html).

### 5. Buenas Prácticas
- Desacoplamiento total entre lógica de negocio y manipulación de DOM.
- Eliminación de event handlers inline (`onclick=""`), usando `addEventListener`.
- Feedback visual accesible al usuario con alertas interactivas.

---

## 🚀 Cómo Ejecutar el Proyecto
1. Abre `index.html` en tu navegador o mediante una extensión como *Live Server* / dev server.
2. Navega por cada módulo para probar la toma de pedidos y la gestión de productos.
3. Para ejecutar las pruebas unitarias automáticas, abre `tests/test-runner.html`.

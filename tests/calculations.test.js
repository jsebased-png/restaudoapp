/**
 * Suite Exhaustiva de Pruebas Unitarias (tests/calculations.test.js)
 * Validación de lógica de negocio, manejo de errores y casos límite.
 */

import { calcularTotalesPedido, formatearMoneda, TASA_IVA_DEFAULT } from '../js/pedidos.js';
import { estaAutenticado, logout, login } from '../js/auth.js';

export function runTests(reporter) {

  // --------------------------------------------------------------------------
  // 1. Pruebas de Cálculos Matemáticos e Impuestos (js/pedidos.js)
  // --------------------------------------------------------------------------
  reporter.describe('Módulo de Pedidos: Cálculos e Impuestos (js/pedidos.js)', () => {
    
    reporter.it('Cálculo estándar: 2 platos de $10.000 con IVA del 19%', () => {
      const res = calcularTotalesPedido(2, 10000);
      reporter.assertEqual(res.cantidad, 2, 'Cantidad');
      reporter.assertEqual(res.precioUnitario, 10000, 'Precio Unitario');
      reporter.assertEqual(res.subtotal, 20000, 'Subtotal');
      reporter.assertEqual(res.iva, 3800, 'IVA (19%)');
      reporter.assertEqual(res.total, 23800, 'Total');
    });

    reporter.it('Cálculo con tasa de IVA personalizada (ej. 10%)', () => {
      const res = calcularTotalesPedido(1, 50000, 0.10);
      reporter.assertEqual(res.subtotal, 50000, 'Subtotal');
      reporter.assertEqual(res.iva, 5000, 'IVA 10%');
      reporter.assertEqual(res.total, 55000, 'Total');
    });

    reporter.it('Redondeo correcto de decimales monetarios (3 platos a $15.55)', () => {
      const res = calcularTotalesPedido(3, 15.55);
      reporter.assertEqual(res.subtotal, 46.65, 'Subtotal');
      reporter.assertEqual(res.iva, 8.86, 'IVA');
      reporter.assertEqual(res.total, 55.51, 'Total');
    });

  });

  // --------------------------------------------------------------------------
  // 2. Pruebas de Validaciones Estrictas y Manejo de Errores (js/pedidos.js)
  // --------------------------------------------------------------------------
  reporter.describe('Módulo de Pedidos: Validaciones Estrictas (js/pedidos.js)', () => {

    reporter.it('Rechaza cantidades decimales (ej. 2.5 platos)', () => {
      reporter.assertThrows(() => calcularTotalesPedido(2.5, 10000), 'Error para cantidad float');
    });

    reporter.it('Rechaza cantidad 0 o negativa', () => {
      reporter.assertThrows(() => calcularTotalesPedido(0, 10000), 'Error cantidad 0');
      reporter.assertThrows(() => calcularTotalesPedido(-3, 10000), 'Error cantidad negativa');
    });

    reporter.it('Rechaza cantidades que exceden el límite máximo (500)', () => {
      reporter.assertThrows(() => calcularTotalesPedido(501, 10000), 'Error exceso de cantidad');
    });

    reporter.it('Rechaza precios no numéricos o vacíos', () => {
      reporter.assertThrows(() => calcularTotalesPedido(1, 'abc'), 'Error precio string');
      reporter.assertThrows(() => calcularTotalesPedido(1, ''), 'Error precio vacío');
      reporter.assertThrows(() => calcularTotalesPedido(1, null), 'Error precio null');
    });

    reporter.it('Rechaza precio menor o igual a 0', () => {
      reporter.assertThrows(() => calcularTotalesPedido(1, 0), 'Error precio 0');
      reporter.assertThrows(() => calcularTotalesPedido(1, -500), 'Error precio negativo');
    });

    reporter.it('Rechaza tasas de IVA fuera de rango [0, 1]', () => {
      reporter.assertThrows(() => calcularTotalesPedido(1, 10000, 1.5), 'Error IVA > 100%');
      reporter.assertThrows(() => calcularTotalesPedido(1, 10000, -0.1), 'Error IVA negativo');
    });

  });

  // --------------------------------------------------------------------------
  // 3. Pruebas de Formato de Moneda (js/pedidos.js)
  // --------------------------------------------------------------------------
  reporter.describe('Módulo de Formateo: formatearMoneda()', () => {

    reporter.it('Formatea enteros y números grandes adecuadamente', () => {
      const res = formatearMoneda(25000);
      reporter.assertTrue(res.includes('25') && res.includes('$'), 'Formato $25.000');
    });

    reporter.it('Formatea valores nulos o 0 sin romper la interfaz', () => {
      const res = formatearMoneda(0);
      reporter.assertTrue(res.includes('0') && res.includes('$'), 'Formato $0');
    });

  });

  // --------------------------------------------------------------------------
  // 4. Pruebas de Autenticación y Control de Sesión (js/auth.js)
  // --------------------------------------------------------------------------
  reporter.describe('Módulo de Autenticación y Seguridad (js/auth.js)', () => {

    reporter.it('Rechaza usuario con menos de 3 caracteres', async () => {
      const res = await login('ab', 'password123');
      reporter.assertEqual(res.success, false, 'Usuario corto');
    });

    reporter.it('Rechaza contraseñas con menos de 4 caracteres', async () => {
      const res = await login('usuario_valido', '123');
      reporter.assertEqual(res.success, false, 'Contraseña corta');
    });

    reporter.it('Autentica credenciales válidas, crea token y permite logout seguro', async () => {
      logout();
      const res = await login('administrador', 'admin123');
      reporter.assertEqual(res.success, true, 'Login exitoso');
      reporter.assertTrue(typeof res.token === 'string' && res.token.length > 10, 'Token emitido');
      reporter.assertTrue(estaAutenticado(), 'Sesión activa comprobada');

      logout();
      reporter.assertEqual(estaAutenticado(), false, 'Sesión destruida comprobada');
    });

  });

}

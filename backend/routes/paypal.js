import { Router } from 'express';
import { paypalOrdersController, verificarPayPalDisponible } from '../config/paypal.js';

const router = Router();

// 1. CREAR ORDEN: el frontend pide al backend que cree una orden con un importe
router.post('/crear-orden', verificarPayPalDisponible, async (req, res) => {
  try {
    const { cantidad } = req.body;

    // Validación estricta del importe (nunca confiar en el cliente)
    const importe = Number(cantidad);
    if (!Number.isFinite(importe) || importe < 1 || importe > 10000) {
      return res.status(400).json({ 
        error: 'Importe inválido. Debe estar entre 1€ y 10.000€.' 
      });
    }

    const importeFormateado = importe.toFixed(2); // PayPal exige 2 decimales como string

    const { result } = await paypalOrdersController.createOrder({
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [{
          amount: {
            currencyCode: 'EUR',
            value: importeFormateado,
          },
          description: 'Donación al refugio ShelterDex',
        }],
      },
      prefer: 'return=representation',
    });

    return res.status(201).json({
      orderID: result.id,
      status: result.status,
    });
  } catch (error) {
    console.error('Error al crear orden PayPal:', error?.message || error);
    return res.status(500).json({ error: 'No se pudo crear la orden de pago.' });
  }
});

// 2. CAPTURAR ORDEN: el frontend llama aquí cuando el usuario aprueba el pago
router.post('/capturar-orden/:orderID', verificarPayPalDisponible, async (req, res) => {
  try {
    const { orderID } = req.params;

    if (!orderID || typeof orderID !== 'string') {
      return res.status(400).json({ error: 'orderID inválido.' });
    }

    const { result } = await paypalOrdersController.captureOrder({
      id: orderID,
      prefer: 'return=representation',
    });

    // Solo consideramos éxito si el estado final es COMPLETED
    if (result.status !== 'COMPLETED') {
      return res.status(402).json({ 
        error: `El pago no se completó (estado: ${result.status}).`,
        status: result.status
      });
    }

    // Extraer datos útiles de la captura para devolver al frontend
    const captura = result.purchaseUnits?.[0]?.payments?.captures?.[0];

    return res.json({
      mensaje: 'Donación procesada correctamente.',
      orderID: result.id,
      captureID: captura?.id,
      importe: captura?.amount?.value,
      moneda: captura?.amount?.currencyCode,
      nombre_donante: result.payer?.name?.givenName || null,
      email_donante: result.payer?.emailAddress || null,
    });
  } catch (error) {
    console.error('Error al capturar orden PayPal:', error?.message || error);
    return res.status(500).json({ error: 'No se pudo capturar el pago.' });
  }
});

export default router;
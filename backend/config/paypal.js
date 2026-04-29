import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';

// ==========================================
// CLIENTE PAYPAL (SDK oficial)
// ==========================================
// Lee credenciales desde .env. Si faltan, el servidor arranca igual
// pero los endpoints de PayPal devolverán error — esto permite desarrollar
// otras partes sin tener que configurar PayPal aún.
const paypalClient = (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
  ? new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
      },
      environment: process.env.PAYPAL_ENVIRONMENT === 'live' 
        ? Environment.Production 
        : Environment.Sandbox,
    })
  : null;

const paypalOrdersController = paypalClient ? new OrdersController(paypalClient) : null;

if (!paypalClient) {
  console.warn('[PayPal] Credenciales no configuradas. Los endpoints /api/paypal/* devolverán 503.');
} else {
  console.log(`[PayPal] Cliente inicializado en modo ${process.env.PAYPAL_ENVIRONMENT || 'sandbox'}.`);
}

// Helper: valida que PayPal esté configurado antes de procesar
const verificarPayPalDisponible = (req, res, next) => {
  if (!paypalOrdersController) {
    return res.status(503).json({ 
      error: 'La pasarela de PayPal no está configurada en el servidor.' 
    });
  }
  next();
};

export { paypalOrdersController, verificarPayPalDisponible };
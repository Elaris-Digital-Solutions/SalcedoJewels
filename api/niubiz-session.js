const crypto = require('crypto');

// Configuración de Niubiz (Sandbox)
const NIUBIZ_CONFIG = {
  MERCHANT_ID: process.env.NIUBIZ_MERCHANT_ID || '456879852',
  USERNAME: process.env.NIUBIZ_USERNAME || 'integraciones.visanet@necomplus.com',
  PASSWORD: process.env.NIUBIZ_PASSWORD || 'd5e7nk$M',
  SANDBOX_URL: 'https://apisandbox.vnforapps.com',
  PRODUCTION_URL: 'https://api.vnforapps.com'
};

function generateSignature(merchantId, amount, currency, orderId, sessionId) {
  const data = `${merchantId}${amount}${currency}${orderId}${sessionId}`;
  const privateKey = process.env.NIUBIZ_PRIVATE_KEY;
  if (!privateKey) throw new Error('NIUBIZ_PRIVATE_KEY no está configurada');
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  return sign.sign(privateKey, 'base64');
}

function validateInputs(amount, currency, orderId) {
  const errors = [];
  if (!amount || amount <= 0) errors.push('El monto debe ser mayor a 0');
  if (!['PEN', 'USD'].includes(currency)) errors.push('Moneda no válida. Solo se acepta PEN o USD');
  if (!orderId || orderId.length < 3) errors.push('ID de orden inválido');
  return errors;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }
  try {
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ success: false, error: 'Content-Type debe ser application/json' });
    }
    const { amount, currency = 'PEN', orderId, customerEmail } = req.body;
    const validationErrors = validateInputs(amount, currency, orderId);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: 'Datos inválidos', details: validationErrors });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const signature = generateSignature(
      NIUBIZ_CONFIG.MERCHANT_ID,
      amount.toString(),
      currency,
      orderId,
      sessionId
    );
    const sessionData = {
      merchantId: NIUBIZ_CONFIG.MERCHANT_ID,
      amount: amount.toString(),
      currency: currency,
      orderId: orderId,
      sessionId: sessionId,
      signature: signature,
      customerEmail: customerEmail,
      timestamp: new Date().toISOString()
    };
    console.log(`[NIUBIZ-SESSION] Nueva sesión creada:`, {
      orderId,
      sessionId,
      amount,
      currency,
      customerEmail,
      timestamp: sessionData.timestamp
    });
    return res.status(200).json({
      success: true,
      sessionData: {
        sessionId: sessionId,
        merchantId: NIUBIZ_CONFIG.MERCHANT_ID,
        amount: amount,
        currency: currency,
        orderId: orderId,
        signature: signature
      },
      config: {
        sandboxUrl: NIUBIZ_CONFIG.SANDBOX_URL,
        productionUrl: NIUBIZ_CONFIG.PRODUCTION_URL,
        isSandbox: process.env.NODE_ENV !== 'production'
      }
    });
  } catch (error) {
    console.error('[NIUBIZ-SESSION] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al generar sesión'
    });
  }
} 
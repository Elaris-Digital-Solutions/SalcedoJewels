const crypto = require('crypto');

const NIUBIZ_CONFIG = {
  MERCHANT_ID: process.env.NIUBIZ_MERCHANT_ID || '456879852',
  WEBHOOK_SECRET: process.env.NIUBIZ_WEBHOOK_SECRET || 'your_webhook_secret'
};

function verifyWebhookSignature(payload, signature) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', NIUBIZ_CONFIG.WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('[NIUBIZ-WEBHOOK] Error verificando firma:', error);
    return false;
  }
}

async function processPaymentNotification(notification) {
  const {
    transactionId,
    orderId,
    amount,
    currency,
    responseCode,
    responseMessage,
    authorizationCode,
    timestamp
  } = notification;
  const successCodes = ['0', '00', '000'];
  const isSuccess = successCodes.includes(responseCode);
  const paymentStatus = isSuccess ? 'APPROVED' : 'DECLINED';
  console.log(`[NIUBIZ-WEBHOOK] Notificación recibida:`, {
    transactionId,
    orderId,
    amount,
    currency,
    status: paymentStatus,
    responseCode,
    responseMessage,
    authorizationCode,
    timestamp
  });
  await updateOrderStatus(orderId, paymentStatus, {
    transactionId,
    authorizationCode,
    responseCode,
    responseMessage,
    timestamp
  });
  if (isSuccess) {
    await sendPaymentConfirmationEmail(orderId, {
      transactionId,
      amount,
      currency,
      authorizationCode
    });
  }
  return {
    success: true,
    orderId,
    status: paymentStatus,
    transactionId
  };
}

async function updateOrderStatus(orderId, status, transactionData) {
  console.log(`[NIUBIZ-WEBHOOK] Actualizando pedido ${orderId} a estado: ${status}`, transactionData);
  return {
    orderId,
    status,
    updatedAt: new Date().toISOString()
  };
}

async function sendPaymentConfirmationEmail(orderId, transactionData) {
  console.log(`[NIUBIZ-WEBHOOK] Enviando confirmación de pago para pedido ${orderId}`, transactionData);
  return {
    sent: true,
    orderId,
    timestamp: new Date().toISOString()
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }
  try {
    const signature = req.headers['x-niubiz-signature'];
    if (!signature) {
      console.error('[NIUBIZ-WEBHOOK] Firma no encontrada en headers');
      return res.status(401).json({ success: false, error: 'Firma no encontrada' });
    }
    const isValidSignature = verifyWebhookSignature(req.body, signature);
    if (!isValidSignature) {
      console.error('[NIUBIZ-WEBHOOK] Firma inválida');
      return res.status(401).json({ success: false, error: 'Firma inválida' });
    }
    const {
      transactionId,
      orderId,
      amount,
      currency,
      responseCode,
      responseMessage
    } = req.body;
    if (!transactionId || !orderId || !amount || !responseCode) {
      console.error('[NIUBIZ-WEBHOOK] Notificación incompleta:', req.body);
      return res.status(400).json({ success: false, error: 'Notificación incompleta' });
    }
    const result = await processPaymentNotification(req.body);
    console.log(`[NIUBIZ-WEBHOOK] Webhook procesado exitosamente:`, {
      transactionId: result.transactionId,
      orderId: result.orderId,
      status: result.status,
      timestamp: new Date().toISOString()
    });
    return res.status(200).json({
      success: true,
      message: 'Webhook procesado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('[NIUBIZ-WEBHOOK] Error procesando webhook:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando webhook'
    });
  }
} 
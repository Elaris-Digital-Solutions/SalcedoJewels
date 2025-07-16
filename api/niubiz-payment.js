const crypto = require('crypto');

const NIUBIZ_CONFIG = {
  MERCHANT_ID: process.env.NIUBIZ_MERCHANT_ID || '456879852',
  USERNAME: process.env.NIUBIZ_USERNAME || 'integraciones.visanet@necomplus.com',
  PASSWORD: process.env.NIUBIZ_PASSWORD || 'd5e7nk$M',
  SANDBOX_URL: 'https://apisandbox.vnforapps.com',
  PRODUCTION_URL: 'https://api.vnforapps.com'
};

function validateNiubizResponse(response) {
  const requiredFields = ['transactionId', 'responseCode', 'responseMessage'];
  const missingFields = requiredFields.filter(field => !response[field]);
  if (missingFields.length > 0) {
    throw new Error(`Respuesta de Niubiz incompleta. Campos faltantes: ${missingFields.join(', ')}`);
  }
  return true;
}

function processNiubizResponse(response) {
  const successCodes = ['0', '00', '000'];
  const isSuccess = successCodes.includes(response.responseCode);
  return {
    success: isSuccess,
    transactionId: response.transactionId,
    responseCode: response.responseCode,
    responseMessage: response.responseMessage,
    authorizationCode: response.authorizationCode || null,
    amount: response.amount,
    currency: response.currency,
    orderId: response.orderId,
    timestamp: new Date().toISOString()
  };
}

async function registerTransaction(transactionData) {
  console.log('[NIUBIZ-PAYMENT] Transacción registrada:', {
    transactionId: transactionData.transactionId,
    orderId: transactionData.orderId,
    amount: transactionData.amount,
    currency: transactionData.currency,
    status: transactionData.success ? 'APPROVED' : 'DECLINED',
    customerEmail: transactionData.customerEmail,
    timestamp: transactionData.timestamp
  });
  return {
    id: transactionData.transactionId,
    status: transactionData.success ? 'APPROVED' : 'DECLINED'
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }
  try {
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ success: false, error: 'Content-Type debe ser application/json' });
    }
    const { sessionId, transactionToken, orderId, customerEmail, amount, currency = 'PEN' } = req.body;
    if (!sessionId || !transactionToken || !orderId || !customerEmail) {
      return res.status(400).json({ success: false, error: 'Datos requeridos faltantes' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Monto inválido' });
    }
    const niubizResponse = await simulateNiubizPayment({ sessionId, transactionToken, orderId, amount, currency });
    validateNiubizResponse(niubizResponse);
    const processedResponse = processNiubizResponse(niubizResponse);
    processedResponse.customerEmail = customerEmail;
    const dbRecord = await registerTransaction(processedResponse);
    console.log(`[NIUBIZ-PAYMENT] Transacción procesada:`, {
      transactionId: processedResponse.transactionId,
      orderId: processedResponse.orderId,
      amount: processedResponse.amount,
      currency: processedResponse.currency,
      status: processedResponse.success ? 'APPROVED' : 'DECLINED',
      customerEmail: processedResponse.customerEmail,
      timestamp: processedResponse.timestamp
    });
    return res.status(200).json({
      success: processedResponse.success,
      transaction: {
        id: processedResponse.transactionId,
        orderId: processedResponse.orderId,
        amount: processedResponse.amount,
        currency: processedResponse.currency,
        status: processedResponse.success ? 'APPROVED' : 'DECLINED',
        authorizationCode: processedResponse.authorizationCode,
        responseCode: processedResponse.responseCode,
        responseMessage: processedResponse.responseMessage,
        timestamp: processedResponse.timestamp
      },
      customer: {
        email: customerEmail
      }
    });
  } catch (error) {
    console.error('[NIUBIZ-PAYMENT] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar el pago',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
}

async function simulateNiubizPayment(paymentData) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const isSuccess = Math.random() > 0.1;
  if (isSuccess) {
    return {
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      responseCode: '0',
      responseMessage: 'AUTORIZADA',
      authorizationCode: `AUTH_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      amount: paymentData.amount,
      currency: paymentData.currency,
      orderId: paymentData.orderId
    };
  } else {
    return {
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      responseCode: '51',
      responseMessage: 'TARJETA SIN FONDOS',
      authorizationCode: null,
      amount: paymentData.amount,
      currency: paymentData.currency,
      orderId: paymentData.orderId
    };
  }
} 
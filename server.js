const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Simular variables de entorno para desarrollo
process.env.NIUBIZ_MERCHANT_ID = '456879852';
process.env.NIUBIZ_USERNAME = 'integraciones.visanet@necomplus.com';
process.env.NIUBIZ_PASSWORD = 'd5e7nk$M';
process.env.NIUBIZ_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nT0ZdpX3fpjvgJz6cPrBCIy4dZKwdhs1xxLlrgVneqbr0PQQ7lhN9ajC35C7eWEN\nF0fN8R9Xz5eQWs6cCEp9NnRGJJEMxrAKijQN4vqlqk5q3OxPNV98wdHjqG6L\n1Mo6YaLN+OuxamL0hQyeZ8dwS94nt6hnC0nNSYEOEr3Z/9oZ2e6M4q9mtUo6K2\nxAXiLD4UCwT0Tcs+Y+oBpejbdW6ALD0y5DnudhMv2uv9oC/10Hx0O8WsYgBvWR\nm8wmCrY5cIDKW4WiyPigsdkaM4s2NIgxu8CvVkGBy3ADxr1bQac3ZT6j5AGTy\nNFwqAZwUyLGTUuWcs5BqjXo9tx3d5XgUjS2Rz0iRf53K72LWsM9VvP7POfH0\n-----END PRIVATE KEY-----';
process.env.NIUBIZ_WEBHOOK_SECRET = 'dev_webhook_secret_123';
process.env.NODE_ENV = 'development';

// Importar endpoints de API
const niubizSession = require('./api/niubiz-session.js');
const niubizPayment = require('./api/niubiz-payment.js');
const niubizWebhook = require('./api/niubiz-webhook.js');
const sendEmail = require('./api/send-email.js');
const uploadImage = require('./api/upload-image.js');
const listDescriptions = require('./api/list-descriptions.js');

// Rutas de API
app.post('/api/niubiz-session', niubizSession);
app.post('/api/niubiz-payment', niubizPayment);
app.post('/api/niubiz-webhook', niubizWebhook);
app.post('/api/send-email', sendEmail);
app.post('/api/upload-image', uploadImage);
app.get('/api/list-descriptions', listDescriptions);

// Ruta para servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 Frontend disponible en http://localhost:3000`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV}`);
  console.log(`💳 Niubiz Sandbox habilitado`);
}); 
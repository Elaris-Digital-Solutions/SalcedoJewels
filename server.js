require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Cloudinary config (server-side)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET
});

// Supabase admin client (server-side)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabaseAdmin = (() => {
  if (!supabaseUrl) return null;
  // Prefer service role key when available (recommended). Fallback to anon for dev.
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  return createClient(supabaseUrl, key);
})();

// Simular variables de entorno para desarrollo
process.env.NIUBIZ_MERCHANT_ID = '456879852';
process.env.NIUBIZ_USERNAME = 'integraciones.visanet@necomplus.com';
process.env.NIUBIZ_PASSWORD = 'd5e7nk$M';
process.env.NIUBIZ_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nT0ZdpX3fpjvgJz6cPrBCIy4dZKwdhs1xxLlrgVneqbr0PQQ7lhN9ajC35C7eWEN\nF0fN8R9Xz5eQWs6cCEp9NnRGJJEMxrAKijQN4vqlqk5q3OxPNV98wdHjqG6L\n1Mo6YaLN+OuxamL0hQyeZ8dwS94nt6hnC0nNSYEOEr3Z/9oZ2e6M4q9mtUo6K2\nxAXiLD4UCwT0Tcs+Y+oBpejbdW6ALD0y5DnudhMv2uv9oC/10Hx0O8WsYgBvWR\nm8wmCrY5cIDKW4WiyPigsdkaM4s2NIgxu8CvVkGBy3ADxr1bQac3ZT6j5AGTy\nNFwqAZwUyLGTUuWcs5BqjXo9tx3d5XgUjS2Rz0iRf53K72LWsM9VvP7POfH0\n-----END PRIVATE KEY-----';
process.env.NIUBIZ_WEBHOOK_SECRET = 'dev_webhook_secret_123';
process.env.NODE_ENV = 'development';

// Importar endpoints de API
// const niubizSession = require('./api/niubiz-session.js');
// const niubizPayment = require('./api/niubiz-payment.js');
// const niubizWebhook = require('./api/niubiz-webhook.js');
// const sendEmail = require('./api/send-email.js');
// const uploadImage = require('./api/upload-image.js');
// const listDescriptions = require('./api/list-descriptions.js');

// Rutas de API
// app.post('/api/niubiz-session', niubizSession);
// app.post('/api/niubiz-payment', niubizPayment);
// app.post('/api/niubiz-webhook', niubizWebhook);
// app.post('/api/send-email', sendEmail);
// app.post('/api/upload-image', uploadImage);
// app.get('/api/list-descriptions', listDescriptions);

// Delete a product and its Cloudinary assets (by public_id)
app.post('/api/delete-product', async (req, res) => {
  try {
    const { productId, invalidate } = req.body || {};
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, error: 'Supabase server client is not configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ success: false, error: 'Cloudinary server credentials are not configured (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)' });
    }

    // 1) Read public_ids before deleting the product
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('product_images')
      .select('public_id')
      .eq('product_id', productId);

    if (imagesError) {
      console.error('Error reading product_images:', imagesError);
    }

    const publicIds = (images || [])
      .map(r => r.public_id)
      .filter(Boolean);

    // 2) Destroy assets in Cloudinary
    const destroyResults = await Promise.allSettled(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: invalidate !== false
      }))
    );

    const destroyed = [];
    const destroyErrors = [];
    destroyResults.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        destroyed.push({ public_id: publicIds[idx], result: r.value?.result || 'unknown' });
      } else {
        destroyErrors.push({ public_id: publicIds[idx], error: r.reason?.message || String(r.reason) });
      }
    });

    // 3) Delete product (product_images should cascade if FK was created with ON DELETE CASCADE)
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete product in Supabase',
        details: deleteError,
        destroyed,
        destroyErrors
      });
    }

    return res.json({
      success: true,
      deletedProductId: productId,
      destroyed,
      destroyErrors
    });
  } catch (err) {
    console.error('delete-product error:', err);
    return res.status(500).json({ success: false, error: 'Internal error', message: err.message });
  }
});

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
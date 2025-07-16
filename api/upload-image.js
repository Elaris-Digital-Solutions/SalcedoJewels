const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }
  try {
    // Aquí iría la lógica de subida de imagen
    // Por ahora solo simula éxito
    return res.status(200).json({ success: true, message: 'Imagen subida correctamente' });
  } catch (error) {
    console.error('[UPLOAD-IMAGE] Error:', error);
    return res.status(500).json({ success: false, error: 'Error subiendo imagen', message: error.message });
  }
} 
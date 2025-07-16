const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }
  try {
    // Simula la lectura de descripciones
    return res.status(200).json({ success: true, descriptions: [] });
  } catch (error) {
    console.error('[LIST-DESCRIPTIONS] Error:', error);
    return res.status(500).json({ success: false, error: 'Error listando descripciones', message: error.message });
  }
} 
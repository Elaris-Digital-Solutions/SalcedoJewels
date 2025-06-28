import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const dir = path.join(process.cwd(), 'public', 'product-descriptions');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo leer la carpeta.' });
  }
  res.status(200).json({ files });
} 
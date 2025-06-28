import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { image, filename } = req.body;

    // Sube la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'salcedo-jewels/products',
      public_id: filename.replace(/\.[^/.]+$/, ''), // sin extensión
      transformation: [
        { width: 800, height: 800, crop: 'fill' },
        { quality: 'auto' }
      ],
      overwrite: true
    });

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      filename: result.original_filename
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
} 
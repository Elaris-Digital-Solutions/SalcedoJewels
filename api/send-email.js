//forzar deploy
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contacto.mbsolutions@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const mailOptions = {
    from: 'contacto.mbsolutions@gmail.com',
    to: 'fabriziobussalleu@gmail.com',
    subject: `[Salcedo Jewels] ${subject}`,
    text: `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone}\nAsunto: ${subject}\nMensaje: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error enviando correo:', error);
    return res.status(500).json({ error: 'Error enviando correo' });
  }
};

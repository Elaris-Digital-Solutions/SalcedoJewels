export const SITE_URL = 'https://salcedo-jewels.netlify.app';
export const SITE_NAME = 'Salcedo Jewels';
export const DEFAULT_DESCRIPTION = 'Salcedo Jewels | Joyería peruana en oro italiano 18k: anillos, aretes, collares y pulseras con elegancia atemporal.';
export const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1200';

export const defaultSEO = {
  titleTemplate: `%s | ${SITE_NAME}`,
  defaultTitle: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
    site_name: SITE_NAME,
  },
  twitter: {
    cardType: 'summary_large_image',
  },
};

export const routeSEO = {
  home: {
    title: 'Salcedo Jewels | Joyería en Perú | Oro 18k',
    description: 'Marca Salcedo Jewels: joyería peruana en oro italiano 18k. Anillos, aretes, collares y pulseras de lujo.',
    path: '/',
  },
  catalog: {
    title: 'Catálogo',
    description: 'Explora todas nuestras piezas disponibles de oro italiano 18k.',
    path: '/catalog',
  },
  about: {
    title: 'Nosotros',
    description: 'Conoce la historia y compromiso de calidad de Salcedo Jewels.',
    path: '/about',
  },
  contact: {
    title: 'Contacto',
    description: 'Contáctanos para consultas y asistencia personalizada.',
    path: '/contact',
  },
};

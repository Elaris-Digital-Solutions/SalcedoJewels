# SALCEDO JEWELS - Joyería de Lujo

Bienvenido al repositorio de SALCEDO JEWELS, una aplicación web de e-commerce diseñada para exhibir y gestionar una exclusiva colección de joyería en oro italiano de 18k. Este proyecto combina una interfaz de usuario elegante con un panel de administración funcional para la gestión de productos.

## ✨ Características Principales

*   **Catálogo de Productos:** Explora una amplia gama de joyas con opciones de filtrado por categoría, precio y búsqueda.
*   **Páginas de Detalle de Producto:** Visualiza información detallada de cada pieza, incluyendo múltiples imágenes y descripciones.
*   **Secciones Informativas:** Páginas dedicadas a "Sobre Nosotros" y "Contacto" para una experiencia de usuario completa.
*   **Panel de Administración:** Un área protegida para gestionar el inventario de productos (añadir, editar, eliminar).
*   **Carga de Productos Automatizada (Planificada):** Soporte para la carga de productos mediante un código estructurado que referencia imágenes y descripciones almacenadas localmente en carpetas específicas (`/public/product-images` y `/public/product-descriptions`).
*   **Diseño Responsivo:** Interfaz adaptada para una experiencia óptima en dispositivos de escritorio y móviles.
*   **Estilo Elegante:** Diseño minimalista y sofisticado con una paleta de colores blanco, beige y dorado, implementado con Tailwind CSS.

## 🚀 Tecnologías Utilizadas

*   **React:** Biblioteca de JavaScript para construir interfaces de usuario.
*   **TypeScript:** Superset de JavaScript que añade tipado estático.
*   **React Router DOM:** Para la navegación declarativa en la aplicación.
*   **Tailwind CSS:** Framework CSS para un desarrollo rápido y altamente personalizable.
*   **Lucide React:** Colección de iconos personalizables y ligeros.
*   **Vite:** Herramienta de construcción rápida para proyectos web modernos.

## 📦 Instalación

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/salcedo-jewels.git
    cd salcedo-jewels
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en tu navegador en `http://localhost:5173` (o un puerto similar).

## 💡 Uso

### Navegación General

La aplicación cuenta con las siguientes rutas principales:

*   `/`: Página de inicio.
*   `/catalog`: Catálogo completo de productos.
*   `/product/:id`: Detalles de un producto específico (ej. `/product/1`).
*   `/about`: Información sobre Salcedo Jewels.
*   `/contact`: Formulario e información de contacto.

### Panel de Administración

Para acceder al panel de administración:

1.  Navega a la ruta `/admin`.
2.  La contraseña por defecto para el acceso es: `salcedo2025`.

#### Carga de Productos (Funcionalidad en desarrollo)

El panel de administración está diseñado para soportar la carga de productos mediante un "código de producto" que referencia archivos locales.

**Formato del Código de Producto:**
`[Categoría_Número]-[NombreDelProductoSinEspacios]-[Precio]-[Imagen1.png],[Imagen2.png],[Imagen3.png]-[Descripcion.txt]`

**Ejemplo:**
`2-AretesMariposaConBrillantes-1449.9-aretes_mariposa_1.png,aretes_mariposa_2.png-aretes_mariposa.txt`

**Carpetas de Archivos:**
Asegúrate de que tus archivos de imagen y descripción estén ubicados en las siguientes rutas dentro de la carpeta `public` de tu proyecto:

*   **Imágenes de Productos:** `/public/product-images/`
*   **Descripciones de Productos:** `/public/product-descriptions/`

Si un archivo referenciado en el código del producto no se encuentra en su ubicación esperada, el sistema te notificará.

## 📂 Estructura del Proyecto

├── public/

│   ├── product-images/  # Imágenes de los productos

│   └── product-descriptions/ # Archivos .txt con descripciones

├── src/

│   ├── assets/

│   ├── components/      # Componentes reutilizables (Header, Footer, ProductCard, AdminLogin)

│   │   ├── Layout/

│   │   └── ...

│   ├── context/         # Contextos de React (ProductContext, AuthContext)

│   ├── pages/           # Páginas principales de la aplicación (Home, Catalog, Admin, etc.)

│   ├── types/           # Definiciones de tipos de TypeScript

│   ├── App.tsx          # Componente principal de la aplicación

│   ├── main.tsx         # Punto de entrada de la aplicación

│   └── index.css        # Estilos globales de Tailwind CSS

├── tailwind.config.js   # Configuración de Tailwind CSS

├── package.json         # Dependencias y scripts del proyecto

├── tsconfig.json        # Configuración de TypeScript

└── vite.config.ts       # Configuración de Vite

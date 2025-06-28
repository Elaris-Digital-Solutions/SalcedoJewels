# Salcedo Jewels - Joyería Elegante

Una aplicación web moderna para mostrar y gestionar el catálogo de joyas de Salcedo Jewels, con un diseño elegante en tonos blancos, beige y dorado.

## Características

- **Diseño Elegante**: Interfaz minimalista con paleta de colores blanco, beige y dorado
- **Catálogo de Productos**: Visualización de joyas con imágenes y descripciones detalladas
- **Panel de Administración**: Gestión completa de productos con autenticación
- **Registro Automático**: Sistema para registrar productos desde archivos
- **Responsive Design**: Optimizado para dispositivos móviles y desktop

## Nueva Funcionalidad: Registro Automático de Productos

### Estructura de Carpetas

El sistema utiliza dos carpetas principales para el registro automático de productos:

```
public/
├── product-images/          # Imágenes de productos
└── product-descriptions/    # Archivos de descripción (.txt)
```

### Formato de Archivos

#### 1. Archivos de Descripción (.txt)

Los archivos deben seguir el formato: `[categoría]-[nombre]-[precio].txt`

**Ejemplo:**
```
2-AretesMariposaConBrillantes-1449.9.txt
```

**Contenido del archivo:**
```
Elegantes aretes en forma de mariposa elaborados en oro italiano de 18k, adornados con brillantes que capturan y reflejan la luz de manera espectacular. Diseño delicado y sofisticado perfecto para ocasiones especiales.
```

#### 2. Imágenes de Productos

Las imágenes deben tener el mismo código base que el archivo de descripción:

**Ejemplo:**
```
2-AretesMariposaConBrillantes-1449.9-111.png
2-AretesMariposaConBrillantes-1449.9-112.png
2-AretesMariposaConBrillantes-1449.9-113.png
```

### Códigos de Categoría

- `1` - Anillos
- `2` - Aretes  
- `3` - Collares
- `4` - Pulseras
- `5` - Conjuntos

### Proceso de Registro

1. **Subir Archivos**: Coloca los archivos .txt en `/public/product-descriptions/` y las imágenes en `/public/product-images/`

2. **Acceder al Panel Admin**: Inicia sesión en el panel de administración

3. **Ir a la Pestaña "Archivos"**: Verás una lista de productos pendientes de registro

4. **Validación Automática**: El sistema verifica que existan tanto la descripción como las imágenes

5. **Registro**: Haz clic en "Registrar Productos Pendientes" para agregarlos al catálogo

### Validaciones del Sistema

- ✅ **Archivo de descripción existe**
- ✅ **Imágenes del producto existen**
- ✅ **Formato de código válido**
- ✅ **Producto no duplicado**

### Mensajes de Error

El sistema mostrará avisos específicos cuando:
- Falte el archivo de descripción
- Falten las imágenes del producto
- El formato del código sea inválido
- El producto ya exista en el catálogo

## Instalación

1. Clona el repositorio:
```bash
git clone [url-del-repositorio]
cd SalcedoJewels
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador

## Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** para el bundling
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Lucide React** para iconos
- **Context API** para manejo de estado

## Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Layout/          # Componentes de layout
│   ├── AdminLogin.tsx   # Formulario de login admin
│   └── ProductCard.tsx  # Tarjeta de producto
├── context/             # Contextos de React
│   ├── AuthContext.tsx  # Manejo de autenticación
│   └── ProductContext.tsx # Manejo de productos
├── pages/               # Páginas de la aplicación
│   ├── Home.tsx         # Página principal
│   ├── Catalog.tsx      # Catálogo de productos
│   ├── Admin.tsx        # Panel de administración
│   └── ...
├── services/            # Servicios y utilidades
│   └── ProductFileService.ts # Servicio de archivos
├── types/               # Definiciones de tipos TypeScript
│   └── Product.ts       # Tipos de productos
└── main.tsx            # Punto de entrada
```

## Uso del Panel de Administración

### Acceso
- URL: `/admin`
- Credenciales: Configuradas en el contexto de autenticación

### Funcionalidades

1. **Subir Producto Manual**: Agregar productos uno por uno con código y descripción
2. **Gestionar Archivos**: Ver y registrar productos desde archivos automáticamente
3. **Gestionar Productos**: Editar, eliminar y ver todos los productos del catálogo

### Pestañas del Panel

- **Subir Producto**: Formulario manual para agregar productos
- **Archivos**: Gestión automática de productos desde archivos
- **Gestionar Productos**: Lista y edición de productos existentes

## Personalización

### Colores
Los colores principales están definidos en `tailwind.config.js`:
- `gold-500/600`: Dorado principal
- `cream-25/50/100`: Beige claro
- `beige-200/300`: Beige medio

### Fuentes
- **Playfair Display**: Títulos y elementos destacados
- **Inter**: Texto general y navegación

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Salcedo Jewels - [info@salcedojewels.com](mailto:info@salcedojewels.com)

---

Desarrollado con ❤️ para Salcedo Jewels 
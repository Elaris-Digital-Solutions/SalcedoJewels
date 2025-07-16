# 🚀 Guía de Ejecución Local - Salcedo Jewels

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **Git**

## 🔧 Instalación

### 1. Clonar el repositorio (si no lo tienes)
```bash
git clone <tu-repositorio>
cd SalcedoJewels
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear archivo de configuración
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración para desarrollo local
NODE_ENV=development

# Niubiz Sandbox (para pruebas)
NIUBIZ_MERCHANT_ID=456879852
NIUBIZ_USERNAME=integraciones.visanet@necomplus.com
NIUBIZ_PASSWORD=d5e7nk$M
NIUBIZ_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
T0ZdpX3fpjvgJz6cPrBCIy4dZKwdhs1xxLlrgVneqbr0PQQ7lhN9ajC35C7eWEN
F0fN8R9Xz5eQWs6cCEp9NnRGJJEMxrAKijQN4vqlqk5q3OxPNV98wdHjqG6L
1Mo6YaLN+OuxamL0hQyeZ8dwS94nt6hnC0nNSYEOEr3Z/9oZ2e6M4q9mtUo6K2
xAXiLD4UCwT0Tcs+Y+oBpejbdW6ALD0y5DnudhMv2uv9oC/10Hx0O8WsYgBvWR
m8wmCrY5cIDKW4WiyPigsdkaM4s2NIgxu8CvVkGBy3ADxr1bQac3ZT6j5AGTy
NFwqAZwUyLGTUuWcs5BqjXo9tx3d5XgUjS2Rz0iRf53K72LWsM9VvP7POfH0
-----END PRIVATE KEY-----
NIUBIZ_WEBHOOK_SECRET=dev_webhook_secret_123

# Email (configurar con tus credenciales)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=msalcedojewels@gmail.com
EMAIL_PASS=tu_password_aqui
```

## 🚀 Ejecución

### Opción 1: Ejecutar todo junto (Recomendado)
```bash
npm run dev:full
```

### Opción 2: Ejecutar por separado

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

## 🌐 URLs de Acceso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Endpoints:** http://localhost:3000/api/*

## 🧪 Probar Funcionalidades

### 1. Navegar por la aplicación
- Ir a http://localhost:3000
- Explorar catálogo de productos
- Agregar productos al carrito

### 2. Probar checkout con Niubiz
1. Ir a `/checkout`
2. Completar información del cliente
3. Seleccionar "Tarjeta de Crédito/Débito"
4. Elegir moneda (PEN o USD)
5. Usar tarjetas de prueba:

**Tarjetas de Prueba:**
- **Visa:** 4111111111111111
- **Mastercard:** 5555555555554444
- **American Express:** 378282246310005
- **CVV:** 123
- **Fecha:** Cualquier fecha futura

### 3. Verificar logs
Los logs aparecerán en la terminal donde ejecutaste el servidor.

## 🔍 Debugging

### Verificar que los endpoints funcionan:
```bash
# Probar sesión de Niubiz
curl -X POST http://localhost:3000/api/niubiz-session \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "PEN", "orderId": "test123", "customerEmail": "test@test.com"}'
```

### Logs importantes:
- `[NIUBIZ-SESSION]` - Generación de sesiones
- `[NIUBIZ-PAYMENT]` - Procesamiento de pagos
- `[NIUBIZ-WEBHOOK]` - Webhooks recibidos

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev:full

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint

# Preview de build
npm run preview
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puertos en vite.config.ts y server.js
# O matar procesos en los puertos
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Error: "CORS"
- Verificar que el proxy esté configurado en vite.config.ts
- Verificar que CORS esté habilitado en server.js

### Error: "Niubiz SDK not loaded"
- Verificar conexión a internet
- Verificar que el script de Niubiz se cargue correctamente

## 📱 Funcionalidades Disponibles

✅ **Catálogo de productos**
✅ **Carrito de compras**
✅ **Checkout con múltiples métodos de pago**
✅ **Integración con Niubiz (Sandbox)**
✅ **Envío de emails**
✅ **Subida de imágenes**
✅ **Responsive design**

## 🔒 Seguridad en Desarrollo

- **Sandbox mode:** Todas las transacciones son simuladas
- **No datos reales:** No se procesan pagos reales
- **Logs detallados:** Para debugging
- **Variables de entorno:** Configuración segura

## 📞 Soporte

Si tienes problemas:
1. Verificar logs en la terminal
2. Revisar configuración en `.env`
3. Verificar que todos los puertos estén libres
4. Reinstalar dependencias si es necesario

¡Listo para desarrollar! 🎉 
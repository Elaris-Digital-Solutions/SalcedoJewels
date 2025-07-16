# Configuración de Niubiz para Salcedo Jewels

## Requisitos Previos

1. **Cuenta Comercial con Niubiz**
   - Registrarse en [Niubiz](https://www.niubiz.com.pe/)
   - Obtener credenciales de sandbox y producción
   - Configurar webhooks

2. **Certificado SSL**
   - Tu sitio debe tener HTTPS habilitado
   - Certificado válido para producción

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Niubiz Configuration
NIUBIZ_MERCHANT_ID=456879852
NIUBIZ_USERNAME=integraciones.visanet@necomplus.com
NIUBIZ_PASSWORD=d5e7nk$M
NIUBIZ_PRIVATE_KEY=your_private_key_here
NIUBIZ_WEBHOOK_SECRET=your_webhook_secret_here

# Environment
NODE_ENV=development

# Email Configuration (existing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=msalcedojewels@gmail.com
EMAIL_PASS=your_email_password_here
```

## Configuración de Niubiz

### 1. Credenciales de Sandbox
- **Merchant ID**: 456879852
- **Username**: integraciones.visanet@necomplus.com
- **Password**: d5e7nk$M

### 2. Credenciales de Producción
Obtener de tu cuenta comercial de Niubiz:
- **Merchant ID**: Tu ID de comercio
- **Username**: Tu usuario de Niubiz
- **Password**: Tu contraseña de Niubiz
- **Private Key**: Tu clave privada para firmas

### 3. Configuración de Webhooks
Configurar en tu panel de Niubiz:
- **URL**: `https://tu-dominio.com/api/niubiz-webhook`
- **Secret**: El valor de `NIUBIZ_WEBHOOK_SECRET`

## Endpoints Implementados

### 1. Generar Sesión de Pago
```
POST /api/niubiz-session
```
**Body:**
```json
{
  "amount": 1000,
  "currency": "PEN",
  "orderId": "order_123",
  "customerEmail": "cliente@email.com"
}
```

### 2. Procesar Pago
```
POST /api/niubiz-payment
```
**Body:**
```json
{
  "sessionId": "session_123",
  "transactionToken": "token_123",
  "orderId": "order_123",
  "customerEmail": "cliente@email.com",
  "amount": 1000,
  "currency": "PEN"
}
```

### 3. Webhook de Confirmación
```
POST /api/niubiz-webhook
```
Recibe notificaciones asíncronas de Niubiz sobre el estado de los pagos.

## Tarjetas de Prueba (Sandbox)

### Tarjetas de Crédito
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005

### Datos de Prueba
- **CVV**: 123
- **Fecha de Vencimiento**: Cualquier fecha futura
- **Nombre**: Cualquier nombre

## Estructura de Base de Datos

### Tabla: transactions
```sql
CREATE TABLE transactions (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255),
  authorization_code VARCHAR(255),
  response_code VARCHAR(10),
  response_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Logs y Monitoreo

### Logs de Transacciones
- **Ubicación**: Console logs del servidor
- **Formato**: JSON estructurado
- **Información**: ID de transacción, monto, estado, timestamp

### Logs de Errores
- **Ubicación**: Console logs del servidor
- **Formato**: Error detallado con stack trace
- **Información**: Tipo de error, contexto, timestamp

## Seguridad

### 1. PCI Compliance
- ✅ No se almacenan datos de tarjetas
- ✅ Solo se manejan tokens seguros
- ✅ Comunicación HTTPS obligatoria
- ✅ Validación de firmas en webhooks

### 2. Validaciones
- ✅ Sanitización de inputs
- ✅ Validación de montos
- ✅ Validación de emails
- ✅ Validación de monedas

### 3. Manejo de Errores
- ✅ Logs detallados
- ✅ Mensajes de error seguros
- ✅ Rollback de transacciones fallidas

## Flujo de Pago

1. **Cliente selecciona pago con tarjeta**
2. **Se genera sesión de Niubiz**
3. **Cliente ingresa datos de tarjeta**
4. **Se crea token de transacción**
5. **Se procesa pago en backend**
6. **Se recibe confirmación vía webhook**
7. **Se actualiza estado del pedido**

## Monedas Soportadas

- **PEN** (Soles Peruanos)
- **USD** (Dólares Americanos)

## Próximas Mejoras

1. **Cuotas sin Intereses**
   - Implementar opción de cuotas
   - Configurar plazos disponibles

2. **Múltiples Pasarelas**
   - Integrar Culqi como respaldo
   - Implementar fallback automático

3. **Dashboard de Transacciones**
   - Panel de administración
   - Reportes de ventas
   - Gestión de devoluciones

## Soporte

Para soporte técnico:
- **Email**: soporte@salcedojewels.com
- **WhatsApp**: +51 979 004 991
- **Documentación**: [Niubiz Docs](https://docs.niubiz.com.pe/) 
# PHOB HUB - App de Finanzas Personales y Hogar Inteligente

Monorepo completo con backend (Node.js + Express + PostgreSQL) y frontend (React + Vite) para gestión de finanzas personales y grupos colaborativos.

## 📋 Características

### Autenticación y Seguridad
- ✅ Registro de usuarios con email único
- ✅ Login con JWT (JSON Web Tokens)
- ✅ Contraseñas encriptadas con BCrypt
- ✅ Bloqueo temporal tras 5 intentos fallidos (30 minutos)
- ✅ Validación de datos con express-validator

### Gestión Financiera
- ✅ CRUD completo de transacciones (ingresos/gastos)
- ✅ CRUD de categorías personalizadas por usuario
- ✅ Dashboard con gráficos interactivos (Chart.js)
- ✅ Estadísticas por día/semana/mes/año
- ✅ Totales acumulados: ingresos, gastos y balance
- ✅ Actualización en tiempo real con Socket.IO

### Grupos Colaborativos
- ✅ Crear grupos con meta colectiva
- ✅ Invitar usuarios por email
- ✅ Aceptar/rechazar invitaciones
- ✅ Ver datos agregados del grupo
- ✅ Sistema de modificaciones con aprobación unánime
- ✅ Notificaciones internas

## 🏗️ Estructura del Proyecto

```
PHOB HUB/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración de Knex
│   ├── controllers/              # Controladores de rutas
│   ├── database/
│   │   └── migrations/          # Migraciones de base de datos
│   ├── middleware/              # Middlewares (auth, errorHandler)
│   ├── routes/                  # Definición de rutas
│   ├── services/                # Lógica de negocio
│   ├── knexfile.js              # Configuración de Knex
│   ├── server.js                # Servidor principal
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/          # Componentes reutilizables
    │   ├── config/              # Configuración (API, Socket.IO)
    │   ├── pages/               # Páginas principales
    │   ├── services/            # Servicios API
    │   ├── App.jsx              # Componente principal
    │   └── main.jsx             # Punto de entrada
    └── package.json
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### 1. Configurar Base de Datos

Crea una base de datos PostgreSQL:

```sql
CREATE DATABASE phob_hub;
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend/` basándote en `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=phob_hub

JWT_SECRET=tu_secret_key_super_segura_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

Ejecuta las migraciones:

```bash
npm run migrate
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

Crea un archivo `.env` en la carpeta `frontend/` basándote en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## 🏃 Ejecutar el Proyecto

### Backend

```bash
cd backend
npm start
# o para desarrollo con auto-reload:
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Transacciones
- `GET /api/transactions` - Listar transacciones
- `GET /api/transactions/:id` - Obtener transacción
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Estadísticas
- `GET /api/stats/summary?period=month` - Resumen por período
- `GET /api/stats/totals` - Totales acumulados
- `GET /api/stats/by-category?period=month` - Estadísticas por categoría

### Grupos
- `GET /api/groups` - Listar grupos del usuario
- `GET /api/groups/:id` - Obtener grupo con detalles
- `POST /api/groups` - Crear grupo
- `POST /api/groups/:id/invite` - Invitar usuario
- `POST /api/groups/invitations/:invitationId/respond` - Responder invitación
- `POST /api/groups/:id/modifications` - Proponer modificación
- `POST /api/groups/modifications/:modificationId/respond` - Responder modificación

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas

## 🔐 Autenticación

Todas las rutas (excepto `/api/auth/*`) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 📊 Base de Datos

### Tablas Principales

- `users` - Usuarios del sistema
- `categories` - Categorías de transacciones
- `transactions` - Transacciones financieras
- `groups` - Grupos colaborativos
- `group_members` - Miembros de grupos
- `group_invitations` - Invitaciones a grupos
- `group_modifications` - Modificaciones propuestas
- `modification_approvals` - Aprobaciones de modificaciones
- `notifications` - Notificaciones del sistema

## 🔄 Socket.IO Events

### Cliente → Servidor
- Conexión automática al iniciar sesión

### Servidor → Cliente
- `transaction:created` - Nueva transacción creada
- `transaction:updated` - Transacción actualizada
- `transaction:deleted` - Transacción eliminada
- `group:invitation` - Nueva invitación a grupo
- `group:invitation_response` - Respuesta a invitación
- `group:modification_proposed` - Modificación propuesta
- `group:modification_response` - Respuesta a modificación

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js + Express
- PostgreSQL + Knex.js
- JWT para autenticación
- BCrypt para encriptación
- Socket.IO para tiempo real
- express-validator para validación

### Frontend
- React 19
- Vite
- React Router DOM
- Axios para peticiones HTTP
- Socket.IO Client
- Chart.js + react-chartjs-2 para gráficos

## 📝 Notas Importantes

1. **Seguridad**: Cambia el `JWT_SECRET` en producción por una clave segura y aleatoria.

2. **Base de Datos**: Asegúrate de que PostgreSQL esté corriendo antes de ejecutar las migraciones.

3. **CORS**: El backend está configurado para aceptar peticiones desde `http://localhost:5173`. Ajusta `CORS_ORIGIN` en producción.

4. **Variables de Entorno**: Nunca commitees archivos `.env` con datos sensibles.

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error de migraciones
- Verifica la conexión a la base de datos
- Ejecuta `npm run migrate:rollback` si es necesario
- Revisa los logs de error

### CORS errors en el frontend
- Verifica que `CORS_ORIGIN` en el backend coincida con la URL del frontend
- Revisa que el backend esté corriendo

## 📄 Licencia

ISC

## 👨‍💻 Autor

PHOB HUB - Proyecto de Finanzas Personales y Hogar Inteligente




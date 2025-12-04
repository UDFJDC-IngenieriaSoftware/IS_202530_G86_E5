# 📖 Guía de Uso - PHOB HUB

Esta guía te ayudará a configurar y usar el proyecto PHOB HUB paso a paso.

## 🚀 Configuración Inicial

### Paso 1: Instalar PostgreSQL

Si no tienes PostgreSQL instalado:

**Windows:**
- Descarga desde: https://www.postgresql.org/download/windows/
- Durante la instalación, anota la contraseña del usuario `postgres`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Paso 2: Crear la Base de Datos

Abre una terminal y ejecuta:

```bash
# Conectar a PostgreSQL (puede pedirte la contraseña)
psql -U postgres

# Dentro de psql, ejecuta:
CREATE DATABASE phob_hub;

# Salir de psql
\q
```

### Paso 3: Configurar el Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
# En Windows (PowerShell):
New-Item -Path .env -ItemType File

# En macOS/Linux:
touch .env
```

Abre el archivo `.env` que acabas de crear y agrega:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_NAME=phob_hub

JWT_SECRET=mi_clave_secreta_super_segura_123456789
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

**⚠️ IMPORTANTE:** Reemplaza `tu_contraseña_de_postgres` con la contraseña real de PostgreSQL.

### Paso 4: Ejecutar Migraciones

```bash
# Asegúrate de estar en la carpeta backend
cd backend

# Ejecutar migraciones para crear las tablas
npm run migrate
```

Si todo sale bien, verás un mensaje indicando que las migraciones se ejecutaron correctamente.

### Paso 5: Configurar el Frontend

```bash
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env
# En Windows (PowerShell):
New-Item -Path .env -ItemType File

# En macOS/Linux:
touch .env
```

Abre el archivo `.env` y agrega:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## ▶️ Ejecutar el Proyecto

### Terminal 1 - Backend

```bash
cd backend
npm start
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📡 Socket.IO habilitado
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Deberías ver algo como:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎯 Usar la Aplicación

### 1. Crear una Cuenta

1. Abre tu navegador en `http://localhost:5173`
2. Verás la página de Login
3. Haz clic en "Regístrate aquí"
4. Completa el formulario:
   - **Nombre**: Tu nombre completo
   - **Email**: Un email válido (debe ser único)
   - **Contraseña**: Mínimo 6 caracteres
5. Haz clic en "Registrarse"

### 2. Iniciar Sesión

1. Si ya tienes cuenta, ingresa tu email y contraseña
2. Haz clic en "Iniciar Sesión"
3. Serás redirigido al Dashboard

### 3. Crear Categorías

Antes de crear transacciones, necesitas categorías:

1. En el menú, haz clic en **"Categorías"**
2. Haz clic en **"+ Nueva Categoría"**
3. Completa:
   - **Nombre**: Ej: "Comida", "Salario", "Transporte"
   - **Tipo**: Selecciona "Gasto" o "Ingreso"
   - **Color**: Elige un color (opcional)
4. Haz clic en **"Crear"**

**💡 Tip:** Crea al menos 2-3 categorías de cada tipo para empezar.

### 4. Registrar Transacciones

1. En el menú, haz clic en **"Transacciones"**
2. Haz clic en **"+ Nueva Transacción"**
3. Completa el formulario:
   - **Tipo**: Gasto o Ingreso
   - **Categoría**: Selecciona una categoría del tipo elegido
   - **Monto**: Cantidad (ej: 1500.50)
   - **Fecha**: Selecciona la fecha
   - **Descripción**: Opcional (ej: "Compra en supermercado")
4. Haz clic en **"Crear"**

### 5. Ver el Dashboard

1. En el menú, haz clic en **"Dashboard"**
2. Verás:
   - **Totales**: Ingresos, Gastos y Balance
   - **Gráficos**: Visualización de ingresos vs gastos
   - **Selector de Período**: Día, Semana, Mes, Año

**💡 Tip:** Los gráficos se actualizan automáticamente cuando creas o editas transacciones gracias a Socket.IO.

### 6. Crear un Grupo Colaborativo

1. En el menú, haz clic en **"Grupos"**
2. Haz clic en **"+ Nuevo Grupo"**
3. Completa:
   - **Nombre**: Ej: "Gastos Familiares"
   - **Descripción**: Opcional
   - **Meta Colectiva**: Opcional (ej: 10000)
4. Haz clic en **"Crear"**

### 7. Invitar Usuarios a un Grupo

1. Selecciona un grupo de la lista
2. Haz clic en **"Invitar Usuario"**
3. Ingresa el **email** del usuario que quieres invitar
4. Haz clic en **"Enviar Invitación"**

**⚠️ Nota:** El usuario debe estar registrado en la aplicación.

### 8. Aceptar Invitaciones

1. Si recibes una invitación, aparecerá en la sección **"Notificaciones"**
2. Haz clic en **"Aceptar"** o **"Rechazar"**
3. Si aceptas, verás el grupo en tu lista

### 9. Proponer Modificaciones a un Grupo

Solo los administradores pueden proponer modificaciones:

1. Selecciona un grupo donde seas admin
2. Haz clic en **"Proponer Modificación"**
3. Selecciona el tipo:
   - **Meta Colectiva**: Cambiar el objetivo del grupo
   - **Nombre**: Cambiar el nombre
   - **Descripción**: Cambiar la descripción
4. Ingresa el nuevo valor
5. Haz clic en **"Proponer"**

**⚠️ Importante:** La modificación requiere aprobación unánime de todos los miembros (excepto quien la propone).

## 🔧 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   # Busca "Services" y verifica que "postgresql" esté en ejecución
   
   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Verifica las credenciales en `backend/.env`
3. Verifica que la base de datos exista:
   ```bash
   psql -U postgres -l
   ```

### Error: "Port 3000 already in use"

**Solución:**
1. Cambia el puerto en `backend/.env`:
   ```env
   PORT=3001
   ```
2. Actualiza `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   ```

### Error: "Migration failed"

**Solución:**
1. Verifica la conexión a la base de datos
2. Si hay errores, puedes hacer rollback:
   ```bash
   cd backend
   npm run migrate:rollback
   ```
3. Luego intenta de nuevo:
   ```bash
   npm run migrate
   ```

### No se ven los gráficos en el Dashboard

**Solución:**
1. Asegúrate de tener transacciones registradas
2. Verifica la consola del navegador (F12) por errores
3. Prueba cambiar el período (Día, Semana, Mes, Año)

### Las actualizaciones en tiempo real no funcionan

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica que `VITE_SOCKET_URL` en `frontend/.env` sea correcto
3. Revisa la consola del navegador por errores de conexión

## 📱 Flujo de Trabajo Recomendado

1. **Primera vez:**
   - Crea tu cuenta
   - Crea categorías (al menos 3-5 de cada tipo)
   - Registra algunas transacciones de prueba
   - Explora el Dashboard

2. **Uso diario:**
   - Registra tus ingresos y gastos
   - Revisa el Dashboard para ver tu balance
   - Ajusta categorías según necesites

3. **Trabajo en grupo:**
   - Crea un grupo para gastos compartidos
   - Invita a tus familiares/amigos
   - Cada uno registra sus transacciones
   - Ve los datos agregados del grupo

## 🎓 Consejos Útiles

- **Organiza tus categorías:** Usa nombres claros como "Comida", "Transporte", "Entretenimiento"
- **Registra todo:** Incluso los gastos pequeños suman
- **Revisa regularmente:** El Dashboard te ayuda a ver dónde va tu dinero
- **Usa grupos:** Perfecto para gastos familiares o compartidos con roommates
- **Descripciones:** Agrega descripciones a tus transacciones para recordar mejor

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. Revisa los logs del backend en la terminal
2. Revisa la consola del navegador (F12 → Console)
3. Verifica que todos los servicios estén corriendo
4. Asegúrate de que las variables de entorno estén correctas

¡Disfruta usando PHOB HUB! 🎉




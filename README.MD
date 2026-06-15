# Proyecto MERN SocialNet

Aplicacion web fullstack de red social desarrollada con el stack MERN. Incluye autenticacion con JWT, publicaciones, comentarios, likes, perfiles, grupos, mensajes directos, subida de medios, logros, recompensas, deteccion de imagenes generadas por IA y salas en vivo con Socket.IO/WebRTC.

## Caracteristicas

- Registro e inicio de sesion con JWT y refresh token
- CRUD de publicaciones con comentarios y likes
- Perfil de usuario y configuracion
- Grupos con chat en tiempo real
- Mensajes directos
- Subida y consulta de medios
- Secciones de logros, recompensas y empresas
- Deteccion de imagenes generadas por IA
- Salas en vivo y senalizacion con Socket.IO

## Estructura del proyecto

El repositorio esta dividido en dos aplicaciones:

- `Backend/`: API Express, MongoDB y Socket.IO
- `Frontend/`: SPA en React con Vite

## Requisitos previos

- Node.js 18 o superior
- npm
- MongoDB local o MongoDB Atlas

## Instalacion

### 1. Backend

```bash
cd Backend
npm install
```

Crea un archivo `.env` en `Backend/` con las variables necesarias. Las mas usadas por el proyecto son:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/socialnet
JWT_SECRET=tu_jwt_secret
JWT_REFRESH_SECRET=tu_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
USE_HTTPS=false
HUGGINGFACE_API_KEY=tu_api_key_opcional
```

### 2. Frontend

```bash
cd Frontend
npm install
```

Opcionalmente, puedes crear `.env` en `Frontend/` para forzar URLs o HTTPS local:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_BACKEND_HOST=localhost
VITE_DEV_HOST=localhost
VITE_HTTPS_CERT=./certs/localhost.pem
VITE_HTTPS_KEY=./certs/localhost-key.pem
```

## Ejecucion

En dos terminales separadas:

### Backend

```bash
cd Backend
npm run dev
```

### Frontend

```bash
cd Frontend
npm run dev
```

Si necesitas trabajar con HTTPS local en el frontend, puedes usar:

```bash
cd Frontend
npm run https
```

## Scripts utiles

### Backend

- `npm run dev`: inicia el servidor con nodemon
- `npm start`: inicia el servidor en produccion
- `npm run mkcert`: genera certificados locales
- `npm run update`: actualiza dependencias y vuelve a levantar el backend

### Frontend

- `npm run dev`: inicia Vite
- `npm run https`: genera certificados locales y levanta Vite en HTTPS
- `npm run generate-cert`: genera certificado autofirmado
- `npm run mkcert`: genera certificados con mkcert
- `npm run update`: actualiza dependencias e informacion importante
- `npm run build`: compila la aplicacion
- `npm run lint`: ejecuta ESLint
- `npm run test`: ejecuta Vitest

## Rutas principales del backend

- `/api/v1/auth`
- `/api/v1/posts`
- `/api/v1/users`
- `/api/v1/groups`
- `/api/v1/messages`
- `/api/v1/enterprises`
- `/api/v1/achievements`
- `/api/v1/ai-detection`
- `/api/v1/media`
- `/health`

## Pantallas principales del frontend

- Inicio / panel principal
- Creacion de cuenta y acceso
- Mensajes directos
- Lapses / shorts
- Logros
- Recompensas
- Perfil
- Configuracion
- Reproductor de video
- Sala en vivo

## Autor

Elian Fernando Hernandez Guillen

## Colaboradores

Lluvia Milagros Valdez Rodrigez
Angel Daniel Morales Perez
Abigail Salazar Sandoval
Brisa Daney Gonzales espinoza

# 🎬 AhaTok - Descargador de Videos PWA

Progressive Web App para descargar videos de TikTok, Instagram y Facebook.

## 🚀 Ejecutar en Local

### Opción 1: Script Automático (Recomendado)

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

El script detectará automáticamente si tienes Python o Node.js instalado y usará el servidor correspondiente.

### Opción 2: Python (si está instalado)

```bash
python server.py
```

O con Python 3:
```bash
python3 server.py
```

Luego abre tu navegador en: `http://localhost:8000`

### Opción 3: Node.js (si está instalado)

```bash
node server.js
```

Luego abre tu navegador en: `http://localhost:8000`

### Opción 4: Extensión Live Server (VS Code)

1. Instala la extensión **"Live Server"** en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona **"Open with Live Server"**

### Opción 5: Servidor HTTP Simple

Si tienes PHP instalado:
```bash
php -S localhost:8000
```

## 📋 Requisitos Previos

- **Python 3.x** O **Node.js** (para los servidores incluidos)
- O cualquier servidor HTTP local

## ⚙️ Configuración

### 1. Firebase (Autenticación y Base de Datos)

#### Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Authentication**:
   - Ve a Authentication > Sign-in method
   - Habilita **Google** y **Email/Password**
4. Habilita **Firestore Database**:
   - Ve a Firestore Database > Crear base de datos
   - Inicia en modo de prueba (para desarrollo)
   - Selecciona una ubicación

#### Paso 2: Obtener credenciales

1. Ve a Configuración del proyecto (⚙️) > Tus apps
2. Si no tienes una app web, haz clic en `</>` para agregar una
3. Copia las credenciales que aparecen

#### Paso 3: Configurar en AhaTok

Edita `app.js` (líneas 1-8) y reemplaza con tus credenciales:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

#### Paso 4: Configurar reglas de Firestore

En Firebase Console > Firestore Database > Reglas, usa:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /history/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**⚠️ IMPORTANTE:** Estas reglas permiten que los usuarios solo vean su propio historial.

### 2. Backend API (Render)

#### Opción A: Usar API existente

Si ya tienes una API en Render, solo actualiza la URL en `app.js` (línea ~55):

```javascript
const response = await fetch('https://tu-api.onrender.com/api/fetch', {
```

#### Opción B: Crear nueva API en Render

1. Crea un repositorio con tu backend (Node.js, Python, etc.)
2. En [Render](https://render.com/), crea un nuevo **Web Service**
3. Conecta tu repositorio
4. Configura el comando de inicio
5. La API debe aceptar POST en `/api/fetch` con:

**Request:**
```json
{
  "url": "https://www.tiktok.com/@user/video/123456"
}
```

**Response:**
```json
{
  "thumbnail": "https://example.com/thumb.jpg",
  "720p": "https://example.com/video_720p.mp4",
  "1080p": "https://example.com/video_1080p.mp4",
  "audio": "https://example.com/audio.mp3",
  "title": "Título del video"
}
```

**Nota:** Render en plan gratuito puede tardar unos segundos en "despertar". La app tiene un timeout de 30 segundos.

### 3. Iconos de la PWA

Crea los siguientes archivos de iconos:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

**Herramientas recomendadas:**
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Cualquier editor de imágenes (Photoshop, GIMP, Canva)

## 🌐 Acceso

Una vez iniciado el servidor, abre tu navegador en:

**http://localhost:8000**

## 📱 Instalar como PWA

1. Abre la aplicación en Chrome/Edge
2. Haz clic en el icono de "Instalar" en la barra de direcciones
3. O ve a Menú → "Instalar AhaTok"

## 🛠️ Desarrollo

- **HTML**: `index.html`
- **CSS**: `style.css`
- **JavaScript**: `app.js`
- **Service Worker**: `sw.js`
- **Manifest**: `manifest.json`

## 📝 Notas

- El Service Worker requiere HTTPS o localhost para funcionar
- Para producción, despliega en un servidor con HTTPS
- Los anuncios intersticiales se muestran antes de descargas 1080p

## 🐛 Solución de Problemas

**El Service Worker no se registra:**
- Asegúrate de estar usando `http://localhost` (no `file://`)
- Verifica que el archivo `sw.js` esté en la raíz del proyecto

**Error de CORS:**
- El servidor incluido ya tiene headers CORS configurados
- Si usas otro servidor, asegúrate de configurar CORS

**Firebase no funciona:**
- Verifica que las credenciales estén correctas
- Asegúrate de que Firebase Auth y Firestore estén habilitados en tu proyecto

---

Desarrollado con ❤️ para descargar videos fácilmente


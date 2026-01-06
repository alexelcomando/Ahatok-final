# ✅ Checklist: Desplegar AhaTok en la Web

## 🔴 CRÍTICO - Debe estar listo para funcionar

### 1. ✅ Firebase - YA CONFIGURADO
- [x] Credenciales de Firebase configuradas en `app.js`
- [ ] **Verificar que Authentication esté habilitado:**
  - Ve a [Firebase Console](https://console.firebase.google.com/)
  - Proyecto: `app-ahatok`
  - Authentication > Sign-in method
  - Habilita **Google** y **Email/Password**
- [ ] **Verificar que Firestore esté habilitado:**
  - Firestore Database > Crear base de datos (si no existe)
  - Configurar reglas de seguridad (ver abajo)

### 2. 🔴 Backend API (Render) - FALTA
- [ ] **Crear o verificar API en Render:**
  - URL actual: `https://mi-api-ahatok.onrender.com/api/fetch`
  - Debe aceptar POST con: `{ "url": "..." }`
  - Debe devolver: `{ "thumbnail": "...", "720p": "...", "1080p": "...", "audio": "..." }`
- [ ] **Si no tienes backend, opciones:**
  1. Crear tu propio backend en Render/Heroku/Vercel
  2. Usar una API pública existente
  3. Actualizar la URL en `app.js` línea 75

### 3. 🔴 Iconos de la PWA - FALTA
- [ ] Crear `icon-192.png` (192x192px)
- [ ] Crear `icon-512.png` (512x512px)
- **Herramientas:**
  - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
  - [RealFaviconGenerator](https://realfavicongenerator.net/)
  - Cualquier editor de imágenes

---

## 🟡 IMPORTANTE - Para producción

### 4. Configurar Firestore Rules
En Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /history/{document=**} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                   request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Crear Índice Compuesto en Firestore
1. Ve a Firestore Database > Índices
2. Crea índice compuesto:
   - Colección: `history`
   - Campos: `userId` (Ascendente), `timestamp` (Descendente)

---

## 🟢 OPCIONAL - Mejoras

### 6. Desplegar en la Web
**Opciones de hosting:**

#### Opción A: Firebase Hosting (Recomendado - GRATIS)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Selecciona: public directory = . (o crea una carpeta dist)
# Configura: single-page app = Yes
firebase deploy
```

#### Opción B: Vercel (GRATIS)
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Deploy automático

#### Opción C: Netlify (GRATIS)
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto
3. O conecta con GitHub

#### Opción D: GitHub Pages
1. En GitHub: Settings > Pages
2. Source: main branch
3. Folder: /root

### 7. Dominio Personalizado (Opcional)
- Configurar dominio en Firebase Hosting/Vercel/Netlify
- Actualizar `manifest.json` con la URL correcta

---

## 🚀 Pasos Rápidos para Desplegar

### Paso 1: Verificar Firebase (5 min)
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Proyecto: `app-ahatok`
3. Verifica Authentication y Firestore

### Paso 2: Crear Iconos (10 min)
- Usa cualquier herramienta online o editor
- Guarda como `icon-192.png` y `icon-512.png`

### Paso 3: Backend API (Variable)
- Si ya tienes API: verifica que funcione
- Si no: crea una o usa una existente

### Paso 4: Desplegar (10 min)
- Usa Firebase Hosting (más fácil)
- O Vercel/Netlify

---

## 📝 Notas Importantes

- **HTTPS es obligatorio** para PWA y Service Workers
- Firebase Hosting incluye HTTPS automático
- El Service Worker solo funciona con HTTPS o localhost
- Los iconos son necesarios para que la PWA sea instalable

---

## ✅ Estado Actual

- ✅ Código completo y funcional
- ✅ Firebase configurado (verificar habilitación)
- 🔴 Backend API pendiente
- 🔴 Iconos pendientes
- 🔴 Despliegue pendiente


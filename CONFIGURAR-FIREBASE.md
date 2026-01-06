# 🔐 Configurar Firebase para Login

## ✅ Estado Actual

Firebase **YA está configurado** con credenciales reales en `app.js`, pero hay que verificar que esté habilitado correctamente.

## 🔍 Verificar Configuración de Firebase

### Paso 1: Abrir Firebase Console

Ve a: https://console.firebase.google.com/project/app-ahatok

### Paso 2: Habilitar Authentication

1. En el menú lateral, ve a **"Authentication"**
2. Haz clic en **"Get started"** (si es la primera vez)
3. Ve a la pestaña **"Sign-in method"**
4. Habilita los siguientes métodos:

   **Google:**
   - Haz clic en "Google"
   - Activa el toggle
   - Ingresa un email de soporte
   - Guarda

   **Email/Password:**
   - Haz clic en "Email/Password"
   - Activa el toggle "Enable"
   - Guarda

### Paso 3: Habilitar Firestore Database

1. En el menú lateral, ve a **"Firestore Database"**
2. Si no existe, haz clic en **"Create database"**
3. Selecciona modo: **"Start in test mode"** (para desarrollo)
4. Elige una ubicación (la más cercana a ti)
5. Haz clic en **"Enable"**

### Paso 4: Configurar Reglas de Firestore

1. Ve a **Firestore Database** > **Rules**
2. Reemplaza las reglas con:

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

3. Haz clic en **"Publish"**

## 🧪 Probar el Login

1. **Abre la aplicación** en http://localhost:8000
2. **Haz clic en "Iniciar Sesión"** (botón en la esquina superior derecha)
3. **Deberías ver un modal** con opciones:
   - Continuar con Google
   - Continuar con Email

### Probar Login con Google

1. Haz clic en **"Continuar con Google"**
2. Se abrirá una ventana de Google
3. Selecciona tu cuenta
4. Acepta los permisos
5. Deberías estar logueado

### Probar Login con Email

1. Haz clic en **"Continuar con Email"**
2. Ingresa tu email y contraseña
3. Si no tienes cuenta, haz clic en **"Regístrate"**
4. Crea una cuenta nueva
5. Deberías estar logueado

## ✅ Verificar que Funciona

Después de hacer login:

1. **El botón debería cambiar** a mostrar tu email o nombre
2. **Puedes acceder al historial** desde el menú lateral
3. **Las descargas se guardarán** en Firestore

## 🐛 Solución de Problemas

### "Firebase no configurado"
- Abre la consola del navegador (F12)
- Verifica que no haya errores de Firebase
- Asegúrate de que las credenciales en `app.js` sean correctas
### "Error al iniciar sesión con Google"
- Verifica que Google esté habilitado en Firebase Console
- Verifica que el email de soporte esté configurado

### "Error al crear cuenta"
- Verifica que Email/Password esté habilitado
- Verifica que la contraseña tenga al menos 6 caracteres

### "No puedo ver el historial"
- Verifica que Firestore esté creado
- Verifica que las reglas de Firestore estén configuradas
- Verifica que estés logueado

## 📝 Notas Importantes

- **Modo de prueba:** Firestore en modo test permite lectura/escritura por 30 días
- **Para producción:** Configura reglas más estrictas
- **Credenciales:** Ya están configuradas en `app.js`, no necesitas cambiarlas

---

**¡Una vez configurado, el login debería funcionar perfectamente!** 🔐


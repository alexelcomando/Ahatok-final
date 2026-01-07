# ✅ Guía de Pruebas - AhaTok Completo

## 🎯 Estado Actual

- ✅ **Backend:** https://ahatok-api.onrender.com (Funcionando)
- ✅ **Frontend:** https://ahatok-final.vercel.app (Desplegado)
- ✅ **Firebase:** Configurado y funcionando
- ✅ **Login:** Funcionando (después de autorizar dominio)

## 🧪 Pruebas a Realizar

### 1. ✅ Backend - Health Check

**URL:** https://ahatok-api.onrender.com/

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "AhaTok API está funcionando",
  "endpoint": "/api/fetch"
}
```

✅ **Ya confirmado - Funciona**

---

### 2. 🧪 Backend - Probar Descarga

**Método: PowerShell**
```powershell
curl -X POST https://ahatok-api.onrender.com/api/fetch -H "Content-Type: application/json" -d "{\"url\":\"https://www.tiktok.com/@valeng222/video/759024630752\"}"
```

**O con Postman:**
- POST: `https://ahatok-api.onrender.com/api/fetch`
- Body: `{"url": "https://www.tiktok.com/@valeng222/video/759024630752"}`

**Resultado esperado:**
```json
{
  "thumbnail": "https://...",
  "720p": "https://...",
  "1080p": "https://...",
  "audio": "https://...",
  "title": "..."
}
```

---

### 3. 🌐 Frontend - Probar desde la App

1. **Abre:** https://ahatok-final.vercel.app
2. **Abre la consola** (F12)
3. **Pega una URL de TikTok**
4. **Haz clic en "Descargar"**
5. **Observa:**
   - ¿Se envía la petición?
   - ¿Qué respuesta recibe?
   - ¿Aparece el spinner?
   - ¿Se muestra la miniatura?

---

### 4. 🔐 Login - Verificar

1. **Haz clic en "Iniciar Sesión"**
2. **Prueba con Google:**
   - Debe abrir ventana de Google
   - Después de autorizar, debe cerrar el modal
   - El botón debe mostrar tu nombre/email
3. **Prueba con Email:**
   - Crea una cuenta nueva
   - O inicia sesión si ya tienes

---

### 5. 📥 Historial - Verificar

1. **Después de hacer login**
2. **Abre el menú lateral** (☰)
3. **Click en "Historial"**
4. **Deberías ver:**
   - Lista de videos descargados
   - O mensaje "No hay descargas en el historial"

---

### 6. 🎬 Descarga Completa - Flujo End-to-End

1. **Pega una URL de TikTok**
2. **Haz clic en "Descargar"**
3. **Espera** a que procese (puede tardar 10-30 segundos)
4. **Deberías ver:**
   - Miniatura del video
   - Botones: 720p, 1080p (Pro), Audio MP3
5. **Haz clic en "720p"**
   - Debe abrir la descarga directamente
6. **Haz clic en "1080p (Pro)"**
   - Debe mostrar anuncio primero
   - Después de 5 segundos, descarga
7. **Verifica el historial**
   - El video debe aparecer en el historial

---

## 🐛 Problemas Comunes y Soluciones

### Error: "No se pudo obtener el video de TikTok"

**Causas posibles:**
1. APIs de scraping bloqueadas o caídas
2. URL de TikTok inválida o privada
3. Timeout del servidor

**Soluciones:**
- Prueba con otra URL de TikTok
- Prueba con Instagram o Facebook
- Verifica logs del backend en Render
- Espera unos segundos (Render free tier puede tardar)

### Error: CORS

**Solución:**
- El backend ya tiene CORS configurado
- Si persiste, verifica que el backend esté usando `app.use(cors())`

### Error: Timeout

**Solución:**
- Render free tier puede tardar 30 segundos en responder
- El frontend tiene timeout de 30 segundos
- Si tarda más, el backend puede estar fallando

---

## 📊 Checklist Final

- [ ] Backend responde en `/`
- [ ] Backend procesa videos en `/api/fetch`
- [ ] Frontend se comunica con backend
- [ ] Login funciona (Google y Email)
- [ ] Historial funciona
- [ ] Descarga de videos funciona
- [ ] Anuncio intersticial funciona (1080p)
- [ ] Service Worker funciona (PWA)

---

## 🎯 Próximos Pasos

1. **Probar el endpoint directamente** con curl/Postman
2. **Probar desde el frontend** y ver errores en consola
3. **Verificar logs del backend** en Render si hay problemas
4. **Mejorar métodos de scraping** si las APIs fallan

---

**¿Puedes probar el endpoint `/api/fetch` directamente y decirme qué respuesta obtienes?** 🧪


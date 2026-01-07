# ✅ Prueba Completa - AhaTok

## 🎯 Estado Actual

- ✅ **Backend:** Funcionando en Render
- ✅ **Frontend:** Desplegado en Vercel
- ✅ **Firebase:** Configurado
- ✅ **Health Check:** Responde correctamente

## 🧪 Pruebas a Realizar

### 1. Probar Backend Directamente

**Abre en el navegador:**
```
https://ahatok-api.onrender.com/
```

**Deberías ver:**
```json
{
  "status": "ok",
  "message": "AhaTok API está funcionando",
  "endpoint": "/api/fetch"
}
```

✅ **Confirmado - Ya funciona**

### 2. Probar Endpoint de Descarga

**Opción A: Con curl (en PowerShell)**
```powershell
curl -X POST https://ahatok-api.onrender.com/api/fetch -H "Content-Type: application/json" -d '{\"url\":\"https://www.tiktok.com/@valeng222/video/759024630752\"}'
```

**Opción B: Con Postman/Thunder Client**
- Method: POST
- URL: `https://ahatok-api.onrender.com/api/fetch`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "url": "https://www.tiktok.com/@valeng222/video/759024630752"
}
```

**Respuesta esperada:**
```json
{
  "thumbnail": "https://...",
  "720p": "https://...",
  "1080p": "https://...",
  "audio": "https://...",
  "title": "..."
}
```

### 3. Verificar URL en Frontend

Abre la consola del navegador (F12) en:
```
https://ahatok-final.vercel.app
```

Verifica que la URL del backend sea correcta:
- Debe ser: `https://ahatok-api.onrender.com/api/fetch`

### 4. Probar desde el Frontend

1. **Abre:** https://ahatok-final.vercel.app
2. **Pega una URL de TikTok:**
   ```
   https://www.tiktok.com/@valeng222/video/759024630752
   ```
3. **Haz clic en "Descargar"**
4. **Observa la consola (F12)** para ver:
   - ¿La petición se envía?
   - ¿Qué respuesta recibe?
   - ¿Hay errores de CORS?

### 5. Verificar CORS

Si hay errores de CORS en la consola, el backend necesita permitir el dominio de Vercel.

**Verificar en `backend/index.js`:**
```javascript
app.use(cors()); // Ya está configurado ✅
```

Esto debería permitir todos los orígenes.

---

## 🐛 Solución de Problemas

### Error: "No se pudo obtener el video de TikTok"

**Posibles causas:**

1. **APIs de scraping bloqueadas o no funcionan**
   - Las APIs públicas pueden estar caídas
   - Pueden tener límites de rate
   - Pueden estar bloqueando requests desde Render

2. **Timeout muy corto**
   - Render free tier puede tardar en responder
   - El frontend tiene timeout de 30 segundos

3. **URL del backend incorrecta**
   - Verifica que sea: `https://ahatok-api.onrender.com/api/fetch`

**Soluciones:**

1. **Probar con otra URL de TikTok** (algunas pueden estar bloqueadas)
2. **Verificar logs del backend en Render:**
   - Ve a Render Dashboard
   - Click en tu servicio
   - Ve a "Logs"
   - Verifica qué errores aparecen

3. **Probar con Instagram o Facebook** para ver si el problema es específico de TikTok

---

## ✅ Checklist de Verificación

- [ ] Backend responde en `/`
- [ ] Backend responde en `/api/fetch` (probar con curl/Postman)
- [ ] Frontend puede comunicarse con backend (sin errores CORS)
- [ ] Login funciona (después de autorizar dominio)
- [ ] Descarga de videos funciona
- [ ] Historial funciona (si estás logueado)

---

## 🎯 Próximos Pasos

1. **Probar el endpoint directamente** con curl/Postman
2. **Verificar logs del backend** en Render
3. **Probar desde el frontend** y ver errores en consola
4. **Si las APIs fallan**, podemos mejorar los métodos de scraping

---

**¿Puedes probar el endpoint `/api/fetch` directamente con curl o Postman y decirme qué respuesta obtienes?** 🧪


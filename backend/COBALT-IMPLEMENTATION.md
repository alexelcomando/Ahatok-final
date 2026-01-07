# 🚀 Implementación con Cobalt API - Backend AhaTok

## ✅ Implementación Completa

Se ha reescrito completamente el backend para usar **Cobalt API** como método principal, con múltiples fallbacks específicos por plataforma.

## 🎯 Características

### ✅ Cobalt API (Método Principal)
- **API pública y confiable** que soporta múltiples plataformas
- Funciona con TikTok, Instagram, Facebook y más
- Obtiene videos en la mejor calidad disponible
- Extrae audio, thumbnail y título

### ✅ Métodos Específicos por Plataforma (Fallbacks)

#### TikTok
- **API Tiklydown** - Videos sin marca de agua
- **API Snaptik** - Método alternativo
- Prioriza videos sin marca de agua

#### Instagram
- **API SaveIG** - Método principal
- **Scraping directo** - Fallback si la API falla

#### Facebook
- **Scraping directo** del HTML
- ⚠️ Nota: Facebook tiene restricciones estrictas

## 📦 Dependencias

### ✅ NO necesitas instalar dependencias adicionales

El código usa solo las dependencias que ya tienes:

```json
{
  "express": "^4.18.2",    // ✅ Ya incluido
  "cors": "^2.8.5",        // ✅ Ya incluido
  "axios": "^1.6.0"        // ✅ Ya incluido
}
```

**Cobalt API es una API pública** que se consume con `axios`, no requiere librerías adicionales.

## 🔄 Flujo de Procesamiento

1. **Intenta Cobalt API primero** (más confiable y universal)
2. **Si falla**, usa métodos específicos por plataforma:
   - TikTok → APIs especializadas sin marca de agua
   - Instagram → API SaveIG o scraping
   - Facebook → Scraping directo
3. **Valida** que se obtenga al menos una URL de video
4. **Formatea** la respuesta según la estructura requerida

## 📋 Estructura de Respuesta Garantizada

```json
{
  "thumbnail": "URL o null",
  "720p": "URL del video (mejor disponible)",
  "1080p": "URL del video (mejor disponible)",
  "audio": "URL del audio o null",
  "title": "Título del video"
}
```

## 🧪 Probar

### Localmente

```bash
cd backend
npm install  # (si aún no lo has hecho)
node index.js
```

### Probar el endpoint

```bash
# Health check
curl http://localhost:3000/

# Probar con TikTok
curl -X POST http://localhost:3000/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@user/video/123"}'

# Probar con Instagram
curl -X POST http://localhost:3000/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/reel/ABC123/"}'
```

## 🚀 Desplegar en Render

1. **Build Command:** `cd backend && npm install`
2. **Start Command:** `cd backend && npm start`

Render instalará automáticamente las dependencias (express, cors, axios).

## ⚠️ Notas Importantes

### Cobalt API
- Es una API pública gratuita
- Puede tener límites de rate
- Si falla, automáticamente usa métodos alternativos

### TikTok sin Marca de Agua
- Prioriza APIs que ofrecen videos sin marca de agua
- Si no está disponible, usa la mejor calidad disponible

### Timeouts
- Cobalt API: 30 segundos (para Render free tier)
- Métodos alternativos: 20 segundos
- El frontend tiene timeout de 30 segundos configurado

## 🔧 Personalización

Si necesitas cambiar las APIs:

- **Cobalt API:** Línea ~40 en `index.js`
- **TikTok:** Líneas ~80-140
- **Instagram:** Líneas ~150-210
- **Facebook:** Líneas ~220-250

## ✅ Ventajas de esta Implementación

1. **Más confiable:** Cobalt API es muy estable
2. **Múltiples fallbacks:** Si un método falla, intenta otros
3. **Sin marca de agua:** Prioriza videos sin marca de agua en TikTok
4. **Universal:** Cobalt funciona con múltiples plataformas
5. **Compatible con Render:** Timeouts y configuración optimizados

---

**¡El backend está completamente actualizado y listo para usar!** 🎉



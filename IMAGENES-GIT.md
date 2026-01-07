# 📸 Guía: Subir Imágenes a Git y Vercel

## ✅ Forma Correcta de Subir Imágenes

### 1. **Agregar imágenes al repositorio Git**

```bash
# Agregar todas las imágenes
git add imagenes/

# Verificar que se agregaron
git status imagenes/

# Hacer commit
git commit -m "Add: Agregar imágenes e iconos"

# Subir a GitHub
git push
```

### 2. **Verificar que las imágenes estén en Git**

```bash
# Ver qué archivos están trackeados
git ls-files imagenes/
```

Deberías ver:
- `imagenes/Logos/Application logo.png`
- `imagenes/iconos/tik tok icon.webp`
- `imagenes/iconos/Instagram icon.jpg`
- `imagenes/iconos/facebook icon.webp`

### 3. **Vercel despliega automáticamente**

Una vez que las imágenes estén en GitHub, Vercel las desplegará automáticamente en el próximo deploy.

## ⚠️ Problemas Comunes

### Problema: Las imágenes no se ven en Vercel

**Causa:** Las imágenes no están en el repositorio Git.

**Solución:**
1. Verifica que las imágenes estén agregadas: `git ls-files imagenes/`
2. Si no aparecen, agrégalas: `git add imagenes/`
3. Haz commit y push: `git commit -m "Add images" && git push`

### Problema: Archivos muy grandes

Si las imágenes son muy grandes (>50MB), Git puede tener problemas. Considera:
- Optimizar las imágenes antes de subirlas
- Usar formatos comprimidos (WebP, JPEG optimizado)
- Reducir el tamaño de las imágenes

## 📝 Nota sobre Nombres con Espacios

Los nombres con espacios funcionan, pero requieren codificación URL (`%20`). 

**Alternativa recomendada:** Renombrar sin espacios:
- `Application logo.png` → `application-logo.png`
- `tik tok icon.webp` → `tiktok-icon.webp`

Esto evita problemas y hace las URLs más limpias.

## ✅ Checklist

- [ ] Imágenes agregadas a Git (`git add imagenes/`)
- [ ] Commit realizado (`git commit`)
- [ ] Push a GitHub (`git push`)
- [ ] Vercel desplegó automáticamente
- [ ] Imágenes visibles en la app desplegada


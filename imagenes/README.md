# 📁 Carpeta de Imágenes

Esta carpeta contiene todas las imágenes que se utilizan en el proyecto AhaTok.

## 📋 Estructura Recomendada

```
imagenes/
├── logos/          # Logos de redes sociales y la app
├── iconos/         # Iconos de la interfaz
├── banners/        # Banners y anuncios
└── thumbnails/    # Miniaturas por defecto
```

## 🖼️ Tipos de Imágenes

### Logos de Redes Sociales
- `tiktok-logo.png` o `.svg`
- `instagram-logo.png` o `.svg`
- `facebook-logo.png` o `.svg`

### Iconos de la App
- Iconos para el menú
- Iconos de calidad de video
- Iconos de descarga

### Otros
- Favicon
- Imágenes de placeholder
- Banners publicitarios

## 📝 Notas

- **Formatos recomendados:** PNG, SVG, WebP
- **Tamaños:** Optimiza las imágenes para web
- **Nombres:** Usa nombres descriptivos en minúsculas con guiones (ej: `tiktok-logo.svg`)

## 🔗 Uso en el Código

Para usar las imágenes en el HTML/CSS:

```html
<img src="imagenes/logos/tiktok-logo.svg" alt="TikTok">
```

```css
background-image: url('imagenes/banners/ad-banner.png');
```


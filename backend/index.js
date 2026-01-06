/**
 * Backend API para AhaTok - Render
 * Endpoint: /api/fetch
 * Procesa URLs de TikTok, Instagram y Facebook
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Permite requests desde cualquier origen (necesario para PWA)
app.use(express.json()); // Parsea JSON en el body

// El servidor DEBE usar la variable de entorno PORT que Render le da
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AhaTok API está funcionando',
        endpoint: '/api/fetch'
    });
});

// Endpoint principal para procesar videos
app.post('/api/fetch', async (req, res) => {
    const { url } = req.body;

    // Validar que se envió una URL
    if (!url) {
        return res.status(400).json({
            error: 'URL es requerida',
            message: 'Debes enviar una URL en el body: { "url": "..." }'
        });
    }

    try {
        // TODO: Aquí va tu lógica para obtener el video
        // Puedes usar librerías como:
        // - yt-dlp (Python)
        // - ytdl-core (Node.js)
        // - tiktok-scraper
        // - instagram-scraper

        // Por ahora, retornamos un ejemplo de estructura
        // REEMPLAZA ESTO con tu lógica real de scraping

        console.log(`Procesando URL: ${url}`);

        // Ejemplo de respuesta (ESTRUCTURA REQUERIDA)
        const response = {
            thumbnail: "https://example.com/thumbnail.jpg",
            "720p": "https://example.com/video_720p.mp4",
            "1080p": "https://example.com/video_1080p.mp4",
            audio: "https://example.com/audio.mp3",
            title: "Video de TikTok"
        };

        // LA RESPUESTA DEBE SER EXACTAMENTE ESTA ESTRUCTURA
        res.json(response);

    } catch (error) {
        console.error('Error al procesar video:', error);
        res.status(500).json({
            error: "Error al procesar el video",
            message: error.message || "Error desconocido"
        });
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor AhaTok API activo en el puerto ${PORT}`);
    console.log(`📍 Endpoint: http://0.0.0.0:${PORT}/api/fetch`);
});


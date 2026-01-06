/**
 * Backend API para AhaTok - Render
 * Endpoint: /api/fetch
 * Procesa URLs de TikTok, Instagram y Facebook
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors()); // Permite requests desde cualquier origen (necesario para PWA)
app.use(express.json()); // Parsea JSON en el body

// El servidor DEBE usar la variable de entorno PORT que Render le da
const PORT = process.env.PORT || 3000;

// Detectar tipo de red social
function detectSocialNetwork(url) {
    if (/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(url)) {
        return 'tiktok';
    }
    if (/instagram\.com\/(p|reel|tv)/i.test(url)) {
        return 'instagram';
    }
    if (/facebook\.com.*\/videos\//i.test(url)) {
        return 'facebook';
    }
    return 'unknown';
}

// Procesar video de TikTok
async function processTikTok(url) {
    try {
        // Opción 1: Usar API pública de TikTok
        const apiUrl = `https://api16-normal-useast5.us.tiktokv.com/aweme/v1/feed/?aweme_id=${extractTikTokId(url)}`;

        // Intentar con API directa
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.tiktok.com/'
            },
            timeout: 10000
        });

        if (response.data && response.data.aweme_list && response.data.aweme_list[0]) {
            const video = response.data.aweme_list[0];
            const videoInfo = video.video;
            const playAddr = videoInfo.play_addr;

            // Obtener la mejor calidad disponible
            const videoUrl = playAddr.url_list && playAddr.url_list[0]
                ? playAddr.url_list[0]
                : playAddr.url_list[playAddr.url_list.length - 1];

            return {
                thumbnail: video.video.cover.url_list[0] || video.video.origin_cover.url_list[0],
                "720p": videoUrl,
                "1080p": videoUrl, // TikTok generalmente no diferencia calidades
                audio: video.music.play_url.url_list[0] || null,
                title: video.desc || video.share_info.share_title || "Video de TikTok"
            };
        }
    } catch (error) {
        console.log('Error con API directa, intentando método alternativo...');
    }

    // Opción 2: Usar API alternativa
    try {
        const apiResponse = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (apiResponse.data && apiResponse.data.video) {
            return {
                thumbnail: apiResponse.data.cover || apiResponse.data.thumbnail || null,
                "720p": apiResponse.data.video.noWatermark || apiResponse.data.video.watermark || apiResponse.data.video,
                "1080p": apiResponse.data.video.noWatermark || apiResponse.data.video.watermark || apiResponse.data.video,
                audio: apiResponse.data.music || null,
                title: apiResponse.data.title || apiResponse.data.desc || "Video de TikTok"
            };
        }
    } catch (error) {
        console.log('Error con API alternativa:', error.message);
    }

    throw new Error('No se pudo obtener el video de TikTok');
}

// Extraer ID de TikTok
function extractTikTokId(url) {
    const match = url.match(/\/(\d+)(?:\?|$)/);
    return match ? match[1] : null;
}

// Procesar video de Instagram
async function processInstagram(url) {
    try {
        // Usar API pública de Instagram
        const apiUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
        const embedResponse = await axios.get(apiUrl, { timeout: 10000 });

        // Para obtener el video real, necesitamos hacer scraping adicional
        // Usar API alternativa
        const downloadResponse = await axios.get(`https://api.saveig.app/api/ajaxSearch`, {
            params: {
                q: url,
                t: 'media',
                lang: 'es'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 15000
        });

        if (downloadResponse.data && downloadResponse.data.data) {
            const data = downloadResponse.data.data;
            const videoUrl = data.video || data.videos?.[0]?.url;

            return {
                thumbnail: data.thumbnail || data.image || embedResponse.data.thumbnail_url,
                "720p": videoUrl || null,
                "1080p": videoUrl || null,
                audio: null,
                title: embedResponse.data.title || "Video de Instagram"
            };
        }
    } catch (error) {
        console.log('Error con API de Instagram:', error.message);
    }

    // Método alternativo: scraping directo
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const html = response.data;

        // Buscar video en el HTML
        const videoMatch = html.match(/"video_url":"([^"]+)"/);
        const thumbnailMatch = html.match(/"thumbnail_url":"([^"]+)"/);
        const titleMatch = html.match(/"caption":"([^"]+)"/);

        if (videoMatch) {
            const videoUrl = videoMatch[1].replace(/\\u0026/g, '&');
            return {
                thumbnail: thumbnailMatch ? thumbnailMatch[1].replace(/\\u0026/g, '&') : null,
                "720p": videoUrl,
                "1080p": videoUrl,
                audio: null,
                title: titleMatch ? titleMatch[1].replace(/\\n/g, ' ') : "Video de Instagram"
            };
        }
    } catch (error) {
        console.log('Error con scraping directo:', error.message);
    }

    throw new Error('No se pudo obtener el video de Instagram');
}

// Procesar video de Facebook
async function processFacebook(url) {
    try {
        // Facebook es más complicado, usar API pública
        const apiResponse = await axios.get(`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000,
            maxRedirects: 5
        });

        const html = apiResponse.data;

        // Buscar video en el HTML
        const videoMatch = html.match(/video_src["\']?\s*:\s*["\']([^"\']+)["\']/);
        const thumbnailMatch = html.match(/thumbnail["\']?\s*:\s*["\']([^"\']+)["\']/);

        if (videoMatch) {
            return {
                thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
                "720p": videoMatch[1],
                "1080p": videoMatch[1],
                audio: null,
                title: "Video de Facebook"
            };
        }
    } catch (error) {
        console.log('Error con Facebook:', error.message);
    }

    throw new Error('No se pudo obtener el video de Facebook. Facebook tiene restricciones estrictas.');
}

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
        console.log(`📥 Procesando URL: ${url}`);

        // Detectar tipo de red social
        const socialType = detectSocialNetwork(url);
        console.log(`🔍 Red social detectada: ${socialType}`);

        let response;

        // Procesar según el tipo de red social
        switch (socialType) {
            case 'tiktok':
                response = await processTikTok(url);
                break;
            case 'instagram':
                response = await processInstagram(url);
                break;
            case 'facebook':
                response = await processFacebook(url);
                break;
            default:
                return res.status(400).json({
                    error: 'URL no soportada',
                    message: 'Solo se admiten URLs de TikTok, Instagram o Facebook'
                });
        }

        // Validar que tenemos al menos una URL de video
        if (!response["720p"] && !response["1080p"]) {
            throw new Error('No se pudo obtener ninguna URL de video');
        }

        // Asegurar que todas las propiedades existan (estructura requerida)
        const finalResponse = {
            thumbnail: response.thumbnail || null,
            "720p": response["720p"] || response["1080p"] || null,
            "1080p": response["1080p"] || response["720p"] || null,
            audio: response.audio || null,
            title: response.title || "Video sin título"
        };

        console.log(`✅ Video procesado exitosamente: ${finalResponse.title}`);

        // LA RESPUESTA DEBE SER EXACTAMENTE ESTA ESTRUCTURA
        res.json(finalResponse);

    } catch (error) {
        console.error('❌ Error al procesar video:', error);

        // Determinar código de estado apropiado
        const statusCode = error.message.includes('no soportada') ||
            error.message.includes('URL') ? 400 : 500;

        res.status(statusCode).json({
            error: "Error al procesar el video",
            message: error.message || "Error desconocido al obtener el video"
        });
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor AhaTok API activo en el puerto ${PORT}`);
    console.log(`📍 Endpoint: http://0.0.0.0:${PORT}/api/fetch`);
});


/**
 * Backend API para AhaTok - Render
 * Endpoint: /api/fetch
 * Procesa URLs de TikTok, Instagram y Facebook usando Cobalt API y métodos alternativos
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

/**
 * Procesar video usando Cobalt API (Método Principal)
 * Cobalt es una API pública muy confiable que soporta múltiples plataformas
 */
async function processWithCobalt(url) {
    try {
        console.log('🔄 Intentando con Cobalt API...');
        
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            vCodec: 'h264',
            vQuality: 'max',
            aFormat: 'mp3',
            isAudioOnly: false
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000 // 30 segundos para Render
        });

        if (response.data) {
            const data = response.data;
            
            // Cobalt puede devolver diferentes estructuras
            // Intentar extraer el video de diferentes formas
            let videoUrl720 = null;
            let videoUrl1080 = null;
            let audioUrl = null;
            let thumbnail = null;
            let title = null;
            
            // Estructura 1: data.url (URL directa)
            if (data.url && typeof data.url === 'string') {
                videoUrl720 = data.url;
                videoUrl1080 = data.url;
            }
            // Estructura 2: data.video (objeto con URLs)
            else if (data.video) {
                if (typeof data.video === 'string') {
                    videoUrl720 = data.video;
                    videoUrl1080 = data.video;
                } else if (data.video.url) {
                    videoUrl720 = data.video.url;
                    videoUrl1080 = data.video.url;
                }
            }
            // Estructura 3: data.text (URL del video)
            else if (data.text && data.text.startsWith('http')) {
                videoUrl720 = data.text;
                videoUrl1080 = data.text;
            }
            
            // Audio
            if (data.audio) {
                audioUrl = typeof data.audio === 'string' ? data.audio : data.audio.url;
            }
            
            // Thumbnail
            thumbnail = data.thumbnail || data.image || null;
            
            // Title
            title = data.text || data.title || data.name || "Video descargado";
            // Si title es una URL, usar un título por defecto
            if (title && title.startsWith('http')) {
                title = "Video descargado";
            }
            
            // Validar que tenemos al menos una URL de video
            if (videoUrl720 || videoUrl1080) {
                return {
                    thumbnail: thumbnail,
                    "720p": videoUrl720 || videoUrl1080,
                    "1080p": videoUrl1080 || videoUrl720,
                    audio: audioUrl,
                    title: title
                };
            }
        }
        
        // Si llegamos aquí, la respuesta no tiene el formato esperado
        throw new Error('Cobalt API devolvió una respuesta sin URLs de video');
    } catch (error) {
        console.log('⚠️ Cobalt API error:', error.message);
        throw error;
    }
}

/**
 * Procesar TikTok con métodos específicos (sin marca de agua)
 */
async function processTikTok(url) {
    try {
        console.log('🔄 Procesando TikTok...');
        
        // Método 1: API de TikTok sin marca de agua
        const tiklyResponse = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, {
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        if (tiklyResponse.data && tiklyResponse.data.video) {
            const video = tiklyResponse.data.video;
            const videoUrl = video.noWatermark || video.watermark || video;
            
            return {
                thumbnail: tiklyResponse.data.cover || tiklyResponse.data.thumbnail || null,
                "720p": videoUrl,
                "1080p": videoUrl, // TikTok generalmente no diferencia calidades
                audio: tiklyResponse.data.music || null,
                title: tiklyResponse.data.title || tiklyResponse.data.desc || "Video de TikTok"
            };
        }
    } catch (error) {
        console.log('⚠️ TikTok API error:', error.message);
    }

    // Método 2: API alternativa para TikTok
    try {
        const snaptikResponse = await axios.get(`https://snaptik.app/api/ajaxSearch`, {
            params: {
                q: url
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 20000
        });

        if (snaptikResponse.data && snaptikResponse.data.data) {
            const data = snaptikResponse.data.data;
            return {
                thumbnail: data.thumbnail || null,
                "720p": data.video || null,
                "1080p": data.video || null,
                audio: data.audio || null,
                title: data.title || "Video de TikTok"
            };
        }
    } catch (error) {
        console.log('⚠️ Snaptik API error:', error.message);
    }

    throw new Error('No se pudo obtener el video de TikTok');
}

/**
 * Procesar Instagram
 */
async function processInstagram(url) {
    try {
        console.log('🔄 Procesando Instagram...');
        
        // Método 1: API de Instagram
        const saveigResponse = await axios.get(`https://api.saveig.app/api/ajaxSearch`, {
            params: {
                q: url,
                t: 'media',
                lang: 'es'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 20000
        });

        if (saveigResponse.data && saveigResponse.data.data) {
            const data = saveigResponse.data.data;
            const videoUrl = data.video || data.videos?.[0]?.url;
            
            return {
                thumbnail: data.thumbnail || data.image || null,
                "720p": videoUrl || null,
                "1080p": videoUrl || null,
                audio: null,
                title: data.title || "Video de Instagram"
            };
        }
    } catch (error) {
        console.log('⚠️ Instagram API error:', error.message);
    }

    // Método 2: Scraping directo
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        const html = response.data;
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
        console.log('⚠️ Instagram scraping error:', error.message);
    }

    throw new Error('No se pudo obtener el video de Instagram');
}

/**
 * Procesar Facebook
 */
async function processFacebook(url) {
    try {
        console.log('🔄 Procesando Facebook...');
        
        // Facebook es más restrictivo, intentar con scraping
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 20000,
            maxRedirects: 5
        });

        const html = response.data;
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
        console.log('⚠️ Facebook error:', error.message);
    }

    throw new Error('No se pudo obtener el video de Facebook. Facebook tiene restricciones estrictas.');
}

/**
 * Procesar video - Función principal con múltiples fallbacks
 */
async function processVideo(url) {
    const socialType = detectSocialNetwork(url);
    
    // Intentar primero con Cobalt API (más confiable y universal)
    try {
        const result = await processWithCobalt(url);
        if (result["720p"] || result["1080p"]) {
            console.log('✅ Éxito con Cobalt API');
            return result;
        }
    } catch (error) {
        console.log('⚠️ Cobalt falló, intentando métodos específicos...');
    }

    // Si Cobalt falla, usar métodos específicos por plataforma
    switch (socialType) {
        case 'tiktok':
            return await processTikTok(url);
        case 'instagram':
            return await processInstagram(url);
        case 'facebook':
            return await processFacebook(url);
        default:
            throw new Error('URL no soportada');
    }
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AhaTok API está funcionando',
        endpoint: '/api/fetch',
        version: '2.0.0',
        features: ['Cobalt API', 'TikTok sin marca de agua', 'Instagram', 'Facebook']
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

    // Validar formato de URL
    try {
        new URL(url);
    } catch (error) {
        return res.status(400).json({
            error: 'URL inválida',
            message: 'La URL proporcionada no es válida'
        });
    }

    try {
        console.log(`📥 Procesando URL: ${url}`);

        // Procesar el video con múltiples métodos
        const response = await processVideo(url);

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
                          error.message.includes('URL') || 
                          error.message.includes('inválida') ? 400 : 500;
        
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
    console.log(`✨ Usando Cobalt API y métodos alternativos`);
});

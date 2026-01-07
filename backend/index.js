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

// Limpiar URL de parámetros innecesarios
function cleanUrl(url) {
    try {
        const urlObj = new URL(url);
        // Para TikTok, mantener solo el pathname esencial
        if (urlObj.hostname.includes('tiktok.com')) {
            // Si es una URL acortada (vt.tiktok.com), mantenerla tal cual
            if (urlObj.hostname.includes('vt.') || urlObj.hostname.includes('vm.')) {
                // Solo remover parámetros de query
                urlObj.search = '';
                return urlObj.toString();
            }
            // Para URLs normales, extraer solo la parte esencial: /@user/video/ID
            const match = url.match(/tiktok\.com\/(@[\w.]+)\/video\/(\d+)/i);
            if (match) {
                return `https://www.tiktok.com/${match[1]}/video/${match[2]}`;
            }
        }
        // Para Instagram, mantener la estructura pero limpiar parámetros
        if (urlObj.hostname.includes('instagram.com') || urlObj.hostname.includes('instagr.am')) {
            urlObj.search = '';
            return urlObj.toString();
        }
        // Para Facebook, mantener la estructura pero limpiar parámetros innecesarios
        if (urlObj.hostname.includes('facebook.com') || urlObj.hostname.includes('fb.com') || urlObj.hostname.includes('fb.watch')) {
            // Mantener parámetros importantes como ?v= o ?story_fbid= pero limpiar tracking
            const importantParams = ['v', 'story_fbid', 'id'];
            const newSearch = new URLSearchParams();
            for (const [key, value] of urlObj.searchParams.entries()) {
                if (importantParams.includes(key.toLowerCase())) {
                    newSearch.append(key, value);
                }
            }
            urlObj.search = newSearch.toString();
            return urlObj.toString();
        }
        // Para otras plataformas, remover parámetros de tracking
        urlObj.search = '';
        return urlObj.toString();
    } catch (error) {
        return url;
    }
}

// Detectar tipo de red social (mejorado para reconocer más formatos)
function detectSocialNetwork(url) {
    // TikTok - incluye dominios acortados (vt.tiktok.com, vm.tiktok.com)
    if (/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(url)) {
        return 'tiktok';
    }
    
    // Instagram - incluye instagr.am y diferentes formatos
    // Formatos: /p/ID, /reel/ID, /tv/ID, /stories/username/ID, username/p/ID, username/reel/ID
    if (/instagram\.com|instagr\.am/i.test(url)) {
        // Verificar si tiene formato de post, reel, tv o stories
        if (/\/(p|reel|tv|stories)\//i.test(url) || 
            /instagram\.com\/[\w.]+\/(p|reel|tv)\//i.test(url) ||
            /instagram\.com\/[\w.]+\/[\w-]+/i.test(url)) {
            return 'instagram';
        }
    }
    
    // Facebook - incluye múltiples formatos y dominios
    // Formatos: /videos/ID, /video.php?v=ID, /share/p/ID, /watch/?v=ID, /posts/ID, 
    // /permalink.php?story_fbid=ID, /photo.php?v=ID, /reel/ID, /watch/?v=ID
    // Dominios: facebook.com, fb.com, fb.watch, m.facebook.com, web.facebook.com
    if (/facebook\.com|fb\.com|fb\.watch/i.test(url)) {
        // Verificar múltiples formatos de Facebook
        if (/\/videos\/|\/video\.php|\/share\/p\/|\/watch\/|\/posts\/|\/permalink\.php|\/photo\.php|\/reel\//i.test(url) ||
            /facebook\.com\/[\w.]+\/videos\/|\/posts\//i.test(url) ||
            /fb\.watch\/|fb\.com\/watch/i.test(url) ||
            /\?v=|\?story_fbid=/i.test(url)) {
            return 'facebook';
        }
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
    // Limpiar URL antes de procesar
    const cleanUrlStr = cleanUrl(url);
    console.log(`🔄 Procesando TikTok (URL limpia: ${cleanUrlStr})...`);
    
    // Método 1: API TikWM (más confiable)
    try {
        console.log('🔄 Método 1: TikWM API...');
        const tikwmResponse = await axios.get(`https://tikwm.com/api/`, {
            params: {
                url: cleanUrlStr,
                hd: 1
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://tikwm.com/'
            },
            timeout: 25000
        });

        if (tikwmResponse.data && tikwmResponse.data.data) {
            const data = tikwmResponse.data.data;
            const videoUrl = data.hdplay || data.play || data.wmplay || data.music;
            
            if (videoUrl) {
                console.log('✅ Éxito con TikWM API');
                return {
                    thumbnail: data.cover || data.origin_cover || null,
                    "720p": videoUrl,
                    "1080p": videoUrl,
                    audio: data.music || null,
                    title: data.title || data.desc || "Video de TikTok"
                };
            }
        }
    } catch (error) {
        console.log('⚠️ TikWM API error:', error.response?.status || error.message);
    }

    // Método 2: API Tiklydown
    try {
        console.log('🔄 Método 2: Tiklydown API...');
        const tiklyResponse = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(cleanUrlStr)}`, {
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://tiklydown.eu.org/'
            }
        });

        if (tiklyResponse.data && tiklyResponse.data.video) {
            const video = tiklyResponse.data.video;
            const videoUrl = video.noWatermark || video.watermark || video;
            
            if (videoUrl) {
                console.log('✅ Éxito con Tiklydown API');
                return {
                    thumbnail: tiklyResponse.data.cover || tiklyResponse.data.thumbnail || null,
                    "720p": videoUrl,
                    "1080p": videoUrl,
                    audio: tiklyResponse.data.music || null,
                    title: tiklyResponse.data.title || tiklyResponse.data.desc || "Video de TikTok"
                };
            }
        }
    } catch (error) {
        console.log('⚠️ Tiklydown API error:', error.response?.status || error.message);
    }

    // Método 3: API MusicallyDown
    try {
        console.log('🔄 Método 3: MusicallyDown API...');
        const musicallyResponse = await axios.get(`https://musicallydown.com/download`, {
            params: {
                url: cleanUrlStr
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 20000
        });

        if (musicallyResponse.data && musicallyResponse.data.video) {
            console.log('✅ Éxito con MusicallyDown API');
            return {
                thumbnail: musicallyResponse.data.thumbnail || null,
                "720p": musicallyResponse.data.video,
                "1080p": musicallyResponse.data.video,
                audio: musicallyResponse.data.audio || null,
                title: musicallyResponse.data.title || "Video de TikTok"
            };
        }
    } catch (error) {
        console.log('⚠️ MusicallyDown API error:', error.response?.status || error.message);
    }

    // Método 4: Scraping directo del HTML de TikTok
    try {
        console.log('🔄 Método 4: Scraping directo...');
        const htmlResponse = await axios.get(cleanUrlStr, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 20000
        });

        const html = htmlResponse.data;
        
        // Buscar video en el JSON embebido
        const jsonMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/);
        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                const videoData = data['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.itemInfo?.itemStruct;
                
                if (videoData && videoData.video) {
                    const videoUrl = videoData.video.playAddr || videoData.video.downloadAddr;
                    if (videoUrl) {
                        console.log('✅ Éxito con scraping directo');
                        return {
                            thumbnail: videoData.video.cover || null,
                            "720p": videoUrl,
                            "1080p": videoUrl,
                            audio: videoData.music?.playUrl || null,
                            title: videoData.desc || "Video de TikTok"
                        };
                    }
                }
            } catch (parseError) {
                console.log('⚠️ Error parseando JSON:', parseError.message);
            }
        }
    } catch (error) {
        console.log('⚠️ Scraping directo error:', error.response?.status || error.message);
    }

    throw new Error('No se pudo obtener el video de TikTok. Todas las APIs y métodos fallaron.');
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
 * Convertir link compartido de Facebook a link directo
 */
function convertFacebookShareLink(url) {
    try {
        // Si es un link compartido (/share/p/ID), intentar obtener el link real
        const shareMatch = url.match(/facebook\.com\/share\/p\/([^\/\?]+)/i);
        if (shareMatch) {
            const shareId = shareMatch[1];
            // Intentar diferentes formatos posibles
            return [
                `https://www.facebook.com/watch/?v=${shareId}`,
                `https://www.facebook.com/video.php?v=${shareId}`,
                url // Mantener el original como fallback
            ];
        }
        return [url];
    } catch (error) {
        return [url];
    }
}

/**
 * Procesar Facebook - Múltiples métodos
 */
async function processFacebook(url) {
    console.log('🔄 Procesando Facebook...');
    
    // Convertir links compartidos a posibles formatos directos
    const possibleUrls = convertFacebookShareLink(url);
    
    // Método 1: Intentar con cada URL posible
    for (const testUrl of possibleUrls) {
        try {
            console.log(`🔄 Intentando con URL: ${testUrl}`);
            
            // Intentar obtener el HTML con cookies y headers completos
            const response = await axios.get(testUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none'
                },
                timeout: 25000,
                maxRedirects: 10,
                validateStatus: (status) => status < 500 // Aceptar redirects
            });

            const html = response.data;
            
            // Buscar múltiples patrones de video en el HTML
            const videoPatterns = [
                /video_src["\']?\s*:\s*["\']([^"\']+)["\']/i,
                /"video_url":"([^"]+)"/i,
                /"playable_url":"([^"]+)"/i,
                /"playable_url_quality_hd":"([^"]+)"/i,
                /"hd_src":"([^"]+)"/i,
                /"sd_src":"([^"]+)"/i,
                /source src=["\']([^"\']+\.mp4[^"\']*)["\']/i,
                /<video[^>]+src=["\']([^"\']+)["\']/i,
                /data-video-url=["\']([^"\']+)["\']/i
            ];
            
            let videoUrl = null;
            for (const pattern of videoPatterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    videoUrl = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
                    if (videoUrl.startsWith('http')) {
                        break;
                    }
                }
            }
            
            // Buscar thumbnail
            const thumbnailPatterns = [
                /thumbnail["\']?\s*:\s*["\']([^"\']+)["\']/i,
                /"thumbnail":"([^"]+)"/i,
                /"image":"([^"]+)"/i,
                /og:image["\']?\s+content=["\']([^"\']+)["\']/i
            ];
            
            let thumbnail = null;
            for (const pattern of thumbnailPatterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    thumbnail = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
                    if (thumbnail.startsWith('http')) {
                        break;
                    }
                }
            }
            
            // Buscar título
            const titlePatterns = [
                /"name":"([^"]+)"/i,
                /og:title["\']?\s+content=["\']([^"\']+)["\']/i,
                /<title>([^<]+)<\/title>/i
            ];
            
            let title = "Video de Facebook";
            for (const pattern of titlePatterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    title = match[1].trim();
                    break;
                }
            }
            
            if (videoUrl) {
                console.log('✅ Video encontrado en Facebook');
                return {
                    thumbnail: thumbnail,
                    "720p": videoUrl,
                    "1080p": videoUrl,
                    audio: null,
                    title: title
                };
            }
        } catch (error) {
            console.log(`⚠️ Error con URL ${testUrl}:`, error.message);
            continue; // Intentar siguiente URL
        }
    }
    
    // Método 2: Intentar con API externa para Facebook
    try {
        console.log('🔄 Método 2: API externa para Facebook...');
        const apiResponse = await axios.get(`https://api.saveig.app/api/ajaxSearch`, {
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

        if (apiResponse.data && apiResponse.data.data) {
            const data = apiResponse.data.data;
            const videoUrl = data.video || data.videos?.[0]?.url;
            
            if (videoUrl) {
                console.log('✅ Éxito con API externa');
                return {
                    thumbnail: data.thumbnail || data.image || null,
                    "720p": videoUrl,
                    "1080p": videoUrl,
                    audio: null,
                    title: data.title || "Video de Facebook"
                };
            }
        }
    } catch (error) {
        console.log('⚠️ API externa error:', error.message);
    }

    throw new Error('No se pudo obtener el video de Facebook. Facebook tiene restricciones estrictas y requiere autenticación en muchos casos.');
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
        // Limpiar URL antes de procesar
        const cleanedUrl = cleanUrl(url);
        console.log(`📥 Procesando URL: ${cleanedUrl}`);

        // Procesar el video con múltiples métodos
        const response = await processVideo(cleanedUrl);

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
        console.error('❌ Stack trace:', error.stack);
        
        // Determinar código de estado apropiado
        const statusCode = error.message.includes('no soportada') || 
                          error.message.includes('URL') || 
                          error.message.includes('inválida') ? 400 : 500;
        
        // Log detallado para debugging
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            statusCode: statusCode,
            url: url
        });
        
        res.status(statusCode).json({
            error: "Error al procesar el video",
            message: error.message || "Error desconocido al obtener el video",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor AhaTok API activo en el puerto ${PORT}`);
    console.log(`📍 Endpoint: http://0.0.0.0:${PORT}/api/fetch`);
    console.log(`✨ Usando Cobalt API y métodos alternativos`);
});

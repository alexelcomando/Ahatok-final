// Firebase Configuration
// IMPORTANTE: Reemplaza estas credenciales con las de tu proyecto Firebase
// Puedes obtenerlas en: https://console.firebase.google.com/
// Ve a tu proyecto > Configuración del proyecto > Tus apps > Configuración
const firebaseConfig = {
    apiKey: "AIzaSyDJNWtDlfCu2sR0wv_QnNpNmz7SU2EgbEs",
    authDomain: "app-ahatok.firebaseapp.com",
    projectId: "app-ahatok",
    storageBucket: "app-ahatok.firebasestorage.app",
    messagingSenderId: "519930335704",
    appId: "1:519930335704:web:e030eee7d45dd3f3c0e2ad",
    measurementId: "G-QRMHFC20F6"
};

// Initialize Firebase
let auth = null;
let db = null;
let firebaseInitialized = false;

// Verificar si Firebase está configurado
const isFirebaseConfigured = firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";

if (isFirebaseConfigured && typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // ⚠️ IMPORTANTE: Configurar persistencia de sesión
        // Usar LOCAL para que la sesión persista incluso después de cerrar el navegador
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .catch((error) => {
                console.warn('⚠️ No se pudo configurar persistencia LOCAL:', error.message);
                // Fallback a SESSION
                return auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
            })
            .catch((error) => {
                console.warn('⚠️ No se pudo configurar persistencia:', error.message);
            });

        firebaseInitialized = true;
        console.log('✅ Firebase inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
    }
} else {
    console.warn("⚠️ Firebase no configurado. Algunas funciones no estarán disponibles.");
    console.warn("📝 Edita app.js y reemplaza las credenciales de Firebase.");
}

// Estado de la aplicación
const appState = {
    currentView: 'home',
    currentUser: null,
    videoData: null,
    history: []
};

// Función para mostrar alerta personalizada
function showCustomAlert(title, message, cancelText = 'Cancelar', confirmText = 'Aceptar') {
    return new Promise((resolve) => {
        // Crear overlay si no existe
        let overlay = document.getElementById('customAlertOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'customAlertOverlay';
            overlay.className = 'custom-alert-overlay';
            document.body.appendChild(overlay);
        }

        // Crear alerta
        const alert = document.createElement('div');
        alert.className = 'custom-alert';
        alert.innerHTML = `
            <div class="custom-alert-header">
                <h3 class="custom-alert-title">${title}</h3>
            </div>
            <div class="custom-alert-body">
                <p>${message}</p>
            </div>
            <div class="custom-alert-footer">
                ${cancelText ? `<button class="custom-alert-btn custom-alert-btn-secondary" id="customAlertCancel">${cancelText}</button>` : ''}
                <button class="custom-alert-btn custom-alert-btn-primary" id="customAlertConfirm">${confirmText}</button>
            </div>
        `;

        overlay.innerHTML = '';
        overlay.appendChild(alert);

        // Mostrar alerta
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);

        // Botón cancelar
        const cancelBtn = document.getElementById('customAlertCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.innerHTML = '';
                }, 300);
                resolve(false);
            });
        }

        // Botón confirmar
        const confirmBtn = document.getElementById('customAlertConfirm');
        confirmBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.innerHTML = '';
            }, 300);
            resolve(true);
        });

        // Cerrar al hacer clic fuera
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.innerHTML = '';
                }, 300);
                resolve(false);
            }
        });
    });
}

// Patrones mejorados para verificar si la url es de una red social
const socialPatterns = {
    tiktok: /(?:https?:\/\/)?(?:www\.)?(?:vm\.|vt\.)?tiktok\.com/i,
    instagram: /(?:https?:\/\/)?(?:www\.|m\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv|stories|[\w.]+)\/(?:p|reel|tv|stories)?\/?[A-Za-z0-9_-]+/i,
    facebook: /(?:https?:\/\/)?(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.com|fb\.watch)\/(?:.*\/videos\/|.*\/video\.php|share\/p\/|watch\/|.*\/posts\/|.*\/permalink\.php|.*\/photo\.php|.*\/reel\/|.*\/watch\/\?v=)/i
};

// Detectar tipo de red social (mejorado para reconocer más formatos)
function detectSocialNetwork(url) {
    // Normalizar URL (agregar https:// si no tiene)
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }

    let parsed;
    try {
        parsed = new URL(normalizedUrl);
    } catch (e) {
        parsed = null;
    }

    const hostname = parsed ? parsed.hostname.toLowerCase() : '';
    const pathname = parsed ? (parsed.pathname || '') : normalizedUrl;
    const search = parsed ? (parsed.search || '') : '';

    // TikTok
    if ((hostname && (hostname.includes('tiktok.com') || hostname.includes('vm.tiktok.com') || hostname.includes('vt.tiktok.com'))) ||
        /tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(normalizedUrl)) {
        return 'tiktok';
    }

    // Instagram - múltiples formatos
    const isInstagramHost = hostname
        ? (hostname === 'instagram.com' || hostname.endsWith('.instagram.com') || hostname === 'instagr.am' || hostname.endsWith('.instagr.am'))
        : /instagram\.com|instagr\.am/i.test(normalizedUrl);

    if (isInstagramHost) {
        if (/(^|\/)(p|reel|tv|stories)\//i.test(pathname) ||
            /\/(share|s)\//i.test(pathname) ||
            pathname.length > 1) {
            return 'instagram';
        }
    }

    // Facebook - múltiples formatos y dominios
    const isFacebookHost = hostname
        ? (hostname === 'facebook.com' || hostname.endsWith('.facebook.com') || hostname === 'fb.com' || hostname.endsWith('.fb.com') || hostname === 'fb.watch' || hostname.endsWith('.fb.watch'))
        : /facebook\.com|fb\.com|fb\.watch/i.test(normalizedUrl);

    if (isFacebookHost) {
        if (/(^|\/)(videos|video\.php|watch|reel|posts|permalink\.php|photo\.php|story\.php)\b/i.test(pathname) ||
            /\/(share|share\/v|share\/r|share\/p)\//i.test(pathname) ||
            /[?&](v|story_fbid|fbid)=/i.test(search) ||
            (hostname.includes('fb.watch') && pathname.length > 1) ||
            pathname.length > 1) {
            return 'facebook';
        }
    }

    return null;
}

// Función para obtener video del backend con timeout
async function fetchVideo(url) {
    const loader = document.getElementById('loaderOverlay');
    loader.classList.remove('hidden');

    try {
        // Timeout de 30 segundos (Render puede tardar en "despertar")
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_URL = isLocalhost
            ? 'http://localhost:3000/api/fetch'
            : 'https://ahatok-api.onrender.com/api/fetch';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Error ${response.status}: ${response.statusText}`;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Si no es JSON, usar el texto directamente
                if (errorText) errorMessage = errorText;
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Validar que la respuesta tenga al menos una URL de descarga
        if (!data['720p'] && !data['1080p'] && !data.audio && !data.video && !data.sd && !data.hd) {
            throw new Error('El servidor no devolvió URLs de descarga válidas');
        }

        return data;
    } catch (error) {
        console.error('Error al obtener video:', error);

        let errorMessage = 'Error al procesar el video. ';

        if (error.name === 'AbortError') {
            errorMessage += 'El servidor tardó demasiado en responder. Por favor, intenta nuevamente.';
        } else if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Por favor, verifica la URL e intenta nuevamente.';
        }

        alert(errorMessage);
        throw error;
    } finally {
        loader.classList.add('hidden');
    }
}

// Función para mostrar anuncio intersticial
function showInterstitialAd() {
    return new Promise((resolve) => {
        const adModal = document.getElementById('adModal');
        const adTimer = document.getElementById('adTimer');
        const adContainer = document.getElementById('adContainer');
        let timeLeft = 5;

        // Cargar anuncio de AdSense si está disponible
        try {
            // Si AdSense está cargado, inicializar el anuncio
            if (typeof (window.adsbygoogle) !== 'undefined') {
                // Limpiar contenedor
                adContainer.innerHTML = '';

                // Crear elemento de anuncio de AdSense
                const adElement = document.createElement('ins');
                adElement.className = 'adsbygoogle';
                adElement.style.display = 'block';
                adElement.setAttribute('data-ad-client', 'ca-pub-4101809259492727');
                adElement.setAttribute('data-ad-slot', 'TU_SLOT_AQUI'); // ⚠️ Reemplaza con tu slot ID cuando crees una unidad de anuncio
                adElement.setAttribute('data-ad-format', 'auto');
                adElement.setAttribute('data-full-width-responsive', 'true');

                adContainer.appendChild(adElement);

                // Inicializar el anuncio
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    console.log('✅ Anuncio de AdSense cargado');
                } catch (e) {
                    console.warn('⚠️ Error al cargar anuncio de AdSense:', e);
                }
            } else {
                console.log('ℹ️ AdSense no está cargado. Agrega el script en index.html');
            }
        } catch (e) {
            console.warn('⚠️ Error al inicializar AdSense:', e);
        }

        adModal.classList.remove('hidden');

        // Timer countdown
        const timerInterval = setInterval(() => {
            timeLeft--;
            adTimer.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);

        // Cerrar anuncio después de 5 segundos automáticamente
        setTimeout(() => {
            closeAdModal();
            resolve();
        }, 5000);

        // Botón de cerrar manual
        document.getElementById('closeAdBtn').onclick = () => {
            if (timeLeft <= 2) {
                clearInterval(timerInterval);
                closeAdModal();
                resolve();
            } else {
                alert('Por favor, espera a que termine el anuncio.');
            }
        };

        function closeAdModal() {
            adModal.classList.add('hidden');
        }
    });
}

// Guardar en historial de Firebase
async function saveToHistory(videoData, quality) {
    // Verificar que Firebase esté configurado y el usuario esté autenticado
    if (!auth || !db || !auth.currentUser) {
        console.warn('Usuario no autenticado o Firebase no configurado');
        return;
    }

    try {
        await db.collection('history').add({
            userId: auth.currentUser.uid,
            url: videoData.originalUrl,
            thumbnail: videoData.thumbnail || '',
            title: videoData.title || 'Video sin título',
            quality: quality,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            socialNetwork: videoData.socialNetwork
        });
        console.log('✅ Guardado en historial correctamente');
    } catch (error) {
        console.error('❌ Error al guardar en historial:', error);
        // No mostrar alerta al usuario, solo loggear el error
    }
}

// Cargar historial desde Firebase
async function loadHistory() {
    // Verificar que Firebase esté configurado y el usuario esté autenticado
    if (!auth || !db || !auth.currentUser) {
        return;
    }

    try {
        // Usar auth.currentUser.uid para obtener el UID más actualizado
        const historyRef = db.collection('history')
            .where('userId', '==', auth.currentUser.uid) // ¡ESTO ES VITAL! Usa auth.currentUser.uid
            .orderBy('timestamp', 'desc')
            .limit(50);

        const snapshot = await historyRef.get();
        appState.history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderHistory();
    } catch (error) {
        console.error('Error al cargar historial:', error);
        // Si hay error de índice, intentar sin orderBy
        if (error.code === 'failed-precondition') {
            console.warn('Índice no encontrado. Cargando sin ordenar...');
            try {
                const historyRef = db.collection('history')
                    .where('userId', '==', auth.currentUser.uid)
                    .limit(50);
                const snapshot = await historyRef.get();
                appState.history = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => {
                    // Ordenar manualmente por timestamp
                    const timeA = a.timestamp?.seconds || 0;
                    const timeB = b.timestamp?.seconds || 0;
                    return timeB - timeA;
                });
                renderHistory();
            } catch (retryError) {
                console.error('Error al cargar historial (reintento):', retryError);
            }
        }
    }
}

// Renderizar historial
function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (appState.history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay descargas en el historial</p>';
        return;
    }

    appState.history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${item.thumbnail || 'https://via.placeholder.com/80'}" alt="Thumbnail">
            <div class="history-item-info">
                <div class="history-item-title">${item.title}</div>
                <div class="history-item-date">${item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'Fecha desconocida'}</div>
            </div>
            <div class="history-item-actions">
                <button class="action-btn" onclick="downloadFromHistory('${item.url}', '${item.quality}')">⬇️</button>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Descargar desde historial
async function downloadFromHistory(url, quality) {
    try {
        const videoData = await fetchVideo(url);
        const downloadUrl = videoData[quality] || videoData['720p'] || videoData.audio;
        if (downloadUrl) {
            // Intentar descarga automática usando fetch + blob
            try {
                await downloadFile(downloadUrl, `${videoData.title || 'video'}_${quality}.${quality === 'audio' ? 'mp3' : 'mp4'}`);
            } catch (error) {
                console.warn('Error en descarga automática, usando método alternativo:', error);
                // Fallback: abrir en nueva pestaña si falla la descarga directa
                window.open(downloadUrl, '_blank');
            }
        } else {
            alert('No se pudo obtener la URL de descarga. Por favor, intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error al descargar desde historial:', error);
        alert('Error al descargar el video. Por favor, verifica la conexión e intenta nuevamente.');
    }
}

// Hacer la función disponible globalmente
window.downloadFromHistory = downloadFromHistory;

// Sistema de navegación
function navigateTo(view) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

    // Mostrar la vista seleccionada
    const targetView = document.getElementById(`${view}View`);
    if (targetView) {
        targetView.classList.remove('hidden');
        appState.currentView = view;
    }
}

// Procesar descarga
async function processDownload() {
    // Verificar que el usuario esté autenticado
    if (!auth || !auth.currentUser) {
        alert('Debes iniciar sesión para descargar videos. Por favor, inicia sesión con Google.');
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) loginScreen.classList.remove('hidden');
        return;
    }

    const urlInput = document.getElementById('videoUrl');
    const url = urlInput.value.trim();

    if (!url) {
        alert('Por favor, ingresa una URL válida');
        return;
    }

    const socialNetwork = detectSocialNetwork(url);
    if (!socialNetwork) {
        alert('URL no válida. Solo se admiten enlaces de TikTok, Instagram o Facebook.');
        return;
    }

    try {
        const videoData = await fetchVideo(url);
        videoData.originalUrl = url;
        videoData.socialNetwork = socialNetwork;
        appState.videoData = videoData;

        // Mostrar vista de resultados
        const thumbnailImg = document.getElementById('videoThumbnail');
        thumbnailImg.src = videoData.thumbnail || 'https://via.placeholder.com/400x600';

        navigateTo('results');
    } catch (error) {
        console.error('Error al procesar:', error);
    }
}

// Manejar descarga por calidad
async function handleQualityDownload(quality) {
    // Verificar que el usuario esté autenticado
    if (!auth || !auth.currentUser) {
        alert('Debes iniciar sesión para descargar videos.');
        return;
    }

    if (!appState.videoData) return;

    let downloadUrl = null;

    if (quality === '1080p') {
        // Mostrar anuncio antes de descargar
        await showInterstitialAd();
        downloadUrl = appState.videoData['1080p'] || appState.videoData.hd || appState.videoData.video;
    } else if (quality === '720p') {
        downloadUrl = appState.videoData['720p'] || appState.videoData.sd || appState.videoData.video;
    } else if (quality === 'audio') {
        downloadUrl = appState.videoData.audio || appState.videoData.mp3;
    }

    if (downloadUrl) {
        // Intentar descarga automática usando fetch + blob
        try {
            await downloadFile(downloadUrl, `${appState.videoData.title || 'video'}_${quality}.${quality === 'audio' ? 'mp3' : 'mp4'}`);
        } catch (error) {
            console.warn('Error en descarga automática, usando método alternativo:', error);
            // Fallback: abrir en nueva pestaña si falla la descarga directa
            window.open(downloadUrl, '_blank');
        }

        // Guardar en historial
        await saveToHistory(appState.videoData, quality);
        // Recargar historial si estamos en esa vista
        if (appState.currentView === 'history') {
            await loadHistory();
        }
    } else {
        alert('No se encontró una URL de descarga para esta calidad.');
    }
}

// Función para descargar archivo usando fetch + blob
async function downloadFile(url, filename) {
    try {
        // Mostrar indicador de descarga
        const loader = document.getElementById('loaderOverlay');
        loader.classList.remove('hidden');
        loader.querySelector('p').textContent = 'Descargando...';

        // Fetch del archivo
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convertir a blob
        const blob = await response.blob();

        // Crear URL del blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Crear link de descarga
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpiar URL del blob
        window.URL.revokeObjectURL(blobUrl);

        // Ocultar loader
        loader.classList.add('hidden');

        console.log('✅ Descarga completada:', filename);
    } catch (error) {
        console.error('❌ Error al descargar:', error);
        const loader = document.getElementById('loaderOverlay');
        loader.classList.add('hidden');
        throw error;
    }
}

// Cargar descargas frecuentes (desde localStorage o Firebase)
function loadFrequentDownloads() {
    const downloadsGrid = document.getElementById('downloadsGrid');
    // Por ahora, mostrar placeholder
    // En producción, esto vendría de Firebase o localStorage
    downloadsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No hay descargas frecuentes aún</p>';
}

// Limpiar historial
async function clearHistory() {
    const confirmed = await showCustomAlert(
        'Limpiar Historial',
        '¿Estás seguro de que deseas limpiar todo el historial? Esta acción no se puede deshacer.',
        'Cancelar',
        'Limpiar'
    );

    if (!confirmed) {
        return;
    }

    // Verificar que Firebase esté configurado y el usuario esté autenticado
    if (!auth || !db || !auth.currentUser) {
        alert('Debes iniciar sesión para usar esta función');
        return;
    }

    try {
        // Obtener todos los documentos del usuario actual
        const historyRef = db.collection('history')
            .where('userId', '==', auth.currentUser.uid); // Usar auth.currentUser.uid

        const snapshot = await historyRef.get();

        if (snapshot.empty) {
            appState.history = [];
            renderHistory();
            return;
        }

        // Eliminar en batch
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        appState.history = [];
        renderHistory();
        console.log('✅ Historial limpiado correctamente');
    } catch (error) {
        console.error('❌ Error al limpiar historial:', error);
        alert('Error al limpiar el historial. Por favor, intenta nuevamente.');
    }
}


// ============================================
// SISTEMA DE LOGIN SIMPLIFICADO (SOLO GOOGLE)
// ============================================

function setupLoginScreen() {
    console.log('🔧 Configurando login screen (solo Google)...');

    // ========== BOTÓN "Continue with Google" ==========
    const loginScreenGoogleBtn = document.getElementById('loginScreenGoogleBtn');
    if (loginScreenGoogleBtn) {
        // Prevenir múltiples event listeners - remover cualquier listener previo
        const newBtn = loginScreenGoogleBtn.cloneNode(true);
        loginScreenGoogleBtn.parentNode.replaceChild(newBtn, loginScreenGoogleBtn);

        newBtn.addEventListener('click', async () => {
            // Prevenir clics múltiples mientras se procesa
            if (newBtn.disabled) {
                return;
            }

            try {
                if (!auth) {
                    alert('Firebase no está configurado. Por favor, verifica la configuración.');
                    return;
                }

                newBtn.disabled = true;
                newBtn.innerHTML = '<span>Conectando...</span>';

                const provider = new firebase.auth.GoogleAuthProvider();

                try {
                    // Usar signInWithRedirect como método principal
                    // Es más confiable que popup en navegadores con restricciones de CORS
                    console.log('🔄 Intentando login con redirect...');
                    await auth.signInWithRedirect(provider);
                    // signInWithRedirect redirige, pero con getRedirectResult manejamos la respuesta
                } catch (error) {
                    console.error('❌ Error en signInWithRedirect:', error);
                    // Si redirect falla, intentar popup como fallback
                    try {
                        console.log('ℹ️ Fallback a popup...');
                        const result = await auth.signInWithPopup(provider);
                        console.log('✅ Login con Google exitoso (popup)', result.user.email);
                        console.log('Usuario actual después del popup:', auth.currentUser?.email || 'null');
                    } catch (popupError) {
                        console.error('❌ Error en popup fallback:', popupError);
                        let errorMessage = 'Error al iniciar sesión. ';
                        if (popupError.code === 'auth/popup-blocked') {
                            errorMessage += 'El navegador bloqueó la ventana emergente.';
                        } else {
                            errorMessage += popupError.message || 'Intenta nuevamente.';
                        }
                        alert(errorMessage);
                    }
                }
            } catch (error) {
                console.error('❌ Error en login con Google (catch externo):', error);
            } finally {
                // signInWithRedirect causa redirección, pero si hay error en popup fallback:
                // Resetear botón solo si aún no está autenticado
                setTimeout(() => {
                    console.log('⏱️ Verificando estado en finally después de 500ms:', auth.currentUser?.email || 'null');
                    if (newBtn && !auth.currentUser) {
                        console.log('🔧 Reseteando botón porque usuario sigue siendo null');
                        newBtn.disabled = false;
                    newBtn.innerHTML = `
                            <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuar con Google
                        `;
                }
            }, 500);
        }
    });
} else {
    console.error('❌ loginScreenGoogleBtn no encontrado');
}

console.log('✅ Login screen configurado correctamente (solo Google)');
}

// Cargar AdSense solo después de autenticación (cumplir políticas)
function loadAdSense() {
    // Verificar si AdSense ya está cargado
    if (window.adsbygoogle) {
        return;
    }

    // Crear y cargar el script de AdSense dinámicamente
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4101809259492727';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
        console.log('✅ AdSense cargado correctamente');
        // Inicializar banner en drawer después de cargar AdSense
        initDrawerAd();
    };
    script.onerror = () => {
        console.warn('⚠️ Error al cargar AdSense');
    };
    document.head.appendChild(script);
}

// Función para crear anuncio en el drawer (accesible globalmente)
function createDrawerAd(adBanner) {
    if (!adBanner || !window.adsbygoogle) {
        return;
    }

    // Verificar que el contenedor tenga dimensiones válidas
    const rect = adBanner.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        console.warn('⚠️ El contenedor del anuncio tiene dimensiones inválidas, esperando...');
        // Reintentar después de un breve delay
        setTimeout(() => {
            const retryRect = adBanner.getBoundingClientRect();
            if (retryRect.width > 0 && retryRect.height > 0) {
                createDrawerAd(adBanner);
            }
        }, 500);
        return;
    }

    // Verificar si ya existe un anuncio
    if (adBanner.querySelector('.adsbygoogle')) {
        return;
    }

    // Limpiar placeholder
    adBanner.innerHTML = '';

    // Crear elemento de anuncio de AdSense para el drawer
    const adElement = document.createElement('ins');
    adElement.className = 'adsbygoogle';
    adElement.style.display = 'block';
    adElement.setAttribute('data-ad-client', 'ca-pub-4101809259492727');
    adElement.setAttribute('data-ad-slot', 'TU_SLOT_DRAWER_AQUI'); // ⚠️ Reemplaza con tu slot ID cuando crees una unidad de anuncio
    adElement.setAttribute('data-ad-format', 'auto');
    adElement.setAttribute('data-full-width-responsive', 'true');
    // Establecer dimensiones mínimas para evitar el error de ancho 0
    adElement.style.minWidth = '250px';
    adElement.style.minHeight = '100px';

    adBanner.appendChild(adElement);

    // Inicializar el anuncio
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log('✅ Anuncio del drawer cargado');
    } catch (e) {
        console.warn('⚠️ Error al cargar anuncio del drawer:', e);
    }
}

// Inicializar anuncio en el drawer (solo después de autenticación)
// NOTA: El anuncio se inicializará cuando el drawer se abra, no cuando está oculto
function initDrawerAd() {
    // No inicializar inmediatamente si el drawer está oculto
    // Se inicializará cuando el usuario abra el drawer
    console.log('ℹ️ Anuncio del drawer se inicializará cuando se abra el drawer');
}

// Autenticación Firebase
function initAuth() {
    if (!auth) {
        console.warn('Firebase Auth no disponible');
        return;
    }

    // Observar cambios en el estado de autenticación
    auth.onAuthStateChanged((user) => {
        console.log('🔍 onAuthStateChanged disparado:', user ? `Email: ${user.email}` : 'sin usuario');
        appState.currentUser = user;
        const authBtn = document.getElementById('authBtn');
        const loginScreen = document.getElementById('loginScreen');
        const mainContent = document.getElementById('mainContent');
        const header = document.querySelector('.header');

        if (user) {
            console.log('✅ Usuario autenticado:', user.email);
            const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
            authBtn.textContent = initial;
            authBtn.className = 'auth-btn user-avatar-btn';
            authBtn.title = `Usuario: ${user.email}`;

            // Actualizar menú de usuario
            const userMenu = document.getElementById('userMenu');
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');

            if (userMenu) {
                if (userAvatar) userAvatar.textContent = initial;
                if (userName) userName.textContent = user.displayName || 'Usuario';
                if (userEmail) userEmail.textContent = user.email || '';
            }

            if (loginScreen) loginScreen.classList.add('hidden');
            // Main content siempre visible (landing page pública)
            if (mainContent) mainContent.classList.remove('hidden');
            if (header) header.classList.remove('hidden');
            loadHistory();
            // Cargar AdSense solo después de autenticación (cumplir políticas)
            loadAdSense();
        } else {
            // Usuario no autenticado - mostrar botón de login normal
            console.log('❌ Usuario no autenticado / sesión cerrada');
            authBtn.textContent = 'Iniciar Sesión';
            authBtn.className = 'auth-btn';
            authBtn.title = '';

            // Ocultar menú de usuario
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.remove('active');

            if (loginScreen) loginScreen.classList.add('hidden'); // Login oculto por defecto
            if (mainContent) mainContent.classList.remove('hidden'); // Contenido siempre visible
            if (header) header.classList.remove('hidden'); // Header siempre visible
        }
    });

    // Botón de autenticación en header
    document.getElementById('authBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        // Verificar estado actual de Firebase en lugar de appState
        const currentUser = auth ? auth.currentUser : null;
        console.log('🔘 Click en authBtn - Estado actual:', currentUser?.email || 'null');

        if (currentUser) {
            console.log('👤 Usuario autenticado, mostrando menú de usuario');
            // Mostrar/ocultar menú de usuario
            const userMenu = document.getElementById('userMenu');
            if (userMenu) {
                // Remover hidden y toggle active
                userMenu.classList.remove('hidden');
                userMenu.classList.toggle('active');
                console.log('✅ Menú de usuario toggled');
            }
        } else {
            console.log('❌ Usuario NO autenticado, mostrando login screen');
            // Mostrar modal de login si no está autenticado
            const loginScreen = document.getElementById('loginScreen');
            console.log('loginScreen element:', loginScreen);
            if (loginScreen) {
                loginScreen.classList.remove('hidden');
                console.log('✅ loginScreen.hidden removido');
                // Forzar reflow para activar la transición
                void loginScreen.offsetWidth;
            } else {
                console.error('❌ loginScreen NO encontrado');
            }
        }
    });

    // Cerrar menú de usuario al hacer clic fuera
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('userMenu');
        const authBtn = document.getElementById('authBtn');
        if (userMenu && !userMenu.contains(e.target) && !authBtn.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });

    // NOTA: El event listener para loginScreenGoogleBtn ya está configurado en setupLoginScreen()
    // No duplicar aquí para evitar popups conflictivos
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.querySelector('.theme-label');

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Actualizar estado del switch
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'light';

        // Event listener para el switch
        themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            // Animar el ícono del tema
            if (themeLabel) {
                themeLabel.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    themeLabel.style.transform = 'rotate(0deg)';
                }, 300);
            }
        });
    }

    // Navegación
    document.getElementById('downloadBtn').addEventListener('click', processDownload);
    document.getElementById('videoUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processDownload();
        }
    });

    // Botones de calidad
    document.getElementById('btn720p').addEventListener('click', () => handleQualityDownload('720p'));
    document.getElementById('btn1080p').addEventListener('click', () => handleQualityDownload('1080p'));
    document.getElementById('btnAudio').addEventListener('click', () => handleQualityDownload('audio'));

    // Botón volver
    document.getElementById('backBtn').addEventListener('click', () => {
        navigateTo('home');
        document.getElementById('videoUrl').value = '';
    });

    // Drawer menu
    document.getElementById('menuBtn').addEventListener('click', () => {
        const drawer = document.getElementById('drawer');
        drawer.classList.add('active');
        document.getElementById('drawerOverlay').classList.add('active');
        // Inicializar anuncio del drawer cuando se abre (si está disponible)
        if (window.adsbygoogle && appState.currentUser) {
            setTimeout(() => {
                const adBanner = document.getElementById('adBanner');
                if (adBanner && adBanner.querySelector('.adsbygoogle') === null) {
                    createDrawerAd(adBanner);
                }
            }, 300); // Esperar a que termine la animación del drawer
        }
    });

    document.getElementById('closeDrawer').addEventListener('click', () => {
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    document.getElementById('drawerOverlay').addEventListener('click', () => {
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    // Logo clickable para ir a inicio
    document.getElementById('homeLogo').addEventListener('click', () => {
        navigateTo('home');
    });

    // Menú items
    document.getElementById('homeBtn').addEventListener('click', () => {
        navigateTo('home');
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    document.getElementById('historyBtn').addEventListener('click', () => {
        navigateTo('history');
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    document.getElementById('premiumBtn').addEventListener('click', () => {
        alert('Función Premium próximamente disponible');
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });

    // Cerrar login modal
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', () => {
            document.getElementById('loginScreen').classList.add('hidden');
        });
    }

    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const userMenu = document.getElementById('userMenu');
            if (userMenu) userMenu.classList.remove('active');

            // Mostrar alerta personalizada
            const confirmed = await showCustomAlert(
                'Cerrar Sesión',
                '¿Estás seguro de que deseas cerrar sesión?',
                'Cancelar',
                'Cerrar Sesión'
            );

            if (confirmed) {
                auth.signOut().catch(error => {
                    console.error('Error al cerrar sesión:', error);
                    showCustomAlert('Error', 'Error al cerrar sesión. Por favor, intenta nuevamente.', 'Aceptar');
                });
            }
        });
    }

    // Cerrar menú de usuario al hacer clic fuera
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('userMenu');
        const authBtn = document.getElementById('authBtn');
        if (userMenu && !userMenu.contains(e.target) && !authBtn.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });

    // Modales legales
    const privacyLink = document.getElementById('privacyLink');
    const termsLink = document.getElementById('termsLink');
    const contactLink = document.getElementById('contactLink');

    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('privacyModal').classList.remove('hidden');
        });
    }

    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('termsModal').classList.remove('hidden');
        });
    }

    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('contactModal').classList.remove('hidden');
        });
    }

    // Cerrar modales legales
    const closePrivacyBtn = document.getElementById('closePrivacyBtn');
    const closeTermsBtn = document.getElementById('closeTermsBtn');
    const closeContactBtn = document.getElementById('closeContactBtn');

    if (closePrivacyBtn) {
        closePrivacyBtn.addEventListener('click', () => {
            document.getElementById('privacyModal').classList.add('hidden');
        });
    }

    if (closeTermsBtn) {
        closeTermsBtn.addEventListener('click', () => {
            document.getElementById('termsModal').classList.add('hidden');
        });
    }

    if (closeContactBtn) {
        closeContactBtn.addEventListener('click', () => {
            document.getElementById('contactModal').classList.add('hidden');
        });
    }

    // Cerrar modales al hacer clic fuera
    const legalModals = ['privacyModal', 'termsModal', 'contactModal'];
    legalModals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    });

    // Historial
    // Agregar botón de historial en el header o drawer si lo necesitas
    // Por ahora, puedes acceder a /#history o agregar un botón

    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Cargar datos iniciales
    loadFrequentDownloads();
    initAuth();
    setupLoginScreen(); // ¡IMPORTANTE! Configurar login screen

    // Manejar rutas hash
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'home';
        navigateTo(hash);
    });

    // Navegación inicial
    const initialView = window.location.hash.slice(1) || 'home';
    navigateTo(initialView);
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('Error al registrar Service Worker:', error);
            });
    });
}


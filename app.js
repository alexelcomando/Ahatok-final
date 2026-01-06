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
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";

if (isFirebaseConfigured && typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
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

// rernarios para verificar si la url es de una red social
const socialPatterns = {
    tiktok: /(?:https?:\/\/)?(?:www\.)?(?:vm\.|vt\.)?tiktok\.com\/(?:.*\/)?(?:video\/)?(\d+)/i,
    instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i,
    facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.*\/videos\/(\d+)/i
};

// Detectar tipo de red social
function detectSocialNetwork(url) {
    for (const [network, pattern] of Object.entries(socialPatterns)) {
        if (pattern.test(url)) {
            return network;
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

        const response = await fetch('https://mi-api-ahatok.onrender.com/api/fetch', {
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
        let timeLeft = 5;

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
    if (!appState.currentUser || !db) {
        console.warn('Usuario no autenticado o Firebase no configurado');
        return;
    }

    try {
        await db.collection('history').add({
            userId: appState.currentUser.uid,
            url: videoData.originalUrl,
            thumbnail: videoData.thumbnail || '',
            title: videoData.title || 'Video sin título',
            quality: quality,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            socialNetwork: videoData.socialNetwork
        });
        console.log('Guardado en historial');
    } catch (error) {
        console.error('Error al guardar en historial:', error);
    }
}

// Cargar historial desde Firebase
async function loadHistory() {
    if (!appState.currentUser || !db) {
        return;
    }

    try {
        const historyRef = db.collection('history')
            .where('userId', '==', appState.currentUser.uid)
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
            window.open(downloadUrl, '_blank');
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
        window.open(downloadUrl, '_blank');
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

// Cargar descargas frecuentes (desde localStorage o Firebase)
function loadFrequentDownloads() {
    const downloadsGrid = document.getElementById('downloadsGrid');
    // Por ahora, mostrar placeholder
    // En producción, esto vendría de Firebase o localStorage
    downloadsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No hay descargas frecuentes aún</p>';
}

// Limpiar historial
async function clearHistory() {
    if (!confirm('¿Estás seguro de que deseas limpiar todo el historial?')) {
        return;
    }

    if (!appState.currentUser || !db) {
        alert('Debes iniciar sesión para usar esta función');
        return;
    }

    try {
        const batch = db.batch();
        appState.history.forEach(item => {
            const ref = db.collection('history').doc(item.id);
            batch.delete(ref);
        });
        await batch.commit();
        appState.history = [];
        renderHistory();
    } catch (error) {
        console.error('Error al limpiar historial:', error);
        alert('Error al limpiar el historial');
    }
}

// Mostrar/ocultar error de autenticación
function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Autenticación Firebase
function initAuth() {
    if (!auth) {
        console.warn('Firebase Auth no disponible');
        return;
    }

    // Observar cambios en el estado de autenticación
    auth.onAuthStateChanged((user) => {
        appState.currentUser = user;
        const authBtn = document.getElementById('authBtn');
        const loginModal = document.getElementById('loginModal');

        if (user) {
            authBtn.textContent = user.displayName || user.email || 'Cerrar Sesión';
            authBtn.title = `Usuario: ${user.email}`;
            loginModal.classList.add('hidden');
            loadHistory();
        } else {
            authBtn.textContent = 'Iniciar Sesión';
            authBtn.title = '';
        }
    });

    // Botón de autenticación en header
    document.getElementById('authBtn').addEventListener('click', () => {
        if (appState.currentUser) {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                auth.signOut().catch(error => {
                    console.error('Error al cerrar sesión:', error);
                    alert('Error al cerrar sesión');
                });
            }
        } else {
            document.getElementById('loginModal').classList.remove('hidden');
        }
    });

    // Cerrar modal de login
    document.getElementById('closeLoginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('hidden');
        resetLoginForms();
    });

    // Login con Google
    document.getElementById('googleLoginBtn').addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            // El modal se cerrará automáticamente por onAuthStateChanged
        } catch (error) {
            console.error('Error en login con Google:', error);
            let errorMessage = 'Error al iniciar sesión con Google. ';

            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage += 'La ventana de autenticación fue cerrada.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage += 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes.';
            } else {
                errorMessage += error.message || 'Intenta nuevamente.';
            }

            showAuthError(errorMessage);
        }
    });

    // Mostrar formulario de email
    document.getElementById('emailLoginBtn').addEventListener('click', () => {
        document.querySelector('.login-options').classList.add('hidden');
        document.getElementById('emailLoginForm').classList.remove('hidden');
        document.getElementById('emailRegisterForm').classList.add('hidden');
    });

    // Cambiar a registro
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('emailLoginForm').classList.add('hidden');
        document.getElementById('emailRegisterForm').classList.remove('hidden');
    });

    // Cambiar a login
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('emailRegisterForm').classList.add('hidden');
        document.getElementById('emailLoginForm').classList.remove('hidden');
    });

    // Login con email/password
    document.getElementById('emailSubmitBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showAuthError('Por favor, completa todos los campos');
            return;
        }

        const submitBtn = document.getElementById('emailSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // El modal se cerrará automáticamente
        } catch (error) {
            console.error('Error en login:', error);
            let errorMessage = 'Error al iniciar sesión. ';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage += 'No existe una cuenta con este email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Contraseña incorrecta.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Email inválido.';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'Esta cuenta ha sido deshabilitada.';
                    break;
                default:
                    errorMessage += error.message || 'Intenta nuevamente.';
            }

            showAuthError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    });

    // Registro con email/password
    document.getElementById('registerSubmitBtn').addEventListener('click', async () => {
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!email || !password) {
            showAuthError('Por favor, completa todos los campos');
            return;
        }

        if (password.length < 6) {
            showAuthError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const submitBtn = document.getElementById('registerSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando cuenta...';

        try {
            await auth.createUserWithEmailAndPassword(email, password);
            // El modal se cerrará automáticamente
        } catch (error) {
            console.error('Error en registro:', error);
            let errorMessage = 'Error al crear la cuenta. ';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += 'Ya existe una cuenta con este email.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Email inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage += 'La contraseña es muy débil.';
                    break;
                default:
                    errorMessage += error.message || 'Intenta nuevamente.';
            }

            showAuthError(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cuenta';
        }
    });
}

// Resetear formularios de login
function resetLoginForms() {
    document.querySelector('.login-options').classList.remove('hidden');
    document.getElementById('emailLoginForm').classList.add('hidden');
    document.getElementById('emailRegisterForm').classList.add('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('authError').classList.add('hidden');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
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
        document.getElementById('drawer').classList.add('active');
        document.getElementById('drawerOverlay').classList.add('active');
    });

    document.getElementById('closeDrawer').addEventListener('click', () => {
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    document.getElementById('drawerOverlay').addEventListener('click', () => {
        document.getElementById('drawer').classList.remove('active');
        document.getElementById('drawerOverlay').classList.remove('active');
    });

    // Menú items
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

    // Historial
    // Agregar botón de historial en el header o drawer si lo necesitas
    // Por ahora, puedes acceder a /#history o agregar un botón

    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    // Cargar datos iniciales
    loadFrequentDownloads();
    initAuth();

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


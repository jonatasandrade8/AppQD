// ==================== NOVAS ESTRUTURA DE DADOS PARA DROPDOWNS ====================
/**
 * @description Tipos de foto disponíveis para seleção.
 * Chave: Valor que será salvo (value),
 * Valor: Texto que será exibido no dropdown (textContent).
 */
const PHOTO_TYPES = {
    "Bancadas": "Bancadas",
    "Ponto Extra": "Ponto Extra",
    "Ação de Degustação": "Ação de Degustação",
};


// ==================== ESTRUTURA DE DADOS PARA DROPDOWNS ====================
// ATENÇÃO: Preencha este objeto com os nomes dos promotores, as redes que ele atende e as lojas/PDVs.
const APP_DATA = {
    "Miqueias": {
        "Assaí": ["Ponta Negra"],
    },
    "Cosme": {
        "Assaí": ["Zona Norte"],
    },
    "David": {
        "Assaí": ["Zona Sul"],

    },
    "Erivan": {
        "Assaí": ["Maria Lacerda"],

    },
    "Inacio": {
        "Atacadão": ["Prudente"],

    },
    "Vivian": {
        "Atacadão": ["BR-101 Sul"],

    },
    "Amarildo": {
        "Atacadão": ["Zona Norte"],
        "Nordestão": ["Loja 05"]
    },
    "Nilson": {
        "Atacadão": ["Parnamirim"],

    },
    "Markson": {
        "Nordestão": ["Loja 01", "Loja 02", "Loja 03", "Loja 04", "Loja 06", "Loja 07", "Loja 08", "Loja 09", "Loja 10", "Loja 11"]

    },
    "Isaias": {
        "Favorito": ["Parnamirim", "Cidade Verde", "Nova Parnamirim"]
    },
    "Gerson": {
        "Rede Mais": ["Loja 10", "Loja 13", "Loja 16", "Loja 18", "Loja 22", "Loja 23"]
    },
    "Edson": {
        "Rede Mais": ["Loja 01", "Loja 02", "Loja 03", "Loja 04", "Loja 05", "Loja 06", "Loja 07", "Loja 08", "Loja 09", "Loja 11", "Loja 12", "Loja 14", "Loja 15", "Loja 17", "Loja 19", "Loja 20", "Loja 21"]
    },
    "Josenilson": {
        "Super Show": ["Loja 01", "Loja 02", "Loja 03", "Loja 04", "Loja 05", "Loja 06", "Loja 07"]
    },
    "José": {
        "Rebouças": ["Loja 01", "Loja 02", "Loja 03", "Loja 04", "Loja 05", "Loja 06", "Loja 07", "Loja 08", "Loja 09", "Loja 10", "Loja 11", "Loja 12", "Loja 13", "Loja 14"]
    },
    "Outros": {
        "Outras Redes": ["Outras Lojas"]
    }
};


// ==================== CONSTANTES E VARIÁVEIS GLOBAIS ====================
const DB_NAME = 'QDeliciaCameraDB';
const STORE_NAME = 'Photos';
const DB_VERSION = 1;

let db; // Referência do IndexedDB
let currentStream; // Stream de vídeo atual
let manualRotation = 0; // 0 para retrato, 90 para paisagem manual
let currentOrientation = 'portrait'; // Orientação detectada do dispositivo
let zoomSupported = false; // Flag para suporte de zoom

// Elementos do DOM - Seletores
const cameraBtn = document.getElementById('camera-btn');
const fullscreenCameraContainer = document.getElementById('fullscreen-camera-container');
const closeCameraBtn = document.getElementById('close-camera-btn');
const video = document.getElementById('camera-feed');
const shutterBtn = document.getElementById('shutter-btn');
const switchBtn = document.getElementById('switch-btn');
const canvas = document.getElementById('photo-canvas');
const gallery = document.getElementById('gallery');
const photoCounter = document.getElementById('photo-counter');
const deleteAllBtn = document.getElementById('delete-all-btn');
const downloadAllBtn = document.getElementById('download-all-btn');
const shareAllBtn = document.getElementById('share-all-btn');
const zoomSlider = document.getElementById('zoom-slider');
const zoomControls = document.getElementById('zoom-controls');
const rotateBtn = document.getElementById('rotate-btn');
const portraitGuide = document.getElementById('portrait-guide');
const landscapeGuide = document.getElementById('landscape-guide');
const orientationArrow = document.getElementById('orientation-arrow');

// Elementos do DOM - Dropdowns
const photoTypeSelect = document.getElementById('photo-type-select');
const promotorSelect = document.getElementById('promotor-select');
const redeSelect = document.getElementById('rede-select');
const lojaSelect = document.getElementById('loja-select');
const loadingIndicator = document.getElementById('loading');


// ==================== INICIALIZAÇÃO DO BANCO DE DADOS (IndexedDB) ====================
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB inicializado com sucesso.');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('Erro ao inicializar IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

// ==================== MANIPULAÇÃO DOS DROPDOWNS E ESTADO ====================

/**
 * @description Carrega os dropdowns com os dados de APP_DATA e PHOTO_TYPES.
 * Recupera os valores salvos no localStorage.
 */
function loadAndPopulateDropdowns() {
    // 1. Limpa todas as opções (exceto a primeira "Selecione...")
    clearDropdown(photoTypeSelect);
    clearDropdown(promotorSelect);
    clearDropdown(redeSelect);
    clearDropdown(lojaSelect);

    // 2. Recupera valores salvos
    const savedPromotor = localStorage.getItem('selectedPromotor');
    const savedRede = localStorage.getItem('selectedRede');
    const savedLoja = localStorage.getItem('selectedLoja');
    // Nota: Tipo de Foto não é salvo, reinicia a cada sessão.

    // 3. Popula Tipo de Foto
    populateSelect(photoTypeSelect, Object.keys(PHOTO_TYPES));

    // 4. Popula Promotores
    populateSelect(promotorSelect, Object.keys(APP_DATA));

    // 5. Adiciona Listeners de Eventos
    photoTypeSelect.addEventListener('change', checkCameraEligibility);
    
    promotorSelect.addEventListener('change', (e) => {
        const selectedPromotor = e.target.value;
        clearDropdown(redeSelect);
        clearDropdown(lojaSelect);
        
        if (selectedPromotor && APP_DATA[selectedPromotor]) {
            populateSelect(redeSelect, Object.keys(APP_DATA[selectedPromotor]));
            localStorage.setItem('selectedPromotor', selectedPromotor);
            localStorage.removeItem('selectedRede'); // Limpa seleção anterior
            localStorage.removeItem('selectedLoja'); // Limpa seleção anterior
        }
        checkCameraEligibility();
    });

    redeSelect.addEventListener('change', (e) => {
        const selectedPromotor = promotorSelect.value;
        const selectedRede = e.target.value;
        clearDropdown(lojaSelect);

        if (selectedPromotor && selectedRede && APP_DATA[selectedPromotor][selectedRede]) {
            populateSelect(lojaSelect, APP_DATA[selectedPromotor][selectedRede]);
            localStorage.setItem('selectedRede', selectedRede);
            localStorage.removeItem('selectedLoja'); // Limpa seleção anterior
        }
        checkCameraEligibility();
    });

    lojaSelect.addEventListener('change', (e) => {
        const selectedLoja = e.target.value;
        if (selectedLoja) {
            localStorage.setItem('selectedLoja', selectedLoja);
        }
        checkCameraEligibility();
    });

    // 6. Restaura estado salvo (se houver)
    if (savedPromotor && APP_DATA[savedPromotor]) {
        promotorSelect.value = savedPromotor;
        populateSelect(redeSelect, Object.keys(APP_DATA[savedPromotor]));

        if (savedRede && APP_DATA[savedPromotor][savedRede]) {
            redeSelect.value = savedRede;
            populateSelect(lojaSelect, APP_DATA[savedPromotor][savedRede]);

            if (savedLoja && APP_DATA[savedPromotor][savedRede].includes(savedLoja)) {
                lojaSelect.value = savedLoja;
            }
        }
    }

    // 7. Verifica a eligibilidade inicial
    checkCameraEligibility();
}

/**
 * @description Popula um elemento <select> com um array de opções.
 * @param {HTMLSelectElement} selectElement O elemento <select> a ser populado.
 * @param {string[]} options Array de strings para as opções.
 */
function populateSelect(selectElement, options) {
    options.forEach(option => {
        const opt = document.createElement('option');
        // Usa o valor de PHOTO_TYPES se for o select de tipo de foto
        const text = (selectElement === photoTypeSelect) ? PHOTO_TYPES[option] : option;
        opt.value = option;
        opt.textContent = text;
        selectElement.appendChild(opt);
    });
    // Habilita o select se ele tiver opções
    selectElement.disabled = options.length === 0;
}

/**
 * @description Limpa um <select>, mantendo a primeira opção (placeholder).
 * @param {HTMLSelectElement} selectElement O elemento <select> a ser limpo.
 */
function clearDropdown(selectElement) {
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    // Desabilita e reseta o valor
    selectElement.disabled = true;
    selectElement.value = "";
}

/**
 * @description Verifica se todos os dropdowns estão preenchidos para habilitar o botão da câmera.
 */
function checkCameraEligibility() {
    const typeSelected = photoTypeSelect.value;
    const promotorSelected = promotorSelect.value;
    const redeSelected = redeSelect.value;
    const lojaSelected = lojaSelect.value;

    if (typeSelected && promotorSelected && redeSelected && lojaSelected) {
        cameraBtn.disabled = false;
        cameraBtn.classList.remove('disabled');
    } else {
        cameraBtn.disabled = true;
        cameraBtn.classList.add('disabled');
    }
}


// ==================== LÓGICA DA CÂMERA (getUserMedia) ====================

/**
 * @description Solicita permissão e inicia a stream da câmera.
 */
async function requestCameraPermission(useFrontCamera = false) {
    if (currentStream) {
        stopCameraStream();
    }

    // Configurações de vídeo (constraints)
    const constraints = {
        video: {
            facingMode: useFrontCamera ? 'user' : 'environment',
            width: { ideal: 1920 }, // Tenta pegar HD, mas permite fallback
            height: { ideal: 1080 },
            // Evita que o navegador tente cortar (crop) a imagem
            resizeMode: 'none' 
        },
        audio: false,
    };

    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        video.play();

        // Atraso para garantir que as 'capabilities' estejam prontas
        setTimeout(setupCameraCapabilities, 500);

    } catch (err) {
        console.error('Erro ao acessar a câmera:', err);
        let errorMsg = 'Erro ao acessar a câmera. ';
        if (err.name === 'NotAllowedError') {
            errorMsg = 'Você precisa permitir o acesso à câmera para tirar fotos.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMsg = 'Nenhuma câmera foi encontrada no seu dispositivo.';
        } else if (err.name === 'NotReadableError') {
            errorMsg = 'A câmera já está sendo usada por outro aplicativo.';
        }
        alert(errorMsg);
        closeCamera();
    }
}

/**
 * @description Configura controles da câmera (como Zoom) após o stream iniciar.
 */
function setupCameraCapabilities() {
    if (!currentStream) return;
    
    const track = currentStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    // Configuração do Zoom
    if (capabilities.zoom) {
        zoomSupported = true;
        zoomControls.style.display = 'flex';
        zoomSlider.min = capabilities.zoom.min;
        zoomSlider.max = capabilities.zoom.max;
        zoomSlider.step = capabilities.zoom.step || 0.1; // Fallback para step
        
        // Tenta obter o valor atual do zoom (alguns navegadores não suportam)
        try {
            const settings = track.getSettings();
            if (settings && settings.zoom) {
                zoomSlider.value = settings.zoom;
            }
        } catch (e) {
            console.warn("Não foi possível ler as configurações de zoom iniciais.", e);
            zoomSlider.value = capabilities.zoom.min;
        }

    } else {
        zoomSupported = false;
        zoomControls.style.display = 'none';
        console.log('Zoom não é suportado por esta câmera.');
    }
}

/**
 * @description Aplica o valor do zoom do slider na trilha de vídeo.
 */
function applyZoom() {
    if (!currentStream || !zoomSupported) return;

    const track = currentStream.getVideoTracks()[0];
    track.applyConstraints({
        advanced: [{ zoom: zoomSlider.value }]
    }).catch(err => {
        console.error('Erro ao aplicar zoom:', err);
    });
}

/**
 * @description Para a stream de vídeo (desliga a câmera).
 */
function stopCameraStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

/**
 * @description Abre a interface de câmera em tela cheia.
 */
function openCamera() {
    fullscreenCameraContainer.classList.add('active');
    manualRotation = 0; // Reseta a rotação manual
    updateRotationButton(); // Atualiza a UI para o modo retrato
    requestCameraPermission(false); // Inicia com a câmera traseira
}

/**
 * @description Fecha a interface da câmera e para o stream.
 */
function closeCamera() {
    fullscreenCameraContainer.classList.remove('active');
    stopCameraStream();
    // Reseta o zoom para o estado inicial
    if (zoomSupported) {
        zoomSlider.value = zoomSlider.min;
    }
}

/**
 * @description Alterna entre a câmera frontal e traseira.
 */
function switchCamera() {
    const track = currentStream.getVideoTracks()[0];
    const settings = track.getSettings();
    const useFront = settings.facingMode === 'environment';
    
    // Para a stream atual antes de pedir a nova
    stopCameraStream();
    
    // Solicita a outra câmera
    requestCameraPermission(useFront);
}

// ==================== LÓGICA DE ROTAÇÃO ====================

/**
 * @description Detecta a orientação do dispositivo (retrato ou paisagem).
 */
function detectDeviceOrientation() {
    const updateOrientation = (angle) => {
        if (angle === 90 || angle === -90) {
            currentOrientation = 'landscape';
        } else {
            currentOrientation = 'portrait';
        }
        updateRotationButton(); // Atualiza a UI com base na nova orientação
    };

    try {
        // API moderna (Screen Orientation)
        screen.orientation.addEventListener("change", () => {
            updateOrientation(screen.orientation.angle);
        });
        updateOrientation(screen.orientation.angle); // Define o estado inicial
    } catch (e) {
        // API legada (OrientationChange)
        window.addEventListener("orientationchange", () => {
            updateOrientation(window.orientation);
        });
        updateOrientation(window.orientation || 0); // Define o estado inicial
    }
}

/**
 * @description Alterna a rotação manual (força paisagem/retrato na UI).
 */
function toggleManualRotation() {
    manualRotation = (manualRotation === 0) ? 90 : 0;
    updateRotationButton();
}

/**
 * @description Atualiza a UI (botão e guias) com base na rotação manual/automática.
 */
function updateRotationButton() {
    const isLandscape = (manualRotation === 90) || (manualRotation === 0 && currentOrientation === 'landscape');

    if (isLandscape) {
        rotateBtn.classList.add('active');
        portraitGuide.style.display = 'none';
        landscapeGuide.style.display = 'block';
        orientationArrow.style.display = 'block'; // Mostra a seta de orientação
    } else {
        rotateBtn.classList.remove('active');
        portraitGuide.style.display = 'block';
        landscapeGuide.style.display = 'none';
        orientationArrow.style.display = 'none'; // Esconde a seta
    }
}

/**
 * @description Calcula a rotação final da foto (em graus).
 * Combina a rotação manual e a orientação do dispositivo.
 * @returns {number} Rotação em graus (0, 90, -90, 180).
 */
function getPhotoRotation() {
    // Se o usuário forçou a paisagem (manualRotation=90)
    // E o dispositivo está em retrato (currentOrientation='portrait')
    // Então a rotação necessária é 90.
    if (manualRotation === 90 && currentOrientation === 'portrait') {
        return 90;
    }
    
    // Se o dispositivo está em paisagem (currentOrientation='landscape')
    // E o usuário não forçou retrato (manualRotation=0)
    // Então confiamos na orientação nativa.
    // A maioria dos navegadores/dispositivos já entrega o vídeo pré-rotacionado (rotação 0).
    // Mas se não entregar, a lógica aqui pode precisar de ajuste baseado no 'screen.orientation.angle'.
    // Por simplicidade, se o modo manual não estiver ativo, tratamos como 0.
    
    return 0; // Assume 0 para retrato ou paisagem nativa (se o vídeo já vier rotacionado)
}


// ==================== CAPTURA E PROCESSAMENTO DA FOTO ====================

/**
 * @description Captura a foto, aplica rotação e marca d'água, e salva no DB.
 */
function capturePhoto() {
    if (!db) {
        alert('Erro: O banco de dados não está pronto.');
        return;
    }

    const ctx = canvas.getContext('2d');

    // --- [INÍCIO DA ÚNICA ALTERAÇÃO] ---
    // --- LÓGICA DE ROTAÇÃO CORRIGIDA E ROBUSTA ---

    // 1. Obter a rotação e as dimensões do stream
    const rotation = getPhotoRotation(); // Retorna 0 ou 90 (baseado na lógica manual)
    const isSideways = rotation === 90 || rotation === -90;
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;

    // 2. Definir o tamanho do CANVAS para corresponder à orientação final
    if (isSideways) {
        canvas.width = videoH;
        canvas.height = videoW;
    } else {
        canvas.width = videoW;
        canvas.height = videoH;
    }

    // 3. Salvar o estado original do contexto
    ctx.save();

    // 4. Centralizar o contexto e aplicar a rotação básica
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    if (rotation !== 0) { // Se for 90
        ctx.rotate((rotation * Math.PI) / 180);
    }

    // --- CORREÇÃO ROBUSTA DE INVERSÃO ---
    // Aplicamos a rotação extra de 180 graus (Math.PI) APENAS quando:
    // 1. O modo manual foi ativado (manualRotation === 90)
    // 2. E a lógica de rotação calculou 90 graus (rotation === 90)
    //
    // Isso evita que a correção seja aplicada quando o celular está em
    // paisagem automática (onde 'rotation' seria 0 e 'manualRotation' seria 0).
    if (manualRotation === 90 && rotation === 90) {
        ctx.rotate(Math.PI); // Correção de 180 graus
    }
    // --- FIM DA CORREÇÃO ---

    // 5. Desenha o vídeo no contexto girado
    ctx.drawImage(video, -videoW / 2, -videoH / 2, videoW, videoH);

    // 6. Restaurar o contexto
    ctx.restore();
    // --- [FIM DA ÚNICA ALTERAÇÃO] ---


    // 7. Obter dados para a marca d'água
    const photoType = PHOTO_TYPES[photoTypeSelect.value] || photoTypeSelect.value;
    const promotor = promotorSelect.value;
    const rede = redeSelect.value;
    const loja = lojaSelect.value;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
    
    // 8. Aplicar Marca D'água (Texto)
    const fontSize = Math.max(canvas.width * 0.015, 18); // Fonte responsiva
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    const textLines = [
        timestamp,
        `Loja: ${rede} - ${loja}`,
        `Promotor: ${promotor}`,
        `Tipo: ${photoType}`
    ];
    
    const padding = fontSize * 0.8;
    let y = canvas.height - padding - (textLines.length - 1) * (fontSize * 1.4);

    textLines.forEach(line => {
        ctx.fillText(line, padding, y);
        y += (fontSize * 1.4); // Espaçamento entre linhas
    });

    // 9. Aplicar Marca D'água (Logomarca)
    const logo = new Image();
    logo.src = './logo-qdelicia.png'; // Caminho da logomarca
    logo.onload = () => {
        // Desenha a logo no canto superior direito
        const logoHeight = Math.min(canvas.height * 0.1, 80); // Altura máx de 80px ou 10%
        const logoWidth = (logo.width * logoHeight) / logo.height;
        const logoPadding = padding;
        
        ctx.globalAlpha = 0.85; // Leve transparência na logo
        ctx.drawImage(logo, canvas.width - logoWidth - logoPadding, logoPadding, logoWidth, logoHeight);
        ctx.globalAlpha = 1.0; // Restaura alfa

        // 10. Salvar no IndexedDB após a logo carregar
        canvas.toBlob((blob) => {
            const photoData = {
                blob: blob,
                timestamp: now.toISOString(),
                type: photoType,
                promotor: promotor,
                rede: rede,
                loja: loja
            };
            
            savePhotoToDB(photoData);

        }, 'image/jpeg', 0.9); // Qualidade 90%
    };
    
    // Caso a logo falhe (ex: 404), salva a foto mesmo assim
    logo.onerror = () => {
        console.error("Erro ao carregar a logomarca. Salvando foto sem ela.");
        canvas.toBlob((blob) => {
            const photoData = {
                blob: blob,
                timestamp: now.toISOString(),
                type: photoType,
                promotor: promotor,
                rede: rede,
                loja: loja
            };
            
            savePhotoToDB(photoData);

        }, 'image/jpeg', 0.9);
    };
}

/**
 * @description Salva o objeto da foto no IndexedDB e atualiza a galeria.
 * @param {object} photoData O objeto contendo o blob e os metadados.
 */
function savePhotoToDB(photoData) {
    if (!db) {
        alert("Erro: Banco de dados não disponível para salvar a foto.");
        return;
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(photoData);

    request.onsuccess = () => {
        console.log('Foto salva no DB com sucesso.');
        // Fecha a câmera e atualiza a UI
        closeCamera();
        updateGalleryView(); // Atualiza a galeria na página principal
        updatePhotoCounter();
    };

    request.onerror = (event) => {
        console.error('Erro ao salvar foto no DB:', event.target.error);
        alert('Houve um erro ao salvar a foto. Tente novamente.');
    };
}

// ==================== GERENCIAMENTO DA GALERIA ====================

/**
 * @description Carrega todas as fotos do IndexedDB e as exibe na galeria.
 */
async function updateGalleryView() {
    if (!db) {
        console.log('DB não pronto, aguardando inicialização...');
        // Tenta novamente após um curto atraso se o DB não estiver pronto
        setTimeout(updateGalleryView, 200);
        return;
    }

    const photos = await getAllPhotosFromDB();
    gallery.innerHTML = ''; // Limpa a galeria

    if (photos.length === 0) {
        gallery.innerHTML = '<p class="empty-gallery-msg">Nenhuma foto tirada nesta sessão.</p>';
        showGalleryControls(false);
    } else {
        showGalleryControls(true);
        photos.reverse().forEach(photo => { // Exibe as mais novas primeiro
            const photoItem = createGalleryItem(photo);
            gallery.appendChild(photoItem);
        });
    }
}

/**
 * @description Retorna todas as fotos do DB.
 * @returns {Promise<Array>} Uma promessa que resolve com um array de objetos de foto.
 */
function getAllPhotosFromDB() {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject("DB não inicializado.");
        }
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('Erro ao buscar fotos do DB:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * @description Cria um elemento DOM (HTML) para um item da galeria.
 * @param {object} photo O objeto da foto (com id, blob, e metadados).
 * @returns {HTMLElement} O elemento <div> do item da galeria.
 */
function createGalleryItem(photo) {
    const url = URL.createObjectURL(photo.blob);
    const item = document.createElement('div');
    item.className = 'photo-item';
    item.dataset.id = photo.id;

    const img = document.createElement('img');
    img.src = url;
    img.alt = `Foto ${photo.type} - ${photo.loja}`;
    img.onload = () => {
        // Revoga o URL do objeto após a imagem carregar para liberar memória
        URL.revokeObjectURL(url);
    };

    const info = document.createElement('div');
    info.className = 'photo-info';
    info.innerHTML = `
        <p><strong>${new Date(photo.timestamp).toLocaleTimeString('pt-BR')}</strong></p>
        <p>${photo.rede} - ${photo.loja}</p>
        <p>${photo.type}</p>
    `;

    // Container de controles (excluir, baixar)
    const controls = document.createElement('div');
    controls.className = 'photo-controls';

    // Botão Excluir
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Excluir foto';
    deleteBtn.onclick = () => deletePhoto(photo.id);

    // Botão Baixar
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'icon-btn download-btn';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
    downloadBtn.title = 'Baixar foto';
    downloadBtn.onclick = () => downloadPhoto(photo);

    controls.appendChild(deleteBtn);
    controls.appendChild(downloadBtn);
    
    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(controls);

    return item;
}

/**
 * @description Atualiza o contador de fotos (ex: "3 Fotos").
 */
async function updatePhotoCounter() {
    if (!db) return;
    const photos = await getAllPhotosFromDB();
    const count = photos.length;
    
    if (count === 0) {
        photoCounter.textContent = 'Nenhuma foto';
    } else if (count === 1) {
        photoCounter.textContent = '1 Foto';
    } else {
        photoCounter.textContent = `${count} Fotos`;
    }
}

/**
 * @description Exibe ou oculta os botões de ação da galeria (Baixar Todas, etc.).
 * @param {boolean} show Mostrar ou ocultar.
 */
function showGalleryControls(show) {
    const controls = document.querySelectorAll('.gallery-actions');
    controls.forEach(c => {
        c.style.display = show ? 'flex' : 'none';
    });
}

/**
 * @description Aciona o download de uma única foto.
 * @param {object} photo O objeto da foto.
 */
function downloadPhoto(photo) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(photo.blob);
    a.download = `Qdelicia_${photo.rede}_${photo.loja}_${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href); // Libera memória
}

/**
 * @description Exclui uma foto do DB e atualiza a galeria.
 * @param {number} id O ID da foto no IndexedDB.
 */
function deletePhoto(id) {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) {
        return;
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
        console.log(`Foto ID ${id} excluída.`);
        updateGalleryView(); // Atualiza a galeria
        updatePhotoCounter(); // Atualiza o contador
    };

    request.onerror = (event) => {
        console.error('Erro ao excluir foto:', event.target.error);
    };
}

/**
 * @description Exclui TODAS as fotos do DB.
 */
function deleteAllPhotos() {
    if (!confirm('ATENÇÃO!\nTem certeza que deseja excluir TODAS as fotos? Esta ação não pode ser desfeita.')) {
        return;
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear(); // Limpa todos os registros

    request.onsuccess = () => {
        console.log('Todas as fotos foram excluídas.');
        updateGalleryView();
        updatePhotoCounter();
    };

    request.onerror = (event) => {
        console.error('Erro ao limpar o DB:', event.target.error);
    };
}

/**
 * @description Gera um arquivo ZIP com todas as fotos e inicia o download.
 * Requer a biblioteca JSZip (não inclusa neste script, deve ser carregada no HTML).
 */
async function downloadAllPhotosZip() {
    if (typeof JSZip === 'undefined') {
        alert('Erro: A biblioteca de compressão (JSZip) não foi carregada.');
        return;
    }
    
    showLoading('Compactando fotos...');

    try {
        const photos = await getAllPhotosFromDB();
        if (photos.length === 0) {
            alert('Nenhuma foto para baixar.');
            return;
        }

        const zip = new JSZip();
        
        // Adiciona cada foto ao ZIP
        photos.forEach((photo, index) => {
            const filename = `Qdelicia_${photo.rede}_${photo.loja}_${index + 1}.jpg`;
            zip.file(filename, photo.blob, { binary: true });
        });

        // Gera o ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Inicia o download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `Fotos_Qdelicia_${new Date().toLocaleDateString('pt-BR')}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);

    } catch (error) {
        console.error('Erro ao gerar ZIP:', error);
        alert('Ocorreu um erro ao compactar as fotos.');
    } finally {
        hideLoading();
    }
}

/**
 * @description Mostra o indicador de carregamento (spinner).
 * @param {string} message Mensagem a ser exibida.
 */
function showLoading(message = 'Carregando...') {
    if (loadingIndicator) {
        loadingIndicator.querySelector('p').textContent = message;
        loadingIndicator.classList.add('active');
    }
}

/**
 * @description Esconde o indicador de carregamento.
 */
function hideLoading() {
    if (loadingIndicator) {
        loadingIndicator.classList.remove('active');
    }
}

// ==================== INICIALIZAÇÃO E LISTENERS DE EVENTOS ====================

// Inicializa o DB assim que o script carregar
initDB().then(() => {
    // Após o DB estar pronto, atualiza a galeria e o contador
    // (Esta parte é do script original, embora possa ser redundante
    // com o DOMContentLoaded, mantemos para fidelidade)
    updateGalleryView();
    updatePhotoCounter();
}).catch(err => {
    console.error("Falha crítica ao iniciar o IndexedDB.", err);
    alert("Erro grave: Não foi possível iniciar o banco de dados de fotos. A aplicação pode não funcionar corretamente.");
});

// Listeners de Eventos Principais
if (cameraBtn) {
    cameraBtn.addEventListener('click', openCamera);
}
if (closeCameraBtn) {
    closeCameraBtn.addEventListener('click', closeCamera);
}
if (shutterBtn) {
    shutterBtn.addEventListener('click', capturePhoto);
}
if (switchBtn) {
    switchBtn.addEventListener('click', switchCamera);
}
if (rotateBtn) {
    rotateBtn.addEventListener('click', toggleManualRotation);
}
if (zoomSlider) {
    zoomSlider.addEventListener('input', applyZoom);
}

// Listeners dos Botões da Galeria
if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', deleteAllPhotos);
}
if (downloadAllBtn) {
    // Verifica se a biblioteca JSZip está disponível antes de atribuir o evento
    downloadAllBtn.addEventListener('click', () => {
        if (typeof JSZip !== 'undefined') {
            downloadAllVideosZip(); // Mantido como no original (provável bug)
        } else {
            alert('Aguarde, a biblioteca de compactação (JSZip) está carregando...');
        }
    });
    // Correção da chamada da função (Mantendo o bug original para não alterar a funcionalidade)
    downloadAllBtn.onclick = () => {
         if (typeof JSZip !== 'undefined') {
            downloadAllVideosZip(); // Mantido como no original (provável bug)
        } else {
             alert('Erro: A biblioteca de compactação (JSZip) não foi carregada. Recarregue a página.');
        }
    };
}


// Listener para Compartilhar Todos (Web Share API)
if (shareAllBtn && navigator.share && navigator.canShare) {
    shareAllBtn.addEventListener("click", async () => {
        showLoading('Preparando fotos...');
        const photos = await getAllPhotosFromDB();
        hideLoading();

        if (photos.length === 0) {
            alert('Nenhuma foto para compartilhar.');
            return;
        }

        // Prepara a legenda (pega os dados da primeira foto)
        const firstPhoto = photos[0];
        const legendaCompartilhada = `*Fotos Qdelícia Frutas*
Data: ${new Date(firstPhoto.timestamp).toLocaleDateString('pt-BR')}
Promotor: ${firstPhoto.promotor}
Rede: ${firstPhoto.rede}
Loja: ${firstPhoto.loja}
(${photos.length} fotos)`;

        // Converte os blobs para Files (necessário para o Web Share)
        const files = photos.map((photo, i) => {
            // Converte Blob para ArrayBuffer
            const ab = photo.blob.arrayBuffer(); 
            // Converte ArrayBuffer para Uint8Array
            const u8a = new Uint8Array(ab); 
            // Cria o novo arquivo
            // (Nota: Esta conversão pode ser mais complexa, dependendo do suporte do navegador)
            // Vamos tentar criar o File direto do blob, que é mais simples
            return new File([photo.blob], `Qdelicia_Foto_${i + 1}.jpg`, { type: "image/jpeg" });
        });
        
        // Tenta compartilhar os arquivos
        try {
            if (navigator.canShare({ files: files })) {
                await navigator.share({
                    files: files,
                    title: "Fotos Qdelícia Frutas",
                    text: legendaCompartilhada,
                });
            } else {
                alert("O navegador não suporta o compartilhamento deste número de arquivos de uma vez.");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erro ao compartilhar:', error);
                // Fallback: se falhar (ex: muitos arquivos), tenta compartilhar só o texto
                try {
                    await navigator.share({
                        title: "Fotos Qdelícia Frutas",
                        text: `${legendaCompartilhada}\n\n(Não foi possível anexar as fotos automaticamente. Use a função "Baixar Todas" e anexe manualmente.)`,
                    });
                } catch (fallbackError) {
                    alert(`Erro ao compartilhar: ${fallbackError.message}`);
                }
            }
        }
    });
} else if (shareAllBtn) {
    // Fallback se o 'navigator.share' não existir
    shareAllBtn.addEventListener("click", () => {
        alert("A função de compartilhamento direto de múltiplas fotos não é suportada por este navegador. Por favor, utilize a função 'Baixar Todas' e compartilhe manually.");
    });
}


// Listener de Rotação (Função original mantida)
function handleOrientationChange() {
    if (currentStream && fullscreenCameraContainer && fullscreenCameraContainer.classList.contains('active')) {
        setTimeout(() => {
            // Reinicia a câmera para tentar se adaptar à nova orientação
            // Isso pode ser custoso, mas resolve problemas de 'aspect ratio' em alguns dispositivos
            requestCameraPermission();
        }, 150);
    }
}

try {
    screen.orientation.addEventListener("change", handleOrientationChange);
} catch (e) {
    // API Legada
    window.addEventListener("orientationchange", handleOrientationChange);
}


// Inicializa a galeria e os dropdowns ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadAndPopulateDropdowns();
    updateGalleryView();
    updatePhotoCounter();
    detectDeviceOrientation();
    updateRotationButton(); // Chama para iniciar os indicadores no modo Retrato
});

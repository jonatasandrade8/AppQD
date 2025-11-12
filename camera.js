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
        "Nordestão": ["Loja 08"],
        "Mar Vermelho": ["Parnamirim"],
        "Atacadão": ["BR-101 Sul"]
    },
    "Jordão": {
        "Superfácil": ["Olho d'Água", "Emaús"],
        "Assaí": ["Ponta Negra"],
        "Mar Vermelho": ["BR-101 Sul"]
    },
    "Mateus": {
        "Nordestão": ["Loja 04"],
        "Carrefour": ["Zona Sul"]
    },
    "Cristiane": {
        "Nordestão": ["Loja 07"],

    },
    "J Mauricio": {
        "Nordestão": ["Loja 03"],

    },
    "Neto": {
        "Superfácil": ["Emaús"],

    },
    "Antonio": {
        "Superfácil": ["Nazaré"],

    }
};


// ==================== FUNCIONALIDADES DA CÂMERA E VÍDEO ====================

// Elementos da Interface
const openCameraBtn = document.getElementById('open-camera-btn');
const fullscreenCameraContainer = document.getElementById('fullscreen-camera-container');
const backToGalleryBtn = document.getElementById('back-to-gallery-btn');
const video = document.getElementById('video');
const shutterBtn = document.getElementById('shutter-btn');
const switchBtn = document.getElementById('switch-btn');
const rotateBtn = document.getElementById('rotate-btn'); // Botão de Rotação Manual
const dateTimeElement = document.getElementById('date-time');
const photoList = document.getElementById('photo-list');
const downloadAllBtn = document.getElementById('download-all');
const shareAllBtn = document.getElementById('share-all');
const photoCountElement = document.getElementById('photo-count');
const orientationIndicator = document.getElementById('orientation-indicator'); // Indicador Visual de Orientação

// NOVOS ELEMENTOS RELACIONADOS AO LIMITE DE FOTOS (RESTAURADOS)
const controlsDiv = document.querySelector('.controls'); // Contêiner do shutter/switch
const shutterMsgDiv = document.createElement('div'); // Elemento para mensagem de limite
shutterMsgDiv.id = 'shutter-limit-message';
shutterMsgDiv.textContent = 'Feche a Câmera'; // Mensagem de limite

// Dropdowns para Marca D'água
const selectTipoFoto = document.getElementById('select-tipo-foto'); 
const selectPromotor = document.getElementById('select-promotor');
const selectRede = document.getElementById('select-rede');
const selectLoja = document.getElementById('select-loja');

let currentStream = null;
let usingFrontCamera = false;
let photos = []; // Array de URLs de fotos (Sempre começará vazio)
let hasCameraPermission = false; // Inicia como 'false'
const localStorageKey = 'qdelicia_last_selection_v2'; // Chave para persistência (v2 devido à adição do novo campo)

// Variáveis para Zoom e Flash
let currentZoom = 1; // Zoom inicial
let maxZoom = 1; // Zoom máximo suportado pelo dispositivo
let deviceOrientation = 0; // Orientação do dispositivo em graus

// Variável para Rotação Manual (0, 90, 180, 270)
let manualRotation = 0; 

// Constante para o Limite de Fotos (RESTAURADO)
const MAX_PHOTOS = 6; 

// Carregar a imagem da logomarca
const logoImage = new Image();
logoImage.src = './images/logo-qdelicia.png';
logoImage.onerror = () => console.error("Erro ao carregar a imagem da logomarca. Verifique o caminho.");


// --- LÓGICA DE DROP DOWNS, PERSISTÊNCIA E VALIDAÇÃO ---

/**
 * @description Salva as seleções atuais no localStorage.
 */
function saveSelection() {
    const selection = {
        promotor: selectPromotor.value,
        rede: selectRede.value,
        loja: selectLoja.value
    };
    localStorage.setItem(localStorageKey, JSON.stringify(selection));
    checkCameraAccess();
}


/**
 * @description Carrega as seleções do localStorage e preenche os dropdowns.
 */
function loadAndPopulateDropdowns() {
    // 1. Preenche o Tipo de Foto e GARANTE QUE ELE RECOMECE NA OPÇÃO PADRÃO
    selectTipoFoto.innerHTML = '<option value="" disabled selected>Selecione o Tipo</option>';
    Object.keys(PHOTO_TYPES).forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = PHOTO_TYPES[value];
        selectTipoFoto.appendChild(option);
    });

    // 2. Preenche o Promotor
    Object.keys(APP_DATA).forEach(promotor => {
        const option = document.createElement('option');
        option.value = promotor;
        option.textContent = promotor;
        selectPromotor.appendChild(option);
    });

    const savedSelection = JSON.parse(localStorage.getItem(localStorageKey));

    if (savedSelection) {
        if (savedSelection.promotor) {
            selectPromotor.value = savedSelection.promotor;
            // 3. Preenche a Rede baseada no Promotor salvo
            populateRede(savedSelection.promotor);
            selectRede.value = savedSelection.rede;
            // 4. Preenche a Loja baseada na Rede salva
            if (savedSelection.rede) {
                populateLoja(savedSelection.promotor, savedSelection.rede);
                selectLoja.value = savedSelection.loja;
            }
        }
    }

    // Força a validação inicial do botão
    checkCameraAccess();
}

/**
 * @description Preenche as opções de Rede com base no Promotor selecionado.
 */
function populateRede(promotor) {
    selectRede.innerHTML = '<option value="" disabled selected>Selecione a Rede</option>';
    selectLoja.innerHTML = '<option value="" disabled selected>Selecione a Loja</option>';
    selectLoja.disabled = true;

    if (promotor && APP_DATA[promotor]) {
        Object.keys(APP_DATA[promotor]).forEach(rede => {
            const option = document.createElement('option');
            option.value = rede;
            option.textContent = rede;
            selectRede.appendChild(option);
        });
        selectRede.disabled = false;
    } else {
        selectRede.disabled = true;
    }
}

/**
 * @description Preenche as opções de Loja com base na Rede e Promotor selecionados.
 */
function populateLoja(promotor, rede) {
    selectLoja.innerHTML = '<option value="" disabled selected>Selecione a Loja</option>';

    if (promotor && rede && APP_DATA[promotor] && APP_DATA[promotor][rede]) {
        APP_DATA[promotor][rede].forEach(loja => {
            const option = document.createElement('option');
            option.value = loja;
            option.textContent = loja;
            selectLoja.appendChild(option);
        });
        selectLoja.disabled = false;
    } else {
        selectLoja.disabled = true;
    }
}

// ==================================================================
/**
 * @description Verifica se os dropdowns estão preenchidos para liberar o botão da câmera.
 */
function checkCameraAccess() {
    const isReady = selectTipoFoto.value && selectPromotor.value && selectRede.value && selectLoja.value;

    if (openCameraBtn) {
        if (isReady) {
            openCameraBtn.disabled = false;
            openCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Abrir Câmera';
        } else {
            openCameraBtn.disabled = true;
            openCameraBtn.innerHTML = '<i class="fas fa-lock"></i> Preencha as Informações';
        }
    }
}


// EVENT LISTENERS para os Dropdowns
if (selectTipoFoto) {
    selectTipoFoto.addEventListener('change', saveSelection);
}
if (selectPromotor) {
    selectPromotor.addEventListener('change', () => {
        populateRede(selectPromotor.value);
        saveSelection();
    });
}
if (selectRede) {
    selectRede.addEventListener('change', () => {
        populateLoja(selectPromotor.value, selectRede.value);
        saveSelection();
    });
}
if (selectLoja) {
    selectLoja.addEventListener('change', saveSelection);
}


// --- LÓGICA DA CÂMERA ---

/**
 * @description Solicita permissão da câmera e inicia o stream com qualidade otimizada.
 */
async function requestCameraPermission() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: {
                facingMode: usingFrontCamera ? "user" : "environment",
                width: { ideal: 1920 }, // Melhor qualidade possível
                height: { ideal: 1080 },
                zoom: { ideal: 1 } // Zoom mínimo (sem zoom)
            },
            audio: false
        };

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        hasCameraPermission = true; // Permissão concedida!

        // Obter capacidades de zoom do dispositivo
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.getCapabilities) {
            const capabilities = videoTrack.getCapabilities();
            if (capabilities.zoom) {
                maxZoom = capabilities.zoom.max || 4;
                currentZoom = capabilities.zoom.min || 1;
                updateZoomButtons();
            }
        }

        // Resetar zoom ao mudar de câmera
        currentZoom = 1;
        applyZoom();

        // Detectar orientação do dispositivo
        detectDeviceOrientation();
        
        // Atualiza o indicador de orientação
        updateOrientationIndicator();

    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        hasCameraPermission = false;

        alert("Não foi possível iniciar a câmera. Verifique as permissões de acesso no seu navegador.");
        closeCameraFullscreen(); // Fecha a interface da câmera
    }
}

async function openCameraFullscreen() {
    if (openCameraBtn && openCameraBtn.disabled) return;
    if (!fullscreenCameraContainer) return;
    
    // Resetar rotação manual ao abrir
    manualRotation = 0; 

    // Mostra a interface da câmera
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Tenta pedir a permissão
    await requestCameraPermission();
    
    // VERIFICA O ESTADO DO BOTÃO AO ABRIR (RESTAURADO)
    updateShutterButtonState(); 
}

function closeCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    fullscreenCameraContainer.classList.remove('active');
    document.body.style.overflow = '';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    hasCameraPermission = false; // Reinicia o estado da permissão
    checkCameraAccess(); // Verifica o estado do botão
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
    
    // Limpa o estado da mensagem de limite se existir (RESTAURADO)
    if (shutterMsgDiv.parentNode) {
        shutterMsgDiv.parentNode.removeChild(shutterMsgDiv);
    }
}


function updateDateTime() {
    const now = new Date();
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    }
}
setInterval(updateDateTime, 1000);

function updatePhotoCounter() {
    if (photoCountElement) {
        photoCountElement.textContent = photos.length;
    }
    // CHAMA O CONTROLE DE LIMITE (RESTAURADO)
    updateShutterButtonState(); 
}

/**
 * @description Controla a visibilidade do botão de captura baseado no limite (MAX_PHOTOS). (RESTAURADO)
 */
function updateShutterButtonState() {
    if (!shutterBtn || !switchBtn || !controlsDiv) return;

    if (photos.length >= MAX_PHOTOS) {
        // Atingiu o limite. Esconde shutter e switch, mostra a mensagem.
        shutterBtn.style.display = 'none';
        switchBtn.style.display = 'none';
        if (rotateBtn) rotateBtn.style.display = 'none'; // Esconde o botão de rotação também
        
        if (!document.getElementById('shutter-limit-message')) {
            // Estilos para a mensagem "Feche a Câmera"
            shutterMsgDiv.style.color = 'white';
            shutterMsgDiv.style.fontSize = '1.2em';
            shutterMsgDiv.style.fontWeight = 'bold';
            shutterMsgDiv.style.padding = '10px';
            controlsDiv.appendChild(shutterMsgDiv);
        }
    } else {
        // Abaixo do limite. Mostra shutter e switch, esconde a mensagem.
        shutterBtn.style.display = 'block';
        switchBtn.style.display = 'block';
        if (rotateBtn) rotateBtn.style.display = 'block'; // Mostra o botão de rotação
        
        if (document.getElementById('shutter-limit-message')) {
            controlsDiv.removeChild(shutterMsgDiv);
        }
    }
}


// --- LÓGICA DA MARCA D'ÁGUA (capturePhoto) ---

/**
 * @description Captura o frame atual do vídeo, aplica a marca d'água formatada e salva com rotação automática e manual combinada.
 */
function capturePhoto() {
    // 1. Verificar o limite de fotos 
    if (photos.length >= MAX_PHOTOS) {
        alert(`Limite máximo de ${MAX_PHOTOS} fotos atingido. Por favor, feche a câmera.`);
        return;
    }

    // Validações
    if (!selectTipoFoto.value || !selectPromotor.value || !selectRede.value || !selectLoja.value) {
        alert("Por favor, preencha Tipo de Foto, Promotor, Rede e Loja antes de tirar a foto.");
        return;
    }
    if (!hasCameraPermission || !video || video.readyState < 2) {
        alert("Câmera não está pronta ou permissão não concedida.");
        return;
    }

    // Captura os dados da Marca D'água para impressão
    const tipoFotoText = `Tipo: ${selectTipoFoto.value}`; 
    const promotorText = `Promotor: ${selectPromotor.value}`;
    const redeText = `Rede: ${selectRede.value}`;
    const lojaText = `Loja: ${selectLoja.value}`;
    const dateText = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });

    // Linhas de texto a serem impressas no canto inferior direito, em ordem inversa de desenho (de baixo para cima)
    const watermarkLines = [dateText, lojaText, redeText, promotorText, tipoFotoText];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // --- LÓGICA DE ROTAÇÃO CORRIGIDA (COMBINA DISPOSITIVO + MANUAL) ---

    // 1. Obter a rotação do dispositivo (0, 90, 180, 270)
    const deviceRotation = getPhotoRotation(); 
    
    // 2. Calcular a rotação TOTAL (dispositivo + manual)
    const totalRotation = (deviceRotation + manualRotation) % 360; 
    
    // Converte rotação negativa (como -90) para positiva (270), se necessário
    const normalizedRotation = totalRotation < 0 ? totalRotation + 360 : totalRotation; 

    const isSideways = normalizedRotation === 90 || normalizedRotation === 270;
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;

    // 3. Definir o tamanho do CANVAS para corresponder à orientação final
    if (isSideways) {
        canvas.width = videoH;
        canvas.height = videoW;
    } else {
        canvas.width = videoW;
        canvas.height = videoH;
    }

    // 4. Salvar o estado original do contexto antes de transformar
    ctx.save();

    // 5. Centralizar o contexto e aplicar a rotação TOTAL
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (normalizedRotation !== 0) {
        ctx.rotate((normalizedRotation * Math.PI) / 180);
    }
    
    // Desenha o vídeo no contexto girado/corrigido
    ctx.drawImage(video, -videoW / 2, -videoH / 2, videoW, videoH);

    // 6. Restaurar o contexto para que as marcas d'água sejam desenhadas
    ctx.restore();


    // --- Configurações Comuns de Estilo e Posição para as marcas d'água ---
    const padding = Math.max(15, Math.floor(canvas.height / 80)); // Espaçamento
    const textBaseColor = '#FFFFFF';
    const bgColor = 'rgba(0, 0, 0, 0.7)';
    const defaultFontSize = Math.max(20, Math.floor(canvas.height / 40));

    // --- 1. Aplicação da Marca D'água (Texto - Canto Inferior Direito) ---
    ctx.font = `${defaultFontSize * 0.9}px Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    let totalHeight = 0;
    let maxWidth = 0;

    // Calcula a largura máxima e a altura total
    watermarkLines.forEach(line => {
        maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
        totalHeight += defaultFontSize * 0.9 + (padding / 2); 
    });
    totalHeight -= (padding / 2); 

    // Desenha o fundo único para todas as linhas
    ctx.fillStyle = bgColor;
    ctx.fillRect(
        canvas.width - maxWidth - 2 * padding, 
        canvas.height - totalHeight - 2 * padding, 
        maxWidth + 2 * padding,
        totalHeight + 2 * padding
    );

    // Desenha as linhas de texto
    ctx.fillStyle = textBaseColor;
    let lineY = canvas.height - 2 * padding; 

    // Percorre as linhas e desenha de baixo para cima
    for (let i = 0; i < watermarkLines.length; i++) {
        const line = watermarkLines[i];
        ctx.fillText(line, canvas.width - padding, lineY);
        lineY -= (defaultFontSize * 0.9 + (padding / 2)); 
    }


    // --- 2. Aplicação da Marca D'água (Logomarca - Canto Superior Esquerdo) ---
    if (logoImage.complete && logoImage.naturalHeight !== 0) {
        const logoHeight = Math.max(50, Math.floor(canvas.height / 10));
        const logoWidth = (logoImage.naturalWidth / logoImage.naturalHeight) * logoHeight;

        ctx.drawImage(logoImage, padding, padding, logoWidth, logoHeight);
    }

    const dataURL = canvas.toDataURL('image/jpeg', 0.8);

    photos.unshift(dataURL); // Adiciona a nova foto no início
    updatePhotoCounter();

    updateGalleryView();
}


/**
 * @description Remove uma foto específica da galeria pelo seu índice.
 */
function removePhoto(index) {
    if (confirm("Tem certeza que deseja remover esta foto?")) {
        photos.splice(index, 1); 
        updatePhotoCounter();
        updateGalleryView(); 
    }
}

/**
 * @description Baixa uma foto individual da galeria.
 */
function downloadSinglePhoto(index) {
    const photoURL = photos[index];
    if (!photoURL) return;

    const link = document.createElement("a");
    link.href = photoURL;
    const date = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `Qdelicia_Foto_${date}_${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/**
 * @description Atualiza o HTML da galeria com as fotos salvas.
 */
function updateGalleryView() {
    if (!photoList) return;

    photoList.innerHTML = '';

    const isDisabled = photos.length === 0;
    if (downloadAllBtn) downloadAllBtn.disabled = isDisabled;
    if (shareAllBtn) shareAllBtn.disabled = isDisabled;

    if (photos.length === 0) {
        photoList.innerHTML = `
            <div class="photo-item">
                <div class="photo-info">Galeria de fotos Vazia || Tire uma foto para começar!</div>
            </div>
        `;
        return;
    }

    photos.forEach((photoURL, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';

        // HTML ATUALIZADO COM OS DOIS BOTÕES
        photoItem.innerHTML = `
            <img src="${photoURL}" alt="Foto ${index + 1}">

            <div class="photo-controls">
                <button class="icon-btn download-single-btn" title="Baixar foto" data-index="${index}">
                    <i class="fas fa-download"></i>
                </button>
                <button class="icon-btn remove-single-btn" title="Remover foto" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>

            <div class="photo-info">Foto ${index + 1} (${selectTipoFoto.value})</div> `;

        photoList.appendChild(photoItem);
    });

    // ATUALIZAÇÃO DOS EVENT LISTENERS
    document.querySelectorAll('.remove-single-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const indexToRemove = parseInt(event.currentTarget.dataset.index);
            removePhoto(indexToRemove); 
        });
    });

    document.querySelectorAll('.download-single-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const indexToDownload = parseInt(event.currentTarget.dataset.index);
            downloadSinglePhoto(indexToDownload); 
        });
    });
}

/**
 * @description Alterna entre as câmeras frontal e traseira.
 */
function switchCamera() {
    usingFrontCamera = !usingFrontCamera;
    requestCameraPermission();
}


// ==================== FUNCIONALIDADES DE ZOOM ====================

/**
 * @description Aplica o zoom ao vídeo da câmera
 */
function applyZoom() {
    if (!currentStream) return;

    const videoTrack = currentStream.getVideoTracks()[0];
    if (videoTrack && videoTrack.getSettings) {
        try {
            videoTrack.applyConstraints({
                advanced: [{ zoom: currentZoom }]
            }).catch(err => console.error('Erro ao aplicar zoom:', err));
        } catch (err) {
            console.error('Zoom não suportado neste dispositivo:', err);
        }
    }
}

/**
 * @description Aumenta o zoom
 */
function zoomIn() {
    if (currentZoom < maxZoom) {
        currentZoom = Math.min(currentZoom + 0.5, maxZoom);
        applyZoom();
        updateZoomButtons();
    }
}

/**
 * @description Diminui o zoom
 */
function zoomOut() {
    if (currentZoom > 1) {
        currentZoom = Math.max(currentZoom - 0.5, 1);
        applyZoom();
        updateZoomButtons();
    }
}

/**
 * @description Atualiza o estado visual dos botões de zoom
 */
function updateZoomButtons() {
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomLevelDisplay = document.getElementById('zoom-level');

    if (zoomInBtn) {
        zoomInBtn.disabled = currentZoom >= maxZoom;
    }
    if (zoomOutBtn) {
        zoomOutBtn.disabled = currentZoom <= 1;
    }
    if (zoomLevelDisplay) {
        zoomLevelDisplay.textContent = currentZoom.toFixed(1) + 'x';
    }
}

// ==================== DETECÇÃO DE ORIENTAÇÃO DO DISPOSITIVO ====================

/**
 * @description Detecta a orientação do dispositivo
 */
function detectDeviceOrientation() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
}

/**
 * @description Manipula mudanças na orientação do dispositivo
 */
function handleDeviceOrientation(event) {
    const beta = event.beta;   
    const gamma = event.gamma; 

    if (Math.abs(gamma) < 45 && Math.abs(beta) < 45) { // Retrato (dispositivo plano ou pouco inclinado)
        deviceOrientation = 0; 
    } else if (Math.abs(beta) > 135) { // Retrato invertido (de cabeça para baixo)
        deviceOrientation = 180;
    } else if (gamma > 45) {
        deviceOrientation = 90; // Paisagem (girado para a direita)
    } else if (gamma < -45) {
        deviceOrientation = 270; // Paisagem (girado para a esquerda, usando 270 para consistência)
    }
    
    updateOrientationIndicator(); 
}

/**
 * @description Calcula a rotação necessária para a foto (valor ABSOLUTO do dispositivo)
 * @returns {number} Rotação em graus (0, 90, 180, 270).
 */
function getPhotoRotation() {
    let rotation = 0;
    
    // 1. Prioriza screen.orientation (mais robusto)
    if (screen.orientation) {
        const orientation = screen.orientation.type;
        if (orientation.includes('portrait-primary')) rotation = 0;
        else if (orientation.includes('portrait-secondary')) rotation = 180;
        else if (orientation.includes('landscape-primary')) rotation = 90;
        else if (orientation.includes('landscape-secondary')) rotation = 270; 
    } else {
        // 2. Fallback para deviceOrientation
        rotation = deviceOrientation;
    }
    
    return rotation;
}

/**
 * @description Atualiza a seta indicadora de orientação correta (combina dispositivo + manual).
 */
function updateOrientationIndicator() {
    if (!orientationIndicator) return;
    
    const deviceRotation = getPhotoRotation();
    const totalRotation = (deviceRotation + manualRotation) % 360;

    // Aplica a rotação ao elemento HTML.
    // O indicador precisa de um ajuste de posição fixa, pois seu pai é absoluto.
    orientationIndicator.style.transform = `rotate(${totalRotation}deg)`; 
    
    // Alerta visual se o dispositivo estiver de cabeça para baixo (180 graus)
    if (totalRotation === 180) {
        orientationIndicator.style.color = 'red';
        orientationIndicator.style.borderColor = 'red';
        orientationIndicator.title = "Câmera de Cabeça para Baixo!";
    } else {
        orientationIndicator.style.color = 'white';
        orientationIndicator.style.borderColor = 'white';
        orientationIndicator.title = "Direção correta da foto";
    }
}


// ==================== EVENT LISTENERS ====================

if (openCameraBtn) {
    openCameraBtn.addEventListener('click', openCameraFullscreen);
}


if (backToGalleryBtn) {
    backToGalleryBtn.addEventListener('click', closeCameraFullscreen);
}

if (shutterBtn) {
    shutterBtn.addEventListener('click', capturePhoto);
}

if (switchBtn) {
    switchBtn.addEventListener('click', switchCamera);
}

// Listener para o botão de Rotação Manual (PRESERVADO)
if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
        // Lógica de rotação cumulativa 0 -> 90 -> 180 -> 270 -> 0
        manualRotation = (manualRotation + 90) % 360;
        updateOrientationIndicator();
    });
}

// Event listeners para Zoom
const zoomInBtn = document.getElementById('zoom-in-btn');
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', zoomIn);
}

const zoomOutBtn = document.getElementById('zoom-out-btn');
if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', zoomOut);
}

// Botão "Baixar Todas" (PRESERVADO)
if (downloadAllBtn) {
    downloadAllBtn.addEventListener("click", () => {
        photos.forEach((img, i) => {
            const link = document.createElement("a");
            link.href = img;
            const date = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
            link.download = `Qdelicia_Foto_${date}_${i + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
}

// Botão "Compartilhar" (PRESERVADO)
if (shareAllBtn && navigator.share) {
    shareAllBtn.addEventListener("click", () => {

        // 1. Captura os dados dos dropdowns para a legenda
        const tipoFoto = selectTipoFoto.options[selectTipoFoto.selectedIndex].text; 
        const promotor = selectPromotor.options[selectPromotor.selectedIndex].text;
        const rede = selectRede.options[selectRede.selectedIndex].text;
        const loja = selectLoja.options[selectLoja.selectedIndex].text;

        // 2. Cria a legenda dinâmica
        const now = new Date();
        const dateOptions = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit' };
        const dataFormatada = now.toLocaleDateString('pt-BR', dateOptions).replace(/,/, '').replace(/\b\d\b/g, '0$&'); 

        // Legenda com 3 linhas: Data, Tipo de Foto, Promotor/Loja
        const legendaCompartilhada = `${dataFormatada}\n${tipoFoto}\nPromotor: ${promotor}\nLoja: ${rede} ${loja}`;

        // Compartilha as 3 fotos mais recentes (limitado para compatibilidade do WhatsApp)
        const files = photos.slice(0, 3).map((img, i) => { 
            const byteString = atob(img.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let j = 0; j < byteString.length; j++) {
                ia[j] = byteString.charCodeAt(j);
            }
            return new File([ab], `Qdelicia_Foto_${i + 1}.jpg`, { type: "image/jpeg" });
        });

        navigator.share({
            files,
            title: "Fotos Qdelícia Frutas",
            text: legendaCompartilhada, // Usa a nova legenda dinâmica
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                alert(`Erro ao compartilhar: ${error.message}`);
            }
        });
    });
} else if (shareAllBtn) {
    shareAllBtn.addEventListener("click", () => {
        alert("A função de compartilhamento direto de múltiplas fotos não é suportada por este navegador. Por favor, utilize a função 'Baixar Todas' e compartilhe manually.");
    });
}

// Listener de Rotação (Função original mantida)
function handleOrientationChange() {
    if (currentStream && fullscreenCameraContainer && fullscreenCameraContainer.classList.contains('active')) {
        setTimeout(() => {
            requestCameraPermission();
        }, 150);
    }
}

try {
    screen.orientation.addEventListener("change", handleOrientationChange);
} catch (e) {
    window.addEventListener("orientationchange", handleOrientationChange);
}


// Inicializa a galeria e os dropdowns ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadAndPopulateDropdowns();
    updateGalleryView();
    updatePhotoCounter();
    detectDeviceOrientation();
});
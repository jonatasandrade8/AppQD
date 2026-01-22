// ==================== NOVAS ESTRUTURA DE DADOS PARA DROPDOWNS ====================
/**
 * @description Tipos de foto disponíveis para seleção.
 * Chave: Valor que será salvo (value),
 * Valor: Texto que será exibido no dropdown (textContent).
 */
const PHOTO_TYPES = {
    "Bancadas": "Bancadas",
    "Ponto Extra": "Ponto Extra",
    "Caixas Secas": "Caixas Secas",
    "Caminhão Encostando": "Caminhão Encostando",
    "Caminhão Saindo": "Caminhão Saindo",
    "Qualidade de Produto": "Qualidade de Produto",
    "Ação de Degustação": "Ação de Degustação",
};


// ==================== ESTRUTURA DE DADOS PARA DROPDOWNS ====================
// Hierarquia: Estado -> Rede -> Promotor -> Lojas
const APP_DATA = {
    "RN": {
        "Atacadão": {
            "Vivian": ["BR - Zona Sul"],
            "Nilson": ["Parnamirim"],
            "Inácio": ["Prudente"],
            "Amarildo": ["Zona Norte"]
        },
        "Assaí": {
            "Reginaldo": ["Zona Sul"],
            "Erivan": ["Maria Lacerda"],
            "Miqueias": ["Ponta Negra"],
            "Cosme": ["Zona Norte"]
        },
        "Nordestão": {
            "J Mauricio": ["Loja 03"],
            "Mateus": ["Loja 04"],
            "Amarildo": ["Loja 05"],
            "Cristiane": ["Loja 07"],
            "Markson": ["Loja 08", "Loja 04"]
        },
        "Carrefour": {
            "Markson": ["Zona Sul"]
        },
        "Superfácil": {
            "Neto": ["Emaús"],
            "Milagres": ["Nazaré"]
        },
        "Mar Vermelho": {
            "Markson": ["Natal", "Parnamirim"]
        }
    },
    "PE": {
        "Rede A": {
            "Promotor A": ["Loja A"]
        },
        "Rede B": {
            "Promotor B": ["Loja B"]
        }
    },
    "AL": {
        "Rede C": {
            "Promotor C": ["Loja C"]
        },
        "Rede D": {
            "Promotor D": ["Loja D"]
        }
    },
    "PB": {
        "Rede F": {
            "Promotor F": ["Loja F"]
        },
        "Rede G": {
            "Promotor G": ["Loja G"]
        }
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
const dateTimeElement = document.getElementById('date-time');
const photoList = document.getElementById('photo-list');
const downloadAllBtn = document.getElementById('download-all');
const shareAllBtn = document.getElementById('share-all');
const photoCountElement = document.getElementById('photo-count');

// --- Elementos para Rotação e Orientação (ATUALIZADO) ---
const orientationArrow = document.getElementById('orientation-arrow'); // Seta de Orientação
const portraitGuide = document.getElementById('portrait-guide'); // Guia Retrato (Rodapé)
const landscapeGuide = document.getElementById('landscape-guide'); // Guia Paisagem (Lateral)


// NOVOS ELEMENTOS: Dropdowns para Marca D'água
const selectEstado = document.getElementById('select-estado'); // NOVO: Estado
const selectTipoFoto = document.getElementById('select-tipo-foto'); // NOVO: Tipo de Foto
const selectPromotor = document.getElementById('select-promotor');
const selectRede = document.getElementById('select-rede');
const selectLoja = document.getElementById('select-loja');

let currentStream = null;
let usingFrontCamera = false;
let photos = []; // Array de URLs de fotos (Sempre começará vazio)
let hasCameraPermission = false; // Inicia como 'false'

const localStorageKey = 'qdelicia_last_selection_v2'; // Chave para persistência (v2 devido à adição do novo campo)
const PHOTOS_STORAGE_KEY = 'qdelicia_camera_photos_v1'; // Chave para persistência das fotos

/**
 * @description Salva as fotos atuais no localStorage.
 */
function savePhotosToStorage() {
    try {
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    } catch (e) {
        console.error("Erro ao salvar fotos no storage:", e);
        // Pode acontecer se quota excedida
    }
}

/**
 * @description Carrega as fotos do localStorage.
 */
function loadPhotosFromStorage() {
    try {
        const saved = localStorage.getItem(PHOTOS_STORAGE_KEY);
        if (saved) {
            photos = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Erro ao carregar fotos do storage:", e);
    }
}

// Variáveis para Zoom e Flash
let currentZoom = 1; // Zoom inicial
let maxZoom = 1; // Zoom máximo suportado pelo dispositivo
let deviceOrientation = 0; // Orientação do dispositivo em graus
let manualRotation = 0; // 0 (Retrato) ou 90 (Paisagem) - Inicialmente Retrato
const MAX_PHOTOS = 5; // Limite máximo de fotos

// Carregar a imagem da logomarca
const logoImage = new Image();
logoImage.src = './images/logo-qdelicia.png';
logoImage.onerror = () => console.error("Erro ao carregar a imagem da logomarca. Verifique o caminho.");


// --- LÓGICA DE DROP DOWNS, PERSISTÊNCIA E VALIDAÇÃO ---

/**
 * @description Salva as seleções atuais no localStorage.
 * *** Tipo de Foto NÃO é salvo para ser resetado a cada sessão. ***
 */
function saveSelection() {
    const selection = {
        estado: selectEstado.value,
        // NÃO INCLUI selectTipoFoto.value AQUI
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
    const savedSelection = JSON.parse(localStorage.getItem(localStorageKey)) || {};

    // 1. Preenche os ESTADOS
    selectEstado.innerHTML = '<option value="" disabled selected>Selecione o Estado</option>';
    Object.keys(APP_DATA).forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        selectEstado.appendChild(option);
    });
    if (savedSelection.estado) {
        selectEstado.value = savedSelection.estado;
    }

    // 2. Preenche o Tipo de Foto e GARANTE QUE ELE RECOMECE NA OPÇÃO PADRÃO
    selectTipoFoto.innerHTML = '<option value="" disabled selected>Selecione o Tipo</option>';
    Object.keys(PHOTO_TYPES).forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = PHOTO_TYPES[value];
        selectTipoFoto.appendChild(option);
    });

    // 3. Preenche as REDES baseado no Estado selecionado
    populateRede(savedSelection.estado || '');
    if (savedSelection.rede) {
        selectRede.value = savedSelection.rede;
        populatePromotor(savedSelection.estado, savedSelection.rede);
        if (savedSelection.promotor) {
            selectPromotor.value = savedSelection.promotor;
            populateLoja(savedSelection.estado, savedSelection.rede, savedSelection.promotor);
            if (savedSelection.loja) {
                selectLoja.value = savedSelection.loja;
            }
        }
    }

    // Força a validação inicial do botão
    checkCameraAccess();
    updateActionHighlight();
}

/**
 * @description Preenche as opções de Rede com base no Estado selecionado.
 */
function populateRede(estado) {
    selectRede.innerHTML = '<option value="" disabled selected>Selecione a Rede</option>';
    selectPromotor.innerHTML = '<option value="" disabled selected>Selecione na lista</option>';
    selectLoja.innerHTML = '<option value="" disabled selected>Selecione a Loja</option>';
    selectPromotor.disabled = true;
    selectLoja.disabled = true;

    if (estado && APP_DATA[estado]) {
        Object.keys(APP_DATA[estado]).forEach(rede => {
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
 * @description Preenche as opções de Promotor com base no Estado e Rede selecionados.
 */
function populatePromotor(estado, rede) {
    selectPromotor.innerHTML = '<option value="" disabled selected>Selecione na lista</option>';
    selectLoja.innerHTML = '<option value="" disabled selected>Selecione a Loja</option>';
    selectLoja.disabled = true;

    if (estado && rede && APP_DATA[estado] && APP_DATA[estado][rede]) {
        Object.keys(APP_DATA[estado][rede]).forEach(promotor => {
            const option = document.createElement('option');
            option.value = promotor;
            option.textContent = promotor;
            selectPromotor.appendChild(option);
        });
        selectPromotor.disabled = false;
    } else {
        selectPromotor.disabled = true;
    }
}

/**
 * @description Preenche as opções de Loja com base no Estado, Rede e Promotor selecionados.
 */
function populateLoja(estado, rede, promotor) {
    selectLoja.innerHTML = '<option value="" disabled selected>Selecione a Loja</option>';

    if (estado && rede && promotor && APP_DATA[estado] && APP_DATA[estado][rede] && APP_DATA[estado][rede][promotor]) {
        APP_DATA[estado][rede][promotor].forEach(loja => {
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
    // NOVO: Adicionado selectEstado.value à verificação
    const isReady = selectEstado.value && selectTipoFoto.value && selectPromotor.value && selectRede.value && selectLoja.value;

    if (isReady) {
        // Se os dropdowns estiverem preenchidos, o botão está pronto para TENTAR abrir.
        openCameraBtn.disabled = false;
        openCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Abrir Câmera';
    } else {
        // Dropdowns não preenchidos, botão bloqueado.
        openCameraBtn.disabled = true;
        openCameraBtn.innerHTML = '<i class="fas fa-lock"></i> Preencha as Informações';
    }
}

/**
 * @description Verifica o limite de fotos e atualiza a interface (Mostra/Esconde Botões).
 */
function checkPhotoLimit() {
    const cameraWrapper = document.querySelector('.camera-wrapper');
    const cameraShareBtn = document.getElementById('camera-share-btn');

    // Atualiza visibilidade do botão de share interno
    if (cameraShareBtn) {
        cameraShareBtn.style.display = photos.length > 0 ? 'flex' : 'none';

        // Atualiza o listener para garantir que funcione
        cameraShareBtn.onclick = sharePhotos;
    }

    if (cameraWrapper) {
        if (photos.length >= MAX_PHOTOS) {
            cameraWrapper.classList.add('limit-reached');
        } else {
            cameraWrapper.classList.remove('limit-reached');
        }
    }
}


// EVENT LISTENERS para os Dropdowns
if (selectEstado) {
    selectEstado.addEventListener('change', () => {
        populateRede(selectEstado.value);
        saveSelection();
        updateActionHighlight();
    });
}
if (selectRede) {
    selectRede.addEventListener('change', () => {
        populatePromotor(selectEstado.value, selectRede.value);
        saveSelection();
        updateActionHighlight();
    });
}
if (selectPromotor) {
    selectPromotor.addEventListener('change', () => {
        populateLoja(selectEstado.value, selectRede.value, selectPromotor.value);
        saveSelection();
        updateActionHighlight();
    });
}
// NOVO: Adicionado listener para o Tipo de Foto
// NOVO: Adicionado listener para o Tipo de Foto
if (selectTipoFoto) {
    // Apenas salva/checa, mas não é persistido (o valor será resetado ao recarregar a página)
    selectTipoFoto.addEventListener('change', () => {
        saveSelection();
        updateActionHighlight();
    });
}
if (selectLoja) {
    selectLoja.addEventListener('change', () => {
        saveSelection();
        updateActionHighlight();
    });
}

/**
 * @description Destaca o próximo campo obrigatório vazio.
 * Ordem: Estado -> Rede -> Promotor -> Loja -> Tipo de Foto
 */
function updateActionHighlight() {
    // Remove o destaque de todos primeiro
    const selects = [selectEstado, selectRede, selectPromotor, selectLoja, selectTipoFoto];
    selects.forEach(el => {
        if (el && el.closest('.input-group')) {
            el.closest('.input-group').classList.remove('highlight-next-step');
        }
    });

    // Função auxiliar para adicionar destaque
    const addHighlight = (el) => {
        if (el && el.closest('.input-group')) {
            el.closest('.input-group').classList.add('highlight-next-step');
        }
    };

    // Verifica a sequência e destaca o primeiro que estiver vazio/inválido
    if (!selectEstado.value) {
        addHighlight(selectEstado);
        return;
    }
    if (!selectRede.value || selectRede.disabled) {
        addHighlight(selectRede);
        return;
    }
    if (!selectPromotor.value || selectPromotor.disabled) {
        addHighlight(selectPromotor);
        return;
    }
    if (!selectLoja.value || selectLoja.disabled) {
        addHighlight(selectLoja);
        return;
    }
    if (!selectTipoFoto.value) {
        addHighlight(selectTipoFoto);
        return;
    }
}


// --- LÓGICA DA CÂMERA (requestCameraPermission agora chama checkCameraAccess) ---

/**
 * @description Solicita permissão da câmera e inicia o stream com qualidade otimizada.
 */
async function requestCameraPermission() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // Configuração otimizada para melhor qualidade e menor zoom
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

    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        // Se o usuário negar, hasCameraPermission continuará 'false'
        hasCameraPermission = false;

        // Alerta o usuário e fecha a tela cheia se algo der errado
        alert("Não foi possível iniciar a câmera. Verifique as permissões de acesso no seu navegador.");
        closeCameraFullscreen(); // Fecha a interface da câmera
    }
}

async function openCameraFullscreen() {
    // Verificação de validação extra para garantir que o botão só é clicado quando pronto
    if (openCameraBtn && openCameraBtn.disabled) return;

    if (!fullscreenCameraContainer) return;

    // Mostra a interface da câmera
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Tenta pedir a permissão (só é chamado aqui, no clique)
    await requestCameraPermission();

    // Inicializa os indicadores de rotação ao abrir a câmera
    updateRotationButton();
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
    checkCameraAccess(); // Verifica o estado do botão (que voltará a checar os dropdowns)
    checkPhotoLimit(); // Garante o estado correto da UI
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
}




function updatePhotoCounter() {
    if (photoCountElement) {
        photoCountElement.textContent = photos.length;
    }
}


// --- LÓGICA DA MARCA D'ÁGUA (capturePhoto) ---

/**
 * @description Captura o frame atual do vídeo, aplica a marca d'água formatada e salva **sem** rotação automática complexa.
 * // ** LÓGICA DE ROTAÇÃO ANTIGA DELETADA E SUBSTITUÍDA PELO MÉTODO MAIS SIMPLES **
 */
function capturePhoto() {
    // Verifica limite antes de tirar foto
    if (photos.length >= MAX_PHOTOS) {
        alert("Limite de 5 fotos atingido! Compartilhe ou exclua alguma para continuar.");
        checkPhotoLimit(); // Garante UI correta
        return;
    }
    // NOVO: Adicionada verificação para o novo campo
    if (!selectTipoFoto.value || !selectPromotor.value || !selectRede.value || !selectLoja.value) {
        alert("Por favor, preencha Tipo de Foto, Promotor, Rede e Loja antes de tirar a foto.");
        return;
    }

    // A verificação de permissão é crucial aqui
    if (!hasCameraPermission || !video || video.readyState < 2) {
        alert("Câmera não está pronta ou permissão não concedida.");
        return;
    }

    // Captura os dados da Marca D'água para impressão
    const tipoFotoText = `Tipo: ${selectTipoFoto.value}`; // NOVO CAMPO PARA MARCA D'ÁGUA
    const promotorText = `Promotor: ${selectPromotor.value}`;
    const redeText = `Rede: ${selectRede.value}`;
    const lojaText = `Loja: ${selectLoja.value}`;
    const dateText = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });

    // Linhas de texto a serem impressas no canto inferior direito, em ordem inversa de desenho (de baixo para cima)
    const watermarkLines = [dateText, lojaText, redeText, promotorText, tipoFotoText];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // --- NOVA LÓGICA DE CAPTURA SIMPLIFICADA E MARCA D'ÁGUA ---

    // 1. Usar dimensões reais do vídeo para máxima qualidade e desenhar diretamente (sem rotação complexa)
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;

    // Definir o tamanho do CANVAS para as dimensões do vídeo
    canvas.width = videoW;
    canvas.height = videoH;

    // Desenha o frame do vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // --- Configurações Comuns de Estilo e Posição para as marcas d'água ---
    // Valores adaptados para maior qualidade em resoluções grandes
    const padding = Math.max(15, Math.floor(canvas.height / 80)); // Espaçamento adaptativo
    const textBaseColor = '#FFFFFF';
    const bgColor = 'rgba(99, 102, 241, 0.8)'; // Cor Primary (Indigo) da Identidade Visual
    const defaultFontSize = Math.max(20, Math.floor(canvas.height / 40));

    // --- 1. Aplicação da Marca D'água (Texto - Canto Inferior Direito) ---
    // Fonte mais próxima da identidade visual (Inter, Segoe UI) e em Negrito
    ctx.font = `bold ${defaultFontSize * 0.9}px "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center'; // Centralizado
    ctx.textBaseline = 'bottom';

    let totalHeight = 0;
    let maxWidth = 0;

    // Calcula a largura máxima e a altura total
    watermarkLines.forEach(line => {
        maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
        totalHeight += defaultFontSize * 0.9 + (padding / 2); // Altura da linha + espaço extra
    });
    totalHeight -= (padding / 2); // Remove o último espaço extra

    // Adiciona padding extra para a caixa não ficar colada no texto
    const boxPadding = padding * 1.5;
    const boxWidth = maxWidth + 2 * boxPadding;
    const boxHeight = totalHeight + 2 * boxPadding;
    const boxX = canvas.width - boxWidth - padding;
    const boxY = canvas.height - boxHeight - padding;
    const borderRadius = 20; // Bordas arredondadas (20px)

    // Desenha o fundo com Bordas Arredondadas
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    // roundRect é suportado em navegadores modernos. Fallback simples se necessário (mas Chrome/Edge suportam)
    if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
    } else {
        ctx.rect(boxX, boxY, boxWidth, boxHeight); // Fallback quadrado
    }
    ctx.fill();

    // Borda Verde (Solicitada: Mais grossa e arredondada)
    ctx.lineWidth = Math.max(5, Math.floor(canvas.height / 200)); // Aumentado para 5 ou proporcional
    ctx.strokeStyle = '#33cc33'; // Verde
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
    } else {
        ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.stroke();

    // Desenha as linhas de texto (Centralizado na caixa)
    ctx.fillStyle = textBaseColor;
    const textCenterX = boxX + (boxWidth / 2);
    let lineY = boxY + boxHeight - boxPadding; // Começa de baixo, respeitando o padding

    // Percorre as linhas e desenha de baixo para cima
    for (let i = 0; i < watermarkLines.length; i++) {
        const line = watermarkLines[i];
        ctx.fillText(line, textCenterX, lineY);
        lineY -= (defaultFontSize * 0.9 + (padding / 2)); // Move para a linha acima
    }


    // --- 2. Aplicação da Marca D'água (Logomarca - Canto Superior Esquerdo) ---
    if (logoImage.complete && logoImage.naturalHeight !== 0) {
        const logoHeight = Math.max(50, Math.floor(canvas.height / 10));
        const logoWidth = (logoImage.naturalWidth / logoImage.naturalHeight) * logoHeight;

        ctx.drawImage(logoImage, padding, padding, logoWidth, logoHeight);
    }

    // Usar a melhor qualidade (0.9)
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);

    photos.unshift(dataURL); // Adiciona a nova foto no início
    savePhotosToStorage(); // Salva no storage
    updatePhotoCounter();
    checkPhotoLimit(); // Atualiza UI (pode bloquear botão se chegou a 5)

    updateGalleryView();
}


/**
 * @description Remove uma foto específica da galeria pelo seu índice.
 * @param {number} index - O índice da foto a ser removida.
 */
function removePhoto(index) {
    if (confirm("Tem certeza que deseja remover esta foto?")) {
        photos.splice(index, 1); // Remove 1 elemento a partir do índice
        savePhotosToStorage(); // Atualiza o storage
        updatePhotoCounter();
        checkPhotoLimit(); // Atualiza UI (libera botão se baixou de 5)
        updateGalleryView(); // Re-renderiza a galeria
    }
}

/**
 * @description Baixa uma foto individual da galeria.
 * @param {number} index - O índice da foto a ser baixada.
 */
function downloadSinglePhoto(index) {
    const photoURL = photos[index];
    if (!photoURL) return;

    const link = document.createElement("a");
    link.href = photoURL;
    const date = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    // O nome do arquivo incluirá o índice (ex: Foto 1, Foto 2)
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

        // --- HTML ATUALIZADO COM OS DOIS BOTÕES ---
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
        // --- FIM DA ATUALIZAÇÃO DO HTML ---

        photoList.appendChild(photoItem);
    });

    // --- ATUALIZAÇÃO DOS EVENT LISTENERS ---

    // Adiciona event listeners para os botões de LIXEIRA (agora .remove-single-btn)
    document.querySelectorAll('.remove-single-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const indexToRemove = parseInt(event.currentTarget.dataset.index);
            removePhoto(indexToRemove); // Reutiliza a função existente
        });
    });

    // Adiciona event listeners para os botões de DOWNLOAD (NOVOS)
    document.querySelectorAll('.download-single-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const indexToDownload = parseInt(event.currentTarget.dataset.index);
            downloadSinglePhoto(indexToDownload); // Chama a nova função
        });
    });
    // --- FIM DA ATUALIZAÇÃO DOS LISTENERS ---
}

/**
 * @description Alterna entre as câmeras frontal e traseira.
 */
function switchCamera() {
    usingFrontCamera = !usingFrontCamera;
    // Reinicia a câmera com a nova configuração
    requestCameraPermission();
}


// ==================== FUNCIONALIDADES DE ROTAÇÃO MANUAL (NOVO) ====================



/**
 * @description Atualiza o ícone do botão de rotação e a seta de orientação, e exibe as guias.
 */
function updateRotationButton() {
    const landscapeText = landscapeGuide ? landscapeGuide.querySelector('.landscape-text') : null;
    const portraitText = portraitGuide ? portraitGuide.querySelector('.portrait-text') : null;

    if (manualRotation === 0) {
        // Retrato

        if (orientationArrow) {
            orientationArrow.style.display = 'block';
            // Para apontar para CIMA (rotaciona o ícone 'fa-arrow-right' em -90deg)
            orientationArrow.style.transform = 'rotate(-90deg)';
        }
        if (portraitGuide) portraitGuide.style.display = 'block';
        if (landscapeGuide) landscapeGuide.style.display = 'none';
        if (portraitText) {
            // Modo Retrato Padrão
            portraitText.textContent = '------------ Linha de Referência ------------';
            portraitText.style.transform = 'rotate(0deg)';
        }

    } else {
        // Paisagem (90 graus)
        if (orientationArrow) {
            orientationArrow.style.display = 'block';
            // Para apontar para DIREITA (rotação padrão do ícone 'fa-arrow-right' é 0deg)
            orientationArrow.style.transform = 'rotate(0deg)';
        }
        if (portraitGuide) portraitGuide.style.display = 'none';
        if (landscapeGuide) landscapeGuide.style.display = 'block';
        if (landscapeText) {
            // NOVO TEXTO E ROTAÇÃO DE 180º SOLICITADA
            landscapeText.textContent = '------------ modo paisagem ------------';
            landscapeText.style.transform = 'rotate(0deg)';
        }
    }
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
    const alpha = event.alpha; // Rotação ao redor do eixo Z (0-360)
    const beta = event.beta;   // Rotação ao redor do eixo X (-180 a 180)
    const gamma = event.gamma; // Rotação ao redor do eixo Y (-90 a 90)

    // Determinar orientação baseado no beta (inclinação para frente/trás)
    if (Math.abs(beta) < 45) {
        deviceOrientation = 0; // Retrato normal
    } else if (beta > 45) {
        deviceOrientation = 180; // Retrato invertido
    } else if (gamma > 45) {
        deviceOrientation = 90; // Paisagem (girado para a direita)
    } else if (gamma < -45) {
        deviceOrientation = -90; // Paisagem (girado para a esquerda)
    }
}

/**
 * @description Calcula a rotação necessária para a foto
 * * ** NOTA: A ROTAÇÃO DE FATO FOI DELETADA, ESTA FUNÇÃO SÓ É MANTIDA POR COMPATIBILIDADE **
 */
function getPhotoRotation() {
    // 1. PRIORIZA A ROTAÇÃO MANUAL DO USUÁRIO
    if (manualRotation === 90) {
        return 90; // Rotação manual para Paisagem
    }
    // O manualRotation === 0 retorna 0 (Retrato), que é o fallback default abaixo

    // 2. Fallback para screen.orientation (Melhor Detecção do Browser)
    if (screen.orientation) {
        const orientation = screen.orientation.type;
        if (orientation.includes('portrait-primary')) return 0;
        if (orientation.includes('portrait-secondary')) return 180;
        if (orientation.includes('landscape-primary')) return 90;
        if (orientation.includes('landscape-secondary')) return -90;
    }

    // 3. Fallback para deviceOrientation (Sensores)
    return deviceOrientation;
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



// Event listeners para Zoom
const zoomInBtn = document.getElementById('zoom-in-btn');
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', zoomIn);
}

const zoomOutBtn = document.getElementById('zoom-out-btn');
if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', zoomOut);
}

// Botão "Baixar Todas"
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

// Função de Compartilhamento Unificada
async function sharePhotos() {
    if (!navigator.share) {
        alert("A função de compartilhamento não é suportada por este navegador/dispositivo.");
        return;
    }

    if (photos.length === 0) {
        alert("Nenhuma foto para compartilhar.");
        return;
    }

    // 1. Captura os dados dos dropdowns (Texto igual ao da marca d'água)
    const tipoFotoText = `Tipo: ${selectTipoFoto.value}`;
    const promotorText = `Promotor: ${selectPromotor.value}`;
    const redeText = `Rede: ${selectRede.value}`;
    const lojaText = `Loja: ${selectLoja.value}`;

    // Data e Hora (Recaptura para ser atual)
    const dateText = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });

    // 2. Cria a legenda idêntica à marca d'água (Ordem de leitura: Topo -> Baixo na foto)
    const legendaCompartilhada = `*Relatório Fotográfico*\n${tipoFotoText}\n${promotorText}\n${redeText}\n${lojaText}\n${dateText}`;

    try {
        const files = photos.slice(0, MAX_PHOTOS).map((img, i) => {
            const byteString = atob(img.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let j = 0; j < byteString.length; j++) {
                ia[j] = byteString.charCodeAt(j);
            }
            return new File([ab], `Qdelicia_Foto_${i + 1}.jpg`, { type: "image/jpeg" });
        });

        await navigator.share({
            files,
            title: "Fotos Qdelícia Frutas",
            text: legendaCompartilhada,
        });

        // =========================================================
        // SUCESSO NO COMPARTILHAMENTO: LIMPAR FOTOS
        // =========================================================
        photos = []; // Limpa array na memória
        localStorage.removeItem(PHOTOS_STORAGE_KEY); // Limpa do storage
        updateGalleryView(); // Atualiza UI (mostra msg vazia)
        updatePhotoCounter(); // Zera contador
        checkPhotoLimit(); // Reseta estado dos botões
        // =========================================================

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error(error);
            alert(`Erro ao compartilhar: ${error.message}`);
        }
    }
}

// Botão "Compartilhar" (Galeria)
if (shareAllBtn) {
    shareAllBtn.addEventListener("click", sharePhotos);
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
    loadPhotosFromStorage(); // Carrega fotos salvas anteriormente
    updateGalleryView();
    updatePhotoCounter();
    detectDeviceOrientation();
    checkPhotoLimit(); // Inicializa estado dos botões extras
    updateRotationButton(); // Chama para iniciar os indicadores no modo Retrato
});

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

    },
    "Edvaldo": {
        "Super Prático": ["Nova Parnamirim"],

    },
    "Carlos": {
        "Favorito": ["Nova Parnamirim"],

    },
    "Lucio": {
        "Rede Mais": ["Rosa dos Ventos", "Parque das Nações", "Satélite", "Nova Descoberta", "Candelária", "Potengi", "Pajuçara", "Alecrim"],
        "Super Show": ["Neópolis", "Ponta Negra", "Cidade Verde", "Emaús"]
    },
    "Ricardo": {
        "Rede Mais": ["Alecrim"],

    },
    "Daniel": {
        "Rebouças": ["Cidade Verde", "Ponta Negra", "Lagoa Nova"],

    },
    "Adilson": {
        "Rebouças": ["Lagoa Seca", "Centro", "Alecrim"],

    },
    "Marcos": {
        "Santa Maria": ["Zona Norte"],

    },
    "Josenildo": {
        "Santa Maria": ["Zona Sul"],

    },
    "Jailson": {
        "Comercial": ["Bezerra"],

    },
    "Ivanildo": {
        "Comercial": ["F&F"],

    },
    "Jose": {
        "Comercial": ["N&S"],

    },
    "Ailton": {
        "Comercial": ["Alves"],

    },
    "Marcelo": {
        "Comitentes": ["Loja 01"],

    }
};

// ==================== VARIÁVEIS GLOBAIS ====================
let photos = []; // Array para armazenar as fotos (como dataURLs)
let currentStream = null;
let usingFrontCamera = false;
let currentZoom = 1;
const MAX_ZOOM = 5;
const MIN_ZOOM = 1;

// ==================== NOVA VARIÁVEL DE ESTADO DE ROTAÇÃO ====================
/**
 * Controla a orientação desejada para a foto (manual).
 * Pode ser 'portrait' (vertical) ou 'landscape' (horizontal).
 */
let currentOrientation = 'portrait';
// ===========================================================================


// Seletores de Elementos (Interface Principal)
const selectTipoFoto = document.getElementById("select-tipo-foto");
const selectPromotor = document.getElementById("select-promotor");
const selectRede = document.getElementById("select-rede");
const selectLoja = document.getElementById("select-loja");
const openCameraBtn = document.getElementById("open-camera-btn");

// Seletores de Elementos (Galeria)
const photoList = document.getElementById("photo-list");
const downloadAllBtn = document.getElementById("download-all");
const shareAllBtn = document.getElementById("share-all");
const clearGalleryBtn = document.getElementById("clear-gallery");

// Seletores de Elementos (Modal da Câmera)
const fullscreenCameraContainer = document.getElementById("fullscreen-camera-container");
const video = document.getElementById("video");
const shutterBtn = document.getElementById("shutter-btn");
const switchBtn = document.getElementById("switch-btn");
const backToGalleryBtn = document.getElementById("back-to-gallery-btn");
const photoCountDisplay = document.getElementById("photo-count");
const dateTimeDisplay = document.getElementById("date-time");

// Seletores (Zoom)
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomLevelDisplay = document.getElementById('zoom-level');

// Seletores (Botão de Rotação NOVO)
const rotateBtn = document.getElementById('rotate-btn');


// Objeto para a Logo (Carrega uma vez)
const logoImage = new Image();
logoImage.src = './images/logo-qdelicia.png';
logoImage.onerror = () => console.error("Erro ao carregar a imagem da logomarca. Verifique o caminho.");

// --- LÓGICA DE DROP DOWNS, PERSISTÊNCIA E VALIDAÇÃO ---

/**
 * @description Carrega os dropdowns iniciais (Tipo de Foto e Promotor) e restaura seleções salvas.
 */
function loadAndPopulateDropdowns() {
    // 1. Popula Tipo de Foto
    if (selectTipoFoto) {
        // Limpa opções existentes (exceto a primeira "Selecione")
        while (selectTipoFoto.options.length > 1) {
            selectTipoFoto.remove(1);
        }
        for (const [value, text] of Object.entries(PHOTO_TYPES)) {
            const option = new Option(text, value);
            selectTipoFoto.add(option);
        }
    }

    // 2. Popula Promotores
    if (selectPromotor) {
        while (selectPromotor.options.length > 1) {
            selectPromotor.remove(1);
        }
        const promotores = Object.keys(APP_DATA).sort();
        promotores.forEach(promotor => {
            const option = new Option(promotor, promotor);
            selectPromotor.add(option);
        });
    }

    // 3. Restaura Seleções Salvas (localStorage)
    try {
        const savedTipo = localStorage.getItem('selectedTipoFoto');
        const savedPromotor = localStorage.getItem('selectedPromotor');
        const savedRede = localStorage.getItem('selectedRede');
        const savedLoja = localStorage.getItem('selectedLoja');

        if (savedTipo && selectTipoFoto) {
            selectTipoFoto.value = savedTipo;
        }
        if (savedPromotor && selectPromotor) {
            selectPromotor.value = savedPromotor;
            // Se um promotor foi restaurado, popula as redes dele
            populateRede(savedPromotor);
        }
        if (savedRede && selectRede) {
            selectRede.value = savedRede;
            // Se uma rede foi restaurada, popula as lojas
            populateLoja(savedPromotor, savedRede);
        }
        if (savedLoja && selectLoja) {
            selectLoja.value = savedLoja;
        }

    } catch (e) {
        console.warn("Não foi possível ler o localStorage (modo de privacidade?)", e);
    }
    
    // 4. Verifica o acesso (caso tudo já esteja preenchido)
    checkCameraAccess();
}


/**
 * @description Popula o dropdown de Redes baseado no Promotor selecionado.
 * @param {string} promotor - O nome do promotor selecionado.
 */
function populateRede(promotor) {
    // Limpa e desabilita dropdowns filhos
    selectRede.innerHTML = '<option value="">Selecione sua Rede</option>';
    selectLoja.innerHTML = '<option value="">Selecione a Loja</option>';
    selectRede.disabled = true;
    selectLoja.disabled = true;

    if (promotor && APP_DATA[promotor]) {
        const redes = Object.keys(APP_DATA[promotor]).sort();
        redes.forEach(rede => {
            const option = new Option(rede, rede);
            selectRede.add(option);
        });
        selectRede.disabled = false;
    }
    checkCameraAccess();
}

/**
 * @description Popula o dropdown de Lojas baseado no Promotor e Rede selecionados.
 * @param {string} promotor
 * @param {string} rede
 */
function populateLoja(promotor, rede) {
    selectLoja.innerHTML = '<option value="">Selecione a Loja</option>';
    selectLoja.disabled = true;

    if (promotor && rede && APP_DATA[promotor] && APP_DATA[promotor][rede]) {
        const lojas = APP_DATA[promotor][rede].sort();
        lojas.forEach(loja => {
            const option = new Option(loja, loja);
            selectLoja.add(option);
        });
        selectLoja.disabled = false;
    }
    checkCameraAccess();
}

/**
 * @description Salva as seleções atuais no localStorage.
 */
function saveSelections() {
    try {
        if (selectTipoFoto) localStorage.setItem('selectedTipoFoto', selectTipoFoto.value);
        if (selectPromotor) localStorage.setItem('selectedPromotor', selectPromotor.value);
        if (selectRede) localStorage.setItem('selectedRede', selectRede.value);
        if (selectLoja) localStorage.setItem('selectedLoja', selectLoja.value);
    } catch (e) {
        console.warn("Não foi possível salvar no localStorage (modo de privacidade?)", e);
    }
}

/**
 * @description Verifica se todos os campos estão preenchidos para liberar o botão da câmera.
 */
function checkCameraAccess() {
    // NOVO: Adicionado selectTipoFoto.value à verificação
    const isReady = selectTipoFoto.value && selectPromotor.value && selectRede.value && selectLoja.value;
    if (openCameraBtn) {
        openCameraBtn.disabled = !isReady;
    }
}

// --- LÓGICA DA CÂMERA (ABRIR/FECHAR/STREAM) ---

/**
 * @description Abre o modal da câmera e solicita permissão.
 */
function openCameraFullscreen() {
    // Verificação extra para garantir que o botão só é clicado quando pronto
    if (openCameraBtn && openCameraBtn.disabled) return;
    if (!fullscreenCameraContainer) return;

    // Mostra a interface da câmera
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden'; // Impede o scroll da página principal

    // Reseta o zoom e a orientação para o padrão ao abrir
    currentZoom = 1;
    updateZoomDisplay();

    // ==================== RESET DA ROTAÇÃO MANUAL ====================
    currentOrientation = 'portrait'; // Sempre começa em portrait
    if (rotateBtn) {
        rotateBtn.querySelector('i').style.transform = 'rotate(0deg)';
    }
    // ================================================================

    // Inicia a câmera
    requestCameraPermission();

    // Inicia o relógio
    startClock();
}

/**
 * @description Fecha o modal da câmera e para os streams de vídeo.
 */
function closeCameraFullscreen() {
    if (!fullscreenCameraContainer) return;

    fullscreenCameraContainer.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restaura o scroll

    // Para o stream da câmera
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }

    // Para o relógio
    stopClock();
    
    // Garante que o vídeo pare de processar
    if (video) {
        video.pause();
        video.srcObject = null;
    }
}

/**
 * @description Solicita permissão e inicia o stream da câmera.
 */
async function requestCameraPermission() {
    // Para qualquer stream antigo
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            facingMode: usingFrontCamera ? "user" : "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
        },
        audio: false
    };

    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        
        // Aguarda o vídeo começar a tocar para aplicar o zoom
        video.onloadedmetadata = () => {
            applyZoom();
        };

    } catch (err) {
        console.error("Erro ao acessar a câmera: ", err);
        alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
        closeCameraFullscreen();
    }
}

/**
 * @description Alterna entre as câmeras frontal e traseira.
 */
function switchCamera() {
    usingFrontCamera = !usingFrontCamera;
    // Reinicia a câmera com a nova configuração
    requestCameraPermission();
}

// ==================== FUNCIONALIDADES DE ZOOM ====================

/**
 * @description Aplica o nível de zoom atual ao stream de vídeo.
 */
function applyZoom() {
    if (!currentStream) return;
    
    const videoTrack = currentStream.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities();

    if (capabilities.zoom) {
        // Converte nosso zoom (1-5) para a escala min/max da câmera
        const minZoom = capabilities.zoom.min || 1;
        const maxZoom = capabilities.zoom.max || 5;
        
        // Mapeia nosso range (1-MAX_ZOOM) para o range (minZoom-maxZoom)
        const targetZoom = minZoom + (currentZoom - 1) * (maxZoom - minZoom) / (MAX_ZOOM - MIN_ZOOM);
        
        videoTrack.applyConstraints({ advanced: [{ zoom: Math.min(Math.max(targetZoom, minZoom), maxZoom) }] });
    } else {
        // Fallback para navegadores que não suportam zoom (ex: CSS zoom)
        // video.style.transform = `scale(${currentZoom})`;
        console.warn("Zoom via API não é suportado neste dispositivo.");
    }
    updateZoomDisplay();
}

/**
 * @description Atualiza o mostrador de zoom na tela.
 */
function updateZoomDisplay() {
    if (zoomLevelDisplay) {
        zoomLevelDisplay.textContent = `${currentZoom.toFixed(1)}x`;
    }
}


// --- LÓGICA DE TIRAR FOTO E MARCA D'ÁGUA ---

/**
 * @description Captura o frame do vídeo, aplica rotação manual, marca d'água e salva.
 * (ESTA É A FUNÇÃO PRINCIPAL MODIFICADA)
 */
function takePhoto() {
    if (!video || !currentStream) return;

    // 1. Pega as dimensões REAIS do stream de vídeo (Ex: 1080 L x 1920 A)
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;

    // 2. Cria o canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // ===================================================================
    // INÍCIO DA LÓGICA DE ROTAÇÃO MANUAL (SUBSTITUIÇÃO)
    // ===================================================================

    // Verifica a variável global 'currentOrientation' definida pelo 'rotate-btn'
    if (currentOrientation === 'landscape') {
        // Se o usuário quer a foto DEITADA (Landscape)
        
        // A. O canvas deve ter as dimensões TROCADAS
        // (Se o vídeo é 1080x1920, o canvas será 1920x1080)
        canvas.width = videoH;
        canvas.height = videoW;

        // B. Move o ponto 0,0 do canvas para o centro
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // C. Rotaciona o CONTEXTO em 90 graus
        ctx.rotate(Math.PI / 2); // (Math.PI / 2) é 90 graus

        // D. Desenha o vídeo (que está em pé) no canvas rotacionado
        // (Temos que "puxar" o desenho de volta para o centro, por isso -videoW/2 e -videoH/2)
        ctx.drawImage(video, -videoW / 2, -videoH / 2, videoW, videoH);

        // E. DESFAZ a rotação e translação para que a marca d'água
        // seja aplicada corretamente (em (0,0) do canvas já rotacionado)
        ctx.rotate(-Math.PI / 2);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

    } else {
        // Se o usuário quer a foto EM PÉ (Portrait) - Comportamento padrão
        canvas.width = videoW;
        canvas.height = videoH;
        ctx.drawImage(video, 0, 0, videoW, videoH);
    }

    // ===================================================================
    // FIM DA LÓGICA DE ROTAÇÃO MANUAL
    // ===================================================================

    // 3. Aplica a marca d'água e o logo no canvas JÁ ORIENTADO
    applyWatermarkAndLogo(ctx, canvas.width, canvas.height);

    // 4. Salva a foto (como DataURL)
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    
    // Coleta os metadados da foto
    const metadata = {
        dataURL: dataURL,
        tipo: selectTipoFoto.value,
        promotor: selectPromotor.value,
        rede: selectRede.value,
        loja: selectLoja.value,
        date: new Date().toISOString() // Data/Hora da captura
    };
    
    photos.push(metadata);

    // 5. Atualiza a interface
    updateGalleryView();
    updatePhotoCounter();

    // 6. Fecha a câmera
    closeCameraFullscreen();
}


/**
 * @description Aplica a logomarca e o texto (data, promotor, etc.) no canvas.
 * @param {CanvasRenderingContext2D} ctx - O contexto do canvas.
 * @param {number} w - A largura do canvas (width).
 * @param {number} h - A altura do canvas (height).
 */
function applyWatermarkAndLogo(ctx, w, h) {
    // --- 1. Desenha a Logomarca (Canto Superior Esquerdo) ---
    if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
        const padding = Math.max(20, w * 0.015); // 1.5% da largura ou 20px
        
        // Define a altura da logo (ex: 8% da altura do canvas)
        const logoHeight = Math.max(50, h * 0.08); 
        const logoWidth = (logoImage.naturalWidth / logoImage.naturalHeight) * logoHeight;

        // Adiciona um fundo branco semi-transparente atrás da logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(padding - 5, padding - 5, logoWidth + 10, logoHeight + 10);
        
        ctx.drawImage(logoImage, padding, padding, logoWidth, logoHeight);
    } else {
        console.warn("Logo não desenhada. Imagem não carregada ou quebrada.");
    }

    // --- 2. Configurações do Texto da Marca D'água (Canto Inferior Direito) ---
    
    // Define o tamanho da fonte baseado na dimensão menor (altura em retrato, largura em paisagem)
    const baseDimension = Math.min(w, h);
    const fontSize = Math.max(24, Math.floor(baseDimension * 0.025)); // 2.5% da dimensão menor
    
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Texto branco sólido
    ctx.shadowColor = 'rgba(0, 0, 0, 1)'; // Sombra preta sólida
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    const padding = Math.max(20, w * 0.015);
    let currentY = h - padding; // Começa de baixo para cima

    // --- 3. Coleta os textos ---
    const dataHora = new Date().toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const textoTipoFoto = `TIPO: ${selectTipoFoto.value || 'N/A'}`;
    const textoLoja = `LOJA: ${selectLoja.value || 'N/A'}`;
    const textoRede = `REDE: ${selectRede.value || 'N/A'}`;
    const textoPromotor = `PROMOTOR: ${selectPromotor.value || 'N/A'}`;

    // --- 4. Escreve os textos (de baixo para cima) ---
    ctx.textAlign = 'right';
    
    ctx.fillText(dataHora, w - padding, currentY);
    currentY -= (fontSize * 1.3); // Move para a linha de cima

    ctx.fillText(textoTipoFoto, w - padding, currentY);
    currentY -= (fontSize * 1.3);

    ctx.fillText(textoLoja, w - padding, currentY);
    currentY -= (fontSize * 1.3);
    
    ctx.fillText(textoRede, w - padding, currentY);
    currentY -= (fontSize * 1.3);

    ctx.fillText(textoPromotor, w - padding, currentY);
}


// --- LÓGICA DO RELÓGIO (LIVE PREVIEW) ---

let clockInterval = null;
/**
 * @description Inicia o relógio na interface da câmera.
 */
function startClock() {
    stopClock(); // Garante que não haja intervalos duplicados
    
    function updateTime() {
        if (dateTimeDisplay) {
            dateTimeDisplay.textContent = new Date().toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        }
    }
    updateTime(); // Chama imediatamente
    clockInterval = setInterval(updateTime, 1000); // Atualiza a cada segundo
}
/**
 * @description Para o relógio.
 */
function stopClock() {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}

// --- LÓGICA DA GALERIA (CRUD) ---

/**
 * @description Atualiza o contador de fotos na tela da câmera.
 */
function updatePhotoCounter() {
    if (photoCountDisplay) {
        photoCountDisplay.textContent = photos.length;
    }
}

/**
 * @description Redesenha a galeria de fotos com os itens do array `photos`.
 */
function updateGalleryView() {
    if (!photoList) return;

    photoList.innerHTML = ''; // Limpa a galeria

    if (photos.length === 0) {
        photoList.innerHTML = '<p class="gallery-empty-message">Nenhuma foto tirada ainda.</p>';
    }

    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = photo.dataURL;

        // Info (Metadados)
        const info = document.createElement('div');
        info.className = 'photo-info';
        info.innerHTML = `
            <strong>${photo.tipo}</strong><br>
            ${photo.loja} (${photo.rede})<br>
            ${new Date(photo.date).toLocaleString('pt-BR')}
        `;
        
        // Controles (Excluir)
        const controls = document.createElement('div');
        controls.className = 'photo-controls';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete';
        deleteBtn.title = 'Excluir esta foto';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => deletePhoto(index);

        controls.appendChild(deleteBtn);

        photoItem.appendChild(img);
        photoItem.appendChild(info);
        photoItem.appendChild(controls);
        photoList.appendChild(photoItem);
    });

    // Habilita/Desabilita botões de ação da galeria
    const hasPhotos = photos.length > 0;
    if (downloadAllBtn) downloadAllBtn.disabled = !hasPhotos;
    if (shareAllBtn) shareAllBtn.disabled = !hasPhotos;
    if (clearGalleryBtn) clearGalleryBtn.disabled = !hasPhotos;
}

/**
 * @description Deleta uma foto do array `photos` e atualiza a galeria.
 * @param {number} index - O índice da foto a ser excluída.
 */
function deletePhoto(index) {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
        photos.splice(index, 1); // Remove a foto do array
        updateGalleryView(); // Atualiza a galeria
        updatePhotoCounter(); // Atualiza o contador (na câmera)
    }
}

/**
 * @description Limpa todas as fotos da galeria.
 */
function clearGallery() {
    if (confirm("Tem certeza que deseja LIMPAR TODAS as fotos da galeria? Esta ação não pode ser desfeita.")) {
        photos = []; // Esvazia o array
        updateGalleryView();
        updatePhotoCounter();
    }
}

// --- LÓGICA DE DOWNLOAD E COMPARTILHAMENTO ---

/**
 * @description Faz o download de todas as fotos da galeria como um arquivo ZIP.
 * (Esta função precisa da biblioteca JSZip para funcionar)
 */
async function downloadAllPhotos() {
    if (photos.length === 0) return;

    // Verifica se a biblioteca JSZip está carregada
    if (typeof JSZip === 'undefined') {
        alert("Erro: A biblioteca de compressão (JSZip) não foi carregada. O download não pode continuar.");
        console.error("JSZip não está definido. Adicione a biblioteca JSZip ao seu HTML.");
        // Exemplo: <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
        return;
    }

    const zip = new JSZip();
    const folderName = `Fotos_QDelicia_${selectPromotor.value || 'Promotor'}_${new Date().toISOString().split('T')[0]}`;
    const folder = zip.folder(folderName);

    // Adiciona cada foto ao ZIP
    photos.forEach((photo, index) => {
        const data = photo.dataURL.split(',')[1]; // Remove o 'data:image/jpeg;base64,'
        const fileName = `Foto_${index + 1}_${photo.tipo.replace(/ /g, '_')}_${photo.loja.replace(/ /g, '_')}.jpg`;
        folder.file(fileName, data, { base64: true });
    });

    // Gera o arquivo ZIP
    try {
        const content = await zip.generateAsync({ type: "blob" });
        
        // Cria um link de download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
    } catch (e) {
        console.error("Erro ao gerar o ZIP:", e);
        alert("Ocorreu um erro ao gerar o arquivo ZIP.");
    }
}


/**
 * @description (Função 'Baixar Todas' VAZIA - Depende do JSZip)
 */
if (downloadAllBtn) {
    downloadAllBtn.addEventListener("click", () => {
         alert("Função 'Baixar Todas' ainda não implementada.\n\n(Requer a biblioteca JSZip, que não foi detectada neste arquivo.)");
         // Para implementar, adicione o script do JSZip no HTML e chame:
         // downloadAllPhotos();
    });
}


/**
 * @description Compartilha todas as fotos usando a API Web Share.
 */
if (shareAllBtn) {
    // Verifica se a API de Share e 'canShare' (para arquivos) estão disponíveis
    if (navigator.share && navigator.canShare) {
        
        shareAllBtn.addEventListener("click", () => {
            if (photos.length === 0) return;

            // 1. Converte DataURLs (base64) para Blobs/Files
            const files = photos.map((photo, i) => {
                const byteString = atob(photo.dataURL.split(',')[1]);
                const mimeString = photo.dataURL.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let j = 0; j < byteString.length; j++) {
                    ia[j] = byteString.charCodeAt(j);
                }
                // Nome do arquivo com metadados
                const fileName = `Foto_${i + 1}_${photo.tipo}_${photo.loja}.jpg`;
                return new File([ab], fileName, { type: mimeString });
            });

            // 2. Monta a legenda
            const firstPhoto = photos[0];
            const legenda = `Fotos Qdelícia
Promotor: ${firstPhoto.promotor}
Rede/Loja: ${firstPhoto.rede} - ${firstPhoto.loja}
Total de fotos: ${photos.length}`;

            // 3. Verifica se o navegador PODE compartilhar esses arquivos
            if (navigator.canShare({ files: files })) {
                // 4. Tenta compartilhar
                navigator.share({
                    files: files,
                    title: `Fotos Qdelícia (${firstPhoto.loja})`,
                    text: legenda,
                }).catch((error) => {
                    if (error.name !== 'AbortError') { // Ignora se o usuário cancelou
                        console.error('Erro ao compartilhar:', error);
                        alert(`Erro ao compartilhar: ${error.message}`);
                    }
                });
            } else {
                alert("O navegador não suporta o compartilhamento deste número ou tipo de arquivos.");
            }
        });

    } else {
        // Fallback se o 'navigator.share' não existe
        shareAllBtn.addEventListener("click", () => {
            alert("A função de compartilhamento de arquivos não é suportada por este navegador. Use o botão 'Baixar Todas' e compartilhe manualmente.");
        });
        shareAllBtn.disabled = true; // Desabilita se não for suportado
    }
}


// ==================== EVENT LISTENERS (GERAL) ====================

// Listeners dos Dropdowns
document.addEventListener('DOMContentLoaded', () => {
    
    // Carrega os dados dos dropdowns
    loadAndPopulateDropdowns();

    if (selectPromotor) {
        selectPromotor.addEventListener('change', (e) => {
            populateRede(e.target.value);
            saveSelections();
        });
    }
    if (selectRede) {
        selectRede.addEventListener('change', (e) => {
            populateLoja(selectPromotor.value, e.target.value);
            saveSelections();
        });
    }
    if (selectLoja) {
        selectLoja.addEventListener('change', () => {
            checkCameraAccess(); // Verifica se pode abrir
            saveSelections();
        });
    }
    if (selectTipoFoto) {
        selectTipoFoto.addEventListener('change', () => {
            checkCameraAccess(); // Verifica se pode abrir
            saveSelections();
        });
    }

    // Botão de Limpar Galeria
    if (clearGalleryBtn) {
        clearGalleryBtn.addEventListener('click', clearGallery);
    }
});


// ==================== EVENT LISTENERS (CÂMERA) ====================

// Abrir Câmera
if (openCameraBtn) {
    openCameraBtn.addEventListener('click', openCameraFullscreen);
}
// Fechar Câmera
if (backToGalleryBtn) {
    backToGalleryBtn.addEventListener('click', closeCameraFullscreen);
}
// Bater Foto
if (shutterBtn) {
    shutterBtn.addEventListener('click', takePhoto);
}
// Trocar Câmera
if (switchBtn) {
    switchBtn.addEventListener('click', switchCamera);
}

// ==================== NOVO LISTENER DE ROTAÇÃO MANUAL ====================
if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
        const icon = rotateBtn.querySelector('i');
        if (currentOrientation === 'portrait') {
            currentOrientation = 'landscape';
            if (icon) icon.style.transform = 'rotate(90deg)';
        } else {
            currentOrientation = 'portrait';
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    });
}
// ========================================================================


// Listeners de Zoom
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 0.5, MAX_ZOOM);
        applyZoom();
    });
}
if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 0.5, MIN_ZOOM);
        applyZoom();
    });
}


// ==================== LISTENER DE ROTAÇÃO (AUTOMÁTICO) - DESABILITADO ====================
// Comentado conforme solicitado, para priorizar o botão manual.

/*
function handleOrientationChange() {
    // Reinicia a câmera para tentar ajustar o aspect ratio
    // (Pode ser lento e indesejado)
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
*/
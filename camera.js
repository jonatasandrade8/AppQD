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
        "Superfácil": ["Olho d'Água"],
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
const dateTimeElement = document.getElementById('date-time');
const photoList = document.getElementById('photo-list');
const downloadAllBtn = document.getElementById('download-all');
const shareAllBtn = document.getElementById('share-all');
const photoCountElement = document.getElementById('photo-count');

// NOVOS ELEMENTOS: Dropdowns para Marca D'água
const selectPromotor = document.getElementById('select-promotor'); 
const selectRede = document.getElementById('select-rede'); 
const selectLoja = document.getElementById('select-loja'); 

let currentStream = null;
let usingFrontCamera = false;
let photos = []; // Array de URLs de fotos (Sempre começará vazio)
let hasCameraPermission = false;
const localStorageKey = 'qdelicia_last_selection'; // Chave para persistência (APENAS DROPDOWNS)

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
    // 1. Preenche o Promotor
    Object.keys(APP_DATA).forEach(promotor => {
        const option = document.createElement('option');
        option.value = promotor;
        option.textContent = promotor;
        selectPromotor.appendChild(option);
    });

    const savedSelection = JSON.parse(localStorage.getItem(localStorageKey));

    if (savedSelection && savedSelection.promotor) {
        selectPromotor.value = savedSelection.promotor;
        // 2. Preenche a Rede baseada no Promotor salvo
        populateRede(savedSelection.promotor);
        selectRede.value = savedSelection.rede;
        // 3. Preenche a Loja baseada na Rede salva
        if (savedSelection.rede) {
            populateLoja(savedSelection.promotor, savedSelection.rede);
            selectLoja.value = savedSelection.loja;
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

/**
 * @description Verifica se todos os campos estão preenchidos para liberar a câmera.
 */
function checkCameraAccess() {
    const isReady = selectPromotor.value && selectRede.value && selectLoja.value;
    
    if (openCameraBtn) {
        if (isReady && hasCameraPermission) {
            openCameraBtn.disabled = false;
            openCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Abrir Câmera'; // Ícone atualizado
        } else if (isReady && !hasCameraPermission) {
            // Acesso liberado, mas esperando a permissão da câmera
            openCameraBtn.disabled = true;
            openCameraBtn.innerHTML = '<i class="fas fa-video"></i> Aguardando Câmera...';
        } else {
            openCameraBtn.disabled = true;
            openCameraBtn.innerHTML = '<i class="fas fa-lock"></i> Preencha as Informações';
        }
    }
}

// EVENT LISTENERS para os Dropdowns
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


// --- LÓGICA DA CÂMERA (requestCameraPermission agora chama checkCameraAccess) ---

/**
 * @description Solicita permissão da câmera e inicia o stream. (MODIFICADO)
 */
async function requestCameraPermission() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // --- INÍCIO DA MODIFICAÇÃO (CORREÇÃO DE ROTAÇÃO) ---
        // Removemos o 'width' e 'height' ideais para FORÇAR paisagem.
        // Agora, o navegador irá escolher a melhor resolução PARA A ORIENTAÇÃO ATUAL 
        // (ex: 1080x1920 em retrato, 1920x1080 em paisagem).
        const constraints = {
            video: {
                facingMode: usingFrontCamera ? "user" : "environment"
                // Removido: width: { ideal: 4096 }, 
                // Removido: height: { ideal: 2160 }
            },
            audio: false
        };
        // --- FIM DA MODIFICAÇÃO ---

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        hasCameraPermission = true;
        checkCameraAccess(); // Atualiza o botão

    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        if (fullscreenCameraContainer && fullscreenCameraContainer.classList.contains('active')) {
            alert("Não foi possível iniciar a câmera. Verifique as permissões de acesso.");
            closeCameraFullscreen();
        }
        hasCameraPermission = false;
        
        if (openCameraBtn) {
            openCameraBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sem Acesso à Câmera';
            openCameraBtn.disabled = true;
        }
    }
}

function openCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestCameraPermission();
}

function closeCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    fullscreenCameraContainer.classList.remove('active');
    document.body.style.overflow = '';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    checkCameraAccess(); // Chama a verificação para resetar o status do botão
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
}


// --- LÓGICA DA MARCA D'ÁGUA (capturePhoto) ---
// (Esta função NÃO precisa de mudanças. Ela já é flexível)
/**
 * @description Captura o frame atual do vídeo, aplica a marca d'água formatada e salva.
 */
function capturePhoto() {
    if (!selectPromotor.value || !selectRede.value || !selectLoja.value) {
        alert("Por favor, preencha Promotor, Rede e Loja antes de tirar a foto.");
        return;
    }

    if (!hasCameraPermission || !video || video.readyState < 2) {
        alert("Câmera não está pronta ou permissão não concedida.");
        return;
    }
    
    // Captura os dados da Marca D'água para impressão
    const promotorText = `Promotor: ${selectPromotor.value}`;
    const redeText = `Rede: ${selectRede.value}`;
    const lojaText = `Loja: ${selectLoja.value}`;
    const dateText = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });

    // Linhas de texto a serem impressas no canto inferior direito, em ordem inversa de desenho (de baixo para cima)
    const watermarkLines = [dateText, lojaText, redeText, promotorText];
    

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // O canvas terá o tamanho do *stream* de vídeo (seja retrato ou paisagem)
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    
    // --- Configurações Comuns de Estilo e Posição ---
    const padding = Math.max(15, Math.floor(canvas.height / 80)); // Espaçamento
    const textBaseColor = '#FFFFFF';
    const bgColor = 'rgba(0, 0, 0, 0.7)';
    const defaultFontSize = Math.max(20, Math.floor(canvas.height / 40)); 
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    // --- 1. Aplicação da Marca D'água (Texto - Canto Inferior Direito) ---
    ctx.font = `${defaultFontSize * 0.9}px Arial, sans-serif`;
    let totalHeight = 0;
    let maxWidth = 0;

    // Calcula a largura máxima e a altura total
    watermarkLines.forEach(line => {
        maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
        totalHeight += defaultFontSize * 0.9 + (padding / 2); // Altura da linha + espaço extra
    });
    totalHeight -= (padding / 2); // Remove o último espaço extra

    // Desenha o fundo único para todas as linhas
    ctx.fillStyle = bgColor; 
    ctx.fillRect(
        canvas.width - maxWidth - 2*padding, // Posição X (começa da direita para a esquerda)
        canvas.height - totalHeight - 2*padding, // Posição Y (de baixo para cima)
        maxWidth + 2*padding, 
        totalHeight + 2*padding
    );

    // Desenha as linhas de texto
    ctx.fillStyle = textBaseColor; 
    let lineY = canvas.height - 2 * padding; // Posição inicial para o primeiro texto (dateText)

    // Percorre as linhas e desenha de baixo para cima
    for (let i = 0; i < watermarkLines.length; i++) {
        const line = watermarkLines[i];
        ctx.fillText(line, canvas.width - padding, lineY);
        lineY -= (defaultFontSize * 0.9 + (padding / 2)); // Move para a linha acima
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
 * @param {number} index - O índice da foto a ser removida.
 */
function removePhoto(index) {
    if (confirm("Tem certeza que deseja remover esta foto?")) {
        photos.splice(index, 1); // Remove 1 elemento a partir do índice
        updatePhotoCounter();
        updateGalleryView(); // Re-renderiza a galeria
    }
}

/**
 * @description Atualiza o HTML da galeria com as fotos salvas.
 */
function updateGalleryView() {
    if (!photoList) return;

    photoList.innerHTML = '';
    
    const isDisabled = photos.length === 0;
    if(downloadAllBtn) downloadAllBtn.disabled = isDisabled;
    if(shareAllBtn) shareAllBtn.disabled = isDisabled;

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
        
        // HTML ATUALIZADO COM O BOTÃO LIXEIRA
        photoItem.innerHTML = `
            <img src="${photoURL}" alt="Foto ${index + 1}">
            <button class="delete-photo-btn" data-index="${index}">
                <i class="fas fa-trash-alt"></i>
            </button>
            <div class="photo-info">Foto ${index + 1}</div>
        `;
        photoList.appendChild(photoItem);
    });

    // Adiciona event listeners para os botões de lixeira
    document.querySelectorAll('.delete-photo-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Impede que o clique se propague para outros elementos
            event.stopPropagation(); 
            const indexToRemove = parseInt(event.currentTarget.dataset.index);
            removePhoto(indexToRemove);
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


// ==================== EVENT LISTENERS ====================

if (openCameraBtn) {
    openCameraBtn.addEventListener('click', openCameraFullscreen);
    requestCameraPermission(); 
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

if (downloadAllBtn) {
    downloadAllBtn.addEventListener("click", () => {
        photos.forEach((img, i) => {
            const link = document.createElement("a");
            link.href = img;
            const date = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
            link.download = `Qdelicia_Foto_${date}_${i+1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
}

// ==================================================================
// SESSÃO DE COMPARTILHAMENTO - (Mantida como na última versão)
// ==================================================================
if (shareAllBtn && navigator.share) {
    shareAllBtn.addEventListener("click", () => {
        
        // 1. Captura os dados dos dropdowns para a legenda
        const promotor = selectPromotor.options[selectPromotor.selectedIndex].text;
        const rede = selectRede.options[selectRede.selectedIndex].text;
        const loja = selectLoja.options[selectLoja.selectedIndex].text;
        
        // 2. Cria a legenda dinâmica
        const legendaCompartilhada = `${promotor}\nRede: ${rede}\nLoja: ${loja}`;

        const files = photos.slice(0, 3).map((img, i) => { // Compartilha as 3 fotos mais recentes
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
        alert("A função de compartilhamento direto de múltiplas fotos não é suportada por este navegador. Por favor, utilize a função 'Baixar Todas' e compartilhe manualmente.");
    });
}

// ==================================================================
// --- INÍCIO DA MODIFICAÇÃO (OUVINTE DE ROTAÇÃO) ---
/**
 * @description Lida com a mudança de orientação do dispositivo.
 */
function handleOrientationChange() {
    // Apenas reinicia a câmera se ela estiver aberta (ativa)
    if (currentStream && fullscreenCameraContainer && fullscreenCameraContainer.classList.contains('active')) {
        
        // Um pequeno atraso é bom para dar tempo ao navegador se ajustar
        setTimeout(() => {
            requestCameraPermission();
        }, 150);
    }
}

// Adiciona o "ouvinte" moderno (screen.orientation) e o antigo (orientationchange)
try {
    screen.orientation.addEventListener("change", handleOrientationChange);
} catch (e) {
    window.addEventListener("orientationchange", handleOrientationChange);
}
// --- FIM DA MODIFICAÇÃO ---
// ==================================================================


// Inicializa a galeria e os dropdowns ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadAndPopulateDropdowns();
    updateGalleryView(); 
    updatePhotoCounter();
});

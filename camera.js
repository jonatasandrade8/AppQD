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
const dateTimeElement = document.getElementById('date-time');
const photoList = document.getElementById('photo-list');
const downloadAllBtn = document.getElementById('download-all');
const shareAllBtn = document.getElementById('share-all');
const photoCountElement = document.getElementById('photo-count');

// NOVOS ELEMENTOS: Dropdowns para Marca D'água
const selectPromotor = document.getElementById('select-promotor'); 
const selectRede = document.getElementById('select-rede'); 
const selectLoja = document.getElementById('select-loja'); 

// NOVOS ELEMENTOS: Controles Avançados
const zoomRange = document.getElementById('zoom-range');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const flashToggleBtn = document.getElementById('flash-toggle-btn');


let currentStream = null;
let usingFrontCamera = false;
let photos = []; // Array de URLs de fotos (Sempre começará vazio)
let hasCameraPermission = false; // Inicia como 'false'
let currentTrack = null; // Rastreia a trilha de vídeo atual
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

// ==================================================================
// --- INÍCIO DA MODIFICAÇÃO (CORREÇÃO DE PERMISSÃO) ---
/**
 * @description Verifica se os dropdowns estão preenchidos para liberar o botão da câmera.
 */
function checkCameraAccess() {
    const isReady = selectPromotor.value && selectRede.value && selectLoja.value;
    
    if (openCameraBtn) {
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
}
// --- FIM DA MODIFICAÇÃO ---
// ==================================================================


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


// --- LÓGICA DA CÂMERA E CONTROLES AVANÇADOS (ADICIONADOS) ---

/**
 * @description Configura e habilita os controles de Zoom e Flash se suportados pelo dispositivo.
 */
function setupAdvancedControls() {
    if (!currentStream) return;
    
    // Pega a trilha de vídeo
    currentTrack = currentStream.getVideoTracks()[0];
    if (!currentTrack) return;
    
    const capabilities = currentTrack.getCapabilities();
    const advancedControls = document.querySelector('.advanced-controls');
    
    // Esconde todos por padrão
    advancedControls.style.display = 'none';

    // --- LÓGICA DO ZOOM ---
    if (capabilities.zoom && zoomRange) {
        const maxZoom = capabilities.zoom.max;
        const minZoom = capabilities.zoom.min;
        const stepZoom = capabilities.zoom.step;
        
        zoomRange.min = minZoom;
        zoomRange.max = maxZoom;
        zoomRange.step = stepZoom;
        zoomRange.value = minZoom; // Inicia no menor zoom possível

        document.querySelector('.zoom-controls').style.display = 'flex';
        advancedControls.style.display = 'flex';
        
        zoomRange.oninput = () => {
            currentTrack.applyConstraints({ advanced: [{ zoom: parseFloat(zoomRange.value) }] }).catch(e => console.error("Erro no Zoom:", e));
        };
        
        if (zoomInBtn) {
            zoomInBtn.onclick = () => {
                const newZoom = Math.min(maxZoom, parseFloat(zoomRange.value) + parseFloat(stepZoom * 5));
                zoomRange.value = newZoom;
                zoomRange.dispatchEvent(new Event('input')); 
            };
        }
        if (zoomOutBtn) {
            zoomOutBtn.onclick = () => {
                const newZoom = Math.max(minZoom, parseFloat(zoomRange.value) - parseFloat(stepZoom * 5));
                zoomRange.value = newZoom;
                zoomRange.dispatchEvent(new Event('input')); 
            };
        }
    } else if (zoomRange) {
        document.querySelector('.zoom-controls').style.display = 'none';
    }

    // --- LÓGICA DO FLASH/Torch ---
    if (capabilities.torch && flashToggleBtn) {
        flashToggleBtn.style.display = 'flex'; 
        advancedControls.style.display = 'flex';
        let isFlashOn = false;
        
        // Garante que o estado inicial do botão seja 'off'
        flashToggleBtn.classList.remove('flash-on');
        flashToggleBtn.classList.add('flash-off');


        flashToggleBtn.onclick = async () => {
            isFlashOn = !isFlashOn;
            
            // Requer que a trilha seja "mutável" (em teoria)
            await currentTrack.applyConstraints({ 
                advanced: [{ torch: isFlashOn }]
            }).then(() => {
                // Atualiza o estilo do botão para feedback visual
                if (isFlashOn) {
                    flashToggleBtn.classList.remove('flash-off');
                    flashToggleBtn.classList.add('flash-on');
                } else {
                    flashToggleBtn.classList.remove('flash-on');
                    flashToggleBtn.classList.add('flash-off');
                }
            }).catch(e => {
                 console.error("Erro ao tentar ligar/desligar o flash:", e);
                 isFlashOn = !isFlashOn; // Reverte o estado em caso de falha
            });
        };
    } else if (flashToggleBtn) {
        flashToggleBtn.style.display = 'none';
    }
}


/**
 * @description Solicita permissão da câmera e inicia o stream com alta qualidade e correção de rotação.
 */
async function requestCameraPermission() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // --- NOVAS CONSTRAINTS PARA ALTA QUALIDADE E MENOR ZOOM POSSÍVEL ---
        const constraints = {
            audio: false,
            video: {
                // Prioriza a câmera traseira (environment)
                facingMode: usingFrontCamera ? "user" : "environment",
                
                // Tenta capturar na melhor resolução (Alta Qualidade) para o menor zoom óptico
                width: { ideal: 4096 },  
                height: { ideal: 2160 }, 
            }
        };
        
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        hasCameraPermission = true; // Permissão concedida!
        
        // Configura e verifica controles avançados (Zoom, Flash)
        setupAdvancedControls(); 

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
    if (!fullscreenCameraContainer) return;
    
    // Mostra a interface da câmera
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Tenta pedir a permissão (só é chamado aqui, no clique)
    await requestCameraPermission();
}

function closeCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    fullscreenCameraContainer.classList.remove('active');
    document.body.style.overflow = '';
    if (currentStream) {
        // Desliga o flash/torch ao fechar (boa prática)
        if (currentTrack) {
             currentTrack.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
        }
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    // --- INÍCIO DA MODIFICAÇÃO (CORREÇÃO DE PERMISSÃO) ---
    hasCameraPermission = false; // Reinicia o estado da permissão
    // --- FIM DA MODIFICAÇÃO ---
    checkCameraAccess(); // Verifica o estado do botão (que voltará a checar os dropdowns)
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


// --- LÓGICA DA MARCA D'ÁGUA (capturePhoto) COM CORREÇÃO DE ROTAÇÃO ---
/**
 * @description Captura o frame atual do vídeo, aplica a marca d'água formatada e salva.
 */
function capturePhoto() {
    if (!selectPromotor.value || !selectRede.value || !selectLoja.value) {
        alert("Por favor, preencha Promotor, Rede e Loja antes de tirar a foto.");
        return;
    }

    // A verificação de permissão é crucial aqui
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

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // --- CORREÇÃO DE ROTAÇÃO (HEURÍSTICA PARA RETRATO) ---
    let renderWidth = videoWidth;
    let renderHeight = videoHeight;
    let rotation = 0; 
    
    // Se a tela estiver em retrato (height > width) e o stream for paisagem (width > height), 
    // giramos 90 graus e invertemos as dimensões do canvas.
    if (window.innerHeight > window.innerWidth && videoWidth > videoHeight) {
        rotation = Math.PI / 2; // 90 graus em radianos
        renderWidth = videoHeight;
        renderHeight = videoWidth;
    } 
    // --- FIM DA CORREÇÃO DE ROTAÇÃO ---
    
    canvas.width = renderWidth;
    canvas.height = renderHeight;

    // Aplica a transformação de rotação e translação (no centro)
    ctx.translate(renderWidth / 2, renderHeight / 2); 
    ctx.rotate(rotation);
    
    // Desenha a imagem. As coordenadas são ajustadas para o centro, e o drawImage usa as dimensões originais do vídeo.
    ctx.drawImage(video, -videoWidth / 2, -videoHeight / 2, videoWidth, videoHeight);

    // Reverte a transformação para desenhar o texto/logo na orientação correta (topo-esquerda/inferior-direita)
    ctx.rotate(-rotation);
    ctx.translate(-renderWidth / 2, -renderHeight / 2);

    const finalWidth = canvas.width;
    const finalHeight = canvas.height;
    
    // --- Configurações Comuns de Estilo e Posição (Usando finalWidth/finalHeight) ---
    const padding = Math.max(15, Math.floor(finalHeight / 80)); // Espaçamento
    const textBaseColor = '#FFFFFF';
    const bgColor = 'rgba(0, 0, 0, 0.7)';
    const defaultFontSize = Math.max(20, Math.floor(finalHeight / 40)); 
    
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
        finalWidth - maxWidth - 2*padding, // Posição X (começa da direita para a esquerda)
        finalHeight - totalHeight - 2*padding, // Posição Y (de baixo para cima)
        maxWidth + 2*padding, 
        totalHeight + 2*padding
    );

    // Desenha as linhas de texto
    ctx.fillStyle = textBaseColor; 
    let lineY = finalHeight - 2 * padding; // Posição inicial para o primeiro texto (dateText)

    // Percorre as linhas e desenha de baixo para cima
    for (let i = 0; i < watermarkLines.length; i++) {
        const line = watermarkLines[i];
        ctx.fillText(line, finalWidth - padding, lineY);
        lineY -= (defaultFontSize * 0.9 + (padding / 2)); // Move para a linha acima
    }


    // --- 2. Aplicação da Marca D'água (Logomarca - Canto Superior Esquerdo) ---
    if (logoImage.complete && logoImage.naturalHeight !== 0) {
        const logoHeight = Math.max(50, Math.floor(finalHeight / 10)); 
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
            
            <div class="photo-info">Foto ${index + 1}</div>
        `;
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


// ==================== EVENT LISTENERS ====================

// ==================================================================
// --- INÍCIO DA MODIFICAÇÃO (CORREÇÃO DE PERMISSÃO) ---
if (openCameraBtn) {
    openCameraBtn.addEventListener('click', openCameraFullscreen);
    // A chamada requestCameraPermission() FOI REMOVIDA DAQUI
}
// --- FIM DA MODIFICAÇÃO ---
// ==================================================================


if (backToGalleryBtn) {
    backToGalleryBtn.addEventListener('click', closeCameraFullscreen);
}

if (shutterBtn) {
    shutterBtn.addEventListener('click', capturePhoto);
}

if (switchBtn) {
    switchBtn.addEventListener('click', switchCamera);
}

// Botão "Baixar Todas" (Função original mantida)
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

// Botão "Compartilhar" (Função original mantida)
if (shareAllBtn && navigator.share) {
    shareAllBtn.addEventListener("click", () => {
        
        // 1. Captura os dados dos dropdowns para a legenda
        const promotor = selectPromotor.options[selectPromotor.selectedIndex].text;
        const rede = selectRede.options[selectRede.selectedIndex].text;
        const loja = selectLoja.options[selectLoja.selectedIndex].text;
        
        // 2. Cria a legenda dinâmica
        const legendaCompartilhada = `Promotor: ${promotor}\nLoja: ${rede} ${loja}`;

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
});
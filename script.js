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
    "Inácio": {
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


// ================= MENU HAMBÚRGUER e VOLTAR AO TOPO (Preservados) =================
// ... (Código do Menu Hambúrguer)
const menuToggle = document.querySelector('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const menuOverlay = document.querySelector('.menu-overlay');

if (menuToggle && sideMenu && menuOverlay) {
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });
    
    sideMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    });
}

// ... (Código do Botão Voltar ao Topo)
const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ... (Código do Carrossel - Preservado)
const carouselSlides = document.querySelector('.carousel-slides');
const slides = document.querySelectorAll('.carousel-slides .slide');
const dots = document.querySelectorAll('.carousel-dots .dot');

if (carouselSlides && slides.length > 0) {
    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
        carouselSlides.style.transform = `translateX(${-currentIndex * 100 / totalSlides}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add('active');
        }
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    setInterval(nextSlide, 3000);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    updateCarousel();
}


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
let photos = [];
let hasCameraPermission = false;
const localStorageKey = 'qdelicia_last_selection'; // Chave para persistência

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
 * @param {string} promotor - O nome do promotor selecionado.
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
 * @param {string} promotor - O nome do promotor.
 * @param {string} rede - O nome da rede selecionada.
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
            openCameraBtn.innerHTML = '<i class="fas fa-video"></i> Câmera Pronta';
        } else if (isReady && !hasCameraPermission) {
            // Acesso liberado, mas esperando a permissão da câmera
            openCameraBtn.disabled = true;
            openCameraBtn.innerHTML = '<i class="fas fa-video"></i> Aguardando Câmera...';
        } else {
            openCameraBtn.disabled = true;
            openCameraBtn.innerHTML = '<i class="fas fa-lock"></i> Preencha as Informações Acima';
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
 * @description Solicita permissão da câmera e inicia o stream com alta qualidade.
 */
async function requestCameraPermission() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: {
                facingMode: usingFrontCamera ? "user" : "environment",
                width: { ideal: 4096 }, 
                height: { ideal: 2160 }
            },
            audio: false
        };

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

// ... (openCameraFullscreen e closeCameraFullscreen permanecem iguais) ...
function openCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    // ... (restante da função) ...
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestCameraPermission();
}

function closeCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    // ... (restante da função) ...
    fullscreenCameraContainer.classList.remove('active');
    document.body.style.overflow = '';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    checkCameraAccess(); // Chama a verificação para resetar o status do botão
}


// ... (updateDateTime e updatePhotoCounter permanecem iguais) ...
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


// --- LÓGICA DA MARCA D'ÁGUA (capturePhoto) ATUALIZADA ---

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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    
    // --- Configurações Comuns de Estilo e Posição ---
    const padding = Math.max(15, Math.floor(canvas.height / 80)); // Espaçamento
    const textBaseColor = '#FFFFFF';
    const bgColor = 'rgba(0, 0, 0, 0.7)';
    const defaultFontSize = Math.max(20, Math.floor(canvas.height / 40)); 
    let currentY = canvas.height - padding; // Ponto inicial (canto inferior)
    
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
    
    photos.unshift(dataURL); 
    updatePhotoCounter();
    
    if (photos.length > 10) {
        photos.pop(); 
    }

    updateGalleryView();
}

/**
 * @description Atualiza o HTML da galeria com as fotos salvas.
 */
// ... (updateGalleryView permanece igual) ...
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
        
        photoItem.innerHTML = `
            <img src="${photoURL}" alt="Foto ${index + 1}">
            <div class="photo-info">Foto ${index + 1}</div>
        `;
        photoList.appendChild(photoItem);
    });
}

/**
 * @description Alterna entre as câmeras frontal e traseira.
 */
// ... (switchCamera permanece igual) ...
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

// ... (Botões Baixar Todas e Compartilhar Todas - Preservados) ...
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

// ==================== EVENT LISTENERS ====================
// ... (código anterior preservado) ...

if (shareAllBtn && navigator.share) {
    shareAllBtn.addEventListener("click", () => {
        
        // RECUPERA OS VALORES ATUAIS DOS DROPDOWNS
        const selectedRede = selectRede.value;
        const selectedLoja = selectLoja.value;
        
        // CRIA O NOVO COMENTÁRIO/TEXTO PARA O WHATSAPP
        const whatsappText = `________🍍|Agrícola Qdelícia Frutas|🍌________\n___|Rede: ${selectedRede} || Loja: ${selectedLoja}___|`;
        
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
            // <--- LINHA MODIFICADA AQUI: USANDO A NOVA VARIÁVEL whatsappText
            text: whatsappText, 
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

// Inicializa a galeria e os dropdowns ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadAndPopulateDropdowns();
    updateGalleryView(); 
    updatePhotoCounter();
});

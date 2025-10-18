// ================= MENU HAMBÚRGUER (Refatorado para Side Menu) =================
const menuToggle = document.querySelector('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const menuOverlay = document.querySelector('.menu-overlay');

if (menuToggle && sideMenu && menuOverlay) {
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    // Fecha o menu ao clicar no overlay ou em um link
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

// ================= BOTÃO VOLTAR AO TOPO (Funcionalidade Preservada) =================
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

// ==================== FUNCIONALIDADES DO CARROSSEL (Funcionalidade Preservada) ====================
// Nota: O carrossel não está presente no HTML, mas a lógica foi mantida
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

// NOVO: Elemento de input de texto para o nome da loja/PDV
const watermarkTextInput = document.getElementById('watermark-text-input'); 

let currentStream = null;
let usingFrontCamera = false;
let photos = [];
let hasCameraPermission = false;

// NOVO: Carregar a imagem da logomarca para uso no Canvas
const logoImage = new Image();
logoImage.src = './images/logo-qdelicia.png'; // Verifique se o caminho está correto!
logoImage.onerror = () => console.error("Erro ao carregar a imagem da logomarca. Verifique o caminho.");


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

        if (openCameraBtn) {
            openCameraBtn.innerHTML = '<i class="fas fa-video"></i> Câmera Pronta';
            openCameraBtn.disabled = false;
        }

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

/**
 * @description Abre o contêiner da câmera em fullscreen.
 */
function openCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestCameraPermission();
}

/**
 * @description Fecha o contêiner da câmera em fullscreen e para o stream.
 */
function closeCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    fullscreenCameraContainer.classList.remove('active');
    document.body.style.overflow = '';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    if (openCameraBtn) {
        openCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Abrir Câmera em Fullscreen';
    }
    // Re-solicita a permissão para que o botão volte a refletir o status
    requestCameraPermission(); 
}


/**
 * @description Atualiza a data e hora na marca d'água em tempo real na tela.
 */
function updateDateTime() {
    const now = new Date();
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    }
}
setInterval(updateDateTime, 1000); 


/**
 * @description Atualiza o contador de fotos na tela (apenas o número).
 */
function updatePhotoCounter() {
    if (photoCountElement) {
        photoCountElement.textContent = photos.length;
    }
}

/**
 * @description Captura o frame atual do vídeo, aplica a marca d'água (Logo, Texto, Data/Hora) e salva.
 */
function capturePhoto() {
    if (!hasCameraPermission || !video || video.readyState < 2) {
        alert("Câmera não está pronta ou permissão não concedida.");
        return;
    }
    
    // Captura o texto adicional do input
    const additionalText = watermarkTextInput ? watermarkTextInput.value.trim() : '';

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const nowText = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    
    // --- Configurações Comuns de Estilo e Posição ---
    const padding = Math.max(15, Math.floor(canvas.height / 80)); // Espaçamento interno
    const textBaseColor = '#FFFFFF';
    const bgColor = 'rgba(0, 0, 0, 0.7)';
    const defaultFontSize = Math.max(20, Math.floor(canvas.height / 40)); 
    let currentY = canvas.height - padding; // Ponto inicial no canto inferior direito
    
    // --- 1. Aplicação da Marca D'água (Texto Data/Hora - Canto Inferior Direito) ---
    ctx.font = `${defaultFontSize * 0.9}px Arial, sans-serif`; 
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    // Desenha Fundo
    let textMetrics = ctx.measureText(nowText);
    let textWidth = textMetrics.width;
    let textHeight = defaultFontSize * 0.9;
    
    ctx.fillStyle = bgColor; 
    // Ajusta a área do fundo para o texto Data/Hora
    ctx.fillRect(canvas.width - textWidth - 2*padding, currentY - textHeight - 2*padding + padding, textWidth + 2*padding, textHeight + padding);
    
    // Desenha Texto
    ctx.fillStyle = textBaseColor; 
    ctx.fillText(nowText, canvas.width - padding, currentY - padding);
    
    currentY -= textHeight + padding; // Prepara a posição Y para o próximo elemento
    
    // --- 2. Aplicação da Marca D'água (Texto Adicional - Acima da Data/Hora) ---
    if (additionalText) {
        ctx.font = `${defaultFontSize}px Arial, sans-serif`; 
        textMetrics = ctx.measureText(additionalText);
        textWidth = textMetrics.width;
        textHeight = defaultFontSize;
        
        // Desenha Fundo
        ctx.fillStyle = bgColor; 
        // Ajusta a área do fundo para o Texto Adicional
        ctx.fillRect(canvas.width - textWidth - 2*padding, currentY - textHeight - 2*padding + padding, textWidth + 2*padding, textHeight + padding);

        // Desenha Texto
        ctx.fillStyle = textBaseColor; 
        ctx.fillText(additionalText, canvas.width - padding, currentY - padding);
    }
    
    // --- 3. Aplicação da Marca D'água (Logomarca - Canto Superior Esquerdo) ---
    if (logoImage.complete && logoImage.naturalHeight !== 0) {
        // Define a altura da logo como 10% da altura do vídeo
        const logoHeight = Math.max(50, Math.floor(canvas.height / 10)); 
        // Calcula a largura mantendo a proporção original
        const logoWidth = (logoImage.naturalWidth / logoImage.naturalHeight) * logoHeight; 
        
        // Desenha a logo no canto superior esquerdo com padding
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
function switchCamera() {
    usingFrontCamera = !usingFrontCamera;
    requestCameraPermission();
}


// ==================== EVENT LISTENERS ====================

if (openCameraBtn) {
    openCameraBtn.addEventListener('click', openCameraFullscreen);
    // Tenta iniciar a câmera logo no carregamento para habilitar o botão
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

// Botão Baixar Todas (Funcionalidade Preservada)
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

// Botão Compartilhar Todas (Funcionalidade Preservada)
if (shareAllBtn && navigator.share) {
    shareAllBtn.addEventListener("click", () => {
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
            text: " Agícola Qdelícia Frutas|| Fotos",
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

// Inicializa a galeria ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    updateGalleryView(); 
    updatePhotoCounter();
});
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


// ==================== FUNCIONALIDADES DA CÂMERA E VÍDEO (Refatorado o Contador) ====================

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

let currentStream = null;
let usingFrontCamera = false;
let photos = [];
let hasCameraPermission = false;


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
    requestCameraPermission(); 
}


/**
 * @description Atualiza a data e hora na marca d'água.
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
        // Mostra apenas o número, conforme solicitado
        photoCountElement.textContent = photos.length;
    }
}

/**
 * @description Captura o frame atual do vídeo, aplica a marca d'água e salva.
 */
function capturePhoto() {
    if (!hasCameraPermission || !video || video.readyState < 2) {
        alert("Câmera não está pronta ou permissão não concedida.");
        return;
    }
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const nowText = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    
    // --- Aplicação da Marca D'água (Texto) ---
    const fontSize = Math.max(20, Math.floor(canvas.height / 30));
    const padding = Math.max(10, Math.floor(canvas.height / 100));
    const x = canvas.width / 2;
    const y = canvas.height - padding;
    
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Fundo da Marca D'água
    const textMetrics = ctx.measureText(nowText);
    const textWidth = textMetrics.width;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
    ctx.fillRect(x - textWidth/2 - padding, y - fontSize - padding, textWidth + 2*padding, fontSize + 2*padding);
    
    // Texto
    ctx.fillStyle = '#FFFFFF'; 
    ctx.fillText(nowText, x, y - padding);

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
                <img src="https://via.placeholder.com/150x120?text=Nenhuma+foto" alt="placeholder">
                <div class="photo-info">Tire uma foto para começar</div>
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
            text: "Fotos de comprovação do trabalho. Seguem em anexo.",
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
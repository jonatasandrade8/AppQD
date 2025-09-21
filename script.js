// ================= MENU HAMBÚRGUER =================
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
}

// ================= BOTÃO VOLTAR AO TOPO =================
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
// ... (código existente do menu e do botão "voltar ao topo") ...

// ==================== FUNCIONALIDADES DO CARROSSEL ====================
const carouselSlides = document.querySelector('.carousel-slides');
const dotsContainer = document.querySelector('.carousel-dots');
const slides = document.querySelectorAll('.carousel-slides .slide');
const dots = document.querySelectorAll('.carousel-dots .dot');

let currentIndex = 0;
const totalSlides = slides.length;

function updateCarousel() {
    carouselSlides.style.transform = `translateX(${-currentIndex * 100 / totalSlides}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
}

// Rola o carrossel a cada 3 segundos
setInterval(nextSlide, 3000);

// Adiciona funcionalidade aos pontos de navegação
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
    });
});
// ==================== FUNCIONALIDADES DA CÂMERA E VÍDEO ====================
const video = document.getElementById('video');
const canvas = document.getElementById('hidden-canvas');
const shutterBtn = document.getElementById('shutter-btn');
const recordBtn = document.getElementById('record-btn');
const dateTimeElement = document.getElementById('date-time');
const watermarkTextElement = document.getElementById('text-watermark');
const watermarkTextInput = document.getElementById('watermark-text');
const mediaList = document.getElementById('media-list');
const downloadAllBtn = document.getElementById('download-all');
const shareAllBtn = document.getElementById('share-all');
const requestCameraBtn = document.getElementById('request-camera');
const reloadPageBtn = document.getElementById('reload-page');
const countdownElement = document.getElementById('countdown');

let currentStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let mediaHistory = [];
let hasCameraPermission = false;
let isRecording = false;

// Solicitar permissão da câmera
async function requestCameraPermission() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: {
                facingMode: "environment",
                width: { ideal: 4096 },
                height: { ideal: 2160 }
            },
            audio: false
        };

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        hasCameraPermission = true;
        requestCameraBtn.innerHTML = '<i class="fas fa-check"></i> Câmera Permitida';
        requestCameraBtn.style.background = '#4caf50';
    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        alert("Não foi possível acessar a câmera. Verifique permissões.");
        hasCameraPermission = false;
        requestCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Permitir Câmera';
        requestCameraBtn.style.background = '#ff5722';
    }
}

// Atualizar data, hora e texto da marca d'água
function updateWatermark() {
    const now = new Date();
    const formattedDate = now.toLocaleString('pt-BR');
    const textValue = watermarkTextInput.value;
    
    dateTimeElement.textContent = formattedDate;
    watermarkTextElement.textContent = textValue;
}
setInterval(updateWatermark, 1000);

// Capturar foto
function capturePhoto() {
    if (!hasCameraPermission) {
        alert("Permissão de câmera não concedida. Clique em 'Permitir Câmera'.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date().toLocaleString('pt-BR');
    const customText = watermarkTextInput.value;
    
    const baseFontSize = 68;
    const padding = 15;
    const textY = canvas.height - padding;
    const textX = canvas.width - padding;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.font = `bold ${baseFontSize}px Arial`;
    ctx.textAlign = "right";

    const lines = [customText, now].filter(line => line);
    let currentY = textY - (lines.length - 1) * (baseFontSize + 10);
    lines.forEach(line => {
        ctx.fillText(line, textX, currentY);
        currentY += baseFontSize + 10;
    });

    const photoData = canvas.toDataURL("image/jpeg", 1.0);
    mediaHistory.unshift({ type: 'image', data: photoData, timestamp: Date.now() });
    updateMediaList();

    downloadAllBtn.disabled = false;
    shareAllBtn.disabled = false;
}

// Iniciar gravação de vídeo
function startRecording() {
    if (!hasCameraPermission) {
        alert("Permissão de câmera não concedida. Clique em 'Permitir Câmera'.");
        return;
    }

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(currentStream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        mediaHistory.unshift({ type: 'video', data: videoUrl, blob: videoBlob, timestamp: Date.now() });
        updateMediaList();
        downloadAllBtn.disabled = false;
        shareAllBtn.disabled = false;
    };

    mediaRecorder.start();
    isRecording = true;
    recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
    shutterBtn.style.display = 'none';
    countdownElement.style.display = 'block';

    let countdown = 15;
    countdownElement.textContent = countdown;
    const timer = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(timer);
            stopRecording();
        }
    }, 1000);
}

// Parar gravação de vídeo
function stopRecording() {
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        recordBtn.innerHTML = '<i class="fas fa-video"></i>';
        shutterBtn.style.display = 'block';
        countdownElement.style.display = 'none';
    }
}

// Atualizar lista de mídias
function updateMediaList() {
    mediaList.innerHTML = "";
    mediaHistory.slice(0, 6).forEach(media => {
        const div = document.createElement("div");
        div.className = "photo-item";
        
        if (media.type === 'image') {
            div.innerHTML = `<img src="${media.data}" alt="foto"><div class="photo-info">Foto registrada</div>`;
        } else if (media.type === 'video') {
            div.innerHTML = `<video src="${media.data}" controls muted></video><div class="photo-info">Vídeo registrado</div>`;
        }
        
        mediaList.appendChild(div);
    });
}

// Recarregar a página
function reloadPage() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    window.location.reload(true);
}

// Event listeners
if (shutterBtn && recordBtn && requestCameraBtn && downloadAllBtn && shareAllBtn && reloadPageBtn) {
    shutterBtn.addEventListener("click", capturePhoto);
    recordBtn.addEventListener("click", () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });
    requestCameraBtn.addEventListener("click", requestCameraPermission);
    reloadPageBtn.addEventListener("click", reloadPage);

    downloadAllBtn.addEventListener("click", () => {
        mediaHistory.forEach((media, i) => {
            const link = document.createElement("a");
            link.href = media.data;
            if (media.type === 'image') {
                link.download = `qdelicia_photo_${media.timestamp}.jpg`;
            } else if (media.type === 'video') {
                link.download = `qdelicia_video_${media.timestamp}.webm`;
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    shareAllBtn.addEventListener("click", async () => {
        if (navigator.share) {
            const files = await Promise.all(mediaHistory.map(async (media) => {
                let blob = null;
                if (media.type === 'image') {
                    blob = await (await fetch(media.data)).blob();
                    return new File([blob], `qdelicia_photo_${media.timestamp}.jpg`, { type: "image/jpeg" });
                } else if (media.type === 'video') {
                    return new File([media.blob], `qdelicia_video_${media.timestamp}.webm`, { type: "video/webm" });
                }
            }));
            
            const shareText = watermarkTextInput.value || "Minhas mídias";
            navigator.share({
                files,
                title: "Qdelícia Frutas - Mídias",
                text: shareText
            }).catch(() => alert("Compartilhamento não suportado neste dispositivo."));
        } else {
            alert("Compartilhamento não suportado neste dispositivo.");
        }
    });
}

// Inicialização
window.addEventListener("load", () => {
    updateWatermark();
});
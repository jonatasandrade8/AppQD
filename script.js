// ================= MENU E BOTÃO TOPO (código original) =================
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

// ==================== FUNCIONALIDADES DA CÂMERA ====================
const cameraContainer = document.querySelector('.camera-container');
const video = document.getElementById('video');
const shutterBtn = document.getElementById('shutter-btn');
const switchBtn = document.getElementById('switch-btn');
const controls = document.querySelector('.controls');
const dateTimeElement = document.getElementById('date-time');
const photoList = document.getElementById('photo-list');
const downloadAllBtn = document.getElementById('download-all');
const shareAllBtn = document.getElementById('share-all');
const requestCameraBtn = document.getElementById('request-camera');
const reloadPageBtn = document.getElementById('reload-page');
const shareTextInput = document.getElementById('share-text');

let currentStream = null;
let usingFrontCamera = false;
let photos = [];
let hasCameraPermission = false;

// Solicitar permissão da câmera
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

        // Ativa o modo de tela cheia no contêiner da câmera
        if (cameraContainer.requestFullscreen) {
            cameraContainer.requestFullscreen();
        } else if (cameraContainer.mozRequestFullScreen) {
            cameraContainer.mozRequestFullScreen();
        } else if (cameraContainer.webkitRequestFullscreen) {
            cameraContainer.webkitRequestFullscreen();
        } else if (cameraContainer.msRequestFullscreen) {
            cameraContainer.msRequestFullscreen();
        }
        
        requestCameraBtn.innerHTML = '<i class="fas fa-check"></i> Câmera Ativa';
        requestCameraBtn.style.background = '#4caf50';
        controls.style.display = 'flex';

    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        alert("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
        hasCameraPermission = false;
        requestCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Permitir Câmera';
        requestCameraBtn.style.background = 'var(--primary-color)';
        controls.style.display = 'none';
    }
}

// Atualizar data e hora
function updateDateTime() {
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleString('pt-BR');
}
setInterval(updateDateTime, 1000);

// Capturar foto
function capturePhoto() {
    if (!hasCameraPermission) {
        alert("Permissão de câmera não concedida. Clique em 'Permitir Câmera'.");
        return;
    }
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date().toLocaleString('pt-BR');
    if (dateTimeElement) {
        dateTimeElement.textContent = now;
    }
    
    const baseFontSize = 68;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    const textPadding = 15;
    const textHeight = baseFontSize;
    const bgHeight = textHeight + (textPadding * 2);
    const bgY = canvas.height - bgHeight;

    ctx.fillRect(0, bgY, canvas.width, bgHeight);
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${baseFontSize}px Arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(now, canvas.width / 2, bgY + (bgHeight / 2));

    const photoData = canvas.toDataURL("image/jpeg", 1.0);
    photos.unshift(photoData);
    updateGallery();

    downloadAllBtn.disabled = false;
    shareAllBtn.disabled = false;
}

// Atualizar galeria
function updateGallery() {
    photoList.innerHTML = "";
    photos.slice(0,6).forEach(img => {
        const div = document.createElement("div");
        div.className = "photo-item";
        div.innerHTML = `<img src="${img}" alt="foto"><div class="photo-info">Foto registrada</div>`;
        photoList.appendChild(div);
    });
    if (photos.length === 0) {
        photoList.innerHTML = `
            <div class="photo-item">
                <img src="https://via.placeholder.com/150x120?text=Nenhuma+foto" alt="placeholder">
                <div class="photo-info">Tire uma foto para começar</div>
            </div>
        `;
    }
}

// Recarregar a página
function reloadPage() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    window.location.reload(true);
}

// Event listeners
shutterBtn.addEventListener("click", capturePhoto);

switchBtn.addEventListener("click", () => {
    usingFrontCamera = !usingFrontCamera;
    if (hasCameraPermission) {
        requestCameraPermission();
    }
});

requestCameraBtn.addEventListener("click", requestCameraPermission);
reloadPageBtn.addEventListener("click", reloadPage);

downloadAllBtn.addEventListener("click", () => {
    photos.slice(0,6).forEach((img, i) => {
        const link = document.createElement("a");
        link.href = img;
        link.download = `qdelicia_foto_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}_${i+1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

shareAllBtn.addEventListener("click", () => {
    if (navigator.share && navigator.canShare && photos.length > 0) {
        const files = photos.slice(0,6).map((img, i) => {
            const byteString = atob(img.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
            return new File([ab], `qdelicia_foto_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}_${i+1}.jpg`, { type: "image/jpeg" });
        });
        
        const shareText = shareTextInput.value || "Registro de Frutas Qdelícia.";

        navigator.share({ 
            files, 
            title: "Registro Qdelícia Frutas", 
            text: shareText 
        }).catch((err) => {
            console.error("Erro no compartilhamento:", err);
            alert("Não foi possível compartilhar. O navegador pode não suportar ou você não tem um aplicativo de compartilhamento compatível.");
        });
    } else {
        alert("O compartilhamento não é suportado neste dispositivo ou não há fotos para compartilhar.");
    }
});

// Inicialização
window.addEventListener("load", () => {
    updateDateTime();
    controls.style.display = 'none'; // Esconde os controles até a câmera ser ligada
    updateGallery(); // Garante que a mensagem de "nenhuma foto" apareça
});
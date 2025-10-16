// ================= MENU HAMBÚRGUER (MOBILE) / SIDEBAR (DESKTOP) =================

const menuToggleButtons = document.querySelectorAll('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const menuOverlay = document.querySelector('.menu-overlay');

if (sideMenu && menuOverlay) {
    menuToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (window.innerWidth < 1024) { 
                sideMenu.classList.toggle('active');
                menuOverlay.classList.toggle('active');
            }
        });
    });

    menuOverlay.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        }
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


// ==================== FUNCIONALIDADES DO CARROSSEL ====================
if (document.querySelector('.carousel-slides')) {
    const carouselSlides = document.querySelector('.carousel-slides');
    const slides = document.querySelectorAll('.carousel-slides .slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    const slideDuration = 4000;

    function updateCarousel() {
        const offset = -currentIndex * 100;
        carouselSlides.style.transform = `translateX(${offset}%)`;

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToNextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    updateCarousel();

    let interval = setInterval(goToNextSlide, slideDuration);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(interval);
            currentIndex = index;
            updateCarousel();
            interval = setInterval(goToNextSlide, slideDuration);
        });
    });
}


// ==================== FUNCIONALIDADES DA CÂMERA E VÍDEO ====================
if (document.getElementById('video')) {
    const video = document.getElementById('video');
    const shutterBtn = document.getElementById('shutter-btn');
    const switchBtn = document.getElementById('switch-btn');
    const dateTimeElement = document.getElementById('date-time');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    const lastPhotoPreview = document.getElementById('last-photo-preview');
    const photoCountElement = document.getElementById('photo-count');
    const shareAllBtn = document.getElementById('share-all');
    const shareTextInput = document.getElementById('share-text');

    let currentStream = null;
    let usingFrontCamera = false;
    let photos = [];
    let hasCameraPermission = false;

    // Função para solicitar e iniciar o feed da câmera
    async function requestCameraPermission() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        try {
            loadingOverlay.classList.remove('hidden');
            
            const constraints = {
                video: {
                    facingMode: usingFrontCamera ? "user" : "environment",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = currentStream;
            
            // Aguarda o vídeo estar pronto
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
            
            hasCameraPermission = true;
            video.style.transform = usingFrontCamera ? 'scaleX(-1)' : 'scaleX(1)';
            loadingOverlay.classList.add('hidden');
            
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            loadingOverlay.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff4444;"></i>
                <p style="text-align: center; padding: 0 20px;">
                    Não foi possível acessar a câmera.<br>
                    Verifique as permissões do navegador.
                </p>
                <a href="index.html" style="margin-top: 20px; padding: 10px 20px; background: white; color: black; border-radius: 5px; text-decoration: none;">
                    Voltar
                </a>
            `;
            hasCameraPermission = false;
        }
    }

    // Atualiza data e hora
    function updateDateTime() {
        const now = new Date();
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit'
        };
        dateTimeElement.textContent = now.toLocaleString('pt-BR', options);
    }
    
    // Atualiza o contador de fotos e preview
    function updateGalleryUI(newPhotoDataURL) {
        photos.unshift(newPhotoDataURL); 

        photoCountElement.textContent = photos.length;
        photoCountElement.classList.add('photo-count-visible'); 
        
        lastPhotoPreview.innerHTML = `<img src="${newPhotoDataURL}" alt="Prévia da última foto tirada">`;
        
        if (photos.length > 0) {
            shareAllBtn.disabled = false;
        }
    }

    // Capturar foto com marca d'água
    function capturePhoto() {
        if (!hasCameraPermission || video.readyState !== video.HAVE_ENOUGH_DATA) {
            console.warn("Câmera não está pronta");
            return;
        }
        
        // Efeito de flash
        video.style.filter = 'brightness(1.5)';
        setTimeout(() => { video.style.filter = 'brightness(1.0)'; }, 150);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Corrige espelhamento para câmera frontal
        if (usingFrontCamera) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reseta transformação
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Adiciona marca d'água
        const now = new Date();
        const watermarkText = `Qdelícia Frutas | ${now.toLocaleString('pt-BR')}`;
        
        const fontSize = Math.max(canvas.width / 30, 24);
        ctx.font = `bold ${fontSize}px sans-serif`; 
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        const padding = canvas.height * 0.05;
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - padding);
        
        // Gera DataURL final
        const finalPhotoDataURL = canvas.toDataURL('image/jpeg', 0.92);
        
        updateGalleryUI(finalPhotoDataURL);
        
        // Feedback sonoro (vibração)
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    // Trocar Câmera
    switchBtn.addEventListener('click', () => {
        usingFrontCamera = !usingFrontCamera;
        if (hasCameraPermission) {
            requestCameraPermission();
        }
    });

    // Event Listener do Obturador
    shutterBtn.addEventListener('click', capturePhoto);

    // Compartilhar no WhatsApp
    shareAllBtn.addEventListener("click", async () => {
        if (!navigator.share && !navigator.canShare) {
            alert("Compartilhamento não suportado neste dispositivo/navegador.");
            return;
        }

        const maxPhotos = 10;
        const filesToShare = photos.slice(0, maxPhotos);

        try {
            // Converte DataURLs para objetos File
            const files = await Promise.all(
                filesToShare.map(async (img, i) => {
                    const response = await fetch(img);
                    const blob = await response.blob();
                    return new File([blob], `qdelicia_${Date.now()}_${i + 1}.jpg`, { type: "image/jpeg" });
                })
            );
            
            const shareText = shareTextInput.value || "Registro de fotos tiradas para Qdelícia Frutas.";

            const shareData = { 
                files: files, 
                title: "Registro Qdelícia Frutas", 
                text: shareText 
            };

            if (navigator.canShare && !navigator.canShare(shareData)) {
                throw new Error("Não é possível compartilhar estes arquivos");
            }

            await navigator.share(shareData);
            
        } catch (error) {
            console.error("Erro no compartilhamento:", error);
            if (error.name !== 'AbortError') { 
                alert(`Erro ao compartilhar: ${error.message}\n\nTente compartilhar menos fotos ou use outro método.`);
            }
        }
    });

    // Visualizar galeria ao clicar no preview
    lastPhotoPreview.addEventListener('click', () => {
        if (photos.length > 0) {
            const win = window.open();
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Galeria - Qdelícia Frutas</title>
                    <style>
                        body { margin: 0; padding: 20px; background: #000; }
                        img { width: 100%; max-width: 800px; display: block; margin: 20px auto; border-radius: 10px; }
                        .back { position: fixed; top: 20px; left: 20px; background: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; color: black; }
                    </style>
                </head>
                <body>
                    <a href="#" class="back" onclick="window.close(); return false;">Fechar</a>
                    ${photos.map((photo, i) => `<img src="${photo}" alt="Foto ${i+1}">`).join('')}
                </body>
                </html>
            `);
        }
    });

    // Inicia
    setInterval(updateDateTime, 1000);
    updateDateTime();
    
    // Inicia câmera quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', requestCameraPermission);
    } else {
        requestCameraPermission();
    }
}
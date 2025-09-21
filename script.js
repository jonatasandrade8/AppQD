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

// ==================== FUNCIONALIDADES DO CARROSSEL ====================
const carouselSlides = document.querySelector('.carousel-slides');
const dotsContainer = document.querySelector('.carousel-dots');
const slides = document.querySelectorAll('.carousel-slides .slide');
const dots = document.querySelectorAll('.carousel-dots .dot');

if (carouselSlides && slides.length > 0 && dots.length > 0) {
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

    // Rola o carrossel a cada 3 segundos
    setInterval(nextSlide, 3000);

    // Adiciona funcionalidade aos pontos de navegação
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
}

// ==================== FUNCIONALIDADES DA CÂMERA E VÍDEO ====================
// Verificar se estamos na página da câmera
if (document.getElementById('video')) {
    const video = document.getElementById('video');
    const shutterBtn = document.getElementById('shutter-btn');
    const switchBtn = document.getElementById('switch-btn');
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

    // Função para mostrar feedback visual
    function showFeedback(message, type = 'info') {
        // Remove feedback anterior se existir
        const existingFeedback = document.querySelector('.feedback-message');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const feedback = document.createElement('div');
        feedback.className = `feedback-message feedback-${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(feedback);

        // Remove após 3 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 3000);
    }

    // Adicionar CSS para animações de feedback
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Solicitar permissão da câmera com configurações mais compatíveis
    async function requestCameraPermission() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        try {
            showFeedback('Solicitando acesso à câmera...', 'info');
            
            // Configurações mais flexíveis para melhor compatibilidade
            const constraints = {
                video: {
                    facingMode: usingFrontCamera ? "user" : "environment",
                    // Removidas as configurações de resolução específicas para melhor compatibilidade
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 }
                },
                audio: false
            };

            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = currentStream;
            hasCameraPermission = true;
            
            requestCameraBtn.innerHTML = '<i class="fas fa-check"></i> Câmera Permitida';
            requestCameraBtn.style.background = '#4caf50';
            requestCameraBtn.disabled = true;
            
            showFeedback('Câmera ativada com sucesso!', 'success');
            
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            hasCameraPermission = false;
            requestCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Permitir Câmera';
            requestCameraBtn.style.background = '#ff5722';
            requestCameraBtn.disabled = false;
            
            let errorMessage = 'Não foi possível acessar a câmera. ';
            if (err.name === 'NotAllowedError') {
                errorMessage += 'Permissão negada. Verifique as configurações do navegador.';
            } else if (err.name === 'NotFoundError') {
                errorMessage += 'Nenhuma câmera encontrada no dispositivo.';
            } else if (err.name === 'NotReadableError') {
                errorMessage += 'Câmera está sendo usada por outro aplicativo.';
            } else {
                errorMessage += 'Verifique se o dispositivo possui câmera e tente novamente.';
            }
            
            showFeedback(errorMessage, 'error');
        }
    }

    // Atualizar data e hora
    function updateDateTime() {
        const now = new Date();
        if (dateTimeElement) {
            dateTimeElement.textContent = now.toLocaleString('pt-BR');
        }
    }
    setInterval(updateDateTime, 1000);

    // Capturar foto com marca d'água responsiva
    function capturePhoto() {
        if (!hasCameraPermission) {
            showFeedback('Permissão de câmera não concedida. Clique em "Permitir Câmera".', 'error');
            return;
        }
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            showFeedback('Aguarde a câmera carregar completamente.', 'error');
            return;
        }
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Usar dimensões reais do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const now = new Date().toLocaleString('pt-BR');
        
        // Configurações responsivas para a marca d'água baseadas no tamanho do canvas
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calcular tamanho da fonte baseado na resolução (mais flexível)
        const baseFontSize = Math.max(24, Math.min(canvasWidth / 20, canvasHeight / 15));
        const textPadding = baseFontSize * 0.3;
        const bgHeight = baseFontSize + (textPadding * 2);

        // Fundo da marca d'água
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        const bgY = canvasHeight - bgHeight;
        ctx.fillRect(0, bgY, canvasWidth, bgHeight);

        // Texto da marca d'água
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${baseFontSize}px Arial`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(now, canvasWidth / 2, bgY + (bgHeight / 2));

        // Converter para JPEG com qualidade alta
        const photoData = canvas.toDataURL("image/jpeg", 0.9);
        photos.unshift(photoData);
        updateGallery();

        downloadAllBtn.disabled = false;
        shareAllBtn.disabled = false;
        
        showFeedback('Foto capturada com sucesso!', 'success');
    }

    // Atualizar galeria
    function updateGallery() {
        if (!photoList) return;
        
        photoList.innerHTML = "";
        const photosToShow = photos.slice(0, 6);
        
        if (photosToShow.length === 0) {
            photoList.innerHTML = `
                <div class="photo-item">
                    <img src="https://via.placeholder.com/150x120?text=Nenhuma+foto" alt="placeholder">
                    <div class="photo-info">Tire uma foto para começar</div>
                </div>
            `;
            return;
        }
        
        photosToShow.forEach((img, index) => {
            const div = document.createElement("div");
            div.className = "photo-item";
            div.innerHTML = `
                <img src="${img}" alt="foto ${index + 1}">
                <div class="photo-info">Foto ${index + 1}</div>
            `;
            photoList.appendChild(div);
        });
    }

    // Função melhorada para download
    function downloadPhoto(photoData, filename) {
        try {
            // Converter data URL para blob
            const byteString = atob(photoData.split(',')[1]);
            const mimeString = photoData.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([ab], { type: mimeString });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpar URL após um tempo
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            return true;
        } catch (error) {
            console.error('Erro no download:', error);
            return false;
        }
    }

    // Função melhorada para compartilhamento
    async function sharePhotos() {
        if (photos.length === 0) {
            showFeedback('Nenhuma foto para compartilhar.', 'error');
            return;
        }

        const shareText = shareTextInput.value || "Fotos Qdelícia Frutas";
        
        // Verificar se o navegador suporta Web Share API
        if (navigator.share && navigator.canShare) {
            try {
                // Limitar a 3 fotos para melhor compatibilidade
                const photosToShare = photos.slice(0, 3);
                const files = [];
                
                for (let i = 0; i < photosToShare.length; i++) {
                    const img = photosToShare[i];
                    const byteString = atob(img.split(",")[1]);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    
                    for (let j = 0; j < byteString.length; j++) {
                        ia[j] = byteString.charCodeAt(j);
                    }
                    
                    const file = new File([ab], `qdelicia_foto_${i + 1}.jpg`, { 
                        type: "image/jpeg" 
                    });
                    files.push(file);
                }
                
                // Verificar se pode compartilhar arquivos
                if (navigator.canShare({ files })) {
                    await navigator.share({ 
                        files, 
                        title: "Qdelícia Frutas", 
                        text: shareText 
                    });
                    showFeedback('Fotos compartilhadas com sucesso!', 'success');
                } else {
                    // Fallback: compartilhar apenas texto
                    await navigator.share({
                        title: "Qdelícia Frutas",
                        text: shareText + " - Fotos disponíveis para download"
                    });
                    showFeedback('Texto compartilhado. Use o botão "Baixar Tudo" para salvar as fotos.', 'info');
                }
                
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Erro no compartilhamento:', err);
                    fallbackShare();
                }
            }
        } else {
            fallbackShare();
        }
    }

    // Função de fallback para compartilhamento
    function fallbackShare() {
        // Para dispositivos que não suportam Web Share API
        const shareText = shareTextInput.value || "Fotos Qdelícia Frutas";
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " - Fotos capturadas com o app Qdelícia Frutas")}`;
        
        // Tentar abrir WhatsApp
        const whatsappWindow = window.open(whatsappUrl, '_blank');
        
        if (whatsappWindow) {
            showFeedback('WhatsApp aberto. Use "Baixar Tudo" para salvar as fotos primeiro.', 'info');
        } else {
            showFeedback('Não foi possível abrir o WhatsApp. Use "Baixar Tudo" para salvar as fotos.', 'error');
        }
    }

    // Recarregar a página completamente
    function reloadPage() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        showFeedback('Recarregando página...', 'info');
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    }

    // Event listeners
    if (shutterBtn) {
        shutterBtn.addEventListener("click", capturePhoto);
    }

    if (switchBtn) {
        switchBtn.addEventListener("click", () => {
            usingFrontCamera = !usingFrontCamera;
            if (hasCameraPermission) {
                showFeedback('Alternando câmera...', 'info');
                requestCameraPermission();
            } else {
                showFeedback('Permita o acesso à câmera primeiro.', 'error');
            }
        });
    }

    if (requestCameraBtn) {
        requestCameraBtn.addEventListener("click", requestCameraPermission);
    }
    
    if (reloadPageBtn) {
        reloadPageBtn.addEventListener("click", reloadPage);
    }

    if (downloadAllBtn) {
        downloadAllBtn.addEventListener("click", () => {
            if (photos.length === 0) {
                showFeedback('Nenhuma foto para baixar.', 'error');
                return;
            }
            
            let downloadCount = 0;
            const totalPhotos = Math.min(photos.length, 6);
            
            showFeedback(`Baixando ${totalPhotos} foto(s)...`, 'info');
            
            photos.slice(0, 6).forEach((img, i) => {
                setTimeout(() => {
                    const success = downloadPhoto(img, `qdelicia_foto_${i + 1}.jpg`);
                    if (success) {
                        downloadCount++;
                        if (downloadCount === totalPhotos) {
                            showFeedback(`${totalPhotos} foto(s) baixada(s) com sucesso!`, 'success');
                        }
                    }
                }, i * 500); // Delay entre downloads para evitar problemas
            });
        });
    }

    if (shareAllBtn) {
        shareAllBtn.addEventListener("click", sharePhotos);
    }

    // Inicialização
    window.addEventListener("load", () => {
        updateDateTime();
        updateGallery();
        
        // Verificar se o dispositivo suporta câmera
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showFeedback('Este dispositivo não suporta acesso à câmera.', 'error');
            if (requestCameraBtn) {
                requestCameraBtn.disabled = true;
                requestCameraBtn.innerHTML = '<i class="fas fa-times"></i> Câmera Não Suportada';
            }
        }
    });

    // Detectar quando a página perde foco (usuário sai do app)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && currentStream) {
            // Pausar stream quando a página não está visível para economizar recursos
            currentStream.getTracks().forEach(track => {
                if (track.readyState === 'live') {
                    track.enabled = false;
                }
            });
        } else if (!document.hidden && currentStream) {
            // Reativar stream quando a página volta a ficar visível
            currentStream.getTracks().forEach(track => {
                track.enabled = true;
            });
        }
    });
}


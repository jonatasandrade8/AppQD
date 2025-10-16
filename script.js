// ================= MENU HAMBÚRGUER (MOBILE) / SIDEBAR (DESKTOP) =================

// Seleciona todos os elementos com a classe .menu-toggle (o de abrir e o de fechar)
const menuToggleButtons = document.querySelectorAll('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const menuOverlay = document.querySelector('.menu-overlay');

if (sideMenu && menuOverlay) {
    // Adiciona o listener de clique para todos os botões de toggle
    menuToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Apenas no mobile, ativamos a classe 'active'
            if (window.innerWidth < 1024) { 
                sideMenu.classList.toggle('active');
                menuOverlay.classList.toggle('active');
            }
        });
    });

    // Fecha o menu ao clicar no overlay (apenas no mobile)
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
// Verifica se a página possui o carrossel (apenas no index.html)
if (document.querySelector('.carousel-slides')) {
    const carouselSlides = document.querySelector('.carousel-slides');
    const dotsContainer = document.querySelector('.carousel-dots');
    const slides = document.querySelectorAll('.carousel-slides .slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    const slideDuration = 4000; // 4 segundos

    function updateCarousel() {
        // Move o slide
        const offset = -currentIndex * 100;
        carouselSlides.style.transform = `translateX(${offset}%)`;

        // Atualiza os dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToNextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    // Inicializa o carrossel
    updateCarousel();

    // Adiciona o controle de intervalo
    let interval = setInterval(goToNextSlide, slideDuration);

    // Reinicia o intervalo ao interagir com os dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(interval);
            currentIndex = index;
            updateCarousel();
            interval = setInterval(goToNextSlide, slideDuration);
        });
    });
}


// ==================== FUNCIONALIDADES DA CÂMERA E VÍDEO (REVISADO) ====================
// Verifica se estamos na página da câmera antes de inicializar
if (document.getElementById('video')) {
    const video = document.getElementById('video');
    const shutterBtn = document.getElementById('shutter-btn');
    const videoTimerElement = document.getElementById('video-timer');
    const switchBtn = document.getElementById('switch-btn');
    const dateTimeElement = document.getElementById('date-time');
    
    // Elementos para a nova UI Full Screen
    const lastPhotoPreview = document.getElementById('last-photo-preview');
    const photoCountElement = document.getElementById('photo-count');
    const shareAllBtn = document.getElementById('share-all');
    const shareTextInput = document.getElementById('share-text');

    let currentStream = null;
    let usingFrontCamera = false;
    let photos = []; // Array para armazenar os DataURLs das fotos
    let videoChunks = []; // Array para armazenar os pedaços do vídeo
    let mediaRecorder;
    let isRecording = false;
    let recordingTimer;
    const MAX_RECORDING_TIME = 15; // Segundos
    let hasCameraPermission = false;

    // Função principal para solicitar e iniciar o feed da câmera
    async function requestCameraPermission() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        try {
            // Configurações para forçar a câmera traseira ('environment') por padrão
            const constraints = {
                video: {
                    facingMode: usingFrontCamera ? "user" : "environment",
                    width: { ideal: 4096 }, // Pedido de alta qualidade
                    height: { ideal: 2160 }
                },
                audio: false
            };

            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = currentStream;
            hasCameraPermission = true;

            // Espelhamento para a câmera frontal (Selfie)
            video.style.transform = usingFrontCamera ? 'scaleX(-1)' : 'scaleX(1)';
            
            // Inicializa o MediaRecorder
            mediaRecorder = new MediaRecorder(currentStream, { mimeType: 'video/webm; codecs=vp8' });
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    videoChunks.push(event.data);
                }
            };
            mediaRecorder.onstop = handleVideoStop;
            
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            // Mensagem de erro robusta
            alert("Não foi possível acessar a câmera. Verifique as permissões (HTTPS necessário) e se há câmeras disponíveis.");
            video.style.backgroundColor = '#333';
            hasCameraPermission = false;
        }
    }

    // Atualiza data e hora no watermark
    function updateDateTime() {
        const now = new Date();
        dateTimeElement.textContent = now.toLocaleString('pt-BR'); 
    }
    
    // Atualiza o contador de fotos e o preview
    function updateGalleryUI(newPhotoDataURL) {
        // Armazena a nova foto
        photos.unshift(newPhotoDataURL); 

        // Atualiza o contador de fotos
        photoCountElement.textContent = photos.length;
        photoCountElement.classList.add('photo-count-visible'); 
        
        // Atualiza a pré-visualização 
        lastPhotoPreview.innerHTML = `<img src="${newPhotoDataURL}" alt="Prévia da última foto tirada">`;
        
        // Habilita o botão de compartilhamento
        if (photos.length > 0 || videoChunks.length > 0) {
            shareAllBtn.disabled = false;
        }
    }

    // Capturar foto e adicionar marca d'água
    function capturePhoto() {
        if (!hasCameraPermission) {
            alert("Câmera não iniciada.");
            return;
        }
        
        // Efeito visual de flash na tela
        video.style.filter = 'brightness(2.0)';
        setTimeout(() => { video.style.filter = 'brightness(1.0)'; }, 100);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Aplica correção de espelhamento ANTES de desenhar
        if (usingFrontCamera) {
             ctx.translate(canvas.width, 0);
             ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reseta a transformação ANTES de escrever a marca d'água
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Adiciona a marca d'água
        const now = new Date().toLocaleString('pt-BR');
        const watermarkText = `Agrícola Qdelícia Frutas || ${now}`;
        ctx.font = "bold 60px sans-serif"; 
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 5;
        
        // Desenha a marca d'água no centro inferior
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 40);
        
        // Gera o DataURL final (JPEG)
        const finalPhotoDataURL = canvas.toDataURL('image/jpeg', 0.9);
        
        updateGalleryUI(finalPhotoDataURL);
    }

    // Lógica de Gravação de Vídeo
    function startRecording() {
        if (!hasCameraPermission || isRecording) return;

        isRecording = true;
        videoChunks = [];
        shutterBtn.classList.add('recording');
        videoTimerElement.style.display = 'block';
        
        mediaRecorder.start();
        
        let timeElapsed = 0;
        videoTimerElement.textContent = `00:00 / 00:${MAX_RECORDING_TIME < 10 ? '0' + MAX_RECORDING_TIME : MAX_RECORDING_TIME}`;

        recordingTimer = setInterval(() => {
            timeElapsed++;
            const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
            const seconds = (timeElapsed % 60).toString().padStart(2, '0');
            
            videoTimerElement.textContent = `${minutes}:${seconds} / 00:${MAX_RECORDING_TIME < 10 ? '0' + MAX_RECORDING_TIME : MAX_RECORDING_TIME}`;

            if (timeElapsed >= MAX_RECORDING_TIME) {
                stopRecording();
            }
        }, 1000);
    }

    function stopRecording() {
        if (!isRecording) return;

        isRecording = false;
        clearInterval(recordingTimer);
        mediaRecorder.stop();
        shutterBtn.classList.remove('recording');
        videoTimerElement.style.display = 'none';
    }

    function handleVideoStop() {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(videoBlob);
        
        // Adiciona o vídeo ao array de fotos/mídias para compartilhamento
        photos.unshift(videoURL); 
        
        // Atualiza o preview com um ícone de vídeo (simulação)
        lastPhotoPreview.innerHTML = `<i class="fas fa-video" style="font-size: 2rem; color: white; margin: 1rem;"></i>`;
        
        // Atualiza o contador (pode ser ajustado para contar fotos e vídeos separadamente)
        photoCountElement.textContent = photos.length;
        photoCountElement.classList.add('photo-count-visible'); 
        
        shareAllBtn.disabled = false;
    }

    // Altera a função do botão de captura para suportar foto e vídeo
    shutterBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            capturePhoto();
        }
    });

    // Adiciona um listener para iniciar a gravação com um toque longo (simulação com mousedown/mouseup)
    let pressTimer;
    shutterBtn.addEventListener('mousedown', () => {
        pressTimer = setTimeout(startRecording, 500); // Inicia gravação após 500ms
    });
    shutterBtn.addEventListener('mouseup', () => {
        clearTimeout(pressTimer);
        if (isRecording) {
            // Se já estiver gravando, o click acima já chamou stopRecording
        } else {
            // Se não estiver gravando, o click acima já chamou capturePhoto
        }
    });
    shutterBtn.addEventListener('mouseleave', () => {
        clearTimeout(pressTimer);
    });

    // Trocar Câmera
    switchBtn.addEventListener('click', () => {
        usingFrontCamera = !usingFrontCamera;
        if (hasCameraPermission) {
            requestCameraPermission();
        }
    });

    // Lógica para Compartilhar no WhatsApp (usando API Nativa)
    shareAllBtn.addEventListener("click", async () => {
        if (navigator.share) {
            const filesToShare = photos.slice(0, 5); 

            // Converte DataURLs (fotos) e URLs de Blob (vídeos) para objetos File
            const files = await Promise.all(filesToShare.map(async (mediaUrl, i) => {
                if (mediaUrl.startsWith('data:image')) {
                    // Lógica para fotos (DataURL)
                    const byteString = atob(mediaUrl.split(",")[1]);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
                    return new File([ab], `registro_qdelicia_${i + 1}.jpg`, { type: "image/jpeg" });
                } else if (mediaUrl.startsWith('blob:')) {
                    // Lógica para vídeos (Blob URL)
                    const response = await fetch(mediaUrl);
                    const blob = await response.blob();
                    return new File([blob], `registro_qdelicia_${i + 1}.webm`, { type: "video/webm" });
                }
            }));
            
            const shareText = shareTextInput.value || "Registro de fotos/vídeos tirados para Qdelícia Frutas.";

            try {
                // Tenta compartilhar
                await navigator.share({ 
                    files: files.filter(f => f), // Filtra nulos, se houver
                    title: "Registro Qdelícia Frutas", 
                    text: shareText 
                });
            } catch (error) {
                console.error("Erro no compartilhamento:", error);
                if (error.name !== 'AbortError') { 
                    alert("Não foi possível compartilhar. O dispositivo pode não suportar ou o número de arquivos é muito grande. Tente compartilhar menos itens.");
                }
            }
        } else {
            alert("Compartilhamento nativo não suportado neste dispositivo.");
        }
    });

    // Inicia a atualização da data/hora e a câmera automaticamente
    setInterval(updateDateTime, 1000); 
    window.addEventListener('load', requestCameraPermission);
}

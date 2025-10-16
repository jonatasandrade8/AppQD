// ================= MENU HAMBÚRGUER =================
// Seleciona todos os elementos com a classe .menu-toggle (o de abrir e o de fechar)
const menuToggleButtons = document.querySelectorAll('.menu-toggle');
const sideMenu = document.querySelector('.side-menu');
const menuOverlay = document.querySelector('.menu-overlay');

if (sideMenu && menuOverlay) {
    // Adiciona o listener de clique para todos os botões de toggle
    menuToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            sideMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        });
    });

    // Fecha o menu ao clicar no overlay
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

    // Reinicia o intervalo ao interagir com os dots (evita pular slides)
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
    const switchBtn = document.getElementById('switch-btn');
    const dateTimeElement = document.getElementById('date-time');
    
    // NOVOS ELEMENTOS para o novo layout de tela cheia
    const lastPhotoPreview = document.getElementById('last-photo-preview');
    const photoCountElement = document.getElementById('photo-count');
    const shareAllBtn = document.getElementById('share-all');
    const shareTextInput = document.getElementById('share-text');

    let currentStream = null;
    let usingFrontCamera = false;
    let photos = []; // Array para armazenar os DataURLs das fotos
    let hasCameraPermission = false;

    // Função principal para solicitar e iniciar o feed da câmera
    async function requestCameraPermission() {
        // Para a stream anterior, se houver
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        try {
            // Configurações para obter a câmera traseira em alta resolução (preferencialmente)
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
            if (usingFrontCamera) {
                video.style.transform = 'scaleX(-1)';
            } else {
                video.style.transform = 'scaleX(1)';
            }
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
            // Mensagem amigável ao usuário
            alert("Não foi possível acessar a câmera. Verifique as permissões do seu navegador/dispositivo.");
            video.style.backgroundColor = '#333';
            hasCameraPermission = false;
        }
    }

    // Atualiza data e hora no watermark
    function updateDateTime() {
        const now = new Date();
        // Formato brasileiro
        dateTimeElement.textContent = now.toLocaleString('pt-BR'); 
    }
    
    // Atualiza o contador de fotos e o preview
    function updateGalleryUI(newPhotoDataURL) {
        // Armazena a nova foto no início do array (mais recente)
        photos.unshift(newPhotoDataURL); 

        // Atualiza o contador de fotos
        photoCountElement.textContent = photos.length;
        photoCountElement.classList.add('photo-count-visible'); // Torna o contador visível
        
        // Atualiza a pré-visualização (o quadrado no canto da tela)
        lastPhotoPreview.innerHTML = `<img src="${newPhotoDataURL}" alt="Prévia da última foto tirada">`;
        lastPhotoPreview.querySelector('img').style.opacity = '1';
        
        // Habilita o botão de compartilhamento
        if (photos.length > 0) {
            shareAllBtn.disabled = false;
        }
    }


    // Capturar foto e adicionar marca d'água
    function capturePhoto() {
        if (!hasCameraPermission) {
            alert("Permissão de câmera não concedida. Por favor, recarregue a página e permita o acesso.");
            return;
        }
        
        // Efeito visual de flash na tela
        video.style.filter = 'brightness(2.0)';
        setTimeout(() => { video.style.filter = 'brightness(1.0)'; }, 100);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Correção de espelhamento para câmera frontal
        if (usingFrontCamera) {
             ctx.translate(canvas.width, 0);
             ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Se houver espelhamento, volta ao normal antes de escrever
        if (usingFrontCamera) {
             ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        // Adiciona a marca d'água (data e hora) na imagem capturada
        const now = new Date().toLocaleString('pt-BR');
        const watermarkText = `Qdelícia Frutas | ${now}`;
        ctx.font = "bold 40px sans-serif"; // Fonte e tamanho para alta resolução
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 5;
        
        // Desenha a marca d'água no centro inferior da foto
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 40);
        
        // Gera o DataURL final (JPEG 90% de qualidade)
        const finalPhotoDataURL = canvas.toDataURL('image/jpeg', 0.9);
        
        updateGalleryUI(finalPhotoDataURL);
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

    // Lógica para Compartilhar no WhatsApp (usando API Nativa)
    shareAllBtn.addEventListener("click", async () => {
        if (navigator.share) {
            // Limita o número de arquivos para evitar falhas em alguns sistemas (Ex: 3-5 fotos)
            const filesToShare = photos.slice(0, 5); 

            // Converte DataURLs para objetos File
            const files = filesToShare.map((img, i) => {
                const byteString = atob(img.split(",")[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let j = 0; j < byteString.length; j++) ia[j] = byteString.charCodeAt(j);
                // Nome do arquivo com índice e data (opcionalmente)
                return new File([ab], `registro_qdelicia_${i + 1}.jpg`, { type: "image/jpeg" });
            });
            
            const shareText = shareTextInput.value || "Registro de fotos tiradas para Qdelícia Frutas.";

            try {
                // Tenta compartilhar
                await navigator.share({ 
                    files: files, 
                    title: "Registro Qdelícia Frutas", 
                    text: shareText 
                });
            } catch (error) {
                console.error("Erro no compartilhamento:", error);
                if (error.name !== 'AbortError') { // Ignora se o usuário cancelar
                    alert("Não foi possível compartilhar. O dispositivo pode não suportar ou o número de arquivos é muito grande. Tente compartilhar menos fotos.");
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
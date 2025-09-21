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

    // Solicitar permissão da câmera com a melhor qualidade disponível
    async function requestCameraPermission() {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }

      try {
        // Configurações para a melhor qualidade disponível
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
      
      // Usar dimensões reais do vídeo para máxima qualidade
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const now = new Date().toLocaleString('pt-BR');
      // Atualiza a marca d'água na tela para refletir o momento do clique
      if (dateTimeElement) {
        dateTimeElement.textContent = now;
      }
      
      // Configurações estáticas para a marca d'água
      const baseFontSize = 68; // Tamanho fixo da fonte
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      const textPadding = 15;
      const textHeight = baseFontSize;
      const bgHeight = textHeight + (textPadding * 2);

      // Posicionar no rodapé (preenche toda a largura)
      const bgY = canvas.height - bgHeight;

      // Retângulo que preenche toda a largura do rodapé
      ctx.fillRect(0, bgY, canvas.width, bgHeight);

      // Adicionar texto centralizado no rodapé
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${baseFontSize}px Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(now, canvas.width / 2, bgY + (bgHeight / 2));

      // Usar a melhor qualidade (1.0)
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
    }

    // Recarregar a página completamente
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
        link.download = `photo_${i+1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });

    shareAllBtn.addEventListener("click", () => {
      if (navigator.share) {
        const files = photos.slice(0,3).map((img,i) => {
          const byteString = atob(img.split(",")[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let j=0;j<byteString.length;j++) ia[j] = byteString.charCodeAt(j);
          return new File([ab], `photo_${i+1}.jpg`, { type: "image/jpeg" });
        });
        
        const shareText = shareTextInput.value || "Minhas fotos";
        navigator.share({ 
          files, 
          title: "Photo Marked", 
          text: shareText 
        }).catch(() => alert("Compartilhamento não suportado neste dispositivo."));
      } else {
        alert("Compartilhamento não suportado neste dispositivo.");
      }
    });

    // Inicialização
    window.addEventListener("load", () => {
      updateDateTime();
    });
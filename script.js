(function () {
    // =================================================================
    // MÓDULO DE SCRIPTS GERAIS (Envolto em IIFE para isolar variáveis)
    // =================================================================
    // Defina a função logo no topo do arquivo
    window.recarregarPagina = function () {
        console.log("Botão clicado, recarregando..."); // Para você ver no F12 que funcionou

        // Tenta atualizar o iframe primeiro
        const iframe = document.querySelector('iframe');
        if (iframe) {
            const urlBase = iframe.src.split('?')[0];
            iframe.src = urlBase + "?t=" + new Date().getTime();
        }

        // Recarrega a página após 300ms
        setTimeout(() => {
            window.location.reload();
        }, 300);
    };

    // ... restante do código (atualizarRelogio, etc)
    // 1. Lógica do Menu Hambúrguer (Lateral)
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

        // Fechar menu ao clicar em um link
        sideMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                sideMenu.classList.remove('active');
                menuOverlay.classList.remove('active');
            });
        });
    }

    // 2. Lógica do Botão Voltar ao Topo
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

    // 3. Lógica do Carrossel (Seções Duplicadas Removidas)
    const carouselSlides = document.querySelector('.carousel-slides');
    const slides = document.querySelectorAll('.carousel-slides .slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    if (carouselSlides && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;

        const prevArrow = document.querySelector('.prev-arrow');
        const nextArrow = document.querySelector('.next-arrow');

        function updateCarousel() {
            // Garante que o índice esteja dentro dos limites
            currentIndex = currentIndex % totalSlides;
            if (currentIndex < 0) currentIndex = totalSlides - 1;

            carouselSlides.style.transform = `translateX(${-currentIndex * (100 / totalSlides)}%)`;

            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        }

        function nextSlide() {
            currentIndex = currentIndex + 1;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = currentIndex - 1;
            updateCarousel();
        }

        // Inicia o carrossel automático
        let autoPlay = setInterval(nextSlide, 5000);

        // Reset autoPlay ao interagir
        function resetAutoPlay() {
            clearInterval(autoPlay);
            autoPlay = setInterval(nextSlide, 5000);
        }

        if (nextArrow) {
            nextArrow.addEventListener('click', () => {
                nextSlide();
                resetAutoPlay();
            });
        }

        if (prevArrow) {
            prevArrow.addEventListener('click', () => {
                prevSlide();
                resetAutoPlay();
            });
        }

        // Adiciona funcionalidade aos dots de navegação
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });

        // Define o estado inicial
        updateCarousel();
    }

})(); // FIM DA IIFE

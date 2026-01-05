(function() {
    // =================================================================
    // MÓDULO DE SCRIPTS GERAIS (Envolto em IIFE para isolar variáveis)
    // =================================================================
    // Defina a função logo no topo do arquivo
    window.recarregarPagina = function() {
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
    
 function atualizarRelogio() {

    const agora = new Date();

    const meta = new Date();

    

    meta.setHours(14, 0, 0, 0);



    if (agora >= meta) {

        meta.setDate(meta.getDate() + 1);

        document.getElementById('dia-rotulo').innerText = 'Amanhã';

        document.getElementById('status-envio').classList.remove('urgente');

    } else {

        document.getElementById('dia-rotulo').innerText = 'Hoje';

    }



    const diferenca = meta - agora;

    const totalMinutos = Math.floor(diferenca / (1000 * 60));



    // Lógica de Cor Vermelha (Urgência)

    const card = document.getElementById('status-envio');

    if (document.getElementById('dia-rotulo').innerText === 'Hoje' && totalMinutos < 30) {

        card.classList.add('urgente');

    } else {

        card.classList.remove('urgente');

    }



    // Cálculos de tempo

    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);

    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);

    const segundos = Math.floor((diferenca / 1000) % 60);



    document.getElementById('contagem-regressiva').innerText = 

        `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

}







setInterval(atualizarRelogio, 1000);

atualizarRelogio();
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

        function updateCarousel() {
            // Garante que o índice esteja dentro dos limites
            currentIndex = currentIndex % totalSlides;
            if (currentIndex < 0) currentIndex = totalSlides - 1;

            carouselSlides.style.transform = `translateX(${-currentIndex * 100 / totalSlides}%)`;
            
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        }

        function nextSlide() {
            currentIndex = currentIndex + 1;
            updateCarousel();
        }

        // Inicia o carrossel automático
        setInterval(nextSlide, 3000);

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

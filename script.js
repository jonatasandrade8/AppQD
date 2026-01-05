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
    /**
 * LÓGICA DE CRONÔMETROS (Estoque Diário + Caixas Quinzenal)
 */

// CONFIGURAÇÃO: Defina UMA segunda-feira que teve contagem de caixas no passado.
// O sistema calculará as próximas quinzenas automaticamente somando 14 dias a partir daqui.
// Ex: 06 de Janeiro de 2025 foi uma segunda-feira.
const DATA_REFERENCIA_CAIXAS = new Date(2025, 0, 6, 14, 0, 0); // (Ano, Mês-1, Dia, Hora, Min) -> Mês 0 é Janeiro

function atualizarRelogios() {
    const agora = new Date();

    // --- RELÓGIO 1: ESTOQUE (Diário 14h) ---
    const metaEstoque = new Date();
    metaEstoque.setHours(14, 0, 0, 0);

    let textoDiaEstoque = 'Hoje';
    
    // Se já passou das 14h, a meta é amanhã
    if (agora >= metaEstoque) {
        metaEstoque.setDate(metaEstoque.getDate() + 1);
        textoDiaEstoque = 'Amanhã';
    }

    atualizarDisplayTimer(agora, metaEstoque, 'timer-estoque', 'dia-rotulo-estoque', textoDiaEstoque, 'row-estoque');


    // --- RELÓGIO 2: CAIXAS (Quinzenal - Segundas 14h) ---
    // Encontrar a próxima data quinzenal
    let metaCaixas = new Date(DATA_REFERENCIA_CAIXAS);
    
    // Enquanto a meta de caixas for menor que agora, soma 14 dias
    while (metaCaixas <= agora) {
        metaCaixas.setDate(metaCaixas.getDate() + 14);
    }

    // Verifica se a meta de caixas é hoje
    let textoDiaCaixas = '';
    const diferencaDias = Math.floor((metaCaixas - agora) / (1000 * 60 * 60 * 24));
    
    if (metaCaixas.toDateString() === agora.toDateString()) {
        textoDiaCaixas = 'HOJE!';
    } else if (diferencaDias < 1) {
        textoDiaCaixas = 'Amanhã';
    } else {
        // Mostra a data (Ex: 20/01) se estiver longe
        const dia = metaCaixas.getDate().toString().padStart(2, '0');
        const mes = (metaCaixas.getMonth() + 1).toString().padStart(2, '0');
        textoDiaCaixas = `${dia}/${mes}`;
    }

    atualizarDisplayTimer(agora, metaCaixas, 'timer-caixas', 'dia-rotulo-caixas', textoDiaCaixas, 'row-caixas');
}

// Função auxiliar para calcular tempo e atualizar o HTML
function atualizarDisplayTimer(agora, meta, idDisplay, idRotulo, textoRotulo, idLinha) {
    const diferenca = meta - agora;
    
    // Elementos DOM
    const elDisplay = document.getElementById(idDisplay);
    const elRotulo = document.getElementById(idRotulo);
    const elLinha = document.getElementById(idLinha);

    if (!elDisplay || !elRotulo) return;

    // Atualiza Rótulo (Hoje, Amanhã, Data)
    elRotulo.innerText = textoRotulo;

    // Cálculos matemáticos
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);
    
    // Se faltar mais de 24h (para as caixas), somamos as horas totais ou mostramos dias
    const diasTotais = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    let displayTexto = '';
    
    if (diasTotais > 0) {
        // Se faltar mais de 1 dia, mostra "05d 12h"
        displayTexto = `${diasTotais}d ${horas}h`;
    } else {
        // Formato padrão HH:MM:SS
        displayTexto = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    elDisplay.innerText = displayTexto;

    // Lógica de Urgência (Vermelho)
    // Regra: Se for "HOJE" e faltar menos de 30 minutos
    const totalMinutosRestantes = Math.floor(diferenca / (1000 * 60));
    const ehHoje = (textoRotulo === 'Hoje' || textoRotulo === 'HOJE!');

    if (ehHoje && totalMinutosRestantes < 30) {
        elDisplay.classList.add('urgente-text');
        elRotulo.classList.add('urgente-text');
    } else {
        elDisplay.classList.remove('urgente-text');
        elRotulo.classList.remove('urgente-text');
    }
}

// Inicializa
setInterval(atualizarRelogios, 1000);
atualizarRelogios();
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

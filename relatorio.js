// ==================== ESTRUTURA DE DADOS PARA DROPDOWNS (PROMOTORES/REDES) ====================
// RESTAURADO: A lista de promotores e lojas foi restaurada para a versão anterior.
const APP_DATA = {
    "Miqueias": {
        "Assaí": ["Ponta Negra"],
    },
    "Cosme": {
        "Assaí": ["Zona Norte"],
    },
    
    "Erivan": {
        "Assaí": ["Maria Lacerda"],
    
    },
    "Reginaldo": {
        "Assaí": ["Zona Sul"],

    },
    "Inacio": {
        "Atacadão": ["Prudente"],

    },
    "Vivian": {
        "Atacadão": ["BR-101 Sul"],

    },
    "Amarildo": {
        "Atacadão": ["Zona Norte"],
        "Nordestão": ["Loja 05"]
    },
    "Nilson": {
        "Atacadão": ["Parnamirim"],

    },
    "Markson": {
         "Nordestão": ["Loja 08"],
        "Mar Vermelho": ["Natal", "Parnamirim"]
        
    },
    
    "Mateus": {
        "Nordestão": ["Loja 04"],
        "Carrefour": ["Zona Sul"]
    },
    "Cristiane": {
        "Nordestão": ["Loja 07"],

    },
    "J Mauricio": {
        "Nordestão": ["Loja 03"],

    },
    "Neto": {
        "Superfácil": ["Emaús"],

    },
    "Antonio": {
        "Superfácil": ["Nazaré"],

    }
};

// PRESERVADO: Esta é a lista correta de motivos e produtos que você especificou.
const RELATORIO_DATA = {
    MOTIVOS_DEVOLUCAO: [
        "Muito Madura",
        "Muito Arranhada",
        "Muito Verde",
        "Tamanho Fora do Padrão",
        "Baixa Qualidade",
        "Atraso na Entrega",
        "Peso Alterado",
        "Encruada"
    ],
    TIPOS_PRODUTO: [
        "Prata",
        "Pacovan",
        "Comprida",
        "Leite",
        "Nanica",
        "Goiaba",
        "Abacaxi",
        "Melão",
        "Coco Verde"
        
    ]
};


// ================= MENU HAMBÚRGUER e VOLTAR AO TOPO =================
// (Restante do código JS mantido)
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
    
    sideMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
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


// ==================== FUNCIONALIDADES DA CÂMERA E VÍDEO (DEVOLUÇÃO) ====================

// Elementos da Interface (Comuns)
const openCameraBtn = document.getElementById('open-camera-btn');
const fullscreenCameraContainer = document.getElementById('fullscreen-camera-container');
const backToGalleryBtn = document.getElementById('back-to-gallery-btn');
const video = document.getElementById('video');
const shutterBtn = document.getElementById('shutter-btn');
const switchBtn = document.getElementById('switch-btn');
const photoList = document.getElementById('photo-list');
const downloadAllBtn = document.getElementById('download-all');
const shareAllBtn = document.getElementById('share-all');
const photoCountElement = document.getElementById('photo-count');
const dateTimeElement = document.getElementById('date-time'); // Adicionado para marca d'água de data/hora

// Elementos para Marca D'água (Base)
const selectReportType = document.getElementById('select-report-type'); // NOVO: Tipo de Relatório
const selectPromotor = document.getElementById('select-promotor'); 
const selectRede = document.getElementById('select-rede'); 
const selectLoja = document.getElementById('select-loja'); 

// Elementos Específicos da Câmera de Devolução (para adicionar itens)
const selectMotivo = document.getElementById('select-motivo'); 
const selectProduto = document.getElementById('select-produto'); 
const inputQuantidade = document.getElementById('input-quantidade'); 
const inputObservacoes = document.getElementById('input-observacoes'); 

// Novos Elementos para a lista de itens
const addItemBtn = document.getElementById('add-item-btn');
const itemListElement = document.getElementById('report-items-list'); // ID corrigido para o HTML
const clearReportBtn = document.getElementById('clear-report-btn'); // NOVO: Botão de limpar relatório

let currentStream = null;
let usingFrontCamera = false;
let photos = [];
let items = []; // Armazena a lista de itens (produto, motivo, qtd)
let hasCameraPermission = false; // Adicionado para controle de permissão
const localStorageKey = 'qdelicia_last_selection'; 

// Carregar a imagem da logomarca (mantida para uso apenas no PDF)
const logoImage = new Image();
logoImage.src = './images/logo-qdelicia.png'; 
logoImage.onerror = () => console.error("Erro ao carregar a imagem da logomarca. Verifique o caminho.");


// --- LÓGICA DE DROP DOWNS, PERSISTÊNCIA E VALIDAÇÃO ---

/**
 * @description Salva as seleções atuais no localStorage.
 * (MODIFICADO: 'reportType' e 'observacoes' removidos da persistência)
 */
function saveSelection() {
    const selection = {
        // reportType: selectReportType.value, // Persistência removida
        promotor: selectPromotor.value,
        rede: selectRede.value,
        loja: selectLoja.value,
        // observacoes: inputObservacoes ? inputObservacoes.value : '' // Persistência removida
    };
    localStorage.setItem(localStorageKey, JSON.stringify(selection));
    checkCameraAccess();
}

/**
 * @description Preenche um <select> genérico.
 */
function populateSelect(selectElement, data, placeholder) {
    if (!selectElement) return;
    selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
    
    const isArray = Array.isArray(data);
    const iterableData = isArray ? data : Object.keys(data);
    
    iterableData.forEach(itemKey => {
        const itemValue = isArray ? itemKey : itemKey; 
        const option = document.createElement('option');
        option.value = itemValue;
        option.textContent = itemValue;
        selectElement.appendChild(option);
    });
}

/**
 * @description Preenche as opções de Rede com base no Promotor selecionado.
 */
function populateRede(promotor) {
    selectRede.innerHTML = '<option value="" disabled selected>Selecione a Rede</option>';
    selectLoja.innerHTML = '<option value="" disabled selected>Selecione a Loja</option>';
    selectLoja.disabled = true;

    if (promotor && APP_DATA[promotor]) {
        Object.keys(APP_DATA[promotor]).forEach(rede => {
            const option = document.createElement('option');
            option.value = rede;
            option.textContent = rede;
            selectRede.appendChild(option);
        });
        selectRede.disabled = false;
    } else {
        selectRede.disabled = true;
    }
}

/**
 * @description Preenche as opções de Loja com base na Rede e Promotor selecionados.
 */
function populateLoja(promotor, rede) {
    selectLoja.innerHTML = '<option value="" disabled selected>Selecione a Loja</option>';

    if (promotor && rede && APP_DATA[promotor] && APP_DATA[promotor][rede]) {
        APP_DATA[promotor][rede].forEach(loja => {
            const option = document.createElement('option');
            option.value = loja;
            option.textContent = loja;
            selectLoja.appendChild(option);
        });
        selectLoja.disabled = false;
    } else {
        selectLoja.disabled = true;
    }
}

/**
 * @description Carrega as seleções do localStorage e preenche os dropdowns.
 * (MODIFICADO: 'reportType' e 'observacoes' removidos do carregamento)
 */
function loadAndPopulateDropdowns() {
    // --- Lógica de Promotor/Rede/Loja ---
    Object.keys(APP_DATA).forEach(promotor => {
        if (!selectPromotor) return;
        const option = document.createElement('option');
        option.value = promotor;
        option.textContent = promotor;
        selectPromotor.appendChild(option);
    });

    const savedSelection = JSON.parse(localStorage.getItem(localStorageKey));

    if (savedSelection && savedSelection.promotor) {
        selectPromotor.value = savedSelection.promotor;
        // Preenche a Rede baseada no Promotor salvo
        populateRede(savedSelection.promotor);
        selectRede.value = savedSelection.rede;
        // Preenche a Loja baseada na Rede salva
        if (savedSelection.rede) {
            populateLoja(savedSelection.promotor, savedSelection.rede);
            selectLoja.value = savedSelection.loja;
        }
    }
    
    // --- Lógica de Tipo de Relatório ---
    /*
    if (selectReportType && savedSelection && savedSelection.reportType) {
        selectReportType.value = savedSelection.reportType;
    }
    */ // Persistência removida
    
    // --- Lógica de Motivo/Produto/Observações ---
    populateSelect(selectMotivo, RELATORIO_DATA.MOTIVOS_DEVOLUCAO, "Selecione o Motivo");
    populateSelect(selectProduto, RELATORIO_DATA.TIPOS_PRODUTO, "Selecione o Produto");

    /*
    if (savedSelection && inputObservacoes && savedSelection.observacoes) {
        inputObservacoes.value = savedSelection.observacoes; 
    }
    */ // Persistência removida
    
    checkCameraAccess();
}


/**
 * @description Lógica de Adicionar Itens
 */
function handleAddItem() {
    const produto = selectProduto.value;
    const motivo = selectMotivo.value;
    const quantidade = inputQuantidade.value.trim();

    if (!produto || !motivo || !quantidade) {
        alert("Por favor, preencha o Produto, Motivo e Quantidade para adicionar um item.");
        return;
    }

    items.push({ produto, motivo, quantidade });
    
    updateItemListUI();
    checkCameraAccess();

    // Limpa os campos de item após adicionar
    selectProduto.value = "";
    selectMotivo.value = "";
    inputQuantidade.value = "";
}

/**
 * @description Atualiza UI da Lista de Itens
 */
function updateItemListUI() {
    if (!itemListElement) return;

    itemListElement.innerHTML = ''; 
    if (items.length === 0) {
        itemListElement.innerHTML = '<li class="empty-list">Nenhum item adicionado.</li>';
    }

    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${item.produto}</strong> (${item.motivo}) - ${item.quantidade} KG</span>
            <button class="delete-item-btn" data-index="${index}" title="Remover item">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Adiciona o listener de remoção
        li.querySelector('.delete-item-btn').addEventListener('click', (e) => {
            // O índice é lido do atributo data-index do botão
            const indexToRemove = parseInt(e.currentTarget.getAttribute('data-index'));
            // Remove 1 elemento a partir do índice
            items.splice(indexToRemove, 1); 
            // Atualiza a UI e verifica o acesso à câmera/botões
            updateItemListUI();
            checkCameraAccess();
        });
        
        itemListElement.appendChild(li);
    });
}

/**
 * @description Limpa a lista de itens, a galeria de fotos e o Tipo de Relatório.
 * PRESERVA: Promotor, Rede, Loja e Observações (que são persistidos no localStorage).
 */
function clearReportData() {
    // 1. Limpa a lista de itens
    items = [];
    updateItemListUI();

    // 2. Limpa a galeria de fotos
    photos = [];
    updateGallery();

    // 3. Limpa o Tipo de Relatório
    if (selectReportType) {
        selectReportType.value = ""; 
    }

    // 4. Garante que os botões de câmera/PDF sejam atualizados
    checkCameraAccess();
    
    alert("Dados do Relatório (Itens, Fotos e Tipo) foram limpos com sucesso.");
}


// ==================================================================
// --- LÓGICA DE VALIDAÇÃO PARA ACESSO À CÂMERA E PDF ---
/**
 * @description Verifica se os dropdowns obrigatórios e a lista de itens estão preenchidos.
 * @returns {boolean} True se estiver pronto para abrir a câmera ou gerar PDF.
 */
function checkCameraAccess() {
    const isReportTypeSelected = selectReportType && selectReportType.value !== "";
    const isPromotorSelected = selectPromotor && selectPromotor.value !== "";
    const isRedeSelected = selectRede && selectRede.value !== "";
    const isLojaSelected = selectLoja && selectLoja.value !== "";
    const hasItems = items.length > 0;
    
    const isReady = isReportTypeSelected && isPromotorSelected && isRedeSelected && isLojaSelected && hasItems;
    
    if (openCameraBtn) {
        if (isReady) {
            openCameraBtn.disabled = false;
            openCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Abrir Câmera';
        } else {
            openCameraBtn.disabled = true;
            openCameraBtn.innerHTML = '<i class="fas fa-lock"></i> Preencha as Informações';
        }
    }
    
    // Habilita/Desabilita botões de download/compartilhamento
    if (downloadAllBtn && shareAllBtn) {
        const canGeneratePdf = isReady && photos.length > 0;
        downloadAllBtn.disabled = !canGeneratePdf;
        shareAllBtn.disabled = !canGeneratePdf;
    }
    
    return isReady;
}
// --- FIM DA LÓGICA DE VALIDAÇÃO ---
// ==================================================================


// --- LÓGICA DA CÂMERA (Baseada em camera.js) ---

/**
 * @description Atualiza o display de data e hora na marca d'água.
 */
function updateDateTime() {
    if (dateTimeElement) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR');
        dateTimeElement.innerHTML = `<i class="fas fa-clock"></i> ${dateStr} ${timeStr}`;
    }
}

// Variáveis para Zoom e Flash (Mantidas de camera.js)
let currentZoom = 1; 
let maxZoom = 1; 
let deviceOrientation = 0; 

/**
 * @description Solicita permissão da câmera e inicia o stream com qualidade otimizada.
 */
async function requestCameraPermission() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // Configuração otimizada para melhor qualidade e menor zoom (De camera.js)
        const constraints = {
            video: {
                facingMode: usingFrontCamera ? "user" : "environment",
                width: { ideal: 1920 }, 
                height: { ideal: 1080 },
                zoom: { ideal: 1 } 
            },
            audio: false
        };
        
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        hasCameraPermission = true; 
        
        // Obter capacidades de zoom do dispositivo (De camera.js)
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.getCapabilities) {
            const capabilities = videoTrack.getCapabilities();
            if (capabilities.zoom) {
                maxZoom = capabilities.zoom.max || 4;
                currentZoom = capabilities.zoom.min || 1;
                // updateZoomButtons(); // Não temos botões de zoom no HTML
            }
        }
        
        currentZoom = 1;
        applyZoom();
        
        // Detectar orientação do dispositivo (De camera.js)
        detectDeviceOrientation();

    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        hasCameraPermission = false;
        
        alert("Não foi possível iniciar a câmera. Verifique as permissões de acesso no seu navegador.");
        closeCameraFullscreen(); 
    }
}

async function openCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    
    fullscreenCameraContainer.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    await requestCameraPermission();
    
    // Inicia a atualização da data/hora
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function closeCameraFullscreen() {
    if (!fullscreenCameraContainer) return;
    fullscreenCameraContainer.classList.remove('active');
    document.body.style.overflow = '';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    hasCameraPermission = false; 
}

/**
 * @description Aplica o zoom atual à track de vídeo. (De camera.js)
 */
function applyZoom() {
    if (currentStream) {
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.getCapabilities().zoom) {
            videoTrack.applyConstraints({ advanced: [{ zoom: currentZoom }] });
        }
    }
}

/**
 * @description Detecta a orientação do dispositivo para corrigir a rotação da foto. (De camera.js)
 */
function detectDeviceOrientation() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(event) {
            // Beta (eixo X) e Gamma (eixo Y) são usados para determinar a orientação
            const beta = event.beta; // -180 a 180 (frente/trás)
            const gamma = event.gamma; // -90 a 90 (esquerda/direita)

            if (Math.abs(gamma) > 45) {
                // Paisagem
                deviceOrientation = gamma > 0 ? 90 : 270;
            } else {
                // Retrato
                deviceOrientation = beta > 135 || beta < -135 ? 180 : 0;
            }
        }, true);
    }
}

/**
 * @description Tira a foto, aplica a marca d'água (data/hora e dados do relatório) e adiciona à galeria.
 */
function takePhoto() {
    if (!hasCameraPermission) {
        alert("A câmera não está ativa ou as permissões foram negadas.");
        return;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Define o tamanho do canvas para o tamanho do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Desenha o frame do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // --- APLICAÇÃO DA MARCA D'ÁGUA (APENAS DATA/HORA E DADOS DO RELATÓRIO) ---
    
    const promotor = selectPromotor.value;
    const rede = selectRede.value;
    const loja = selectLoja.value;
    const reportType = selectReportType.value === 'Qualidade' ? 'QUALIDADE' : 'DEVOLUÇÃO';
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');
    
    // Configurações de texto
    context.font = "bold 30px Arial";
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.textAlign = "left";
    
    const textLines = [
        `${reportType} - ${promotor}`,
        `${rede} - ${loja}`,
        `${dateStr} ${timeStr}`
    ];
    
    const lineHeight = 40;
    let y = canvas.height - (lineHeight * textLines.length) - 20;
    const x = 20;
    
    textLines.forEach(line => {
        context.strokeText(line, x, y); // Contorno preto
        context.fillText(line, x, y);   // Preenchimento branco
        y += lineHeight;
    });
    
    // --- FIM DA MARCA D'ÁGUA ---
    
    // Converte o canvas para Data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    photos.push(photoDataUrl);
    
    updateGallery();
    checkCameraAccess(); // Atualiza o estado dos botões de PDF
}

/**
 * @description Atualiza a galeria de fotos na UI.
 */
function updateGallery() {
    if (!photoList) return;
    
    photoList.innerHTML = '';
    photos.forEach((photoDataUrl, index) => {
        const div = document.createElement('div');
        div.classList.add('photo-item');
        div.innerHTML = `
            <img src="${photoDataUrl}" alt="Foto ${index + 1}">
            <button class="delete-photo-btn" data-index="${index}" title="Remover foto">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        div.querySelector('.delete-photo-btn').addEventListener('click', (e) => {
            const indexToRemove = parseInt(e.currentTarget.getAttribute('data-index'));
            photos.splice(indexToRemove, 1);
            updateGallery();
            checkCameraAccess();
        });
        
        photoList.appendChild(div);
    });
    
    if (photoCountElement) {
        photoCountElement.textContent = photos.length;
    }
}


// --- LÓGICA DE GERAÇÃO DE PDF ---

/**
 * @description Gera o relatório em PDF.
 * @param {string} action 'download' ou 'share'.
 */
async function generatePDFReport(action) {
    if (!checkCameraAccess()) {
        alert("Por favor, preencha todas as informações obrigatórias e adicione pelo menos um item e uma foto.");
        return;
    }
    if (photos.length === 0) {
        alert("Tire pelo menos uma foto para gerar o relatório.");
        return;
    }
    if (items.length === 0) {
        alert("Adicione pelo menos um item de devolução para gerar o relatório.");
        return;
    }

    if (typeof jspdf === 'undefined') {
        alert("ERRO: A biblioteca jsPDF não foi carregada. Verifique o HTML.");
        return;
    }
    
    const { jsPDF } = jspdf; 
    // alert("Iniciando geração do PDF. Isso pode levar um momento."); // LINHA REMOVIDA CONFORME SOLICITADO

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    
    // Configurações para o layout 2x3
    const cols = 2;
    const rows = 3;
    const imgPadding = 3;
    const imgWidth = (pdfWidth - (margin * 2) - ((cols - 1) * imgPadding)) / cols;
    const imgHeight = (pdfHeight - (margin * 2) - ((rows - 1) * imgPadding)) / rows;
    
    
    // --- PARTE 1: ADICIONAR FOTOS (2x3 por página) ---
    let currentPhoto = 0;
    
    for (let i = 0; i < photos.length; i++) {
        const photoIndexOnPage = i % (cols * rows);
        
        if (photoIndexOnPage === 0 && i !== 0) {
            pdf.addPage();
        }
        
        const col = photoIndexOnPage % cols;
        const row = Math.floor(photoIndexOnPage / cols);
        
        const x = margin + (col * (imgWidth + imgPadding));
        const y = margin + (row * (imgHeight + imgPadding));

        pdf.setFontSize(8);
        pdf.text(`Foto ${i + 1}`, x, y - 2); 
        
        pdf.addImage(photos[i], 'JPEG', x, y, imgWidth, imgHeight);
        currentPhoto++;
    }

    // --- PARTE 2: ADICIONAR RELATÓRIO DE INFORMAÇÕES (NOVA PÁGINA) ---
    
    pdf.addPage();
    
    const promotor = selectPromotor.value; 
    const rede = selectRede.value;
    const loja = selectLoja.value;
    const reportType = selectReportType.value; // Pega o tipo de relatório
    const reportTitle = reportType === 'Qualidade' ? 'Relatório de Qualidade' : 'Relatório de Devolução'; // Título dinâmico
    const observacoes = inputObservacoes.value.trim() || 'Nenhuma observação.';
    const date = new Date().toLocaleString('pt-BR');
    let yPos = margin;

    // Cabeçalho e Logomarca
    const logoDataUrl = logoImage.complete ? logoImage.src : null;
    if (logoDataUrl) {
        pdf.addImage(logoDataUrl, 'PNG', margin, yPos, 40, 15); 
        yPos += 20; 
    }
    
    pdf.setFontSize(18);
    pdf.text(reportTitle, margin, yPos); // Título dinâmico
    pdf.line(margin, yPos + 2, pdfWidth - margin, yPos + 2); 
    yPos += 10; 

    // Dados Gerais
    pdf.setFontSize(11);
    pdf.text(`Tipo de Relatório: ${reportTitle}`, margin, yPos); // Adiciona o tipo de relatório
    yPos += 7;
    pdf.text(`Data e Hora: ${date}`, margin, yPos);
    yPos += 7;
    pdf.text(`Promotor: ${promotor}`, margin, yPos); 
    yPos += 7;
    pdf.text(`Rede: ${rede} - Loja: ${loja}`, margin, yPos);
    yPos += 10;
    
    // Itens da Devolução/Qualidade
    pdf.setFontSize(14);
    pdf.text(`Itens do Relatório (${reportTitle})`, margin, yPos);
    pdf.line(margin, yPos + 2, pdfWidth - margin, yPos + 2); 
    yPos += 7;
    
    pdf.setFontSize(11);
    items.forEach((item, index) => {
        // Ajusta o texto para ser mais genérico (Qualidade/Devolução)
        const text = `• Item ${index + 1}: ${item.produto} (${item.motivo}) - ${item.quantidade} KG`;
        const splitText = pdf.splitTextToSize(text, pdfWidth - (margin * 2));
        pdf.text(splitText, margin, yPos);
        yPos += (splitText.length * 5) + 2; 
        
        if (yPos > pdfHeight - 20) {
            pdf.addPage();
            yPos = margin;
            pdf.setFontSize(11);
        }
    });

    yPos += 5;

    // Observações
    pdf.setFontSize(14);
    pdf.text('Observações Gerais', margin, yPos);
    pdf.line(margin, yPos + 2, pdfWidth - margin, yPos + 2); 
    yPos += 7;
    
    pdf.setFontSize(11);
    const splitObs = pdf.splitTextToSize(observacoes, pdfWidth - (margin * 2));
    pdf.text(splitObs, margin, yPos);
    yPos += (splitObs.length * 5) + 2;

    const fileName = `Relat_${reportType}_${rede}_${loja}_${date.split(' ')[0].replace(/\//g, '-')}.pdf`;

    if (action === 'download') {
        pdf.save(fileName);
    } else if (action === 'share') {
        const pdfBlob = pdf.output('blob');
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName)] })) {
            try {
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                await navigator.share({
                    files: [file],
                    title: reportTitle + ' QDelícia'
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao compartilhar:', error);
                    pdf.save(fileName); // Fallback para download
                    // O ALERTA DE SUCESSO DE COMPARTILHAMENTO É SILENCIOSO
                }
            }
        } else {
            pdf.save(fileName);
            // O ALERTA DE SUCESSO DE DOWNLOAD É SILENCIOSO
        }
    }
}


// ==================== EVENT LISTENERS ====================

// Listeners para os Dropdowns
if (selectReportType) {
    selectReportType.addEventListener('change', saveSelection);
}
if (selectPromotor) {
    selectPromotor.addEventListener('change', () => {
        populateRede(selectPromotor.value);
        saveSelection();
    });
}
if (selectRede) {
    selectRede.addEventListener('change', () => {
        populateLoja(selectPromotor.value, selectRede.value);
        saveSelection();
    });
}
if (selectLoja) {
    selectLoja.addEventListener('change', saveSelection);
}
if (inputObservacoes) {
    inputObservacoes.addEventListener('input', saveSelection);
}

// Listener para Adicionar Item
if (addItemBtn) {
    addItemBtn.addEventListener('click', handleAddItem);
}

// Listener para Limpar Relatório (NOVO)
if (clearReportBtn) {
    clearReportBtn.addEventListener('click', clearReportData);
}

// Listeners da Câmera
if (openCameraBtn) {
    openCameraBtn.addEventListener('click', openCameraFullscreen);
}

if (shutterBtn) shutterBtn.addEventListener('click', takePhoto);
if (backToGalleryBtn) backToGalleryBtn.addEventListener('click', closeCameraFullscreen);
if (switchBtn) {
    switchBtn.addEventListener('click', () => {
        usingFrontCamera = !usingFrontCamera;
        // Reinicia a câmera com a nova facingMode
        requestCameraPermission(); 
    });
}

// Listeners para os botões de PDF
if (downloadAllBtn) downloadAllBtn.addEventListener('click', () => generatePDFReport('download'));
if (shareAllBtn) shareAllBtn.addEventListener('click', () => generatePDFReport('share'));


// ==================== INICIALIZAÇÃO GERAL ====================
window.addEventListener('load', () => {
    loadAndPopulateDropdowns(); 
    updateItemListUI();
    updateGallery(); 
});

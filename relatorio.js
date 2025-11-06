// ==================== ESTRUTURA DE DADOS PARA DROPDOWNS (DEVOLUÇÃO) ====================
// Esta estrutura é IDÊNTICA à de camera.js para padronização
const APP_DATA = {
    "Miqueias": {
        "Assaí": ["Ponta Negra"],
    },
    "Cosme": {
        "Assaí": ["Zona Norte"],
    },
    "David": {
        "Assaí": ["Zona Sul"],
        
    },
    "Erivan": {
        "Assaí": ["Maria Lacerda"],
        
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
        "Mar Vermelho": ["Parnamirim"],
        "Atacadão": ["BR-101 Sul"]
    },
    "Jordão": {
        "Superfácil": ["Olho d'Água"],
        "Assaí": ["Ponta Negra"],
        "Mar Vermelho": ["BR-101 Sul"]
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

// ATENÇÃO: A lógica original de relatorio.js dependia dos dados abaixo.
// Preencha 'MOTIVOS_DEVOLUCAO' e 'TIPOS_PRODUTO' com os valores corretos.
const RELATORIO_DATA = {
    MOTIVOS_DEVOLUCAO: [
        "Baixa Qualidade",
        "Danos Mecânicos",
        "Fora de Padrão",
        "Produto Encruado",
        "Outro"
    ],
    TIPOS_PRODUTO: [
        "Banana Pacovan",
        "Banana Prata",
        "Banana Nanica",
        "Banana Comprida",
        "Banana Leite",
        "Abacaxi",
        "Goiaba"
    ]
};


// ================= MENU HAMBÚRGUER e VOLTAR AO TOPO =================
// (A lógica original do menu foi mantida)
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

// Elementos para Marca D'água (Base) - CORRIGIDO
const selectPromotor = document.getElementById('select-promotor'); // CORRIGIDO (era select-entregador)
const selectRede = document.getElementById('select-rede'); 
const selectLoja = document.getElementById('select-loja'); 

// Elementos Específicos da Câmera de Devolução (para adicionar itens)
const selectMotivo = document.getElementById('select-motivo'); 
const selectProduto = document.getElementById('select-produto'); 
const inputQuantidade = document.getElementById('input-quantidade'); 
const inputObservacoes = document.getElementById('input-observacoes'); 

// Novos Elementos para a lista de itens
const addItemBtn = document.getElementById('add-item-btn');
const itemListElement = document.getElementById('item-list');

let currentStream = null;
let usingFrontCamera = false;
let photos = [];
let items = []; // Armazena a lista de itens (produto, motivo, qtd)
const localStorageKey = 'qdelicia_last_selection'; // PADRONIZADO (o mesmo de camera.js)

// Carregar a imagem da logomarca (mantida para uso apenas no PDF)
const logoImage = new Image();
logoImage.src = './images/logo-qdelicia.png'; 
logoImage.onerror = () => console.error("Erro ao carregar a imagem da logomarca. Verifique o caminho.");


// --- LÓGICA DE DROP DOWNS, PERSISTÊNCIA E VALIDAÇÃO ---
// (Funções de camera.js mescladas com as de relatorio.js)

/**
 * @description Salva as seleções atuais no localStorage. (Atualizado)
 */
function saveSelection() {
    const selection = {
        promotor: selectPromotor.value,
        rede: selectRede.value,
        loja: selectLoja.value,
        // Funcionalidade preservada de relatorio.js:
        observacoes: inputObservacoes ? inputObservacoes.value : ''
    };
    localStorage.setItem(localStorageKey, JSON.stringify(selection));
    checkCameraAccess();
}

/**
 * @description Preenche um <select> genérico. (Preservado de relatorio.js)
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
 * @description Preenche as opções de Rede com base no Promotor selecionado. (De camera.js)
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
 * @description Preenche as opções de Loja com base na Rede e Promotor selecionados. (De camera.js)
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
 * @description Carrega as seleções do localStorage e preenche os dropdowns. (Atualizado)
 */
function loadAndPopulateDropdowns() {
    // --- Lógica de camera.js (para Promotor/Rede/Loja) ---
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
    
    // --- Lógica preservada de relatorio.js (para Motivo/Produto/Observações) ---
    // (Usando a função 'populateSelect' que estava em relatorio.js)
    populateSelect(selectMotivo, RELATORIO_DATA.MOTIVOS_DEVOLUCAO, "Selecione o Motivo");
    populateSelect(selectProduto, RELATORIO_DATA.TIPOS_PRODUTO, "Selecione o Produto");

    if (savedSelection && inputObservacoes && savedSelection.observacoes) {
        inputObservacoes.value = savedSelection.observacoes; 
    }
    
    checkCameraAccess();
}


/**
 * @description Lógica de Adicionar Itens (Preservada de relatorio.js)
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

    selectProduto.value = "";
    selectMotivo.value = "";
    inputQuantidade.value = "";
}

/**
 * @description Atualiza UI da Lista de Itens (Preservada de relatorio.js)
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
        
        li.querySelector('.delete-item-btn').addEventListener('click', () => {
            items.splice(index, 1); 
            updateItemListUI(); 
            checkCameraAccess(); 
        });

        itemListElement.appendChild(li);
    });
}

/**
 * @description Verifica se todos os campos estão preenchidos para liberar a câmera. (Atualizado)
 */
function checkCameraAccess() {
    let isReady = false;

    // Verificação dos campos base (Promotor/Rede/Loja)
    const baseFieldsReady = selectPromotor && selectPromotor.value && 
                            selectRede && selectRede.value && 
                            selectLoja && selectLoja.value;
    
    // Verificação dos itens (pelo menos 1)
    const itemsReady = items.length > 0;
    
    isReady = baseFieldsReady && itemsReady;

    if (openCameraBtn) {
        if (isReady) {
            openCameraBtn.disabled = false;
            // Texto do botão baseado no estado da câmera (lógica preservada de relatorio.js)
            openCameraBtn.innerHTML = currentStream 
                ? '<i class="fas fa-video"></i> Câmera Aberta (Fechar)' 
                : '<i class="fas fa-camera"></i> Abrir Câmera'; 
        } else {
            openCameraBtn.disabled = true;
            if (!baseFieldsReady) {
                openCameraBtn.innerHTML = '<i class="fas fa-lock"></i> Preencha Promotor/Rede/Loja';
            } else {
                openCameraBtn.innerHTML = '<i class="fas fa-plus"></i> Adicione Pelo Menos 1 Item';
            }
        }
    }
    return isReady;
}

// EVENT LISTENERS para os Dropdowns (Atualizados)
if (selectPromotor) { // Corrigido (era selectEntregador)
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
if (selectLoja) selectLoja.addEventListener('change', saveSelection);

// Listeners específicos de Devolução (Preservados)
if (inputObservacoes) inputObservacoes.addEventListener('input', saveSelection); 
if (addItemBtn) addItemBtn.addEventListener('click', handleAddItem);


// --- LÓGICA DA CÂMERA (Preservada de relatorio.js) ---
// (Esta lógica é diferente de camera.js, notavelmente 'takePhoto' não aplica marca d'água)

function startCamera(facingMode = 'environment') {
    if (currentStream) stopCamera(); 

    const constraints = {
        video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            video.play();
            checkCameraAccess(); 
            if (fullscreenCameraContainer) {
                fullscreenCameraContainer.style.display = 'flex';
            }
        })
        .catch(err => {
            console.error("Erro ao acessar a câmera: ", err);
            currentStream = null; 
            checkCameraAccess();
            if (fullscreenCameraContainer) {
                fullscreenCameraContainer.style.display = 'none';
                alert("Não foi possível acessar a câmera. Verifique as permissões.");
            }
        });
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    if (fullscreenCameraContainer) {
        fullscreenCameraContainer.style.display = 'none';
    }
    checkCameraAccess();
}

function takePhoto() {
    if (!currentStream) {
        alert("A câmera não está ativa.");
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Esta função NÃO aplica marca d'água, conforme lógica original de relatorio.js
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    photos.push(photoDataUrl);
    
    updateGallery();
}

function updateGallery() {
    if (!photoList) return; 

    photoList.innerHTML = ''; 

    if (photoCountElement) photoCountElement.textContent = photos.length;
    
    const hasPhotos = photos.length > 0;
    if (downloadAllBtn) downloadAllBtn.disabled = !hasPhotos;
    if (shareAllBtn) shareAllBtn.disabled = !hasPhotos;
    
    if (photos.length === 0) {
        // Mensagem de galeria vazia (para consistência)
        photoList.innerHTML = `
            <div class="photo-item">
                <div class="photo-info">Galeria de fotos Vazia || Tire uma foto para o relatório.</div>
            </div>
        `;
        return;
    }

    photos.forEach((photoUrl, index) => {
        const photoItem = document.createElement('div');
        photoItem.classList.add('photo-item');
        
        const img = document.createElement('img');
        img.src = photoUrl;
        photoItem.appendChild(img);
        
        // Botões de download/delete (lógica original de relatorio.js)
        const downloadBtn = document.createElement('a');
        downloadBtn.href = photoUrl;
        downloadBtn.download = `qdelicia_registro_${index + 1}.jpg`;
        downloadBtn.classList.add('icon-btn', 'download-icon');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('icon-btn', 'delete-icon');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            photos.splice(index, 1); 
            updateGallery(); 
        });

        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('photo-controls');
        controlsContainer.appendChild(downloadBtn);
        controlsContainer.appendChild(deleteBtn);
        
        photoItem.appendChild(controlsContainer);
        photoList.prepend(photoItem); // Adiciona no início
    });
}

// ==================== LÓGICA DE GERAÇÃO DE PDF (Preservada de relatorio.js) ====================
async function generatePDFReport(action) {
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
    alert("Iniciando geração do PDF. Isso pode levar um momento.");

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
    
    const promotor = selectPromotor.value; // Corrigido
    const rede = selectRede.value;
    const loja = selectLoja.value;
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
    pdf.text('Relatório de Devolução', margin, yPos);
    pdf.line(margin, yPos + 2, pdfWidth - margin, yPos + 2); 
    yPos += 10; 

    // Dados Gerais
    pdf.setFontSize(11);
    pdf.text(`Data e Hora: ${date}`, margin, yPos);
    yPos += 7;
    pdf.text(`Promotor: ${promotor}`, margin, yPos); // Corrigido
    yPos += 7;
    pdf.text(`Rede: ${rede} - Loja: ${loja}`, margin, yPos);
    yPos += 10;
    
    // Itens da Devolução
    pdf.setFontSize(14);
    pdf.text('Itens da Devolução', margin, yPos);
    pdf.line(margin, yPos + 2, pdfWidth - margin, yPos + 2); 
    yPos += 7;
    
    pdf.setFontSize(11);
    items.forEach((item, index) => {
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

    const fileName = `relatorio_devolucao_${rede}_${loja}_${date.split(' ')[0].replace(/\//g, '-')}.pdf`;

    if (action === 'download') {
        pdf.save(fileName);
    } else if (action === 'share') {
        const pdfBlob = pdf.output('blob');
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName)] })) {
            try {
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                await navigator.share({
                    files: [file],
                    title: 'Relatório de Devolução QDelícia'
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Erro ao compartilhar:', error);
                    pdf.save(fileName); // Fallback para download
                    alert(`O PDF "${fileName}" foi baixado. Compartilhe manualmente.`);
                }
            }
        } else {
            pdf.save(fileName);
            alert(`O PDF "${fileName}" foi baixado. Compartilhe manualmente.`);
        }
    }
}


// ==================== CÂMERA: EVENT LISTENERS (Preservados) ====================
if (openCameraBtn) {
    openCameraBtn.addEventListener('click', () => {
        if (currentStream) {
            stopCamera(); 
        } else if (checkCameraAccess()) { 
            startCamera(usingFrontCamera ? 'user' : 'environment'); 
        }
    });
}

if (shutterBtn) shutterBtn.addEventListener('click', takePhoto);
if (backToGalleryBtn) backToGalleryBtn.addEventListener('click', stopCamera);
if (switchBtn) {
    switchBtn.addEventListener('click', () => {
        usingFrontCamera = !usingFrontCamera;
        startCamera(usingFrontCamera ? 'user' : 'environment');
    });
}

// Listeners para os botões de PDF (Preservados)
if (downloadAllBtn) downloadAllBtn.addEventListener('click', () => generatePDFReport('download'));
if (shareAllBtn) shareAllBtn.addEventListener('click', () => generatePDFReport('share'));


// ==================== INICIALIZAÇÃO GERAL ====================
window.addEventListener('load', () => {
    loadAndPopulateDropdowns(); 
    updateItemListUI();
    updateGallery(); // Adicionado para exibir a galeria vazia inicialmente
});
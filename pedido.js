// Hierarquia: Estado -> Rede -> Promotor -> Lojas
const APP_DATA = {
    "RN": {
        "Atacadão": {
            "Vivian": ["BR - Zona Sul"],
            "Nilson": ["Parnamirim"],
            "Inácio": ["Prudente"],
            "Amarildo": ["Zona Norte"]
        },
        "Assaí": {
            "Reginaldo": ["Zona Sul"],
            "Erivan": ["Maria Lacerda"],
            "Miqueias": ["Ponta Negra"],
            "Cosme": ["Zona Norte"]
        },
        "Nordestão": {
            "J Mauricio": ["Loja 03"],
            "Mateus": ["Loja 04"],
            "Amarildo": ["Loja 05"],
            "Markson": ["Loja 08", "Loja 07"]
        },
        "Carrefour": {
            "Mateus": ["Zona Sul"]
        },
        "Superfácil": {
            "Neto": ["Emaús"],
            "Milagres": ["Nazaré"]
        },
        "Mar Vermelho": {
            "Markson": ["Natal", "Parnamirim"]
        }
    },
    "PE": {
        "Rede A": {
            "Promotor A": ["Loja A"]
        },
        "Rede B": {
            "Promotor B": ["Loja B"]
        }
    },
    "AL": {
        "Rede C": {
            "Promotor C": ["Loja C"]
        },
        "Rede D": {
            "Promotor D": ["Loja D"]
        }
    },
    "PB": {
        "Rede F": {
            "Promotor F": ["Loja F"]
        },
        "Rede G": {
            "Promotor G": ["Loja G"]
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const selectEstado = document.getElementById('estado');
    const selectRede = document.getElementById('rede');
    const selectPromotor = document.getElementById('promotor');
    const selectLoja = document.getElementById('loja');

    const productGrid = document.getElementById('product-grid');
    const addProductTrigger = document.getElementById('add-product-trigger');
    const shareWhatsappBtn = document.getElementById('share-whatsapp');
    const sharePdfBtn = document.getElementById('share-pdf');

    // --- Feature Control (Integrated with notifications.js) ---
    const pdfFeatureEnabled = NOTIFICATIONS_CONFIG.pages.pedido.features?.pdf_share;
    if (sharePdfBtn) {
        if (!pdfFeatureEnabled) {
            sharePdfBtn.disabled = true;
            sharePdfBtn.style.opacity = '0.5';
            sharePdfBtn.style.cursor = 'not-allowed';
            sharePdfBtn.title = "Funcionalidade em desenvolvimento";
        } else {
            sharePdfBtn.disabled = false;
            sharePdfBtn.style.opacity = '1';
            sharePdfBtn.style.cursor = 'pointer';
        }
    }

    // Modal Elements
    const productModal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalNameInput = document.getElementById('modal-product-name');
    const modalQtyInput = document.getElementById('modal-product-qty');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');

    let products = [];
    let editingIndex = -1;

    // --- Dependent Dropdowns Logic (Copied from camera.js pattern) ---
    function populateDropdown(select, items, placeholder) {
        select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        if (Array.isArray(items)) {
            items.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item;
                opt.textContent = item;
                select.appendChild(opt);
            });
        } else if (typeof items === 'object' && items !== null) {
            Object.keys(items).forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = key;
                select.appendChild(opt);
            });
        }
        select.disabled = (select.options.length <= 1);
    }

    // Initial Populate
    populateDropdown(selectEstado, APP_DATA, "Selecione o Estado");

    selectEstado.addEventListener('change', () => {
        const estado = selectEstado.value;
        populateDropdown(selectRede, APP_DATA[estado], "Selecione a Rede");
        selectPromotor.disabled = true;
        selectLoja.disabled = true;
    });

    selectRede.addEventListener('change', () => {
        const estado = selectEstado.value;
        const rede = selectRede.value;
        populateDropdown(selectPromotor, APP_DATA[estado][rede], "Selecione o Promotor");
        selectLoja.disabled = true;
    });

    selectPromotor.addEventListener('change', () => {
        const estado = selectEstado.value;
        const rede = selectRede.value;
        const promotor = selectPromotor.value;
        populateDropdown(selectLoja, APP_DATA[estado][rede][promotor], "Selecione a Loja");
    });

    // --- Product CRUD Logic ---
    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="product-title">${p.name}</span>
                    <div class="product-actions">
                        <button class="btn-icon btn-edit" data-index="${index}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <span class="qty-display">${p.qty}</span>
                    <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">unid/kg</span>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Add Listeners
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = (e) => {
                editingIndex = parseInt(btn.dataset.index);
                const p = products[editingIndex];
                modalTitle.innerText = 'Editar Produto';
                modalNameInput.value = p.name;
                modalQtyInput.value = p.qty;
                productModal.classList.add('active');
            };
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = (e) => {
                if (confirm('Deseja remover este produto?')) {
                    products.splice(parseInt(btn.dataset.index), 1);
                    renderProducts();
                }
            };
        });
    }

    addProductTrigger.onclick = () => {
        editingIndex = -1;
        modalTitle.innerText = 'Adicionar Produto';
        modalNameInput.value = '';
        modalQtyInput.value = '';
        productModal.classList.add('active');
    };

    btnModalCancel.onclick = () => {
        productModal.classList.remove('active');
    };

    btnModalConfirm.onclick = () => {
        const name = modalNameInput.value.trim();
        const qty = modalQtyInput.value;

        if (!name || !qty || qty <= 0) {
            alert('Preencha o nome e a quantidade corretamente.');
            return;
        }

        if (editingIndex > -1) {
            products[editingIndex] = { name, qty };
        } else {
            products.push({ name, qty });
        }

        productModal.classList.remove('active');
        renderProducts();
    };

    // --- Sharing Logic ---
    function getOrderData() {
        const allProducts = [];

        // Collect fixed products
        document.querySelectorAll('.fixed-qty').forEach(input => {
            const qty = input.value;
            if (qty && qty > 0) {
                allProducts.push({
                    name: input.getAttribute('data-name'),
                    qty: qty
                });
            }
        });

        // Collect dynamic products
        products.forEach(p => allProducts.push(p));

        return {
            estado: selectEstado.value,
            rede: selectRede.value,
            promotor: selectPromotor.value,
            loja: selectLoja.value,
            products: allProducts,
            date: new Date().toLocaleDateString('pt-BR')
        };
    }

    shareWhatsappBtn.onclick = () => {
        const data = getOrderData();
        if (!data.loja || data.products.length === 0) {
            alert('Preencha os dados da loja e adicione ao menos um produto.');
            return;
        }

        let msg = `*SUGESTÃO DE PEDIDO - QDELÍCIA FRUTAS*\n\n`;
        msg += `*Data:* ${data.date}\n`;
        msg += `*Loja:* ${data.loja} (${data.rede})\n`;
        msg += `*Promotor:* ${data.promotor}\n\n`;
        msg += `*PRODUTOS SUGERIDOS:*\n`;
        data.products.forEach(p => msg += `• ${p.name}: ${p.qty}\n`);

        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    sharePdfBtn.onclick = async () => {
        const data = getOrderData();
        if (!data.loja || data.products.length === 0) {
            alert('Preencha os dados da loja e adicione ao menos um produto.');
            return;
        }

        const pdfEl = document.getElementById('pdf-content');
        document.getElementById('pdf-data').innerText = data.date;
        document.getElementById('pdf-estado').innerText = data.estado;
        document.getElementById('pdf-rede').innerText = data.rede;
        document.getElementById('pdf-loja').innerText = data.loja;
        document.getElementById('pdf-promotor').innerText = data.promotor;

        const tableBody = document.getElementById('pdf-table-body');
        tableBody.innerHTML = '';
        data.products.forEach(p => {
            tableBody.innerHTML += `<tr><td>${p.name}</td><td>${p.qty}</td></tr>`;
        });

        pdfEl.style.display = 'block';

        const opt = {
            margin: 10,
            filename: `Sugestao_Pedido_${data.loja}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            const pdfBlob = await html2pdf().set(opt).from(pdfEl).output('blob');
            pdfEl.style.display = 'none';

            if (navigator.share) {
                const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
                await navigator.share({
                    files: [file],
                    title: 'Sugestão de Pedido',
                    text: `Sugestão de Pedido - ${data.loja}`
                });
            } else {
                html2pdf().set(opt).from(pdfEl).save();
            }
        } catch (err) {
            console.error('Erro ao gerar/compartilhar PDF:', err);
            pdfEl.style.display = 'none';
        }
    };
});

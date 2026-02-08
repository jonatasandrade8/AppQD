document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const addProductBtn = document.getElementById('add-product-btn');
    const shareWhatsappBtn = document.getElementById('share-whatsapp');
    const sharePdfBtn = document.getElementById('share-pdf');

    // --- Dynamic Product Addition ---
    addProductBtn.addEventListener('click', () => {
        const productName = prompt('Digite o nome do novo produto:');
        if (productName) {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <span class="product-name">${productName}</span>
                <input type="number" class="report-input product-qty" data-name="${productName}" placeholder="0">
            `;
            productList.appendChild(productItem);

            // Scroll to bottom of list
            productItem.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // --- Helper: Gather Order Data ---
    function getOrderData() {
        const estado = document.getElementById('estado').value;
        const rede = document.getElementById('rede').value;
        const promotor = document.getElementById('promotor').value;
        const loja = document.getElementById('loja').value;
        const products = [];

        document.querySelectorAll('.product-qty').forEach(input => {
            const qty = input.value;
            if (qty && qty > 0) {
                products.push({
                    name: input.getAttribute('data-name'),
                    qty: qty
                });
            }
        });

        return { estado, rede, promotor, loja, products, date: new Date().toLocaleDateString('pt-BR') };
    }

    // --- WhatsApp Sharing ---
    shareWhatsappBtn.addEventListener('click', () => {
        const data = getOrderData();

        if (!data.promotor || !data.loja || data.products.length === 0) {
            alert('Por favor, preencha o promotor, loja e pelo menos um produto.');
            return;
        }

        let message = `*SUGESTÃO DE PEDIDO - QDELÍCIA FRUTAS*\n\n`;
        message += `*Data:* ${data.date}\n`;
        message += `*Estado:* ${data.estado || 'N/A'}\n`;
        message += `*Rede:* ${data.rede || 'N/A'}\n`;
        message += `*Promotor:* ${data.promotor}\n`;
        message += `*Loja:* ${data.loja}\n\n`;
        message += `*--- PRODUTOS ---*\n`;

        data.products.forEach(p => {
            message += `- ${p.name}: ${p.qty}\n`;
        });

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    });

    // --- PDF Sharing ---
    sharePdfBtn.addEventListener('click', () => {
        const data = getOrderData();

        if (!data.promotor || !data.loja || data.products.length === 0) {
            alert('Por favor, preencha o promotor, loja e pelo menos um produto.');
            return;
        }

        // Prepare PDF content
        document.getElementById('pdf-data').innerText = data.date;
        document.getElementById('pdf-estado').innerText = data.estado || 'N/A';
        document.getElementById('pdf-rede').innerText = data.rede || 'N/A';
        document.getElementById('pdf-loja').innerText = data.loja;
        document.getElementById('pdf-promotor').innerText = data.promotor;

        const tableBody = document.getElementById('pdf-table-body');
        tableBody.innerHTML = '';
        data.products.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${p.name}</td><td>${p.qty}</td>`;
            tableBody.appendChild(row);
        });

        // Generate PDF
        const element = document.getElementById('pdf-content');
        element.style.display = 'block'; // Make it visible for a moment to capture

        const opt = {
            margin: 10,
            filename: `Sugestão_Pedido_${data.loja}_${data.date.replace(/\//g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.display = 'none'; // Hide it again
        });
    });
});

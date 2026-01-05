// ===================== MÓDULO DE LOCALIZAÇÃO =====================

const LOCALIZACAO_DATA = {
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
            "Cristiane": ["Loja 07"],
            "Markson": ["Loja 08"]
        },
        "Carrefour": {
            "Mateus": ["Zona Sul"]
        },
        "Superfácil": {
            "Neto": ["Emaús"],
            "David": ["Nazaré"]
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

function obterLocalizacaoAtual() {
    return {
        estado: document.getElementById('select-estado')?.value || '',
        rede: document.getElementById('select-rede')?.value || '',
        promotor: document.getElementById('select-promotor')?.value || '',
        loja: document.getElementById('select-loja')?.value || ''
    };
}

function salvarEstadoLocalStorage() {
    const estado = document.getElementById('select-estado')?.value;
    if (estado) {
        localStorage.setItem('qdelicia_estado', estado);
    }
}

function restaurarEstadoLocalStorage() {
    const estadoSalvo = localStorage.getItem('qdelicia_estado');
    if (estadoSalvo) {
        const selectEstado = document.getElementById('select-estado');
        if (selectEstado) {
            selectEstado.value = estadoSalvo;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    restaurarEstadoLocalStorage();
    
    const selectEstado = document.getElementById('select-estado');
    if (selectEstado) {
        selectEstado.addEventListener('change', salvarEstadoLocalStorage);
    }
});

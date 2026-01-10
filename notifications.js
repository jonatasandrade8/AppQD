/**
 * MÓDULO DE NOTIFICAÇÕES E TIMERS FLEXÍVEL - Qdelícia Frutas
 */

const NOTIFICATIONS_CONFIG = {
    // === CONFIGURAÇÃO DO QUADRO DE ESTOQUE ===
    estoque: {
        enabled: true,
        titulo: "Estoque Diário",
        schedule: {
            type: 'daily',
            startTime: "06:00",
            endTime: "14:00",
        },
        labels: {
            open: "Envio até às",
            closed: "O envio finaliza às",
            next: "Faltam %d dias"
        },
        urgenciaMinutos: 60
    },

    // === CONFIGURAÇÃO DO QUADRO DE CAIXAS SECAS ===
    caixasSecas: {
        enabled: false,
        titulo: "Balanço de Caixas",
        schedule: {
            type: 'weekly',
            days: [2],
            startTime: "08:00",
            endTime: "10:00",
            weekInterval: 1,
            referenceDate: "2026-01-05"
        },
        labels: {
            open: "Envio até às",
            closed: "Próximo envio finaliza às",
            next: "Faltam %d dias"
        },
        urgenciaMinutos: 60
    },

    // === CONFIGURAÇÃO DO AVISO SÉRIO (BANNER VERMELHO) ===
    // === Na parte 'next' utilizar %d para dias ===
    avisoSerio: {
        enabled: true,
        timer: 'off', // 'on' ou 'off'
        titulo: "Atenção",
        mensagem: "O Balanço de Caixas foi adiado, em breve teremos uma nova data.",
        dataAlvo: "2026-01-15T08:00:00",
        labels: {
            next: "Att, coordenação."
        },
        corFundo: "#d32f2f",
        corTexto: "#ffffff",
        animacao: true
    },
};

(function () {
    function inicializarNotificacoes() {
        const header = document.getElementById('cabecalho-principal');
        const boardExistente = document.getElementById('status-envio');

        gerenciarAvisoSerio(header, boardExistente);
        gerenciarQuadrosOriginais();

        setInterval(atualizarTodosOsTimers, 1000);
        atualizarTodosOsTimers();
    }

    function gerenciarAvisoSerio(header, boardExistente) {
        let containerAviso = document.getElementById('aviso-serio-container');
        const config = NOTIFICATIONS_CONFIG.avisoSerio;
        if (config.enabled) {
            if (!containerAviso) {
                containerAviso = document.createElement('div');
                containerAviso.id = 'aviso-serio-container';
                containerAviso.className = `notification-board ${config.animacao ? 'urgent-warning' : ''}`;
                containerAviso.style.backgroundColor = config.corFundo;
                containerAviso.style.color = config.corTexto;
                containerAviso.style.marginBottom = '10px';
                containerAviso.style.border = '2px solid #fff';
                containerAviso.innerHTML = `
                    <div class="notification-item" style="width: 100%; border: none;">
                        <div class="notification-label" style="color: inherit; font-size: 0.9rem; font-weight: 900;">${config.titulo}</div>
                        <div class="notification-content">
                            <div class="warning-message" style="color: inherit; font-size: 0.85rem; margin-bottom: 5px; font-weight: bold;">${config.mensagem}</div>
                            <div id="dia-rotulo-aviso" class="dia-rotulo" style="color: inherit; border-color: rgba(255,255,255,0.3); margin-bottom: 5px;">---</div>
                            <div id="timer-aviso-serio" class="timer" style="color: inherit; font-size: 1.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: ${config.timer === 'on' ? 'block' : 'none'};">00:00:00:00</div>
                        </div>
                    </div>
                `;
                if (boardExistente) header.insertBefore(containerAviso, boardExistente);
                else header.appendChild(containerAviso);
            }
        } else if (containerAviso) containerAviso.remove();
    }

    function gerenciarQuadrosOriginais() {
        const header = document.getElementById('cabecalho-principal');
        if (!header) return;

        let board = document.getElementById('status-envio');

        // Se o board não existe no HTML, nós o criamos dinamicamente
        if (!board) {
            board = document.createElement('div');
            board.id = 'status-envio';
            board.className = 'notification-board';

            // Cria o item de Estoque
            const itemEstoque = document.createElement('div');
            itemEstoque.className = 'notification-item';
            itemEstoque.innerHTML = `
                <div class="notification-label">${NOTIFICATIONS_CONFIG.estoque.titulo}</div>
                <div class="notification-content">
                    <div id="dia-rotulo" class="dia-rotulo">---</div>
                    <div class="timer-label">---</div>
                    <div id="contagem-regressiva" class="timer">00:00:00</div>
                </div>
            `;

            // Borda/Divisor
            const divider = document.createElement('div');
            divider.className = 'notification-divider';

            // Cria o item de Caixas
            const itemCaixas = document.createElement('div');
            itemCaixas.className = 'notification-item';
            itemCaixas.innerHTML = `
                <div class="notification-label">${NOTIFICATIONS_CONFIG.caixasSecas.titulo}</div>
                <div class="notification-content">
                    <div id="caixas-rotulo" class="dia-rotulo">---</div>
                    <div class="timer-label">---</div>
                    <div id="timer-caixas" class="timer">00:00:00</div>
                </div>
            `;

            board.appendChild(itemEstoque);
            board.appendChild(divider);
            board.appendChild(itemCaixas);
            header.appendChild(board);
        }

        const itemEstoque = board.querySelector('.notification-item:first-child');
        const itemCaixas = board.querySelector('.notification-item:last-child');
        const divider = board.querySelector('.notification-divider');

        if (itemEstoque) itemEstoque.style.display = NOTIFICATIONS_CONFIG.estoque.enabled ? 'flex' : 'none';
        if (itemCaixas) itemCaixas.style.display = NOTIFICATIONS_CONFIG.caixasSecas.enabled ? 'flex' : 'none';
        if (divider) divider.style.display = (NOTIFICATIONS_CONFIG.estoque.enabled && NOTIFICATIONS_CONFIG.caixasSecas.enabled) ? 'block' : 'none';
        board.style.display = (NOTIFICATIONS_CONFIG.estoque.enabled || NOTIFICATIONS_CONFIG.caixasSecas.enabled) ? 'flex' : 'none';
    }

    function atualizarTodosOsTimers() {
        if (NOTIFICATIONS_CONFIG.estoque.enabled) atualizarBoard('estoque', 'dia-rotulo', 'contagem-regressiva', 'status-envio');
        if (NOTIFICATIONS_CONFIG.caixasSecas.enabled) atualizarBoard('caixasSecas', 'caixas-rotulo', 'timer-caixas', 'status-envio');
        if (NOTIFICATIONS_CONFIG.avisoSerio.enabled) atualizarTimerAvisoSerio();
    }

    function atualizarBoard(configKey, idRotulo, idTimer, idCard) {
        const config = NOTIFICATIONS_CONFIG[configKey];
        const elRotulo = document.getElementById(idRotulo);
        const elTimer = document.getElementById(idTimer);
        const elCard = document.getElementById(idCard);
        if (!elRotulo || !elTimer) return;

        const info = calcularProximaMeta(config.schedule);
        const agora = new Date();
        const diferenca = info.meta - agora;

        const itemParent = elTimer.closest('.notification-item');
        const timerLabel = itemParent ? itemParent.querySelector('.timer-label') : null;

        const d_agora = new Date(agora); d_agora.setHours(0, 0, 0, 0);
        const d_meta = new Date(info.meta); d_meta.setHours(0, 0, 0, 0);
        const diasRestantes = Math.round((d_meta - d_agora) / 86400000);

        if (diasRestantes === 0) elRotulo.innerText = "Hoje";
        else if (diasRestantes === 1) elRotulo.innerText = "Amanhã";
        else elRotulo.innerText = config.labels.next.replace("%d", diasRestantes);

        if (info.isOpen) {
            if (timerLabel) timerLabel.innerText = config.labels.open + " " + formatTime(info.meta);
            const limiteUrgencia = config.urgenciaMinutos || 30;
            if ((diferenca / 60000) <= limiteUrgencia) {
                if (elCard) elCard.classList.add('urgente');
            } else {
                verificarERemoverUrgencia(elCard);
            }
        } else {
            if (timerLabel) timerLabel.innerText = config.labels.closed + " " + formatTime(info.meta);
            verificarERemoverUrgencia(elCard);
        }

        if (diferenca > 0) {
            const dias = Math.floor(diferenca / 86400000);
            const horas = Math.floor((diferenca / 3600000) % 24);
            const minutos = Math.floor((diferenca / 60000) % 60);
            const segundos = Math.floor((diferenca / 1000) % 60);

            const timerStr = (dias > 0 ? dias + "d " : "") +
                `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

            // Adiciona os textos solicitados ao redor do temporizador
            elTimer.innerText = "Faltam " + timerStr + " para finalizar o envio!";
        } else {
            elTimer.innerText = "00:00:00";
        }
    }

    function verificarERemoverUrgencia(elCard) {
        if (!elCard) return;
        const configE = NOTIFICATIONS_CONFIG.estoque;
        const configC = NOTIFICATIONS_CONFIG.caixasSecas;
        let urgente = false;
        if (configE.enabled) {
            const infoE = calcularProximaMeta(configE.schedule);
            if (infoE.isOpen && ((infoE.meta - new Date()) / 60000) <= (configE.urgenciaMinutos || 30)) urgente = true;
        }
        if (!urgente && configC.enabled) {
            const infoC = calcularProximaMeta(configC.schedule);
            if (infoC.isOpen && ((infoC.meta - new Date()) / 60000) <= (configC.urgenciaMinutos || 30)) urgente = true;
        }
        if (!urgente) elCard.classList.remove('urgente');
    }

    function calcularProximaMeta(sched) {
        const agora = new Date();

        function getProxDataValida(partida) {
            let data = new Date(partida);
            for (let i = 0; i < 365; i++) {
                if (isDiaValido(data, sched)) return data;
                data.setDate(data.getDate() + 1);
            }
            return data;
        }

        const hojeValido = isDiaValido(agora, sched);
        const start = parseTimeToDate(agora, sched.startTime);
        const end = parseTimeToDate(agora, sched.endTime);

        if (hojeValido && agora < end) {
            // Se hoje é válido e ainda não passou do fim do envio, o objetivo é o horário FINAL
            return { meta: end, isOpen: agora >= start };
        }

        // Caso contrário, busca o próximo dia válido e o horário FINAL
        let amanha = new Date(agora);
        amanha.setDate(amanha.getDate() + 1);
        const proxData = getProxDataValida(amanha);
        return { meta: parseTimeToDate(proxData, sched.endTime), isOpen: false };
    }

    function isDiaValido(data, sched) {
        if (sched.type === 'daily') return true;
        if (sched.type === 'weekly') {
            const diaDaSemana = data.getDay();
            if (!sched.days.includes(diaDaSemana)) return false;
            if (sched.weekInterval && sched.referenceDate) {
                const ref = new Date(sched.referenceDate); ref.setHours(0, 0, 0, 0);
                const d = new Date(data); d.setHours(0, 0, 0, 0);
                const semanasDiff = Math.floor((d - ref) / (7 * 86400000));
                return semanasDiff % sched.weekInterval === 0;
            }
            return true;
        }
        if (sched.type === 'interval') {
            const ref = new Date(sched.referenceDate); ref.setHours(0, 0, 0, 0);
            const d = new Date(data); d.setHours(0, 0, 0, 0);
            const diasDiff = Math.round((d - ref) / 86400000);
            return diasDiff >= 0 && diasDiff % sched.interval === 0;
        }
        return false;
    }

    function parseTimeToDate(baseData, timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date(baseData);
        d.setHours(h, m, 0, 0);
        return d;
    }

    function formatTime(date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    function atualizarTimerAvisoSerio() {
        const config = NOTIFICATIONS_CONFIG.avisoSerio;
        const elTimer = document.getElementById('timer-aviso-serio');
        const elRotulo = document.getElementById('dia-rotulo-aviso');
        if (!elTimer) return;

        const agora = new Date();
        const meta = new Date(config.dataAlvo);
        const diferenca = meta - agora;

        // Lógica de rótulo (Hoje, Amanhã, Faltam X dias)
        if (elRotulo) {
            const d_agora = new Date(agora); d_agora.setHours(0, 0, 0, 0);
            const d_meta = new Date(meta); d_meta.setHours(0, 0, 0, 0);
            const diasRestantes = Math.round((d_meta - d_agora) / 86400000);

            if (diasRestantes === 0) elRotulo.innerText = "Hoje";
            else if (diasRestantes === 1) elRotulo.innerText = "Amanhã";
            else if (diasRestantes > 1) elRotulo.innerText = config.labels.next.replace("%d", diasRestantes);
            else elRotulo.innerText = "Encerrado";
        }

        // Lógica de Timer
        if (config.timer === 'off') {
            elTimer.style.display = 'none';
        } else {
            elTimer.style.display = 'block';
            if (diferenca <= 0) {
                elTimer.innerText = "00:00:00:00";
                return;
            }
            const dias = Math.floor(diferenca / 86400000);
            const horas = Math.floor((diferenca / 3600000) % 24);
            const minutos = Math.floor((diferenca / 60000) % 60);
            const segundos = Math.floor((diferenca / 1000) % 60);
            elTimer.innerText = `${dias.toString().padStart(2, '0')}:${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicializarNotificacoes);
    else inicializarNotificacoes();
})();

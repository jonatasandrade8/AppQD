// ==================== CONFIGURAÇÃO DE TAREFAS ====================
const DAILY_TASKS = [
    { time: "07:00", message: "Bom dia! Tenha um excelente dia de trabalho", tag: "bom_dia" },
    { time: "09:00", message: "Bom dia! É hora de tirar fotos da bancada!", tag: "bancada_foto_manha" },
    { time: "13:00", message: "Boa tarde! É hora de passar o estoque!", tag: "estoque_registro" },
    { time: "16:00", message: "Lembre se de tirar fotos da bancada antes de finalizar a jornada!", tag: "bancada_foto_tarde" }
];

// ==================== FUNÇÕES DE ALERTA, VOZ E SOM ====================

/**
 * @description Toca um som de alerta. Crucialmente, o .catch() impede a voz se o áudio falhar.
 * @param {function} callback - Função (a voz) a ser executada APENAS se o som tocar.
 */
function playPersistentAlert(callback) {
    const audioUrl = './sounds/alert.mp3'; 
    const alertDurationMs = 4000; 
    const audio = new Audio(audioUrl);
    
    // Tenta tocar o som
    audio.play().then(() => {
        // SUCESSO: (Desktop ou celular desbloqueado)
        console.log("Som de alerta tocando.");
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; 
            callback(); // Inicia a voz
        }, alertDurationMs);
    }).catch(error => {
        // FALHA: (Celular bloqueado ou arquivo de som faltando)
        // ESSENCIAL: Não chama o callback (voz) se o som falhou.
        console.warn("⚠️ Som bloqueado pelo navegador. A voz não será iniciada. Clique no botão 'Testar Áudio'.", error.message);
    });
}


/**
 * @description Converte o texto da mensagem em voz usando a API de Síntese de Fala.
 */
function speakAlert(text) {
    if ('speechSynthesis' in window) {
        // Garante que não haja falas anteriores na fila
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR'; 
        utterance.volume = 1.0; 
        utterance.rate = 1.0; // 1.1 pode ser muito rápido
        utterance.pitch = 1.0; 
        
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("A API de Síntese de Fala não é suportada neste navegador.");
    }
}

/**
 * @description Sequencia a Notificação Visual, o Som e a Voz.
 */
function sendNotificationAndSpeak(task) {
    // VERIFICAÇÃO PRINCIPAL: O usuário desativou no toggle?
    if (localStorage.getItem('alertsEnabled') !== 'true') {
        console.log(`Alertas desativados. Ignorando tarefa: ${task.message}`);
        return;
    }

    console.log(`Disparando alerta: ${task.message}`);

    // 1. Notificação Visual (Roda imediatamente)
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚨 Lembrete: Qdelícia Frutas", {
            body: task.message,
            icon: './images/logo-qdelicia.png', 
            tag: task.tag, 
            renotify: true // Permite que a mesma tag notifique de novo
        });
    }

    // 2. Inicia o som. A voz (callback) só é chamada se o som funcionar.
    playPersistentAlert(() => {
        speakAlert(task.message);
    });
}

// ==================== LÓGICA DE AGENDAMENTO DIÁRIO ====================

let scheduledTimeouts = []; // Armazena os IDs dos timeouts

/**
 * @description Limpa todos os timeouts de alertas agendados.
 */
function clearAllScheduledAlerts() {
    console.log(`Limpando ${scheduledTimeouts.length} alertas agendados.`);
    scheduledTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledTimeouts = [];
}

/**
 * @description Inicia o agendamento de todas as tarefas.
 */
function startAlertSystem() {
    // Limpa agendamentos antigos antes de criar novos
    clearAllScheduledAlerts();

    if (Notification.permission === "granted" && localStorage.getItem('alertsEnabled') === 'true') {
        console.log("✅ Sistema de alertas ativado e agendando tarefas...");
        DAILY_TASKS.forEach(scheduleDailyNotification);
    } else {
        console.log("Sistema de alertas não iniciado (permissão ou toggle desativado).");
    }
    
    // Atualiza a UI (botões, texto)
    if (typeof window.updateAlertUI === 'function') {
        window.updateAlertUI();
    }
}

/**
 * @description Agenda a notificação para um horário específico de forma recursiva (diária).
 */
function scheduleDailyNotification(task) {
    const [targetHour, targetMinute] = task.time.split(':').map(Number);
    
    const calculateDelay = () => {
        const now = new Date();
        const target = new Date();
        target.setHours(targetHour, targetMinute, 0, 0); 

        if (target.getTime() <= now.getTime()) {
            // Se o horário já passou hoje, agenda para amanhã
            target.setDate(target.getDate() + 1); 
        }
        return target.getTime() - now.getTime();
    };
    
    const delay = calculateDelay();

    const timeoutId = setTimeout(() => {
        sendNotificationAndSpeak(task);
        // Re-agenda a tarefa para o próximo dia (removendo o ID antigo)
        scheduledTimeouts = scheduledTimeouts.filter(id => id !== timeoutId);
        scheduleDailyNotification(task); 
    }, delay);

    // Armazena o ID para poder cancelar depois (se o usuário desligar o toggle)
    scheduledTimeouts.push(timeoutId);

    console.log(`Tarefa agendada: ${task.message} para ${task.time}. (Próxima em ${Math.round(delay / 1000 / 60)} min)`);
}


// ==================== FUNÇÕES DE CONTROLE (Chamadas pelo index.html) ====================

/**
 * @description (Chamada pelo Toggle ON) Pede permissão e inicia o sistema.
 */
window.enableAlerts = function() {
    if (!("Notification" in window)) {
        console.warn("Aviso: Notificações não são suportadas.");
        localStorage.setItem('alertsEnabled', 'false');
        if (typeof window.updateAlertUI === 'function') window.updateAlertUI();
        return;
    }

    if (Notification.permission === "granted") {
        console.log("Permissão já concedida. Ativando alertas.");
        localStorage.setItem('alertsEnabled', 'true');
        startAlertSystem();
        return;
    }
    
    if (Notification.permission !== "denied") {
        // Tenta solicitar. Esta função SÓ será bem-sucedida se chamada por um CLIQUE (o toggle).
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                console.log("Permissão concedida!");
                localStorage.setItem('alertsEnabled', 'true');
                startAlertSystem();
            } else {
                console.warn("Permissão de notificação negada.");
                localStorage.setItem('alertsEnabled', 'false');
                if (typeof window.updateAlertUI === 'function') window.updateAlertUI('denied');
            }
        });
    } else {
         // Permissão está 'denied'
         console.warn("Aviso: A permissão de notificações foi permanentemente negada.");
         localStorage.setItem('alertsEnabled', 'false');
         if (typeof window.updateAlertUI === 'function') window.updateAlertUI('denied');
    }
}

/**
 * @description (Chamada pelo Toggle OFF) Para o sistema e limpa agendamentos.
 */
window.disableAlerts = function() {
    console.log("Desativando sistema de alertas.");
    localStorage.setItem('alertsEnabled', 'false');
    clearAllScheduledAlerts(); // Cancela os timeouts futuros
    if (typeof window.updateAlertUI === 'function') {
        window.updateAlertUI();
    }
}

/**
 * @description (Chamada pelo Botão de Teste) Desbloqueia o áudio em navegadores móveis.
 */
window.unlockAndTestAudio = function() {
    console.log("Tentativa de desbloqueio de áudio por clique.");
    
    // 1. Envia uma notificação de teste
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚨 Teste de Alerta", {
            body: "Este é um teste de notificação visual.",
            icon: './images/logo-qdelicia.png', 
            tag: "audio_test",
            renotify: true
        });
    }

    // 2. Toca som e voz (isso desbloqueia para a sessão)
    playPersistentAlert(() => {
        speakAlert("Teste de voz e som concluído com sucesso!");
    });
}


// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    // Verifica o status no load. Se já está 'granted' E 'enabled', inicia.
    if (Notification.permission === 'granted' && localStorage.getItem('alertsEnabled') === 'true') {
        startAlertSystem(); 
    } else if (Notification.permission === 'denied') {
        // Se está bloqueado, garante que o localStorage esteja 'false'
        localStorage.setItem('alertsEnabled', 'false');
        if (typeof window.updateAlertUI === 'function') window.updateAlertUI('denied');
    } else {
        // Se está 'default' ou 'granted' mas 'disabled', apenas atualiza a UI
        if (typeof window.updateAlertUI === 'function') window.updateAlertUI();
    }
});
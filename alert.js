// ==================== CONFIGURAÇÃO DE TAREFAS ====================
const DAILY_TASKS = [
    // ATENÇÃO: Verifique se o horário 14:40 estava correto. O delay na mensagem de erro era de 38 segundos.
    { time: "07:00", message: "Bom dia! Tenha um excelente dia de trabalho", tag: "bancada_foto" },
    { time: "09:00", message: "Bom dia! É hora de tirar fotos da bancada!", tag: "bancada_foto" },
    { time: "13:00", message: "Boa tarde! É hora de passar o estoque!", tag: "estoque_registro" },
    { time: "16:00", message: "Lembre se de tirar fotos da bancada antes de finalizar a jornada!", tag: "caixas_registro" }
];

// ==================== FUNÇÕES DE ALERTA, VOZ E SOM ====================

/**
 * @description Toca um som de alerta persistente por 3 segundos antes de iniciar o callback (voz).
 * @param {function} callback - Função a ser executada após o som parar.
 */
function playPersistentAlert(callback) {
    // ATENÇÃO: O erro 404 (Not Found) indica que este arquivo está faltando ou o caminho está errado.
    // Crie a pasta 'sounds' e coloque o arquivo 'alert.mp3' nela.
    const audioUrl = './sounds/alert.mp3'; 
    const alertDurationMs = 4000; 
    const audio = new Audio(audioUrl);
    
    // Tenta tocar o som
    audio.play().then(() => {
        // Se tocou com sucesso, agenda a parada
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; 
            callback(); // Inicia a voz
        }, alertDurationMs);
    }).catch(error => {
        // ESSA É A CAUSA DO ERRO: Navegador bloqueia o play() sem interação.
        console.warn("⚠️ Som bloqueado pelo navegador. A voz será iniciada em 1s.", error);
        // Avança para a voz após um pequeno atraso para dar tempo de ler a notificação.
        setTimeout(callback, 1000); 
    });
}


/**
 * @description Converte o texto da mensagem em voz usando a API de Síntese de Fala.
 */
function speakAlert(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR'; 
        utterance.volume = 1.0; 
        utterance.rate = 1.1; 
        utterance.pitch = 1.0; 
        
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("A API de Síntese de Fala não é suportada neste navegador.");
    }
}

/**
 * @description Sequencia a Notificação Visual, o Som Persistente e, por fim, a Voz.
 */
function sendNotificationAndSpeak(task) {
    // 1. Notificação Visual (Roda imediatamente)
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚨 Lembrete: Qdelícia Frutas", {
            body: task.message,
            icon: './images/logo-qdelicia.png', 
            tag: task.tag, 
            renotify: true
        });
    }

    // 2. Inicia o som. A voz é iniciada após o som parar.
    playPersistentAlert(() => {
        speakAlert(task.message);
    });
}

// ==================== LÓGICA DE AGENDAMENTO DIÁRIO ====================

/**
 * @description Inicia o agendamento de todas as tarefas após a permissão ser concedida.
 */
function startAlertSystem() {
    if (Notification.permission === "granted") {
        DAILY_TASKS.forEach(scheduleDailyNotification);
        console.log("✅ Sistema de alertas ativado e agendado.");
    } 
    // CHAMA A FUNÇÃO DE ATUALIZAÇÃO DA UI (definida no HTML)
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
            target.setDate(target.getDate() + 1); 
        }
        return target.getTime() - now.getTime();
    };
    
    const delay = calculateDelay();

    setTimeout(() => {
        sendNotificationAndSpeak(task);
        scheduleDailyNotification(task); 
    }, delay);

    console.log(`Tarefa agendada: ${task.message} para ${task.time}. Delay: ${delay / 1000} segundos.`);
}


/**
 * @description Função PRINCIPAL: Requer um CLIQUE do usuário para funcionar em navegadores modernos.
 */
window.requestNotificationPermission = function() {
    if (!("Notification" in window)) {
        console.warn("Aviso: Notificações não são suportadas.");
        if (typeof window.updateAlertUI === 'function') {
            window.updateAlertUI();
        }
        return;
    }

    if (Notification.permission === "granted") {
        startAlertSystem(); 
        return;
    }
    
    if (Notification.permission !== "denied") {
        // Tenta solicitar. Esta função SÓ será bem-sucedida se chamada por um CLIQUE.
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                startAlertSystem(); 
            } else {
                console.warn("Permissão de notificação negada/bloqueada.");
                if (typeof window.updateAlertUI === 'function') {
                    window.updateAlertUI();
                }
            }
        });
    } else {
         console.warn("Aviso: A permissão de notificações foi permanentemente negada.");
         if (typeof window.updateAlertUI === 'function') {
             window.updateAlertUI();
         }
    }
}

// Inicialização: TENTA verificar o status no load. Se já está 'granted', inicia.
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission === 'granted') {
        startAlertSystem(); 
    }
    // Garante que a UI esteja correta, mesmo que a permissão não tenha sido solicitada.
    if (typeof window.updateAlertUI === 'function') {
        window.updateAlertUI();
    }
});
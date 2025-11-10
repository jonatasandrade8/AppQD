// ==================== CONFIGURAÇÃO DE TAREFAS ====================
// Defina suas tarefas, horários e a mensagem exata de forma centralizada.
const DAILY_TASKS = [
    { time: "09:00", message: "É hora de tirar foto da bancada!", tag: "bancada_foto" },
    { time: "15:15", message: "É hora de passar o estoque!", tag: "estoque_registro" },
    { time: "00:00", message: "Registro de caixas secas programado para meia-noite!", tag: "caixas_registro" }
];

// ==================== FUNÇÕES DE ALERTA E VOZ ====================

/**
 * @description Converte o texto da mensagem em voz usando a API de Síntese de Fala.
 * @param {string} text - O texto a ser falado.
 */
function speakAlert(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR'; // Define o idioma para Português do Brasil
        // Opcional: Ajustar volume, velocidade e tom
        utterance.volume = 1.0; 
        utterance.rate = 1.1; // Um pouco mais rápido
        utterance.pitch = 1.0; 
        
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("A API de Síntese de Fala não é suportada neste navegador.");
    }
}

/**
 * @description Envia a notificação visual e dispara o alerta de voz.
 * @param {object} task - Objeto da tarefa com 'message' e 'tag'.
 */
function sendNotificationAndSpeak(task) {
    // 1. Notificação Visual (Browser/OS)
    if (Notification.permission === "granted") {
        new Notification("🚨 Lembrete: Qdelícia Frutas", {
            body: task.message,
            icon: './images/logo-qdelicia.png', 
            tag: task.tag, 
            renotify: true
        });
    }

    // 2. Alerta de Voz
    speakAlert(task.message);
}

// ==================== LÓGICA DE AGENDAMENTO (Recurso Avançado) ====================

/**
 * @description Agenda a notificação para um horário específico de forma recursiva (diária).
 * @param {object} task - Objeto da tarefa a ser agendada.
 */
function scheduleDailyNotification(task) {
    const [targetHour, targetMinute] = task.time.split(':').map(Number);
    
    // Calcula o delay até o próximo horário agendado.
    const calculateDelay = () => {
        const now = new Date();
        const target = new Date();
        target.setHours(targetHour, targetMinute, 0, 0); 

        // Se o horário já passou hoje, agenda para o mesmo horário de amanhã.
        if (target.getTime() <= now.getTime()) {
            target.setDate(target.getDate() + 1); 
        }
        return target.getTime() - now.getTime();
    };
    
    const delay = calculateDelay();

    // O setTimeout garante que a função será executada exatamente no momento planejado.
    setTimeout(() => {
        sendNotificationAndSpeak(task);
        // Reagenda a função para o mesmo horário no dia seguinte, garantindo a recorrência.
        scheduleDailyNotification(task); 
    }, delay);

    console.log(`Tarefa agendada: ${task.message} para ${task.time}. Delay: ${delay / 1000} segundos.`);
}

/**
 * @description Solicita a permissão do usuário para notificações.
 */
function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
            console.log(`Permissão de Notificação: ${permission}`);
        });
    }
}

// ==================== INICIALIZAÇÃO ====================
// Executa a lógica após o DOM estar completamente carregado.
document.addEventListener('DOMContentLoaded', () => {
    // É crucial solicitar a permissão de forma ativa.
    // Para UX ideal, considere um botão "Ativar Alertas" que chame esta função.
    requestNotificationPermission(); 
    
    // Inicia o agendamento de todas as tarefas.
    DAILY_TASKS.forEach(scheduleDailyNotification);
});

// Nota de Segurança: A Web Speech API requer interação inicial do usuário para funcionar em alguns browsers (autoplay policy). 
// Teste em seu ambiente e considere chamar 'speakAlert' (com um texto simples, como "Alertas Ativos") após o primeiro clique do usuário se a voz não funcionar.
// ===================== SISTEMA DE AUTENTICAÇÃO =====================

/**
 * @description Verifica se o usuário está autenticado
 * @returns {boolean} True se autenticado, False caso contrário
 */
function isAuthenticated() {
    return sessionStorage.getItem('qdelicia_authenticated') === 'true';
}

/**
 * @description Marca o usuário como autenticado
 */
function setAuthenticated() {
    sessionStorage.setItem('qdelicia_authenticated', 'true');
}

/**
 * @description Remove a autenticação (logout)
 */
function clearAuthentication() {
    sessionStorage.removeItem('qdelicia_authenticated');
}

/**
 * @description Redireciona usuários não autenticados para a página de index
 * Se o usuário não está autenticado E não está na página de index, redireciona
 */
function checkAuthentication() {
    const currentPage = window.location.pathname;
    const isIndexPage = currentPage.includes('index.html') || currentPage.endsWith('/');
    
    if (!isAuthenticated() && !isIndexPage) {
        // Redireciona para index.html
        window.location.href = 'index.html';
    }
}

// Executa verificação ao carregar a página
document.addEventListener('DOMContentLoaded', checkAuthentication);

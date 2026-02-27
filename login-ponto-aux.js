document.addEventListener('DOMContentLoaded', () => {
    // Se já estiver logado, redireciona para a página de ponto
    if (localStorage.getItem('qd_user_session')) {
        window.location.href = 'ponto-aux.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('username').value.trim().toLowerCase();
        const passwordInput = document.getElementById('password').value.trim();

        if (!window.APP_CONFIG || !window.APP_CONFIG.users) {
            errorMessage.textContent = 'Erro de configuração do sistema. Atualize a página.';
            errorMessage.style.display = 'block';
            return;
        }

        const validUser = window.APP_CONFIG.users[usernameInput];

        if (validUser && validUser.password === passwordInput) {
            // Login successful
            const sessionData = {
                username: usernameInput,
                name: validUser.fullName,
                estado: validUser.estado,
                loginTime: new Date().getTime()
            };

            localStorage.setItem('qd_user_session', JSON.stringify(sessionData));

            // Redireciona para a página de ponto
            window.location.href = 'ponto-aux.html';
        } else {
            // Login failed
            errorMessage.textContent = 'Usuário ou senha incorretos.';
            errorMessage.style.display = 'block';

            // Oculta a mensagem de erro após 3 segundos
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
});

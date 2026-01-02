// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifierInput = document.getElementById('identifier') || document.getElementById('email') || document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const roleSelect = document.getElementById('userRole');

        const identifier = identifierInput ? identifierInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const role = roleSelect ? (roleSelect.value || 'CUSTOMER') : 'CUSTOMER';

        if (!identifier || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        try {
            await auth.login(identifier, password, role);
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Login failed', err);
            alert(err.message || 'Ошибка входа');
        }
    });
});

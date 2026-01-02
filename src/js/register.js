// js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const role = document.getElementById('userRole')?.value || 'CUSTOMER';

        if (!username || !email || !password || !confirmPassword) {
            alert('Заполните все поля');
            return;
        }
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            await auth.register(email, username, password, role);
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Register failed', err);
            alert(err.message || 'Ошибка при регистрации');
        }
    });
});
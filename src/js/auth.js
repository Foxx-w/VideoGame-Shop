// js/auth.js
class AuthService {
    constructor() {
        this.currentUser = null;
        this.cartItemsCount = 0;
    }

    async init() {
        try {
            const userData = await api.getCurrentUser();
            if (userData) {
                this.currentUser = userData;
                this.updateUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    async login(identifier, password, role = 'CUSTOMER') {
        try {
            // identifier can be email or username
            const payload = { Password: password, UserRole: role };
            if (identifier && identifier.indexOf && identifier.indexOf('@') !== -1) {
                payload.Email = identifier;
            } else {
                payload.Username = identifier;
            }
            const data = await api.login(payload);
            // server returns the user object directly
            this.currentUser = data;
            this.updateUI();
            if (window.menuManager) {
                window.menuManager.updateMenu();
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    async register(email, username, password, role = 'CUSTOMER') {
        try {
            const payload = { Email: email, Username: username, Password: password, UserRole: role };
            const data = await api.register(payload);
            this.currentUser = data;
            this.updateUI();
            if (window.menuManager) {
                window.menuManager.updateMenu();
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await api.logout();
            this.currentUser = null;
            this.cartItemsCount = 0;
            this.updateUI();
            if (window.menuManager) {
                window.menuManager.updateMenu();
                window.menuManager.closeMenu();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    // js/auth.js (только метод updateUI)
updateUI() {
    // Обновляем кнопку входа/выхода в хедере
    const userMenuLabel = document.getElementById('userMenuLabel');
    if (userMenuLabel) {
        if (this.currentUser) {
            if (this.currentUser.role === 'SELLER') {
                userMenuLabel.textContent = 'Продавец';
            } else {
                userMenuLabel.textContent = 'Профиль';
            }
        } else {
            userMenuLabel.textContent = 'Войти';
        }
    }

    // Обновляем данные пользователя в меню
    if (this.currentUser && this.currentUser.username) {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');
        const sellerName = document.getElementById('sellerName');
        const sellerEmail = document.getElementById('sellerEmail');
        const sellerAvatar = document.getElementById('sellerAvatar');
        
        if (userName) userName.textContent = this.currentUser.username;
        if (userEmail) userEmail.textContent = this.currentUser.email;
        if (userAvatar) userAvatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
        if (sellerName) sellerName.textContent = this.currentUser.username;
        if (sellerEmail) sellerEmail.textContent = this.currentUser.email;
        if (sellerAvatar) sellerAvatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
    }

    // Обновляем меню
    if (window.menuManager) {
        window.menuManager.updateMenuContent();
    }

    // Обновляем счетчик корзины
    this.updateCartBadge();
}

    async updateCartBadge() {
        if (this.currentUser?.role === 'CUSTOMER') {
            try {
                const cart = await api.getCart();
                if (cart && (cart.CartItems || cart.cartItems)) {
                    const items = cart.CartItems || cart.cartItems;
                    this.cartItemsCount = items.reduce((sum, item) => sum + (item.Quantity ?? item.quantity ?? 0), 0);

                    const cartBadge = document.getElementById('cartItemCount');
                    const cartBadgeMenu = document.getElementById('cartItemCountMenu');

                    if (cartBadge) {
                        cartBadge.textContent = this.cartItemsCount;
                        cartBadge.style.display = this.cartItemsCount > 0 ? 'block' : 'none';
                    }
                    if (cartBadgeMenu) {
                        cartBadgeMenu.textContent = this.cartItemsCount;
                        cartBadgeMenu.style.display = this.cartItemsCount > 0 ? 'block' : 'none';
                    }
                }
            } catch (error) {
                console.error('Failed to load cart:', error);
            }
        }
    }

    updateCartCount(count) {
        this.cartItemsCount = count;
        this.updateCartBadge();
    }
}

const auth = new AuthService();

// Инициализация авторизации при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    await auth.init();
    if (window.menuManager) {
        window.menuManager.updateMenu();
    }
});
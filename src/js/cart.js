// js/cart.js
class CartPage {
    constructor() {
        this.init();
    }

    async init() {
        await auth.checkAuth();
        if (auth.currentUser?.role !== 'CUSTOMER') {
            window.location.href = 'index.html';
            return;
        }
        this.setupEventListeners();
        await this.loadCart();
    }

    async loadCart() {
        try {
            const cart = await api.getCart();
            this.renderCart(cart);
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    }

    renderCart(cart) {
        const cartItemsContainer = document.getElementById('cartItems');
        const totalAmountElement = document.getElementById('totalAmount');
        
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
            if (totalAmountElement) totalAmountElement.textContent = '0 ₽';
            return;
        }
        
        let totalAmount = 0;
        
        cart.cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.gameTitle}</h4>
                    <div class="cart-item-price">${item.price ? item.price.toFixed(2) : '0.00'} ₽</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-game-id="${item.gameId}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-game-id="${item.gameId}">+</button>
                    <button class="remove-btn" data-game-id="${item.gameId}">×</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            
            // Обновить общую сумму
            totalAmount += (item.price || 0) * item.quantity;
        });
        
        if (totalAmountElement) {
            totalAmountElement.textContent = `${totalAmount.toFixed(2)} ₽`;
        }
    }

    setupEventListeners() {
        // Делегирование событий для динамических элементов
        document.addEventListener('click', async (e) => {
            const gameId = e.target.dataset?.gameId;
            if (!gameId) return;
            
            if (e.target.classList.contains('plus')) {
                await this.updateCartItem(gameId, 1);
            } else if (e.target.classList.contains('minus')) {
                await this.updateCartItem(gameId, -1);
            } else if (e.target.classList.contains('remove-btn')) {
                await this.removeCartItem(gameId);
            }
        });
        
        // Кнопка оформления заказа
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    async updateCartItem(gameId, delta) {
        try {
            const cart = await api.getCart();
            const item = cart.cartItems.find(i => i.gameId == gameId);
            
            if (item) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) {
                    await api.removeFromCart({ gameId, quantity: item.quantity });
                } else {
                    await api.addToCart({ gameId, quantity: delta });
                }
                await this.loadCart();
            }
        } catch (error) {
            console.error('Failed to update cart:', error);
        }
    }

    async removeCartItem(gameId) {
        try {
            const cart = await api.getCart();
            const item = cart.cartItems.find(i => i.gameId == gameId);
            
            if (item) {
                await api.removeFromCart({ gameId, quantity: item.quantity });
                await this.loadCart();
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    }

    async checkout() {
        try {
            const cart = await api.getCart();
            if (!cart.cartItems || cart.cartItems.length === 0) {
                alert('Корзина пуста');
                return;
            }
            
            const orderItems = cart.cartItems.map(item => ({
                gameId: item.gameId,
                quantity: item.quantity
            }));
            
            await api.createOrder({ orderItems });
            alert('Заказ успешно оформлен!');
            await this.loadCart(); // Корзина должна очиститься после заказа
        } catch (error) {
            console.error('Failed to checkout:', error);
            alert('Не удалось оформить заказ');
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new CartPage();
});
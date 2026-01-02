// js/cart.js
class CartPage {
    constructor() {
        this.init();
    }

    async init() {
        await auth.init();
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
        const cartItemsContainer = document.getElementById('cartBody') || document.getElementById('cartItems');
        const totalAmountElement = document.getElementById('totalPrice') || document.getElementById('totalAmount');
        
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        const items = cart?.CartItems || cart?.cartItems || [];

        if (!items || items.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
            if (totalAmountElement) totalAmountElement.textContent = '0 ₽';
            return;
        }

        let totalAmount = 0;

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.GameTitle || item.gameTitle || ''}</h4>
                    <div class="cart-item-price">${(item.Price ?? item.price) ? ((item.Price ?? item.price).toFixed ? (item.Price ?? item.price).toFixed(2) : (item.Price ?? item.price)) : '0.00'} ₽</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-game-id="${item.GameId || item.gameId}">-</button>
                    <span class="quantity">${item.Quantity ?? item.quantity ?? 0}</span>
                    <button class="quantity-btn plus" data-game-id="${item.GameId || item.gameId}">+</button>
                    <button class="remove-btn" data-game-id="${item.GameId || item.gameId}">×</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            
            // Обновить общую сумму
            totalAmount += ((item.Price ?? item.price) || 0) * (item.Quantity ?? item.quantity ?? 0);
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
            const items = cart?.CartItems || cart?.cartItems || [];
            const item = items.find(i => (i.GameId || i.gameId) == gameId);

            if (item) {
                const currentQty = item.Quantity ?? item.quantity ?? 0;
                const newQuantity = currentQty + delta;
                if (newQuantity <= 0) {
                    await api.removeFromCart(gameId, currentQty);
                } else {
                    // addToCart increases by quantity
                    await api.addToCart(gameId, delta);
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
            const items = cart?.CartItems || cart?.cartItems || [];
            const item = items.find(i => (i.GameId || i.gameId) == gameId);

            if (item) {
                const qty = item.Quantity ?? item.quantity ?? 0;
                await api.removeFromCart(gameId, qty);
                await this.loadCart();
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    }

    async checkout() {
        try {
            const cart = await api.getCart();
            const items = cart?.CartItems || cart?.cartItems || [];
            if (!items || items.length === 0) {
                alert('Корзина пуста');
                return;
            }
            const orderItems = items.map(item => ({
                GameId: item.GameId ?? item.gameId,
                Quantity: item.Quantity ?? item.quantity
            }));

            await api.createOrder(orderItems);
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
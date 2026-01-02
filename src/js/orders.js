// js/orders.js
class OrdersPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.init();
    }

    async init() {
        await auth.init();
        if (auth.currentUser?.role !== 'CUSTOMER') {
            window.location.href = 'index.html';
            return;
        }
        this.setupEventListeners();
        await this.loadOrders();
    }

    async loadOrders() {
        try {
            const response = await api.getOrders(this.currentPage, this.pageSize);
            this.renderOrders(response);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    }

    renderOrders(response) {
        const ordersContainer = document.getElementById('ordersList');
        if (!ordersContainer) return;
        
        ordersContainer.innerHTML = '';
        
        if (!response.content || response.content.length === 0) {
            ordersContainer.innerHTML = '<div class="empty-orders">Заказов нет</div>';
            return;
        }
        
        response.content.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <div class="order-header">
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                    <span class="order-total">${order.totalAmount.toFixed(2)} ₽</span>
                </div>
                <div class="order-items">
                    ${order.orderItems.map(item => `
                        <div class="order-game">
                            <span class="game-title">${item.gameTitle}</span>
                            <span class="game-quantity">×${item.quantity}</span>
                            <span class="game-price">${item.price.toFixed(2)} ₽</span>
                        </div>
                    `).join('')}
                </div>
            `;
            ordersContainer.appendChild(orderElement);
        });
    }

    setupEventListeners() {
        // Пагинация
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadOrders();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadOrders();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OrdersPage();
});
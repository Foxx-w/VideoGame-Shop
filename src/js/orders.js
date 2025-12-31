export const ordersAPI = {
    // Получить страницу заказов (Покупатель)
    async getOrders(page = 1, pageSize = 20) {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });
        
        const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
            credentials: 'include'
        });
        return response.json();
    },

    // Оформить заказ (Покупатель)
    async createOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });
        return response.json();
    }
};
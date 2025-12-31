export const cartAPI = {
    // Получить корзину (Покупатель)
    async getCart() {
        const response = await fetch(`${API_BASE_URL}/carts`, {
            credentials: 'include'
        });
        return response.json();
    },

    // Добавить позицию в корзину (Покупатель)
    async addToCart(itemData) {
        const response = await fetch(`${API_BASE_URL}/carts/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData),
            credentials: 'include'
        });
        return response.json();
    },

    // Удалить позицию из корзины (Покупатель)
    async removeFromCart(itemData) {
        const response = await fetch(`${API_BASE_URL}/carts/items`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData),
            credentials: 'include'
        });
        return response.json();
    }
};
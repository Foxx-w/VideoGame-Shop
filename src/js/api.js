// js/api.js (обновленная версия)
class ApiService {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        // If body is FormData, remove Content-Type header so browser sets multipart boundary
        if (mergedOptions.body instanceof FormData) {
            if (mergedOptions.headers && mergedOptions.headers['Content-Type']) {
                delete mergedOptions.headers['Content-Type'];
            }
        }
        try {
            const response = await fetch(url, mergedOptions);
            
            if (response.status === 401) {
                // Unauthorized - перенаправляем на логин
                router.navigate('login');
                return null;
            }
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: `HTTP error ${response.status}`,
                    statusCode: response.status
                }));
                throw new Error(error.message || `HTTP error ${response.status}`);
            }

            if (response.status === 204 || options.method === 'DELETE') {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(data) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(data) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async logout() {
        return this.request('/api/auth/logout', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    // Games endpoints
    async getGame(id) {
        return this.request(`/api/games/${id}`);
    }

    async getGames(filters = {}, page = 1, pageSize = 20) {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());

        // Map filters to server contract: MinPrice, MaxPrice, GameTitle, Genres
        if (filters.minPrice !== null && filters.minPrice !== undefined && filters.minPrice !== '') {
            params.append('MinPrice', filters.minPrice.toString());
        }
        if (filters.maxPrice !== null && filters.maxPrice !== undefined && filters.maxPrice !== '') {
            params.append('MaxPrice', filters.maxPrice.toString());
        }
        if (filters.gameTitle) {
            params.append('GameTitle', filters.gameTitle);
        }
        if (filters.genres && Array.isArray(filters.genres) && filters.genres.length > 0) {
            filters.genres.forEach(g => params.append('Genres', g));
        }

        return this.request(`/api/games?${params}`);
    }

    async getMyGames(page = 1, pageSize = 20) {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        return this.request(`/api/games/my?${params}`);
    }

    async createGame(formData) {
        return this.request('/api/games', {
            method: 'POST',
            body: formData,
            // no headers here so multipart is sent correctly
        });
    }

    async updateGame(id, formData) {
        return this.request(`/api/games/${id}`, {
            method: 'PUT',
            body: formData,
            // no headers here so multipart is sent correctly
        });
    }

    async deleteGame(id) {
        return this.request(`/api/games/${id}`, {
            method: 'DELETE',
        });
    }

    async addGameKeys(id, keysFile) {
        const formData = new FormData();
        formData.append('Keys', keysFile);
        return this.request(`/api/games/${id}/keys`, {
            method: 'POST',
            body: formData,
            // multipart form
        });
    }

    // Cart endpoints
    async getCart() {
        return this.request('/api/carts');
    }

    async addToCart(gameId, quantity = 1) {
        return this.request('/api/carts/items', {
            method: 'POST',
            body: JSON.stringify({ GameId: gameId, Quantity: quantity }),
        });
    }

    // remove specified quantity; backend will remove position if quantity becomes 0
    async removeFromCart(gameId, quantity = 1) {
        return this.request('/api/carts/items', {
            method: 'DELETE',
            body: JSON.stringify({ GameId: gameId, Quantity: quantity }),
        });
    }

    // Orders endpoints
    async getOrders(page = 1, pageSize = 20) {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        return this.request(`/api/orders?${params}`);
    }

    async createOrder(orderItems) {
        // orderItems: [{ GameId, Quantity }] or { OrderItems: [...] }
        const body = Array.isArray(orderItems) ? { OrderItems: orderItems } : (orderItems || {});
        return this.request('/api/orders', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    // Genres endpoints
    async getGenres() {
        return this.request('/api/genres');
    }
}

const api = new ApiService();
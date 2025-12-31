// api.js - Полный API клиент для взаимодействия с бекендом
class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    statusCode: response.status,
                    message: response.statusText
                }));
                throw error;
            }
            
            // Для DELETE запросов без тела ответа
            if (response.status === 204 || options.method === 'DELETE') {
                return true;
            }
            
            // Проверяем, есть ли тело ответа
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            }
            
            return response.text();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Геттеры для разных модулей API
    get auth() {
        return {
            register: (data) => this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data)
            }),
            login: (data) => this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(data)
            }),
            logout: () => this.request('/auth/logout', { method: 'POST' }),
            check: () => this.request('/auth/check', { method: 'GET' })
        };
    }

    get games() {
        return {
            // Получить игру по ID
            getById: (id) => this.request(`/games/${id}`, { method: 'GET' }),
            
            // Получить страницу игр с фильтрами
            getPage: (filters = {}, page = 1, pageSize = 20) => {
                const params = new URLSearchParams();
                params.append('page', page);
                params.append('pageSize', pageSize);
                
                if (filters.minPrice !== undefined && filters.minPrice !== null) {
                    params.append('MinPrice', filters.minPrice);
                }
                if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
                    params.append('MaxPrice', filters.maxPrice);
                }
                if (filters.gameTitle) {
                    params.append('GameTitle', filters.gameTitle);
                }
                if (filters.genres && filters.genres.length > 0) {
                    filters.genres.forEach(genre => params.append('Genres', genre));
                }
                
                return this.request(`/games?${params.toString()}`, { method: 'GET' });
            },
            
            // Удалить игру
            delete: (id) => this.request(`/games/${id}`, { method: 'DELETE' }),
            
            // Обновить игру (требует FormData)
            update: (id, formData) => {
                return fetch(`${this.baseUrl}/games/${id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                }).then(response => {
                    if (!response.ok) {
                        return response.json().then(error => { throw error; });
                    }
                    return response.json();
                });
            },
            
            // Создать игру (требует FormData)
            create: (formData) => {
                return fetch(`${this.baseUrl}/games`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }).then(response => {
                    if (!response.ok) {
                        return response.json().then(error => { throw error; });
                    }
                    return response.json();
                });
            },
            
            // Добавить ключи к игре (требует FormData)
            addKeys: (id, formData) => {
                return fetch(`${this.baseUrl}/games/${id}/keys`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }).then(response => {
                    if (!response.ok) {
                        return response.json().then(error => { throw error; });
                    }
                    return response.json();
                });
            },
            
            // Получить игры текущего продавца
            getMyGames: (page = 1, pageSize = 20) => {
                const params = new URLSearchParams();
                params.append('page', page);
                params.append('pageSize', pageSize);
                
                return this.request(`/games/my?${params.toString()}`, { method: 'GET' });
            }
        };
    }

    get orders() {
        return {
            // Получить страницу заказов
            getPage: (page = 1, pageSize = 20) => {
                const params = new URLSearchParams();
                params.append('page', page);
                params.append('pageSize', pageSize);
                
                return this.request(`/orders?${params.toString()}`, { method: 'GET' });
            },
            
            // Создать заказ
            create: (data) => this.request('/orders', {
                method: 'POST',
                body: JSON.stringify(data)
            })
        };
    }

    get cart() {
        return {
            // Удалить товар из корзины
            removeItem: (data) => this.request('/carts/items', {
                method: 'DELETE',
                body: JSON.stringify(data)
            }),
            
            // Добавить товар в корзину
            addItem: (data) => this.request('/carts/items', {
                method: 'POST',
                body: JSON.stringify(data)
            }),
            
            // Получить корзину
            get: () => this.request('/carts', { method: 'GET' })
        };
    }

    get genres() {
        return {
            // Получить все жанры
            getAll: () => this.request('/genres', { method: 'GET' })
        };
    }
    
    // Вспомогательные методы для создания FormData
    
    /**
     * Создать FormData для создания игры
     * @param {Object} gameData - данные игры
     * @returns {FormData}
     */
    createGameFormData(gameData) {
        const formData = new FormData();
        
        formData.append('DeveloperTitle', gameData.developerTitle);
        formData.append('PublisherTitle', gameData.publisherTitle);
        formData.append('Price', gameData.price.toString());
        formData.append('Title', gameData.title);
        
        if (gameData.description) {
            formData.append('Description', gameData.description);
        }
        
        // Добавляем жанры
        if (gameData.genres && gameData.genres.length > 0) {
            gameData.genres.forEach((genre, index) => {
                formData.append(`Genres[${index}].Title`, genre);
            });
        }
        
        if (gameData.keysFile) {
            formData.append('Keys', gameData.keysFile);
        }
        
        if (gameData.imageFile) {
            formData.append('Image', gameData.imageFile);
        }
        
        return formData;
    }
    
    /**
     * Создать FormData для обновления игры
     * @param {Object} gameData - данные игры
     * @returns {FormData}
     */
    updateGameFormData(gameData) {
        const formData = new FormData();
        
        formData.append('DeveloperTitle', gameData.developerTitle);
        formData.append('PublisherTitle', gameData.publisherTitle);
        formData.append('Price', gameData.price.toString());
        formData.append('Title', gameData.title);
        
        if (gameData.description) {
            formData.append('Description', gameData.description);
        }
        
        // Добавляем жанры
        if (gameData.genres && gameData.genres.length > 0) {
            gameData.genres.forEach((genre, index) => {
                formData.append(`Genres[${index}].Title`, genre);
            });
        }
        
        if (gameData.imageFile) {
            formData.append('Image', gameData.imageFile);
        }
        
        return formData;
    }
    
    /**
     * Создать FormData для добавления ключей
     * @param {File} keysFile - файл с ключами
     * @returns {FormData}
     */
    createKeysFormData(keysFile) {
        const formData = new FormData();
        formData.append('Keys', keysFile);
        return formData;
    }
    
    // Вспомогательные методы для создания объектов запросов
    
    /**
     * Создать объект UserRequest
     */
    createUserRequest(email, username, password, userRole) {
        return {
            Email: email,
            Username: username,
            Password: password,
            UserRole: userRole // 'CUSTOMER' или 'SELLER'
        };
    }
    
    /**
     * Создать объект CartItemRequest
     */
    createCartItemRequest(gameId, quantity) {
        return {
            GameId: gameId,
            Quantity: quantity
        };
    }
    
    /**
     * Создать объект OrderItemRequest
     */
    createOrderItemRequest(gameId, quantity) {
        return {
            GameId: gameId,
            Quantity: quantity
        };
    }
    
    /**
     * Создать объект OrderRequest из массива товаров
     */
    createOrderRequest(orderItems) {
        return {
            OrderItems: orderItems
        };
    }
    
    /**
     * Создать объект FilterRequest
     */
    createFilterRequest(minPrice, maxPrice, gameTitle, genres) {
        const filter = {};
        
        if (minPrice !== undefined && minPrice !== null) filter.MinPrice = minPrice;
        if (maxPrice !== undefined && maxPrice !== null) filter.MaxPrice = maxPrice;
        if (gameTitle) filter.GameTitle = gameTitle;
        if (genres && genres.length > 0) filter.Genres = genres;
        
        return filter;
    }
    
    /**
     * Утилита для оформления заказа из корзины
     */
    async checkoutFromCart(cartItems) {
        const orderItems = cartItems.map(item => 
            this.createOrderItemRequest(item.gameId, item.quantity)
        );
        
        const orderRequest = this.createOrderRequest(orderItems);
        return this.orders.create(orderRequest);
    }
    
    /**
     * Обработчик ошибок API
     */
    handleApiError(error) {
        console.error('API Error Details:', error);
        
        if (error.statusCode) {
            return {
                status: error.statusCode,
                message: error.message || 'Ошибка сервера'
            };
        }
        
        return {
            status: -1,
            message: error.message || 'Неизвестная ошибка'
        };
    }
}

const apiClient = new ApiClient();
window.api = apiClient;
export const gamesAPI = {
    // Получить игру по ID
    async getGameById(id) {
        const response = await fetch(`${API_BASE_URL}/games/${id}`, {
            credentials: 'include'
        });
        return response.json();
    },

    // Получить игры с фильтрацией и пагинацией
    async getGames(filters = {}, page = 1, pageSize = 20) {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
            ...filters
        });
        
        const response = await fetch(`${API_BASE_URL}/games?${params}`, {
            credentials: 'include'
        });
        return response.json();
    },

    // Удалить игру (Продавец)
    async deleteGame(id) {
        const response = await fetch(`${API_BASE_URL}/games/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response;
    },

    // Обновить игру (Продавец)
    async updateGame(id, gameData) {
        const formData = new FormData();
        Object.keys(gameData).forEach(key => {
            if (key === 'Genres') {
                gameData.Genres.forEach((genre, i) => {
                    formData.append(`Genres[${i}].Title`, genre.Title);
                });
            } else if (gameData[key] !== null && gameData[key] !== undefined) {
                formData.append(key, gameData[key]);
            }
        });

        const response = await fetch(`${API_BASE_URL}/games/${id}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });
        return response.json();
    },

    // Добавить новую игру (Продавец)
    async createGame(gameData) {
        const formData = new FormData();
        formData.append('Title', gameData.title);
        formData.append('PublisherTitle', gameData.publisherTitle);
        formData.append('DeveloperTitle', gameData.developerTitle);
        formData.append('Price', gameData.price.toString());
        if (gameData.description) {
            formData.append('Description', gameData.description);
        }
        
        gameData.genres.forEach((genre, i) => {
            formData.append(`Genres[${i}].Title`, genre.Title);
        });
        
        if (gameData.keysFile) {
            formData.append('Keys', gameData.keysFile);
        }
        if (gameData.imageFile) {
            formData.append('Image', gameData.imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/games`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        return response.json();
    },

    // Добавить ключи для игры (Продавец)
    async addKeysToGame(id, keysFile) {
        const formData = new FormData();
        formData.append('Keys', keysFile);

        const response = await fetch(`${API_BASE_URL}/games/${id}/keys`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        return response.json();
    },

    // Получить игры текущего продавца (Продавец)
    async getMyGames(page = 1, pageSize = 20) {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });
        
        const response = await fetch(`${API_BASE_URL}/games/my?${params}`, {
            credentials: 'include'
        });
        return response.json();
    }
};
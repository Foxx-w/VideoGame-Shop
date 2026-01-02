// js/index.js (упрощенная версия)
class GameStore {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.filters = {
            minPrice: null,
            maxPrice: null,
            gameTitle: '',
            genres: []
        };
        this.selectedGenres = [];
        this.allGenres = [];
        
        this.init();
    }

    async init() {
        await this.loadGenres();
        this.setupEventListeners();
        await this.loadGames();
    }

    // Настройка слушателей событий для поиска и очистки

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearchBtn');

        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(async () => {
                    this.filters.gameTitle = e.target.value.trim();
                    this.currentPage = 1;
                    await this.loadGames();
                }, 350);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                if (searchInput) searchInput.value = '';
                this.filters.gameTitle = '';
                this.currentPage = 1;
                await this.loadGames();
            });
        }
    }

    async loadGenres() {
        try {
            const genres = await api.getGenres();
            this.allGenres = genres.map(g => g.title);
            this.renderGenreFilters();
        } catch (error) {
            console.error('Failed to load genres:', error);
        }
    }

    async loadGames() {
        const loadingSpinner = document.getElementById('loading-spinner');
        const noResults = document.getElementById('no-results');
        const productsGrid = document.getElementById('products-grid');
        
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        if (noResults) noResults.style.display = 'none';
        
        try {
            const filters = {
                minPrice: this.filters.minPrice ? parseFloat(this.filters.minPrice) : null,
                maxPrice: this.filters.maxPrice ? parseFloat(this.filters.maxPrice) : null,
                gameTitle: this.filters.gameTitle || null,
                genres: this.selectedGenres.length > 0 ? this.selectedGenres : null
            };
            
            const response = await api.getGames(filters, this.currentPage, this.pageSize);
            
            this.updateFilterInfo(response);
            
            if (productsGrid) productsGrid.innerHTML = '';
            
            if (response.content && response.content.length > 0) {
                response.content.forEach(game => this.renderGameCard(game));
                this.renderPagination(response);
            } else {
                if (noResults) noResults.style.display = 'block';
                this.hidePagination();
            }
        } catch (error) {
            console.error('Failed to load games:', error);
            if (noResults) {
                noResults.textContent = 'Ошибка загрузки товаров';
                noResults.style.display = 'block';
            }
        } finally {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    async addToCart(gameId) {
        if (!auth.currentUser || auth.currentUser.role !== 'CUSTOMER') {
            alert('Пожалуйста, войдите как покупатель для добавления в корзину');
            return;
        }
        
        try {
            await api.addToCart(gameId, 1);
            await auth.updateCartBadge();
            alert('Товар добавлен в корзину!');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Не удалось добавить товар в корзину');
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    window.gameStore = new GameStore();
});
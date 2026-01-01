// index.js - Логика главной страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация фильтров и пагинации
    initFilters();
    initPagination();
    loadGames();
    
    // Восстановление пользователя из localStorage
    if (window.restoreUserFromStorage) {
        window.restoreUserFromStorage();
    }
});

// Текущее состояние фильтров
let currentFilters = {
    MinPrice: null,
    MaxPrice: null,
    GameTitle: '',
    Genres: []
};

let currentPage = 1;
let pageSize = 20;
let totalPages = 1;
let totalElements = 0;

// Инициализация фильтров
function initFilters() {
    // Фильтр по цене
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyFilterBtn = document.getElementById('apply-filter');
    const resetFilterBtn = document.getElementById('reset-filter');
    
    // Поиск по названию (используем существующий в header)
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // Очистка всех фильтров
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFilters);
    }
    
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Поиск по названию с debounce
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            // Показываем кнопку очистки если есть текст
            if (this.value.trim() && clearSearchBtn) {
                clearSearchBtn.style.display = 'block';
            } else if (clearSearchBtn) {
                clearSearchBtn.style.display = 'none';
            }
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.GameTitle = this.value.trim();
                currentPage = 1;
                loadGames();
            }, 500);
        });
    }
    
    // Очистка поиска
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                currentFilters.GameTitle = '';
                currentPage = 1;
                this.style.display = 'none';
                loadGames();
            }
        });
    }
    
    // Применение фильтров по Enter в поиске
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                currentFilters.GameTitle = this.value.trim();
                currentPage = 1;
                loadGames();
            }
        });
    }
}

// Применить фильтры
function applyFilters() {
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    
    currentFilters.MinPrice = minPrice ? parseFloat(minPrice) : null;
    currentFilters.MaxPrice = maxPrice ? parseFloat(maxPrice) : null;
    
    // Проверка валидности
    if (currentFilters.MinPrice !== null && currentFilters.MaxPrice !== null) {
        if (currentFilters.MinPrice > currentFilters.MaxPrice) {
            alert('Минимальная цена не может быть больше максимальной');
            return;
        }
    }
    
    currentPage = 1;
    loadGames();
}

// Сбросить фильтры
function resetFilters() {
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    currentFilters.MinPrice = null;
    currentFilters.MaxPrice = null;
    currentPage = 1;
    loadGames();
}

// Очистить все фильтры
function clearAllFilters() {
    resetFilters();
    
    // Очистка поиска
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        searchInput.value = '';
        currentFilters.GameTitle = '';
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }
    
    currentFilters.Genres = [];
    
    // Сброс выбранных жанров
    if (window.clearSelectedGenres) {
        window.clearSelectedGenres();
    }
    
    currentPage = 1;
    loadGames();
}

// Инициализация пагинации
function initPagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadGames();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                loadGames();
            }
        });
    }
}

// Загрузка игр с учетом фильтров
async function loadGames() {
    const productsGrid = document.getElementById('products-grid');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResults = document.getElementById('no-results');
    const paginationContainer = document.getElementById('paginationContainer');
    
    // Показываем спиннер
    productsGrid.innerHTML = '';
    loadingSpinner.style.display = 'block';
    noResults.style.display = 'none';
    if (paginationContainer) paginationContainer.style.display = 'none';
    
    try {
        // Используем API клиент для получения игр
        const pageData = await window.api.games.getPage(
            currentFilters,
            currentPage,
            pageSize
        );
        
        // Обновляем глобальные переменные
        totalPages = pageData.TotalPages || 1;
        totalElements = pageData.TotalElements || 0;
        currentPage = pageData.PageNumber || 1;
        
        // Скрываем спиннер
        loadingSpinner.style.display = 'none';
        
        // Проверяем есть ли результаты
        if (!pageData.Content || pageData.Content.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        // Отображаем товары
        renderGames(pageData.Content);
        
        // Обновляем пагинацию
        updatePagination();
        
        // Обновляем информацию о фильтре
        updateFilterInfo();
        
    } catch (error) {
        console.error('Ошибка загрузки игр:', error);
        loadingSpinner.style.display = 'none';
        noResults.style.display = 'block';
        noResults.textContent = 'Ошибка загрузки товаров';
    }
}

// Отображение игр
function renderGames(games) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = createGameCard(game);
        productsGrid.appendChild(gameCard);
    });
    
    // Инициализируем обработчики кликов на карточки
    initGameCardClickHandlers();
}

// Создание карточки игры
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = game.Id;
    
    const priceFormatted = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(game.Price);
    
    card.innerHTML = `
        <div class="product-image-wrapper">
            <img src="${game.ImageUrl || 'assets/images/placeholder.jpg'}" 
                 alt="${game.Title}" 
                 class="product-image" 
                 loading="lazy"
                 onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        <div class="product-card-content">
            <h3 class="product-title">${game.Title}</h3>
            <div class="product-meta">
                <span class="product-developer">${game.DeveloperTitle}</span>
                <span class="product-genres">${(game.Genres || []).map(g => g.Title).join(', ')}</span>
            </div>
            <div class="product-price">${priceFormatted} ₽</div>
        </div>
        <button class="add-to-cart-btn" 
                aria-label="Добавить в корзину" 
                onclick="event.stopPropagation(); addToCart(${game.Id}, '${game.Title.replace(/'/g, "\\'")}', ${game.Price})">
            <span class="btn-text">В корзину</span>
            <span class="btn-icon">+</span>
        </button>
    `;
    
    return card;
}

// Инициализация обработчиков кликов на карточки
function initGameCardClickHandlers() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.dataset.productId;
            window.openProductView(productId);
        });
    });
}

// Добавление в корзину
async function addToCart(gameId, gameTitle, price) {
    try {
        const cartItem = window.api.createCartItemRequest(gameId, 1);
        await window.api.cart.addItem(cartItem);
        
        showNotification(`"${gameTitle}" добавлен в корзину!`, 'success');
        
        // Обновляем данные корзины в меню
        if (window.authManager && window.authManager.loadCartData) {
            window.authManager.loadCartData();
        }
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        const errorMsg = error.Message || 'Ошибка добавления в корзину';
        showNotification(errorMsg, 'error');
    }
}

// Обновление пагинации
function updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    if (!paginationContainer) return;
    
    // Показываем пагинацию если есть больше 1 страницы
    if (totalPages > 1) {
        paginationContainer.style.display = 'flex';
    } else {
        paginationContainer.style.display = 'none';
    }
    
    // Обновляем информацию о страницах
    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    // Обновляем кнопки
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    
    // Генерируем номера страниц
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        // Показываем максимум 5 страниц
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Корректируем если в начале
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Первая страница
        if (startPage > 1) {
            const firstPageBtn = createPageButton(1);
            pageNumbers.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
        }
        
        // Основные страницы
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPageButton(i);
            if (i === currentPage) {
                pageBtn.classList.add('active');
                pageBtn.setAttribute('aria-current', 'page');
            }
            pageNumbers.appendChild(pageBtn);
        }
        
        // Последняя страница
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
            
            const lastPageBtn = createPageButton(totalPages);
            pageNumbers.appendChild(lastPageBtn);
        }
    }
}

// Создание кнопки страницы
function createPageButton(pageNumber) {
    const button = document.createElement('button');
    button.className = 'page-number';
    button.dataset.page = pageNumber;
    button.textContent = pageNumber;
    button.setAttribute('aria-label', `Страница ${pageNumber}`);
    
    button.addEventListener('click', function() {
        currentPage = pageNumber;
        loadGames();
    });
    
    return button;
}

// Обновление информации о фильтре
function updateFilterInfo() {
    const filterRangeText = document.getElementById('filterRangeText');
    const filterCountText = document.getElementById('filterCountText');
    
    if (filterRangeText) {
        const min = currentFilters.MinPrice !== null ? currentFilters.MinPrice.toFixed(2) : '0';
        const max = currentFilters.MaxPrice !== null ? currentFilters.MaxPrice.toFixed(2) : '∞';
        filterRangeText.textContent = `от ${min} до ${max} ₽`;
    }
    
    if (filterCountText) {
        filterCountText.textContent = `(найдено ${totalElements} товаров)`;
    }
}

// Вспомогательная функция для уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#52C41A' : type === 'error' ? '#FF4D4F' : '#0962C9'};
        color: white;
        border-radius: 8px;
        font-family: 'Montserrat Alternates', sans-serif;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Функция для установки жанров фильтра (будет вызываться из genres.js)
function setSelectedGenres(genres) {
    currentFilters.Genres = genres;
    currentPage = 1;
    loadGames();
}

// Функция для обновления выбранных жанров в UI
function updateSelectedGenresDisplay(genres, genresData) {
    const activeFilters = document.getElementById('activeFilters');
    const filterTags = document.getElementById('filterTags');
    
    if (!activeFilters || !filterTags) return;
    
    filterTags.innerHTML = '';
    
    if (genres && genres.length > 0) {
        // Показываем блок с выбранными жанрами
        activeFilters.classList.remove('hidden');
        
        // Добавляем теги для каждого выбранного жанра
        genres.forEach(genreId => {
            const genre = genresData.find(g => g.id === genreId);
            if (genre) {
                const tag = document.createElement('span');
                tag.className = 'filter-tag';
                tag.textContent = genre.label;
                filterTags.appendChild(tag);
            }
        });
    } else {
        // Скрываем блок если жанры не выбраны
        activeFilters.classList.add('hidden');
    }
}

// Глобальные функции
window.addToCart = addToCart;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.clearAllFilters = clearAllFilters;
window.setSelectedGenres = setSelectedGenres;
window.updateSelectedGenresDisplay = updateSelectedGenresDisplay;
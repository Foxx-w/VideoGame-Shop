// product_view.js - JavaScript для модального окна просмотра товара

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initProductView, 100);
});

function initProductView() {
    const productViewOverlay = document.getElementById('productViewOverlay');
    const closeProductViewBtn = document.getElementById('closeProductViewBtn');
    const backToProductsBtn = document.getElementById('backToProductsBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    const viewTitle = document.getElementById('viewTitle');
    const viewDescription = document.getElementById('viewDescription');
    const viewPrice = document.getElementById('viewPrice');
    const viewDeveloper = document.getElementById('viewDeveloper');
    const viewPublisher = document.getElementById('viewPublisher');
    const viewPlatform = document.getElementById('viewPlatform');
    const viewSellerName = document.getElementById('viewSellerName');
    const viewGenresContainer = document.getElementById('viewGenresContainer');
    const viewMainImage = document.getElementById('viewMainImage');
    const viewMainImagePlaceholder = document.querySelector('.photo-placeholder.large .no-image-text');

    // API Base URL
    const API_BASE_URL = '/api';

    // Инициализация карточек товаров
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.add-to-cart-btn')) {
                const productId = this.dataset.productId;
                openProductView(productId);
            }
        });
    });

    // Обработчики закрытия
    if (closeProductViewBtn) {
        closeProductViewBtn.addEventListener('click', closeProductView);
    }

    if (backToProductsBtn) {
        backToProductsBtn.addEventListener('click', closeProductView);
    }

    // Обработчик кнопки "В корзину"
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }

    // Закрытие при клике на оверлей
    if (productViewOverlay) {
        productViewOverlay.addEventListener('click', function(e) {
            if (e.target === productViewOverlay) {
                closeProductView();
            }
        });
    }

    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productViewOverlay && productViewOverlay.classList.contains('active')) {
            closeProductView();
        }
    });
}

// Открытие модального окна просмотра
async function openProductView(productId) {
    const productViewOverlay = document.getElementById('productViewOverlay');
    if (!productViewOverlay) {
        console.error('Не найден элемент #productViewOverlay');
        return;
    }

    try {
        // GET /api/games/{id} - получение информации об игре
        const response = await fetch(`/api/games/${productId}`);
        if (response.ok) {
            const game = await response.json();
            fillProductViewData(game);
        } else {
            const error = await response.json();
            showNotification(error.Message || 'Ошибка загрузки игры', 'error');
            return;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка сети при загрузке игры', 'error');
        return;
    }

    productViewOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
function closeProductView() {
    const productViewOverlay = document.getElementById('productViewOverlay');
    if (productViewOverlay) {
        productViewOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Заполнение данных товара
function fillProductViewData(game) {
    const viewTitle = document.getElementById('viewTitle');
    const viewDescription = document.getElementById('viewDescription');
    const viewPrice = document.getElementById('viewPrice');
    const viewDeveloper = document.getElementById('viewDeveloper');
    const viewPublisher = document.getElementById('viewPublisher');
    const viewPlatform = document.getElementById('viewPlatform');
    const viewSellerName = document.getElementById('viewSellerName');
    const viewGenresContainer = document.getElementById('viewGenresContainer');
    const viewMainImage = document.getElementById('viewMainImage');
    const viewMainImagePlaceholder = document.querySelector('.photo-placeholder.large .no-image-text');

    // Основная информация
    if (viewTitle) viewTitle.textContent = game.Title || 'Без названия';
    if (viewDescription) viewDescription.textContent = game.Description || 'Описание отсутствует';
    if (viewPrice) viewPrice.textContent = game.Price ? formatPrice(game.Price) + ' ₽' : '0 ₽';
    if (viewDeveloper) viewDeveloper.textContent = game.DeveloperTitle || 'Не указан';
    if (viewPublisher) viewPublisher.textContent = game.PublisherTitle || 'Не указан';
    if (viewPlatform) viewPlatform.textContent = 'PC'; // В DTO нет поля Platform
    if (viewSellerName) viewSellerName.textContent = 'Продавец'; // Нужно получать из другого endpoint

    // Жанры
    if (viewGenresContainer) {
        renderGenres(game.Genres || []);
    }

    // Изображение
    if (viewMainImage) {
        if (game.ImageUrl) {
            viewMainImage.src = game.ImageUrl;
            viewMainImage.style.display = 'block';
            if (viewMainImagePlaceholder) {
                viewMainImagePlaceholder.style.display = 'none';
            }
        } else {
            viewMainImage.style.display = 'none';
            if (viewMainImagePlaceholder) {
                viewMainImagePlaceholder.style.display = 'block';
            }
        }
    }
}

// Рендер жанров
function renderGenres(genres) {
    const viewGenresContainer = document.getElementById('viewGenresContainer');
    if (!viewGenresContainer) return;

    viewGenresContainer.innerHTML = '';

    if (!genres || !Array.isArray(genres) || genres.length === 0) {
        const noGenres = document.createElement('span');
        noGenres.className = 'view-genre-tag';
        noGenres.textContent = 'Не указаны';
        noGenres.style.opacity = '0.7';
        viewGenresContainer.appendChild(noGenres);
        return;
    }

    genres.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = 'view-genre-tag';
        genreTag.textContent = genre.Title || genre.title || 'Жанр';
        viewGenresContainer.appendChild(genreTag);
    });
}

// Добавление в корзину
async function addToCart() {
    const productId = getCurrentProductId();
    if (!productId) {
        showNotification('Не удалось определить игру', 'error');
        return;
    }

    const cartItem = {
        GameId: productId,
        Quantity: 1
    };

    try {
        // POST /api/carts/items - добавление в корзину
        const response = await fetch('/api/carts/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
            credentials: "include",
        });

        if (response.ok) {
            const productName = document.getElementById('viewTitle')?.textContent || 'Игра';
            showNotification(`"${productName}" добавлен в корзину!`, 'success');
            
            // Закрываем модальное окно
            setTimeout(closeProductView, 1500);
        } else {
            const error = await response.json();
            showNotification(error.Message || 'Ошибка добавления в корзину', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка сети при добавлении в корзину', 'error');
    }
}

// Получение ID текущей игры (из data-атрибута или другого источника)
function getCurrentProductId() {
    const overlay = document.getElementById('productViewOverlay');
    if (!overlay) return null;
    
    // Здесь можно хранить ID в data-атрибуте оверлея
    return overlay.dataset.currentProductId;
}

// Вспомогательные функции
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

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

// Делаем функции доступными глобально
window.openProductView = openProductView;
window.closeProductView = closeProductView;
window.addToCart = addToCart;
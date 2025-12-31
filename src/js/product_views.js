// product_view.js - JavaScript для модального окна просмотра товара
// Использует данные жанров из genres.js

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация после полной загрузки DOM
    setTimeout(initProductView, 100);
});

function initProductView() {
    // Элементы DOM
    const productViewOverlay = document.getElementById('productViewOverlay');
    const closeProductViewBtn = document.getElementById('closeProductViewBtn');
    const backToProductsBtn = document.getElementById('backToProductsBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    // Элементы для отображения данных
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

    // Получаем данные жанров из глобальной переменной
    const genresData = window.genresData || [];

    // Инициализация карточек товаров
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
            // Проверяем, не кликнули ли на кнопку "В корзину"
            if (!e.target.closest('.add-to-cart-btn')) {
                const productId = this.dataset.productId;
                console.log('Открываем товар ID:', productId);
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
    productViewOverlay.addEventListener('click', function(e) {
        if (e.target === productViewOverlay) {
            closeProductView();
        }
    });

    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productViewOverlay.classList.contains('active')) {
            closeProductView();
        }
    });
}

// Открытие модального окна просмотра
function openProductView(productId) {
    const productViewOverlay = document.getElementById('productViewOverlay');
    if (!productViewOverlay) {
        console.error('Не найден элемент #productViewOverlay');
        return;
    }

    // Получаем данные товара
    const productData = getProductDataById(productId);
    
    // Заполняем данные в модальном окне
    fillProductViewData(productData);
    
    // Показываем модальное окно
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

// Получение данных товара
function getProductDataById(productId) {
    // В реальном приложении здесь был бы запрос к API
    // Для демонстрации возвращаем тестовые данные
    return {
        id: productId || 1,
        name: "Cyberpunk 2077",
        description: "Футуристическая ролевая игра от CD Projekt Red. Действие происходит в Найт-Сити, мегаполисе будущего, где технологии и кибернетические имплантаты изменили человечество.",
        price: 24999,
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        platform: "PC",
        seller: "Иван Иванов",
        genres: ['rpg', 'action', 'FPS'],
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    };
}

// Заполнение данных товара
function fillProductViewData(product) {
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
    viewTitle.textContent = product.name || product.title || 'Без названия';
    viewDescription.textContent = product.description || 'Описание отсутствует';
    viewPrice.textContent = product.price ? formatPrice(product.price) : '0';
    viewDeveloper.textContent = product.developer || 'Не указан';
    viewPublisher.textContent = product.publisher || 'Не указан';
    viewPlatform.textContent = product.platform || 'PC';
    viewSellerName.textContent = product.seller || 'Иван Иванов';
    // Убрано отображение наличия

    // Жанры
    renderGenres(product.genres || []);

    // Изображение
    if (product.image) {
        viewMainImage.src = product.image;
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

// Рендер жанров
function renderGenres(genreIds) {
    const viewGenresContainer = document.getElementById('viewGenresContainer');
    if (!viewGenresContainer) return;

    viewGenresContainer.innerHTML = '';

    if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
        const noGenres = document.createElement('span');
        noGenres.className = 'view-genre-tag';
        noGenres.textContent = 'Не указаны';
        noGenres.style.opacity = '0.7';
        viewGenresContainer.appendChild(noGenres);
        return;
    }

    // Получаем данные жанров из глобальной переменной
    const genresData = window.genresData || [];
    
    genreIds.forEach(genreId => {
        // Ищем жанр по ID
        const genre = genresData.find(g => g.id === genreId);
        const genreName = genre ? genre.label : `Жанр ${genreId}`;
        
        const genreTag = document.createElement('span');
        genreTag.className = 'view-genre-tag';
        genreTag.textContent = genreName;
        viewGenresContainer.appendChild(genreTag);
    });
}

// Добавление в корзину
function addToCart() {
    // Простая реализация добавления в корзину
    const productName = document.getElementById('viewTitle').textContent;
    const productPrice = document.getElementById('viewPrice').textContent;
    
    showNotification(`"${productName}" добавлен в корзину!`, 'success');
    
    // Закрываем модальное окно
    setTimeout(closeProductView, 1500);
}

// Вспомогательные функции
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}


// Делаем функции доступными глобально
window.openProductView = openProductView;
window.closeProductView = closeProductView;
// seller.js - JavaScript логика для страницы продавца

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelBtn');
    const descriptionInput = document.getElementById('descriptionInput');
    const charCounter = document.querySelector('.char-counter');
    const productForm = document.querySelector('.product-details');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const genreSelectBtn = document.getElementById('genreSelectBtn');
    
    // API Base URL (замените на ваш реальный URL)
    const API_BASE_URL = 'http://localhost:8080/api'
    
    // Текущий редактируемый товар
    let currentEditingProduct = null;

    // Открытие модального окна
    openModalBtn.addEventListener('click', openModal);
    
    // Закрытие модального окна
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Закрытие при клике на оверлей
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Счетчик символов для описания
    if (descriptionInput && charCounter) {
        descriptionInput.addEventListener('input', updateCharCounter);
    }

    // Обработка отправки формы
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }

    // Кнопка выбора жанров
    if (genreSelectBtn) {
        genreSelectBtn.addEventListener('click', openGenreSelector);
    }

    // При применении жанров
    document.addEventListener('genresApplied', function(e) {
        const selected = (e && e.detail && e.detail.selectedGenres) ? e.detail.selectedGenres : [];
        // Сохраняем в скрытое поле
        let hidden = document.getElementById('productGenresInput');
        if (!hidden) {
            hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.id = 'productGenresInput';
            hidden.name = 'genres';
            document.querySelector('.product-details').appendChild(hidden);
        }
        hidden.value = JSON.stringify(selected.map(title => ({ Title: title })));
    });

    // Обработка кнопок удаления
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', handleDeleteProduct);
    });

    // Загрузка игр продавца при загрузке страницы
    loadSellerGames();

    // Функции
    function openModal(product = null) {
        modalOverlay.classList.add('active');
        currentEditingProduct = product;
        
        if (product) {
            // Режим редактирования
            fillFormWithProductData(product);
            const saveBtn = document.querySelector('.btn-save');
            if (saveBtn) {
                saveBtn.textContent = 'Сохранить';
            }
        } else {
            // Режим создания
            resetForm();
            document.querySelector('.btn-save').textContent = 'Создать игру';
        }
        
        updateCharCounter();
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        currentEditingProduct = null;
        resetForm();
    }

    function updateCharCounter() {
        if (descriptionInput && charCounter) {
            const length = descriptionInput.value.length;
            charCounter.textContent = `${length}/1000`;
            if (length > 1000) {
                charCounter.style.color = '#ff4d4f';
            } else {
                charCounter.style.color = '#666';
            }
        }
    }

    function fillFormWithProductData(product) {
        document.getElementById('titleInput').value = product.Title || product.title || '';
        document.getElementById('descriptionInput').value = product.Description || product.description || '';
        document.getElementById('priceInput').value = product.Price || product.price || 100;
        document.getElementById('developerInput').value = product.DeveloperTitle || product.developer || '';
        document.getElementById('publisherInput').value = product.PublisherTitle || product.publisher || '';
        
        updateCharCounter();
    }

    function resetForm() {
        const setIf = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        };

        setIf('titleInput', '');
        setIf('descriptionInput', '');
        setIf('priceInput', 100);
        setIf('developerInput', '');
        setIf('publisherInput', '');
        setIf('keysFileInput', '');
        setIf('imageFileInput', '');

        const genresInput = document.getElementById('productGenresInput');
        if (genresInput) genresInput.value = '[]';
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('titleInput').value.trim();
        const description = document.getElementById('descriptionInput').value.trim();
        const price = parseFloat(document.getElementById('priceInput').value) || 0.1;
        const developer = document.getElementById('developerInput').value.trim();
        const publisher = document.getElementById('publisherInput').value.trim();
        const keysFile = document.getElementById('keysFileInput')?.files[0];
        const imageFile = document.getElementById('imageFileInput')?.files[0];
        
        const genresInput = document.getElementById('productGenresInput');
        let genres = [];
        try {
            genres = genresInput ? JSON.parse(genresInput.value) : [];
        } catch (e) {
            genres = [];
        }

        // Валидация
        if (title.length < 2 || title.length > 100) {
            showNotification('Название должно быть от 2 до 100 символов', 'error');
            return;
        }

        if (developer.length < 2 || developer.length > 100) {
            showNotification('Название разработчика должно быть от 2 до 100 символов', 'error');
            return;
        }

        if (publisher.length < 2 || publisher.length > 100) {
            showNotification('Название издателя должно быть от 2 до 100 символов', 'error');
            return;
        }

        if (price < 0.1) {
            showNotification('Цена должна быть не менее 0.1', 'error');
            return;
        }

        if (description.length > 1000) {
            showNotification('Описание не должно превышать 1000 символов', 'error');
            return;
        }

        if (genres.length < 1) {
            showNotification('Выберите хотя бы один жанр', 'error');
            return;
        }

        // Создаем FormData согласно документации
        const formData = new FormData();
        formData.append('Title', title);
        formData.append('PublisherTitle', publisher);
        formData.append('DeveloperTitle', developer);
        formData.append('Price', price.toString());
        if (description) formData.append('Description', description);
        
        genres.forEach((g, i) => {
            formData.append(`Genres[${i}].Title`, g.Title);
        });
        
        if (keysFile) {
            if (currentEditingProduct) {
                // Для обновления - отдельный endpoint для ключей
                formData.append('Keys', keysFile);
            } else {
                // Для создания - обязательный файл ключей
                formData.append('Keys', keysFile);
            }
        }
        
        if (imageFile) {
            formData.append('Image', imageFile);
        } else if (!currentEditingProduct) {
            showNotification('Для создания игры требуется изображение', 'error');
            return;
        }

        try {
            if (currentEditingProduct) {
                // PUT /api/games/{id} - обновление игры
                await fetch(`${API_BASE_URL}/games/${currentEditingProduct.Id}`, {
                    method: 'PUT',
                    body: formData,
                    credentials: "include",
                });
                showNotification(`Игра "${title}" успешно обновлена!`, 'success');
            } else {
                // POST /api/games - создание новой игры
                await fetch(`${API_BASE_URL}/games`, {
                    method: 'POST',
                    body: formData,
                    credentials: "include",
                });
                showNotification(`Игра "${title}" успешно создана!`, 'success');
            }
            
            closeModal();
            loadSellerGames(); // Обновляем список игр
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Произошла ошибка при сохранении', 'error');
        }
    }

    async function handleDeleteProduct() {
        const productItem = this.closest('.product-item');
        const productId = productItem.dataset.productId;
        const productName = productItem.querySelector('.product-name').textContent;
        
        if (!confirm(`Вы уверены, что хотите удалить игру "${productName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/games/${productId}`, {
                method: 'DELETE',
                credentials: "include",
            });

            if (response.ok) {
                productItem.style.opacity = '0';
                productItem.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    productItem.remove();
                    updateProductsCount();
                    showNotification(`Игра "${productName}" удалена`, 'success');
                }, 300);
            } else {
                const error = await response.json();
                showNotification(error.Message || 'Ошибка при удалении', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Ошибка сети при удалении', 'error');
        }
    }

    async function loadSellerGames() {
        try {
            const response = await fetch(`${API_BASE_URL}/games/my?page=1&pageSize=20`, {
                method: 'GET',
                credentials: "include",
            });

            if (response.ok) {
                const page = await response.json();
                renderSellerGames(page.Content || []);
            } else {
                const error = await response.json();
                showNotification(error.Message || 'Ошибка загрузки игр', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Ошибка сети при загрузке игр', 'error');
        }
    }

    function renderSellerGames(games) {
        const container = document.querySelector('.products-list');
        if (!container) return;

        container.innerHTML = '';

        games.forEach(game => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.dataset.productId = game.Id;
            
            productItem.innerHTML = `
                <img src="${game.ImageUrl || 'placeholder.jpg'}" alt="${game.Title}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${game.Title}</h3>
                    <p class="product-description">${game.Description || 'Нет описания'}</p>
                    <div class="product-meta">
                        <span class="product-price">${game.Price} ₽</span>
                        <span class="product-developer">${game.DeveloperTitle}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn-edit" onclick="openEditModal(${game.Id})">
                        Редактировать
                    </button>
                    <button class="btn-delete delete-btn" data-id="${game.Id}">
                        Удалить
                    </button>
                </div>
            `;
            
            container.appendChild(productItem);
        });

        // Обновляем обработчики удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteProduct);
        });

        updateProductsCount();
    }

    function updateProductsCount() {
        const products = document.querySelectorAll('.product-item');
        const count = products.length;
        const countElement = document.querySelector('.products-count');
        if (countElement) {
            countElement.textContent = `${count} шт.`;
        }
    }

    function openGenreSelector() {
        const headerGenresBtn = document.querySelector('.genres-btn');
        if (headerGenresBtn) {
            headerGenresBtn.click();
            return;
        }

        const overlay = document.getElementById('genresOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            alert('Меню жанров недоступно на этой странице.');
        }
    }

    function openEditModal(productId) {
        const game = getGameById(productId);
        if (game) {
            openModal(game);
        }
    }

    function getGameById(productId) {
        // В реальном приложении здесь будет запрос к API
        // или поиск в уже загруженных играх
        return null;
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

    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .product-item {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    window.openEditModal = openEditModal;
});
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
    
    // Данные для демонстрации
    const demoProducts = [
        {
            id: 1,
            name: "Cyberpunk 2077",
            description: "Футуристическая ролевая игра от CD Projekt Red. Действие происходит в Найт-Сити, мегаполисе будущего, где технологии и кибернетические имплантаты изменили человечество.",
            price: 2499,
            developer: "CD Projekt Red",
            publisher: "CD Projekt",
            image: "cyberpunk.jpg"
        },
        {
            id: 2,
            name: "The Witcher 3: Wild Hunt",
            description: "Эпическая ролевая игра о ведьмаке Геральте из Ривии. Охота на чудовищ, сложные моральные выборы и огромный открытый мир.",
            price: 1499,
            developer: "CD Projekt Red",
            publisher: "CD Projekt",
            image: "witcher.jpg"
        },
        {
            id: 3,
            name: "Red Dead Redemption 2",
            description: "Приключенческий экшен от Rockstar Games. История банды Ван дер Линде на американском Диком Западе в 1899 году.",
            price: 2999,
            developer: "Rockstar Games",
            publisher: "Rockstar Games",
            image: "rdr2.jpg"
        }
    ];

    // Текущий редактируемый товар
    let currentEditingProduct = null;

    // Открытие модального окна
    openModalBtn.addEventListener('click', openModal);
    
    // Закрытие модального окна (подписываемся только если элементы существуют)
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

    // При применении жанров — сохраняем их в скрытое поле формы и обновляем отображение
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
        hidden.value = selected.join(',');

        // Обновляем метку рядом с кнопкой выбора жанров в модалке
        const tagHolderId = 'productGenreTags';
        // Вставляем holder сразу после кнопки выбора жанров
        const genreBtn = document.getElementById('genreSelectBtn');
        if (genreBtn) {
            let holder = document.getElementById(tagHolderId);
            if (!holder) {
                holder = document.createElement('div');
                holder.id = tagHolderId;
                holder.className = 'selected-genre-tags';
                genreBtn.insertAdjacentElement('afterend', holder);
            }
                holder.innerHTML = selected.map(id => {
                    const g = (window.genresData || []).find(x => x.id === id);
                    return `<span class="genre-tag">${g ? g.label : id}</span>`;
                }).join(' ');
        }
    });

    // Обработка кнопок удаления
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', handleDeleteProduct);
    });

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
        
        // Сброс счетчика символов
        updateCharCounter();

        // При открытии модалки — обновляем теги жанров из localStorage (если есть)
        updateModalGenresFromStorage();
    }

    function updateModalGenresFromStorage() {
        const saved = localStorage.getItem('selectedGenres');
        if (!saved) return;
        try {
            const arr = JSON.parse(saved);
            const evt = { detail: { selectedGenres: arr } };
            // Воспользуемся уже написанным обработчиком для отображения
            document.dispatchEvent(new CustomEvent('genresApplied', { detail: { selectedGenres: arr } }));
        } catch (e) {
            // ignore
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        currentEditingProduct = null;
    }

    function openEditModal(productId) {
        const product = demoProducts.find(p => p.id === productId);
        if (product) {
            openModal(product);
        }
    }

    function updateCharCounter() {
        if (descriptionInput && charCounter) {
            const length = descriptionInput.value.length;
            charCounter.textContent = `${length}/1000`;
        }
    }

    function fillFormWithProductData(product) {
        // Заполняем форму данными товара
        document.getElementById('titleInput').value = product.name || '';
        document.getElementById('descriptionInput').value = product.description || '';
        document.getElementById('priceInput').value = product.price || 100;
        document.getElementById('developerInput').value = product.developer || '';
        document.getElementById('publisherInput').value = product.publisher || '';
        
        // Обновляем счетчик символов
        updateCharCounter();
    }

    function resetForm() {
        // Сбрасываем форму к значениям по умолчанию
        const setIf = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        };

        setIf('titleInput', '');
        setIf('descriptionInput', '');
        setIf('priceInput', 100);
        setIf('developerInput', '');
        setIf('publisherInput', '');

        // Сбрасываем файловые инпуты если они есть
        setIf('mainImageInput', '');
        setIf('cardImageInput', '');
        setIf('keysFileInput', '');
        setIf('additionalKeysInput', '');
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = {
            title: document.getElementById('titleInput').value.trim(),
            description: document.getElementById('descriptionInput').value.trim(),
            price: parseInt(document.getElementById('priceInput').value) || 100,
            developer: document.getElementById('developerInput').value.trim(),
            publisher: document.getElementById('publisherInput').value.trim(),
            platform: 'PC'
        };

        // Простая валидация
        if (!formData.title || formData.title.length < 2) {
            alert('Название должно быть не менее 2 символов');
            return;
        }

        if (!formData.developer || formData.developer.length < 2) {
            alert('Название разработчика должно быть не менее 2 символов');
            return;
        }

        if (!formData.publisher || formData.publisher.length < 2) {
            alert('Название издателя должно быть не менее 2 символов');
            return;
        }

        if (formData.price < 100) {
            alert('Цена должна быть не менее 100 ₽');
            return;
        }

        // В реальном приложении здесь был бы AJAX запрос
        console.log('Данные формы:', formData);
        
        if (currentEditingProduct) {
            console.log('Обновление товара:', currentEditingProduct.id);
            alert(`Товар "${formData.title}" успешно обновлен!`);
        } else {
            console.log('Создание нового товара');
            alert(`Товар "${formData.title}" успешно создан!`);
            
            // Обновляем счетчик товаров
            updateProductsCount(true);
        }
        
        closeModal();
    }

    function handleDeleteProduct() {
        const productItem = this.closest('.product-item');
        const productName = productItem.querySelector('.product-name').textContent;
        
        if (confirm(`Вы уверены, что хотите удалить товар "${productName}"?`)) {
            productItem.style.opacity = '0';
            productItem.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                productItem.remove();
                updateProductsCount();
                
                // Показываем сообщение об успешном удалении
                showNotification(`Товар "${productName}" удален`, 'success');
            }, 300);
        }
    }

    function updateProductsCount(increment = false) {
        const products = document.querySelectorAll('.product-item');
        const count = products.length;
        
        if (increment) {
            // Если добавляем новый товар, увеличиваем счетчик
            const newCount = count + 1;
            document.querySelector('.products-count').textContent = `${newCount} шт.`;
        } else {
            document.querySelector('.products-count').textContent = `${count} шт.`;
        }
    }

    function openGenreSelector() {
        // Если на странице есть кнопка в хедере, используем её — это откроет уже существующий overlay
        const headerGenresBtn = document.querySelector('.genres-btn');
        if (headerGenresBtn) {
            headerGenresBtn.click();
            return;
        }

        // Иначе открываем оверлей напрямую, если он есть
        const overlay = document.getElementById('genresOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            alert('Меню жанров недоступно на этой странице.');
        }
    }

    function showNotification(message, type = 'info') {
        // Создаем уведомление
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
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Добавляем стили для анимации уведомлений
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

    // Делаем функцию доступной глобально для onclick
    window.openEditModal = function() {
        openModal(demoProducts[0]); // Открываем первый товар для примера
    };
});
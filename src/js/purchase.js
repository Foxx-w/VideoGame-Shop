// purchase.js - JavaScript логика для страницы истории покупок

document.addEventListener('DOMContentLoaded', function() {
    // Константы
    const API_BASE_URL = 'http://localhost:8080/api';
    const purchasesList = document.getElementById('purchasesList');
    const totalItemsElement = document.getElementById('totalItems');

    // Загрузка истории покупок
    loadPurchaseHistory();

    // Функция загрузки истории заказов
    async function loadPurchaseHistory() {
        try {
            showLoading();
            
            const response = await fetch(`${API_BASE_URL}/orders?page=1&pageSize=20`, {
                method: 'GET',
                credentials: "include",
            });

            if (response.ok) {
                const page = await response.json();
                renderPurchaseHistory(page.Content || []);
            } else if (response.status === 401) {
                // Не авторизован
                renderEmptyHistory('Для просмотра истории покупок необходимо авторизоваться');
            } else {
                const error = await response.json();
                showNotification(error.Message || 'Ошибка загрузки истории', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Ошибка сети при загрузке истории', 'error');
        } finally {
            hideLoading();
        }
    }

    // Функция отображения истории покупок
    function renderPurchaseHistory(orders) {
        purchasesList.innerHTML = '';
        let totalItems = 0;

        if (!orders || orders.length === 0) {
            renderEmptyHistory('У вас пока нет покупок');
            return;
        }

        orders.forEach(order => {
            const orderGroup = document.createElement('div');
            orderGroup.className = 'order-group';
            
            // Форматируем данные заказа
            const totalAmount = order.TotalAmount || calculateTotalAmount(order.OrderItems);
            const orderDate = formatOrderDate(order.CreatedAt);
            const orderId = order.id || `ORD${Date.now().toString().slice(-6)}`;
            const orderStatus = getOrderStatus(order);
            
            // Создаем заголовок заказа
            orderGroup.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Заказ #${orderId}</span>
                    <span class="order-date">${orderDate}</span>
                    <span class="order-status ${orderStatus.class}">${orderStatus.text}</span>
                    <span class="order-total">${formatPrice(totalAmount)}</span>
                </div>
            `;

            // Добавляем товары из заказа
            const orderItems = order.OrderItems || [];
            orderItems.forEach(item => {
                totalItems += item.Quantity || 1;
                
                const purchaseItem = createPurchaseItem(item, order.CreatedAt);
                orderGroup.appendChild(purchaseItem);
            });

            purchasesList.appendChild(orderGroup);
        });

        // Обновляем счетчик товаров
        totalItemsElement.textContent = `${totalItems} шт.`;
        
        // Добавляем обработчики для кнопок копирования
        attachCopyKeyHandlers();
    }

    // Функция создания элемента покупки
    function createPurchaseItem(item, orderDate) {
        const purchaseItem = document.createElement('div');
        purchaseItem.className = 'purchase-item';
        
        const formattedDate = formatOrderDate(orderDate);
        const gameKey = item.Key || generateDemoKey(); // В реальном приложении ключ приходит с бэкенда
        
        purchaseItem.innerHTML = `
            <div class="purchase-image">
                <img src="${item.ImageUrl || getPlaceholderImage(item.GameTitle)}" 
                     alt="${item.GameTitle || 'Игра'}"
                     onerror="this.src='https://via.placeholder.com/80x100/667eea/ffffff?text=Игра'">
            </div>
            <div class="purchase-info">
                <h3 class="purchase-name">${item.GameTitle || 'Название игры'}</h3>
                <p class="purchase-description">
                    ${item.Description || 'Описание отсутствует'}
                </p>
                <div class="purchase-price">${formatPrice(item.Price)}</div>
                <div class="purchase-details">
                    <span class="purchase-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm1-10V7h-2v7h6v-2h-4z" fill="#666"/>
                        </svg>
                        Куплено: ${formattedDate.split(',')[0]}
                    </span>
                    <span class="purchase-quantity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fill="#666"/>
                        </svg>
                        Количество: ${item.Quantity || 1}
                    </span>
                </div>
            </div>
            <div class="purchase-actions">
                <button class="copy-key-btn" data-key="${gameKey}">
                    Скопировать ключ
                </button>
            </div>
        `;
        
        return purchaseItem;
    }

    // Функция для пустой истории
    function renderEmptyHistory(message) {
        purchasesList.innerHTML = `
            <div class="empty-history">
                <p>${message}</p>
                <a href="index.html" class="btn-browse">Перейти к покупкам</a>
            </div>
        `;
        totalItemsElement.textContent = '0 шт.';
    }

    // Функция копирования ключа
    function copyGameKey(e) {
        const button = e.target;
        const key = button.dataset.key;
        
        if (!key || key === 'XXXXX-XXXXX-XXXXX') {
            showNotification('Ключ недоступен для копирования', 'error');
            return;
        }
        
        const originalText = button.textContent;
        const originalBackground = button.style.background;
        
        // Копируем в буфер обмена
        navigator.clipboard.writeText(key).then(() => {
            // Успешное копирование
            button.textContent = '✓ Скопировано!';
            button.classList.add('copied');
            
            // Показываем уведомление
            showNotification('Ключ игры скопирован в буфер обмена', 'success');
            
            // Возвращаем исходный вид через 2 секунды
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
            
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = key;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    button.textContent = '✓ Скопировано!';
                    button.classList.add('copied');
                    showNotification('Ключ игры скопирован', 'success');
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                } else {
                    showNotification('Не удалось скопировать ключ', 'error');
                }
            } catch (err) {
                showNotification('Ошибка при копировании', 'error');
            }
            
            document.body.removeChild(textArea);
        });
    }

    // Вспомогательные функции
    function calculateTotalAmount(orderItems) {
        if (!orderItems || !Array.isArray(orderItems)) return 0;
        return orderItems.reduce((sum, item) => {
            return sum + ((item.Price || 0) * (item.Quantity || 1));
        }, 0);
    }

    function formatOrderDate(dateString) {
        if (!dateString) return 'Дата неизвестна';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatPrice(price) {
        if (typeof price !== 'number') return '0 ₽';
        return `${price.toFixed(2).replace('.', ',')} ₽`;
    }

    function getOrderStatus(order) {
        // В реальном приложении статус приходит с бэкенда
        return {
            class: 'status-completed',
            text: 'Завершён'
        };
    }

    function generateDemoKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
        for (let i = 0; i < 15; i++) {
            if (i > 0 && i % 5 === 0) key += '-';
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }

    function getPlaceholderImage(title) {
        // Генерируем цвет на основе названия игры
        const colors = ['667eea', '764ba2', 'f5576c', 'f093fb', '4CAF50'];
        const colorIndex = title ? title.length % colors.length : 0;
        return `https://via.placeholder.com/80x100/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(title?.substring(0, 10) || 'Игра')}`;
    }

    function attachCopyKeyHandlers() {
        document.querySelectorAll('.copy-key-btn').forEach(btn => {
            btn.addEventListener('click', copyGameKey);
        });
    }

    function showLoading() {
        purchasesList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Загрузка истории покупок...</p>
            </div>
        `;
        
        // Добавляем стили для спиннера
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-state {
                    text-align: center;
                    padding: 60px 20px;
                }
                
                .loading-spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #0962C9;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function hideLoading() {
        const loadingState = document.querySelector('.loading-state');
        if (loadingState) {
            loadingState.remove();
        }
    }

    function showNotification(message, type = 'info') {
        // Удаляем старое уведомление
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // Экспортируем функции для глобального доступа
    window.copyGameKey = copyGameKey;
});
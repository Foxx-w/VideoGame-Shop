document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const addGameBtn = document.getElementById('addGameBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const modal = document.getElementById('addGameModal');
    const gameForm = document.getElementById('gameForm');
    const gamesContainer = document.getElementById('gamesContainer');
    const gamesCount = document.getElementById('gamesCount');
    const logoutBtn = document.getElementById('logoutBtn');

    // Открытие модального окна
    addGameBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Закрытие модального окна
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        gameForm.reset();
    }

    modalCloseBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Закрытие при клике вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Обработка отправки формы
    gameForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем данные из формы
        const title = document.getElementById('gameTitle').value;
        const price = document.getElementById('gamePrice').value;
        const keys = document.getElementById('gameKeys').value;
        const image = document.getElementById('gameImage').value || 'https://via.placeholder.com/300x180/667eea/ffffff?text=New+Game';
        const description = document.getElementById('gameDescription').value;
        
        // Создаем новую игру
        const gameId = Date.now(); // Временный ID
        const gameCard = createGameCard(gameId, title, price, keys, image);
        
        // Добавляем в начало списка
        gamesContainer.insertBefore(gameCard, gamesContainer.firstChild);
        
        // Обновляем счетчик
        updateGamesCount();
        
        // Закрываем модальное окно и сбрасываем форму
        closeModal();
        
        // Показываем сообщение
        alert(`Игра "${title}" успешно добавлена!`);
    });

    // Обработчики для кнопок редактирования и удаления
    gamesContainer.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.classList.contains('btn-delete')) {
            const gameId = target.getAttribute('data-id');
            deleteGame(gameId);
        }
        
        if (target.classList.contains('btn-edit')) {
            const gameId = target.getAttribute('data-id');
            editGame(gameId);
        }
    });

    // Создание карточки игры
    function createGameCard(id, title, price, keys, image) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-id', id);
        
        card.innerHTML = `
            <img src="${image}" alt="${title}" class="game-image" />
            <div class="game-info">
                <h3 class="game-title">${title}</h3>
                <p class="game-price">${Number(price).toLocaleString('ru-RU')} ₽</p>
                <p class="game-keys">Ключей: ${keys}</p>
                <div class="game-actions">
                    <button class="btn-edit" data-id="${id}">Редактировать</button>
                    <button class="btn-delete" data-id="${id}">Удалить</button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Удаление игры
    function deleteGame(gameId) {
        if (confirm('Вы уверены, что хотите удалить эту игру?')) {
            const gameCard = document.querySelector(`.game-card[data-id="${gameId}"]`);
            if (gameCard) {
                gameCard.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    gameCard.remove();
                    updateGamesCount();
                    alert('Игра успешно удалена!');
                }, 300);
            }
        }
    }

    // Редактирование игры (заглушка)
    function editGame(gameId) {
        alert(`Редактирование игры с ID: ${gameId}\nВ реальном приложении здесь будет открыто модальное окно редактирования.`);
    }

    // Обновление счетчика игр
    function updateGamesCount() {
        const count = document.querySelectorAll('.game-card').length;
        gamesCount.textContent = `${count} шт.`;
    }

    // Выход из системы
    logoutBtn.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            // В реальном приложении здесь будет запрос на сервер
            alert('Вы вышли из системы');
            window.location.href = '/login.html';
        }
    });

    // Добавляем CSS для анимации удаления
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
    `;
    document.head.appendChild(style);
});
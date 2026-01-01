// genres.js - Управление жанрами для фильтрации и добавления товаров

// Данные жанров (совпадают с сервером)
const genresData = [
  { id: 'action', label: 'Экшен' },
  { id: 'rpg', label: 'Ролевые' },
  { id: 'strategy', label: 'Стратегии' },
  { id: 'adventure', label: 'Приключения' },
  { id: 'shooter', label: 'Шутеры' },
  { id: 'simulation', label: 'Симуляторы' },
  { id: 'FPS', label: 'Шутер от первого лица' },
  { id: 'TPS', label: 'Шутер от третьего лица' },
  { id: 'STR_TACT_RPG', label: 'Стратегии и тактические ролевые' },
  { id: 'BUILD_SIM', label: 'Симуляторы строительства и автоматизации' },
  { id: 'HOBBY_SIM', label: 'Симуляторы хобби и работы' },
  { id: 'CASUAL', label: 'Казуальные' },
  { id: 'ROGUELIKE', label: 'Рогалики' },
  { id: 'CARD_TABLETOP', label: 'Карточные и настольные' },
  { id: 'TURN_BASED', label: 'Пошаговые стратегии' },
  { id: 'SCI_FI', label: 'Научная фантастика' },
  { id: 'PUZZLE', label: 'Головоломки' },
  { id: 'TOWER_DEF', label: 'Башенная защита' },
  { id: 'SPORTS_SIM', label: 'Спортивные симуляторы' },
  { id: 'HORROR', label: 'Хорроры' },
  { id: 'RACING', label: 'Гонки' },
  { id: 'SURVIVAL', label: 'Выживание' }
];

// Экспортим данные в глобальную область
window.genresData = genresData;

// Текущий выбранные жанры (для фильтрации)
let selectedGenres = [];

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли элементы для работы с жанрами
    const genresBtn = document.querySelector('.genres-btn');
    const genresOverlay = document.getElementById('genresOverlay');
    
    if (!genresBtn && !genresOverlay) {
        // Если нет элементов жанров на странице, выходим
        console.log('Элементы жанров не найдены на этой странице');
        return;
    }
    
    // Инициализируем меню жанров
    initializeGenresMenu();
    
    // Загружаем сохраненные фильтры
    loadSavedFilters();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    console.log('Система жанров инициализирована');
});

// Инициализация меню жанров
function initializeGenresMenu() {
    const genresList = document.getElementById('genresList');
    if (!genresList) return;
    
    genresList.innerHTML = '';
    
    // Добавляем все жанры в список
    genresData.forEach(genre => {
        const genreElement = createGenreElement(genre);
        genresList.appendChild(genreElement);
    });
    
    // Обновляем UI
    updateUI();
}

// Создание элемента жанра
function createGenreElement(genre) {
    const div = document.createElement('div');
    div.className = 'genre-item';
    div.dataset.id = genre.id;
    
    div.innerHTML = `
        <input type="checkbox" class="genre-checkbox" id="genre-${genre.id}">
        <span class="genre-label">${genre.label}</span>
    `;
    
    const checkbox = div.querySelector('.genre-checkbox');
    
    checkbox.addEventListener('change', function() {
        toggleGenre(genre.id, this.checked);
        updateGenreItemState(div, this.checked);
    });
    
    // Клик на весь элемент тоже переключает чекбокс
    div.addEventListener('click', function(e) {
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            toggleGenre(genre.id, checkbox.checked);
            updateGenreItemState(div, checkbox.checked);
        }
    });
    
    return div;
}

// Обновление состояния элемента жанра
function updateGenreItemState(element, isSelected) {
    if (isSelected) {
        element.classList.add('genre-selected');
    } else {
        element.classList.remove('genre-selected');
    }
}

// Переключение жанра
function toggleGenre(genreId, isSelected) {
    if (isSelected) {
        if (!selectedGenres.includes(genreId)) {
            selectedGenres.push(genreId);
        }
    } else {
        const index = selectedGenres.indexOf(genreId);
        if (index > -1) {
            selectedGenres.splice(index, 1);
        }
    }
    
    updateUI();
}

// Настройка обработчиков событий
function setupEventListeners() {
    const genresBtn = document.querySelector('.genres-btn');
    const genresOverlay = document.getElementById('genresOverlay');
    const closeGenresBtn = document.getElementById('closeGenresBtn');
    const clearGenresBtn = document.getElementById('clearGenresBtn');
    const applyGenresBtn = document.getElementById('applyGenresBtn');
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    
    // Открытие меню жанров
    if (genresBtn) {
        genresBtn.addEventListener('click', openGenresMenu);
    }
    
    // Закрытие меню жанров
    if (closeGenresBtn) {
        closeGenresBtn.addEventListener('click', closeGenresMenu);
    }
    
    // Закрытие по клику вне меню
    if (genresOverlay) {
        genresOverlay.addEventListener('click', function(e) {
            if (e.target === genresOverlay) {
                closeGenresMenu();
            }
        });
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && genresOverlay && genresOverlay.style.display === 'flex') {
            closeGenresMenu();
        }
    });
    
    // Очистка выбора
    if (clearGenresBtn) {
        clearGenresBtn.addEventListener('click', clearSelection);
    }
    
    // Применение фильтров
    if (applyGenresBtn) {
        applyGenresBtn.addEventListener('click', applyFilters);
    }
    
    // Очистка всех фильтров
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

// Обновление UI
function updateUI() {
    const clearGenresBtn = document.getElementById('clearGenresBtn');
    const applyGenresBtn = document.getElementById('applyGenresBtn');
    
    // Обновляем кнопку "Сбросить"
    if (clearGenresBtn) clearGenresBtn.disabled = selectedGenres.length === 0;
    
    // Обновляем кнопку "Применить"
    if (applyGenresBtn) applyGenresBtn.textContent = `Применить (${selectedGenres.length})`;
    
    // Обновляем чекбоксы
    selectedGenres.forEach(genreId => {
        const checkbox = document.querySelector(`#genre-${genreId}`);
        if (checkbox) {
            checkbox.checked = true;
            const parent = checkbox.closest('.genre-item');
            if (parent) {
                parent.classList.add('genre-selected');
            }
        }
    });
    
    // Снимаем невыбранные
    genresData.forEach(genre => {
        if (!selectedGenres.includes(genre.id)) {
            const checkbox = document.querySelector(`#genre-${genre.id}`);
            if (checkbox) {
                checkbox.checked = false;
                const parent = checkbox.closest('.genre-item');
                if (parent) {
                    parent.classList.remove('genre-selected');
                }
            }
        }
    });
    
    // Обновляем отображение активных фильтров
    updateActiveFilters();
}

// Открытие меню жанров
function openGenresMenu() {
    const genresOverlay = document.getElementById('genresOverlay');
    const genresBtn = document.querySelector('.genres-btn');
    
    if (!genresOverlay) return;
    
    genresOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (genresBtn) genresBtn.classList.add('active');
}

// Закрытие меню жанров
function closeGenresMenu() {
    const genresOverlay = document.getElementById('genresOverlay');
    const genresBtn = document.querySelector('.genres-btn');
    
    if (!genresOverlay) return;
    
    genresOverlay.style.display = 'none';
    document.body.style.overflow = '';
    if (genresBtn) genresBtn.classList.remove('active');
}

// Очистка выбора
function clearSelection() {
    selectedGenres = [];
    updateUI();
    saveFiltersToStorage();
}

// Применение фильтров
function applyFilters() {
    saveFiltersToStorage();
    closeGenresMenu();
    
    // Отправляем выбранные жанры в index.js для фильтрации
    if (window.setSelectedGenres) {
        window.setSelectedGenres(selectedGenres);
    }
    
    // Отправляем событие для seller.js (для добавления жанров в товар)
    try {
        document.dispatchEvent(new CustomEvent('genresApplied', { 
            detail: { 
                selectedGenres: selectedGenres,
                selectedGenreLabels: selectedGenres.map(id => {
                    const genre = genresData.find(g => g.id === id);
                    return genre ? genre.label : id;
                })
            } 
        }));
    } catch (e) {
        console.warn('Не удалось отправить событие genresApplied', e);
    }
}

// Обновление активных фильтров
function updateActiveFilters() {
    const activeFilters = document.getElementById('activeFilters');
    const filterTags = document.getElementById('filterTags');
    
    if (!activeFilters || !filterTags) return;
    
    if (selectedGenres.length === 0) {
        activeFilters.classList.add('hidden');
        return;
    }
    
    activeFilters.classList.remove('hidden');
    filterTags.innerHTML = '';
    
    selectedGenres.forEach(genreId => {
        const genre = genresData.find(g => g.id === genreId);
        if (genre) {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                ${genre.label}
                <button type="button" class="remove-filter" data-id="${genreId}">
                    ×
                </button>
            `;
            
            filterTags.appendChild(tag);
        }
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.remove-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            const genreId = this.dataset.id;
            removeGenreFilter(genreId);
        });
    });
    
    // Обновляем отображение в index.js (если функция существует)
    if (window.updateSelectedGenresDisplay) {
        window.updateSelectedGenresDisplay(selectedGenres, genresData);
    }
}

// Удаление жанра из фильтра
function removeGenreFilter(genreId) {
    const index = selectedGenres.indexOf(genreId);
    if (index > -1) {
        selectedGenres.splice(index, 1);
    }
    
    saveFiltersToStorage();
    updateUI();
    
    // Обновляем фильтрацию в index.js
    if (window.setSelectedGenres) {
        window.setSelectedGenres(selectedGenres);
    }
}

// Очистка всех фильтров
function clearAllFilters() {
    selectedGenres = [];
    saveFiltersToStorage();
    updateUI();
    
    // Обновляем фильтрацию в index.js
    if (window.setSelectedGenres) {
        window.setSelectedGenres([]);
    }
}

// Сохранение фильтров в localStorage
function saveFiltersToStorage() {
    localStorage.setItem('selectedGenres', JSON.stringify(selectedGenres));
}

// Загрузка сохраненных фильтров
function loadSavedFilters() {
    const saved = localStorage.getItem('selectedGenres');
    if (saved) {
        try {
            selectedGenres = JSON.parse(saved);
            updateUI();
            
            // Если есть функция в index.js, обновляем фильтрацию
            if (window.setSelectedGenres) {
                window.setSelectedGenres(selectedGenres);
            }
        } catch (e) {
            console.error('Ошибка загрузки фильтров:', e);
        }
    }
}

// Очистка выбранных жанров (для использования из других файлов)
function clearSelectedGenres() {
    selectedGenres = [];
    saveFiltersToStorage();
    updateUI();
}

// Получение выбранных жанров
function getSelectedGenres() {
    return [...selectedGenres];
}

// Получение выбранных жанров с метками
function getSelectedGenresWithLabels() {
    return selectedGenres.map(id => {
        const genre = genresData.find(g => g.id === id);
        return {
            id: id,
            label: genre ? genre.label : id,
            Title: genre ? genre.label : id  // Для DTO формата
        };
    });
}

// Глобальные функции для использования в других файлах
window.clearSelectedGenres = clearSelectedGenres;
window.getSelectedGenres = getSelectedGenres;
window.getSelectedGenresWithLabels = getSelectedGenresWithLabels;

// Экспортируем функции для использования в других файлах
window.genresManager = {
    clearSelectedGenres,
    getSelectedGenres,
    getSelectedGenresWithLabels,
    updateUI,
    openGenresMenu,
    closeGenresMenu,
    applyFilters
};
// Данные жанров
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

// Экспортим данные в глобальную область, чтобы другие модули могли получить метки
window.genresData = genresData;

document.addEventListener('DOMContentLoaded', function() {
  // Элементы
  const genresBtn = document.querySelector('.genres-btn');
  const genresOverlay = document.getElementById('genresOverlay');
  const closeGenresBtn = document.getElementById('closeGenresBtn');
  const clearGenresBtn = document.getElementById('clearGenresBtn');
  const applyGenresBtn = document.getElementById('applyGenresBtn');
  const genresList = document.getElementById('genresList');
  const activeFilters = document.getElementById('activeFilters');
  const filterTags = document.getElementById('filterTags');
  const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
  
  // Состояние
  let selectedGenres = [];

  // Инициализация
  initializeGenresMenu();
  loadSavedFilters();

  // Обработчики событий (подключаем только если элементы есть)
  if (genresBtn) genresBtn.addEventListener('click', openGenresMenu);
  if (closeGenresBtn) closeGenresBtn.addEventListener('click', closeGenresMenu);
  
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
  if (clearGenresBtn) clearGenresBtn.addEventListener('click', clearSelection);

  // Применение фильтров
  if (applyGenresBtn) applyGenresBtn.addEventListener('click', applyFilters);

  // Очистка всех фильтров
  if (clearAllFiltersBtn) clearAllFiltersBtn.addEventListener('click', clearAllFilters);

  // Функции
  function initializeGenresMenu() {
    if (!genresList) return;
    genresList.innerHTML = '';
    
    // Добавляем все жанры в один список
    genresData.forEach(genre => {
      const genreElement = createGenreElement(genre);
      genresList.appendChild(genreElement);
    });
  }

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

  function updateGenreItemState(element, isSelected) {
    if (isSelected) {
      element.classList.add('genre-selected');
    } else {
      element.classList.remove('genre-selected');
    }
  }

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

  function updateUI() {
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
  }

  function openGenresMenu() {
    if (!genresOverlay) return;
    genresOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (genresBtn) genresBtn.classList.add('active');
    
    // Загружаем сохраненные выборы
    loadSavedFilters();
  }

  function closeGenresMenu() {
    if (!genresOverlay) return;
    genresOverlay.style.display = 'none';
    document.body.style.overflow = '';
    if (genresBtn) genresBtn.classList.remove('active');
  }

  function clearSelection() {
    selectedGenres = [];
    updateUI();
    saveFiltersToStorage();
    // Обновляем видимые теги и список товаров сразу при очистке внутри меню
    updateActiveFilters();
    filterProductsByGenres();
  }

  function applyFilters() {
    saveFiltersToStorage();
    updateActiveFilters();
    closeGenresMenu();
    
    // Здесь будет логика фильтрации товаров
    console.log('Применены фильтры:', selectedGenres);
    filterProductsByGenres();
    // Отправляем событие, чтобы другие модули могли получить выбранные жанры (например, модалка создания товара)
    try {
      document.dispatchEvent(new CustomEvent('genresApplied', { detail: { selectedGenres: selectedGenres.slice() } }));
    } catch (e) {
      console.warn('Не удалось отправить событие genresApplied', e);
    }
  }

  function updateActiveFilters() {
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
  }

  function removeGenreFilter(genreId) {
    const index = selectedGenres.indexOf(genreId);
    if (index > -1) {
      selectedGenres.splice(index, 1);
    }
    
    saveFiltersToStorage();
    updateUI();
    updateActiveFilters();
    filterProductsByGenres();
  }

  function clearAllFilters() {
    selectedGenres = [];
    saveFiltersToStorage();
    updateUI();
    updateActiveFilters();
    filterProductsByGenres();
  }

  function saveFiltersToStorage() {
    localStorage.setItem('selectedGenres', JSON.stringify(selectedGenres));
  }

  function loadSavedFilters() {
    const saved = localStorage.getItem('selectedGenres');
    if (saved) {
      try {
        selectedGenres = JSON.parse(saved);
        updateUI();
        updateActiveFilters();
      } catch (e) {
        console.error('Ошибка загрузки фильтров:', e);
      }
    }
  }

  function filterProductsByGenres() {
    // Временная заглушка для демонстрации
    // В реальном приложении здесь будет запрос к API или фильтрация существующих товаров
    
    if (selectedGenres.length === 0) {
      console.log('Показываем все товары');
      // Показать все товары
      document.querySelectorAll('.product-card').forEach(card => {
        // Убираем явное inline-правило display, чтобы соблюдалась CSS-верстка (display: flex и др.)
        card.style.removeProperty('display');
      });
    } else {
      console.log(`Фильтрация по жанрам: ${selectedGenres.join(', ')}`);
      // Здесь будет реальная фильтрация
      // Временно скрываем/показываем товары для демонстрации
    }
    
    // Обновляем информацию о фильтре
    updateFilterInfo();
  }

  function updateFilterInfo() {
    const filterInfo = document.querySelector('.filter-info');
    if (!filterInfo) return;
    const filterRange = filterInfo.querySelector('.filter-range');
    const filterCount = filterInfo.querySelector('.filter-count');
    
    if (selectedGenres.length > 0) {
      const genreLabels = selectedGenres.map(id => {
        const genre = genresData.find(g => g.id === id);
        return genre ? genre.label : id;
      }).join(', ');
      
      if (filterRange) filterRange.textContent = `жанры: ${genreLabels}`;
    } else {
      // Здесь можно получить значения из фильтра цены
      const minEl = document.getElementById('min-price');
      const maxEl = document.getElementById('max-price');
      const minPrice = (minEl && minEl.value) ? minEl.value : '0';
      const maxPrice = (maxEl && maxEl.value) ? maxEl.value : '10 000';
      if (filterRange) filterRange.textContent = `от ${minPrice} до ${maxPrice} ₽`;
    }
    
    // Здесь можно обновить количество найденных товаров
    // filterCount.textContent = `(найдено X товаров)`;
  }
});
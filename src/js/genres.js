// js/genres.js
class GenreManager {
    constructor(gameStore) {
        this.gameStore = gameStore;
        this.init();
    }

    init() {
        this.setupGenreListeners();
        this.loadGenres();
    }

    setupGenreListeners() {
        // Открытие меню жанров
        const openGenresBtn = document.getElementById('openGenresBtn');
        if (openGenresBtn) {
            openGenresBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openGenresMenu();
            });
        }

        // Закрытие меню жанров
        const closeGenresBtn = document.getElementById('closeGenresBtn');
        if (closeGenresBtn) {
            closeGenresBtn.addEventListener('click', () => this.closeGenresMenu());
        }

        // Применение выбранных жанров
        const applyGenresBtn = document.getElementById('applyGenresBtn');
        if (applyGenresBtn) {
            applyGenresBtn.addEventListener('click', () => {
                this.closeGenresMenu();
                if (this.gameStore) {
                    this.gameStore.applyFilters();
                }
            });
        }

        // Сброс выбранных жанров
        const clearGenresBtn = document.getElementById('clearGenresBtn');
        if (clearGenresBtn) {
            clearGenresBtn.addEventListener('click', () => {
                if (this.gameStore) {
                    this.gameStore.selectedGenres = [];
                    this.gameStore.updateGenreButtons();
                }
            });
        }

        // Закрытие по клику вне меню
        document.addEventListener('click', (e) => {
            const genresOverlay = document.getElementById('genresOverlay');
            if (genresOverlay && 
                genresOverlay.style.display === 'block' && 
                !e.target.closest('.genres-menu') && 
                !e.target.closest('#openGenresBtn')) {
                this.closeGenresMenu();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeGenresMenu();
            }
        });
    }

    openGenresMenu() {
        const genresOverlay = document.getElementById('genresOverlay');
        if (genresOverlay) {
            genresOverlay.style.display = 'flex';
            
            // Обновить состояние кнопок в меню
            if (this.gameStore) {
                this.gameStore.updateGenreButtons();
            }
        }
    }

    closeGenresMenu() {
        const genresOverlay = document.getElementById('genresOverlay');
        if (genresOverlay) {
            genresOverlay.style.display = 'none';
        }
    }

    // Метод для обновления кнопок жанров в меню
    updateGenreButtonsInMenu(selectedGenres) {
        document.querySelectorAll('.genre-btn').forEach(btn => {
            if (selectedGenres.includes(btn.dataset.genre)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    async loadGenres() {
        try {
            const genres = await api.getGenres();
            if (!genres || !Array.isArray(genres)) return;

            const container = document.getElementById('genresList');
            if (!container) return;

            container.innerHTML = '';
            genres.forEach(g => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'genre-btn';
                btn.dataset.genre = g.title || g.Title || g;
                btn.textContent = g.title || g.Title || g;
                btn.addEventListener('click', () => {
                    if (this.gameStore) {
                        const title = btn.dataset.genre;
                        const idx = this.gameStore.selectedGenres.indexOf(title);
                        if (idx === -1) this.gameStore.selectedGenres.push(title);
                        else this.gameStore.selectedGenres.splice(idx, 1);
                        this.gameStore.updateGenreButtons();
                    }
                    btn.classList.toggle('selected');
                });
                container.appendChild(btn);
            });
        } catch (error) {
            console.error('Failed to load genres in GenreManager:', error);
        }
    }
}
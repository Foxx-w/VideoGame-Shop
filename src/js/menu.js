// js/menu.js
class MenuManager {
    constructor() {
        this.isMenuOpen = false;
        this.currentMenuType = null;
        this.init();
    }

    init() {
        // Сначала скрываем меню полностью при инициализации
        this.hideMenu();
        
        // Затем настраиваем слушатели событий
        this.setupEventListeners();
        
        // Инициализируем состояние меню (скрыто)
        this.updateMenuVisibility();
    }

    hideMenu() {
        const menuContainer = document.getElementById('menuContainer');
        if (menuContainer) {
            // Скрываем контейнер меню
            menuContainer.style.display = 'none';
            menuContainer.style.opacity = '0';
            menuContainer.style.pointerEvents = 'none';
            menuContainer.classList.remove('active');
            
            // Скрываем все внутренние меню
            const menus = document.querySelectorAll('.menu-overlay');
            menus.forEach(menu => {
                menu.style.display = 'none';
                menu.classList.remove('show');
            });
        }
    }

    setupEventListeners() {
        // Кнопка пользователя в хедере
        const userMenuToggle = document.getElementById('userMenuToggle') || document.querySelector('.user-btn');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Закрытие меню по клику вне его
        document.addEventListener('click', (e) => {
            if (!this.isMenuOpen) return;
            
            const menuContainer = document.getElementById('menuContainer');
            const userBtn = document.getElementById('userMenuToggle') || document.querySelector('.user-btn');
            
            // Если кликнули не по меню и не по кнопке открытия меню
            if (menuContainer && 
                !menuContainer.contains(e.target) && 
                !(userBtn && userBtn.contains(e.target))) {
                this.closeMenu();
            }
        });

        // Кнопка Escape для закрытия меню
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Кнопки в самом меню
        setTimeout(() => this.setupMenuButtons(), 100);
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        const menuContainer = document.getElementById('menuContainer');
        if (menuContainer) {
            // Показываем контейнер меню
            menuContainer.style.display = 'block';
            
            // Даем время для отображения, затем добавляем анимацию
            setTimeout(() => {
                menuContainer.style.opacity = '1';
                menuContainer.style.pointerEvents = 'auto';
                menuContainer.classList.add('active');
                
                // Показываем нужное меню
                this.updateMenuContent();
            }, 10);
        }
    }

    closeMenu() {
        this.isMenuOpen = false;
        const menuContainer = document.getElementById('menuContainer');
        if (menuContainer) {
            // Убираем активный класс и начинаем скрывать
            menuContainer.classList.remove('active');
            menuContainer.style.opacity = '0';
            menuContainer.style.pointerEvents = 'none';
            
            // После завершения анимации полностью скрываем
            setTimeout(() => {
                menuContainer.style.display = 'none';
                
                // Скрываем все меню
                const menus = document.querySelectorAll('.menu-overlay');
                menus.forEach(menu => {
                    menu.classList.remove('show');
                    menu.style.display = 'none';
                });
            }, 300);
        }
    }

    updateMenuVisibility() {
        const menuContainer = document.getElementById('menuContainer');
        if (menuContainer) {
            if (this.isMenuOpen) {
                menuContainer.style.display = 'block';
                menuContainer.style.opacity = '1';
                menuContainer.style.pointerEvents = 'auto';
                menuContainer.classList.add('active');
            } else {
                menuContainer.style.display = 'none';
                menuContainer.style.opacity = '0';
                menuContainer.style.pointerEvents = 'none';
                menuContainer.classList.remove('active');
            }
        }
    }

    setupMenuButtons() {
        // Вход в аккаунт (для гостей)
        const loginMenuBtn = document.getElementById('loginMenuBtn');
        if (loginMenuBtn) {
            loginMenuBtn.addEventListener('click', () => {
                this.closeMenu();
                window.location.href = 'login.html';
            });
        }

        // Регистрация (для гостей)
        const registerMenuBtn = document.getElementById('registerMenuBtn');
        if (registerMenuBtn) {
            registerMenuBtn.addEventListener('click', () => {
                this.closeMenu();
                window.location.href = 'register.html';
            });
        }

        // История заказов (для покупателей)
        const ordersMenuBtn = document.getElementById('ordersMenuBtn');
        if (ordersMenuBtn) {
            ordersMenuBtn.addEventListener('click', () => {
                this.closeMenu();
                if (auth.currentUser?.role === 'CUSTOMER') {
                    window.location.href = 'orders.html';
                } else {
                    alert('Эта функция доступна только для покупателей');
                }
            });
        }

        // Корзина (для покупателей)
        const cartMenuBtn = document.getElementById('cartMenuBtn');
        if (cartMenuBtn) {
            cartMenuBtn.addEventListener('click', () => {
                this.closeMenu();
                if (auth.currentUser?.role === 'CUSTOMER') {
                    window.location.href = 'cart.html';
                } else {
                    alert('Для доступа к корзине необходимо войти как покупатель');
                }
            });
        }

        // Мои товары (для продавцов)
        const sellerGamesMenuBtn = document.getElementById('sellerGamesMenuBtn');
        if (sellerGamesMenuBtn) {
            sellerGamesMenuBtn.addEventListener('click', () => {
                this.closeMenu();
                if (auth.currentUser?.role === 'SELLER') {
                    window.location.href = 'seller.html';
                } else {
                    alert('Эта функция доступна только для продавцов');
                }
            });
        }

        // Выйти (для авторизованных пользователей)
        const logoutButtons = document.querySelectorAll('[onclick*="logout"], .menu-button:last-child');
        logoutButtons.forEach(btn => {
            if (btn.textContent.includes('Выйти')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeMenu();
                    auth.logout();
                });
            }
        });

        // Главная страница
        const mainButtons = document.querySelectorAll('.menu-button');
        mainButtons.forEach(btn => {
            if (btn.textContent.includes('Главная') && !btn.hasAttribute('onclick')) {
                btn.addEventListener('click', () => {
                    this.closeMenu();
                    window.location.href = 'index.html';
                });
            }
        });
    }

    updateMenuContent() {
        if (!this.isMenuOpen) return;
        
        // Скрываем все меню
        const guestMenu = document.getElementById('guestMenu');
        const userMenu = document.getElementById('userMenu');
        const sellerMenu = document.getElementById('sellerMenu');
        
        if (guestMenu) {
            guestMenu.style.display = 'none';
            guestMenu.classList.remove('show');
        }
        if (userMenu) {
            userMenu.style.display = 'none';
            userMenu.classList.remove('show');
        }
        if (sellerMenu) {
            sellerMenu.style.display = 'none';
            sellerMenu.classList.remove('show');
        }
        
        // Определяем какое меню показывать
        if (!auth.currentUser) {
            this.currentMenuType = 'guest';
            if (guestMenu) {
                guestMenu.style.display = 'block';
                guestMenu.classList.add('show');
            }
        } else if (auth.currentUser.role === 'SELLER') {
            this.currentMenuType = 'seller';
            if (sellerMenu) {
                sellerMenu.style.display = 'block';
                sellerMenu.classList.add('show');
                this.updateSellerInfo();
            }
        } else {
            this.currentMenuType = 'user';
            if (userMenu) {
                userMenu.style.display = 'block';
                userMenu.classList.add('show');
            }
        }
    }

    async updateSellerInfo() {
        if (auth.currentUser?.role === 'SELLER') {
            try {
                const response = await api.getMyGames(1, 1);
                const sellerGamesCount = document.getElementById('sellerGamesCount');
                if (sellerGamesCount && response.totalElements !== undefined) {
                    sellerGamesCount.textContent = response.totalElements;
                }
            } catch (error) {
                console.error('Failed to load seller games:', error);
            }
        }
    }
}

// Инициализация меню при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.menuManager = new MenuManager();
    // Ensure genre manager exists so header "Жанры" button works on pages with header
    if (!window.genreManager) {
        try {
            window.genreManager = new GenreManager(window.gameStore);
        } catch (e) {
            console.warn('GenreManager init skipped (missing script or dependency):', e);
        }
    }
});

// Глобальная функция для обновления меню
function updateMenu() {
    if (window.menuManager) {
        window.menuManager.updateMenuContent();
    }
}

// Глобальная функция для logout
function logout() {
    if (window.menuManager) {
        window.menuManager.closeMenu();
    }
    auth.logout();
}
// auth.js - Управление авторизацией и меню пользователя

// Текущее состояние пользователя
let currentUser = null;
let userRole = null;

// Состояние меню
let currentMenu = null;
let isAnimating = false;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    console.log('Система авторизации и меню инициализирована');
});

// Проверка статуса авторизации
async function checkAuthStatus() {
    try {
        const userData = await window.api.auth.check();
        currentUser = userData;
        userRole = userData.role || userData.userRole;
        updateUIForLoggedInUser();
    } catch (error) {
        updateUIForGuest();
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserMenu);
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(event) {
        const menuContainer = document.querySelector('.menu-container');
        const menuOverlay = document.querySelector('.menu-overlay.show');
        
        // Проверяем, был ли клик вне меню и не по кнопке меню
        if (menuContainer && menuOverlay && 
            !menuContainer.contains(event.target) && 
            !event.target.closest('#userMenuBtn')) {
            closeAllMenus();
        }
    });
    
    // Закрытие меню по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && currentMenu) {
            closeAllMenus();
        }
    });
    
    // Закрытие меню при скролле на мобильных устройствах
    window.addEventListener('scroll', function() {
        if (window.innerWidth <= 1024 && currentMenu) {
            closeAllMenus();
        }
    });
}

// Показ/скрытие меню пользователя
function toggleUserMenu(event) {
    if (isAnimating) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    let menuToShow;
    if (currentUser && userRole) {
        if (userRole === 'SELLER') {
            menuToShow = 'sellerMenu';
        } else if (userRole === 'CUSTOMER') {
            menuToShow = 'userMenu';
        } else {
            menuToShow = 'guestMenu';
        }
    } else {
        menuToShow = 'guestMenu';
    }
    
    // Если уже открыто это меню - закрываем, иначе показываем
    if (currentMenu === menuToShow) {
        closeAllMenus();
    } else {
        showMenu(menuToShow);
    }
}

// Показать конкретное меню
function showMenu(menuId) {
    if (isAnimating) return;
    isAnimating = true;
    
    // Сначала закрываем все меню
    closeAllMenusWithoutAnimation();
    
    // Показываем нужное меню
    const menu = document.getElementById(menuId);
    if (menu) {
        // Для мобильных устройств добавляем оверлей фона
        if (window.innerWidth <= 1024) {
            menu.style.display = 'block';
            // Небольшая задержка для отображения блока перед анимацией
            setTimeout(() => {
                menu.classList.add('show');
            }, 10);
        } else {
            // Для десктопа сразу показываем
            menu.style.display = 'block';
        }
        
        currentMenu = menuId;
        
        // Убираем все инлайн стили, которые могут мешать
        const menuContainer = menu.querySelector('.menu-container');
        if (menuContainer) {
            // Удаляем все инлайн стили позиционирования
            menuContainer.style.position = '';
            menuContainer.style.top = '';
            menuContainer.style.right = '';
            menuContainer.style.left = '';
            menuContainer.style.transform = '';
            menuContainer.style.transition = '';
            menuContainer.style.width = '';
            menuContainer.style.height = '';
        }
        
        // Загружаем данные для авторизованного пользователя
        if (menuId !== 'guestMenu') {
            updateUserMenuData();
        }
    }
    
    // Сбрасываем флаг анимации
    setTimeout(() => {
        isAnimating = false;
    }, 50);
}

// Закрыть все меню
function closeAllMenus() {
    if (isAnimating) return;
    isAnimating = true;
    
    // Просто скрываем меню, не трогая стили
    const menus = ['guestMenu', 'userMenu', 'sellerMenu'];
    menus.forEach(id => {
        const menu = document.getElementById(id);
        if (menu) {
            // Убираем класс show для анимации закрытия
            menu.classList.remove('show');
            
            // Для мобильных устройств - плавное скрытие
            if (window.innerWidth <= 1024) {
                setTimeout(() => {
                    if (!menu.classList.contains('show')) {
                        menu.style.display = 'none';
                    }
                }, 300);
            } else {
                // Для десктопа сразу скрываем
                menu.style.display = 'none';
            }
            
            // Восстанавливаем инлайн стили к дефолтным значениям CSS
            const menuContainer = menu.querySelector('.menu-container');
            if (menuContainer) {
                // Удаляем все инлайн стили, которые могли добавиться
                menuContainer.style.position = '';
                menuContainer.style.top = '';
                menuContainer.style.right = '';
                menuContainer.style.left = '';
                menuContainer.style.transform = '';
                menuContainer.style.transition = '';
                menuContainer.style.width = '';
                menuContainer.style.height = '';
            }
        }
    });
    
    currentMenu = null;
    
    setTimeout(() => {
        isAnimating = false;
    }, 350);
}

// Закрыть без анимации (для внутреннего использования)
function closeAllMenusWithoutAnimation() {
    const menus = ['guestMenu', 'userMenu', 'sellerMenu'];
    menus.forEach(id => {
        const menu = document.getElementById(id);
        if (menu) {
            menu.classList.remove('show');
            menu.style.display = 'none';
            
            // Восстанавливаем инлайн стили
            const menuContainer = menu.querySelector('.menu-container');
            if (menuContainer) {
                menuContainer.style.position = '';
                menuContainer.style.top = '';
                menuContainer.style.right = '';
                menuContainer.style.left = '';
                menuContainer.style.transform = '';
                menuContainer.style.transition = '';
                menuContainer.style.width = '';
                menuContainer.style.height = '';
            }
        }
    });
}

// Обновление UI для авторизованного пользователя
function updateUIForLoggedInUser() {
    const userBtn = document.querySelector('.user-btn');
    const actionLabel = document.querySelector('.user-btn .action-label');
    
    if (userBtn && actionLabel) {
        const userName = currentUser.username || currentUser.Username || 'Профиль';
        actionLabel.textContent = userName.length > 10 ? 
            userName.substring(0, 10) + '...' : userName;
        
        userBtn.classList.add('user-has-items');
        
        // Обновляем аватар в меню
        updateAvatar();
        
        // Загружаем данные корзины для покупателя
        if (userRole === 'CUSTOMER') {
            loadCartData();
        }
        
        // Загружаем данные продавца
        if (userRole === 'SELLER') {
            loadSellerData();
        }
    }
}

// Обновление UI для гостя
function updateUIForGuest() {
    const actionLabel = document.querySelector('.user-btn .action-label');
    if (actionLabel) {
        actionLabel.textContent = 'Войти';
    }
    
    const userBtn = document.querySelector('.user-btn');
    if (userBtn) {
        userBtn.classList.remove('user-has-items');
    }
}

// Обновление аватара
function updateAvatar() {
    const userName = currentUser.username || currentUser.Username || '';
    let initials = 'П';
    
    if (userName) {
        const parts = userName.split(' ');
        if (parts.length >= 2) {
            initials = (parts[0][0] + parts[1][0]).toUpperCase();
        } else {
            initials = userName[0].toUpperCase();
        }
    }
    
    // Обновляем аватар для пользователя
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) userAvatar.textContent = initials;
    
    // Обновляем аватар для продавца
    const sellerAvatar = document.getElementById('sellerAvatar');
    if (sellerAvatar) sellerAvatar.textContent = initials;
    
    // Обновляем имя
    const userNameElement = document.getElementById('userName');
    if (userNameElement) userNameElement.textContent = userName;
    
    const sellerNameElement = document.getElementById('sellerName');
    if (sellerNameElement) sellerNameElement.textContent = userName;
    
    // Обновляем email
    const userEmailElement = document.getElementById('userEmail');
    const sellerEmailElement = document.getElementById('sellerEmail');
    const userEmail = currentUser.email || currentUser.Email || '';
    if (userEmailElement) userEmailElement.textContent = userEmail;
    if (sellerEmailElement) sellerEmailElement.textContent = userEmail;
    
    // Обновляем роль
    const userRoleElement = document.getElementById('userRole');
    if (userRoleElement) {
        userRoleElement.textContent = userRole === 'CUSTOMER' ? 'Покупатель' : 'Продавец';
    }
    
    const sellerRoleElement = document.getElementById('sellerRole');
    if (sellerRoleElement) {
        sellerRoleElement.textContent = userRole === 'CUSTOMER' ? 'Покупатель' : 'Продавец';
    }
}

// Обновление данных в меню пользователя
async function updateUserMenuData() {
    if (userRole === 'CUSTOMER') {
        await loadCartData();
    } else if (userRole === 'SELLER') {
        await loadSellerData();
    }
}

// Загрузка данных корзины
async function loadCartData() {
    try {
        const cartData = await window.api.cart.get();
        const totalItems = cartData.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        
        const cartBadge = document.getElementById('cartItemCount');
        if (cartBadge) {
            if (totalItems > 0) {
                cartBadge.textContent = totalItems > 99 ? '99+' : totalItems;
                cartBadge.style.display = 'inline-block';
            } else {
                cartBadge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

// Загрузка данных продавца
async function loadSellerData() {
    try {
        // Загрузка списка игр продавца
        const gamesData = await window.api.games.getMyGames(1, 100);
        const totalGames = gamesData.totalElements || 0;
        
        const gamesCountEl = document.getElementById('gamesCount');
        const sellerGamesCountEl = document.getElementById('sellerGamesCount');
        
        if (gamesCountEl) gamesCountEl.textContent = totalGames;
        if (sellerGamesCountEl) {
            sellerGamesCountEl.textContent = totalGames;
            sellerGamesCountEl.style.display = totalGames > 0 ? 'inline-block' : 'none';
        }
        
        // Подсчет общего количества ключей
        let totalKeys = 0;
        if (gamesData.content) {
            gamesData.content.forEach(game => {
                totalKeys += game.count || 0;
            });
        }
        
        const keysCountEl = document.getElementById('keysCount');
        if (keysCountEl) keysCountEl.textContent = totalKeys;
    } catch (error) {
        console.error('Ошибка загрузки данных продавца:', error);
    }
}

// Выход из аккаунта
async function logout() {
    try {
        await window.api.auth.logout();
        // Сброс состояния
        currentUser = null;
        userRole = null;
        
        // Обновление UI
        updateUIForGuest();
        closeAllMenus();
        
        // Обновление страницы
        window.location.reload();
    } catch (error) {
        console.error('Ошибка выхода:', error);
        // Даже при ошибке сбрасываем состояние клиента
        currentUser = null;
        userRole = null;
        updateUIForGuest();
        closeAllMenus();
        window.location.reload();
    }
}

// Вспомогательные функции для работы с инициалами
function getInitials(name) {
    if (!name) return 'П';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
}

// Обновление информации о пользователе
function updateUserInfo(user, role) {
    try {
        const userName = user.username || user.Username || '';
        const userEmail = user.email || user.Email || '';
        
        // Обновляем аватар и имя
        const initials = getInitials(userName);
        document.getElementById('userAvatar').textContent = initials;
        document.getElementById('sellerAvatar').textContent = initials;
        document.getElementById('userName').textContent = userName;
        document.getElementById('sellerName').textContent = userName;
        document.getElementById('userEmail').textContent = userEmail;
        document.getElementById('sellerEmail').textContent = userEmail;
        document.getElementById('userRole').textContent = role === 'CUSTOMER' ? 'Покупатель' : 'Продавец';
        
        // Обновляем текст на кнопке
        const userMenuLabel = document.getElementById('userMenuLabel');
        if (userMenuLabel) {
            userMenuLabel.textContent = userName.length > 10 ? 
                userName.substring(0, 10) + '...' : userName || 'Профиль';
        }
    } catch (error) {
        console.error('Ошибка обновления информации пользователя:', error);
    }
}

// Глобальные функции для вызова из HTML
window.closeAllMenus = closeAllMenus;
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;

// Экспортируем функции для использования в других файлах
window.authManager = {
    checkAuthStatus,
    logout,
    getCurrentUser: () => currentUser,
    getUserRole: () => userRole,
    toggleUserMenu,
    showMenu,
    closeAllMenus,
    updateUserInfo,
    loadCartData,
    loadSellerData,
    updateAvatar
};
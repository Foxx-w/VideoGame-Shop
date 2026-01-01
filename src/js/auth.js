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
        // Согласно документации, нет endpoint для проверки авторизации
        // Вместо этого проверим наличие куки и отобразим соответствующее меню
        // На практике сервер будет возвращать 401/403 при неавторизованных запросах
        updateUIForGuest();
        
        // Попробуем получить корзину - если получится, значит пользователь авторизован
        try {
            const cartData = await window.api.cart.get();
            // Если запрос успешен, но пользователь не определен - покажем меню гостя
            // На практике сервер должен возвращать данные пользователя при успешной авторизации
            updateUIForGuest();
        } catch (error) {
            // Ошибка означает, что пользователь не авторизован
            updateUIForGuest();
        }
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
}

// Показ/скрытие меню пользователя
function toggleUserMenu(event) {
    if (isAnimating) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    // Согласно документации, роли: CUSTOMER или SELLER
    // Если нет текущего пользователя - показываем меню гостя
    let menuToShow;
    
    if (currentUser) {
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
        menu.style.display = 'block';
        setTimeout(() => {
            menu.classList.add('show');
        }, 10);
        
        currentMenu = menuId;
        
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
    
    const menus = ['guestMenu', 'userMenu', 'sellerMenu'];
    menus.forEach(id => {
        const menu = document.getElementById(id);
        if (menu) {
            menu.classList.remove('show');
            setTimeout(() => {
                if (!menu.classList.contains('show')) {
                    menu.style.display = 'none';
                }
            }, 300);
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
        }
    });
}

// Обновление UI для авторизованного пользователя
function updateUIForLoggedInUser() {
    const userBtn = document.querySelector('.user-btn');
    const actionLabel = document.querySelector('.user-btn .action-label');
    
    if (userBtn && actionLabel) {
        const userName = currentUser.Username || 'Профиль';
        actionLabel.textContent = userName.length > 10 ? 
            userName.substring(0, 10) + '...' : userName;
        
        userBtn.classList.add('user-has-items');
        
        // Обновляем данные пользователя
        updateUserInfo(currentUser, userRole);
        
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

// Обновление информации о пользователе
function updateUserInfo(user, role) {
    try {
        const userName = user.Username || '';
        const userEmail = user.Email || '';
        
        // Обновляем аватар и имя
        const initials = getInitials(userName);
        
        // Обновляем для меню покупателя
        const userAvatar = document.getElementById('userAvatar');
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const userRoleEl = document.getElementById('userRole');
        
        if (userAvatar) userAvatar.textContent = initials;
        if (userNameEl) userNameEl.textContent = userName;
        if (userEmailEl) userEmailEl.textContent = userEmail;
        if (userRoleEl) userRoleEl.textContent = role === 'CUSTOMER' ? 'Покупатель' : 'Продавец';
        
        // Обновляем для меню продавца
        const sellerAvatar = document.getElementById('sellerAvatar');
        const sellerNameEl = document.getElementById('sellerName');
        const sellerEmailEl = document.getElementById('sellerEmail');
        const sellerRoleEl = document.getElementById('sellerRole');
        
        if (sellerAvatar) sellerAvatar.textContent = initials;
        if (sellerNameEl) sellerNameEl.textContent = userName;
        if (sellerEmailEl) sellerEmailEl.textContent = userEmail;
        if (sellerRoleEl) sellerRoleEl.textContent = 'Продавец';
        
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
        const totalItems = cartData.CartItems?.reduce((sum, item) => sum + item.Quantity, 0) || 0;
        
        // Обновляем бейдж в хедере
        const cartBadge = document.getElementById('cartItemCount');
        if (cartBadge) {
            if (totalItems > 0) {
                cartBadge.textContent = totalItems > 99 ? '99+' : totalItems;
                cartBadge.style.display = 'inline-block';
            } else {
                cartBadge.style.display = 'none';
            }
        }
        
        // Обновляем бейдж в меню
        const cartMenuBadge = document.getElementById('cartItemCountMenu');
        if (cartMenuBadge) {
            if (totalItems > 0) {
                cartMenuBadge.textContent = totalItems > 99 ? '99+' : totalItems;
                cartMenuBadge.style.display = 'inline-block';
            } else {
                cartMenuBadge.style.display = 'none';
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
        const totalGames = gamesData.TotalElements || 0;
        
        const sellerGamesCountEl = document.getElementById('sellerGamesCount');
        if (sellerGamesCountEl) {
            sellerGamesCountEl.textContent = totalGames;
        }
    } catch (error) {
        console.error('Ошибка загрузки данных продавца:', error);
    }
}

// Установка пользователя после успешной авторизации
function setUser(userData, role) {
    currentUser = userData;
    userRole = role;
    updateUIForLoggedInUser();
    
    // Сохраняем в localStorage для сохранения состояния между страницами
    if (userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('userRole', role);
    }
}

// Выход из аккаунта
async function logout() {
    try {
        await window.api.auth.logout();
        // Сброс состояния
        currentUser = null;
        userRole = null;
        
        // Удаляем из localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        
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
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        updateUIForGuest();
        closeAllMenus();
        window.location.reload();
    }
}

// Восстановление пользователя из localStorage
function restoreUserFromStorage() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        const savedRole = localStorage.getItem('userRole');
        
        if (savedUser && savedRole) {
            const userData = JSON.parse(savedUser);
            setUser(userData, savedRole);
            return true;
        }
    } catch (error) {
        console.error('Ошибка восстановления пользователя:', error);
    }
    return false;
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

// Глобальные функции для вызова из HTML
window.closeAllMenus = closeAllMenus;
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;
window.setUser = setUser;
window.restoreUserFromStorage = restoreUserFromStorage;

// Экспортируем функции для использования в других файлах
window.authManager = {
    checkAuthStatus,
    logout,
    setUser,
    restoreUserFromStorage,
    getCurrentUser: () => currentUser,
    getUserRole: () => userRole,
    toggleUserMenu,
    showMenu,
    closeAllMenus,
    updateUserInfo,
    loadCartData,
    loadSellerData
};
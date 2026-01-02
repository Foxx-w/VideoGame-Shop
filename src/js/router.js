class Router {
    constructor() {
        this.routes = {
            'index': { path: '/index.html', title: 'Главная' },
            'login': { path: '/login.html', title: 'Вход' },
            'register': { path: '/register.html', title: 'Регистрация' },
            'cart': { path: '/cart.html', title: 'Корзина' },
            'orders': { path: '/orders.html', title: 'История заказов' },
            'seller': { path: '/seller.html', title: 'Панель продавца' },
            '404': { path: '/404.html', title: 'Страница не найдена' }
        };
    }

    navigate(routeName) {
        const route = this.routes[routeName];
        if (route) {
            window.location.href = route.path;
        } else {
            window.location.href = this.routes['404'].path;
        }
    }

    getCurrentRoute() {
        const path = window.location.pathname;
        for (const [name, route] of Object.entries(this.routes)) {
            if (path.endsWith(route.path)) {
                return name;
            }
        }
        return 'index';
    }
}

const router = new Router();
**Там где не указан response, там нужно делать запрос**
## Auth

От фронта - UserRequest(при логине нужно выбирать роль и потом запоминать)

- `POST /api/auth/register` – регистрация пользователя _(любая роль)_.  UserRequest
    
- `POST /api/auth/login` – вход в аккаунт _(любая роль)_. UserRequest
    
- `POST /api/auth/logout` – выход из аккаунта _(авторизованный пользователь)_.
    

## Games

- `GET /api/games/{id}` – получить игру по `id`. GameResponse
    
- `GET /api/games?filters...&page=...&pageSize=...` – получить страницу игр по фильтрам (фильтры необязательны). filters смотри FilterRequest + Pageable, Page\<GameResponse>
    
- `DELETE /api/games/{id}` – удалить игру по `id` _(Продавец)_.
    
- `PUT /api/games/{id}` – обновить игру по `id` _(Продавец)_. GameRequest
    
- `POST /api/games` – добавить новую игру _(Продавец)_. GameWithKeysRequest
    
- `POST /api/games/{id}/keys` – добавить ключи для игры _(Продавец)_. Keys(Файл json), GameResponse
    
- `GET /api/games/my?page=...&pageSize=...` – получить страницу игр текущего продавца _(Продавец)_. Pageable, Page\<GameReponse>
    

## Orders

- `GET /api/orders?page=...&pageSize=...` – получить страницу заказов _(Покупатель)_. Pageable, Page\<OrderResponse>
    
- `POST /api/orders` – оформить заказ _(Покупатель)_. OrderRequest
    

## Cart

- `DELETE /api/carts/items` – удалить указанное количество товара из корзины; при нулевом остатке позиция удаляется полностью _(Покупатель)_. CartItemRequest,  CartResponse
    
- `POST /api/carts/items` – добавить позицию в корзину; если позиция уже есть, увеличить её количество _(Покупатель)_. CartItemRequest, CartResponse
    
- `GET /api/carts` – получить корзину  _(Покупатель)_. CartResponse
    

## Genres

- `GET /api/genres` – получить все жанры. List\<GenreResponse>
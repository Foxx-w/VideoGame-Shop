// js/seller.js
document.addEventListener('DOMContentLoaded', () => {
    // modal open/close helpers
    function openModal(reset = true) {
        const modal = document.getElementById('modalOverlay');
        if (!modal) return;
        if (reset && form) {
            form.reset();
            delete form.dataset.id;
        }
        modal.style.display = 'flex';
    }

    function closeModal() {
        const modal = document.getElementById('modalOverlay');
        if (!modal) return;
        modal.style.display = 'none';
    }

    // expose closeModal globally for inline onclick in HTML
    window.closeModal = closeModal;

    // wire Add button
    const openBtn = document.getElementById('openModalBtn');
    if (openBtn) openBtn.addEventListener('click', () => openModal(true));

    const form = document.querySelector('.product-details');
    const saveBtn = document.getElementById('saveBtn');
    const productsContainer = document.getElementById('productsContainer');

    async function loadMyGames(page = 1, pageSize = 20) {
        if (!productsContainer) return;
        productsContainer.innerHTML = '<div class="loading">Загрузка...</div>';
        try {
            const resp = await api.getMyGames(page, pageSize);
            const items = resp?.content || [];
            productsContainer.innerHTML = '';
            if (!items || items.length === 0) {
                const no = document.getElementById('noProductsMessage');
                if (no) no.style.display = 'block';
                return;
            }
            const no = document.getElementById('noProductsMessage'); if (no) no.style.display = 'none';
            items.forEach(g => productsContainer.appendChild(renderProductItem(g)));
        } catch (err) {
            console.error('Failed to load seller games:', err);
            productsContainer.innerHTML = '<div class="error">Не удалось загрузить товары</div>';
        }
    }

    function renderProductItem(g) {
        const wrap = document.createElement('div');
        wrap.className = 'product-item';
        wrap.dataset.id = g.id;

        const img = g.imageUrl ? `<img src="${g.imageUrl}" alt="${g.title}" class="product-image">` : '<div class="product-image">Нет изображения</div>';
        const title = g.title || g.Title || '';
        const price = (g.price ?? g.Price) ? (g.price ?? g.Price) : 0;

        wrap.innerHTML = `
            <div class="product-image-wrap">${img}</div>
            <div class="product-info">
                <div class="product-name">${title}</div>
                <div class="product-price">${price} ₽</div>
            </div>
            <div class="product-actions">
                <button class="edit-btn" data-action="edit" data-id="${g.id}">Редактировать</button>
                <button class="delete-btn" data-action="delete" data-id="${g.id}">Удалить</button>
            </div>
        `;

        // attach listeners for buttons
        wrap.querySelector('[data-action="delete"]').addEventListener('click', async () => {
            if (!confirm('Удалить товар?')) return;
            try {
                await api.deleteGame(g.id);
                wrap.remove();
            } catch (err) {
                console.error('Delete failed', err);
                alert('Не удалось удалить товар');
            }
        });

        wrap.querySelector('[data-action="edit"]').addEventListener('click', () => {
            // open modal and populate form
            if (!form) return;
            form.dataset.id = g.id;
            document.getElementById('titleInput').value = g.title || g.Title || '';
            document.getElementById('developerInput').value = g.developerTitle || g.DeveloperTitle || '';
            document.getElementById('publisherInput').value = g.publisherTitle || g.PublisherTitle || '';
            document.getElementById('priceInput').value = (g.price ?? g.Price) || '';
            document.getElementById('descriptionInput').value = g.description || g.Description || '';
            // open modal overlay
            const modal = document.getElementById('modalOverlay');
            if (modal) modal.style.display = 'block';
        });

        return wrap;
    }

    if (!form || !saveBtn) return;
    // load seller games
    loadMyGames();

    async function gatherFormData() {
        const title = document.getElementById('titleInput')?.value?.trim();
        const developer = document.getElementById('developerInput')?.value?.trim();
        const publisher = document.getElementById('publisherInput')?.value?.trim();
        const priceRaw = document.getElementById('priceInput')?.value;
        const description = document.getElementById('descriptionInput')?.value?.trim() || '';

        const price = priceRaw ? parseFloat(priceRaw) : 0;

        // collect genres from selected buttons
        const selectedBtns = Array.from(document.querySelectorAll('#genresList .genre-btn.selected'));
        const genres = selectedBtns.map(btn => ({ Title: btn.dataset.genre || btn.textContent.trim() }));

        // files
        const keysFile = document.getElementById('keysFileInput')?.files?.[0] || null;
        const mainImage = document.getElementById('mainImageInput')?.files?.[0] || null;
        const cardImage = document.getElementById('cardImageInput')?.files?.[0] || null;

        const fd = new FormData();
        if (title) fd.append('Title', title);
        if (publisher) fd.append('PublisherTitle', publisher);
        if (developer) fd.append('DeveloperTitle', developer);
        fd.append('Price', price.toString());
        fd.append('Description', description);

        genres.forEach((g, i) => {
            fd.append(`Genres[${i}].Title`, g.Title);
        });

        if (keysFile) fd.append('Keys', keysFile);
        if (mainImage) fd.append('Image', mainImage);
        if (cardImage) fd.append('CardImage', cardImage);

        return fd;
    }

    async function submitForm(e) {
        e.preventDefault();
        saveBtn.disabled = true;
        try {
            const fd = await gatherFormData();

            // Basic validation
            const title = fd.get('Title');
            const price = parseFloat(fd.get('Price') || '0');
            const genresCount = Array.from(fd.keys()).filter(k => k.startsWith('Genres[')).length;

            if (!title || title.length < 2) {
                alert('Название должно быть не менее 2 символов');
                return;
            }
            if (isNaN(price) || price <= 0.0) {
                alert('Укажите корректную цену (> 0)');
                return;
            }
            if (genresCount < 1) {
                alert('Выберите хотя бы один жанр');
                return;
            }

            // If form has data-id attribute — try update
            const gameId = form.dataset?.id;
            if (gameId) {
                await api.updateGame(gameId, fd);
                alert('Игра обновлена');
            } else {
                await api.createGame(fd);
                alert('Игра создана');
                // optionally reset form
                form.reset();
            }

        } catch (err) {
            console.error('Failed to save game:', err);
            alert(err.message || 'Ошибка при сохранении игры');
        } finally {
            saveBtn.disabled = false;
        }
    }

    form.addEventListener('submit', submitForm);
    saveBtn.addEventListener('click', (e) => form.dispatchEvent(new Event('submit', { cancelable: true })));
});
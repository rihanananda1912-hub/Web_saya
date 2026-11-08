/**
 * AETHER & CO. SPECIALTY ROASTERY
 * Interactive Landing Page Logic
 * Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. DOM SELECTORS
    // ==========================================
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Cart / Drawer
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartBadge = document.getElementById('cartBadge');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const orderNotes = document.getElementById('orderNotes');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const emptyMenuBtn = document.getElementById('emptyMenuBtn');

    // Menu Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    // Review Modal
    const openReviewModalBtn = document.getElementById('openReviewModalBtn');
    const closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
    const cancelReviewBtn = document.getElementById('cancelReviewBtn');
    const reviewModalOverlay = document.getElementById('reviewModalOverlay');
    const newReviewForm = document.getElementById('newReviewForm');
    const starSelects = document.querySelectorAll('.star-select');
    const ratingValueInput = document.getElementById('ratingValue');
    const reviewsContainer = document.getElementById('reviewsContainer');

    // Newsletter & Scroll Top
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterEmail = document.getElementById('newsletterEmail');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const toastContainer = document.getElementById('toastContainer');

    // ==========================================
    // 2. STATE MANAGEMENT
    // ==========================================
    let cart = []; // Array of { id, title, price, qty }

    // ==========================================
    // 3. TOAST NOTIFICATION UTILITY
    // ==========================================
    function showToast(message, icon = '☕') {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span style="font-size: 1.25rem;">${icon}</span>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 3.2 seconds
        setTimeout(() => {
            toast.classList.add('toast-exit');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3200);
    }

    // Format currency to IDR
    function formatIDR(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // ==========================================
    // 4. NAVBAR & SCROLL BEHAVIOR
    // ==========================================
    window.addEventListener('scroll', () => {
        // Navbar blur and shadow on scroll
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll to Top button visibility
        if (window.scrollY > 450) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

        // ScrollSpy: Highlight active nav link
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Hamburger Menu Toggle
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Scroll to Top action
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ==========================================
    // 5. MENU CATEGORY FILTER
    // ==========================================
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedCategory = btn.getAttribute('data-category');

            menuCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.35s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ==========================================
    // 6. ORDER / CART DRAWER LOGIC
    // ==========================================
    function openCart() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
    }

    function closeCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    if (emptyMenuBtn) {
        emptyMenuBtn.addEventListener('click', () => {
            closeCart();
        });
    }

    // Add to Cart Buttons in Menu Cards
    addToCartBtns.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            const title = button.getAttribute('data-title');
            const price = parseInt(button.getAttribute('data-price'), 10);

            addItemToCart(id, title, price);
        });
    });

    function addItemToCart(id, title, price) {
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id: id,
                title: title,
                price: price,
                qty: 1
            });
        }

        updateCartUI();
        showToast(`<strong>${title}</strong> ditambahkan ke pesanan!`, '✨');
    }

    function updateCartUI() {
        // Update badge counter
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartBadge.textContent = totalItems;

        // Render Cart list
        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="cart-empty-state">
                    <div class="empty-icon">☕</div>
                    <p class="empty-text">Keranjang pesanan Anda masih kosong.</p>
                    <a href="#menu" class="btn btn-outline btn-sm" id="emptyMenuBtnDynamic">Pilih Menu Sekarang</a>
                </div>
            `;
            const dynamicBtn = document.getElementById('emptyMenuBtnDynamic');
            if (dynamicBtn) {
                dynamicBtn.addEventListener('click', closeCart);
            }
            cartTotalPrice.textContent = 'Rp 0';
            return;
        }

        // Render items
        cartItemsList.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemSubtotal = item.price * item.qty;
            total += itemSubtotal;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <span class="cart-item-price">${formatIDR(item.price)} x ${item.qty} = <strong>${formatIDR(itemSubtotal)}</strong></span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Kurangi">-</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Tambah">+</button>
                </div>
            `;
            cartItemsList.appendChild(row);
        });

        cartTotalPrice.textContent = formatIDR(total);

        // Attach event listeners to quantity buttons
        const qtyBtns = cartItemsList.querySelectorAll('.qty-btn');
        qtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const itemId = btn.getAttribute('data-id');
                modifyItemQty(itemId, action);
            });
        });
    }

    function modifyItemQty(id, action) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            if (action === 'increase') {
                cart[itemIndex].qty += 1;
            } else if (action === 'decrease') {
                cart[itemIndex].qty -= 1;
                if (cart[itemIndex].qty <= 0) {
                    cart.splice(itemIndex, 1);
                }
            }
        }
        updateCartUI();
    }

    // Clear Cart
    clearCartBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        if (confirm('Apakah Anda yakin ingin mengosongkan pesanan?')) {
            cart = [];
            updateCartUI();
            showToast('Daftar pesanan telah dikosongkan.', '🗑️');
        }
    });

    // Checkout via WhatsApp generator
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Pilih menu terlebih dahulu sebelum memesan.', '⚠️');
            return;
        }

        let total = 0;
        let message = `Halo Aether & Co. Roastery, saya ingin memesan menu kopi berikut:%0A%0A`;

        cart.forEach((item, index) => {
            const sub = item.price * item.qty;
            total += sub;
            message += `${index + 1}. *${item.title}* (${item.qty}x) - ${formatIDR(sub)}%0A`;
        });

        message += `%0A*Total Pembayaran:* ${formatIDR(total)}%0A`;

        const note = orderNotes ? orderNotes.value.trim() : '';
        if (note) {
            message += `*Catatan Khusus:* ${encodeURIComponent(note)}%0A`;
        }

        message += `%0AMohon info ketersediaan & metode pembayarannya. Terima kasih!`;

        // Direct to WhatsApp
        const waNumber = '6281234567890';
        const waUrl = `https://wa.me/${waNumber}?text=${message}`;
        window.open(waUrl, '_blank');
        showToast('Mengalihkan ke WhatsApp untuk konfirmasi pesanan...', '📲');
    });

    // ==========================================
    // 7. REVIEW / TESTIMONIAL MODAL & SUBMIT
    // ==========================================
    function openReviewModal() {
        reviewModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeReviewModal() {
        reviewModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (openReviewModalBtn) openReviewModalBtn.addEventListener('click', openReviewModal);
    if (closeReviewModalBtn) closeReviewModalBtn.addEventListener('click', closeReviewModal);
    if (cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeReviewModal);
    if (reviewModalOverlay) {
        reviewModalOverlay.addEventListener('click', (e) => {
            if (e.target === reviewModalOverlay) closeReviewModal();
        });
    }

    // Interactive Star Rating Selector
    starSelects.forEach(star => {
        star.addEventListener('click', () => {
            const selectedVal = parseInt(star.getAttribute('data-rating'), 10);
            ratingValueInput.value = selectedVal;

            starSelects.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-rating'), 10);
                if (sVal <= selectedVal) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Submit New Review
    if (newReviewForm) {
        newReviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('reviewerName').value.trim();
            const rating = parseInt(ratingValueInput.value, 10) || 5;
            const favItem = document.getElementById('favoriteItem').value.trim();
            const comment = document.getElementById('reviewComment').value.trim();

            if (!name || !comment || !favItem) {
                alert('Mohon lengkapi semua data ulasan.');
                return;
            }

            // Generate Initials
            const initials = name
                .split(' ')
                .map(w => w.charAt(0).toUpperCase())
                .slice(0, 2)
                .join('');

            // Generate Star String
            const starsStr = '★'.repeat(rating) + '☆'.repeat(5 - rating);

            // Create new Review Card
            const card = document.createElement('div');
            card.className = 'review-card';
            card.style.animation = 'toastSlideIn 0.5s ease forwards';
            card.innerHTML = `
                <div class="review-card-header">
                    <div class="reviewer-avatar">${initials}</div>
                    <div class="reviewer-info">
                        <h4>${escapeHTML(name)}</h4>
                        <span class="review-badge">Baru Saja Diulas</span>
                    </div>
                    <div class="review-stars">${starsStr}</div>
                </div>
                <p class="review-comment">"${escapeHTML(comment)}"</p>
                <div class="review-card-footer">
                    <span class="reviewed-item">Favorit: ${escapeHTML(favItem)}</span>
                    <span class="review-time">Baru saja</span>
                </div>
            `;

            // Prepend to list
            reviewsContainer.insertBefore(card, reviewsContainer.firstChild);

            // Feedback
            newReviewForm.reset();
            ratingValueInput.value = '5';
            starSelects.forEach(s => s.classList.add('active'));
            closeReviewModal();
            showToast('Ulasan Anda berhasil dikirim! Terima kasih.', '🌟');
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // ==========================================
    // 8. NEWSLETTER SUBSCRIPTION
    // ==========================================
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterEmail.value.trim();
            if (email) {
                showToast(`Terima kasih! Voucher diskon 20% dikirim ke <strong>${email}</strong>`, '🎉');
                newsletterEmail.value = '';
            }
        });
    }

    // Keyboard shortcut ESC to close modal/drawer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeReviewModal();
        }
    });

});


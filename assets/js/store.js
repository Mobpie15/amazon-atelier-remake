/**
 * AMAZON // ATELIER — Unified Reactive Store Engine
 * Coordinates catalog, multi-currency live pricing, faceted filters,
 * delivery location selector, quick-view modals, and 1-tap slideout cart.
 */

(function() {
  const state = {
    products: [...PRODUCTS_DATA],
    filteredProducts: [...PRODUCTS_DATA],
    activeCategory: 'All',
    searchQuery: '',
    sortBy: 'curated',
    deliveryLocation: {
      city: 'New Delhi',
      pin: '110001',
      recipient: 'Alexander'
    },
    cart: [
      {
        product: PRODUCTS_DATA[0], // OP-1 Field initial commission
        quantity: 1
      }
    ],
    isCartOpen: false
  };

  // DOM Elements
  const gridEl = document.getElementById('products-container') || document.getElementById('products-grid');
  const searchInput = document.getElementById('omni-search-input') || document.getElementById('search-input');
  const categoryPills = document.querySelectorAll('.category-pill-btn, .category-pill');
  const sortSelect = document.getElementById('sort-dropdown') || document.getElementById('sort-select');
  const resultsCountEl = document.getElementById('results-count-display') || document.getElementById('results-count');
  const categorySelect = document.getElementById('header-category-select');
  const omniSearchBtn = document.getElementById('omni-search-btn');

  // Delivery Location DOM
  const locationTriggerBtn = document.getElementById('location-trigger-btn');
  const locationLabelEl = document.getElementById('delivery-location-label');
  const locationModalOverlay = document.getElementById('location-modal-overlay');
  const locationModalClose = document.getElementById('location-modal-close');
  const saveLocationBtn = document.getElementById('save-location-btn');
  const customPinInput = document.getElementById('custom-pin-input');

  // Currency & Language Modal DOM
  const langCurrTriggerBtn = document.getElementById('lang-curr-trigger-btn');
  const langCurrModalOverlay = document.getElementById('lang-curr-modal-overlay');
  const langCurrModalClose = document.getElementById('lang-curr-modal-close');
  const saveLangCurrBtn = document.getElementById('save-lang-curr-btn');

  // Account Modal DOM
  const accountTriggerBtn = document.getElementById('account-trigger-btn');
  const ordersTriggerBtn = document.getElementById('orders-trigger-btn');

  // Cart DOM
  const cartTriggerBtn = document.getElementById('header-cart-trigger') || document.getElementById('cart-trigger-btn');
  const cartDrawer = document.getElementById('cart-drawer-panel') || document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-drawer-backdrop') || document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('cart-drawer-close-btn') || document.getElementById('cart-close-btn');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge, #header-cart-count, #cart-items-qty');
  const cartSubtotalEl = document.getElementById('cart-subtotal-val') || document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total') || document.getElementById('cart-subtotal-val');
  const checkoutBtn = document.getElementById('cart-checkout-btn') || document.getElementById('checkout-btn');
  const freeShippingBar = document.getElementById('shipping-progress-bar');
  const freeShippingNotice = document.getElementById('shipping-notice');

  // Quick View Modal DOM
  const quickviewOverlay = document.getElementById('quickview-modal-overlay');
  const quickviewContent = document.getElementById('quickview-modal-content');
  const quickviewClose = document.getElementById('quickview-close-btn');

  // Hero Add Button
  const heroAddBtn = document.getElementById('hero-add-to-bag');

  function getFormattedPrice(usd) {
    if (window.AtelierCurrency) {
      return window.AtelierCurrency.formatPrice(usd);
    }
    return `$${usd.toLocaleString()}`;
  }

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem('amazon_atelier_wishlist') || '[]');
    } catch (e) {
      return [];
    }
  }

  function toggleWishlist(productId) {
    let list = getWishlist();
    const product = state.products.find(p => p.id === productId);
    const name = product ? product.name : 'Object';

    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
      showToast(`Removed "${name}" from Wishlist`);
    } else {
      list.push(productId);
      showToast(`Added "${name}" to Wishlist`);
    }

    try {
      localStorage.setItem('amazon_atelier_wishlist', JSON.stringify(list));
    } catch (e) {}

    document.querySelectorAll(`.card-wishlist-btn[data-wishlist-id="${productId}"]`).forEach(btn => {
      const isSaved = list.includes(productId);
      btn.classList.toggle('active', isSaved);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', isSaved ? '#e11d48' : 'none');
    });

    const badgeEl = document.getElementById('account-wishlist-count');
    if (badgeEl) badgeEl.textContent = list.length;

    window.dispatchEvent(new CustomEvent('atelier-wishlist-updated'));
  }

  function getPrimeDeliveryDateStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return `Tomorrow, ${d.toLocaleDateString('en-US', options)}`;
  }

  // 1. Render Catalog Grid
  function renderCatalog() {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const wishlist = getWishlist();

    if (state.filteredProducts.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-mark">[ NO ARCHITECTURAL MATCHES ]</div>
          <p class="empty-desc">No objects match your active criteria. Reset filters to explore the full catalog.</p>
          <button type="button" class="btn-secondary" id="catalog-reset-btn">RESET ALL CRITERIA</button>
        </div>
      `;
      const resetBtn = document.getElementById('catalog-reset-btn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          if (window.AtelierFilters) window.AtelierFilters.resetAll();
          state.searchQuery = '';
          if (searchInput) searchInput.value = '';
          state.activeCategory = 'All';
          updateActivePill();
          filterAndRender();
        };
      }
      if (resultsCountEl) resultsCountEl.textContent = '0 OBJECTS';
      return;
    }

    if (resultsCountEl) {
      resultsCountEl.textContent = `${state.filteredProducts.length} OBJECTS`;
    }

    const primeDateStr = getPrimeDeliveryDateStr();

    state.filteredProducts.forEach((product, idx) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.productId = product.id;

      const isWishlisted = wishlist.includes(product.id);
      const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
      const originalPrice = Math.round(product.price * 1.2);

      card.innerHTML = `
        <button type="button" class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}" aria-label="Save to Wishlist">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${isWishlisted ? '#e11d48' : 'none'}" stroke="currentColor" stroke-width="2.2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <div class="card-badge-top">
          ${product.featured ? '<span class="badge-amzn-choice font-mono">Amazon\'s <span>Choice</span></span>' : ''}
          ${product.rating >= 4.9 ? '<span class="badge-best-seller font-mono">#1 Best Seller</span>' : ''}
        </div>

        <div class="card-image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>

        <div class="card-brand-kicker font-mono">${product.brand} &bull; ${product.category}</div>
        <h3 class="card-title font-display">${product.name}</h3>

        <div class="card-rating-row">
          <span class="stars-graphic">${stars}</span>
          <span class="review-count-num font-mono">${product.rating.toFixed(1)} (${product.reviewsCount})</span>
        </div>

        <div class="card-price-row">
          <span class="price-currency-symbol">$</span>
          <span class="price-main-val font-display">${getFormattedPrice(product.price)}</span>
          <span class="price-original-val font-mono">${getFormattedPrice(originalPrice)}</span>
        </div>

        <div class="card-prime-delivery font-mono">
          <svg class="prime-logo-svg" viewBox="0 0 100 28" fill="currentColor">
            <path fill="#007185" d="M14.5 4.5h6.2c4.1 0 6.6 2.3 6.6 5.8 0 3.7-2.6 6-6.8 6h-3.4v7.2h-2.6V4.5zm2.6 9.4h3.3c2.7 0 4.1-1.3 4.1-3.6 0-2.2-1.4-3.5-4.1-3.5h-3.3v7.1zM31 10.4h2.5v2.8h.1c.8-1.9 2.5-3.1 4.5-3.1.6 0 1.1.1 1.6.3v2.7c-.6-.2-1.2-.3-1.9-.3-2.1 0-3.8 1.6-4.2 3.8v7h-2.6V10.4zm11 0h2.6v13.1H42V10.4zm1.3-6.5c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6 0-.9.7-1.6 1.6-1.6zM48 10.4h2.5v2.3h.1c1-1.6 2.8-2.6 4.7-2.6 2.1 0 3.8 1 4.5 2.8h.1c1-1.8 3-2.8 5-2.8 3.1 0 5.3 2.1 5.3 5.7v7.7h-2.6v-7.3c0-2.3-1.2-3.6-3.1-3.6-1.8 0-3.3 1.5-3.3 3.8v7.1h-2.6v-7.3c0-2.3-1.2-3.6-3.1-3.6-1.8 0-3.4 1.5-3.4 3.8v7.1H48V10.4zm29.8 6.9c0-3.8 2.8-7.1 6.8-7.1 4.1 0 6.6 3.1 6.6 7.1 0 .4 0 .9-.1 1.2H79.6c.4 2.4 2.2 4.1 4.8 4.1 1.8 0 3.2-.8 3.9-2.1l2.2 1.1c-1.2 2.2-3.5 3.5-6.2 3.5-4.3 0-7.3-3.1-7.3-7.2zm10.7-1.2c-.2-2.1-1.7-3.7-4-3.7-2.2 0-3.8 1.6-4.1 3.7h8.1z"/>
            <path fill="#FF9900" d="M12.5 23.5c7.8 3.2 17.5 4.5 27.2 2.8 1-.2 2.1-.5 3.1-.8l-.8-1.8c-.9.3-1.8.5-2.7.7-9 1.6-18 .4-25.2-2.5l-1.6 1.6z"/>
          </svg>
          <span>FREE Delivery <strong>${primeDateStr}</strong></span>
        </div>

        <div class="card-actions-stack font-mono">
          <button type="button" class="btn-amzn-yellow add-to-bag-btn" data-id="${product.id}" title="Add to Cart">
            <span>Add to Cart</span>
          </button>
          <button type="button" class="btn-amzn-quickview quick-view-btn" data-id="${product.id}" title="Quick View Specs">
            <span>Quick View</span>
          </button>
        </div>
      `;

      gridEl.appendChild(card);
    });

    if (window.initCardTilt) {
      window.initCardTilt();
    }
  }

  // 2. Filter & Sort Engine
  function filterAndRender() {
    let list = [...state.products];

    // Category Filter
    if (state.activeCategory !== 'All') {
      list = list.filter(p => p.category.toLowerCase().includes(state.activeCategory.toLowerCase()));
    }

    // Faceted Filters (Price, Brands, Materials, Rating, Prime, Stock)
    if (window.AtelierFilters) {
      list = window.AtelierFilters.applyFilters(list);
    }

    // Live Search
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (state.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    state.filteredProducts = list;
    renderCatalog();
  }

  function updateActivePill() {
    categoryPills.forEach(pill => {
      if (pill.dataset.category.toLowerCase() === state.activeCategory.toLowerCase()) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Toast notification engine
  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg font-mono';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }

  function triggerBadgeBounce() {
    cartCountBadges.forEach(b => {
      b.classList.remove('bounce');
      void b.offsetWidth;
      b.classList.add('bounce');
    });
  }

  // 3. Cart, Promo Voucher & 1-Click Checkout
  state.appliedPromo = null;

  function addToCart(productId, qty = 1) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existing = state.cart.find(item => item.product.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      state.cart.push({ product, quantity: qty });
    }

    updateCartUI();
    triggerBadgeBounce();
    showToast(`Added "${product.name}" to Atelier Cart`);
    openCart();
  }

  function updateCartQuantity(productId, delta) {
    const itemIndex = state.cart.findIndex(i => i.product.id === productId);
    if (itemIndex === -1) return;

    state.cart[itemIndex].quantity += delta;
    if (state.cart[itemIndex].quantity <= 0) {
      state.cart.splice(itemIndex, 1);
    }
    updateCartUI();
    triggerBadgeBounce();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.product.id !== productId);
    updateCartUI();
    triggerBadgeBounce();
    showToast('Removed item from Atelier Cart');
  }

  function updateCartUI() {
    const totalCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
    cartCountBadges.forEach(b => {
      b.textContent = totalCount;
      if (totalCount > 0) b.classList.add('visible');
      else b.classList.remove('visible');
    });

    const subtotalUSD = state.cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    const discountRate = state.appliedPromo ? state.appliedPromo.discountRate : 0;
    const discountUSD = subtotalUSD * discountRate;
    const taxableUSD = subtotalUSD - discountUSD;
    const taxUSD = taxableUSD > 0 ? taxableUSD * 0.08 : 0;
    const grandTotalUSD = taxableUSD + taxUSD;

    const summaryBreakdown = document.getElementById('cart-summary-breakdown');
    const summarySubtotal = document.getElementById('summary-subtotal-val');
    const summaryDiscountRow = document.getElementById('summary-discount-row');
    const summaryDiscountLabel = document.getElementById('summary-discount-label');
    const summaryDiscountVal = document.getElementById('summary-discount-val');
    const summaryTaxVal = document.getElementById('summary-tax-val');

    if (summaryBreakdown) {
      summaryBreakdown.style.display = totalCount > 0 ? 'flex' : 'none';
    }
    if (summarySubtotal) summarySubtotal.textContent = getFormattedPrice(subtotalUSD);
    if (summaryTaxVal) summaryTaxVal.textContent = getFormattedPrice(taxUSD);

    if (summaryDiscountRow) {
      if (discountUSD > 0 && state.appliedPromo) {
        summaryDiscountRow.style.display = 'flex';
        if (summaryDiscountLabel) summaryDiscountLabel.textContent = `Voucher (${state.appliedPromo.code}):`;
        if (summaryDiscountVal) summaryDiscountVal.textContent = `-${getFormattedPrice(discountUSD)}`;
      } else {
        summaryDiscountRow.style.display = 'none';
      }
    }

    if (cartSubtotalEl) cartSubtotalEl.textContent = getFormattedPrice(grandTotalUSD);
    if (cartTotalEl) cartTotalEl.textContent = getFormattedPrice(grandTotalUSD);

    const thresholdUSD = 150;
    const progress = Math.min(100, (subtotalUSD / thresholdUSD) * 100);
    if (freeShippingBar) freeShippingBar.style.width = `${progress}%`;
    if (freeShippingNotice) {
      if (subtotalUSD >= thresholdUSD) {
        freeShippingNotice.innerHTML = `<strong>PRIME EXPRESS UNLOCKED</strong> &bull; Free Next-Day Airfreight to ${state.deliveryLocation.city}`;
      } else {
        const rem = thresholdUSD - subtotalUSD;
        freeShippingNotice.innerHTML = `Add <strong>${getFormattedPrice(rem)}</strong> more for complimentary Prime Dispatch`;
      }
    }

    if (!cartItemsList) return;

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state font-mono" style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted);">
          <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-dark); display: block; margin-bottom: 0.5rem;">YOUR ATELIER BAG IS EMPTY</span>
          <p style="font-size: 0.82rem;">Explore the curated catalog to commission architectural objects.</p>
        </div>
      `;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    cartItemsList.innerHTML = state.cart.map(item => {
      const p = item.product;
      return `
        <div class="cart-item-row">
          <div class="cart-item-thumb">
            <img src="${p.image}" alt="${p.name}" class="cart-item-img">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-header">
              <span class="cart-item-brand font-mono">${p.brand}</span>
              <button type="button" class="cart-item-remove" data-remove="${p.id}" title="Remove Item">&times;</button>
            </div>
            <h4 class="cart-item-name font-display">${p.name}</h4>
            <div class="cart-item-bottom">
              <span class="cart-item-price font-display">${getFormattedPrice(p.price * item.quantity)}</span>
              <div class="cart-stepper font-mono">
                <button type="button" class="step-btn" data-step="-1" data-id="${p.id}">&minus;</button>
                <span class="step-val">${item.quantity}</span>
                <button type="button" class="step-btn" data-step="1" data-id="${p.id}">&plus;</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function applyPromoCode() {
    const input = document.getElementById('cart-promo-input');
    const feedback = document.getElementById('cart-promo-feedback');
    if (!input || !feedback) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      feedback.className = 'promo-feedback error';
      feedback.textContent = 'Please enter a voucher code.';
      return;
    }

    if (code === 'ATELIER10' || code === 'PRIME10') {
      state.appliedPromo = { code: code, discountRate: 0.10, label: '10% Atelier Patron' };
      feedback.className = 'promo-feedback success';
      feedback.textContent = '✓ 10% Atelier Patron Voucher applied!';
      showToast('10% Voucher Discount Applied');
    } else if (code === 'PRIME20' || code === 'MOBPIE20') {
      state.appliedPromo = { code: code, discountRate: 0.20, label: '20% Executive Prime' };
      feedback.className = 'promo-feedback success';
      feedback.textContent = '✓ 20% Prime VIP Voucher applied!';
      showToast('20% VIP Voucher Applied');
    } else if (code === 'MOBPIE') {
      state.appliedPromo = { code: code, discountRate: 0.15, label: '15% Mobpie Atelier' };
      feedback.className = 'promo-feedback success';
      feedback.textContent = '✓ 15% Masterpiece Voucher applied!';
      showToast('15% Voucher Applied');
    } else {
      feedback.className = 'promo-feedback error';
      feedback.textContent = 'Invalid code. Try ATELIER10 or PRIME20';
      return;
    }

    updateCartUI();
  }

  function openCart() {
    state.isCartOpen = true;
    if (cartDrawer) cartDrawer.classList.add('open', 'active');
    if (cartOverlay) cartOverlay.classList.add('open', 'active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    state.isCartOpen = false;
    if (cartDrawer) cartDrawer.classList.remove('open', 'active');
    if (cartOverlay) cartOverlay.classList.remove('open', 'active');
    document.body.style.overflow = '';
  }

  // 4. Complete 3-Step Checkout Flow
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      showToast('Your bag is empty. Add an item first.');
      return;
    }

    closeCart();

    const checkoutModal = document.getElementById('checkout-modal-overlay');
    const activeScreen = document.getElementById('checkout-active-screen');
    const successScreen = document.getElementById('checkout-success-screen');

    if (!checkoutModal) return;

    if (activeScreen) activeScreen.style.display = 'block';
    if (successScreen) successScreen.style.display = 'none';

    // Populate checkout preview
    const previewContainer = document.getElementById('checkout-items-preview');
    if (previewContainer) {
      previewContainer.innerHTML = state.cart.map(i => `
        <div class="checkout-item-mini">
          <span>${i.product.name} &times; ${i.quantity}</span>
          <span style="font-weight: 800; color: #0f1111;">${getFormattedPrice(i.product.price * i.quantity)}</span>
        </div>
      `).join('');
    }

    // Calculations
    const subtotalUSD = state.cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    const discountRate = state.appliedPromo ? state.appliedPromo.discountRate : 0;
    const discountUSD = subtotalUSD * discountRate;
    const taxableUSD = subtotalUSD - discountUSD;
    const taxUSD = taxableUSD * 0.08;
    const totalUSD = taxableUSD + taxUSD;

    const subtotalEl = document.getElementById('checkout-subtotal-val');
    const discountRow = document.getElementById('checkout-discount-row');
    const discountLabel = document.getElementById('checkout-discount-label');
    const discountVal = document.getElementById('checkout-discount-val');
    const taxEl = document.getElementById('checkout-tax-val');
    const totalEl = document.getElementById('checkout-total-val');

    if (subtotalEl) subtotalEl.textContent = getFormattedPrice(subtotalUSD);
    if (taxEl) taxEl.textContent = getFormattedPrice(taxUSD);
    if (totalEl) totalEl.textContent = getFormattedPrice(totalUSD);

    if (discountRow) {
      if (discountUSD > 0 && state.appliedPromo) {
        discountRow.style.display = 'flex';
        if (discountLabel) discountLabel.textContent = `Voucher (${state.appliedPromo.code}):`;
        if (discountVal) discountVal.textContent = `-${getFormattedPrice(discountUSD)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    // Radio card selection
    document.querySelectorAll('.checkout-addr-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.checkout-addr-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const input = card.querySelector('input');
        if (input) input.checked = true;
      };
    });

    document.querySelectorAll('.checkout-pay-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.checkout-pay-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const input = card.querySelector('input');
        if (input) input.checked = true;
      };
    });

    checkoutModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkout-modal-overlay');
    if (checkoutModal) {
      checkoutModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function processPlaceOrder() {
    const btn = document.getElementById('btn-place-order');
    const btnText = document.getElementById('place-order-text');
    const spinner = document.getElementById('checkout-spinner');

    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'AUTHORIZING PRIME AIRFREIGHT 782...';
    if (spinner) spinner.style.display = 'inline-block';

    setTimeout(() => {
      const orderNum = Math.floor(100000 + Math.random() * 900000);
      const orderId = `AMZN-${orderNum}`;
      const firstItem = state.cart[0] ? state.cart[0].product : PRODUCTS_DATA[0];

      const subtotalUSD = state.cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
      const discountRate = state.appliedPromo ? state.appliedPromo.discountRate : 0;
      const totalUSD = (subtotalUSD * (1 - discountRate)) * 1.08;

      const newOrder = {
        id: orderId,
        date: "September 18, 2026",
        product: state.cart.length > 1 ? `${firstItem.name} + ${state.cart.length - 1} more` : firstItem.name,
        brand: firstItem.brand,
        price: Math.round(totalUSD),
        status: "IN FLIGHT // TRANSIT",
        statusClass: "transit",
        eta: "Today, 14:00 Express Delivery",
        carrier: "Amazon Air Logistics Flight 782",
        trackingNumber: `1Z-999-ATELIER-${orderNum}`,
        origin: "Amazon Fulfilment Center DEL4 (Robotic)",
        destination: `${state.deliveryLocation.recipient} &bull; ${state.deliveryLocation.city} ${state.deliveryLocation.pin}`
      };

      if (window.AtelierAccount && window.AtelierAccount.addOrder) {
        window.AtelierAccount.addOrder(newOrder);
      }

      state.cart = [];
      state.appliedPromo = null;
      updateCartUI();

      const activeScreen = document.getElementById('checkout-active-screen');
      const successScreen = document.getElementById('checkout-success-screen');
      const receiptOrderId = document.getElementById('receipt-order-id');
      const receiptAmount = document.getElementById('receipt-amount-paid');

      if (activeScreen) activeScreen.style.display = 'none';
      if (successScreen) successScreen.style.display = 'block';
      if (receiptOrderId) receiptOrderId.textContent = `#${orderId}-AT`;
      if (receiptAmount) receiptAmount.textContent = getFormattedPrice(totalUSD);

      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = 'PLACE ORDER • PAY NOW';
      if (spinner) spinner.style.display = 'none';

      showToast(`Order Confirmed: #${orderId}-AT`);

      const trackBtn = document.getElementById('btn-receipt-track');
      const accBtn = document.getElementById('btn-receipt-account');

      if (trackBtn) {
        trackBtn.onclick = () => {
          closeCheckoutModal();
          if (window.AtelierAccount && window.AtelierAccount.openTracking) {
            window.AtelierAccount.openTracking(orderId);
          }
        };
      }

      if (accBtn) {
        accBtn.onclick = () => {
          closeCheckoutModal();
          if (window.AtelierAccount && window.AtelierAccount.openModal) {
            window.AtelierAccount.openModal('orders');
          }
        };
      }
    }, 1100);
  }

  // 5. Rich Quick View Specs & Gallery Modal
  function openQuickView(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !quickviewContent) return;

    let specsRows = '';
    for (const [k, v] of Object.entries(product.specs || {})) {
      specsRows += `
        <div class="modal-spec-row">
          <span class="spec-k font-mono">${k}</span>
          <span class="spec-v font-body">${v}</span>
        </div>
      `;
    }

    const primeDate = getPrimeDeliveryDateStr();

    quickviewContent.innerHTML = `
      <div class="modal-split">
        <div class="modal-image-col">
          <div class="qv-main-image-wrap">
            <img src="${product.image}" alt="${product.name}" id="qv-active-main-img">
            <div class="modal-image-badge font-mono">${product.tag}</div>
          </div>

          <!-- Clickable Multi-Angle Thumbnails -->
          <div class="qv-thumbnails-row">
            <button type="button" class="qv-thumb-btn active" data-img-src="${product.image}">
              <img src="${product.image}" alt="View 1">
            </button>
            <button type="button" class="qv-thumb-btn" data-img-src="assets/images/prod-synth.jpg">
              <img src="assets/images/prod-synth.jpg" alt="View 2">
            </button>
            <button type="button" class="qv-thumb-btn" data-img-src="assets/images/prod-headphones.jpg">
              <img src="assets/images/prod-headphones.jpg" alt="View 3">
            </button>
          </div>
        </div>

        <div class="modal-info-col">
          <div class="modal-meta-top font-mono">
            <span class="modal-brand">${product.brand} &bull; ${product.category}</span>
            <span class="prime-pill">PRIME 24H EXPRESS</span>
          </div>

          <h2 class="modal-title font-display">${product.name}</h2>

          <div class="spotlight-rating-row" style="margin-bottom: 0.75rem;">
            <span class="stars-graphic">★★★★★</span>
            <span class="review-count font-mono" style="color: #007185; font-weight: 700;">${product.rating.toFixed(1)} (${product.reviewsCount} verified commissions)</span>
          </div>

          <div class="modal-price-row">
            <span class="modal-price font-display">${getFormattedPrice(product.price)}</span>
            <span class="modal-tax-note font-mono">0% Commission &bull; Free Global Prime Air</span>
          </div>

          <div class="qv-delivery-box font-mono" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.65rem 0.85rem; margin-bottom: 1.15rem; font-size: 0.75rem;">
            <span style="color: #067D62; font-weight: 800;">✓ In Stock</span> &bull; FREE Prime Delivery <strong>${primeDate}</strong>
          </div>

          <p class="modal-desc font-body" style="line-height: 1.6; color: #565959; margin-bottom: 1.25rem;">
            ${product.description}
          </p>

          <div class="modal-specs-block">
            <h4 class="specs-heading font-mono">TECHNICAL SPECIFICATIONS</h4>
            <div class="specs-grid">
              ${specsRows}
            </div>
          </div>

          <div class="modal-actions" style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" class="btn-amzn-yellow font-mono" id="modal-add-btn" data-id="${product.id}" style="flex: 1; padding: 0.85rem 1.25rem; font-weight: 800;">
              <span>ADD TO BAG &bull; ${getFormattedPrice(product.price)}</span>
            </button>
            <button type="button" class="btn-amzn-quickview font-mono" id="modal-buynow-btn" data-id="${product.id}" style="padding: 0.85rem 1.25rem; font-weight: 800; background: #ffffff;">
              <span>1-CLICK BUY NOW</span>
            </button>
          </div>

        </div>
      </div>
    `;

    if (quickviewOverlay) quickviewOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Thumbnail Switcher
    quickviewContent.querySelectorAll('.qv-thumb-btn').forEach(btn => {
      btn.onclick = () => {
        quickviewContent.querySelectorAll('.qv-thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mainImg = document.getElementById('qv-active-main-img');
        if (mainImg) mainImg.src = btn.dataset.imgSrc;
      };
    });

    const modalAdd = document.getElementById('modal-add-btn');
    if (modalAdd) {
      modalAdd.onclick = () => {
        addToCart(product.id, 1);
        closeQuickView();
      };
    }

    const modalBuyNow = document.getElementById('modal-buynow-btn');
    if (modalBuyNow) {
      modalBuyNow.onclick = () => {
        closeQuickView();
        addToCart(product.id, 1);
        openCheckoutModal();
      };
    }
  }

  function closeQuickView() {
    if (quickviewOverlay) quickviewOverlay.classList.remove('open');
    if (!state.isCartOpen) document.body.style.overflow = '';
  }

  // 5. Delivery Location Modal
  function openLocationModal() {
    if (locationModalOverlay) {
      locationModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLocationModal() {
    if (locationModalOverlay) {
      locationModalOverlay.classList.remove('open');
      if (!state.isCartOpen) document.body.style.overflow = '';
    }
  }

  function updateDeliveryLocation(city, pin) {
    state.deliveryLocation.city = city;
    state.deliveryLocation.pin = pin;

    if (locationLabelEl) {
      locationLabelEl.innerHTML = `Deliver to <strong>${state.deliveryLocation.recipient}</strong> &bull; ${city} ${pin}`;
    }
    updateCartUI();
    closeLocationModal();
  }

  // 6. Language & Currency Modal
  function openLangCurrModal() {
    if (langCurrModalOverlay) {
      langCurrModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLangCurrModal() {
    if (langCurrModalOverlay) {
      langCurrModalOverlay.classList.remove('open');
      if (!state.isCartOpen) document.body.style.overflow = '';
    }
  }

  // 7. Event Listeners Setup
  function initEvents() {
    // Search
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        filterAndRender();
      });
    }

    if (omniSearchBtn) {
      omniSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          state.searchQuery = searchInput.value;
          filterAndRender();
          const catSection = document.getElementById('catalog');
          if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        state.activeCategory = e.target.value;
        updateActivePill();
        filterAndRender();
      });
    }

    // Category pills & links with data-cat / data-category
    document.querySelectorAll('[data-cat]').forEach(el => {
      el.addEventListener('click', (e) => {
        const cat = el.dataset.cat;
        if (cat) {
          state.activeCategory = cat;
          if (categorySelect) categorySelect.value = cat;
          updateActivePill();
          filterAndRender();
        }
      });
    });

    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        state.activeCategory = pill.dataset.category || 'All';
        if (categorySelect) categorySelect.value = state.activeCategory;
        updateActivePill();
        filterAndRender();
      });
    });

    // Sort select
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        filterAndRender();
      });
    }

    // Listen to Faceted Filters Update
    window.addEventListener('atelier-filters-updated', () => {
      filterAndRender();
    });

    // Listen to Mobile Quick Chip / External Category Selection
    window.addEventListener('atelier-category-selected', (e) => {
      state.activeCategory = e.detail.category || 'All';
      updateActivePill();
      filterAndRender();
    });

    // Listen to Currency Change
    window.addEventListener('atelier-currency-changed', () => {
      renderCatalog();
      updateCartUI();

      // Update hero price
      const heroPriceEl = document.querySelector('.hero-price');
      if (heroPriceEl) {
        heroPriceEl.textContent = getFormattedPrice(PRODUCTS_DATA[0].price);
      }
    });

    // Listen to Wishlist Changes from Account Modal
    window.addEventListener('atelier-wishlist-updated', () => {
      const wishlist = getWishlist();
      document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
        const prodId = btn.dataset.wishlistId;
        const isSaved = wishlist.includes(prodId);
        btn.classList.toggle('active', isSaved);
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isSaved ? '#e11d48' : 'none');
      });
      const badgeEl = document.getElementById('account-wishlist-count');
      if (badgeEl) badgeEl.textContent = wishlist.length;
    });

    // Grid item delegation
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const wishlistBtn = e.target.closest('.card-wishlist-btn');
        if (wishlistBtn) {
          e.stopPropagation();
          const prodId = wishlistBtn.dataset.wishlistId;
          if (prodId) {
            toggleWishlist(prodId);
          }
          return;
        }

        const addBtn = e.target.closest('.add-to-bag-btn');
        if (addBtn) {
          e.stopPropagation();
          addToCart(addBtn.dataset.id, 1);
          return;
        }

        const qvBtn = e.target.closest('.quick-view-btn');
        if (qvBtn) {
          e.stopPropagation();
          openQuickView(qvBtn.dataset.id);
          return;
        }

        const card = e.target.closest('.product-card');
        if (card && card.dataset.productId) {
          openQuickView(card.dataset.productId);
        }
      });
    }

    // Drag-to-Scroll for Horizontal Carousels & Subnavs
    function initDragToScroll(selector) {
      const sliders = document.querySelectorAll(selector);
      sliders.forEach(slider => {
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let hasMoved = false;

        slider.addEventListener('mousedown', (e) => {
          isDown = true;
          hasMoved = false;
          slider.classList.add('dragging');
          startX = e.pageX - slider.offsetLeft;
          scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
          isDown = false;
          slider.classList.remove('dragging');
        });

        slider.addEventListener('mouseup', () => {
          isDown = false;
          slider.classList.remove('dragging');
        });

        slider.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          const x = e.pageX - slider.offsetLeft;
          const walk = (x - startX) * 1.5;
          if (Math.abs(walk) > 4) {
            hasMoved = true;
            e.preventDefault();
            slider.scrollLeft = scrollLeft - walk;
          }
        });

        slider.addEventListener('click', (e) => {
          if (hasMoved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);
      });
    }

    initDragToScroll('.subnav-bar, .mobile-quick-chips, .mobile-filter-bar, .account-tabs-bar, .deck-subnav-links');

    // Cart delegation
    if (cartItemsList) {
      cartItemsList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.cart-item-remove');
        if (removeBtn) {
          removeFromCart(removeBtn.dataset.remove);
          return;
        }

        const stepBtn = e.target.closest('.step-btn');
        if (stepBtn) {
          const delta = parseInt(stepBtn.dataset.step, 10);
          updateCartQuantity(stepBtn.dataset.id, delta);
        }
      });
    }

    // Cart Modal Triggers
    if (cartTriggerBtn) cartTriggerBtn.onclick = openCart;
    if (cartCloseBtn) cartCloseBtn.onclick = closeCart;
    if (cartOverlay) cartOverlay.onclick = closeCart;
    if (checkoutBtn) checkoutBtn.onclick = openCheckoutModal;

    // Cart Promo Voucher Button & Input
    const promoBtn = document.getElementById('cart-promo-btn');
    const promoInput = document.getElementById('cart-promo-input');
    if (promoBtn) promoBtn.onclick = applyPromoCode;
    if (promoInput) {
      promoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyPromoCode();
        }
      });
    }

    // Checkout Modal Triggers
    const checkoutCloseBtn = document.getElementById('checkout-modal-close');
    const checkoutOverlay = document.getElementById('checkout-modal-overlay');
    const btnPlaceOrder = document.getElementById('btn-place-order');

    if (checkoutCloseBtn) checkoutCloseBtn.onclick = closeCheckoutModal;
    if (checkoutOverlay) {
      checkoutOverlay.onclick = (e) => {
        if (e.target === checkoutOverlay) closeCheckoutModal();
      };
    }
    if (btnPlaceOrder) btnPlaceOrder.onclick = processPlaceOrder;

    // Quick View Triggers
    if (quickviewClose) quickviewClose.onclick = closeQuickView;
    if (quickviewOverlay) {
      quickviewOverlay.onclick = (e) => {
        if (e.target === quickviewOverlay) closeQuickView();
      };
    }

    // Location Selector Triggers
    if (locationTriggerBtn) locationTriggerBtn.onclick = openLocationModal;
    const mobileLocationStrip = document.getElementById('mobile-location-strip');
    if (mobileLocationStrip) mobileLocationStrip.onclick = openLocationModal;
    if (locationModalClose) locationModalClose.onclick = closeLocationModal;
    if (locationModalOverlay) {
      locationModalOverlay.onclick = (e) => {
        if (e.target === locationModalOverlay) closeLocationModal();
      };
    }

    document.querySelectorAll('.preset-address-card').forEach(card => {
      card.onclick = () => {
        const city = card.dataset.city;
        const pin = card.dataset.pin;
        updateDeliveryLocation(city, pin);
      };
    });

    if (saveLocationBtn && customPinInput) {
      saveLocationBtn.onclick = () => {
        const pin = customPinInput.value.trim() || '110001';
        updateDeliveryLocation('Custom PIN', pin);
      };
    }

    // Language & Currency Selector Triggers
    if (langCurrTriggerBtn) langCurrTriggerBtn.onclick = openLangCurrModal;
    if (langCurrModalClose) langCurrModalClose.onclick = closeLangCurrModal;
    if (langCurrModalOverlay) {
      langCurrModalOverlay.onclick = (e) => {
        if (e.target === langCurrModalOverlay) closeLangCurrModal();
      };
    }

    // Currency selection buttons inside modal
    document.querySelectorAll('.currency-select-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.currency-select-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const code = card.dataset.currency;
        if (window.AtelierCurrency) window.AtelierCurrency.setCurrency(code);
      };
    });

    // Language selection buttons inside modal
    document.querySelectorAll('.lang-select-card').forEach(card => {
      card.onclick = () => {
        document.querySelectorAll('.lang-select-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const lang = card.dataset.lang;
        if (window.AtelierCurrency) window.AtelierCurrency.setLanguage(lang);
      };
    });

    if (saveLangCurrBtn) saveLangCurrBtn.onclick = closeLangCurrModal;

    // Account & Orders Triggers
    if (accountTriggerBtn && window.AtelierAccount) {
      accountTriggerBtn.onclick = () => window.AtelierAccount.openModal('profile');
    }
    if (ordersTriggerBtn && window.AtelierAccount) {
      ordersTriggerBtn.onclick = () => window.AtelierAccount.openModal('orders');
    }

    const footerAccountLink = document.getElementById('footer-account-link');
    if (footerAccountLink && window.AtelierAccount) {
      footerAccountLink.onclick = (e) => {
        e.preventDefault();
        window.AtelierAccount.openModal('orders');
      };
    }

    // Departments Menu & Flyout Drawer
    const deptMenuBtn = document.getElementById('departments-menu-btn');
    const deptDrawer = document.getElementById('departments-drawer');
    const deptOverlay = document.getElementById('departments-drawer-overlay');
    const deptClose = document.getElementById('departments-drawer-close');

    const openDeptDrawer = () => {
      if (deptDrawer) deptDrawer.classList.add('open');
      if (deptOverlay) deptOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeDeptDrawer = () => {
      if (deptDrawer) deptDrawer.classList.remove('open');
      if (deptOverlay) deptOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (deptMenuBtn) deptMenuBtn.onclick = openDeptDrawer;
    if (deptClose) deptClose.onclick = closeDeptDrawer;
    if (deptOverlay) deptOverlay.onclick = closeDeptDrawer;

    // Department drawer category clicks
    document.querySelectorAll('.dept-nav-link').forEach(link => {
      link.onclick = (e) => {
        const cat = link.dataset.category;
        if (cat) {
          e.preventDefault();
          state.activeCategory = cat;
          if (categorySelect) categorySelect.value = cat;
          updateActivePill();
          filterAndRender();
          closeDeptDrawer();
        }
      };
    });

    const drawerAccLink = document.getElementById('drawer-account-link');
    if (drawerAccLink && window.AtelierAccount) {
      drawerAccLink.onclick = (e) => {
        e.preventDefault();
        closeDeptDrawer();
        window.AtelierAccount.openModal('profile');
      };
    }

    const drawerOrdLink = document.getElementById('drawer-orders-link');
    if (drawerOrdLink && window.AtelierAccount) {
      drawerOrdLink.onclick = (e) => {
        e.preventDefault();
        closeDeptDrawer();
        window.AtelierAccount.openModal('orders');
      };
    }

    // -----------------------------------------------------------------------
    // Interactive Hero Stage Dynamic Model Switcher & Commissioning
    // -----------------------------------------------------------------------
    let currentHeroProductId = 'amzn-001';

    const HERO_SPECS_MAP = {
      'amzn-001': {
        spec1: 'Anodized Aluminum Unibody',
        spec2: '32-bit Stereo Signal Chain'
      },
      'amzn-002': {
        spec1: '40mm Titanium Drivers',
        spec2: 'Adaptive Digital ANC'
      },
      'amzn-003': {
        spec1: '60MP Full-Frame BSI CMOS',
        spec2: 'Machined Solid Brass'
      },
      'amzn-005': {
        spec1: '38mm Brushed Steel',
        spec2: 'Dieter Rams Legacy'
      }
    };

    function switchHeroModel(productId) {
      const product = PRODUCTS_DATA.find(p => p.id === productId);
      if (!product) return;

      currentHeroProductId = productId;

      // 1. Update Switcher Buttons
      document.querySelectorAll('.hero-model-btn').forEach(btn => {
        if (btn.dataset.productId === productId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // 2. Update Spotlight Elements
      const brandEl = document.getElementById('hero-spotlight-brand');
      const imgEl = document.getElementById('hero-spotlight-img');
      const titleEl = document.getElementById('hero-spotlight-title');
      const starsEl = document.getElementById('hero-spotlight-stars');
      const reviewsEl = document.getElementById('hero-spotlight-reviews');
      const priceEl = document.getElementById('hero-spotlight-price');
      const spec1El = document.getElementById('hero-spec-1');
      const spec2El = document.getElementById('hero-spec-2');
      const ctaBtnText = document.getElementById('hero-cta-btn-text');

      if (brandEl) brandEl.textContent = product.brand;
      if (titleEl) titleEl.textContent = product.name;
      if (starsEl) starsEl.textContent = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
      if (reviewsEl) reviewsEl.textContent = `${product.rating.toFixed(1)} (${product.reviewsCount} verified commissions)`;
      
      const formattedPrice = getFormattedPrice(product.price);
      if (priceEl) priceEl.textContent = formattedPrice;
      if (ctaBtnText) ctaBtnText.textContent = `COMMISSION OBJECT • ${formattedPrice}`;

      // Floating specs
      const specs = HERO_SPECS_MAP[productId] || {
        spec1: Object.values(product.specs || {})[0] || 'Architectural Grade',
        spec2: Object.values(product.specs || {})[1] || 'Zero Latency Dispatch'
      };

      if (spec1El) {
        spec1El.innerHTML = `<span class="dot"></span><span>${specs.spec1}</span>`;
      }
      if (spec2El) {
        spec2El.innerHTML = `<span class="dot"></span><span>${specs.spec2}</span>`;
      }

      // Smooth visual image transition
      if (imgEl) {
        imgEl.style.opacity = '0.3';
        imgEl.style.transform = 'scale(0.96)';
        setTimeout(() => {
          imgEl.src = product.image;
          imgEl.alt = product.name;
          imgEl.style.opacity = '1';
          imgEl.style.transform = 'scale(1)';
        }, 180);
      }
    }

    // Hero Model Switcher Click Listeners
    document.querySelectorAll('.hero-model-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const prodId = btn.dataset.productId;
        if (prodId) switchHeroModel(prodId);
      });
    });

    // Hero Direct Commission Button
    const heroCommissionBtn = document.getElementById('hero-commission-btn');
    if (heroCommissionBtn) {
      heroCommissionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(currentHeroProductId, 1);
        openCart();
      });
    }

    // Hero Spotlight Card QuickView Trigger (when clicking card)
    const heroSpotlightCard = document.getElementById('hero-spotlight-card');
    if (heroSpotlightCard) {
      heroSpotlightCard.addEventListener('click', (e) => {
        if (e.target.closest('.hero-model-btn') || e.target.closest('#hero-commission-btn')) return;
        openQuickView(currentHeroProductId);
      });
    }

    // -----------------------------------------------------------------------
    // Curated Departments Deck Navigation & Filtering
    // -----------------------------------------------------------------------
    document.querySelectorAll('.deck-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = card.dataset.cat;
        if (!cat) return;

        state.activeCategory = cat;
        if (categorySelect) categorySelect.value = cat;

        document.querySelectorAll('.deck-nav-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cat === cat);
        });

        updateActivePill();
        filterAndRender();

        const catalogEl = document.getElementById('catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    document.querySelectorAll('.deck-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = btn.dataset.cat;
        if (!cat) return;

        state.activeCategory = cat;
        if (categorySelect) categorySelect.value = cat;

        document.querySelectorAll('.deck-nav-btn').forEach(b => {
          b.classList.toggle('active', b === btn);
        });

        updateActivePill();
        filterAndRender();

        const catalogEl = document.getElementById('catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Curated Add-ons Click Handlers
    document.querySelectorAll('.btn-addon-add').forEach(btn => {
      btn.onclick = () => {
        const name = btn.dataset.addonName;
        const price = parseInt(btn.dataset.addonPrice, 10);
        const addonItem = {
          id: `addon-${Date.now()}`,
          name: name,
          brand: 'AMAZON ATELIER ACCESSORIES',
          category: 'Accessories',
          price: price,
          image: 'assets/images/prod-headphones.jpg',
          rating: 5.0,
          reviewsCount: 180,
          specs: { Compatibility: 'Universal Atelier Standard', Material: 'Aerospace Grade' }
        };
        state.cart.push({ product: addonItem, quantity: 1 });
        updateCartUI();
        triggerBadgeBounce();
        showToast(`Added Add-on: ${name}`);
      };
    });

    // Airfreight Countdown Ticker
    function initAirfreightTimer() {
      const timerEl = document.getElementById('airfreight-timer');
      if (!timerEl) return;
      let secondsLeft = 3 * 3600 + 42 * 60 + 15;
      setInterval(() => {
        secondsLeft = secondsLeft > 0 ? secondsLeft - 1 : 4 * 3600;
        const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
        const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
        const s = String(secondsLeft % 60).padStart(2, '0');
        timerEl.textContent = `${h}:${m}:${s}`;
      }, 1000);
    }

    // Smart Omnibox Autocomplete Engine
    function initAutocomplete() {
      const dropdown = document.getElementById('search-autocomplete-dropdown');
      if (!searchInput || !dropdown) return;

      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (!q) {
          dropdown.classList.remove('active');
          dropdown.innerHTML = '';
          return;
        }

        const matches = state.products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        ).slice(0, 5);

        if (matches.length === 0) {
          dropdown.classList.remove('active');
          dropdown.innerHTML = '';
          return;
        }

        dropdown.innerHTML = matches.map(p => `
          <div class="autocomplete-item" data-id="${p.id}">
            <div class="autocomplete-item-left">
              <img src="${p.image}" alt="${p.name}" class="autocomplete-thumb">
              <div>
                <div class="autocomplete-name">${p.name}</div>
                <div class="autocomplete-cat">${p.brand} &bull; ${p.category}</div>
              </div>
            </div>
            <div class="autocomplete-price font-display">${getFormattedPrice(p.price)}</div>
          </div>
        `).join('');

        dropdown.classList.add('active');
      });

      dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.autocomplete-item');
        if (item) {
          const id = item.dataset.id;
          dropdown.classList.remove('active');
          openQuickView(id);
        }
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search-wrap')) {
          dropdown.classList.remove('active');
        }
      });
    }

    // Showcase Disclaimer Button Trigger
    const navDisclaimerBtn = document.getElementById('nav-disclaimer-btn');
    if (navDisclaimerBtn) {
      navDisclaimerBtn.onclick = (e) => {
        e.preventDefault();
        const overlay = document.getElementById('demo-disclaimer-overlay');
        if (overlay) {
          overlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      };
    }

    // Demo Disclaimer Logic (Manual trigger only, never auto-lock screen)
    function initDemoDisclaimer() {
      const overlay = document.getElementById('demo-disclaimer-overlay');
      const closeBtn = document.getElementById('demo-disclaimer-close');
      const enterBtn = document.getElementById('btn-demo-enter');

      if (!overlay) return;

      function dismiss() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }

      if (closeBtn) closeBtn.addEventListener('click', dismiss);
      if (enterBtn) enterBtn.addEventListener('click', dismiss);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) dismiss();
      });
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const disclaimerOverlay = document.getElementById('demo-disclaimer-overlay');
        if (disclaimerOverlay && disclaimerOverlay.classList.contains('open')) {
          disclaimerOverlay.classList.remove('open');
          document.body.style.overflow = '';
          try {
            sessionStorage.setItem('amazon_atelier_disclaimer_dismissed', '1');
          } catch (err) {}
          return;
        }
        closeCart();
        closeQuickView();
        closeLocationModal();
        closeLangCurrModal();
        if (window.AtelierAccount) window.AtelierAccount.closeModal();
      } else if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      } else if (e.key === 'c' && document.activeElement !== searchInput) {
        e.preventDefault();
        if (state.isCartOpen) closeCart();
        else openCart();
      }
    });

    // Initial render
    renderCatalog();
    updateCartUI();
    updateDeliveryLocation('New Delhi', '110001');
    initDemoDisclaimer();
    initAirfreightTimer();
    initAutocomplete();
    // Expose global AtelierStore API
    window.AtelierStore = {
      state,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      openCart,
      closeCart,
      openCheckout: openCheckoutModal,
      toggleWishlist,
      filterAndRender
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEvents);
  } else {
    initEvents();
  }
})();

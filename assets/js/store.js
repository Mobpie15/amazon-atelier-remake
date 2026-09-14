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
  const gridEl = document.getElementById('products-grid');
  const searchInput = document.getElementById('search-input');
  const categoryPills = document.querySelectorAll('.category-pill');
  const sortSelect = document.getElementById('sort-select');
  const resultsCountEl = document.getElementById('results-count');

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
  const cartTriggerBtn = document.getElementById('cart-trigger-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
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

  // 1. Render Catalog Grid
  function renderCatalog() {
    if (!gridEl) return;
    gridEl.innerHTML = '';

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

    state.filteredProducts.forEach((product, idx) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.productId = product.id;

      card.innerHTML = `
        <div class="card-image-box">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <span class="card-brand-tag font-mono">${product.brand}</span>
          <button type="button" class="quick-view-btn font-mono" data-id="${product.id}" title="Inspect Technical Specifications">
            SPECS & DETAILS
          </button>
        </div>

        <div class="card-info">
          <div class="card-meta-top">
            <span class="card-category font-mono">${product.category}</span>
            <div class="card-rating font-mono">
              <span class="rating-val">${product.rating.toFixed(1)}</span>
              <span class="rating-reviews">(${product.reviewsCount})</span>
            </div>
          </div>

          <h3 class="card-title">${product.name}</h3>

          <div class="card-footer">
            <div class="card-price-block">
              <span class="card-price font-display">${getFormattedPrice(product.price)}</span>
              ${product.primeExpress ? '<span class="prime-pill font-mono">PRIME 24H</span>' : ''}
            </div>

            <button type="button" class="add-to-bag-btn font-mono" data-id="${product.id}" title="Add to Bag">
              <span>ADD</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
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

  // 3. Cart & 1-Tap Checkout
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
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.product.id !== productId);
    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
    cartCountBadges.forEach(b => {
      b.textContent = totalCount;
      if (totalCount > 0) b.classList.add('visible');
      else b.classList.remove('visible');
    });

    const subtotalUSD = state.cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    if (cartSubtotalEl) cartSubtotalEl.textContent = getFormattedPrice(subtotalUSD);
    if (cartTotalEl) cartTotalEl.textContent = getFormattedPrice(subtotalUSD);

    const thresholdUSD = 150;
    const progress = Math.min(100, (subtotalUSD / thresholdUSD) * 100);
    if (freeShippingBar) freeShippingBar.style.width = `${progress}%`;
    if (freeShippingNotice) {
      if (subtotalUSD >= thresholdUSD) {
        freeShippingNotice.innerHTML = `<strong>PRIME EXPRESS UNLOCKED</strong> &bull; Free Next-Day Courier to ${state.deliveryLocation.city}`;
      } else {
        const rem = thresholdUSD - subtotalUSD;
        freeShippingNotice.innerHTML = `Add <strong>${getFormattedPrice(rem)}</strong> more for complimentary Prime Dispatch`;
      }
    }

    if (!cartItemsList) return;

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state font-mono">
          <span>YOUR ATELIER BAG IS EMPTY</span>
          <p>Explore the architectural catalog to commission an object.</p>
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
            <img src="${p.image}" alt="${p.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-header">
              <span class="cart-item-brand font-mono">${p.brand}</span>
              <button type="button" class="cart-item-remove" data-remove="${p.id}" title="Remove Item">&times;</button>
            </div>
            <h4 class="cart-item-name">${p.name}</h4>
            <div class="cart-item-bottom">
              <span class="cart-item-price font-mono">${getFormattedPrice(p.price * item.quantity)}</span>
              <div class="cart-stepper">
                <button type="button" class="step-btn" data-step="-1" data-id="${p.id}">&minus;</button>
                <span class="step-val font-mono">${item.quantity}</span>
                <button type="button" class="step-btn" data-step="1" data-id="${p.id}">&plus;</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openCart() {
    state.isCartOpen = true;
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    state.isCartOpen = false;
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleCheckout() {
    if (state.cart.length === 0) return;

    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = `<span>ROUTING TO PRIME EXPRESS AIRFREIGHT...</span>`;
    }

    setTimeout(() => {
      const orderId = `AMZN-${Math.floor(100000 + Math.random() * 900000)}`;
      if (cartItemsList) {
        cartItemsList.innerHTML = `
          <div class="checkout-success-box">
            <div class="success-mark font-mono">[ ORDER CONFIRMED ]</div>
            <h3>Dispatch Ref: ${orderId}</h3>
            <p>Target delivery to <strong>${state.deliveryLocation.recipient} (${state.deliveryLocation.city} ${state.deliveryLocation.pin})</strong> within 24 hours.</p>
            <div class="success-meta font-mono">
              <span>TRACKING ID: 1Z-999-ATELIER-${orderId.split('-')[1]}</span>
              <span>CARRIER: AMAZON AIR LOGISTICS</span>
              <span>STATUS: AUTOMATED ROBOTIC PICKING ACTIVE</span>
            </div>
          </div>
        `;
      }
      state.cart = [];
      updateCartUI();

      if (checkoutBtn) {
        checkoutBtn.innerHTML = `<span>ORDER DISPATCHED</span>`;
      }
    }, 900);
  }

  // 4. Quick View Specs Modal
  function openQuickView(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !quickviewContent) return;

    let specsHtml = '';
    for (const [k, v] of Object.entries(product.specs)) {
      specsHtml += `
        <div class="modal-spec-row">
          <span class="spec-k font-mono">${k}</span>
          <span class="spec-v">${v}</span>
        </div>
      `;
    }

    quickviewContent.innerHTML = `
      <div class="modal-split">
        <div class="modal-image-col">
          <img src="${product.image}" alt="${product.name}">
          <div class="modal-image-badge font-mono">${product.tag}</div>
        </div>
        <div class="modal-info-col">
          <div class="modal-meta-top">
            <span class="modal-brand font-mono">${product.brand}</span>
            <span class="prime-pill font-mono">PRIME 24H EXPRESS</span>
          </div>

          <h2 class="modal-title font-display">${product.name}</h2>
          <div class="modal-price-row">
            <span class="modal-price font-display">${getFormattedPrice(product.price)}</span>
            <span class="modal-tax-note font-mono">Tax Included &bull; Free Global Courier</span>
          </div>

          <p class="modal-desc">${product.description}</p>

          <div class="modal-specs-block">
            <h4 class="specs-heading font-mono">TECHNICAL SPECIFICATIONS</h4>
            <div class="specs-grid">
              ${specsHtml}
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="modal-add-btn font-mono" id="modal-add-btn" data-id="${product.id}">
              <span>ADD TO BAG &bull; ${getFormattedPrice(product.price)}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (quickviewOverlay) quickviewOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    const modalAdd = document.getElementById('modal-add-btn');
    if (modalAdd) {
      modalAdd.onclick = () => {
        addToCart(product.id, 1);
        closeQuickView();
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

    // Category pills
    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        state.activeCategory = pill.dataset.category;
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

    // Grid item delegation
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-bag-btn');
        if (addBtn) {
          addToCart(addBtn.dataset.id, 1);
          return;
        }

        const qvBtn = e.target.closest('.quick-view-btn');
        if (qvBtn) {
          openQuickView(qvBtn.dataset.id);
          return;
        }

        const imgBox = e.target.closest('.card-image-box');
        if (imgBox) {
          const card = imgBox.closest('.product-card');
          if (card) openQuickView(card.dataset.productId);
        }
      });
    }

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
    if (checkoutBtn) checkoutBtn.onclick = handleCheckout;

    // Quick View Triggers
    if (quickviewClose) quickviewClose.onclick = closeQuickView;
    if (quickviewOverlay) {
      quickviewOverlay.onclick = (e) => {
        if (e.target === quickviewOverlay) closeQuickView();
      };
    }

    // Location Selector Triggers
    if (locationTriggerBtn) locationTriggerBtn.onclick = openLocationModal;
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

    // Department drawer category clicks
    document.querySelectorAll('.dept-nav-link').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const cat = link.dataset.category;
        state.activeCategory = cat;
        updateActivePill();
        filterAndRender();

        const deptDrawer = document.getElementById('departments-drawer');
        const deptOverlay = document.getElementById('departments-drawer-overlay');
        if (deptDrawer) deptDrawer.classList.remove('open');
        if (deptOverlay) deptOverlay.classList.remove('open');
        document.body.style.overflow = '';
      };
    });

    // Hero Add Button
    if (heroAddBtn) {
      heroAddBtn.onclick = () => addToCart(PRODUCTS_DATA[0].id, 1);
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEvents);
  } else {
    initEvents();
  }
})();

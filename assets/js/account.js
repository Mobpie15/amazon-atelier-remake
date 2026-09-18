/**
 * AMAZON // ATELIER — Account, Orders & Live Logistics Telemetry
 * Real-time order tracking, concierge delivery addresses, wishlist persistence, and Prime state.
 */

(function() {
  const DEFAULT_ORDERS = [
    {
      id: "AMZN-948201",
      date: "September 18, 2026",
      product: "Leica M11 Monochrom Rangefinder",
      brand: "LEICA CAMERA",
      price: 9195,
      status: "IN FLIGHT // TRANSIT",
      statusClass: "transit",
      eta: "Today, 14:00 Express Delivery",
      carrier: "Amazon Air Logistics Flight 782",
      trackingNumber: "1Z-999-ATELIER-8492",
      origin: "Amazon Fulfilment Center DEL4 (Robotic)",
      destination: "Studio 4B, 18 Design District, New Delhi"
    },
    {
      id: "AMZN-819202",
      date: "August 28, 2026",
      product: "Braun BN0035 Classic Chronograph",
      brand: "BRAUN DESIGN",
      price: 320,
      status: "DELIVERED",
      statusClass: "delivered",
      eta: "Delivered & Signed by Concierge",
      carrier: "Prime Direct Van 42",
      trackingNumber: "1Z-777-ATELIER-1920",
      origin: "Amazon Hub Central (BOM1)",
      destination: "Studio 4B, 18 Design District, New Delhi"
    }
  ];

  function loadSavedOrders() {
    try {
      const saved = localStorage.getItem('amazon_atelier_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ORDERS;
  }

  function saveOrders(orders) {
    try {
      localStorage.setItem('amazon_atelier_orders', JSON.stringify(orders));
    } catch (e) {}
  }

  const accountData = {
    user: {
      name: "Alexander Wright",
      tier: "Atelier Executive Tier",
      email: "a.wright@atelier-arch.com",
      memberSince: "November 2021",
      primeValidThru: "December 2027"
    },
    orders: loadSavedOrders(),
    addresses: [
      { id: "addr-1", label: "PRIMARY ATELIER STUDIO", address: "Studio 4B, 18 Design District, New Delhi 110001", default: true },
      { id: "addr-2", label: "PENTHOUSE SUITE", address: "Residence 32, Sky Enclave, Mumbai 400050", default: false }
    ],
    payments: [
      { id: "pay-1", type: "Apple Pay Express", meta: "Default 1-Tap Authorization" },
      { id: "pay-2", type: "Black Titanium Card", meta: "Ending in 8842 &bull; Exp 09/29" },
      { id: "pay-3", type: "Instant UPI Direct", meta: "alexander@okicici" }
    ]
  };

  function formatPrice(usd) {
    if (window.AtelierCurrency) {
      return window.AtelierCurrency.formatPrice(usd);
    }
    return `$${usd.toLocaleString()}`;
  }

  function renderOrdersList() {
    const ordersList = document.getElementById('account-orders-list');
    if (!ordersList) return;

    if (accountData.orders.length === 0) {
      ordersList.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem; text-align: center;">
          <p class="font-mono" style="color: var(--text-muted); font-size: 0.85rem;">NO ACTIVE COMMISSIONS</p>
          <p style="font-size: 0.82rem; color: #565959; margin-top: 0.35rem;">Explore curated objects in the catalog to place your first dispatch.</p>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = accountData.orders.map(o => `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-meta-left">
            <span class="order-id font-mono">${o.id}</span>
            <span class="order-date">${o.date}</span>
          </div>
          <span class="order-status-badge ${o.statusClass || 'transit'}">${o.status}</span>
        </div>
        <div class="order-body">
          <div class="order-item-info">
            <span class="order-brand font-mono">${o.brand || 'AMAZON ATELIER'}</span>
            <h4 class="order-product-name font-display">${o.product}</h4>
            <span class="order-carrier-note font-mono">${o.carrier || 'Prime Airfreight'} &bull; ${o.trackingNumber || '1Z-999-ATELIER'}</span>
          </div>
          <div class="order-price-box font-mono">
            ${formatPrice(o.price)}
          </div>
        </div>
        <div class="order-footer">
          <span class="order-eta font-mono">${o.eta || 'Dispatched via Prime Air'}</span>
          <button type="button" class="btn-micro font-mono" data-track-id="${o.id}">TRACK DISPATCH</button>
        </div>
      </div>
    `).join('');

    ordersList.querySelectorAll('[data-track-id]').forEach(btn => {
      btn.onclick = () => {
        window.AtelierAccount.openTracking(btn.dataset.trackId);
      };
    });
  }

  function renderWishlistPane() {
    const listEl = document.getElementById('account-wishlist-list');
    const badgeEl = document.getElementById('account-wishlist-count');
    if (!listEl) return;

    let wishlistIds = [];
    try {
      wishlistIds = JSON.parse(localStorage.getItem('amazon_atelier_wishlist') || '[]');
    } catch (e) {}

    if (badgeEl) badgeEl.textContent = wishlistIds.length;

    if (wishlistIds.length === 0) {
      listEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2.5rem 1rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 0.85rem;">YOUR WISHLIST IS EMPTY</p>
          <p style="font-size: 0.82rem; color: #565959; margin-top: 0.35rem;">Tap the heart icon on any product in the catalog to save it here.</p>
        </div>
      `;
      return;
    }

    const items = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA.filter(p => wishlistIds.includes(p.id)) : [];

    listEl.innerHTML = items.map(p => `
      <div class="wishlist-item-card">
        <img src="${p.image}" alt="${p.name}" class="wishlist-item-img">
        <div class="wishlist-item-info">
          <h4 class="font-display">${p.name}</h4>
          <span class="wishlist-item-price font-display">${formatPrice(p.price)}</span>
        </div>
        <div class="wishlist-item-actions font-mono">
          <button type="button" class="btn-micro" data-wishlist-add="${p.id}">+ ADD TO CART</button>
          <button type="button" class="btn-micro" style="color: #b12704;" data-wishlist-remove="${p.id}">REMOVE</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-wishlist-add]').forEach(btn => {
      btn.onclick = () => {
        if (window.AtelierStore && window.AtelierStore.addToCart) {
          window.AtelierStore.addToCart(btn.dataset.wishlistAdd, 1);
        }
      };
    });

    listEl.querySelectorAll('[data-wishlist-remove]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.wishlistRemove;
        let ids = [];
        try {
          ids = JSON.parse(localStorage.getItem('amazon_atelier_wishlist') || '[]');
        } catch (e) {}
        ids = ids.filter(x => x !== id);
        try {
          localStorage.setItem('amazon_atelier_wishlist', JSON.stringify(ids));
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('atelier-wishlist-updated'));
        renderWishlistPane();
      };
    });
  }

  function switchTab(tabName) {
    const tabs = document.querySelectorAll('.account-tab-btn');
    const panes = document.querySelectorAll('.account-tab-pane');

    tabs.forEach(t => {
      if (t.dataset.tab === tabName) t.classList.add('active');
      else t.classList.remove('active');
    });

    panes.forEach(p => {
      if (p.id === `tab-pane-${tabName}`) p.classList.add('active');
      else p.classList.remove('active');
    });

    if (tabName === 'wishlist') {
      renderWishlistPane();
    }
  }

  function openTrackingModal(orderId) {
    const order = accountData.orders.find(o => o.id === orderId) || accountData.orders[0];
    const modal = document.getElementById('tracking-modal-overlay');
    if (!modal || !order) return;

    const titleEl = document.getElementById('tracking-order-title');
    const statusPill = document.getElementById('tracking-status-pill');
    const carrierEl = document.getElementById('track-carrier-val');
    const trackNumEl = document.getElementById('track-num-val');
    const destEl = document.getElementById('track-dest-val');

    if (titleEl) titleEl.textContent = `Dispatch Tracking: ${order.id}`;
    if (statusPill) statusPill.textContent = order.status || 'IN FLIGHT // TRANSIT';
    if (carrierEl) carrierEl.textContent = order.carrier || 'Amazon Air Logistics Flight 782';
    if (trackNumEl) trackNumEl.textContent = order.trackingNumber || '1Z-999-ATELIER-8492';
    if (destEl) destEl.textContent = order.destination || 'Studio 4B, 18 Design District, New Delhi';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTrackingModal() {
    const modal = document.getElementById('tracking-modal-overlay');
    if (modal) {
      modal.classList.remove('open');
      const accModal = document.getElementById('account-modal-overlay');
      const checkModal = document.getElementById('checkout-modal-overlay');
      if (!accModal?.classList.contains('open') && !checkModal?.classList.contains('open')) {
        document.body.style.overflow = '';
      }
    }
  }

  window.AtelierAccount = {
    data: accountData,
    openModal: function(initialTab = 'orders') {
      const modal = document.getElementById('account-modal-overlay');
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderOrdersList();
        renderWishlistPane();
        switchTab(initialTab);
      }
    },
    closeModal: function() {
      const modal = document.getElementById('account-modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    },
    addOrder: function(order) {
      accountData.orders.unshift(order);
      saveOrders(accountData.orders);
      renderOrdersList();
    },
    openTracking: openTrackingModal,
    closeTracking: closeTrackingModal,
    renderOrders: renderOrdersList,
    renderWishlist: renderWishlistPane
  };

  function initAccountUI() {
    const closeBtn = document.getElementById('account-modal-close');
    const overlay = document.getElementById('account-modal-overlay');

    if (closeBtn) closeBtn.onclick = window.AtelierAccount.closeModal;
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) window.AtelierAccount.closeModal();
      };
    }

    const tabBtns = document.querySelectorAll('.account-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // Tracking Modal Close Handlers
    const trackClose = document.getElementById('tracking-modal-close');
    const trackCloseBottom = document.getElementById('tracking-close-bottom');
    const trackOverlay = document.getElementById('tracking-modal-overlay');

    if (trackClose) trackClose.onclick = closeTrackingModal;
    if (trackCloseBottom) trackCloseBottom.onclick = closeTrackingModal;
    if (trackOverlay) {
      trackOverlay.onclick = (e) => {
        if (e.target === trackOverlay) closeTrackingModal();
      };
    }

    // Currency update listener
    window.addEventListener('atelier-currency-changed', () => {
      renderOrdersList();
      renderWishlistPane();
    });

    window.addEventListener('atelier-wishlist-updated', () => {
      renderWishlistPane();
    });

    renderOrdersList();
    renderWishlistPane();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccountUI);
  } else {
    initAccountUI();
  }
})();


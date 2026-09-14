/**
 * AMAZON // ATELIER — Account, Orders & Prime Telemetry
 * Real-time order tracking, concierge delivery addresses, and Prime membership state.
 */

(function() {
  const accountData = {
    user: {
      name: "Alexander Wright",
      tier: "Atelier Executive Tier",
      email: "a.wright@atelier-arch.com",
      memberSince: "November 2021",
      primeValidThru: "December 2027"
    },
    orders: [
      {
        id: "AMZN-948201",
        date: "September 13, 2026",
        product: "Leica M11 Monochrom Rangefinder",
        brand: "LEICA CAMERA",
        price: 9195,
        status: "IN FLIGHT // TRANSIT",
        statusClass: "transit",
        eta: "Today, 14:00 Express Delivery",
        carrier: "Amazon Air Logistics Flight 782",
        trackingNumber: "1Z-999-ATELIER-8492"
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
        trackingNumber: "1Z-777-ATELIER-1920"
      }
    ],
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

  window.AtelierAccount = {
    data: accountData,
    openModal: function(initialTab = 'orders') {
      const modal = document.getElementById('account-modal-overlay');
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        switchTab(initialTab);
      }
    },
    closeModal: function() {
      const modal = document.getElementById('account-modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  };

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
  }

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

    // Populate Orders
    const ordersList = document.getElementById('account-orders-list');
    if (ordersList) {
      ordersList.innerHTML = accountData.orders.map(o => `
        <div class="order-card">
          <div class="order-card-header">
            <div class="order-meta-left">
              <span class="order-id font-mono">${o.id}</span>
              <span class="order-date">${o.date}</span>
            </div>
            <span class="order-status-badge ${o.statusClass}">${o.status}</span>
          </div>
          <div class="order-body">
            <div class="order-item-info">
              <span class="order-brand font-mono">${o.brand}</span>
              <h4 class="order-product-name">${o.product}</h4>
              <span class="order-carrier-note font-mono">${o.carrier} &bull; ${o.trackingNumber}</span>
            </div>
            <div class="order-price-box font-mono">
              ${window.AtelierCurrency ? window.AtelierCurrency.formatPrice(o.price) : `$${o.price}`}
            </div>
          </div>
          <div class="order-footer">
            <span class="order-eta">${o.eta}</span>
            <button type="button" class="btn-micro" onclick="alert('Telemetry tracking link verified: ' + '${o.trackingNumber}')">TRACK DISPATCH</button>
          </div>
        </div>
      `).join('');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccountUI);
  } else {
    initAccountUI();
  }
})();

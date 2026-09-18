/**
 * AMAZON // ATELIER — Multi-Dimensional Filter Engine & Mega-Menu
 * Precision faceted filtering (Price, Brand, Materials, Ratings, Prime).
 * Synchronizes with store.js to filter catalog in sub-second time.
 */

(function() {
  const filterState = {
    selectedBrands: new Set(),
    selectedMaterials: new Set(),
    priceRange: 'all', // 'all', 'under500', '500to1500', '1500to5000', 'over5000'
    minPrice: null,
    maxPrice: null,
    minRating: 0,
    primeOnly: false,
    inStockOnly: false
  };

  function applyFilters(products) {
    return products.filter(p => {
      // 1. Brand filter
      if (filterState.selectedBrands.size > 0 && !filterState.selectedBrands.has(p.brand)) {
        return false;
      }

      // 2. Material filter
      if (filterState.selectedMaterials.size > 0 && !filterState.selectedMaterials.has(p.material)) {
        return false;
      }

      // 3. Price filter
      if (filterState.priceRange === 'under500' && p.price >= 500) return false;
      if (filterState.priceRange === '500to2000' && (p.price < 500 || p.price > 2000)) return false;
      if (filterState.priceRange === 'above2000' && p.price <= 2000) return false;
      if (filterState.priceRange === '500to1500' && (p.price < 500 || p.price > 1500)) return false;
      if (filterState.priceRange === '1500to5000' && (p.price < 1500 || p.price > 5000)) return false;
      if (filterState.priceRange === 'over5000' && p.price <= 5000) return false;

      if (filterState.minPrice !== null && p.price < filterState.minPrice) return false;
      if (filterState.maxPrice !== null && p.price > filterState.maxPrice) return false;

      // 4. Rating filter
      if (p.rating < filterState.minRating) return false;

      // 5. Prime only
      if (filterState.primeOnly && !p.primeExpress) return false;

      // 6. In-stock only
      if (filterState.inStockOnly && !p.inStock) return false;

      return true;
    });
  }

  function notifyFilterChange() {
    window.dispatchEvent(new CustomEvent('atelier-filters-updated', {
      detail: { filterState }
    }));
    updateFilterBadges();
  }

  function updateFilterBadges() {
    const activeFiltersContainer = document.getElementById('active-filters-bar');
    if (!activeFiltersContainer) return;

    const chips = [];

    filterState.selectedBrands.forEach(b => {
      chips.push({ label: `Brand: ${b}`, clear: () => { filterState.selectedBrands.delete(b); notifyFilterChange(); } });
    });

    filterState.selectedMaterials.forEach(m => {
      chips.push({ label: `Material: ${m}`, clear: () => { filterState.selectedMaterials.delete(m); notifyFilterChange(); } });
    });

    if (filterState.priceRange !== 'all') {
      const labels = {
        under500: 'Price: < $500',
        '500to1500': 'Price: $500 - $1.5K',
        '1500to5000': 'Price: $1.5K - $5K',
        over5000: 'Price: > $5K'
      };
      chips.push({ label: labels[filterState.priceRange], clear: () => { filterState.priceRange = 'all'; notifyFilterChange(); } });
    }

    if (filterState.primeOnly) {
      chips.push({ label: 'Prime 24h Express', clear: () => { filterState.primeOnly = false; notifyFilterChange(); } });
    }

    if (filterState.minRating > 0) {
      chips.push({ label: `${filterState.minRating}+ Stars`, clear: () => { filterState.minRating = 0; notifyFilterChange(); } });
    }

    if (chips.length === 0) {
      activeFiltersContainer.style.display = 'none';
      activeFiltersContainer.innerHTML = '';
      return;
    }

    activeFiltersContainer.style.display = 'flex';
    activeFiltersContainer.innerHTML = `
      <span class="active-filter-title font-mono">ACTIVE CRITERIA:</span>
      ${chips.map((c, i) => `
        <button type="button" class="filter-chip" data-chip-idx="${i}">
          <span>${c.label}</span>
          <span class="chip-remove">&times;</span>
        </button>
      `).join('')}
      <button type="button" class="filter-clear-all" id="clear-all-criteria">CLEAR ALL</button>
    `;

    activeFiltersContainer.querySelectorAll('.filter-chip').forEach(btn => {
      const idx = parseInt(btn.dataset.chipIdx, 10);
      btn.onclick = chips[idx].clear;
    });

    const clearAll = document.getElementById('clear-all-criteria');
    if (clearAll) {
      clearAll.onclick = () => {
        resetAllFilters();
      };
    }
  }

  function resetAllFilters() {
    filterState.selectedBrands.clear();
    filterState.selectedMaterials.clear();
    filterState.priceRange = 'all';
    filterState.minPrice = null;
    filterState.maxPrice = null;
    filterState.minRating = 0;
    filterState.primeOnly = false;
    filterState.inStockOnly = false;

    // Reset UI inputs
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.price-preset-btn').forEach(btn => {
      if (btn.dataset.preset === 'all') btn.classList.add('active');
      else btn.classList.remove('active');
    });

    notifyFilterChange();
  }

  function initFilterListeners() {
    // 1. Brands checkboxes
    const brandContainer = document.getElementById('filter-brands-list');
    if (brandContainer && typeof BRANDS_LIST !== 'undefined') {
      brandContainer.innerHTML = BRANDS_LIST.map(b => `
        <label class="filter-label-row">
          <input type="checkbox" class="filter-checkbox" data-brand="${b}">
          <span class="custom-checkbox"></span>
          <span class="filter-text">${b}</span>
        </label>
      `).join('');

      brandContainer.addEventListener('change', (e) => {
        const brand = e.target.dataset.brand;
        if (!brand) return;
        if (e.target.checked) filterState.selectedBrands.add(brand);
        else filterState.selectedBrands.delete(brand);
        notifyFilterChange();
      });
    }

    // 2. Materials checkboxes
    const matContainer = document.getElementById('filter-materials-list');
    if (matContainer && typeof MATERIALS_LIST !== 'undefined') {
      matContainer.innerHTML = MATERIALS_LIST.map(m => `
        <label class="filter-label-row">
          <input type="checkbox" class="filter-checkbox" data-material="${m}">
          <span class="custom-checkbox"></span>
          <span class="filter-text">${m}</span>
        </label>
      `).join('');

      matContainer.addEventListener('change', (e) => {
        const mat = e.target.dataset.material;
        if (!mat) return;
        if (e.target.checked) filterState.selectedMaterials.add(mat);
        else filterState.selectedMaterials.delete(mat);
        notifyFilterChange();
      });
    }

    // 3. Price Preset Buttons & Radios
    const priceBtns = document.querySelectorAll('.price-preset-btn');
    priceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        priceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterState.priceRange = btn.dataset.preset;
        notifyFilterChange();
      });
    });

    document.querySelectorAll('input[name="price-filter"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        filterState.priceRange = e.target.value;
        notifyFilterChange();
      });
    });

    // 4. Prime Toggle Switch
    const primeToggle = document.getElementById('filter-prime-toggle');
    if (primeToggle) {
      primeToggle.addEventListener('change', (e) => {
        filterState.primeOnly = e.target.checked;
        notifyFilterChange();
      });
    }

    // 5. In-Stock Switch
    const stockToggle = document.getElementById('filter-stock-toggle');
    if (stockToggle) {
      stockToggle.addEventListener('change', (e) => {
        filterState.inStockOnly = e.target.checked;
        notifyFilterChange();
      });
    }

    // 6. Rating Buttons & Radios
    const ratingBtns = document.querySelectorAll('.rating-filter-btn');
    ratingBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        ratingBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterState.minRating = parseFloat(btn.dataset.rating || 0);
        notifyFilterChange();
      });
    });

    document.querySelectorAll('input[name="rating-filter"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        filterState.minRating = parseFloat(e.target.value || 0);
        notifyFilterChange();
      });
    });

    // 7. Departments Mega Flyout Drawer
    const deptTriggers = document.querySelectorAll('#all-departments-trigger, #departments-menu-btn');
    const deptDrawer = document.getElementById('departments-drawer');
    const deptClose = document.getElementById('departments-drawer-close');
    const deptOverlay = document.getElementById('departments-drawer-overlay');

    const openDept = () => {
      if (deptDrawer) deptDrawer.classList.add('open');
      if (deptOverlay) deptOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeDept = () => {
      if (deptDrawer) deptDrawer.classList.remove('open');
      if (deptOverlay) deptOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    deptTriggers.forEach(btn => {
      if (btn) btn.onclick = openDept;
    });
    if (deptClose) deptClose.onclick = closeDept;
    if (deptOverlay) deptOverlay.onclick = closeDept;

    // Dept menu internal modal links
    const deptAccountLink = document.getElementById('dept-account-link');
    if (deptAccountLink) {
      deptAccountLink.onclick = () => {
        closeDept();
        const accModal = document.getElementById('account-modal-overlay');
        if (accModal) accModal.classList.add('open');
      };
    }

    const deptCurrencyLink = document.getElementById('dept-currency-link');
    if (deptCurrencyLink) {
      deptCurrencyLink.onclick = () => {
        closeDept();
        const currModal = document.getElementById('lang-curr-modal-overlay');
        if (currModal) currModal.classList.add('open');
      };
    }

    const deptLocationLink = document.getElementById('dept-location-link');
    if (deptLocationLink) {
      deptLocationLink.onclick = () => {
        closeDept();
        const locModal = document.getElementById('location-modal-overlay');
        if (locModal) locModal.classList.add('open');
      };
    }

    // 8. Mobile Filter Drawer & Backdrop
    const mobileFilterTrigger = document.getElementById('mobile-filter-trigger');
    const filterSidebar = document.getElementById('catalog-sidebar');
    const filterBackdrop = document.getElementById('filter-sidebar-backdrop');
    const mobileFilterClose = document.getElementById('mobile-filter-close');
    const mobileFilterApply = document.getElementById('mobile-filter-apply-btn');

    const openMobileFilter = () => {
      if (filterSidebar) filterSidebar.classList.add('mobile-open');
      if (filterBackdrop) filterBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMobileFilter = () => {
      if (filterSidebar) filterSidebar.classList.remove('mobile-open');
      if (filterBackdrop) filterBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (mobileFilterTrigger) mobileFilterTrigger.onclick = openMobileFilter;
    if (mobileFilterClose) mobileFilterClose.onclick = closeMobileFilter;
    if (mobileFilterApply) mobileFilterApply.onclick = closeMobileFilter;
    if (filterBackdrop) filterBackdrop.onclick = closeMobileFilter;

    // 9. Mobile Quick Chips Category Sync
    const quickChips = document.querySelectorAll('.quick-chip-pill');
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        quickChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.dataset.category || 'All';
        
        // Sync with desktop pills
        document.querySelectorAll('.category-pill-btn').forEach(btn => {
          if (btn.dataset.category === cat) btn.classList.add('active');
          else btn.classList.remove('active');
        });

        const catSelect = document.getElementById('header-category-select');
        if (catSelect) catSelect.value = cat;

        window.dispatchEvent(new CustomEvent('atelier-category-selected', { detail: { category: cat } }));
      });
    });
  }

  window.AtelierFilters = {
    applyFilters,
    state: filterState,
    resetAll: resetAllFilters
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilterListeners);
  } else {
    initFilterListeners();
  }
})();

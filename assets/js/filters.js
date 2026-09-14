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

    // 3. Price Preset Buttons
    const priceBtns = document.querySelectorAll('.price-preset-btn');
    priceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        priceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterState.priceRange = btn.dataset.preset;
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

    // 6. Rating Buttons
    const ratingBtns = document.querySelectorAll('.rating-filter-btn');
    ratingBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        ratingBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterState.minRating = parseFloat(btn.dataset.rating || 0);
        notifyFilterChange();
      });
    });

    // 7. Departments Mega Flyout Drawer
    const deptTrigger = document.getElementById('all-departments-trigger');
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

    if (deptTrigger) deptTrigger.onclick = openDept;
    if (deptClose) deptClose.onclick = closeDept;
    if (deptOverlay) deptOverlay.onclick = closeDept;

    // Mobile Filter Drawer
    const mobileFilterTrigger = document.getElementById('mobile-filter-trigger');
    const filterSidebar = document.getElementById('catalog-sidebar');
    if (mobileFilterTrigger && filterSidebar) {
      mobileFilterTrigger.onclick = () => {
        filterSidebar.classList.toggle('mobile-open');
      };
    }
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

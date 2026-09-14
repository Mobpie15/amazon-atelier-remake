/**
 * AMAZON // ATELIER — Dedicated Mobile Experience Controller
 * - Full bi-directional search synchronization between mobile bar & catalog
 * - Native Mobile Bottom Navigation Dock (Shop, Depts, Filters, Account, Bag)
 * - Mobile Filter Bottom Sheet with smooth touch sliding
 * - Synchronized live badge counts and modal triggers
 */

(function() {
  'use strict';

  // 1. MOBILE SEARCH SYNC
  function initMobileSearch() {
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const desktopSearchInput = document.getElementById('search-input');
    const mobileSearchClear = document.getElementById('mobile-search-clear');

    if (!mobileSearchInput) return;

    mobileSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (desktopSearchInput) {
        desktopSearchInput.value = val;
        desktopSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (mobileSearchClear) {
        mobileSearchClear.style.display = val.length > 0 ? 'flex' : 'none';
      }
    });

    if (mobileSearchClear) {
      mobileSearchClear.addEventListener('click', () => {
        mobileSearchInput.value = '';
        mobileSearchClear.style.display = 'none';
        if (desktopSearchInput) {
          desktopSearchInput.value = '';
          desktopSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }

    // Sync from desktop to mobile if needed
    if (desktopSearchInput) {
      desktopSearchInput.addEventListener('input', (e) => {
        if (mobileSearchInput.value !== e.target.value) {
          mobileSearchInput.value = e.target.value;
          if (mobileSearchClear) {
            mobileSearchClear.style.display = e.target.value.length > 0 ? 'flex' : 'none';
          }
        }
      });
    }
  }

  // 2. MOBILE CATEGORY CAROUSEL PILLS
  function initMobileCategoryPills() {
    const mobilePills = document.querySelectorAll('.mobile-cat-pill');
    const desktopPills = document.querySelectorAll('.category-pill');

    mobilePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category');

        mobilePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        // Trigger corresponding desktop pill
        desktopPills.forEach(dp => {
          if (dp.getAttribute('data-category') === cat) {
            dp.click();
          }
        });

        // Scroll catalog into view smoothly on mobile
        const catalogSec = document.querySelector('.catalog-section');
        if (catalogSec) {
          const top = catalogSec.getBoundingClientRect().top + window.pageYOffset - 120;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // Synchronize when desktop category changes
    desktopPills.forEach(dp => {
      dp.addEventListener('click', () => {
        const cat = dp.getAttribute('data-category');
        mobilePills.forEach(mp => {
          if (mp.getAttribute('data-category') === cat) {
            mp.classList.add('active');
            mp.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } else {
            mp.classList.remove('active');
          }
        });
      });
    });
  }

  // 3. MOBILE BOTTOM NAVIGATION DOCK
  function initBottomNav() {
    const navItems = document.querySelectorAll('.mobile-nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');

        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (action === 'shop') {
          const catalog = document.querySelector('.catalog-section') || document.body;
          const top = catalog.getBoundingClientRect().top + window.pageYOffset - 110;
          window.scrollTo({ top, behavior: 'smooth' });
        } else if (action === 'departments') {
          const trigger = document.getElementById('all-departments-trigger');
          if (trigger) trigger.click();
        } else if (action === 'filters') {
          openMobileFilterSheet();
        } else if (action === 'account') {
          if (window.AtelierAccount) {
            window.AtelierAccount.openModal('profile');
          } else {
            const accBtn = document.getElementById('account-trigger-btn');
            if (accBtn) accBtn.click();
          }
        } else if (action === 'bag') {
          const cartBtn = document.getElementById('cart-trigger-btn');
          if (cartBtn) cartBtn.click();
        }
      });
    });
  }

  // 4. MOBILE BOTTOM SHEET FILTER DRAWER
  function openMobileFilterSheet() {
    const sheet = document.getElementById('mobile-filter-sheet');
    const overlay = document.getElementById('mobile-filter-overlay');
    if (!sheet || !overlay) return;

    populateMobileFilterLists();
    sheet.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileFilterSheet() {
    const sheet = document.getElementById('mobile-filter-sheet');
    const overlay = document.getElementById('mobile-filter-overlay');
    if (!sheet || !overlay) return;

    sheet.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function populateMobileFilterLists() {
    // Clone brands from desktop sidebar if empty
    const desktopBrands = document.getElementById('filter-brands-list');
    const mobileBrands = document.getElementById('mobile-brands-list');
    if (desktopBrands && mobileBrands && mobileBrands.children.length === 0) {
      mobileBrands.innerHTML = desktopBrands.innerHTML;
      // Reattach change listeners
      mobileBrands.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const targetBrand = e.target.value;
          // Sync with desktop checkbox
          const dtCb = desktopBrands.querySelector(`input[value="${targetBrand}"]`);
          if (dtCb) {
            dtCb.checked = e.target.checked;
            dtCb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    }

    // Clone materials
    const desktopMaterials = document.getElementById('filter-materials-list');
    const mobileMaterials = document.getElementById('mobile-materials-list');
    if (desktopMaterials && mobileMaterials && mobileMaterials.children.length === 0) {
      mobileMaterials.innerHTML = desktopMaterials.innerHTML;
      mobileMaterials.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const targetMat = e.target.value;
          const dtCb = desktopMaterials.querySelector(`input[value="${targetMat}"]`);
          if (dtCb) {
            dtCb.checked = e.target.checked;
            dtCb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    }

    // Sync Prime & Stock toggles
    const dtPrime = document.getElementById('filter-prime-toggle');
    const mbPrime = document.getElementById('mobile-filter-prime');
    if (dtPrime && mbPrime) mbPrime.checked = dtPrime.checked;

    const dtStock = document.getElementById('filter-stock-toggle');
    const mbStock = document.getElementById('mobile-filter-stock');
    if (dtStock && mbStock) mbStock.checked = dtStock.checked;
  }

  function initMobileFilterSheet() {
    const sheet = document.getElementById('mobile-filter-sheet');
    const overlay = document.getElementById('mobile-filter-overlay');
    const closeBtn = document.getElementById('mobile-filter-close');
    const resetBtn = document.getElementById('mobile-filter-reset');
    const applyBtn = document.getElementById('mobile-filter-apply');
    const mobileTrigger = document.getElementById('mobile-filter-trigger');

    if (mobileTrigger) {
      mobileTrigger.onclick = (e) => {
        e.preventDefault();
        openMobileFilterSheet();
      };
    }

    if (closeBtn) closeBtn.onclick = closeMobileFilterSheet;
    if (overlay) overlay.onclick = closeMobileFilterSheet;

    if (resetBtn) {
      resetBtn.onclick = () => {
        if (window.AtelierFilters) window.AtelierFilters.resetAll();
        // Reset mobile UI inputs
        const mbPrime = document.getElementById('mobile-filter-prime');
        if (mbPrime) mbPrime.checked = false;
        const mbStock = document.getElementById('mobile-filter-stock');
        if (mbStock) mbStock.checked = false;
        document.querySelectorAll('.mobile-preset-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.preset === 'all');
        });
        document.querySelectorAll('#mobile-brands-list input, #mobile-materials-list input').forEach(cb => {
          cb.checked = false;
        });
        closeMobileFilterSheet();
      };
    }

    if (applyBtn) {
      applyBtn.onclick = () => {
        closeMobileFilterSheet();
        const catalogSec = document.querySelector('.catalog-section');
        if (catalogSec) {
          const top = catalogSec.getBoundingClientRect().top + window.pageYOffset - 110;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      };
    }

    // Mobile Price Presets
    const mobilePriceBtns = document.querySelectorAll('.mobile-preset-btn');
    mobilePriceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mobilePriceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.getAttribute('data-preset');

        // Trigger corresponding desktop button
        const dtBtn = document.querySelector(`.price-preset-btn[data-preset="${preset}"]`);
        if (dtBtn) dtBtn.click();
      });
    });

    // Mobile Prime & Stock Switches
    const mbPrime = document.getElementById('mobile-filter-prime');
    if (mbPrime) {
      mbPrime.addEventListener('change', (e) => {
        const dtPrime = document.getElementById('filter-prime-toggle');
        if (dtPrime) {
          dtPrime.checked = e.target.checked;
          dtPrime.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    const mbStock = document.getElementById('mobile-filter-stock');
    if (mbStock) {
      mbStock.addEventListener('change', (e) => {
        const dtStock = document.getElementById('filter-stock-toggle');
        if (dtStock) {
          dtStock.checked = e.target.checked;
          dtStock.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  }

  // 5. MOBILE HEADER BUTTON TRIGGERS
  function initMobileHeaderTriggers() {
    // Menu trigger
    const menuBtn = document.getElementById('mobile-menu-trigger');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        const dtTrigger = document.getElementById('all-departments-trigger');
        if (dtTrigger) dtTrigger.click();
      });
    }

    // Location trigger
    const locBtn = document.getElementById('mobile-location-btn');
    if (locBtn) {
      locBtn.addEventListener('click', () => {
        const dtLoc = document.getElementById('location-trigger-btn');
        if (dtLoc) dtLoc.click();
      });
    }

    // Currency trigger
    const currBtn = document.getElementById('mobile-currency-btn');
    if (currBtn) {
      currBtn.addEventListener('click', () => {
        const dtCurr = document.getElementById('lang-curr-trigger-btn');
        if (dtCurr) dtCurr.click();
      });
    }

    // Cart trigger
    const cartBtn = document.getElementById('mobile-cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        const dtCart = document.getElementById('cart-trigger-btn');
        if (dtCart) dtCart.click();
      });
    }
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMobileSearch();
      initMobileCategoryPills();
      initBottomNav();
      initMobileFilterSheet();
      initMobileHeaderTriggers();
    });
  } else {
    initMobileSearch();
    initMobileCategoryPills();
    initBottomNav();
    initMobileFilterSheet();
    initMobileHeaderTriggers();
  }
})();

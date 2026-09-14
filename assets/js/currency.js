/**
 * AMAZON // ATELIER — Multi-Currency & Localization Engine
 * Real-time dynamic price conversion across USD, EUR, GBP, INR, JPY.
 * Zero reload, dispatched reactively to catalog, hero, and cart.
 */

(function() {
  const CURRENCY_CONFIG = {
    USD: { code: 'USD', symbol: '$', rate: 1.0, decimals: 0, label: 'USD ($) - US Dollar' },
    EUR: { code: 'EUR', symbol: '€', rate: 0.92, decimals: 0, label: 'EUR (€) - Eurozone' },
    GBP: { code: 'GBP', symbol: '£', rate: 0.79, decimals: 0, label: 'GBP (£) - British Pound' },
    INR: { code: 'INR', symbol: '₹', rate: 83.5, decimals: 0, label: 'INR (₹) - Indian Rupee' },
    JPY: { code: 'JPY', symbol: '¥', rate: 155.0, decimals: 0, label: 'JPY (¥) - Japanese Yen' }
  };

  const LANGUAGES = {
    EN: { code: 'EN', name: 'English', sub: 'United States' },
    DE: { code: 'DE', name: 'Deutsch', sub: 'Deutschland' },
    FR: { code: 'FR', name: 'Français', sub: 'France' },
    JA: { code: 'JA', name: '日本語', sub: '日本' },
    HI: { code: 'HI', name: 'हिन्दी', sub: 'भारत' }
  };

  let activeCurrency = 'USD';
  let activeLanguage = 'EN';

  function formatPrice(usdAmount) {
    const conf = CURRENCY_CONFIG[activeCurrency] || CURRENCY_CONFIG.USD;
    const converted = usdAmount * conf.rate;
    const rounded = Math.round(converted);
    return `${conf.symbol}${rounded.toLocaleString()}`;
  }

  function setCurrency(code) {
    if (!CURRENCY_CONFIG[code]) return;
    activeCurrency = code;
    updateUI();
    window.dispatchEvent(new CustomEvent('atelier-currency-changed', {
      detail: { currency: code, ...CURRENCY_CONFIG[code] }
    }));
  }

  function setLanguage(code) {
    if (!LANGUAGES[code]) return;
    activeLanguage = code;
    updateUI();
  }

  function updateUI() {
    const currLabels = document.querySelectorAll('.active-currency-code');
    currLabels.forEach(el => el.textContent = activeCurrency);

    const langLabels = document.querySelectorAll('.active-language-code');
    langLabels.forEach(el => el.textContent = activeLanguage);
  }

  window.AtelierCurrency = {
    formatPrice,
    setCurrency,
    setLanguage,
    getCurrency: () => activeCurrency,
    getLanguage: () => activeLanguage,
    config: CURRENCY_CONFIG,
    languages: LANGUAGES
  };
})();

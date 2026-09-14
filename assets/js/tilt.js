/**
 * AMAZON // ATELIER — 3D Parallax Card Physics & Glare
 * Realistic tactile tilt on product cards and hero spotlight.
 */

(function() {
  function initTilt() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const cards = document.querySelectorAll('.product-card, .hero-spotlight');

    cards.forEach(card => {
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }

      card.onmousemove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)`;
        glare.style.opacity = '1';
      };

      card.onmouseleave = () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        card.style.transition = 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)';
        glare.style.opacity = '0';

        setTimeout(() => {
          card.style.transition = '';
        }, 400);
      };

      card.onmouseenter = () => {
        card.style.transition = 'transform 100ms ease';
      };
    });
  }

  window.initCardTilt = initTilt;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTilt);
  } else {
    initTilt();
  }
})();

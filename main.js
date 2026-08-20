/**
 * FORLIFE COM' — main.js
 * Navigation, animations, scroll effects, counters
 */

'use strict';

/* ============================================================
   1. NAVIGATION
   ============================================================ */
(function initNav() {
  const nav        = document.querySelector('.nav');
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks   = document.querySelectorAll('.nav-link');

  if (!nav) return;

  // Solid nav on scroll (transparent on light-bg pages)
  const isLightPage = document.body.classList.contains('light-page');
  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.remove('nav--transparent');
      nav.classList.add(isLightPage ? 'nav--light' : 'nav--solid');
    } else {
      nav.classList.remove('nav--solid', 'nav--light');
      nav.classList.add('nav--transparent');
    }
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    // Close on link click
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link based on current page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ============================================================
   2. INTERSECTION OBSERVER — Reveal animations
   ============================================================ */
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
})();

/* ============================================================
   3. ANIMATED COUNTERS
   ============================================================ */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = parseInt(el.dataset.duration || 2000, 10);
  const suffix   = el.dataset.suffix || '';
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quart
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   4. BACK TO TOP
   ============================================================ */
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   5. TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = 'default', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    default: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `${icons[type] || icons.default} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Expose globally
window.showToast = showToast;

/* ============================================================
   6. HERO TYPEWRITER EFFECT
   ============================================================ */
(function initTypewriter() {
  const el = document.querySelector('[data-typewriter]');
  if (!el) return;

  const words   = JSON.parse(el.dataset.typewriter || '[]');
  if (!words.length) return;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = null;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      el.textContent = currentWord.slice(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentWord.slice(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 60 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 400;
    }

    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(type, delay);
  }

  // Start after a short delay
  setTimeout(type, 800);
})();

/* ============================================================
   7. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    
    // Update active class if it's a services nav link
    if (anchor.classList.contains('services-nav-link')) {
      document.querySelectorAll('.services-nav-link').forEach(link => link.classList.remove('active'));
      anchor.classList.add('active');
    }
    
    const navHeight = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height'), 10) || 80;
    
    // For services page, we also need to account for the sticky nav height (around 60px)
    const extraOffset = document.querySelector('.services-nav-wrapper') ? 60 : 16;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - extraOffset;
    
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   8. LAZY LOAD IMAGES
   ============================================================ */
(function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  images.forEach(img => observer.observe(img));
})();

/* ============================================================
   9. SCROLL PROGRESS BAR (for articles/long pages)
   ============================================================ */
(function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${(window.scrollY / docHeight) * 100}%`;
  }, { passive: true });
})();

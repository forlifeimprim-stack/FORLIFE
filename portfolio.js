/**
 * Portfolio page functionality: Filtering, Lightbox, and Lazy Loading
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Elements
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const emptyState = document.querySelector('.portfolio-empty');
  
  // Lightbox elements
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  
  let currentImageIndex = 0;
  let visibleItems = Array.from(portfolioItems);

  // 2. Lazy Loading for Portfolio Images
  const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.portfolio-img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  };
  
  lazyLoadImages();

  // 3. Filtering logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      
      let count = 0;
      
      // Animate items out
      portfolioItems.forEach(item => {
        item.classList.remove('animate-in');
        item.classList.add('animate-out');
      });

      setTimeout(() => {
        visibleItems = [];
        portfolioItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          
          if (filterValue === 'all' || itemCategory === filterValue) {
            item.classList.remove('hidden', 'animate-out');
            // Trigger reflow
            void item.offsetWidth;
            item.classList.add('animate-in');
            visibleItems.push(item);
            count++;
          } else {
            item.classList.add('hidden');
          }
        });

        // Toggle empty state
        if (count === 0) {
          if (emptyState) emptyState.classList.add('active');
        } else {
          if (emptyState) emptyState.classList.remove('active');
        }
      }, 300); // Wait for animate-out transition
    });
  });

  // 4. Lightbox logic
  const openLightbox = (index) => {
    currentImageIndex = index;
    const item = visibleItems[index];
    if (!item) return;

    const img = item.querySelector('.portfolio-img');
    const title = item.querySelector('.portfolio-item-title').textContent;
    
    // Get original source or fallback to current src if lazy loaded
    const imgSrc = img.getAttribute('data-src') || img.src;
    
    lightboxImg.src = imgSrc;
    lightboxTitle.textContent = title;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const showNext = () => {
    if (visibleItems.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % visibleItems.length;
    openLightbox(currentImageIndex);
  };

  const showPrev = () => {
    if (visibleItems.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + visibleItems.length) % visibleItems.length;
    openLightbox(currentImageIndex);
  };

  // Event Listeners for Portfolio Items
  portfolioItems.forEach((item) => {
    item.addEventListener('click', () => {
      // Find index in currently visible items
      const index = visibleItems.indexOf(item);
      if (index !== -1) {
        openLightbox(index);
      }
    });
  });

  // Lightbox controls
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });
  
  // Close on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
});

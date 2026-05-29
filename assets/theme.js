/* ============================================================
   LUMIÈRE — Luxury Perfume Theme
   theme.js | v1.0.0
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     Header: sticky scroll shadow
  -------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.getElementById('SiteHeader');
    if (!header) return;
    var threshold = 20;

    function onScroll() {
      if (window.scrollY > threshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------
     Mobile Menu + Accordion submenus
  -------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav    = document.querySelector('.mobile-nav');
    if (!toggle || !nav) return;

    function closeDrawer() {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    /* Hamburger / close drawer */
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close drawer when a leaf link is tapped */
    nav.querySelectorAll('.mobile-nav-link, .mobile-nav-submenu-link').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });

    /* ── Accordion toggles ── */
    nav.querySelectorAll('.mobile-nav-accordion-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row      = btn.closest('.mobile-nav-accordion');
        var submenu  = row.querySelector('.mobile-nav-submenu');
        var expanded = btn.getAttribute('aria-expanded') === 'true';

        /* Collapse all other open accordions */
        nav.querySelectorAll('.mobile-nav-accordion-toggle').forEach(function (other) {
          if (other === btn) return;
          other.setAttribute('aria-expanded', 'false');
          var otherSub = other.closest('.mobile-nav-accordion').querySelector('.mobile-nav-submenu');
          if (otherSub) otherSub.hidden = true;
        });

        /* Toggle this one */
        btn.setAttribute('aria-expanded', String(!expanded));
        submenu.hidden = expanded;
      });
    });

    /* Escape closes drawer */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* --------------------------------------------------------
     Desktop Dropdown — keyboard accessibility
  -------------------------------------------------------- */
  function initDropdowns() {
    var items = document.querySelectorAll('.nav-item.has-dropdown');
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger  = item.querySelector('.nav-link');
      var dropdown = item.querySelector('.nav-dropdown');
      if (!trigger || !dropdown) return;

      /* Update aria-expanded to mirror CSS :hover/:focus-within */
      item.addEventListener('mouseenter', function () {
        trigger.setAttribute('aria-expanded', 'true');
      });
      item.addEventListener('mouseleave', function () {
        trigger.setAttribute('aria-expanded', 'false');
      });

      /* Enter / Space open dropdown; Escape closes it */
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var open = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', String(!open));
          /* Force visibility through a class so keyboard can open without hover */
          item.classList.toggle('dropdown-open', !open);
          if (!open) {
            var first = dropdown.querySelector('.nav-dropdown-link');
            if (first) first.focus();
          }
        }
        if (e.key === 'Escape') {
          trigger.setAttribute('aria-expanded', 'false');
          item.classList.remove('dropdown-open');
          trigger.focus();
        }
      });

      /* Arrow keys cycle through dropdown links */
      dropdown.addEventListener('keydown', function (e) {
        var links = Array.from(dropdown.querySelectorAll('.nav-dropdown-link'));
        var idx   = links.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          links[(idx + 1) % links.length].focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          links[(idx - 1 + links.length) % links.length].focus();
        }
        if (e.key === 'Escape' || e.key === 'Tab') {
          trigger.setAttribute('aria-expanded', 'false');
          item.classList.remove('dropdown-open');
          trigger.focus();
        }
      });

      /* Close on outside click */
      document.addEventListener('click', function (e) {
        if (!item.contains(e.target)) {
          trigger.setAttribute('aria-expanded', 'false');
          item.classList.remove('dropdown-open');
        }
      });
    });
  }

  /* --------------------------------------------------------
     Scroll Animations (IntersectionObserver)
  -------------------------------------------------------- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('animated'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(function () {
          entry.target.classList.add('animated');
        }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------------
     Vibe Slider
  -------------------------------------------------------- */
  function initVibeSlider() {
    var container = document.querySelector('.vibe-slider-outer');
    if (!container) return;

    var clip    = container.querySelector('.vibe-slider-clip');
    var track   = container.querySelector('.vibe-track');
    var prevBtn = container.querySelector('.slider-btn.prev');
    var nextBtn = container.querySelector('.slider-btn.next');
    var dots    = container.querySelectorAll('.slider-dot');

    if (!track) return;

    var cards       = track.querySelectorAll('.vibe-card');
    var idx         = 0;
    var cardW       = 0;
    var gap         = 0;
    var visible     = 1;
    var max         = 0;
    var autoTimer   = null;

    function measure() {
      if (!cards.length) return;
      var style  = window.getComputedStyle(track);
      gap        = parseFloat(style.gap) || 20;
      cardW      = cards[0].offsetWidth + gap;
      visible    = Math.max(1, Math.floor(clip.offsetWidth / cardW));
      max        = Math.max(0, cards.length - visible);
      idx        = Math.min(idx, max);
      render();
    }

    function render() {
      track.style.transform = 'translateX(-' + (idx * cardW) + 'px)';
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === idx);
      });
    }

    function next() {
      idx = idx >= max ? 0 : idx + 1;
      render();
    }

    function prev() {
      idx = idx <= 0 ? max : idx - 1;
      render();
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, 4000);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAuto(); });

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        idx = Math.min(i, max);
        render();
        startAuto();
      });
    });

    /* Touch swipe */
    var touchStart = 0;
    track.addEventListener('touchstart', function (e) {
      touchStart = e.changedTouches[0].clientX;
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var diff = touchStart - e.changedTouches[0].clientX;
      if (diff > 40) next();
      else if (diff < -40) prev();
      startAuto();
    }, { passive: true });

    /* Pause on hover */
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    measure();
    window.addEventListener('resize', measure);
    startAuto();
  }

  /* --------------------------------------------------------
     Quick Add / Add to Cart (AJAX)
     — Single-variant: AJAX add directly.
     — Multi-variant:  redirect to product page.
  -------------------------------------------------------- */
  function initAddToCart() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.product-quick-add-btn');
      if (!btn || btn.disabled) return;

      var variantId   = btn.dataset.variantId;
      var hasVariants = parseInt(btn.dataset.hasVariants || '0', 10);
      var productUrl  = btn.dataset.productUrl;

      if (!variantId) return;

      /* Multi-variant: send to product page so customer can choose */
      if (hasVariants > 0) {
        window.location.href = productUrl || '/products/' + variantId;
        return;
      }

      /* Single-variant: AJAX add */
      var originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg> Adding…';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.id) {
            btn.innerHTML = '✓ Added';
            btn.style.background = 'var(--color-primary)';
            refreshCartCount();
            setTimeout(function () {
              btn.innerHTML = originalHtml;
              btn.style.background = '';
              btn.disabled = false;
            }, 2200);
          } else {
            throw data;
          }
        })
        .catch(function () {
          btn.innerHTML = originalHtml;
          btn.disabled = false;
        });
    });
  }

  /* --------------------------------------------------------
     Cart Count Badge
  -------------------------------------------------------- */
  function refreshCartCount() {
    fetch('/cart.js', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var badge = document.querySelector('.cart-count');
        if (!badge) return;
        var count = cart.item_count || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      })
      .catch(function () {});
  }

  /* --------------------------------------------------------
     Newsletter Form
  -------------------------------------------------------- */
  function initNewsletterForm() {
    var form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('.newsletter-input');
      var btn   = form.querySelector('.newsletter-btn');
      var email = input && input.value.trim();
      if (!email) return;

      btn.disabled = true;
      btn.textContent = 'Subscribing…';

      var formData = new FormData();
      formData.append('contact[email]', email);
      formData.append('form_type', 'customer');
      formData.append('utf8', '✓');

      fetch('/', { method: 'POST', body: formData, headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function () {
          btn.textContent = 'Subscribed ✓';
          input.value = '';
          setTimeout(function () {
            btn.textContent = 'Subscribe';
            btn.disabled = false;
          }, 3500);
        })
        .catch(function () {
          btn.textContent = 'Subscribe';
          btn.disabled = false;
        });
    });
  }

  /* --------------------------------------------------------
     Boot
  -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMobileMenu();
    initDropdowns();
    initScrollAnimations();
    initVibeSlider();
    initAddToCart();
    initNewsletterForm();
    refreshCartCount();
  });

})();

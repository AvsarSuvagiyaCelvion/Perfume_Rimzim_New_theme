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
     Scroll Animations (IntersectionObserver) — legacy elements
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
        setTimeout(function () { entry.target.classList.add('animated'); }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------------
     Text Animations
     — Word-split scroll reveal for all .section-title elements
     — Slide-left reveal for all .section-label elements
     — Slide-up reveal for all .section-subtitle elements
     — Same treatment for .col-header-title on collection pages
  -------------------------------------------------------- */
  function initTextAnimations() {
    /* Skip if user prefers reduced motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    /* ── 1. Word-split ── */
    var splitTitles = document.querySelectorAll(
      '.section-title, .col-header-title, [data-anim="split"]'
    );

    splitTitles.forEach(function (el) {
      el.classList.add('t-split-title');

      /* Bail if already split (e.g. page cached) */
      if (el.querySelector('.t-split-word')) return;

      /* Gather raw text, preserving child HTML (e.g. <em>) */
      var nodes      = Array.from(el.childNodes);
      var baseDelay  = 80; /* ms between words */
      var wordIndex  = 0;
      var fragment   = document.createDocumentFragment();

      nodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          /* Split text nodes into individual word spans */
          var words = node.textContent.split(/(\s+)/);
          words.forEach(function (chunk) {
            if (/^\s+$/.test(chunk)) {
              /* Preserve whitespace as-is */
              fragment.appendChild(document.createTextNode(chunk));
            } else if (chunk.length) {
              var span = document.createElement('span');
              span.className = 't-split-word';
              span.style.setProperty('--td', (wordIndex * baseDelay) + 'ms');
              span.textContent = chunk;
              fragment.appendChild(span);
              wordIndex++;
            }
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          /* Wrap element children (em, strong, etc.) as a unit */
          var wrapper = document.createElement('span');
          wrapper.className = 't-split-word';
          wrapper.style.setProperty('--td', (wordIndex * baseDelay) + 'ms');
          wrapper.appendChild(node.cloneNode(true));
          fragment.appendChild(wrapper);
          wordIndex++;
        }
      });

      el.innerHTML = '';
      el.appendChild(fragment);
    });

    /* ── 2. Label slide-left ── */
    document.querySelectorAll('.section-label').forEach(function (el) {
      el.classList.add('t-label-reveal');
    });

    /* ── 3. Subtitle fade-up ── */
    document.querySelectorAll('.section-subtitle').forEach(function (el) {
      el.classList.add('t-subtitle-reveal');
      /* Fire after the last word of the sibling title */
      var header = el.closest('.section-header');
      if (header) {
        var title = header.querySelector('.t-split-title');
        var wordCount = title ? title.querySelectorAll('.t-split-word').length : 0;
        el.style.setProperty('--td', (wordCount * 80 + 100) + 'ms');
      }
    });

    /* ── 4. IntersectionObserver to trigger all of the above ── */
    var textObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        if (el.classList.contains('t-split-title')) {
          el.classList.add('t-split-title--active');
        }
        if (el.classList.contains('t-label-reveal')) {
          el.classList.add('t-label-reveal--active');
        }
        if (el.classList.contains('t-subtitle-reveal')) {
          el.classList.add('t-subtitle-reveal--active');
        }
        textObserver.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll(
      '.t-split-title, .t-label-reveal, .t-subtitle-reveal'
    ).forEach(function (el) {
      textObserver.observe(el);
    });
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
    /* Debounce resize so CSS breakpoint changes have time to apply */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 120);
    });
    startAuto();
  }

  /* --------------------------------------------------------
     Quick Add / Add to Cart (AJAX)
     — Single-variant: AJAX add directly.
     — Multi-variant:  redirect to product page.
  -------------------------------------------------------- */
  function initAddToCart() {
    document.addEventListener('click', function (e) {
      /* ── New Arrivals: simple Add to Cart button ── */
      var atcBtn = e.target.closest('.product-card-atc');
      if (atcBtn && !atcBtn.disabled) {
        var variantId = atcBtn.dataset.variantId;
        if (!variantId) return;
        var original = atcBtn.textContent.trim();
        atcBtn.disabled = true;
        atcBtn.textContent = 'Adding…';
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 })
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.id) {
              atcBtn.textContent = 'Added ✓';
              refreshCartCount();
              setTimeout(function () {
                atcBtn.textContent = original;
                atcBtn.disabled = false;
              }, 2000);
            } else { throw data; }
          })
          .catch(function () {
            atcBtn.textContent = original;
            atcBtn.disabled = false;
          });
        return;
      }

      /* ── Collection page: Quick Add overlay button ── */
      var btn = e.target.closest('.product-quick-add-btn');
      if (!btn || btn.disabled) return;

      var variantId   = btn.dataset.variantId;
      var hasVariants = parseInt(btn.dataset.hasVariants || '0', 10);
      var productUrl  = btn.dataset.productUrl;
      if (!variantId) return;

      if (hasVariants > 0) {
        window.location.href = productUrl || '/products/' + variantId;
        return;
      }

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
          } else { throw data; }
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
     Scroll to Top
  -------------------------------------------------------- */
  function initScrollToTop() {
    var btn = document.getElementById('ScrollToTop');
    if (!btn) return;

    var threshold = 400;

    function onScroll() {
      if (window.scrollY > threshold) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* run once on load in case page is already scrolled */

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------
     Boot
  -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMobileMenu();
    initDropdowns();
    initTextAnimations();   /* word-split + scroll reveals */
    initScrollAnimations(); /* legacy .animate-on-scroll */
    initVibeSlider();
    initAddToCart();
    initNewsletterForm();
    refreshCartCount();
    initScrollToTop();
  });

})();

/* ============================================================
   PDP — auto-init on DOMContentLoaded
   ============================================================ */
(function () {
  'use strict';

  /* --------------------------------------------------------
     Gallery thumbnails
  -------------------------------------------------------- */
  function initPdpGallery() {
    var thumbs   = document.querySelectorAll('.pdp-thumb');
    var mainImg  = document.getElementById('PdpMainImage');
    if (!thumbs.length || !mainImg) return;

    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        btn.classList.add('active');
        mainImg.src     = btn.dataset.fullSrc;
        mainImg.srcset  = btn.dataset.srcset || '';
      });
    });
  }

  /* --------------------------------------------------------
     Variant option buttons → update hidden input + price
  -------------------------------------------------------- */
  function initPdpVariants() {
    var section = document.getElementById('ProductSection');
    if (!section) return;

    var productDataEl = document.getElementById('ProductJSON');
    var moneyFmtEl    = document.getElementById('MoneyFormat');
    if (!productDataEl) return;

    var product   = JSON.parse(productDataEl.textContent);
    var moneyFmt  = moneyFmtEl ? JSON.parse(moneyFmtEl.textContent) : '{{amount}}';
    var variants  = product.variants;

    /* Track selected options */
    var selected = {};
    section.querySelectorAll('.pdp-option').forEach(function (optEl) {
      var idx = parseInt(optEl.dataset.optionIndex, 10);
      var active = optEl.querySelector('.pdp-option-btn.active');
      if (active) selected[idx] = active.dataset.optionVal;
    });

    section.querySelectorAll('.pdp-option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var optEl = btn.closest('.pdp-option');
        var idx   = parseInt(optEl.dataset.optionIndex, 10);

        /* Update active state */
        optEl.querySelectorAll('.pdp-option-btn').forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        selected[idx] = btn.dataset.optionVal;

        /* Update label */
        var label = optEl.querySelector('.pdp-option-value');
        if (label) label.textContent = btn.dataset.optionVal;

        /* Find matching variant */
        var match = variants.find(function (v) {
          return Object.keys(selected).every(function (i) {
            return v['option' + (parseInt(i, 10) + 1)] === selected[i];
          });
        });

        if (!match) return;

        /* Update hidden variant ID */
        var idInput = document.getElementById('PdpVariantId');
        if (idInput) idInput.value = match.id;

        /* Update price */
        updatePrice(match, moneyFmt);

        /* Update ATC button */
        var atcBtn = document.getElementById('PdpATC');
        if (atcBtn) {
          atcBtn.disabled = !match.available;
          atcBtn.querySelector('span') && (atcBtn.querySelector('span').textContent = match.available ? 'Add to Cart' : 'Sold Out');
        }

        /* Update availability */
        var avail = document.getElementById('PdpAvailability');
        if (avail) {
          avail.innerHTML = match.available
            ? '<span class="pdp-in-stock"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> In Stock</span>'
            : '<span class="pdp-out-stock">Currently Unavailable</span>';
        }
      });
    });
  }

  function formatMoney(cents, fmt) {
    var amount = (cents / 100).toFixed(2);
    return fmt.replace('{{amount}}', amount)
              .replace('{{amount_no_decimals}}', Math.round(cents / 100))
              .replace('{{amount_with_comma_separator}}', amount.replace('.', ','));
  }

  function updatePrice(variant, fmt) {
    var wrap = document.getElementById('PdpPrice');
    if (!wrap) return;
    var html = '';
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      html += '<s class="pdp-price-compare">' + formatMoney(variant.compare_at_price, fmt) + '</s>';
      html += '<span class="pdp-price-current pdp-price-sale">' + formatMoney(variant.price, fmt) + '</span>';
    } else {
      html += '<span class="pdp-price-current">' + formatMoney(variant.price, fmt) + '</span>';
    }
    wrap.innerHTML = html;
  }

  /* --------------------------------------------------------
     Quantity stepper
  -------------------------------------------------------- */
  function initPdpQty() {
    var input   = document.getElementById('PdpQty');
    var minusBtn = document.querySelector('.pdp-qty-minus');
    var plusBtn  = document.querySelector('.pdp-qty-plus');
    if (!input) return;

    if (minusBtn) {
      minusBtn.addEventListener('click', function () {
        var v = parseInt(input.value, 10) || 1;
        if (v > 1) input.value = v - 1;
      });
    }
    if (plusBtn) {
      plusBtn.addEventListener('click', function () {
        var v = parseInt(input.value, 10) || 1;
        input.value = v + 1;
      });
    }
  }

  /* --------------------------------------------------------
     Accordion
  -------------------------------------------------------- */
  function initPdpAccordion() {
    document.querySelectorAll('.pdp-accordion-trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var body     = btn.nextElementSibling;
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        body.hidden = expanded;
      });
    });
  }

  /* --------------------------------------------------------
     Boot PDP functions
  -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initPdpGallery();
    initPdpVariants();
    initPdpQty();
    initPdpAccordion();
  });

})();

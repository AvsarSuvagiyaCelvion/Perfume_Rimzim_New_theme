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
    var section = container.closest('.vibe-section') || document.querySelector('.vibe-section');
    var clip    = container.querySelector('.vibe-slider-clip');
    var track   = container.querySelector('.vibe-track');
    var prevBtn = container.querySelector('.slider-btn.prev');
    var nextBtn = container.querySelector('.slider-btn.next');
    /* Dots live outside .vibe-slider-outer — query from section */
    var dots    = section ? Array.from(section.querySelectorAll('.slider-dot')) : [];
    if (!track) return;

    /* ── 1. Clone cards for seamless infinite loop ──
       Layout: [tail-clones][real cards][head-clones]
       idx starts at CLONES = first real card position. */
    var realCards = Array.from(track.querySelectorAll('.vibe-card'));
    var R         = realCards.length;
    if (!R) return;

    var CLONES = Math.min(R, 4);

    for (var ci = R - CLONES; ci < R; ci++) {
      var cl = realCards[ci].cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      cl.setAttribute('tabindex', '-1');
      track.insertBefore(cl, track.firstChild);
    }
    for (var ci = 0; ci < CLONES; ci++) {
      var cl = realCards[ci].cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      cl.setAttribute('tabindex', '-1');
      track.appendChild(cl);
    }

    /* ── 2. State ── */
    var ANIM_MS    = 580;
    var idx        = CLONES;
    var cardW      = 0;
    var gap        = 0;
    var autoTimer  = null;
    var busy       = false;
    var mq         = window.matchMedia('(max-width: 768px)');
    var scrollLock = false;

    /* ── 3. Measurement ── */
    function measure() {
      var style = window.getComputedStyle(track);
      gap   = parseFloat(style.gap) || 20;
      cardW = track.children[0].offsetWidth + gap;
      clip.scrollLeft = 0;
      desktopJump();
      updateDots();
    }

    /* ── 4. Positioning — transform-based on all devices ── */
    function desktopJump() {
      track.style.transition = 'none';
      track.style.transform  = 'translateX(-' + (idx * cardW) + 'px)';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          track.style.transition = '';
        });
      });
    }

    function desktopSlide() {
      track.style.transform = 'translateX(-' + (idx * cardW) + 'px)';
    }

    /* ── 5. Dots ── */
    function updateDots() {
      var ri = ((idx - CLONES) % R + R) % R;
      dots.forEach(function (d, i) { d.classList.toggle('active', i === ri); });
    }

    /* ── 6. Loop correction — fires after animation ends ── */
    function loopCorrect() {
      busy = false;
      var jumped = false;
      if (idx >= CLONES + R) { idx -= R; jumped = true; }
      else if (idx < CLONES)  { idx += R; jumped = true; }
      if (!jumped) return;
      desktopJump();
      updateDots();
    }

    /* ── 7. Navigation ── */
    function next() {
      if (busy) return;
      busy = true;
      idx++;
      desktopSlide();
      updateDots();
      setTimeout(loopCorrect, ANIM_MS);
    }

    function prev() {
      if (busy) return;
      busy = true;
      idx--;
      desktopSlide();
      updateDots();
      setTimeout(loopCorrect, ANIM_MS);
    }

    function startAuto() { stopAuto(); busy = false; autoTimer = setInterval(next, 2000); }
    function stopAuto()  { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    /* ── 8. Controls ── */
    if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); prev(); startAuto(); });

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        if (busy) return;
        idx = CLONES + i;
        if (mq.matches) {
          clip.scrollTo({ left: idx * cardW, behavior: 'smooth' });
        } else {
          desktopSlide();
        }
        updateDots();
        startAuto();
      });
    });

    /* ── 9. Touch swipe (all devices) ── */
    var swipeX = 0, swipeT = 0;
    track.addEventListener('touchstart', function (e) {
      swipeX = e.changedTouches[0].clientX;
      swipeT = Date.now();
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dist = swipeX - e.changedTouches[0].clientX;
      if (Math.abs(dist) > 40 && Date.now() - swipeT < 400) {
        if (dist > 0) next(); else prev();
      }
      startAuto();
    }, { passive: true });

    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);

    /* Resume when tab becomes visible again */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stopAuto(); } else { startAuto(); }
    });

    /* Resume after browser back-button (bfcache restore) */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { startAuto(); }
    });

    /* ── 11. Init ── */
    measure();
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
  /* --------------------------------------------------------
     Toast Notification
  -------------------------------------------------------- */
  var toastContainer = null;

  function showToast(title, msg, linkText, linkHref) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<div class="toast-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>'
      + '<div class="toast-body"><div class="toast-title">' + title + '</div>' + (msg ? '<div class="toast-msg">' + msg + '</div>' : '') + '</div>'
      + (linkText ? '<a href="' + linkHref + '" class="toast-action">' + linkText + '</a>' : '');
    toastContainer.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('toast-out');
      setTimeout(function () { toast.remove(); }, 320);
    }, 3200);
  }

  /* --------------------------------------------------------
     AJAX Add to Cart (no redirect)
  -------------------------------------------------------- */
  function addToCart(variantId, productTitle, btn, originalHtml) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.id) {
          refreshCartCount();
          showToast(productTitle || 'Product added', 'Successfully added to cart', 'View Cart', '/cart');
          if (btn) {
            btn.innerHTML = '✓ Added';
            setTimeout(function () {
              btn.innerHTML = originalHtml;
              btn.disabled = false;
            }, 1800);
          }
        } else { throw data; }
      })
      .catch(function () {
        if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
      });
  }

  /* --------------------------------------------------------
     Variant Picker Modal
  -------------------------------------------------------- */
  function openVariantPicker(handle, title, imageUrl, priceFormatted) {
    var existing = document.getElementById('VariantModal');
    if (existing) existing.remove();
    var bExisting = document.getElementById('VariantModalBackdrop');
    if (bExisting) bExisting.remove();

    var backdrop = document.createElement('div');
    backdrop.className = 'variant-modal-backdrop';
    backdrop.id = 'VariantModalBackdrop';
    document.body.appendChild(backdrop);

    var modal = document.createElement('div');
    modal.className = 'variant-modal';
    modal.id = 'VariantModal';
    modal.innerHTML = '<div class="variant-modal-header">'
      + (imageUrl ? '<img class="variant-modal-img" src="' + imageUrl + '" alt="' + title + '">' : '')
      + '<div class="variant-modal-info"><p class="variant-modal-title">' + title + '</p>'
      + '<p class="variant-modal-price">' + (priceFormatted || '') + '</p></div>'
      + '<button class="variant-modal-close" id="VariantModalClose" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>'
      + '</div>'
      + '<div class="variant-modal-options" id="VariantOptions"><p style="color:var(--color-text-muted);font-size:.85rem;">Loading options…</p></div>'
      + '<button class="btn btn-primary variant-modal-atc" id="VariantModalATC" disabled>Select Options</button>';
    document.body.appendChild(modal);

    setTimeout(function () { backdrop.classList.add('is-open'); modal.classList.add('is-open'); }, 10);

    function closeModal() {
      backdrop.classList.remove('is-open');
      modal.classList.remove('is-open');
      setTimeout(function () { backdrop.remove(); modal.remove(); }, 400);
    }

    document.getElementById('VariantModalClose').addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKey); }
    });

    fetch('/products/' + handle + '.js')
      .then(function (r) { return r.json(); })
      .then(function (product) {
        var selectedOptions = {};
        var optionsEl = document.getElementById('VariantOptions');
        if (!optionsEl) return;

        var html = '';
        product.options.forEach(function (opt, i) {
          var values = [];
          product.variants.forEach(function (v) { if (values.indexOf(v['option' + (i+1)]) === -1) values.push(v['option' + (i+1)]); });
          html += '<span class="variant-modal-option-label">' + opt + '</span><div class="variant-modal-btns">';
          values.forEach(function (val) {
            html += '<button class="variant-option-btn" data-opt-index="' + i + '" data-opt-val="' + val + '">' + val + '</button>';
          });
          html += '</div>';
        });
        optionsEl.innerHTML = html;

        optionsEl.addEventListener('click', function (e) {
          var btn = e.target.closest('.variant-option-btn');
          if (!btn) return;
          var idx = parseInt(btn.dataset.optIndex, 10);
          optionsEl.querySelectorAll('.variant-option-btn[data-opt-index="' + idx + '"]').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          selectedOptions[idx] = btn.dataset.optVal;

          var match = product.variants.find(function (v) {
            return product.options.every(function (_, i) {
              return !selectedOptions.hasOwnProperty(i) || v['option' + (i+1)] === selectedOptions[i];
            });
          });

          var atcBtn = document.getElementById('VariantModalATC');
          if (Object.keys(selectedOptions).length === product.options.length && match) {
            atcBtn.disabled = !match.available;
            atcBtn.textContent = match.available ? 'Add to Cart' : 'Sold Out';
            atcBtn.dataset.variantId = match.id;
          }
        });

        var atcBtn = document.getElementById('VariantModalATC');
        atcBtn.addEventListener('click', function () {
          if (!atcBtn.dataset.variantId || atcBtn.disabled) return;
          var origHtml = atcBtn.innerHTML;
          atcBtn.disabled = true;
          atcBtn.textContent = 'Adding…';
          addToCart(atcBtn.dataset.variantId, product.title, null, null);
          setTimeout(function () { closeModal(); }, 600);
        });
      })
      .catch(function () {
        var optionsEl = document.getElementById('VariantOptions');
        if (optionsEl) optionsEl.innerHTML = '<p style="color:red;font-size:.85rem;">Could not load options. <a href="/products/' + handle + '">View product →</a></p>';
      });
  }

  function initAddToCart() {
    document.addEventListener('click', function (e) {
      /* ── PDP main Add to Cart button ── */
      var pdpAtc = e.target.closest('#PdpATC');
      if (pdpAtc && !pdpAtc.disabled) {
        var variantId = pdpAtc.dataset.variantId;
        var title     = pdpAtc.dataset.title || 'Product';
        if (variantId) {
          var origHtml = pdpAtc.innerHTML;
          pdpAtc.disabled = true;
          pdpAtc.textContent = 'Adding…';
          addToCart(variantId, title, pdpAtc, origHtml);
        }
        return;
      }

      /* ── Product card ATC button ── */
      var atcBtn = e.target.closest('.product-card-atc');
      if (atcBtn && !atcBtn.disabled) {
        var variantId = atcBtn.dataset.variantId;
        if (!variantId) return;
        var origHtml = atcBtn.innerHTML;
        atcBtn.disabled = true;
        atcBtn.textContent = 'Adding…';
        addToCart(variantId, 'Product', atcBtn, origHtml);
        return;
      }

      /* ── Quick Add button (all product grids) ── */
      var btn = e.target.closest('.product-quick-add-btn');
      if (!btn || btn.disabled) return;

      var variantId   = btn.dataset.variantId;
      var hasVariants = parseInt(btn.dataset.hasVariants || '0', 10);
      var handle      = btn.dataset.handle;
      var title       = btn.dataset.title || 'Product';
      if (!variantId) return;

      if (hasVariants > 0 && handle) {
        var cardEl = btn.closest('[class*="card"]');
        var imgSrc = cardEl ? ((cardEl.querySelector('.tcard-img, .product-card-img') || {}).src || '') : '';
        openVariantPicker(handle, title, imgSrc, '');
        return;
      }

      var origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Adding…';
      addToCart(variantId, title, btn, origHtml);
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
     Search Drawer
  -------------------------------------------------------- */
  function initSearchDrawer() {
    var toggle   = document.getElementById('SearchToggle');
    var drawer   = document.getElementById('SearchDrawer');
    var backdrop = document.getElementById('SearchBackdrop');
    var input    = document.getElementById('SearchInput');
    var clearBtn = document.getElementById('SearchClear');
    var closeBtn = document.getElementById('SearchClose');
    var results  = document.getElementById('SearchResults');
    if (!toggle || !drawer) return;

    var debounceTimer = null;

    function openSearch() {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-visible');
      drawer.removeAttribute('inert');
      drawer.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { if (input) input.focus(); }, 50);
    }

    function closeSearch() {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-visible');
      drawer.setAttribute('inert', '');
      drawer.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (results) { results.innerHTML = ''; results.hidden = true; }
    }

    toggle.addEventListener('click', function () {
      var isOpen = drawer.classList.contains('is-open');
      isOpen ? closeSearch() : openSearch();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    if (backdrop) backdrop.addEventListener('click', closeSearch);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeSearch();
    });

    /* Clear button */
    if (input && clearBtn) {
      input.addEventListener('input', function () {
        clearBtn.hidden = input.value.length === 0;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          fetchSuggestions(input.value.trim());
        }, 300);
      });
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.hidden = true;
        if (results) { results.innerHTML = ''; results.hidden = true; }
        input.focus();
      });
    }

    /* Predictive search */
    function fetchSuggestions(q) {
      if (!results) return;
      if (q.length < 2) { results.innerHTML = ''; results.hidden = true; return; }

      results.hidden = false;
      results.innerHTML = '<p class="search-results-loading">Searching…</p>';

      fetch('/search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=5')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var products = (data.resources && data.resources.results && data.resources.results.products) || [];
          if (!products.length) {
            results.innerHTML = '<p class="search-results-empty">No results for "' + q + '"</p>';
            return;
          }
          var html = '<p class="search-results-label">Products</p>';
          products.forEach(function (p) {
            var price = p.price ? '<span class="search-result-price">' + Shopify.formatMoney(p.price, window._moneyFormat || '{{amount}}') + '</span>' : '';
            var img   = p.featured_image && p.featured_image.url
              ? '<img class="search-result-img" src="' + p.featured_image.url + '" alt="' + (p.featured_image.alt || p.title) + '" loading="lazy">'
              : '<div class="search-result-img"></div>';
            html += '<a href="' + p.url + '" class="search-result-item">'
              + img
              + '<div class="search-result-info">'
              + '<p class="search-result-title">' + p.title + '</p>'
              + price
              + '</div></a>';
          });
          html += '<a href="/search?q=' + encodeURIComponent(q) + '&type=product" class="search-results-all">See all results for "' + q + '" →</a>';
          results.innerHTML = html;
        })
        .catch(function () {
          results.innerHTML = '<p class="search-results-empty">Something went wrong. Press Enter to search.</p>';
        });
    }
  }

  /* --------------------------------------------------------
     Wishlist (localStorage)
  -------------------------------------------------------- */
  var WISHLIST_KEY = 'rimzim_wishlist';

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch (e) { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  }

  function isWishlisted(handle) {
    return getWishlist().indexOf(handle) > -1;
  }

  function updateWishlistBadge() {
    var count = getWishlist().length;
    document.querySelectorAll('.wishlist-count').forEach(function (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function initWishlist() {
    /* Mark already-wishlisted buttons */
    document.querySelectorAll('.product-card-wishlist[data-handle]').forEach(function (btn) {
      if (isWishlisted(btn.dataset.handle)) btn.classList.add('is-wishlisted');
    });

    /* Toggle on click */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.product-card-wishlist[data-handle]');
      if (!btn) return;
      e.preventDefault();
      var handle = btn.dataset.handle;
      var title  = btn.dataset.title || 'Product';
      var list   = getWishlist();
      var idx    = list.indexOf(handle);
      if (idx > -1) {
        list.splice(idx, 1);
        btn.classList.remove('is-wishlisted');
        showToast(title, 'Removed from wishlist');
      } else {
        list.push(handle);
        btn.classList.add('is-wishlisted');
        showToast(title, 'Added to wishlist', 'View Wishlist', '/pages/wishlist');
      }
      saveWishlist(list);
      updateWishlistBadge();
    });

    updateWishlistBadge();
  }

  /* --------------------------------------------------------
     Boot
  -------------------------------------------------------- */
  /* --------------------------------------------------------
     Sticky ATC Bar (Product Page)
  -------------------------------------------------------- */
  function initStickyATC() {
    var stickyBar = document.getElementById('PdpStickyBar');
    var mainATC   = document.getElementById('PdpATC');
    var stickyBtn = document.getElementById('PdpStickyATC');
    if (!stickyBar || !mainATC) return;

    /* Show bar when main ATC scrolls out of view */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        stickyBar.classList.toggle('is-visible', !entry.isIntersecting);
        stickyBar.setAttribute('aria-hidden', entry.isIntersecting ? 'true' : 'false');
      });
    }, { threshold: 0 });
    observer.observe(mainATC);

    /* Sticky ATC click — open variant picker if multi-variant, else submit form */
    if (stickyBtn) {
      stickyBtn.addEventListener('click', function () {
        var hasVariants = parseInt(stickyBtn.dataset.hasVariants || '0', 10);
        var handle      = stickyBtn.dataset.handle;
        var title       = stickyBtn.dataset.title || 'Product';
        if (hasVariants > 0 && handle) {
          openVariantPicker(handle, title, null, null);
          return;
        }
        var formId = stickyBtn.dataset.formId;
        var form   = document.getElementById(formId);
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Critical path — runs immediately on every page */
    initHeaderScroll();
    initMobileMenu();
    initDropdowns();
    initSearchDrawer();
    initAddToCart();
    initWishlist();
    refreshCartCount();
    initScrollToTop();

    /* PDP sticky bar — only when the element exists */
    if (document.getElementById('PdpStickyBar')) initStickyATC();

    /* PDP share button — copies current URL to clipboard */
    var shareBtn = document.getElementById('PdpShareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var url = shareBtn.dataset.url || location.href;
        navigator.clipboard.writeText(url).then(function () {
          var span = shareBtn.querySelector('span');
          var prev = span.textContent;
          span.textContent = 'Copied!';
          setTimeout(function () { span.textContent = prev; }, 2000);
        }).catch(function () {});
      });
    }

    /* Non-critical UI — defer until the browser is idle so main-thread
       work doesn't block LCP/TTI. Falls back to setTimeout for Safari. */
    var _deferred = function () {
      initTextAnimations();
      initScrollAnimations();
      if (document.querySelector('.vibe-slider-outer')) initVibeSlider();
      if (document.querySelector('.newsletter-form'))   initNewsletterForm();
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(_deferred, { timeout: 2000 });
    } else {
      setTimeout(_deferred, 200);
    }
  });

})();

/* ============================================================
   WISHLIST PAGE
   ============================================================ */
(function () {
  'use strict';

  var WISHLIST_KEY = 'rimzim_wishlist';
  function getWishlist() { try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch (e) { return []; } }
  function saveWishlist(list) { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); }

  /* Cache loaded product data so removal re-renders instantly without new network requests */
  var _productCache = {};

  /* Inline badge updater — updateWishlistBadge() lives in the main IIFE and is out of scope here */
  function syncWishlistBadge() {
    var count = getWishlist().length;
    document.querySelectorAll('.wishlist-count').forEach(function (badge) {
      badge.textContent    = count;
      badge.style.display  = count > 0 ? 'flex' : 'none';
    });
  }

  function showToastWL(title, msg) {
    var container = document.querySelector('.toast-container');
    if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<div class="toast-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div class="toast-body"><div class="toast-title">' + title + '</div>' + (msg ? '<div class="toast-msg">' + msg + '</div>' : '') + '</div>';
    container.appendChild(toast);
    setTimeout(function () { toast.classList.add('toast-out'); setTimeout(function () { toast.remove(); }, 320); }, 3000);
  }

  function moneyFormat(cents) {
    return (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function renderProducts(products) {
    var container = document.getElementById('WishlistProducts');
    var meta      = document.getElementById('WishlistMeta');
    if (!container) return;

    /* Populate cache so removal can re-render without new fetches */
    products.forEach(function (p) { if (p && p.handle) _productCache[p.handle] = p; });

    if (!products.length) {
      if (meta) meta.textContent = '';
      container.innerHTML = '<div class="wishlist-empty">'
        + '<div class="wishlist-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg></div>'
        + '<h2 class="wishlist-empty-heading">Your wishlist is empty</h2>'
        + '<p class="wishlist-empty-sub">Save your favourite fragrances and find them here.</p>'
        + '<a href="/collections/all" class="btn btn-primary" style="margin-top:24px;">Browse Collections</a>'
        + '</div>';
      return;
    }

    if (meta) meta.textContent = products.length + ' item' + (products.length !== 1 ? 's' : '') + ' saved';

    var html = '<div class="wishlist-grid">';
    products.forEach(function (p) {
      if (!p || !p.handle) return;
      var img          = p.featured_image ? p.featured_image : '';
      var price        = moneyFormat(p.price_min);
      var comparePrice = p.compare_at_price_min > p.price_min ? '<s>' + moneyFormat(p.compare_at_price_min) + '</s> ' : '';
      var available    = p.available;
      html += '<div class="wishlist-card" data-handle="' + p.handle + '">'
        + '<div class="wishlist-card-media">'
        + (img ? '<a href="/products/' + p.handle + '"><img class="wishlist-card-img" src="' + img + '" alt="' + p.title + '" loading="lazy"></a>' : '')
        + '<button class="wishlist-card-remove" data-handle="' + p.handle + '" aria-label="Remove from wishlist">'
        + '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
        + '</button></div>'
        + '<div class="wishlist-card-info">'
        + (p.vendor ? '<p class="wishlist-card-vendor">' + p.vendor + '</p>' : '')
        + '<h3 class="wishlist-card-title"><a href="/products/' + p.handle + '">' + p.title + '</a></h3>'
        + '<p class="wishlist-card-price">' + comparePrice + '<span' + (comparePrice ? ' class="price-sale"' : '') + '>$' + price + '</span></p>'
        + (available
          ? '<button class="btn btn-primary wishlist-card-atc" data-variant-id="' + p.variants[0].id + '" data-title="' + p.title + '">Add to Cart</button>'
          : '<button class="btn btn-primary wishlist-card-atc" disabled>Sold Out</button>')
        + '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;

    /* Remove from wishlist */
    container.addEventListener('click', function (e) {
      var removeBtn = e.target.closest('.wishlist-card-remove');
      if (removeBtn) {
        var handle = removeBtn.dataset.handle;
        var list = getWishlist().filter(function (h) { return h !== handle; });
        saveWishlist(list);
        syncWishlistBadge();

        /* Animate the card out */
        var card = container.querySelector('.wishlist-card[data-handle="' + handle + '"]');
        if (card) {
          card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          card.style.opacity    = '0';
          card.style.transform  = 'scale(0.92)';
        }

        /* Re-render immediately from cache — no network requests needed */
        setTimeout(function () {
          var remaining = list.map(function (h) { return _productCache[h]; }).filter(Boolean);
          renderProducts(remaining);
        }, 270);

        showToastWL('Removed from wishlist', '');
        return;
      }

      /* ATC from wishlist */
      var atcBtn = e.target.closest('.wishlist-card-atc');
      if (atcBtn && !atcBtn.disabled) {
        var variantId = atcBtn.dataset.variantId;
        var title     = atcBtn.dataset.title || 'Product';
        var origHtml  = atcBtn.innerHTML;
        atcBtn.disabled = true;
        atcBtn.textContent = 'Adding…';
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 })
        }).then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.id) {
              showToastWL(title, 'Added to cart');
              fetch('/cart.js').then(function (r) { return r.json(); }).then(function (cart) {
                var badge = document.querySelector('.cart-count');
                if (badge) { badge.textContent = cart.item_count; badge.style.display = cart.item_count > 0 ? 'flex' : 'none'; }
              });
              atcBtn.textContent = '✓ Added';
              setTimeout(function () { atcBtn.innerHTML = origHtml; atcBtn.disabled = false; }, 2000);
            } else { throw data; }
          }).catch(function () { atcBtn.innerHTML = origHtml; atcBtn.disabled = false; });
      }
    });
  }

  function initWishlistPage() {
    if (!document.getElementById('WishlistProducts')) return;
    var handles = getWishlist();
    if (!handles.length) { renderProducts([]); return; }

    var loaded = 0;
    var products = [];
    handles.forEach(function (handle) {
      fetch('/products/' + handle + '.js')
        .then(function (r) { return r.json(); })
        .then(function (p) { products.push(p); })
        .catch(function () {})
        .finally(function () {
          loaded++;
          if (loaded === handles.length) renderProducts(products);
        });
    });
  }

  if (document.getElementById('WishlistProducts')) {
    document.addEventListener('DOMContentLoaded', initWishlistPage);
  }
})();

/* ============================================================
   CART PAGE — qty steppers + remove
   ============================================================ */
(function () {
  'use strict';

  function initCartPage() {
    var page = document.getElementById('CartPage');
    if (!page) return;

    var itemsCol = page.querySelector('.cart-items-col');

    function setLoading(on) {
      if (itemsCol) itemsCol.classList.toggle('is-loading', on);
    }

    function updateCart(key, qty) {
      setLoading(true);
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ id: key, quantity: qty })
      })
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          /* Reload to re-render Liquid cart (simplest, avoids stale DOM) */
          window.location.reload();
        })
        .catch(function () { setLoading(false); });
    }

    page.addEventListener('click', function (e) {
      /* Remove button */
      var removeBtn = e.target.closest('.cart-item-remove');
      if (removeBtn) {
        updateCart(removeBtn.dataset.key, 0);
        return;
      }

      /* Qty minus */
      var minusBtn = e.target.closest('.cart-qty-minus');
      if (minusBtn) {
        var input = minusBtn.parentElement.querySelector('.cart-qty-input');
        var val = Math.max(0, parseInt(input.value, 10) - 1);
        input.value = val;
        updateCart(minusBtn.dataset.key, val);
        return;
      }

      /* Qty plus */
      var plusBtn = e.target.closest('.cart-qty-plus');
      if (plusBtn) {
        var input = plusBtn.parentElement.querySelector('.cart-qty-input');
        var val = parseInt(input.value, 10) + 1;
        input.value = val;
        updateCart(plusBtn.dataset.key, val);
      }
    });

    /* Manual qty input — update on blur */
    page.addEventListener('change', function (e) {
      var input = e.target.closest('.cart-qty-input');
      if (!input) return;
      var val = Math.max(0, parseInt(input.value, 10) || 0);
      input.value = val;
      updateCart(input.dataset.key, val);
    });
  }

  if (document.getElementById('CartPage')) {
    document.addEventListener('DOMContentLoaded', initCartPage);
  }
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

    /* Track selected options — nothing pre-selected on fresh load */
    var selected = {};

    section.querySelectorAll('.pdp-option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var optEl = btn.closest('.pdp-option');
        var idx   = parseInt(optEl.dataset.optionIndex, 10);
        var isAlreadyActive = btn.classList.contains('active');

        /* Toggle: clicking the active variant deselects it */
        if (isAlreadyActive) {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
          delete selected[idx];

          var label = optEl.querySelector('.pdp-option-value');
          if (label) label.textContent = '';

          var idInput = document.getElementById('PdpVariantId');
          if (idInput) idInput.value = '';

          var atcBtn = document.getElementById('PdpATC');
          var hint   = document.getElementById('PdpSelectHint');
          if (atcBtn) {
            atcBtn.disabled = true;
            atcBtn.setAttribute('data-awaiting-selection', '');
          }
          if (hint) hint.classList.remove('is-hidden');

          var avail = document.getElementById('PdpAvailability');
          if (avail) avail.innerHTML = '';
          return;
        }

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

        /* Update ATC button — require all options selected */
        var atcBtn = document.getElementById('PdpATC');
        var hint   = document.getElementById('PdpSelectHint');
        var totalOptions = section.querySelectorAll('.pdp-option').length;
        var allSelected  = Object.keys(selected).length >= totalOptions;
        if (atcBtn) {
          if (allSelected) {
            atcBtn.disabled = !match.available;
            atcBtn.removeAttribute('data-awaiting-selection');
            if (hint) hint.classList.add('is-hidden');
          } else {
            atcBtn.disabled = true;
            if (hint) hint.classList.remove('is-hidden');
          }
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
        body.classList.toggle('is-open', !expanded);
      });
    });
  }

  /* --------------------------------------------------------
     Boot PDP functions
  -------------------------------------------------------- */
  if (document.getElementById('ProductSection')) {
    document.addEventListener('DOMContentLoaded', function () {
      initPdpGallery();
      initPdpVariants();
      initPdpQty();
      initPdpAccordion();
    });
  }

})();

/* ============================================================
   LUMIÈRE — Site-wide Animation Engine
   Runs after DOMContentLoaded on every page.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH   = window.matchMedia('(hover: none)').matches;
  var MOBILE  = window.matchMedia('(max-width: 768px)').matches;

  /* ──────────────────────────────────────────────────────────
     1. SCROLL PROGRESS BAR
     Thin gold line at very top of viewport tracks page scroll.
  ────────────────────────────────────────────────────────── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    document.body.prepend(bar);

    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      var total    = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     2. CURSOR GLOW
     Soft gold radial glow that follows the mouse on desktop.
  ────────────────────────────────────────────────────────── */
  function initCursorGlow() {
    if (TOUCH || REDUCED) return;

    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     3. SCROLL-ENTRANCE ANIMATION ENGINE
     Automatically targets key elements on every page,
     applies .sa + direction class, stagger delay, then
     adds .sa-in when element enters the viewport.
  ────────────────────────────────────────────────────────── */
  function initScrollEntrance() {
    if (REDUCED) return;
    if (!('IntersectionObserver' in window)) return;

    /*
      Each entry: [ CSS selector, animation type, stagger-ms ]
      Types: 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur'
      stagger-ms: applied per child index (0 = no stagger / whole block)
    */
    var targets = [
      /* ── Grids — each child staggers in ── */
      ['.products-grid > .product-card',           'up',    65],
      ['.seasonal-grid > .seasonal-card',           'scale', 110],
      ['.list-collections-grid > .col-card',        'scale', 90],
      ['.testimonials-grid > .testimonial-card',    'up',    90],
      ['.about-values-grid > .about-value-card',    'up',    80],
      ['.search-results-grid > .search-product-card','up',   55],
      ['.footer-col',                               'up',    70],

      /* ── Two-column reveal ── */
      ['.pdp-gallery',                              'left',  0],
      ['.pdp-info',                                 'right', 0],
      ['.contact-form-col',                         'left',  0],
      ['.contact-info-col',                         'right', 120],
      ['.about-mission-text',                       'left',  0],
      ['.about-mission-img-wrap',                   'right', 140],

      /* ── Section-level blocks ── */
      ['.newsletter-inner',                         'up',    0],
      ['.collection-toolbar',                       'up',    0],
      ['.about-cta .container',                     'up',    0],
      ['.about-hero .container',                    'up',    0],
      ['.footer-brand',                             'up',    0],
      ['.vibe-section .section-header',             'up',    0],
      ['.wishlist-grid > .wishlist-card',           'up',    60],

      /* ── PDP detail ── */
      ['.pdp-trust',                                'up',    0],
      ['.pdp-accordion',                            'up',    0],
    ];

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('sa-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -48px 0px' });

    targets.forEach(function (cfg) {
      var sel     = cfg[0];
      var type    = cfg[1];
      var stagger = cfg[2];

      document.querySelectorAll(sel).forEach(function (el, i) {
        /* Skip elements already handled by existing animate-on-scroll */
        if (el.classList.contains('sa') || el.classList.contains('animated')) return;
        el.classList.add('sa', 'sa-' + type);
        if (stagger > 0) el.style.setProperty('--sa-delay', (i % 6 * stagger) + 'ms');
        observer.observe(el);
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     4. HERO STAT COUNTER
     Numbers count up from 0 when the hero scrolls into view.
  ────────────────────────────────────────────────────────── */
  function initCounters() {
    if (REDUCED) return;

    var stats = document.querySelectorAll('.hero-stat-value');
    if (!stats.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el    = entry.target;
        observer.unobserve(el);

        var raw   = el.textContent.trim();
        var match = raw.match(/^([\d,]+)/);
        if (!match) return;

        var end    = parseInt(match[1].replace(/,/g, ''), 10);
        var suffix = raw.slice(match[1].length);
        var dur    = 1600;
        var start  = performance.now();

        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(easeOut(p) * end).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });

    stats.forEach(function (el) { observer.observe(el); });
  }

  /* ──────────────────────────────────────────────────────────
     5. HERO PARALLAX
     Background image moves at 25% scroll speed on desktop.
  ────────────────────────────────────────────────────────── */
  function initParallax() {
    var bg = document.querySelector('.hero-bg');
    if (!bg || REDUCED || MOBILE) return;

    window.addEventListener('scroll', function () {
      bg.style.transform = 'translateY(' + (window.scrollY * 0.22) + 'px)';
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     6. MOUSE PARALLAX ON HERO IMAGE
     Image shifts subtly with cursor position on desktop.
  ────────────────────────────────────────────────────────── */
  function initHeroMouseParallax() {
    var heroSection = document.querySelector('.hero-section');
    var heroBgImg   = document.querySelector('.hero-bg-img');
    if (!heroSection || !heroBgImg || TOUCH || REDUCED || MOBILE) return;

    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      var y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
      heroBgImg.style.transform = 'scale(1.06) translate(' + x + 'px, ' + y + 'px)';
      heroBgImg.style.transition = 'transform 0.4s ease';
    }, { passive: true });

    heroSection.addEventListener('mouseleave', function () {
      heroBgImg.style.transform = '';
      heroBgImg.style.transition = 'transform 1s var(--ease-out)';
    });
  }

  /* ──────────────────────────────────────────────────────────
     7. AMBIENT FLOATING ORBS
     Soft gold radial orbs animate in hero and dark sections.
  ────────────────────────────────────────────────────────── */
  function initAmbientOrbs() {
    if (REDUCED) return;

    var orbConfigs = [
      /* [selector, orb1-size, orb1-pos, orb2-size, orb2-pos, color-opacity] */
      ['.newsletter-section',
        {w:420, h:420, t:'-120px', l:'-80px',  delay:'0s',   dur:'9s'},
        {w:280, h:280, b:'-90px',  r:'-60px',  delay:'-4.5s', dur:'11s'}],
      ['.about-cta',
        {w:380, h:380, t:'-100px', l:'-60px',  delay:'-2s',  dur:'8s'},
        {w:240, h:240, b:'-70px',  r:'-50px',  delay:'-5s',  dur:'12s'}],
    ];

    orbConfigs.forEach(function (cfg) {
      var section = document.querySelector(cfg[0]);
      if (!section) return;
      var pos = window.getComputedStyle(section).position;
      if (pos === 'static') section.style.position = 'relative';

      [cfg[1], cfg[2]].forEach(function (o, idx) {
        var orb = document.createElement('div');
        orb.className = 'ambient-orb';
        orb.style.cssText = [
          'width:'  + o.w + 'px',
          'height:' + o.h + 'px',
          o.t  ? 'top:'    + o.t : '',
          o.b  ? 'bottom:' + o.b : '',
          o.l  ? 'left:'   + o.l : '',
          o.r  ? 'right:'  + o.r : '',
          '--orb-delay:' + o.delay,
          '--orb-dur:'   + o.dur,
          'background: radial-gradient(circle, rgba(201,169,110,' + (idx === 0 ? '0.10' : '0.07') + ') 0%, transparent 70%)',
        ].filter(Boolean).join(';');
        section.appendChild(orb);
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     8. BUTTON RIPPLE
     Gold ripple emanates from click point on primary buttons.
  ────────────────────────────────────────────────────────── */
  function initButtonRipple() {
    if (REDUCED) return;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-primary, .btn-outline-gold');
      if (!btn) return;

      var rect   = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top)  + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { if (ripple.parentNode) ripple.remove(); }, 600);
    });
  }

  /* ──────────────────────────────────────────────────────────
     9. MAGNETIC BUTTONS
     Primary + gold buttons subtly follow the cursor.
  ────────────────────────────────────────────────────────── */
  function initMagneticButtons() {
    if (TOUCH || REDUCED) return;

    document.querySelectorAll('.btn-primary, .btn-outline-gold').forEach(function (btn) {
      btn.classList.add('btn-magnetic');

      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var dx   = (e.clientX - (rect.left + rect.width  / 2)) * 0.18;
        var dy   = (e.clientY - (rect.top  + rect.height / 2)) * 0.18;
        btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) translateY(-2px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ──────────────────────────────────────────────────────────
     10. SECTION DIVIDERS
     Inject animated gold shimmer dividers between sections.
  ────────────────────────────────────────────────────────── */
  function initSectionDividers() {
    var pairs = [
      ['.hero-section',          '.seasonal-section'],
      ['.new-arrivals-section',  '.vibe-section'],
      ['.vibe-section',          '.testimonials-section'],
    ];

    pairs.forEach(function (pair) {
      var a = document.querySelector(pair[0]);
      var b = document.querySelector(pair[1]);
      if (!a || !b || a.nextElementSibling !== b) return;
      var hr = document.createElement('hr');
      hr.className = 'section-divider';
      hr.setAttribute('aria-hidden', 'true');
      b.insertAdjacentElement('beforebegin', hr);
    });
  }

  /* ──────────────────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initCursorGlow();
    initScrollEntrance();
    initCounters();
    initParallax();
    initHeroMouseParallax();
    initAmbientOrbs();
    initButtonRipple();
    initMagneticButtons();
    initSectionDividers();
  });

})();

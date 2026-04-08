/* =====================================================
   Rit Motor – Global Interaction Layer
   Loaded on every page via <script src="shared.js">
   ===================================================== */
(function () {
  'use strict';

  // ─── 1. BLUR REVEAL ──────────────────────────────────
  // Frosted glass overlay fades away on load — page "comes into focus"
  const revealEl = document.createElement('div');
  revealEl.id = 'rit-reveal';
  document.body.appendChild(revealEl);

  function clearReveal() {
    revealEl.classList.add('clear');
    setTimeout(() => revealEl.remove(), 800);
  }
  // Minimum 250ms so the blur is intentional, not a flash
  let rElapsed = false, rLoaded = false;
  setTimeout(() => { rElapsed = true; if (rLoaded) clearReveal(); }, 250);
  window.addEventListener('load', () => { rLoaded = true; if (rElapsed) clearReveal(); });


  // ─── 2. BACKDROP OVERLAY ─────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'rit-overlay';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', closeMobileMenu);


  // ─── 3. MOBILE BOTTOM SHEET ──────────────────────────
  const mobileMenu = document.getElementById('mobileMenu');

  // Inject the drag-handle bar
  if (mobileMenu) {
    const handle = document.createElement('div');
    handle.className = 'sheet-handle';
    mobileMenu.prepend(handle);
  }

  function openMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    mobileMenu?.classList.add('open');
    hamburger?.classList.add('menu-open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  window.closeMobileMenu = function closeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    mobileMenu?.classList.remove('open');
    hamburger?.classList.remove('menu-open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  };

  // Replace hamburger's existing click handler cleanly
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    const fresh = hamburger.cloneNode(true);   // strips old listeners
    hamburger.parentNode.replaceChild(fresh, hamburger);
    fresh.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu?.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
  }

  // Close sheet when a menu link is tapped (incl. links with onclick attr)
  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      // small delay so page-out transition looks right
      setTimeout(closeMobileMenu, 60);
    });
  });


  // ─── 4. ACTIVE NAV LINK ──────────────────────────────
  const currentFile = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
  document.querySelectorAll('.nav-links a, .mobile-menu a:not(.nav-cta)').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0].split('#')[0];
    const file = href.split('/').pop();
    if (!file) return;
    if (file === currentFile || (currentFile === '' && file === 'index.html')) {
      // Remove any hardcoded active first
      a.closest('ul, div')?.querySelectorAll('a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    }
  });


  // ─── 5. ENHANCED NAVBAR SCROLL ───────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      const y = window.scrollY;
      navbar.classList.toggle('scrolled', y > 40);
      navbar.classList.toggle('scrolled-deep', y > 90);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }


  // ─── 6. PAGE TRANSITIONS ─────────────────────────────
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    // Skip: hash, external, special schemes, new-tab, modifier keys
    if (!href
      || href.startsWith('#')
      || href.startsWith('http')
      || href.startsWith('//')
      || href.startsWith('tel:')
      || href.startsWith('mailto:')
      || href.startsWith('upi:')
      || a.target === '_blank'
      || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    document.body.classList.add('page-out');
    setTimeout(() => { window.location.href = href; }, 220);
  }, true);  // use capture so it fires before any inline onclick


  // ─── 7. BUTTON RIPPLE + PRESS EFFECT ─────────────────
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest(
      '.btn-primary, .btn-upi, .btn-whatsapp, .nav-cta, ' +
      '.enquire-btn, .vehicle-cta, .submit-btn, .wa-link-btn, ' +
      '.map-btn, .filter-btn, .copy-btn'
    );
    if (!btn) return;

    // Press scale-down
    btn.style.transition = 'transform 0.08s ease';
    btn.style.transform = 'scale(0.96)';
    const resetPress = () => {
      btn.style.transform = '';
      btn.style.transition = '';
    };
    btn.addEventListener('pointerup',   resetPress, { once: true });
    btn.addEventListener('pointerleave', resetPress, { once: true });

    // Ripple circle
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });


  // ─── 8. SCROLL-REVEAL: grid cards that need .reveal class ───
  // Pages already handle .reveal; this adds it to grid cards that are missing it.
  const GRID_CARDS = [
    ['.features-grid',     '.feature-card'],
    ['.vehicles-grid',     '.vehicle-card'],
    ['.products-grid',     '.product-card'],
    ['.testimonials-grid', '.testimonial-card'],
  ];

  GRID_CARDS.forEach(([gridSel, cardSel]) => {
    document.querySelectorAll(gridSel).forEach(grid => {
      grid.querySelectorAll(cardSel).forEach(card => {
        if (!card.classList.contains('reveal')) {
          card.classList.add('reveal');
        }
      });
    });
  });

  // Single unified IntersectionObserver for all .reveal elements
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  // Observe everything with .reveal (including what pages already tagged)
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  // ─── 9. WHATSAPP CTA BANNER ──────────────────────────
  if (!sessionStorage.getItem('wa-cta-dismissed')) {
    const banner = document.createElement('a');
    banner.id = 'wa-cta-banner';
    banner.href = 'https://wa.me/919163968140?text=Hi!%20I%20need%20help%20choosing%20an%20electric%20vehicle%20from%20Rit%20Motor%20Sales%20%26%20Services.';
    banner.target = '_blank';
    banner.rel = 'noopener noreferrer';
    banner.setAttribute('aria-label', 'Chat with Rit Motor on WhatsApp');
    banner.innerHTML = `
      <svg width="17" height="17" viewBox="0 0 24 24" fill="white" flex-shrink="0" style="flex-shrink:0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span class="wa-cta-text">Need help choosing? Chat with Rit Motor →</span>
      <button class="wa-cta-dismiss" id="wa-cta-x" aria-label="Dismiss">✕</button>
    `;
    document.body.appendChild(banner);

    // Dismiss button — stop propagation so the link doesn't open
    document.getElementById('wa-cta-x')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      banner.classList.remove('show');
      sessionStorage.setItem('wa-cta-dismissed', '1');
    });

    // Show after user scrolls 50% down the page
    let bannerShown = false;
    const checkScroll = () => {
      if (bannerShown) return;
      const scrolled  = window.scrollY + window.innerHeight;
      const total     = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.75) {
        bannerShown = true;
        banner.classList.add('show');
        window.removeEventListener('scroll', checkScroll);
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });

    // Also show after 8s on short pages that don't scroll much
    setTimeout(() => {
      if (!bannerShown && !sessionStorage.getItem('wa-cta-dismissed')) {
        bannerShown = true;
        banner.classList.add('show');
      }
    }, 8000);
  }

})();

/**
 * SCGS — Shared Components Loader
 * Loads nav and footer into pages, handles active states and mobile menu
 */

document.addEventListener('DOMContentLoaded', function () {
  loadComponent('nav-placeholder', '/components/nav.html', function () {
    setActiveNav();
    setActiveCategory();
    initHamburger();
  });

  loadComponent('footer-placeholder', '/components/footer.html');
  loadComponent('cta-placeholder', '/components/cta.html', function () {
    initFloatingCta();
  });
  injectFloatingCta();
});

/**
 * Load an HTML component into a placeholder element
 */
function loadComponent(placeholderId, path, callback) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  // Resolve path relative to <base> tag if present
  var base = document.querySelector('base');
  var resolvedPath = base ? base.href + path.replace(/^\//, '') : path;

  fetch(resolvedPath)
    .then(function (response) {
      if (!response.ok) throw new Error('Component not found: ' + path);
      return response.text();
    })
    .then(function (html) {
      placeholder.innerHTML = html;
      if (callback) callback();
    })
    .catch(function (error) {
      console.error(error);
    });
}

/**
 * Set active state on primary nav links based on current page
 */
function setActiveNav() {
  var path = window.location.pathname;
  var links = document.querySelectorAll('.nav-links a[data-page]');

  links.forEach(function (link) {
    var page = link.getAttribute('data-page');
    var isActive = false;

    if (page === 'home' && (path === '/' || path === '/index.html')) {
      isActive = true;
    } else if (page === 'products' && path.indexOf('/products') !== -1) {
      isActive = true;
    } else if (page === 'industries' && path.indexOf('/industries') !== -1) {
      isActive = true;
    } else if (page === 'services' && path.indexOf('/services') !== -1) {
      isActive = true;
    } else if (page === 'resources' && path.indexOf('/resources') !== -1) {
      isActive = true;
    } else if (page === 'about' && path.indexOf('/about') !== -1) {
      isActive = true;
    } else if (page === 'contact' && path.indexOf('/contact') !== -1) {
      isActive = true;
    }

    if (isActive) {
      link.classList.add('active');
    }
  });
}

/**
 * Set active state on secondary nav (product category bar)
 */
function setActiveCategory() {
  var path = window.location.pathname;
  var categoryLinks = document.querySelectorAll('.nav-categories a[data-category]');

  categoryLinks.forEach(function (link) {
    var category = link.getAttribute('data-category');
    if (path.indexOf(category) !== -1) {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize hamburger menu toggle for mobile
 */
function initHamburger() {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.querySelector('.nav-links');

  if (!hamburger) return;

  // Create close button and inject into mobile menu
  var closeBtn = document.createElement('button');
  closeBtn.className = 'mobile-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.style.display = 'none';

  hamburger.parentElement.appendChild(closeBtn);

  // Create mobile menu logo
  var mobileLogo = document.createElement('div');
  mobileLogo.className = 'mobile-menu-logo';
  mobileLogo.innerHTML = 'SOUTHERN <span>CGS</span>';
  navLinks.insertBefore(mobileLogo, navLinks.firstChild);

  function openMenu() {
    navLinks.classList.add('mobile-open');
    hamburger.style.display = 'none';
    closeBtn.style.display = 'block';
    document.body.style.overflow = 'hidden';
    var floatingCta = document.querySelector('.floating-cta');
    if (floatingCta) floatingCta.style.display = 'none';
  }

  function closeMenu() {
    navLinks.classList.remove('mobile-open');
    var floatingCta = document.querySelector('.floating-cta');
    if (floatingCta) floatingCta.style.display = '';
    hamburger.style.display = '';
    closeBtn.style.display = 'none';
    document.body.style.overflow = '';
    // Close categories dropdown too
    var cats = document.getElementById('mobile-categories');
    if (cats) cats.classList.remove('open');
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navLinks.classList.contains('mobile-open')) {
        closeMenu();
      }
    });
  });

}

/**
 * Inject floating CTA bar into the page
 */
function injectFloatingCta() {
  if (window.location.pathname.indexOf('/contact') !== -1) return;
  var bar = document.createElement('div');
  bar.className = 'floating-cta';
  bar.innerHTML =
    '<a href="/pages/contact.html#booking" class="btn btn-primary btn-sm">' +
      '<span class="btn-float-label-full">Book a Meeting</span>' +
      '<span class="btn-float-label-short">Booking</span>' +
    '</a>' +
    '<a href="/pages/contact.html" class="btn btn-secondary btn-sm">' +
      '<span class="btn-float-label-full">Send an Enquiry</span>' +
      '<span class="btn-float-label-short">Enquiry</span>' +
    '</a>' +
    '<div class="floating-cta-status">' +
      '<span class="status-dot"></span>' +
      '<span class="status-text"></span>' +
    '</div>' +
    '<p class="floating-cta-note">Typically replies within 4 hours</p>';
  document.body.appendChild(bar);
  updateAvailabilityStatus();
}

/**
 * Hide floating CTA when .cta-section is visible
 */
function initFloatingCta() {
  var floatingBar = document.querySelector('.floating-cta');
  if (!floatingBar) return;

  var visibleSections = {};

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visibleSections[entry.target.className] = entry.isIntersecting;
    });

    var shouldHide = Object.keys(visibleSections).some(function (key) {
      return visibleSections[key];
    });

    if (shouldHide) {
      floatingBar.classList.add('hidden');
    } else {
      floatingBar.classList.remove('hidden');
    }
  }, { threshold: 0.1 });

  // Observe CTA section
  var ctaSection = document.querySelector('.cta-section');
  if (ctaSection) observer.observe(ctaSection);

  // Observe footer (may load async, so retry)
  function observeFooter() {
    var footer = document.querySelector('.footer');
    if (footer) {
      observer.observe(footer);
    } else {
      setTimeout(observeFooter, 500);
    }
  }
  observeFooter();
}

/**
 * Show availability based on UK business hours (Mon-Fri 9-5)
 */
function updateAvailabilityStatus() {
  var dot = document.querySelector('.status-dot');
  var text = document.querySelector('.status-text');
  if (!dot || !text) return;

  var now = new Date();
  var ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  var day = ukTime.getDay();
  var hour = ukTime.getHours();
  var isBusinessHours = day >= 1 && day <= 5 && hour >= 7 && hour < 17;

  if (isBusinessHours) {
    dot.classList.add('online');
    text.textContent = 'Available now';
  } else {
    dot.classList.remove('online');
    text.textContent = 'Leave a message';
  }
}

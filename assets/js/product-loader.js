/**
 * SCGS — Google Sheets Product Loader
 * Fetches product data from a published Google Sheet with multiple tabs (one per category)
 *
 * SETUP:
 * 1. Create a Google Sheet with one tab per category
 * 2. Each tab has columns: Name, Type, Description, Category, Subcategory, Image, Spec Sheet
 * 3. Tab names must match the SHEET_TABS keys below
 * 4. File > Share > Publish to web (Entire Document)
 * 5. Set SHEET_ID below to your spreadsheet ID
 */

var SHEET_ID = '1wNH0nsB7643Zp9JxEZo4C63jDByzJ5H8Pzr1T865qrE';

// Map category names to sheet tab names
// Update these if Alvin renames the tabs in Google Sheets
var SHEET_TABS = {
  'regulators': 'regulators',
  'valves': 'valves',
  'filters': 'filters',
  'laboratory-fittings': 'laboratory-fittings',
  'accessories': 'accessories'
};

function getSheetURL(tabName) {
  return 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(tabName);
}

document.addEventListener('DOMContentLoaded', function () {
  var productGrid = document.querySelector('.product-grid');
  var sidebar = document.querySelector('.product-sidebar');
  if (!productGrid || !sidebar) return;

  var category = document.body.getAttribute('data-category');
  if (!category) return;

  var tabName = SHEET_TABS[category];
  if (!tabName) {
    console.error('No sheet tab configured for category:', category);
    return;
  }

  fetch(getSheetURL(tabName))
    .then(function (response) { return response.text(); })
    .then(function (text) {
      var json = JSON.parse(text.substring(47, text.length - 2));
      var rows = json.table.rows;

      var products = [];

      function getCell(cells, index) {
        if (!cells || index >= cells.length || !cells[index]) return '';
        return cells[index].v != null ? String(cells[index].v) : '';
      }

      for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].c;
        var product = {
          name: getCell(cells, 0),
          type: getCell(cells, 1),
          description: getCell(cells, 2),
          category: getCell(cells, 3).toLowerCase().trim(),
          subcategory: getCell(cells, 4).toLowerCase().trim(),
          priority: parseInt(getCell(cells, 5), 10) || 99,
          image: getCell(cells, 6),
          flipImage: getCell(cells, 7),
          specSheet: getCell(cells, 8),
          altText: getCell(cells, 9)
        };
        if (product.name) {
          products.push(product);
        }
      }

      // Sort by priority (1 = highest, empty = 99)
      products.sort(function (a, b) { return a.priority - b.priority; });

      if (products.length === 0) {
        productGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--light-grey);padding:40px;">No products found. Products will appear here once added to the spreadsheet.</p>';
        updateCount(0);
        return;
      }

      productGrid.innerHTML = '';
      products.forEach(function (product) {
        var card = document.createElement('div');
        card.className = 'card product-card-item';
        card.setAttribute('data-subcategory', product.subcategory);
        card.setAttribute('data-priority', product.priority);
        card.style.padding = '0';

        var imageURL = convertImageURL(product.image);
        var flipImageURL = convertImageURL(product.flipImage);
        var altText = product.altText || product.name;
        var imageHTML = imageURL
          ? '<div class="product-image-flip' + (flipImageURL ? ' has-flip' : '') + '"><img class="product-img-main" src="' + escapeHTML(imageURL) + '" alt="' + escapeHTML(altText) + '" style="width:100%;height:100%;object-fit:cover;">' +
            (flipImageURL ? '<img class="product-img-flip" src="' + escapeHTML(flipImageURL) + '" alt="' + escapeHTML(altText) + '" style="width:100%;height:100%;object-fit:cover;">' : '') +
            '</div>'
          : '[Product Image]';

        var specURL = convertPdfURL(product.specSheet);
        var specSheetHTML = specURL
          ? '<a href="' + escapeHTML(specURL) + '" class="btn btn-sm btn-outline" style="text-align:center;justify-content:center;" target="_blank">Spec Sheet</a>'
          : '';

        var typeHTML = product.type
          ? '<p style="font-size:11px;color:var(--light-grey);margin-bottom:4px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">' + escapeHTML(product.type) + '</p>'
          : '';

        var descHTML = product.description
          ? '<p style="font-size:13px;color:var(--med-grey);margin-bottom:16px;">' + escapeHTML(product.description) + '</p>'
          : '';

        card.innerHTML =
          '<div class="card-image" style="aspect-ratio:1;min-height:180px;">' + imageHTML + '</div>' +
          '<div class="card-body">' +
            typeHTML +
            '<h3 style="margin-bottom:8px;">' + escapeHTML(product.name) + '</h3>' +
            descHTML +
            '<div style="display:flex;flex-direction:column;gap:16px;margin-top:auto;">' +
              '<a href="/pages/contact.html" class="btn btn-sm btn-primary" style="text-align:center;justify-content:center;">I\'m Interested</a>' +
              specSheetHTML +
            '</div>' +
          '</div>';

        productGrid.appendChild(card);
      });

      productGrid.classList.add('loaded');
      initFiltering();
      initMobileFilter();
      initLightbox();
      initImageFlip();
      initSorting(products);

      var firstItem = sidebar.querySelector('li.active');
      if (firstItem) firstItem.click();
    })
    .catch(function (error) {
      console.error('Failed to load products from sheet "' + tabName + '":', error);
      productGrid.classList.add('loaded');
      initFiltering();
    });
});

/**
 * Initialize sidebar filtering (works for both dynamic and hardcoded cards)
 */
function initFiltering() {
  var sidebar = document.querySelector('.product-sidebar');
  var cards = document.querySelectorAll('.product-card-item');
  if (!sidebar || !cards.length) return;

  var items = sidebar.querySelectorAll('li');

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      // Update active state
      items.forEach(function (li) { li.classList.remove('active'); });
      this.classList.add('active');

      // Filter cards
      var visibleCount = 0;
      cards = document.querySelectorAll('.product-card-item');
      cards.forEach(function (card) {
        if (card.getAttribute('data-subcategory') === filter) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      updateCount(visibleCount);
    });
  });
}

/**
 * Create mobile dropdown filter from sidebar items
 */
function initMobileFilter() {
  var sidebar = document.querySelector('.product-sidebar');
  var productLayout = document.querySelector('.product-layout');
  if (!sidebar || !productLayout) return;

  // Create dropdown select
  var select = document.createElement('select');
  select.className = 'product-filter-dropdown';

  var items = sidebar.querySelectorAll('li');
  items.forEach(function (item) {
    var option = document.createElement('option');
    option.value = item.getAttribute('data-filter');
    option.textContent = item.textContent;
    if (item.classList.contains('active')) option.selected = true;
    select.appendChild(option);
  });

  // Add "Filter type" as first option (selected by default)
  var defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Filter type';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.insertBefore(defaultOption, select.firstChild);

  // Insert dropdown next to "Sort by" select
  var sortBar = productLayout.querySelector('div > div[style*="justify-content"]');
  if (sortBar) {
    var sortSelect = sortBar.querySelector('select');
    if (sortSelect) {
      sortBar.insertBefore(select, sortSelect);
    } else {
      sortBar.appendChild(select);
    }
  } else {
    productLayout.parentNode.insertBefore(select, productLayout);
  }

  // Sync dropdown with sidebar filtering
  select.addEventListener('change', function () {
    var filter = this.value;
    items.forEach(function (item) {
      if (item.getAttribute('data-filter') === filter) {
        item.click();
      }
    });
  });

  // Auto-select first real option on load
  var firstFilter = items[0] ? items[0].getAttribute('data-filter') : '';
  if (firstFilter) {
    select.value = firstFilter;
    defaultOption.selected = false;
  }

  // Move product count out of the sticky bar on mobile
  var productCount = document.querySelector('.product-count');
  var productGrid = document.querySelector('.product-grid');
  if (productCount && productGrid) {
    var countWrapper = document.createElement('div');
    countWrapper.className = 'product-count-mobile';
    countWrapper.appendChild(productCount.cloneNode(true));
    productGrid.parentNode.insertBefore(countWrapper, productGrid);
    productCount.style.display = 'none';
  }
}

/**
 * Initialize sort dropdown functionality
 */
function initSorting(products) {
  var sortSelect = document.querySelector('.product-layout select[value], .product-layout select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', function () {
    var value = this.value;
    var cards = Array.from(document.querySelectorAll('.product-card-item'));
    var grid = document.querySelector('.product-grid');
    if (!grid || !cards.length) return;

    if (value === 'az') {
      cards.sort(function (a, b) {
        var nameA = (a.querySelector('h3') || {}).textContent || '';
        var nameB = (b.querySelector('h3') || {}).textContent || '';
        return nameA.localeCompare(nameB);
      });
    } else if (value === 'za') {
      cards.sort(function (a, b) {
        var nameA = (a.querySelector('h3') || {}).textContent || '';
        var nameB = (b.querySelector('h3') || {}).textContent || '';
        return nameB.localeCompare(nameA);
      });
    } else {
      // Default: sort by priority (stored as data attribute)
      cards.sort(function (a, b) {
        var pA = parseInt(a.getAttribute('data-priority') || '99', 10);
        var pB = parseInt(b.getAttribute('data-priority') || '99', 10);
        return pA - pB;
      });
    }

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  });
}

function updateCount(count) {
  var countEl = document.querySelector('.product-count');
  if (countEl) {
    countEl.textContent = 'Showing ' + count + ' product' + (count !== 1 ? 's' : '');
  }
}

/**
 * Lightbox for product images
 */
function initLightbox() {
  if (document.querySelector('.lightbox-overlay')) return;

  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML =
    '<div class="lightbox-content">' +
      '<button class="lightbox-prev">&#8249;</button>' +
      '<button class="lightbox-next">&#8250;</button>' +
      '<img src="" alt="">' +
      '<p class="lightbox-caption"></p>' +
      '<p class="lightbox-counter"></p>' +
    '</div>';
  document.body.appendChild(overlay);

  var img = overlay.querySelector('img');
  var caption = overlay.querySelector('.lightbox-caption');
  var counter = overlay.querySelector('.lightbox-counter');
  var prevBtn = overlay.querySelector('.lightbox-prev');
  var nextBtn = overlay.querySelector('.lightbox-next');
  var currentImages = [];
  var currentIndex = 0;

  function showImage(index) {
    currentIndex = index;
    img.src = currentImages[index];
    counter.textContent = currentImages.length > 1 ? (index + 1) + ' / ' + currentImages.length : '';
    prevBtn.style.display = currentImages.length > 1 ? '' : 'none';
    nextBtn.style.display = currentImages.length > 1 ? '' : 'none';
  }

  prevBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    showImage(currentIndex === 0 ? currentImages.length - 1 : currentIndex - 1);
  });

  nextBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    showImage(currentIndex === currentImages.length - 1 ? 0 : currentIndex + 1);
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') overlay.classList.remove('active');
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });

  document.querySelectorAll('.product-card-item .card-image').forEach(function (cardImage) {
    cardImage.addEventListener('click', function () {
      var mainImg = this.querySelector('.product-img-main');
      var flipImg = this.querySelector('.product-img-flip');
      if (!mainImg) {
        var singleImg = this.querySelector('img');
        if (!singleImg) return;
        mainImg = singleImg;
      }

      var card = this.closest('.product-card-item');
      var name = card ? card.querySelector('h3') : null;

      currentImages = [mainImg.src];
      if (flipImg && flipImg.src) currentImages.push(flipImg.src);

      img.alt = mainImg.alt || '';
      caption.textContent = name ? name.textContent : '';
      showImage(0);
      overlay.classList.add('active');
    });
  });
}

function escapeHTML(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Convert Google Drive share links to direct image URLs
 * Accepts: https://drive.google.com/file/d/XXXXX/view?usp=sharing
 * Returns: https://drive.google.com/uc?export=view&id=XXXXX
 * Also passes through regular image URLs unchanged
 */
function convertImageURL(url) {
  if (!url) return '';
  // Only accept Google Drive file links or direct image URLs
  var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return 'https://lh3.googleusercontent.com/d/' + match[1];
  }
  // Also handle id= format
  var match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    return 'https://lh3.googleusercontent.com/d/' + match2[1];
  }
  // Only pass through URLs that look like direct image links
  if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i)) {
    return url;
  }
  // Reject non-image URLs (Google Sheets, Docs, etc.)
  return '';
}

/**
 * Convert Google Drive share links to direct PDF preview URLs
 * Accepts: https://drive.google.com/file/d/XXXXX/view?usp=sharing
 * Returns: https://drive.google.com/file/d/XXXXX/preview
 */
function convertPdfURL(url) {
  if (!url) return '';
  var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return 'https://drive.google.com/file/d/' + match[1] + '/preview';
  }
  return url;
}

/**
 * Initialize image flip on touch for mobile
 * Desktop uses CSS :hover, mobile uses touchstart/touchend with 150ms delay
 */
function initImageFlip() {
  var cards = document.querySelectorAll('.product-card-item');
  if (!cards.length) return;

  cards.forEach(function (card) {
    var flipContainer = card.querySelector('.product-image-flip');
    if (!flipContainer || !flipContainer.querySelector('.product-img-flip')) return;

    var flipTimer = null;

    card.addEventListener('touchstart', function (e) {
      flipTimer = setTimeout(function () {
        flipContainer.classList.add('flipped');
      }, 150);
    }, { passive: true });

    card.addEventListener('touchend', function () {
      clearTimeout(flipTimer);
      flipContainer.classList.remove('flipped');
    });

    card.addEventListener('touchcancel', function () {
      clearTimeout(flipTimer);
      flipContainer.classList.remove('flipped');
    });
  });
}

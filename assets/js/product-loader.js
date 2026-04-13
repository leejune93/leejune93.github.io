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
      for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].c;
        var product = {
          name: cells[0] ? (cells[0].v || '') : '',
          type: cells[1] ? (cells[1].v || '') : '',
          description: cells[2] ? (cells[2].v || '') : '',
          category: cells[3] ? (cells[3].v || '').toLowerCase().trim() : '',
          subcategory: cells[4] ? (cells[4].v || '').toLowerCase().trim() : '',
          image: cells[5] ? (cells[5].v || '') : '',
          specSheet: cells[6] ? (cells[6].v || '') : ''
        };
        if (product.name) {
          products.push(product);
        }
      }

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
        card.style.padding = '0';

        var imageURL = convertImageURL(product.image);
        var imageHTML = imageURL
          ? '<img src="' + escapeHTML(imageURL) + '" alt="' + escapeHTML(product.name) + '" style="width:100%;height:100%;object-fit:cover;">'
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
              '<a href="' + (document.querySelector('base') ? document.querySelector('base').getAttribute('href').replace(/\/$/, '') : '') + '/pages/contact.html" class="btn btn-sm btn-primary" style="text-align:center;justify-content:center;">I\'m Interested</a>' +
              specSheetHTML +
            '</div>' +
          '</div>';

        productGrid.appendChild(card);
      });

      productGrid.classList.add('loaded');
      initFiltering();
      initMobileFilter();
      initLightbox();

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
  // Create lightbox overlay if it doesn't exist
  if (document.querySelector('.lightbox-overlay')) return;

  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML =
    '<div class="lightbox-content">' +
      '<button class="lightbox-close">&times;</button>' +
      '<img src="" alt="">' +
      '<p class="lightbox-caption"></p>' +
    '</div>';
  document.body.appendChild(overlay);

  var img = overlay.querySelector('img');
  var caption = overlay.querySelector('.lightbox-caption');
  var closeBtn = overlay.querySelector('.lightbox-close');

  // Close on overlay click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target === closeBtn) {
      overlay.classList.remove('active');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') overlay.classList.remove('active');
  });

  // Attach click to product images
  document.querySelectorAll('.product-card-item .card-image').forEach(function (cardImage) {
    cardImage.addEventListener('click', function () {
      var productImg = this.querySelector('img');
      if (!productImg) return;

      var card = this.closest('.product-card-item');
      var name = card ? card.querySelector('h3') : null;

      img.src = productImg.src;
      img.alt = productImg.alt;
      caption.textContent = name ? name.textContent : '';
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
  var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return 'https://lh3.googleusercontent.com/d/' + match[1];
  }
  // Also handle id= format
  var match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    return 'https://lh3.googleusercontent.com/d/' + match2[1];
  }
  return url;
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

/**
 * SCGS — Spec Sheet Loader for Resources Page
 * Fetches documentation from the "spec-sheets" tab in Google Sheets
 * Columns: Name | Category | PDF Link
 */

(function () {
  var SHEET_ID = '1wNH0nsB7643Zp9JxEZo4C63jDByzJ5H8Pzr1T865qrE';
  var TAB_NAME = 'spec-sheets';

  var grid = document.querySelector('.spec-grid');
  var countEl = document.querySelector('.spec-count');
  var filterBtns = document.querySelectorAll('.spec-filter-btn');
  if (!grid) return;

  var allSpecs = [];
  var currentPage = 1;
  var perPage = 9; // 3 rows x 3 columns
  var currentFilter = 'all';

  var CATEGORY_LABELS = {
    'regulators': 'Regulators',
    'valves': 'Valves',
    'filters': 'Filters',
    'laboratory-fittings': 'Laboratory Fittings',
    'accessories': 'Accessories'
  };

  function getSheetURL() {
    return 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(TAB_NAME);
  }

  function convertPdfURL(url) {
    if (!url) return '';
    var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return 'https://drive.google.com/file/d/' + match[1] + '/preview';
    return url;
  }

  function getThumbnailURL(url) {
    if (!url) return '';
    var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return 'https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w400';
    return '';
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderCards(filter, page) {
    currentFilter = filter;
    currentPage = page || 1;

    var filtered = filter === 'all'
      ? allSpecs
      : allSpecs.filter(function (s) { return s.category === filter; });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML =
        '<div style="grid-column:1/-1;text-align:center;padding:64px 24px;">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--light-grey)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>' +
          '<p style="font-size:16px;font-weight:600;color:var(--med-grey);margin-bottom:4px;">Coming Soon</p>' +
          '<p style="font-size:14px;color:var(--light-grey);margin:0;">Documentation for this category is not yet available. Check back soon.</p>' +
        '</div>';
      countEl.textContent = '';
      renderPagination(0);
      return;
    }

    var totalPages = Math.ceil(filtered.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * perPage;
    var pageItems = filtered.slice(start, start + perPage);

    pageItems.forEach(function (spec) {
      var card = document.createElement('div');
      card.className = 'card spec-card';
      card.style.cssText = 'padding:0;overflow:hidden;display:flex;flex-direction:row;width:100%;';
      var thumbURL = getThumbnailURL(spec.pdfLink);
      card.innerHTML =
        '<div style="width:140px;min-height:160px;flex-shrink:0;background:var(--bg-light);display:flex;align-items:center;justify-content:center;overflow:hidden;">' +
          (thumbURL ? '<img src="' + escapeHTML(thumbURL) + '" alt="' + escapeHTML(spec.name) + '" style="width:100%;height:100%;object-fit:cover;">' : '<span style="font-size:48px;color:var(--light-grey);">&#128196;</span>') +
        '</div>' +
        '<div style="padding:20px;display:flex;flex-direction:column;flex:1;">' +
          '<p style="font-size:11px;color:var(--light-grey);margin:0 0 4px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">' + escapeHTML(spec.categoryLabel) + '</p>' +
          '<h3 style="font-size:16px;margin:0 0 8px;">' + escapeHTML(spec.name) + '</h3>' +
          '<p style="font-size:12px;color:var(--light-grey);margin:0 0 16px;">Available in: <strong style="color:var(--dark-grey);">EN</strong></p>' +
          '<a href="' + escapeHTML(spec.url) + '" class="btn btn-sm btn-accent" target="_blank" style="text-align:center;margin-top:auto;">Download PDF</a>' +
        '</div>';
      grid.appendChild(card);
    });

    countEl.textContent = 'Showing ' + (start + 1) + '–' + (start + pageItems.length) + ' of ' + filtered.length + ' spec sheet' + (filtered.length !== 1 ? 's' : '');
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    var existing = document.querySelector('.spec-pagination');
    if (existing) existing.remove();

    if (totalPages <= 1) return;

    var nav = document.createElement('div');
    nav.className = 'spec-pagination';
    nav.style.cssText = 'display:flex;justify-content:center;gap:8px;margin-top:32px;';

    // Previous button
    var prev = document.createElement('button');
    prev.className = 'btn btn-sm btn-outline';
    prev.textContent = '\u2039';
    prev.style.cssText = 'min-width:36px;';
    prev.disabled = currentPage === 1;
    if (currentPage === 1) prev.style.opacity = '0.4';
    prev.addEventListener('click', function () {
      if (currentPage > 1) renderCards(currentFilter, currentPage - 1);
    });
    nav.appendChild(prev);

    // Page numbers
    for (var i = 1; i <= totalPages; i++) {
      (function (page) {
        var btn = document.createElement('button');
        btn.className = page === currentPage ? 'btn btn-sm btn-accent' : 'btn btn-sm btn-outline';
        btn.textContent = page;
        btn.style.cssText = 'min-width:36px;';
        btn.addEventListener('click', function () {
          renderCards(currentFilter, page);
        });
        nav.appendChild(btn);
      })(i);
    }

    // Next button
    var next = document.createElement('button');
    next.className = 'btn btn-sm btn-outline';
    next.textContent = '\u203A';
    next.style.cssText = 'min-width:36px;';
    next.disabled = currentPage === totalPages;
    if (currentPage === totalPages) next.style.opacity = '0.4';
    next.addEventListener('click', function () {
      if (currentPage < totalPages) renderCards(currentFilter, currentPage + 1);
    });
    nav.appendChild(next);

    grid.parentNode.insertBefore(nav, grid.nextSibling);
  }

  var PRODUCT_TABS = ['regulators', 'valves', 'filters', 'laboratory-fittings', 'accessories'];
  var seen = {};

  function addSpec(name, category, pdfLink) {
    var key = name.toLowerCase() + '|' + pdfLink;
    if (seen[key]) return;
    seen[key] = true;
    allSpecs.push({
      name: name,
      category: category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      url: convertPdfURL(pdfLink),
      pdfLink: pdfLink
    });
  }

  // Fetch spec-sheets tab (columns: Name, Category, PDF Link)
  var specSheetFetch = fetch(getSheetURL())
    .then(function (r) { return r.text(); })
    .then(function (text) {
      var json = JSON.parse(text.substring(47, text.length - 2));
      var rows = json.table.rows;
      for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].c;
        var name = cells[0] ? (cells[0].v || '').trim() : '';
        var category = cells[1] ? (cells[1].v || '').toLowerCase().trim() : '';
        var pdfLink = cells[2] ? (cells[2].v || '').trim() : '';
        if (name && name !== 'Name' && pdfLink) {
          addSpec(name, category, pdfLink);
        }
      }
    })
    .catch(function (err) {
      console.error('Failed to load spec-sheets tab:', err);
    });

  // Fetch each product tab (columns: Name, Type, Desc, Category, Subcategory, Image, Spec Sheet)
  var productFetches = PRODUCT_TABS.map(function (tab) {
    var url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(tab);
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var json = JSON.parse(text.substring(47, text.length - 2));
        var rows = json.table.rows;
        for (var i = 0; i < rows.length; i++) {
          var cells = rows[i].c;
          var name = cells[0] ? (cells[0].v || '').trim() : '';
          var specSheet = cells[6] ? (cells[6].v || '').trim() : '';
          if (name && name !== 'Name' && specSheet) {
            addSpec(name, tab, specSheet);
          }
        }
      })
      .catch(function (err) {
        console.error('Failed to load product tab ' + tab + ':', err);
      });
  });

  Promise.all([specSheetFetch].concat(productFetches)).then(function () {
    renderCards('all', 1);
  });

  // Filter buttons
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        b.classList.remove('active', 'btn-accent');
        b.classList.add('btn-outline');
      });
      this.classList.remove('btn-outline');
      this.classList.add('active', 'btn-accent');
      renderCards(this.getAttribute('data-filter'), 1);
    });
  });
})();

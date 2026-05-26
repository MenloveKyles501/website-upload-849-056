(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = select('[data-menu-toggle]');
    var panel = select('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = select('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var prev = select('[data-hero-prev]', slider);
    var next = select('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var section = panel.parentElement;
      var grid = select('[data-filter-grid]', section);
      var empty = select('[data-filter-empty]', section);
      var keywordInput = select('[data-filter-keyword]', panel);
      var yearSelect = select('[data-filter-year]', panel);
      var regionSelect = select('[data-filter-region]', panel);
      var resetButton = select('[data-filter-reset]', panel);
      var cards = selectAll('[data-movie-card]', grid || section);

      function apply() {
        var keyword = normalize(keywordInput ? keywordInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
          ].join(' '));
          var cardYear = card.getAttribute('data-year') || '';
          var cardRegion = card.getAttribute('data-region') || '';
          var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!region || cardRegion === region);
          card.classList.toggle('hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('hidden', visible !== 0);
        }
      }

      [keywordInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (keywordInput) {
            keywordInput.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          apply();
        });
      }
    });
  }

  function initPlayer() {
    var video = select('#movie-player');
    var overlay = select('[data-player-overlay]');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-video-url');
    var attached = false;
    var hls = null;

    function playVideo() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function attach() {
      if (attached || !url) {
        return;
      }
      attached = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = url;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    function start() {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      attach();
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card group">',
      '  <a class="card-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="./' + escapeHtml(movie.cover) + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="play-badge">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var page = select('[data-search-page]');
    if (!page || typeof MOVIE_INDEX === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = select('[data-search-input]', page);
    var status = select('[data-search-status]', page);
    var results = select('[data-search-results]', page);
    if (input) {
      input.value = q;
    }

    function run(value) {
      var keyword = normalize(value);
      var list = MOVIE_INDEX.filter(function (movie) {
        return !keyword || normalize(movie.searchText).indexOf(keyword) !== -1;
      });
      if (!keyword) {
        list = MOVIE_INDEX.slice(0, 24);
      }
      if (status) {
        status.textContent = keyword ? '搜索结果：' + value : '推荐影片';
      }
      if (results) {
        results.innerHTML = list.slice(0, 120).map(renderSearchCard).join('');
      }
    }

    run(q);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();

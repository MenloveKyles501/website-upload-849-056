(function () {
  var headerToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (headerToggle && mobileNav) {
    headerToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      headerToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-to]'));
    var prev = carousel.querySelector('[data-prev]');
    var next = carousel.querySelector('[data-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function resetTimer() {
      window.clearInterval(timer);
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
        resetTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterPages = Array.prototype.slice.call(document.querySelectorAll('.filter-page'));

  filterPages.forEach(function (page) {
    var searchInput = page.querySelector('.movie-search');
    var selects = Array.prototype.slice.call(page.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var active = {};

      selects.forEach(function (select) {
        active[select.getAttribute('data-filter')] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        var matched = !keyword || haystack.indexOf(keyword) !== -1;

        Object.keys(active).forEach(function (key) {
          if (!active[key]) {
            return;
          }

          var value = normalize(card.getAttribute('data-' + key));
          if (value.indexOf(active[key]) === -1) {
            matched = false;
          }
        });

        card.classList.toggle('is-hidden', !matched);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        searchInput.value = query;
      }
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  });
})();

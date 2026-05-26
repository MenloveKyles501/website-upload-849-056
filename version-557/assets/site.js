(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHero(Number(dot.getAttribute("data-hero-dot") || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(current + 1);
    }, 5200);
  }

  var tools = document.querySelector("[data-browser-tools]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var empty = document.querySelector("[data-filter-empty]");

  function includesText(value, query) {
    return String(value || "").toLowerCase().indexOf(String(query || "").toLowerCase()) !== -1;
  }

  function applyFilters() {
    if (!tools || !cards.length) {
      return;
    }

    var text = tools.querySelector("[data-filter-text]");
    var region = tools.querySelector("[data-filter-region]");
    var type = tools.querySelector("[data-filter-type]");
    var year = tools.querySelector("[data-filter-year]");
    var q = text ? text.value.trim() : "";
    var r = region ? region.value : "";
    var t = type ? type.value : "";
    var y = year ? year.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre")
      ].join(" ");
      var ok = true;
      ok = ok && (!q || includesText(haystack, q));
      ok = ok && (!r || includesText(card.getAttribute("data-region"), r));
      ok = ok && (!t || includesText(card.getAttribute("data-type"), t));
      ok = ok && (!y || includesText(card.getAttribute("data-year"), y));
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (tools) {
    tools.addEventListener("input", applyFilters);
    tools.addEventListener("change", applyFilters);
    applyFilters();
  }

  function startPlayer(box) {
    var video = box.querySelector("video");
    if (!video) {
      return;
    }

    var url = box.getAttribute("data-vu") || "";
    if (!url) {
      return;
    }

    if (!box.getAttribute("data-ready")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      box.setAttribute("data-ready", "1");
    }

    box.classList.add("is-playing");
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
    var overlay = box.querySelector(".player-overlay");
    var video = box.querySelector("video");

    if (overlay) {
      overlay.addEventListener("click", function () {
        startPlayer(box);
      });
    }

    if (video) {
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayer(box);
        }
      });
    }
  });
})();

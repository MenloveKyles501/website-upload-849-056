(function () {
    "use strict";

    function getAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = getAll("[data-hero-slide]", slider);
        var dots = getAll("[data-hero-dot]", slider);
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearchForms() {
        getAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");

                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function matchYearFilter(year, filter) {
        if (!filter) {
            return true;
        }

        year = Number(year || 0);

        if (filter === "2020s") {
            return year >= 2020 && year <= 2029;
        }

        if (filter === "2010s") {
            return year >= 2010 && year <= 2019;
        }

        if (filter === "2000s") {
            return year >= 2000 && year <= 2009;
        }

        if (filter === "older") {
            return year > 0 && year < 2000;
        }

        return true;
    }

    function setupFilters() {
        var list = document.querySelector("[data-movie-list]");
        var input = document.querySelector("[data-filter-input]");
        var categorySelect = document.querySelector("[data-category-select]");
        var typeSelect = document.querySelector("[data-type-select]");
        var yearSelect = document.querySelector("[data-year-select]");
        var count = document.querySelector("[data-visible-count]");
        var empty = document.querySelector("[data-empty-state]");

        if (!list) {
            return;
        }

        var cards = getAll("[data-movie-card]", list);
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (input && query) {
            input.value = query;
        }

        function apply() {
            var text = input ? input.value.trim().toLowerCase() : "";
            var category = categorySelect ? categorySelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardCategory = card.getAttribute("data-category") || "";
                var cardType = card.getAttribute("data-type") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var ok = true;

                if (text && haystack.indexOf(text) === -1) {
                    ok = false;
                }

                if (category && cardCategory !== category) {
                    ok = false;
                }

                if (type && cardType !== type) {
                    ok = false;
                }

                if (!matchYearFilter(cardYear, year)) {
                    ok = false;
                }

                card.hidden = !ok;

                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = "当前显示 " + visible + " / " + cards.length + " 部";
            }

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, categorySelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function setupPlayers() {
        getAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var startButton = player.querySelector("[data-player-start]");
            var source = player.getAttribute("data-source");
            var started = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (started) {
                    return;
                }

                started = true;
                player.classList.add("is-playing");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                attachSource();
                var promise = video.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (startButton) {
                startButton.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    play();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function setupImageFallback() {
        getAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHeroSlider();
        setupSearchForms();
        setupFilters();
        setupPlayers();
        setupImageFallback();
    });
})();

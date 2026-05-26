(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener("click", function () {
            var isOpen = mobilePanel.classList.toggle("is-open");
            mobileButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";

            if (!query) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
                return;
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function restartHero() {
        if (!slides.length) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            restartHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-slide"));
            showSlide(index);
            restartHero();
        });
    });

    restartHero();

    document.querySelectorAll(".filter-bar").forEach(function (bar) {
        var buttons = Array.prototype.slice.call(bar.querySelectorAll(".filter-button"));
        var grid = bar.parentElement ? bar.parentElement.querySelector(".movie-grid") : null;
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-filter") || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-filter") || "";
                    var visible = !value || text.indexOf(value) !== -1;
                    card.style.display = visible ? "" : "none";
                });
            });
        });
    });

    var searchResults = document.getElementById("search-results");
    var searchStatus = document.getElementById("search-status");

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSearch() {
        if (!searchResults || !searchStatus || !window.movieSearchData) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var pageInput = document.querySelector(".search-page-form input[name='q']");

        if (pageInput) {
            pageInput.value = query;
        }

        if (!query) {
            searchResults.innerHTML = "";
            searchStatus.textContent = "请输入关键词开始搜索";
            return;
        }

        var lower = query.toLowerCase();
        var results = window.movieSearchData.filter(function (movie) {
            return movie.keywords.toLowerCase().indexOf(lower) !== -1;
        }).slice(0, 96);

        searchStatus.textContent = results.length ? "为你找到相关内容" : "未找到匹配内容";
        searchResults.innerHTML = results.map(function (movie) {
            return "<article class=\"movie-card\">" +
                "<a class=\"card-cover\" href=\"./" + escapeHtml(movie.file) + "\">" +
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                "<span class=\"card-badge\">" + escapeHtml(movie.year) + "</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                "<a href=\"./" + escapeHtml(movie.file) + "\" class=\"card-title\">" + escapeHtml(movie.title) + "</a>" +
                "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
                "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                "<div class=\"tag-row\">" + movie.tags.slice(0, 3).map(function (tag) {
                    return "<span>" + escapeHtml(tag) + "</span>";
                }).join("") + "</div>" +
                "</div>" +
                "</article>";
        }).join("");
    }

    renderSearch();
}());

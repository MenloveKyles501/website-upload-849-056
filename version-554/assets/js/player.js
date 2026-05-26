(function () {
    var hlsCache = {};

    window.initMoviePlayer = function (videoId, buttonId, stream) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);

        if (!video || !stream) {
            return;
        }

        function bindStream() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            video.setAttribute("data-ready", "1");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hlsCache[videoId] = hls;
                return;
            }

            video.src = stream;
        }

        function startPlayback() {
            bindStream();

            if (button) {
                button.classList.add("is-hidden");
            }

            var action = video.play();

            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
    };
}());

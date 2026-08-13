/* ==========================================
   PARTICLES
========================================== */

const particlesContainer =
    document.getElementById("particles");

function createParticles() {

    particlesContainer.innerHTML = "";

    for (let i = 0; i < 70; i++) {

        const particle =
            document.createElement("div");

        particle.classList.add("particle");

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.animationDuration =
            (6 + Math.random() * 12) + "s";

        particle.style.animationDelay =
            Math.random() * 10 + "s";

        particle.style.opacity =
            String(Math.random());

        const size = 1 + Math.random() * 3;

        particle.style.width = size + "px";
        particle.style.height = size + "px";

        particlesContainer.appendChild(particle);
    }
}


/* ==========================================
   OPTIONS OVERLAY
========================================== */

const optionsButton =
    document.getElementById("options-button");

const optionsOverlay =
    document.getElementById("options-overlay");

const closeOptions =
    document.getElementById("close-options");

optionsButton.addEventListener("click", () => {
    optionsOverlay.classList.remove("hidden");
});

closeOptions.addEventListener("click", () => {
    optionsOverlay.classList.add("hidden");
});

optionsOverlay.addEventListener("click", (event) => {

    if (event.target === optionsOverlay) {
        optionsOverlay.classList.add("hidden");
    }
});


/* ==========================================
   TOGGLES (particles / fog / glow / animations / sound / AI)
========================================== */

document.querySelectorAll(".toggle").forEach(toggle => {

    toggle.addEventListener("click", () => {

        toggle.classList.toggle("active");

        const isActive =
            toggle.classList.contains("active");

        const option = toggle.dataset.option;

        toggle.textContent = isActive ? "ON" : "OFF";

        if (option === "particles") {

            particlesContainer.style.display =
                isActive ? "block" : "none";
        }

        if (option === "fog") {

            document.querySelectorAll(".fog").forEach(fog => {
                fog.style.display = isActive ? "block" : "none";
            });
        }

        if (option === "glow") {
            document.body.classList.toggle("no-glow", !isActive);
        }

        if (option === "animations") {
            document.body.classList.toggle("no-animation", !isActive);
        }

        if (option === "sound") {

            soundEnabled = isActive;

            if (isActive) {
                playSound("select");
            }
        }

        if (option === "ai") {

            vsAI = isActive;

            setWarning(
                vsAI
                    ? "PLAYING AGAINST THE MACHINE"
                    : "THE GAME HAS BEGUN"
            );

            if (vsAI) {
                maybeTriggerAIMove();
            }
        }
    });
});


/* ==========================================
   THEME SWITCHER
========================================== */

document.querySelectorAll(".theme-button").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".theme-button").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        document.body.dataset.theme =
            button.dataset.theme;
    });
});


/* ==========================================
   FULLSCREEN
========================================== */

const fullscreenButton =
    document.getElementById("fullscreen-button");

if (fullscreenButton) {

    fullscreenButton.addEventListener("click", () => {

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}


/* ==========================================
   MATCH TIMER
========================================== */

let elapsedSeconds = 0;

const gameTimeEl =
    document.getElementById("game-time");

setInterval(() => {

    if (gameOver) {
        return;
    }

    elapsedSeconds++;

    const minutes =
        Math.floor(elapsedSeconds / 60);

    const seconds =
        elapsedSeconds % 60;

    if (gameTimeEl) {

        gameTimeEl.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }

}, 1000);


/* ==========================================
   AMBIENT FLICKER (respects the animations toggle)
========================================== */

setInterval(() => {

    if (document.body.classList.contains("no-animation")) {
        return;
    }

    if (Math.random() < 0.18) {

        document.body.style.filter = "brightness(.85)";

        setTimeout(() => {
            document.body.style.filter = "";
        }, 80);
    }

}, 3000);


/* ==========================================
   PROMOTION MODAL
========================================== */

const promotionOverlay =
    document.getElementById("promotion-overlay");

const promotionChoices =
    document.getElementById("promotion-choices");

function showPromotionModal(row, col, color, onChoose) {

    promotionChoices.innerHTML = "";

    const options = ["queen", "rook", "bishop", "knight"];

    options.forEach(type => {

        const button =
            document.createElement("div");

        button.classList.add("promotion-piece");

        button.textContent =
            pieces[color][type];

        button.addEventListener("click", () => {

            promotionOverlay.classList.add("hidden");

            onChoose(type);
        });

        promotionChoices.appendChild(button);
    });

    promotionOverlay.classList.remove("hidden");
}


/* ==========================================
   GAME OVER BANNER
========================================== */

const gameOverBanner =
    document.getElementById("game-over-banner");

const gameOverTitle =
    document.getElementById("game-over-title");

const gameOverSubtitle =
    document.getElementById("game-over-subtitle");

const gameOverClose =
    document.getElementById("game-over-close");

function showGameOverBanner(title, subtitle) {

    gameOverTitle.textContent = title;
    gameOverSubtitle.textContent = subtitle;

    gameOverBanner.classList.remove("hidden");
}

gameOverClose.addEventListener("click", () => {
    gameOverBanner.classList.add("hidden");
});

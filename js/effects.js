
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
            Math.random();

        const size =
            1 + Math.random() * 3;

        particle.style.width =
            size + "px";

        particle.style.height =
            size + "px";

        particlesContainer.appendChild(
            particle
        );
    }
}

createParticles();





const optionsButton =
    document.getElementById(
        "options-button"
    );



const optionsOverlay =
    document.getElementById(
        "options-overlay"
    );



const closeOptions =
    document.getElementById(
        "close-options"
    );





optionsButton.addEventListener(
    "click",
    () => {

        optionsOverlay.classList.remove(
            "hidden"
        );

    }
);





closeOptions.addEventListener(
    "click",
    () => {

        optionsOverlay.classList.add(
            "hidden"
        );

    }
);





optionsOverlay.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            optionsOverlay
        ) {

            optionsOverlay.classList.add(
                "hidden"
            );
        }

    }
);






document
    .querySelectorAll(".toggle")
    .forEach(toggle => {

        toggle.addEventListener(
            "click",
            () => {

                toggle.classList.toggle(
                    "active"
                );

                const option =
                    toggle.dataset.option;

                if (
                    option ===
                    "particles"
                ) {

                    particlesContainer.style
                        .display =
                        toggle.classList.contains(
                            "active"
                        )
                            ? "block"
                            : "none";
                }


                if (
                    option === "fog"
                ) {

                    document
                        .querySelectorAll(".fog")
                        .forEach(fog => {

                            fog.style.display =
                                toggle.classList.contains(
                                    "active"
                                )
                                    ? "block"
                                    : "none";

                        });
                }


                if (
                    option === "glow"
                ) {

                    document.body.classList.toggle(
                        "no-glow"
                    );

                }


                if (
                    option ===
                    "animations"
                ) {

                    document.body.classList.toggle(
                        "no-animation"
                    );

                }

            }
        );

    });






document
    .querySelectorAll(".theme-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".theme-button"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });

                button.classList.add(
                    "active"
                );


                const theme =
                    button.dataset.theme;

                document.body.dataset.theme =
                    theme;

            }
        );

    });






const fullscreenButton =
    document.getElementById(
        "fullscreen-button"
    );

fullscreenButton.addEventListener(
    "click",
    () => {

        if (!document.fullscreenElement) {

            document.documentElement
                .requestFullscreen();

        } else {

            document.exitFullscreen();

        }

    }
);






let seconds = 0;

const gameTime =
    document.getElementById(
        "game-time"
    );

setInterval(
    () => {

        seconds++;

        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;

        gameTime.textContent =
            String(minutes).padStart(2, "0")
            + ":" +
            String(remainingSeconds)
                .padStart(2, "0");

    },
    1000
);





let round = 1;

const roundNumber =
    document.getElementById(
        "round-number"
    );


// Detect board clicks
document
    .getElementById(
        "board-container"
    )
    .addEventListener(
        "click",
        () => {

            round++;

            roundNumber.textContent =
                String(round)
                    .padStart(2, "0");

        }
    );







setInterval(
    () => {

        if (
            Math.random() < 0.18
        ) {

            document.body.style.filter =
                "brightness(.85)";

            setTimeout(
                () => {

                    document.body.style.filter =
                        "";

                },
                80
            );

        }

    },
    3000
);
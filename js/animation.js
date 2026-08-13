/* ==========================================
   FLASH A SQUARE (used on captures)
========================================== */

function flashSquare(row, col) {

    const square = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );

    if (!square) {
        return;
    }

    square.classList.add("capture-hit");

    setTimeout(() => {
        square.classList.remove("capture-hit");
    }, 420);
}


/* ==========================================
   SCREEN SHAKE (used on checkmate)
========================================== */

function triggerScreenShake() {

    if (document.body.classList.contains("no-animation")) {
        return;
    }

    document.body.classList.add("screen-shake");

    setTimeout(() => {
        document.body.classList.remove("screen-shake");
    }, 480);
}

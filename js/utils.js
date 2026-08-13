/* ==========================================
   BOARD BOUNDS
========================================== */

function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}


/* ==========================================
   CAPITALIZE
========================================== */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}

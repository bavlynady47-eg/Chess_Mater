let selectedSquare = null;
let currentTurn = "white";
let moveCount = 0;
let gameOver = false;

let whiteKingMoved = false;
let blackKingMoved = false;

let whiteRookAMoved = false;
let whiteRookHMoved = false;

let blackRookAMoved = false;
let blackRookHMoved = false;

/* Square that can currently be captured en passant, e.g. { row, col } */
let enPassantTarget = null;

/* Half-moves since the last pawn move or capture (50-move rule = 100) */
let halfmoveClock = 0;


/* ==========================================
   FINISH TURN
   Called once a move's board mutation (and any
   promotion choice) is fully resolved.
========================================== */

function finishTurn(moveMeta) {

    currentTurn =
        currentTurn === "white"
            ? "black"
            : "white";

    moveCount++;

    updateTurnUI();

    createBoard();

    if (moveMeta.wasCastle) {
        playSound("castle");
    } else if (moveMeta.isPromotion) {
        playSound("promote");
    } else if (moveMeta.wasCapture) {
        playSound("capture");
    } else {
        playSound("move");
    }

    if (moveMeta.wasCapture) {
        flashSquare(moveMeta.toRow, moveMeta.toCol);
    }

    checkGameState();

    if (!gameOver) {
        maybeTriggerAIMove();
    }
}


/* ==========================================
   CHECK GAME STATE
   Detects checkmate, stalemate, the 50-move
   rule, and insufficient material.
========================================== */

function checkGameState() {

    const opponent =
        currentTurn;

    const inCheck =
        isKingInCheck(opponent);

    const hasMoves =
        playerHasLegalMoves(opponent);

    if (
        inCheck &&
        !hasMoves
    ) {

        gameOver = true;

        setWarning(
            `${capitalize(opponent)} is CHECKMATED`
        );

        playSound("checkmate");
        triggerScreenShake();

        showGameOverBanner(
            "CHECKMATE",
            `${capitalize(
                opponent === "white" ? "black" : "white"
            )} wins the game.`
        );

        return;
    }


    if (
        !inCheck &&
        !hasMoves
    ) {

        gameOver = true;

        setWarning("STALEMATE");

        playSound("draw");

        showGameOverBanner(
            "STALEMATE",
            "Neither king can be trapped - the game is a draw."
        );

        return;
    }


    if (halfmoveClock >= 100) {

        gameOver = true;

        setWarning("DRAW \u2014 50 MOVE RULE");

        playSound("draw");

        showGameOverBanner(
            "DRAW",
            "50 moves passed with no capture or pawn move."
        );

        return;
    }


    if (isInsufficientMaterial()) {

        gameOver = true;

        setWarning("DRAW \u2014 INSUFFICIENT MATERIAL");

        playSound("draw");

        showGameOverBanner(
            "DRAW",
            "Neither side has enough material left to checkmate."
        );

        return;
    }


    if (inCheck) {

        setWarning(
            `${capitalize(opponent)} is in CHECK`
        );

        playSound("check");

    } else {

        setWarning("THE GAME HAS BEGUN");
    }
}


/* ==========================================
   INSUFFICIENT MATERIAL
   King vs king, or king+minor vs king.
========================================== */

function isInsufficientMaterial() {

    const nonKings = [];

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = boardState[row][col];

            if (piece && !piece.endsWith("king")) {
                nonKings.push(piece);
            }
        }
    }

    if (nonKings.length === 0) {
        return true;
    }

    if (nonKings.length === 1) {

        const [, type] = nonKings[0].split("-");

        if (type === "bishop" || type === "knight") {
            return true;
        }
    }

    return false;
}


/* ==========================================
   CHECK IF PLAYER HAS LEGAL MOVES
========================================== */

function playerHasLegalMoves(color) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                boardState[row][col];

            if (!piece) {
                continue;
            }

            if (
                piece.startsWith(color + "-")
            ) {

                if (
                    getLegalMoves(row, col).length > 0
                ) {

                    return true;
                }
            }
        }
    }

    return false;
}


/* ==========================================
   UPDATE KING CHECK (visual glow on the king)
========================================== */

function updateKingCheck() {

    document
        .querySelectorAll(".square")
        .forEach(square => {

            square.classList.remove(
                "in-check"
            );

        });

    for (const color of ["white", "black"]) {

        if (isKingInCheck(color)) {

            const king =
                findKing(color);

            if (!king) {
                continue;
            }

            const square =
                document.querySelector(
                    `[data-row="${king.row}"][data-col="${king.col}"]`
                );

            if (square) {
                square.classList.add(
                    "in-check"
                );
            }
        }
    }
}


/* ==========================================
   UPDATE TURN UI
========================================== */

function updateTurnUI() {

    const players =
        document.querySelectorAll(".player");

    if (players.length >= 2) {

        const blackPlayer =
            players[0];

        const whitePlayer =
            players[1];

        blackPlayer.style.opacity =
            currentTurn === "black"
                ? "1"
                : ".45";

        whitePlayer.style.opacity =
            currentTurn === "white"
                ? "1"
                : ".45";
    }

    const roundNumber =
        document.getElementById(
            "round-number"
        );

    if (roundNumber) {

        roundNumber.textContent =
            String(
                Math.floor(moveCount / 2) + 1
            ).padStart(2, "0");
    }
}


/* ==========================================
   WARNING
========================================== */

function setWarning(message) {

    const warning =
        document.querySelector(".game-warning");

    if (!warning) {
        return;
    }

    warning.innerHTML =
        `<span class="warning-dot"></span>
         ${message}`;
}

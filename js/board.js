const board = document.getElementById("board-container");

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

let boardState = [
    [
        "black-rook",
        "black-knight",
        "black-bishop",
        "black-queen",
        "black-king",
        "black-bishop",
        "black-knight",
        "black-rook"
    ],

    [
        "black-pawn",
        "black-pawn",
        "black-pawn",
        "black-pawn",
        "black-pawn",
        "black-pawn",
        "black-pawn",
        "black-pawn"
    ],

    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],

    [
        "white-pawn",
        "white-pawn",
        "white-pawn",
        "white-pawn",
        "white-pawn",
        "white-pawn",
        "white-pawn",
        "white-pawn"
    ],

    [
        "white-rook",
        "white-knight",
        "white-bishop",
        "white-queen",
        "white-king",
        "white-bishop",
        "white-knight",
        "white-rook"
    ]
];

/* Squares of the most recently played move, for highlighting */
let lastMove = null;


/* ==========================================
   CREATE BOARD
========================================== */

function createBoard() {

    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            square.dataset.square =
                files[col] + (8 - row);

            if (
                lastMove &&
                (
                    (row === lastMove.fromRow && col === lastMove.fromCol) ||
                    (row === lastMove.toRow && col === lastMove.toCol)
                )
            ) {
                square.classList.add("last-move");
            }

            const pieceData = boardState[row][col];

            if (pieceData) {

                addPiece(square, pieceData);

                if (
                    lastMove &&
                    row === lastMove.toRow &&
                    col === lastMove.toCol
                ) {

                    const pieceEl =
                        square.querySelector(".chess-piece");

                    if (pieceEl) {
                        pieceEl.classList.add("just-moved");
                    }
                }
            }

            square.addEventListener(
                "click",
                () => handleSquareClick(row, col)
            );

            board.appendChild(square);
        }
    }

    if (selectedSquare !== null) {
        showSelection();
    }

    updateKingCheck();
}


/*
   Rebuild board without recursively
   trying to display selection.
*/

function createBoardWithoutSelection() {

    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            square.dataset.square =
                files[col] + (8 - row);

            if (
                lastMove &&
                (
                    (row === lastMove.fromRow && col === lastMove.fromCol) ||
                    (row === lastMove.toRow && col === lastMove.toCol)
                )
            ) {
                square.classList.add("last-move");
            }

            const pieceData = boardState[row][col];

            if (pieceData) {
                addPiece(square, pieceData);
            }

            square.addEventListener(
                "click",
                () => handleSquareClick(row, col)
            );

            board.appendChild(square);
        }
    }
}


/* ==========================================
   SHOW SELECTED + LEGAL MOVES
========================================== */

function showSelection() {

    createBoardWithoutSelection();

    const selected = document.querySelector(
        `[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`
    );

    if (!selected) {
        return;
    }

    selected.classList.add("selected");

    const moves = getLegalMoves(
        selectedSquare.row,
        selectedSquare.col
    );

    moves.forEach(move => {

        const target = document.querySelector(
            `[data-row="${move.row}"][data-col="${move.col}"]`
        );

        if (!target) {
            return;
        }

        /*
           A square counts as a "capture" visually if there's
           a piece on it, OR if this move is an en passant
           capture (the captured pawn sits on a different
           square than the destination).
        */

        if (
            boardState[move.row][move.col] ||
            move.enPassant
        ) {
            target.classList.add("capture-option");
        } else {
            target.classList.add("move-option");
        }
    });
}


/* ==========================================
   CLICK HANDLER
========================================== */

function handleSquareClick(row, col) {

    if (gameOver) {
        return;
    }

    /* Board is locked while the AI is "thinking" */

    if (vsAI && currentTurn === aiColor) {
        return;
    }

    const clickedPiece = boardState[row][col];

    /* No selected piece yet */

    if (selectedSquare === null) {

        if (!clickedPiece) {
            return;
        }

        const [color] = clickedPiece.split("-");

        if (color !== currentTurn) {
            return;
        }

        selectedSquare = {
            row,
            col
        };

        showSelection();

        return;
    }


    /* Click selected square again */

    if (
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {

        selectedSquare = null;

        createBoard();

        return;
    }


    /* Try to move */

    const legalMoves = getLegalMoves(
        selectedSquare.row,
        selectedSquare.col
    );

    const chosenMove = legalMoves.find(
        move =>
            move.row === row &&
            move.col === col
    );

    if (chosenMove) {

        applyMove(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col,
            chosenMove
        );

        return;
    }


    /* Select another own piece */

    if (clickedPiece) {

        const [color] = clickedPiece.split("-");

        if (color === currentTurn) {

            selectedSquare = {
                row,
                col
            };

            showSelection();

            return;
        }
    }

    selectedSquare = null;

    createBoard();
}


/* ==========================================
   APPLY MOVE
   Mutates board state for a chosen legal move,
   then either opens the promotion modal (human
   promoting a pawn) or hands off straight to
   finishTurn().
========================================== */

function applyMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    chosenMove,
    options = {}
) {

    const piece = boardState[fromRow][fromCol];

    const [color, type] =
        piece.split("-");

    const wasCapture =
        !!boardState[toRow][toCol] ||
        !!chosenMove.enPassant;

    const wasCastle =
        !!chosenMove.castling;

    const isPromotion =
        type === "pawn" &&
        (toRow === 0 || toRow === 7);


    /* 50-move rule bookkeeping (reset on pawn move / capture) */

    if (type === "pawn" || wasCapture) {
        halfmoveClock = 0;
    } else {
        halfmoveClock++;
    }

    movePiece(fromRow, fromCol, toRow, toCol);

    lastMove = { fromRow, fromCol, toRow, toCol };

    selectedSquare = null;

    const moveMeta = {
        wasCapture,
        wasCastle,
        isPromotion,
        color,
        toRow,
        toCol
    };

    if (isPromotion && !options.auto) {

        createBoard();

        showPromotionModal(toRow, toCol, color, (pieceType) => {

            boardState[toRow][toCol] =
                `${color}-${pieceType}`;

            finishTurn(moveMeta);
        });

    } else {

        finishTurn(moveMeta);
    }
}


/* ==========================================
   MOVE PIECE
   Pure board-state mutation: handles en passant
   capture, castling rook movement, and defaults
   promotions to a queen (overridden afterwards
   by applyMove if a human picked something else).
========================================== */

function movePiece(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const piece =
        boardState[fromRow][fromCol];

    const [color, type] =
        piece.split("-");


    /* En passant capture: remove the captured pawn */

    if (
        type === "pawn" &&
        fromCol !== toCol &&
        boardState[toRow][toCol] === null
    ) {

        boardState[fromRow][toCol] = null;
    }


    /* Castling: also move the rook */

    if (
        type === "king" &&
        Math.abs(toCol - fromCol) === 2
    ) {

        if (toCol === 6) {

            boardState[fromRow][5] =
                boardState[fromRow][7];

            boardState[fromRow][7] = null;

        } else if (toCol === 2) {

            boardState[fromRow][3] =
                boardState[fromRow][0];

            boardState[fromRow][0] = null;
        }
    }


    boardState[toRow][toCol] =
        piece;

    boardState[fromRow][fromCol] =
        null;


    /* Pawn promotion (default queen; may be overridden) */

    if (
        type === "pawn" &&
        (
            toRow === 0 ||
            toRow === 7
        )
    ) {

        boardState[toRow][toCol] =
            `${color}-queen`;
    }


    /* Track king / rook moves for future castling rights */

    if (type === "king") {

        if (color === "white") {
            whiteKingMoved = true;
        } else {
            blackKingMoved = true;
        }
    }

    if (type === "rook") {

        if (color === "white") {

            if (fromCol === 0) {
                whiteRookAMoved = true;
            }

            if (fromCol === 7) {
                whiteRookHMoved = true;
            }

        } else {

            if (fromCol === 0) {
                blackRookAMoved = true;
            }

            if (fromCol === 7) {
                blackRookHMoved = true;
            }
        }
    }


    /* Update en passant target for the NEXT move only */

    if (
        type === "pawn" &&
        Math.abs(toRow - fromRow) === 2
    ) {

        enPassantTarget = {
            row: (fromRow + toRow) / 2,
            col: fromCol
        };

    } else {

        enPassantTarget = null;
    }
}

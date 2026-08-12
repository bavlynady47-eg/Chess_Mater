const board = document.getElementById("board-container");

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

const pieces = {

    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }
};

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

let selectedSquare = null;
let currentTurn = "white";
let moveCount = 0;




let whiteKingMoved = false;
let blackKingMoved = false;

let whiteRookAMoved = false;
let whiteRookHMoved = false;

let blackRookAMoved = false;
let blackRookHMoved = false;

/* the squares that can currently be captured en passant*/

let enPassantTarget = null;


/* =============================
   STYLE for move indicators
=========================== */

const moveStyles = document.createElement("style");

moveStyles.textContent = `
    .square.move-option::after {
        content: "";
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(180, 0, 0, 0.75);
        box-shadow:
            0 0 12px rgba(255, 0, 0, 0.8),
            0 0 25px rgba(255, 0, 0, 0.35);
        z-index: 3;
        pointer-events: none;
    }

    .square.capture-option {
        box-shadow:
            inset 0 0 0 4px rgba(180, 0, 0, 0.9),
            inset 0 0 25px rgba(255, 0, 0, 0.35);
    }

    .square.capture-option::after {
        content: "";
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        border: 3px solid rgba(180, 0, 0, 0.8);
        box-shadow:
            0 0 15px rgba(255, 0, 0, 0.7);
        z-index: 3;
        pointer-events: none;
    }

    .square.selected {
        background:
            radial-gradient(
                circle,
                #850000,
                #330000
            ) !important;

        box-shadow:
            inset 0 0 30px rgba(255, 0, 0, .8),
            0 0 15px rgba(255, 0, 0, .5);
    }

    .square.in-check {
        background:
            radial-gradient(
                circle,
                #ff0000,
                #300000
            ) !important;

        animation: checkPulse .7s infinite alternate;
    }

    @keyframes checkPulse {
        from {
            box-shadow:
                inset 0 0 20px rgba(255,0,0,.5);
        }

        to {
            box-shadow:
                inset 0 0 45px rgba(255,0,0,1),
                0 0 20px rgba(255,0,0,.7);
        }
    }
`;

document.head.appendChild(moveStyles);


/* ========================
   create board
========================== */

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

    if (selectedSquare !== null) {
        showSelection();
    }

    updateKingCheck();
}


/* =====================
   add pieces
========================= */

function addPiece(square, pieceData) {

    const [color, type] = pieceData.split("-");

    const piece = document.createElement("div");

    piece.classList.add("chess-piece");

    piece.classList.add(
        color === "white"
            ? "white-piece"
            : "black-piece"
    );

    piece.textContent = pieces[color][type];

    piece.dataset.color = color;
    piece.dataset.type = type;

    square.appendChild(piece);
}


/* ====================
   click handler
==================== */

function handleSquareClick(row, col) {

    const clickedPiece = boardState[row][col];


    /* no selected piece */

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


    /* click selected square again :) */

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

        movePiece(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col
        );

        selectedSquare = null;

        currentTurn =
            currentTurn === "white"
                ? "black"
                : "white";

        moveCount++;

        updateTurnUI();

        createBoard();

        checkGameState();

        return;
    }


    /* select other own pieces :-( */

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
}


/* ==========================
show legal moveees ( "I'm bored :(" )
============================= */

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

        /*capturing square even it is empty :))))))))*/

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


/* =============================
    legal moves yayayay"with the help of chat gpt  :)"
================================ */

function getLegalMoves(row, col) {

    const piece = boardState[row][col];

    if (!piece) {
        return [];
    }

    const [color] = piece.split("-");

    const pseudoMoves = getPseudoMoves(row, col);

    const legalMoves = [];

    for (const move of pseudoMoves) {

        const originalTarget =
            boardState[move.row][move.col];





        /*en passant captures ...it seems to be french :)*/

        let epRow = null;
        let epCol = null;
        let epCapturedPiece = null;

        if (move.enPassant) {

            epRow = row;
            epCol = move.col;

            epCapturedPiece =
                boardState[epRow][epCol];

            boardState[epRow][epCol] = null;
        }

        boardState[move.row][move.col] =
            boardState[row][col];

        boardState[row][col] = null;

        const kingSafe =
            !isKingInCheck(color);

        boardState[row][col] =
            boardState[move.row][move.col];

        boardState[move.row][move.col] =
            originalTarget;

        if (move.enPassant) {
            boardState[epRow][epCol] =
                epCapturedPiece;
        }

        if (kingSafe) {
            legalMoves.push(move);
        }
    }

    return legalMoves;
}


/* =========================
   PSEUDO MOVES ah low le3bt ya zahr!
============================= */

function getPseudoMoves(row, col) {

    const piece = boardState[row][col];

    if (!piece) {
        return [];
    }

    const [color, type] = piece.split("-");

    switch (type) {

        case "pawn":
            return getPawnMoves(row, col, color);

        case "rook":
            return getRookMoves(row, col, color);

        case "knight":
            return getKnightMoves(row, col, color);

        case "bishop":
            return getBishopMoves(row, col, color);

        case "queen":
            return getQueenMoves(row, col, color);

        case "king":
            return getKingMoves(row, col, color);

        default:
            return [];
    }
}


/* ====================
   pawn MOVES "actually it is the king of the game cuz every pawn has the ability to become a queen:) "
==================== */

function getPawnMoves(row, col, color) {

    const moves = [];

    const direction =
        color === "white"
            ? -1
            : 1;

    const startRow =
        color === "white"
            ? 6
            : 1;


    /* One step */

    const oneRow = row + direction;

    if (
        isInsideBoard(oneRow, col) &&
        boardState[oneRow][col] === null
    ) {

        moves.push({
            row: oneRow,
            col
        });


        /* Two steps */

        const twoRow =
            row + direction * 2;

        if (
            row === startRow &&
            boardState[twoRow][col] === null
        ) {

            moves.push({
                row: twoRow,
                col
            });
        }
    }


    /* Captures (including the en passant croisson poisson je suis eleve a'lecole hahah) */

    for (const colOffset of [-1, 1]) {

        const targetRow = row + direction;
        const targetCol = col + colOffset;

        if (
            !isInsideBoard(
                targetRow,
                targetCol
            )
        ) {
            continue;
        }

        const target =
            boardState[targetRow][targetCol];

        if (
            target &&
            target.split("-")[0] !== color
        ) {

            moves.push({
                row: targetRow,
                col: targetCol
            });

        } else if (
            !target &&
            enPassantTarget &&
            enPassantTarget.row === targetRow &&
            enPassantTarget.col === targetCol
        ) {

            moves.push({
                row: targetRow,
                col: targetCol,
                enPassant: true
            });
        }
    }

    return moves;
}


/* ===============
   ROOK MOVES   gotham:"scrifies the roooooooock"
================= */

function getRookMoves(row, col, color) {

    return getSlidingMoves(
        row,
        col,
        color,
        [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ]
    );
}


/* ============================
   BISHOP MOVES
=====   ======== */

function getBishopMoves(row, col, color) {

    return getSlidingMoves(
        row,
        col,
        color,
        [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ]
    );
}


/* =======================
   QUEEN MOVES the goat
========================= */

function getQueenMoves(row, col, color) {

    return getSlidingMoves(
        row,
        col,
        color,
        [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ]
    );
}


/* ====================
   SLIDING PIECES
====================== */

function getSlidingMoves(
    row,
    col,
    color,
    directions
) {

    const moves = [];

    for (const [rowStep, colStep] of directions) {

        let currentRow = row + rowStep;
        let currentCol = col + colStep;

        while (
            isInsideBoard(
                currentRow,
                currentCol
            )
        ) {

            const target =
                boardState[currentRow][currentCol];

            if (!target) {

                moves.push({
                    row: currentRow,
                    col: currentCol
                });

            } else {

                const targetColor =
                    target.split("-")[0];

                if (targetColor !== color) {

                    moves.push({
                        row: currentRow,
                        col: currentCol
                    });
                }

                break;
            }

            currentRow += rowStep;
            currentCol += colStep;
        }
    }

    return moves;
}


/* ====================
   KNIGHT MOVES in the night hahaha
===================== */

function getKnightMoves(row, col, color) {

    const moves = [];

    const offsets = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    for (const [rowOffset, colOffset] of offsets) {

        const targetRow = row + rowOffset;
        const targetCol = col + colOffset;

        if (
            !isInsideBoard(
                targetRow,
                targetCol
            )
        ) {
            continue;
        }

        const target =
            boardState[targetRow][targetCol];

        if (
            !target ||
            target.split("-")[0] !== color
        ) {

            moves.push({
                row: targetRow,
                col: targetCol
            });
        }
    }

    return moves;
}


/* ===============
   KING MOVES  woal "weakest of all time hahaha"
=================== */

function getKingMoves(row, col, color) {

    const moves = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {

        for (
            let colOffset = -1;
            colOffset <= 1;
            colOffset++
        ) {

            if (
                rowOffset === 0 &&
                colOffset === 0
            ) {
                continue;
            }

            const targetRow =
                row + rowOffset;

            const targetCol =
                col + colOffset;

            if (
                !isInsideBoard(
                    targetRow,
                    targetCol
                )
            ) {
                continue;
            }

            const target =
                boardState[targetRow][targetCol];

            if (
                !target ||
                target.split("-")[0] !== color
            ) {

                moves.push({
                    row: targetRow,
                    col: targetCol
                });
            }
        }
    }

    /* Castling */

    moves.push(
        ...getCastlingMoves(row, col, color)
    );

    return moves;
}


/* ===============
   CASTLING MOVES the haaaaaaardest part in the game.... shit!
================== */

function getCastlingMoves(row, col, color) {

    const moves = [];

    const homeRow =
        color === "white"
            ? 7
            : 0;

    /* King must be on its original square until I decide hhhhhhhhaaaaaaaa*/

    if (
        row !== homeRow ||
        col !== 4
    ) {
        return moves;
    }

    const kingMoved =
        color === "white"
            ? whiteKingMoved
            : blackKingMoved;

    if (kingMoved) {
        return moves;
    }

    /* Can't castle when checked ...if you do so you are stupid*/

    if (isKingInCheck(color)) {
        return moves;
    }

    /* Kingside short castling "the best by test*/

    const rookHMoved =
        color === "white"
            ? whiteRookHMoved
            : blackRookHMoved;

    if (
        !rookHMoved &&
        boardState[homeRow][7] === `${color}-rook` &&
        boardState[homeRow][5] === null &&
        boardState[homeRow][6] === null &&
        !isSquareAttacked(homeRow, 5, color) &&
        !isSquareAttacked(homeRow, 6, color)
    ) {

        moves.push({
            row: homeRow,
            col: 6,
            castling: "kingside"
        });
    }

    /* Queenside long castling */

    const rookAMoved =
        color === "white"
            ? whiteRookAMoved
            : blackRookAMoved;

    if (
        !rookAMoved &&
        boardState[homeRow][0] === `${color}-rook` &&
        boardState[homeRow][1] === null &&
        boardState[homeRow][2] === null &&
        boardState[homeRow][3] === null &&
        !isSquareAttacked(homeRow, 2, color) &&
        !isSquareAttacked(homeRow, 3, color)
    ) {

        moves.push({
            row: homeRow,
            col: 2,
            castling: "queenside"
        });
    }

    return moves;
}


/* =====================
   is the square attacked noooooooo
======================== */

function isSquareAttacked(row, col, color) {

    const enemy =
        color === "white"
            ? "black"
            : "white";

    for (let r = 0; r < 8; r++) {

        for (let c = 0; c < 8; c++) {

            const piece = boardState[r][c];

            if (!piece) {
                continue;
            }

            const [pieceColor] =
                piece.split("-");

            if (pieceColor !== enemy) {
                continue;
            }

            const attacks =
                getAttackMoves(r, c);

            const attacksSquare =
                attacks.some(
                    move =>
                        move.row === row &&
                        move.col === col
                );

            if (attacksSquare) {
                return true;
            }
        }
    }

    return false;
}


/* =========================
   detect checks
===================== */

function isKingInCheck(color) {

    const kingPosition =
        findKing(color);

    if (!kingPosition) {
        return true;
    }

    return isSquareAttacked(
        kingPosition.row,
        kingPosition.col,
        color
    );
}


/* ==============
  attack moves chess is boring I wanna make a table tennis game 
=================== */

function getAttackMoves(row, col) {

    const piece = boardState[row][col];

    if (!piece) {
        return [];
    }

    const [color, type] =
        piece.split("-");

    if (type === "pawn") {

        const moves = [];

        const direction =
            color === "white"
                ? -1
                : 1;

        for (const offset of [-1, 1]) {

            const targetRow =
                row + direction;

            const targetCol =
                col + offset;

            if (
                isInsideBoard(
                    targetRow,
                    targetCol
                )
            ) {

                moves.push({
                    row: targetRow,
                    col: targetCol
                });
            }
        }

        return moves;
    }

    if (type === "king") {

        const moves = [];

        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {

            for (
                let colOffset = -1;
                colOffset <= 1;
                colOffset++
            ) {

                if (
                    rowOffset === 0 &&
                    colOffset === 0
                ) {
                    continue;
                }

                const targetRow =
                    row + rowOffset;

                const targetCol =
                    col + colOffset;

                if (
                    isInsideBoard(
                        targetRow,
                        targetCol
                    )
                ) {

                    moves.push({
                        row: targetRow,
                        col: targetCol
                    });
                }
            }
        }

        









        return moves;
    }

    if (type === "rook") {
        return getSlidingMoves(
            row,
            col,
            color,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ]
        );
    }

    if (type === "bishop") {
        return getSlidingMoves(
            row,
            col,
            color,
            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );
    }

    if (type === "queen") {
        return getSlidingMoves(
            row,
            col,
            color,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );
    }

    if (type === "knight") {
        return getKnightMoves(
            row,
            col,
            color
        );
    }

    return [];
}


/* ==============
   FIND KING (x)   f(king)=x^2-3pawns   x != 0 
=================== */

function findKing(color) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            if (
                boardState[row][col] ===
                `${color}-king`
            ) {

                return {
                    row,
                    col
                };
            }
        }
    }

    return null;
}


/* ===========
 bounds
================= */

function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}


/* =================
   move piece
==================== */

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


    /* en passant capture: "remove the captured pawn" */

    if (
        type === "pawn" &&
        fromCol !== toCol &&
        boardState[toRow][toCol] === null
    ) {

        boardState[fromRow][toCol] = null;
    }


    /* Castling: "also move the rook" */

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


    /* pawn promotion  give me a queeen */

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


    /* Update en passant target for the next move ollnly*/

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


/* =
   CHECK GAME STATE
= */

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

        setWarning(
            `${capitalize(opponent)} is CHECKMATED`
        );

        setTimeout(() => {

            alert(
                `CHECKMATE!\n\n${capitalize(
                    opponent === "white"
                        ? "black"
                        : "white"
                )} wins.`
            );

        }, 100);

        return;
    }


    if (
        !inCheck &&
        !hasMoves
    ) {

        setWarning("STALEMATE");

        setTimeout(() => {
            alert("STALEMATE!");
        }, 100);

        return;
    }


    if (inCheck) {

        setWarning(
            `${capitalize(opponent)} is in CHECK`
        );

    } else {

        setWarning("THE GAME HAS BEGUN");
    }
}


/* ==============
check if player has legal moves
=================== */

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


/* =========================
   UPDATE KING CHECK
========================== */

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


/* =====================
   update ui
================ */

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

    const warning =
        document.querySelector(".game-warning");

    if (warning) {

        warning.innerHTML =
            `<span class="warning-dot"></span>
             ${capitalize(currentTurn)}'S TURN`;
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


/* =========
   WARNING
============ */

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


/* ================
   CAPITALIZE in capital
================ */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


/* ==========================================
   START start start start start start strat start start start start start star start stars start start star start start start pleaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaase
========================================== */

createBoard();

updateTurnUI();

setWarning("THE GAME HAS BEGUN Ha..Ha..Haaaa");
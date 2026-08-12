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


// ==========================================
// CREATE BOARD
// ==========================================

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

            const pieceData =
                boardState[row][col];

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


// ==========================================
// ADD PIECE
// ==========================================

function addPiece(square, pieceData) {

    const [color, type] =
        pieceData.split("-");

    const piece =
        document.createElement("div");

    piece.classList.add("chess-piece");

    if (color === "white") {
        piece.classList.add("white-piece");
    } else {
        piece.classList.add("black-piece");
    }

    piece.textContent =
        pieces[color][type];

    piece.dataset.color = color;
    piece.dataset.type = type;

    square.appendChild(piece);
}


// ==========================================
// CLICK HANDLER
// ==========================================

function handleSquareClick(row, col) {

    const clickedPiece =
        boardState[row][col];


    // -----------------------------
    // SELECT PIECE
    // -----------------------------

    if (selectedSquare === null) {

        if (!clickedPiece) {
            return;
        }

        const [color] =
            clickedPiece.split("-");

        if (color !== currentTurn) {
            return;
        }

        selectedSquare = {
            row: row,
            col: col
        };

        showSelectedSquare();

        return;
    }


    // -----------------------------
    // CLICK SAME SQUARE
    // -----------------------------

    if (
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {

        selectedSquare = null;

        createBoard();

        return;
    }


    // -----------------------------
    // MOVE PIECE
    // -----------------------------

    if (
        isValidMove(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col
        )
    ) {

        movePiece(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col
        );

        selectedSquare = null;

        switchTurn();

        createBoard();

        return;
    }


    // -----------------------------
    // SELECT ANOTHER PIECE
    // -----------------------------

    if (clickedPiece) {

        const [color] =
            clickedPiece.split("-");

        if (color === currentTurn) {

            selectedSquare = {
                row: row,
                col: col
            };

            showSelectedSquare();
        }
    }
}


// ==========================================
// MAIN MOVE VALIDATOR
// ==========================================

function isValidMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const piece =
        boardState[fromRow][fromCol];

    if (!piece) {
        return false;
    }

    const [color, type] =
        piece.split("-");


    // Can't move outside board
    if (
        toRow < 0 ||
        toRow > 7 ||
        toCol < 0 ||
        toCol > 7
    ) {
        return false;
    }


    // Can't move to same square
    if (
        fromRow === toRow &&
        fromCol === toCol
    ) {
        return false;
    }


    switch (type) {

        case "pawn":

            return isValidPawnMove(
                fromRow,
                fromCol,
                toRow,
                toCol,
                color
            );


        case "rook":

            return isValidRookMove(
                fromRow,
                fromCol,
                toRow,
                toCol,
                color
            );


        case "knight":

            return isValidKnightMove(
                fromRow,
                fromCol,
                toRow,
                toCol,
                color
            );


        case "bishop":

            return isValidBishopMove(
                fromRow,
                fromCol,
                toRow,
                toCol,
                color
            );


        case "queen":

            return isValidQueenMove(
                fromRow,
                fromCol,
                toRow,
                toCol,
                color
            );


        case "king":

            return isValidKingMove(
                fromRow,
                fromCol,
                toRow,
                toCol,
                color
            );
    }

    return false;
}


// ==========================================
// PAWN
// ==========================================

function isValidPawnMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
) {

    const target =
        boardState[toRow][toCol];


    const direction =
        color === "white"
            ? -1
            : 1;


    const startRow =
        color === "white"
            ? 6
            : 1;


    // Move forward one
    if (
        toCol === fromCol &&
        toRow === fromRow + direction &&
        target === null
    ) {
        return true;
    }


    // Move forward two
    if (
        fromRow === startRow &&
        toCol === fromCol &&
        toRow === fromRow + direction * 2 &&
        target === null &&
        boardState[
            fromRow + direction
        ][fromCol] === null
    ) {
        return true;
    }


    // Capture diagonally
    if (
        toRow === fromRow + direction &&
        Math.abs(toCol - fromCol) === 1 &&
        target !== null
    ) {

        const [targetColor] =
            target.split("-");

        return targetColor !== color;
    }


    return false;
}


// ==========================================
// ROOK
// ==========================================

function isValidRookMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
) {

    if (
        fromRow !== toRow &&
        fromCol !== toCol
    ) {
        return false;
    }

    if (
        !isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        )
    ) {
        return false;
    }

    return isTargetAllowed(
        toRow,
        toCol,
        color
    );
}


// ==========================================
// BISHOP
// ==========================================

function isValidBishopMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
) {

    const rowDifference =
        Math.abs(toRow - fromRow);

    const colDifference =
        Math.abs(toCol - fromCol);


    if (
        rowDifference !== colDifference
    ) {
        return false;
    }


    if (
        !isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        )
    ) {
        return false;
    }


    return isTargetAllowed(
        toRow,
        toCol,
        color
    );
}


// ==========================================
// KNIGHT
// ==========================================

function isValidKnightMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
) {

    const rowDifference =
        Math.abs(toRow - fromRow);

    const colDifference =
        Math.abs(toCol - fromCol);


    const validShape =
        (
            rowDifference === 2 &&
            colDifference === 1
        ) ||
        (
            rowDifference === 1 &&
            colDifference === 2
        );


    if (!validShape) {
        return false;
    }


    return isTargetAllowed(
        toRow,
        toCol,
        color
    );
}


// ==========================================
// QUEEN
// ==========================================

function isValidQueenMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
) {

    const rowDifference =
        Math.abs(toRow - fromRow);

    const colDifference =
        Math.abs(toCol - fromCol);


    const straight =
        fromRow === toRow ||
        fromCol === toCol;


    const diagonal =
        rowDifference === colDifference;


    if (!straight && !diagonal) {
        return false;
    }


    if (
        !isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        )
    ) {
        return false;
    }


    return isTargetAllowed(
        toRow,
        toCol,
        color
    );
}


// ==========================================
// KING
// ==========================================

function isValidKingMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    color
) {

    const rowDifference =
        Math.abs(toRow - fromRow);

    const colDifference =
        Math.abs(toCol - fromCol);


    if (
        rowDifference > 1 ||
        colDifference > 1
    ) {
        return false;
    }


    return isTargetAllowed(
        toRow,
        toCol,
        color
    );
}


// ==========================================
// PATH CHECK
// ==========================================

function isPathClear(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const rowStep =
        Math.sign(toRow - fromRow);

    const colStep =
        Math.sign(toCol - fromCol);


    let row =
        fromRow + rowStep;

    let col =
        fromCol + colStep;


    while (
        row !== toRow ||
        col !== toCol
    ) {

        if (
            boardState[row][col] !== null
        ) {
            return false;
        }

        row += rowStep;
        col += colStep;
    }


    return true;
}


// ==========================================
// TARGET CHECK
// ==========================================

function isTargetAllowed(
    row,
    col,
    color
) {

    const target =
        boardState[row][col];


    if (target === null) {
        return true;
    }


    const [targetColor] =
        target.split("-");


    return targetColor !== color;
}


// ==========================================
// MOVE PIECE
// ==========================================

function movePiece(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    boardState[toRow][toCol] =
        boardState[fromRow][fromCol];

    boardState[fromRow][fromCol] =
        null;
}


// ==========================================
// SWITCH TURN
// ==========================================

function switchTurn() {

    if (currentTurn === "white") {
        currentTurn = "black";
    } else {
        currentTurn = "white";
    }

    console.log(
        "Current turn:",
        currentTurn
    );
}


// ==========================================
// SELECTED SQUARE
// ==========================================

function showSelectedSquare() {

    createBoard();

    const square =
        document.querySelector(
            `[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`
        );


    if (square) {
        square.classList.add("selected");
    }
}


// ==========================================
// START GAME
// ==========================================

createBoard();
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


/* Relative material values, used by the AI to weigh moves */

const PIECE_VALUES = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
};


/* ==========================================
   ADD PIECE
========================================== */

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

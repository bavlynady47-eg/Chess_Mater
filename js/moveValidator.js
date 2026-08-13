/* ==========================================
   GET LEGAL MOVES
   (pseudo-legal moves filtered to those that
   don't leave the mover's own king in check)
========================================== */

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

        /*
           En passant captures a pawn that is NOT sitting on
           the destination square, so it needs special
           handling while simulating the move (otherwise a
           pinned en-passant capture would look legal).
        */

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


/* ==========================================
   PSEUDO MOVES
========================================== */

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


/* ==========================================
   PAWN MOVES
========================================== */

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


    /* Captures (including en passant) */

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


/* ==========================================
   ROOK MOVES
========================================== */

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


/* ==========================================
   BISHOP MOVES
========================================== */

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


/* ==========================================
   QUEEN MOVES
========================================== */

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


/* ==========================================
   SLIDING PIECES
========================================== */

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


/* ==========================================
   KNIGHT MOVES
========================================== */

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


/* ==========================================
   KING MOVES
========================================== */

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


/* ==========================================
   CASTLING MOVES
========================================== */

function getCastlingMoves(row, col, color) {

    const moves = [];

    const homeRow =
        color === "white"
            ? 7
            : 0;

    /* King must be on its original square */

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

    /* Can't castle out of check */

    if (isKingInCheck(color)) {
        return moves;
    }

    /* Kingside (short) castling */

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

    /* Queenside (long) castling */

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


/* ==========================================
   IS SQUARE ATTACKED (by the opponent of `color`)
========================================== */

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


/* ==========================================
   CHECK DETECTION
========================================== */

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


/* ==========================================
   ATTACK MOVES
========================================== */

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

        /*
           Deliberately NOT including castling here -
           castling itself depends on isSquareAttacked,
           which depends on getAttackMoves, so including
           it would cause infinite recursion. A king can
           also never legally attack a square via castling
           anyway.
        */

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


/* ==========================================
   FIND KING
========================================== */

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

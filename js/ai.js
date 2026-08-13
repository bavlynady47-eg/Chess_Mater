let vsAI = false;
let aiDifficulty = "medium"; // 'easy' | 'medium' | 'hard'

const aiColor = "black";


/* ==========================================
   MAYBE TRIGGER AI MOVE
========================================== */

function maybeTriggerAIMove() {

    if (!vsAI || gameOver) {
        return;
    }

    if (currentTurn !== aiColor) {
        return;
    }

    const thinkTime = aiDifficulty === "hard" ? 700 : 500;

    setTimeout(performAIMove, thinkTime);
}


/* ==========================================
   PERFORM AI MOVE (branches by difficulty)
========================================== */

function performAIMove() {

    if (gameOver || currentTurn !== aiColor) {
        return;
    }

    if (aiDifficulty === "easy") {
        performAIMoveEasy();
    } else if (aiDifficulty === "hard") {
        performAIMoveHard();
    } else {
        performAIMoveMedium();
    }
}


/* ==========================================
   COLLECT ALL LEGAL MOVES FOR A COLOR
========================================== */

function collectAllLegalMoves(color) {

    const allMoves = [];

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = boardState[row][col];

            if (piece && piece.startsWith(color + "-")) {

                getLegalMoves(row, col).forEach(move => {

                    allMoves.push({
                        fromRow: row,
                        fromCol: col,
                        move
                    });
                });
            }
        }
    }

    return allMoves;
}


/* ==========================================
   EASY: mostly random, slight capture bias
========================================== */

function performAIMoveEasy() {

    const allMoves = collectAllLegalMoves(aiColor);

    if (allMoves.length === 0) {
        return;
    }

    const captureMoves = allMoves.filter(entry =>
        boardState[entry.move.row][entry.move.col] ||
        entry.move.enPassant
    );

    let pool = allMoves;

    if (captureMoves.length > 0 && Math.random() < 0.3) {
        pool = captureMoves;
    }

    const chosen =
        pool[Math.floor(Math.random() * pool.length)];

    applyMove(
        chosen.fromRow,
        chosen.fromCol,
        chosen.move.row,
        chosen.move.col,
        chosen.move,
        { auto: true }
    );
}


/* ==========================================
   MEDIUM: greedy heuristic (captures + center)
========================================== */

function performAIMoveMedium() {

    const allMoves = collectAllLegalMoves(aiColor);

    if (allMoves.length === 0) {
        return;
    }

    let bestScore = -Infinity;
    let bestEntries = [];

    for (const entry of allMoves) {

        const score = scoreAIMove(entry);

        if (score > bestScore) {
            bestScore = score;
            bestEntries = [entry];
        } else if (score === bestScore) {
            bestEntries.push(entry);
        }
    }

    const chosen =
        bestEntries[Math.floor(Math.random() * bestEntries.length)];

    applyMove(
        chosen.fromRow,
        chosen.fromCol,
        chosen.move.row,
        chosen.move.col,
        chosen.move,
        { auto: true }
    );
}


function scoreAIMove(entry) {

    const { move } = entry;

    let score = Math.random() * 0.5;

    const target = boardState[move.row][move.col];

    if (target) {
        const [, targetType] = target.split("-");
        score += (PIECE_VALUES[targetType] || 0) * 10;
    }

    if (move.enPassant) {
        score += (PIECE_VALUES.pawn || 1) * 10;
    }

    if (move.castling) {
        score += 3;
    }

    const centerDistance =
        Math.abs(3.5 - move.row) + Math.abs(3.5 - move.col);

    score += (7 - centerDistance) * 0.3;

    return score;
}


/* ==========================================
   HARD: 2-ply minimax (AI move, then the
   opponent's best reply) on material balance
========================================== */

function performAIMoveHard() {

    const allMoves = collectAllLegalMoves(aiColor);

    if (allMoves.length === 0) {
        return;
    }

    const opponentColor =
        aiColor === "white" ? "black" : "white";

    const realBoard = boardState;

    let bestScore = -Infinity;
    let bestEntries = [];

    for (const entry of allMoves) {

        boardState = cloneBoard(realBoard);

        simulateApplyMove(entry.fromRow, entry.fromCol, entry.move);

        const opponentReplies =
            collectAllLegalMoves(opponentColor);

        let worstForAI;

        if (opponentReplies.length === 0) {

            worstForAI =
                isKingInCheck(opponentColor) ? 1000 : 0;

        } else {

            worstForAI = Infinity;

            const boardAfterAIMove = boardState;

            for (const reply of opponentReplies) {

                boardState = cloneBoard(boardAfterAIMove);

                simulateApplyMove(reply.fromRow, reply.fromCol, reply.move);

                const evalScore =
                    evaluateMaterial(aiColor) -
                    evaluateMaterial(opponentColor);

                if (evalScore < worstForAI) {
                    worstForAI = evalScore;
                }
            }
        }

        const score = worstForAI + Math.random() * 0.1;

        if (score > bestScore) {
            bestScore = score;
            bestEntries = [entry];
        } else if (score === bestScore) {
            bestEntries.push(entry);
        }
    }

    boardState = realBoard;

    const chosen =
        bestEntries[Math.floor(Math.random() * bestEntries.length)];

    applyMove(
        chosen.fromRow,
        chosen.fromCol,
        chosen.move.row,
        chosen.move.col,
        chosen.move,
        { auto: true }
    );
}


function cloneBoard(state) {
    return state.map(row => row.slice());
}


function evaluateMaterial(color) {

    let total = 0;

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = boardState[row][col];

            if (piece && piece.startsWith(color + "-")) {

                const [, type] = piece.split("-");

                total += PIECE_VALUES[type] || 0;
            }
        }
    }

    return total;
}


/*
   Lightweight move application used only inside the
   hard-mode search: mutates whichever boardState is
   currently active (a clone during search) without
   touching real castling flags / en passant / clock.
*/

function simulateApplyMove(fromRow, fromCol, move) {

    const piece = boardState[fromRow][fromCol];
    const [color, type] = piece.split("-");

    const toRow = move.row;
    const toCol = move.col;

    if (
        type === "pawn" &&
        fromCol !== toCol &&
        boardState[toRow][toCol] === null
    ) {
        boardState[fromRow][toCol] = null;
    }

    if (
        type === "king" &&
        Math.abs(toCol - fromCol) === 2
    ) {

        if (toCol === 6) {
            boardState[fromRow][5] = boardState[fromRow][7];
            boardState[fromRow][7] = null;
        } else if (toCol === 2) {
            boardState[fromRow][3] = boardState[fromRow][0];
            boardState[fromRow][0] = null;
        }
    }

    boardState[toRow][toCol] = piece;
    boardState[fromRow][fromCol] = null;

    if (type === "pawn" && (toRow === 0 || toRow === 7)) {
        boardState[toRow][toCol] = `${color}-queen`;
    }
}
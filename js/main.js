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

    ["black-rook", "black-knight", "black-bishop", "black-queen",
     "black-king", "black-bishop", "black-knight", "black-rook"],


     
    ["black-pawn", "black-pawn", "black-pawn", "black-pawn",
     "black-pawn", "black-pawn", "black-pawn", "black-pawn"],

    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],



    ["white-pawn", "white-pawn", "white-pawn", "white-pawn",
     "white-pawn", "white-pawn", "white-pawn", "white-pawn"],


     
    ["white-rook", "white-knight", "white-bishop", "white-queen",
     "white-king", "white-bishop", "white-knight", "white-rook"]

];


let selectedSquare = null;
let currentTurn = "white";


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
            square.dataset.square = files[col] + (8 - row);

            const pieceData = boardState[row][col];

            if (pieceData) {
                addPiece(square, pieceData);
            }

            square.addEventListener("click", () => {
                handleSquareClick(row, col);
            });

            board.appendChild(square);
        }
    }
}



function addPiece(square, pieceData) {

    const [color, type] = pieceData.split("-");

    const piece = document.createElement("div");

    piece.classList.add("chess-piece");

    if (color === "white") {
        piece.classList.add("white-piece");
    } else {
        piece.classList.add("black-piece");
    }

    piece.textContent = pieces[color][type];

    square.appendChild(piece);
}

function handleSquareClick(row, col) {

    const clickedPiece = boardState[row][col];

    
    if (selectedSquare === null) {

        if (!clickedPiece) {
            return;
        }

        const [color] = clickedPiece.split("-");

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


    

    if (
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {
        selectedSquare = null;
        createBoard();
        return;
    }



    
    if (isValidPawnMove(selectedSquare.row, selectedSquare.col, row, col)) {

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


    
    if (clickedPiece) {

        const [color] = clickedPiece.split("-");

        if (color === currentTurn) {

            selectedSquare = {
                row: row,
                col: col
            };

            showSelectedSquare();

            return;
        }
    }
}



function isValidPawnMove(fromRow, fromCol, toRow, toCol) {

    const piece = boardState[fromRow][fromCol];

    if (!piece) {
        return false;
    }

    const [color, type] = piece.split("-");

    if (type !== "pawn") {
        return false;
    }

    const target = boardState[toRow][toCol];



    
    if (color === "white") {

        
        if (
            toCol === fromCol &&
            toRow === fromRow - 1 &&
            target === null
        ) {
            return true;
        }

        
        if (
            fromRow === 6 &&
            toCol === fromCol &&
            toRow === fromRow - 2 &&
            target === null &&
            boardState[fromRow - 1][fromCol] === null
        ) {
            return true;
        }

        
        if (
            toRow === fromRow - 1 &&
            Math.abs(toCol - fromCol) === 1 &&
            target !== null
        ) {

            const [targetColor] = target.split("-");

            return targetColor !== color;
        }
    }

    

    if (color === "black") {

        
        if (
            toCol === fromCol &&
            toRow === fromRow + 1 &&
            target === null
        ) {
            return true;
        }

    
        
            if (
            fromRow === 1 &&
            toCol === fromCol &&
            toRow === fromRow + 2 &&
            target === null &&
            boardState[fromRow + 1][fromCol] === null
        ) {
            return true;
        }

        

        if (
            toRow === fromRow + 1 &&
            Math.abs(toCol - fromCol) === 1 &&
            target !== null
        ) {

            const [targetColor] = target.split("-");

            return targetColor !== color;
        }
    }

    return false;
}



function movePiece(fromRow, fromCol, toRow, toCol) {

    boardState[toRow][toCol] =
        boardState[fromRow][fromCol];

    boardState[fromRow][fromCol] = null;

}


function switchTurn() {

    if (currentTurn === "white") {
        currentTurn = "black";
    } else {
        currentTurn = "white";
    }

    console.log("Turn:", currentTurn);
}

function showSelectedSquare() {

    createBoard();

    const square = document.querySelector(
        `[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`
    );


    if (square) {

        square.classList.add("selected");
   
    }
}

createBoard();


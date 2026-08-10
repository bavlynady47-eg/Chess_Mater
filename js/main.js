const board = document.getElementById("board-container");

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

for (let row = 8; row >= 1; row--) {

    for (let col = 0; col < 8; col++) {

        const square = document.createElement("div");

        square.classList.add("square");

        if ((row + col) % 2 === 0) {
            square.classList.add("light");
        } else {
            square.classList.add("dark");
        }

        square.dataset.square = files[col] + row;

        board.appendChild(square);
    }
}
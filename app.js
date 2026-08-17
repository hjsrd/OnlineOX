
/* =========================
   GAME SETTINGS
========================= */

let boardSize = 3;

let winLength = 3;


/* =========================
   GAME STATE
========================= */

let board = [];

let currentPlayer = "X";

let gameOver = false;

let gameStarted = false;

let gameMode = "";

let aiThinking = false;


/* =========================
   DOM
========================= */

const boardElement = document.querySelector("#board");

const status = document.querySelector("#status");

const pvpBtn = document.querySelector("#pvpBtn");

const aiBtn = document.querySelector("#aiBtn");

const restartBtn = document.querySelector("#restartBtn");

const sizeButtons = document.querySelectorAll(".sizeBtn");

const guideText = document.querySelector("#guideText");



/* =========================
   GUIDE
========================= */

function updateGuide() {

    if (boardSize === 3) {

        guideText.textContent =
            "برای برنده شدن، ۳ مهره را پشت سر هم بچینید.";

    } else {

        guideText.textContent =
            "برای برنده شدن، ۴ مهره را پشت سر هم بچینید.";

    }

}

/* =========================
   ANALYTICS
========================= */

function trackEvent(eventName, parameters = {}) {

    if (typeof gtag === "function") {

        gtag("event", eventName, parameters);

    }

}


/* =========================
   CREATE BOARD
========================= */

function createBoard() {

    board = Array(boardSize * boardSize).fill("");

    boardElement.innerHTML = "";

    boardElement.style.setProperty(
        "--board-size",
        boardSize
    );

    for (let i = 0; i < board.length; i++) {

        const cell = document.createElement("div");

        cell.classList.add("cell");

        cell.dataset.index = i;

        cell.addEventListener("click", () => {

            if (
                gameMode === "ai" &&
                currentPlayer === "O"
            ) {
                return;
            }

            makeMove(i);

        });

        boardElement.appendChild(cell);

    }

}


/* =========================
   GET CELLS
========================= */

function getCells() {

    return document.querySelectorAll(".cell");

}


/* =========================
   GAME MODE
========================= */

pvpBtn.addEventListener("click", () => {

    gameMode = "pvp";

    pvpBtn.classList.add("active");

    aiBtn.classList.remove("active");

    resetGame();

    trackEvent("pvp_selected");

});


aiBtn.addEventListener("click", () => {

    gameMode = "ai";

    aiBtn.classList.add("active");

    pvpBtn.classList.remove("active");

    resetGame();

    trackEvent("ai_selected");

});


/* =========================
   BOARD SIZE
========================= */

sizeButtons.forEach((button) => {

    button.addEventListener("click", () => {

        boardSize = Number(button.dataset.size);

        if (boardSize === 3) {

            winLength = 3;

        } else {

            winLength = 4;

        }

        updateGuide();

        sizeButtons.forEach((btn) => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        resetGame();

        trackEvent("board_size_selected", {

            size: boardSize,

            win_length: winLength

        });

    });

});


/* =========================
   WINNING LINES
========================= */

function getWinningLines() {

    const lines = [];

    /* Rows */

    for (let row = 0; row < boardSize; row++) {

        for (
            let col = 0;
            col <= boardSize - winLength;
            col++
        ) {

            const line = [];

            for (
                let i = 0;
                i < winLength;
                i++
            ) {

                line.push(
                    row * boardSize + col + i
                );

            }

            lines.push(line);

        }

    }


    /* Columns */

    for (let col = 0; col < boardSize; col++) {

        for (
            let row = 0;
            row <= boardSize - winLength;
            row++
        ) {

            const line = [];

            for (
                let i = 0;
                i < winLength;
                i++
            ) {

                line.push(
                    (row + i) * boardSize + col
                );

            }

            lines.push(line);

        }

    }


    /* Diagonal ↘ */

    for (
        let row = 0;
        row <= boardSize - winLength;
        row++
    ) {

        for (
            let col = 0;
            col <= boardSize - winLength;
            col++
        ) {

            const line = [];

            for (
                let i = 0;
                i < winLength;
                i++
            ) {

                line.push(
                    (row + i) * boardSize +
                    (col + i)
                );

            }

            lines.push(line);

        }

    }


    /* Diagonal ↙ */

    for (
        let row = 0;
        row <= boardSize - winLength;
        row++
    ) {

        for (
            let col = winLength - 1;
            col < boardSize;
            col++
        ) {

            const line = [];

            for (
                let i = 0;
                i < winLength;
                i++
            ) {

                line.push(
                    (row + i) * boardSize +
                    (col - i)
                );

            }

            lines.push(line);

        }

    }


    return lines;

}


/* =========================
   FIND WINNING LINE
========================= */

function getWinningLine(player) {

    const lines = getWinningLines();

    return lines.find((line) => {

        return line.every((index) => {

            return board[index] === player;

        });

    }) || null;

}


/* =========================
   CHECK WINNER
========================= */

function checkWinner() {

    const winningLineX = getWinningLine("X");

    const winningLineO = getWinningLine("O");

    let winningLine = null;

    let winner = null;


    if (winningLineX) {

        winner = "X";

        winningLine = winningLineX;

    } else if (winningLineO) {

        winner = "O";

        winningLine = winningLineO;

    }


    if (!winner) {

        return false;

    }


    const cells = getCells();


    status.textContent = `${winner} wins!`;

    status.classList.add("win");


    winningLine.forEach((index) => {

        cells[index].classList.add("winner");

    });


    cells.forEach((cell, index) => {

        if (!winningLine.includes(index)) {

            cell.classList.add("dimmed");

        }

    });


    gameOver = true;


    trackEvent("game_win", {

        winner: winner,

        mode: gameMode,

        board_size: boardSize

    });


    return true;

}


/* =========================
   CHECK DRAW
========================= */

function checkDraw() {

    if (!board.includes("")) {

        status.textContent = "Try Again Seyed";

        status.classList.add("draw");

        gameOver = true;


        trackEvent("game_draw", {

            mode: gameMode,

            board_size: boardSize

        });


        return true;

    }


    return false;

}


/* =========================
   MAKE MOVE
========================= */

function makeMove(index) {

    if (gameOver) {

        return;

    }


    if (board[index] !== "") {

        return;

    }


    const cells = getCells();


    board[index] = currentPlayer;


    cells[index].textContent = currentPlayer;

    cells[index].classList.add(currentPlayer);


    console.log(board);


    if (!gameStarted) {

        gameStarted = true;

        trackEvent("game_started", {

            mode: gameMode,

            board_size: boardSize

        });

    }


    if (checkWinner()) {

        return;

    }


    if (checkDraw()) {

        return;

    }


    switchPlayer();


    if (
        gameMode === "ai" &&
        currentPlayer === "O"
    ) {

        aiThinking = true;


        setTimeout(() => {

            aiMove();

            aiThinking = false;

        }, 350);

    }

}


/* =========================
   SWITCH PLAYER
========================= */

function switchPlayer() {

    if (currentPlayer === "X") {

        currentPlayer = "O";

        status.textContent = "O's Turn";

    } else {

        currentPlayer = "X";

        status.textContent = "X's Turn";

    }

}


/* =========================
   CHECK WINNER FOR PLAYER
========================= */

function isWinner(player) {

    return getWinningLine(player) !== null;

}


/* =========================
   AI MOVE
========================= */

function aiMove() {

    if (gameOver) {

        return;

    }


    const emptyCells = [];

    board.forEach((cell, index) => {

        if (cell === "") {

            emptyCells.push(index);

        }

    });


    if (emptyCells.length === 0) {

        return;

    }


    /*
        3 × 3
        Full Minimax
    */

    if (boardSize === 3) {

        let bestScore = -Infinity;

        let bestMove = emptyCells[0];


        for (const index of emptyCells) {

            board[index] = "O";


            const score = minimax(false);


            board[index] = "";


            if (score > bestScore) {

                bestScore = score;

                bestMove = index;

            }

        }


        makeMove(bestMove);

        return;

    }


    /*
        4 × 4 / 5 × 5
        Smart Heuristic AI
    */


    /* 1. Win immediately */

    for (const index of emptyCells) {

        board[index] = "O";


        if (isWinner("O")) {

            board[index] = "";

            makeMove(index);

            return;

        }


        board[index] = "";

    }


    /* 2. Block player */

    for (const index of emptyCells) {

        board[index] = "X";


        if (isWinner("X")) {

            board[index] = "";

            makeMove(index);

            return;

        }


        board[index] = "";

    }


    /* 3. Take center */

    const centerMoves = getCenterMoves();

    const availableCenters = centerMoves.filter(

        (index) => board[index] === ""

    );


    if (availableCenters.length > 0) {

        const center = availableCenters[0];

        makeMove(center);

        return;

    }


    /* 4. Prefer corners */

    const corners = getCorners();

    const availableCorners = corners.filter(

        (index) => board[index] === ""

    );


    if (availableCorners.length > 0) {

        const randomCorner =

            availableCorners[
            Math.floor(
                Math.random() *
                availableCorners.length
            )
            ];


        makeMove(randomCorner);

        return;

    }


    /* 5. Choose strategic move */

    const bestMove = findBestHeuristicMove(
        emptyCells
    );


    makeMove(bestMove);

}


/* =========================
   MINIMAX - 3 × 3
========================= */

function minimax(isMaximizing) {

    const score = evaluateBoard();


    if (score !== null) {

        return score;

    }


    if (isMaximizing) {

        let bestScore = -Infinity;


        for (let i = 0; i < board.length; i++) {

            if (board[i] === "") {

                board[i] = "O";


                const score = minimax(false);


                board[i] = "";


                bestScore = Math.max(
                    bestScore,
                    score
                );

            }

        }


        return bestScore;

    }


    let bestScore = Infinity;


    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {

            board[i] = "X";


            const score = minimax(true);


            board[i] = "";


            bestScore = Math.min(
                bestScore,
                score
            );

        }

    }


    return bestScore;

}


/* =========================
   EVALUATE BOARD
========================= */

function evaluateBoard() {

    if (isWinner("O")) {

        return 10;

    }


    if (isWinner("X")) {

        return -10;

    }


    if (!board.includes("")) {

        return 0;

    }


    return null;

}


/* =========================
   CENTER MOVES
========================= */

function getCenterMoves() {

    const centers = [];


    if (boardSize % 2 === 1) {

        const center = Math.floor(
            boardSize / 2
        );

        centers.push(
            center * boardSize + center
        );

    } else {

        const first = boardSize / 2 - 1;

        const second = boardSize / 2;


        centers.push(
            first * boardSize + first
        );

        centers.push(
            first * boardSize + second
        );

        centers.push(
            second * boardSize + first
        );

        centers.push(
            second * boardSize + second
        );

    }


    return centers;

}


/* =========================
   CORNERS
========================= */

function getCorners() {

    const last = boardSize - 1;


    return [
        0,
        last,
        last * boardSize,
        last * boardSize + last
    ];

}


/* =========================
   HEURISTIC AI
========================= */

function findBestHeuristicMove(emptyCells) {

    let bestMove = emptyCells[0];

    let bestScore = -Infinity;


    for (const index of emptyCells) {

        board[index] = "O";


        let score = evaluatePosition("O");


        board[index] = "";


        board[index] = "X";


        score += evaluatePosition("X") * 0.8;


        board[index] = "";


        if (score > bestScore) {

            bestScore = score;

            bestMove = index;

        }

    }


    return bestMove;

}


/* =========================
   POSITION EVALUATION
========================= */

function evaluatePosition(player) {

    let score = 0;

    const lines = getWinningLines();


    for (const line of lines) {

        let playerCount = 0;

        let emptyCount = 0;


        for (const index of line) {

            if (board[index] === player) {

                playerCount++;

            } else if (board[index] === "") {

                emptyCount++;

            }

        }


        if (playerCount === winLength) {

            score += 10000;

        } else if (
            playerCount === winLength - 1 &&
            emptyCount === 1
        ) {

            score += 1000;

        } else if (
            playerCount === winLength - 2 &&
            emptyCount >= 2
        ) {

            score += 100;

        } else if (playerCount > 0) {

            score += playerCount * 10;

        }

    }


    return score;

}


/* =========================
   RESET GAME
========================= */

function resetGame() {

    gameOver = false;

    gameStarted = false;

    aiThinking = false;

    currentPlayer = "X";


    status.textContent = "X's Turn";

    status.classList.remove(
        "win",
        "draw"
    );


    createBoard();


    trackEvent("game_restart", {

        board_size: boardSize

    });

}

restartBtn.addEventListener("click", resetGame);


/* =========================
   START GAME
========================= */

createBoard();

updateGuide();







const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

let board = [
    "", "", "",
    "", "", "",
    "", "", ""
];



function trackEvent(eventName, parameters = {}) {

    if (typeof gtag === "function") {
        gtag("event", eventName, parameters);
    }

};

let gameStarted = false;

const cells = document.querySelectorAll(".cell");

const status = document.querySelector("#status");

let currentPlayer = "X";

let gameOver = false;

let gameMode = "";

const pvpBtn = document.querySelector("#pvpBtn");

const aiBtn = document.querySelector("#aiBtn");





pvpBtn.addEventListener("click", () => {
    gameMode = "pvp";
    console.log(gameMode);
    pvpBtn.classList.add("active");
    aiBtn.classList.remove("active");
    trackEvent("pvp_selected");
});

aiBtn.addEventListener("click", () => {
    gameMode = "ai";
    console.log(gameMode);
    aiBtn.classList.add("active");
    pvpBtn.classList.remove("active");
    trackEvent("ai_selected");
});




function checkWinner() {

    winningPatterns.forEach((pattern) => {

        if (
            board[pattern[0]] !== "" &&
            board[pattern[0]] === board[pattern[1]] &&
            board[pattern[1]] === board[pattern[2]]
        ) {
            console.log(`${board[pattern[0]]} wins!`);
            status.textContent = `${board[pattern[0]]} wins!`;
            status.classList.add("win");
            trackEvent("game_win", {
                winner: board[pattern[0]],
                mode: gameMode
            });

            pattern.forEach((index) => {
                cells[index].classList.add("winner");
            });

            cells.forEach((cell, index) => {

                if (!pattern.includes(index)) {
                    cell.classList.add("dimmed");
                }

            });

            gameOver = true;
        }

    });

}

function aiMove() {

    let bestScore = -Infinity;
    let bestMove;


    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {

            board[i] = "O";

            const score = minimax(false);

            board[i] = "";

            if (score > bestScore) {

                bestScore = score;
                bestMove = i;
            }
        }
    }


    makeMove(bestMove);
}


function evaluateBoard() {
    if (isWinner("O")) {
        return 10;
    };
    if (isWinner("X")) {
        return -10;
    };
    if (!board.includes("")) {
        return 0;
    };

    return null;

}

function minimax(isMaximizing) {

    const score = evaluateBoard();

    if (score !== null) {
        return score;
    }


    // O = Maximizing
    if (isMaximizing) {

        let bestScore = -Infinity;

        for (let i = 0; i < board.length; i++) {

            if (board[i] === "") {

                board[i] = "O";

                const score = minimax(false);

                board[i] = "";

                bestScore = Math.max(bestScore, score);
            }
        }

        return bestScore;
    }


    // X = Minimizing
    else {

        let bestScore = Infinity;

        for (let i = 0; i < board.length; i++) {

            if (board[i] === "") {

                board[i] = "X";

                const score = minimax(true);

                board[i] = "";

                bestScore = Math.min(bestScore, score);
            }
        }

        return bestScore;
    }
}




function isWinner(player) {

    return winningPatterns.some((pattern) => {

        return (
            board[pattern[0]] === player &&
            board[pattern[1]] === player &&
            board[pattern[2]] === player
        );

    });

}
console.log(isWinner("X"));
console.log(isWinner("O"));


let aiThinking = false;

function makeMove(index) {

    const cell = cells[index];

    if (gameOver) {
        return;
    }

    if (cell.textContent !== "") {
        return;
    }

    if (aiThinking) {
        return;
    }

    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);

    board[index] = currentPlayer;
    console.log(board);
    checkWinner();
    if (!gameStarted) {
        gameStarted = true;

        trackEvent("game_started", {
            mode: gameMode
        });
    }



    if (gameOver) {
        return;
    }

    if (checkDraw()) {
        return;
    }

    switchPlayer();

    if (gameMode === "ai" && currentPlayer === "O") {

        setTimeout(() => {
            aiMove();
        }, 300);

    }

}

function switchPlayer() {

    if (currentPlayer === "X") {
        currentPlayer = "O";
        status.textContent = "O's Turn";
    } else {
        currentPlayer = "X";
        status.textContent = "X's Turn";
    }

}

function checkDraw() {

    if (!board.includes("")) {
        console.log("Draw!");
        status.textContent = "نتونستی که گوزو";
        status.classList.add("draw");
        gameOver = true;
        trackEvent("game_draw", {
            mode: gameMode
        });

        return true;
    }

    return false;
}






cells.forEach((cell, index) => {

    cell.addEventListener("click", () => {

        if (gameMode === "ai" && currentPlayer === "O") {
            return;
        }

        makeMove(index);

    });

});


const restartBtn = document.querySelector("#restartBtn");

function resetGame() {

    board = [
        "", "", "",
        "", "", "",
        "", "", ""
    ];

    trackEvent("game_restart");

    currentPlayer = "X";

    gameOver = false;

    status.textContent = "X's Turn";

    status.classList.remove("win");
    status.classList.remove("draw");


    cells.forEach((cell) => {
        cell.textContent = "";
        cell.classList.remove("X", "O");
        cell.classList.remove("X", "O");
        cell.classList.remove("winner", "dimmed");
    });

}

restartBtn.addEventListener("click", resetGame);


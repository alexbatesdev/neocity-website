const alphabetArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let showCoords = false;
let gameBoard = null;
let selected_piece = null;
let pieceMoved = false;
let Game = null;
let Players = {
    "A": null,
    "B": null
}
let loggedInPlayer = null;
let whoseTurn = null;
let rateLimitActive = true;

const renderBoard = (
    game
) => {
    // Iterate through cells attaching IDs and placing pieces
    let cells = document.querySelectorAll(".cell");

    let x = 0;
    let y = 0;
    let game_board = game.board;
    let available_jumps = checkForAvailableJumps();

    for (let i = 0; i < cells.length; i++) {


        x = i % 8;
        y = Math.floor(i / 8);
        cells[i].id = `${x}-${y}`;

        if (game_board[y][x] != null) {
            cells[i].innerHTML = game_board[y][x].id;
            let piece_id = Object.keys(game_board[y][x])[0];
            let pieceText = Players[piece_id.split("-")[1]].account.pieces[piece_id].displayText;
            let isPromoted = game_board[y][x][piece_id];
            let color = piece_id.split("-")[1] === "A" ? "black" : "white";
            cells[i].innerHTML = `<div class="piece ${color} ${isPromoted ? "promoted" : ""}" id="${piece_id}">${pieceText}</div>`;
            if (whoseTurn == "A" && piece_id.split("-")[1] === "A" && loggedInPlayer.id == Players.A.id || whoseTurn == "B" && piece_id.split("-")[1] === "B" && loggedInPlayer.id == Players.B.id) {
                if (available_jumps && checkForAvailableJumpsForPiece(piece_id) && !rateLimitActive) {
                    cells[i].addEventListener("click", selectPiece);
                } else if (!available_jumps && !rateLimitActive) {
                    cells[i].addEventListener("click", selectPiece);
                }
            }
        } else {
            cells[i].innerHTML = "";
        }

        if (showCoords) {
            cells[i].innerHTML = cells[i].innerHTML + `${x}-${y}`;
        }
    }
}


const checkForAvailableJumps = () => {
    let game_board = Game.board;
    let available_jumps = false;
    for (let i = 0; i < Object.keys(Players[whoseTurn].account.pieces).length; i++) {
        let piece_id = Object.keys(Players[whoseTurn].account.pieces)[i];
        if (piece_id.split("-")[1] === whoseTurn) {
            let coords = getPieceCoordinates(piece_id, Game);
            let x = null;
            let y = null;
            if (coords != null) {
                x = coords.x;
                y = coords.y;
                for (let j = -1; j <= 1; j += 2) {
                    let isPromoted = game_board[y][x][piece_id];
                    let x_check = parseInt(x) + j;

                    if (isPromoted) {
                        for (let k = -1; k <= 1; k += 2) {
                            let y_check = parseInt(y) + k;
                            if (x_check >= 0 && x_check <= 7 && y_check >= 0 && y_check <= 7) {
                                if (game_board[y_check][x_check] != null) {
                                    let checked_piece_id = Object.keys(game_board[y_check][x_check])[0];
                                    if (checked_piece_id.split("-")[1] !== whoseTurn) {
                                        let x_jump = x_check + j;
                                        let y_jump = y_check + k;
                                        if (x_jump >= 0 && x_jump <= 7 && y_jump >= 0 && y_jump <= 7) {
                                            if (game_board[y_jump][x_jump] === null) {
                                                available_jumps = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        let y_check = parseInt(y) + (whoseTurn === "A" ? 1 : -1);
                        if (x_check >= 0 && x_check <= 7 && y_check >= 0 && y_check <= 7) {
                            if (game_board[y_check][x_check] != null) {
                                let checked_piece_id = Object.keys(game_board[y_check][x_check])[0];
                                if (checked_piece_id.split("-")[1] !== whoseTurn) {
                                    let x_jump = x_check + j;
                                    let y_jump = y_check + (whoseTurn === "A" ? 1 : -1);
                                    if (x_jump >= 0 && x_jump <= 7 && y_jump >= 0 && y_jump <= 7) {
                                        if (game_board[y_jump][x_jump] === null) {
                                            available_jumps = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return available_jumps;
}

// AI Assistant Generated Code Snippet
const getPieceCoordinates = (pieceId, gameData) => {
    const board = gameData.board;
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            const cell = board[y][x];
            if (cell && cell.hasOwnProperty(pieceId)) {
                return { x, y };
            }
        }
    }
    return null;  // Return null if the piece is not found on the board
};
// End AI Assistant Generated Code Snippet


// AI Assistant Generated Code Snippet
const checkForAvailableJumpsForPiece = (piece_id) => {
    let coords = getPieceCoordinates(piece_id, Game);
    let game_board = Game.board;
    let available_jumps = false;

    if (coords == null) {
        return false;
    }

    let { x, y } = coords;
    let isPromoted = game_board[y][x][piece_id];

    for (let j = -1; j <= 1; j += 2) {
        let x_check = parseInt(x) + j;

        let y_directions = isPromoted ? [-1, 1] : [(whoseTurn === "A" ? 1 : -1)];
        for (let k of y_directions) {
            let y_check = parseInt(y) + k;
            if (x_check >= 0 && x_check <= 7 && y_check >= 0 && y_check <= 7) {
                if (game_board[y_check][x_check] != null) {
                    let checked_piece_id = Object.keys(game_board[y_check][x_check])[0];
                    if (checked_piece_id.split("-")[1] !== whoseTurn) {
                        let x_jump = x_check + j;
                        let y_jump = y_check + k;
                        if (x_jump >= 0 && x_jump <= 7 && y_jump >= 0 && y_jump <= 7) {
                            if (game_board[y_jump][x_jump] === null) {
                                available_jumps = true;
                            }
                        }
                    }
                }
            }
        }
    }
    return available_jumps;
};
// End AI Assistant Generated Code Snippet

const selectPiece = (event) => {
    clearHighlights();
    clearSelection();
    if (event.target.classList.contains("cell")) {
        return;
    }

    let piece = event.target;
    let cell = event.target.parentElement;
    let x = cell.id.split("-")[0];
    let y = cell.id.split("-")[1];
    selected_piece = Game.board[y][x];
    if (selected_piece != null) {
        highlightMoves(x, y);
        piece.classList.add("selected");
    }
}

const highlightMoves = (x, y) => {
    let piece = selected_piece;
    let piece_player = Object.keys(piece)[0].split("-")[1];
    let isPromoted = piece[Object.keys(piece)[0]];

    for (let i = -1; i <= 1; i += 2) {
        let x_check = parseInt(x) + i;

        if (isPromoted) {
            for (let j = -1; j <= 1; j += 2) {
                let y_check = parseInt(y) + j;
                if (x_check >= 0 && x_check <= 7 && y_check >= 0 && y_check <= 7) {
                    if (Game.board[y_check][x_check] != null && Object.keys(Game.board[y_check][x_check])[0].split("-")[1] !== piece_player) {
                        let x_jump = x_check + i;
                        let y_jump = y_check + j;
                        if (x_jump >= 0 && x_jump <= 7 && y_jump >= 0 && y_jump <= 7) {
                            if (Game.board[y_jump][x_jump] === null) {
                                let cell = document.getElementById(`${x_jump}-${y_jump}`);
                                cell.classList.add("highlighted");
                                cell.addEventListener("click", () => {
                                    planMovePiece(piece, x, y, x_jump, y_jump);
                                });
                            }
                        }
                    }
                    if (Game.board[y_check][x_check] === null && !checkForAvailableJumpsForPiece(Object.keys(piece)[0])) {
                        let cell = document.getElementById(`${x_check}-${y_check}`);
                        cell.classList.add("highlighted");
                        cell.addEventListener("click", () => {
                            planMovePiece(piece, x, y, x_check, y_check);
                        });
                    }
                }
            }
        } else {

            let y_check = parseInt(y) + (piece_player === "A" ? 1 : -1);
            if (x_check >= 0 && x_check <= 7 && y_check >= 0 && y_check <= 7) {
                if (Game.board[y_check][x_check] != null && Object.keys(Game.board[y_check][x_check])[0].split("-")[1] !== piece_player) {
                    let x_jump = x_check + i;
                    let y_jump = y_check + (piece_player === "A" ? 1 : -1);
                    if (x_jump >= 0 && x_jump <= 7 && y_jump >= 0 && y_jump <= 7) {
                        if (Game.board[y_jump][x_jump] === null) {
                            let cell = document.getElementById(`${x_jump}-${y_jump}`);
                            cell.classList.add("highlighted");
                            cell.addEventListener("click", () => {
                                planMovePiece(piece, x, y, x_jump, y_jump);
                            });

                        }
                    }
                }
                if (Game.board[y_check][x_check] === null && !checkForAvailableJumpsForPiece(Object.keys(piece)[0])) {
                    let cell = document.getElementById(`${x_check}-${y_check}`);
                    cell.classList.add("highlighted");
                    cell.addEventListener("click", () => {
                        planMovePiece(piece, x, y, x_check, y_check);
                    });
                }
            }
        }
    }
}

const clearSelection = () => {
    document.querySelectorAll(".selected").forEach((el) => {
        el.classList.remove("selected");
    });
    selected_piece = null;
}

const clearHighlights = () => {
    document.querySelectorAll(".highlighted").forEach((el) => {
        el.classList.remove("highlighted");
    });
}

const planMovePiece = (piece, old_x, old_y, new_x, new_y) => {
    if (pieceMoved) {
        return;
    }
    if (selected_piece == null) return;
    if (selected_piece != piece) return;
    let undoButton = document.getElementById("undo-button");
    undoButton.classList.remove("disabled");
    let submitButton = document.getElementById("submit-button");
    submitButton.classList.remove("disabled");

    let old_cell = document.getElementById(`${old_x}-${old_y}`);
    let new_cell = document.getElementById(`${new_x}-${new_y}`);
    let pieceText = Players[Object.keys(selected_piece)[0].split("-")[1]].account.pieces[Object.keys(selected_piece)[0]].displayText;
    new_cell.innerHTML = `<div class="piece ghost ${selected_piece.promoted ? "promoted" : ""}" id="${Object.keys(selected_piece)[0]}">${pieceText}</div>`
    old_cell.innerHTML = `<div class="piece shadow ${selected_piece.promoted ? "promoted" : ""}" id="shadow"></div>`;

    gameBoard = Game.board;
    gameBoard[new_y][new_x] = selected_piece;
    gameBoard[old_y][old_x] = null;

    let jumped_piece = null;
    if (Math.abs(new_x - old_x) > 1) {
        let x_jump = (parseInt(new_x) + parseInt(old_x)) / 2;
        let y_jump = (parseInt(new_y) + parseInt(old_y)) / 2;
        jumped_piece = Game.board[y_jump][x_jump];
        Game.board[y_jump][x_jump] = null;
        let jumped_cell = document.getElementById(`${x_jump}-${y_jump}`);
        jumped_cell.innerHTML = "";
    }

    clearHighlights();
    if (jumped_piece != null && checkForAvailableJumpsForPiece(Object.keys(selected_piece)[0])) {
        highlightMoves(new_x, new_y);
    }
}

const undo = (event) => {
    if (event.target.classList.contains("disabled")) {
        return;
    }
    location.reload();
    // To speed up we could maybe save board state to a cookie
    // Then onload check if there's a cached board state and load it
    // Then remove the cached board state
    // otherwise just load the board state from the backend
}

const handleSubmitMove = async (event) => {
    pieceMoved = true;
    if (event.target.classList.contains("disabled")) {
        return;
    }
    if (loggedInPlayer.id === Game.players.A.id && whoseTurn !== "A") {
        alert("It's not your turn");
        return;
    } else if (loggedInPlayer.id === Game.players.B.id && whoseTurn !== "B") {
        alert("It's not your turn");
        return;
    }

    if (!gameBoard) {
        alert("You must move a piece before submitting");
        return;
    }

    event.target.classList.add("disabled");
    event.target.innerHTML = "Submitting...";
    document.getElementById("undo-button").classList.add("disabled");


    let url = `https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/game/take-turn`;
    let data = {
        "id": Game.id,
        "board": gameBoard,
        "players": {
            "A": {
                "id": Players.A.id,
                "lastTurnTakenAt": Players.A.lastTurnTakenAt
            },
            "B": {
                "id": Players.B.id,
                "lastTurnTakenAt": Players.B.lastTurnTakenAt
            }
        },
        "gameOver": false,
        "turnCount": Game.turnCount
    }
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`,
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if (data["error"]) {
            alert(data["error"]);
        } else {
            window.location.href = `play_game.html?game=${Game.id}`;
        }
    }).catch((error) => {
        event.target.classList.remove("disabled");
        event.target.innerHTML = "Submit Move";
        document.getElementById("undo-button").classList.remove("disabled");
        console.error('Error:', error);
        alert('Error submitting move');
    });
}

const getGame = async (gameId) => {
    let url = `https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/game/view/${gameId}`;
    let gameData = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        return response.json();
    }).then((data) => {
        document.getElementById("loading-slate").style.display = "none";
        return data;
    });
    return gameData;
};

const setColors = (players) => {
    let root = document.documentElement;
    root.style.setProperty("--player-a-piece-color-primary", players.A.account.piecesAColor);
    root.style.setProperty("--player-b-piece-color-primary", players.B.account.piecesBColor);
    root.style.setProperty("--player-a-outline-color", Players.A.account.highlightColor);
    root.style.setProperty("--player-b-outline-color", Players.B.account.highlightColor);
}

const renderPlayers = () => {
    let playerA = document.getElementById("player-a-slate");
    let playerB = document.getElementById("player-b-slate");
    playerA.style.backgroundColor = Players.A.account.backgroundColor;
    playerA.querySelector(".playerName").innerHTML = Players.A.account.name;
    playerA.querySelector(".friendCode").innerHTML = Players.A.account.id;
    playerA.querySelector(".player-victories").innerHTML = Players.A.account.victories;
    playerB.style.backgroundColor = Players.B.account.backgroundColor;
    playerB.querySelector(".friendCode").innerHTML = Players.B.account.id;
    playerB.querySelector(".playerName").innerHTML = Players.B.account.name;
    playerB.querySelector(".player-victories").innerHTML = Players.B.account.victories;
    playerA.addEventListener("click", () => {
        let areTheySure = confirm(`Leave this game and view ${Players.A.account.name}'s profile?`);
        if (areTheySure) {
            window.location.href = `profile.html?user=${Players.A.account.id}`;
        }
    });
    playerB.addEventListener("click", () => {
        let areTheySure = confirm(`Leave this game and view ${Players.B.account.name}'s profile?`);
        if (areTheySure) {
            window.location.href = `profile.html?user=${Players.B.account.id}`;
        }
    });
    renderTimeSinceLastTurn();
}

const renderTimeSinceLastTurn = () => {
    if (Players === null || Game === null) {
        return;
    }
    let playerASinceLastTurn = document.getElementById("time-since-last-turn-player-a");
    let playerBSinceLastTurn = document.getElementById("time-since-last-turn-player-b");
    let lastTurnA = new Date(Players.A.lastTurnTakenAt);
    // convert from UTC to local time
    lastTurnA.setMinutes(lastTurnA.getMinutes() - lastTurnA.getTimezoneOffset());
    let lastTurnB = new Date(Players.B.lastTurnTakenAt);
    lastTurnB.setMinutes(lastTurnB.getMinutes() - lastTurnB.getTimezoneOffset());
    let now = new Date();
    let timeSinceLastTurnA = now - lastTurnA;
    let timeSinceLastTurnB = now - lastTurnB;
    // Format as a string DD:HH:MM:SS
    let timeSinceLastTurnAString = formatTimeSinceLastTurn(timeSinceLastTurnA);
    let timeSinceLastTurnBString = formatTimeSinceLastTurn(timeSinceLastTurnB);


    if (lastTurnA.getSeconds() === 0) {
        playerASinceLastTurn.innerHTML = "First Turn";
    } else {
        playerASinceLastTurn.innerHTML = timeSinceLastTurnAString;
    }
    if (lastTurnB.getSeconds() === 0) {
        playerBSinceLastTurn.innerHTML = "First Turn";
    } else {
        playerBSinceLastTurn.innerHTML = timeSinceLastTurnBString;
    }

    let hoursSinceLastTurn = getHoursSinceLastTurn(whoseTurn === "A" ? Players.A.lastTurnTakenAt : Players.B.lastTurnTakenAt);
    if (hoursSinceLastTurn >= 24) {
        rateLimitActive = false;
    } else {
        rateLimitActive = true;
    }
    // rateLimitActive = false;
}

const formatTimeSinceLastTurn = (time) => {
    let days = Math.floor(time / (1000 * 60 * 60 * 24));
    let hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${days}:${hours}:${minutes}:${seconds}`;
}

const getHoursSinceLastTurn = (time) => {
    let now = new Date();
    let lastTurn = new Date(time);
    lastTurn.setMinutes(lastTurn.getMinutes() - lastTurn.getTimezoneOffset());
    let hours = Math.floor((now - lastTurn) / (1000 * 60 * 60));
    return hours;
}

const getWinner = (game) => {
    // Check who has more pieces left
    let totalWhite = 0;
    let totalBlack = 0;
    for (let iter = 0; iter < game.board.length; iter++) {
        let row = game.board[iter];
        for (let j = 0; j < row.length; j++) {
            let cell = row[j];
            if (cell !== null) {
                if (Object.keys(cell)[0].split("-")[1] == "A") {
                    totalBlack++;
                } else {
                    totalWhite++;
                }
            }
        }
    }
    if (totalBlack > totalWhite) {
        return "A";
    } else if (totalWhite > totalBlack) {
        return "B";
    }
}

window.onload = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const game_id = urlParams.get('game');

    Game = await getGame(game_id);
    loggedInPlayer = await getUser();

    if (loggedInPlayer == null) {
        alert("You are not logged in");
        window.location.href = "index.html";
    }

    Players.A = Game.players.A
    Players.B = Game.players.B
    if (Game.turnCount % 2 == 0) {
        whoseTurn = "A"
    } else {
        whoseTurn = "B"
    }

    if (Game.players.A.id !== loggedInPlayer.id && Game.players.B.id !== loggedInPlayer.id) {
        alert("You are not a player in this game");
        window.location.href = "index.html";
    }

    renderPlayers();

    // Get Game from backend instead of this ^^^^
    setColors(Players);
    renderBoard(Game);

    if (Game.gameOver) {
        let winner = getWinner(Game);
        let winnerHighlightColor = Players[winner].account.highlightColor;
        let winnerName = Players[winner].account.name;
        let buttonBar = document.getElementById("button-bar");
        buttonBar.innerHTML = "<h3 style='color: " + winnerHighlightColor + ";'>" + winnerName + " has won the game!</h3>";

    }

    document.addEventListener("dblclick", () => {
        clearSelection();
        clearHighlights();
    })
}

setInterval(renderTimeSinceLastTurn, 1000);
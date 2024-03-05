let loggedInUser = null;

const getGameList = async () => {
    let gameList = [];
    let url = "https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/game/list"
    gameList = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`,
        },
    }).then((response) => {
        return response.json();
    }).then((data) => {
        document.getElementById('loading-slate').style.display = "none";
        if (data.hasOwnProperty("message")) {
            if (data.message == "No games found") {
                console.log("No games found")
                document.getElementById('game-container').innerHTML = `
                <div id="no-invites-message" class="slate">
                    <h3>
                        You have no games at this time.
                    </h3>
                </div>`;
            }
        }
        return data;
    });

    for (let i = 0; i < gameList.length; i++) {
        if (gameList[i].gameOver) {
            console.log("Game Over")
            gameList.push(gameList[i]);
            gameList.splice(i, 1);
        }
    }

    for (let i = 0; i < gameList.length; i++) {
        let game = gameList[i];


        let inviteElement = document.createElement('div');
        inviteElement.classList.add('slate');
        inviteElement.classList.add('game');
        let turn = game.turnCount % 2 === 1 ? "White" : "Black";
        let totalWhite = 0;
        let totalBlack = 0;

        if (game.board !== null) {
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
        }


        let whoseLoggedIn = null;
        if (game.players.B.id === loggedInUser.id) {
            whoseLoggedIn = "B";
        } else {
            whoseLoggedIn = "A";
        }

        let header3Text = null;
        let winner = getWinner(game);
        if (game.gameOver) {
            header3Text = `Game Over! <span class="player-name bold">${game.players[winner].name}</span> has won!`;
        } else {
            if (game.players.B.id === loggedInUser.id) {
                header3Text = `You have invited <span class="player-name bold">${game.players.A["name"]}</span> to play a game of checkers.`;
            } else {
                header3Text = `<span class="player-name bold">${game.players.B["name"]}</span> has invited you to play a game of checkers.`;
            }
        }

        let turnText = getTimeUntilNextTurn(game.players[whoseLoggedIn]) == "0:0:0" ? "Now!" : getTimeUntilNextTurn(game.players[whoseLoggedIn]);
        if (turnText == "Now!" && whoseLoggedIn == "A" && turn == "White") {
            turnText = "After Opponent";
        } else if (turnText == "Now!" && whoseLoggedIn == "B" && turn == "Black") {
            turnText = "After Opponent";
        }

        inviteElement.innerHTML = `
            <h3>
                ${header3Text}
            </h3>
            <div class="button-container">
                <p class="button submit" onclick="playGameClicked('${game.id}')">${getTimeUntilNextTurn(game.players[whoseLoggedIn]) == "0:0:0" ? "Play Game" : "View Game"}</p>
                <h3 class="no-margin" style="text-align: left; flex-grow:1; padding-left: 10px;" id="${game.id + "-timer"}">Next Turn: <br /><span class="bold">${turnText}</span></h3>
                <h3 class="no-margin" id="vs">
                    <span style="color: black; ${turn == "Black" ? "font-weight: bold; text-decoration: underline;" : ""}">${totalBlack}</span> vs. <span style="color: white;">${totalWhite}</span>
                </h1>
                <p class="button cancel" style="visibility: ${game.gameOver ? "hidden" : "visible"};" onclick="handleConcedeClicked('${game.id}')">Concede</p>
                </div>
            `; // turncount % 2 = 1 or 0, 0 is black or white idk yet
        updateTimer(game.players[whoseLoggedIn], game.id + "-timer", whoseLoggedIn, turn);
        document.getElementById('game-container').appendChild(inviteElement);
    }

    if (gameList.length === 0) {
        let inviteElement = document.createElement('div');
        // inviteElement.classList.add('slate');
        // inviteElement.classList.add('invite');
        inviteElement.innerHTML = `
        <div id="no-invites-message" class="slate hidden">
            <h3>
                You have no games at this time.
            </h3>
        </div>`;
        document.getElementById('game-container').appendChild(inviteElement);
    }
};

const updateTimer = (player, id, whoseLoggedIn, turn) => {
    let timer = setInterval(() => {
        let time = getTimeUntilNextTurn(player);

        let turnText = time == "0:0:0" ? "Now!" : time;
        if (turnText == "Now!" && ((whoseLoggedIn == "A" && turn == "White") || (whoseLoggedIn == "B" && turn == "Black"))) {
            turnText = "After Opponent";
        }
        document.getElementById(id).innerHTML = `Next Turn: <br /><span class="bold">${turnText}</span>`;

        if (time == "0:0:0") {
            clearInterval(timer);
        }
    }, 1000);
}

const playGameClicked = (gameId) => {
    window.location.href = `play_game.html?game=${gameId}`;
};

const handleConcedeClicked = (gameId) => {
    let areTheySure = confirm("Are you sure you want to concede the game?");
    if (areTheySure) {
        fetch(`https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/game/concede/${gameId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('token')}`,
            },
        }).then((response) => {
            return response.json();
        }).then((data) => {
            window.location.href = "games.html";
        });
    }
}

const handleNewGameClicked = (event) => {
    event.target.classList.add('disabled');
    fetch("https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/invite/random",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('token')}`,
            },
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (data.hasOwnProperty("message")) {
                alert(data.message);
            } else if (data.hasOwnProperty("gameID")) {
                window.location.href = "play_game.html?game=" + data.gameID;
            }
            event.target.classList.remove('disabled');
        }).catch((error) => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.')
            event.target.classList.remove('disabled');
        });
};

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

const getTimeUntilNextTurn = (player) => {
    if (!player.hasOwnProperty("lastTurnTakenAt")) {
        return "00:00:00";
    }
    let lastTurnA = new Date(player.lastTurnTakenAt);
    // convert from UTC to local time
    lastTurnA.setMinutes(lastTurnA.getMinutes() - lastTurnA.getTimezoneOffset());
    let aDayAfterLastTurnA = new Date(lastTurnA);
    aDayAfterLastTurnA.setDate(aDayAfterLastTurnA.getDate() + 1);
    let now = new Date();
    let timeUntilNextTurn = aDayAfterLastTurnA - now;


    // Format as a string DD:HH:MM:SS
    let timeSinceLastTurnAString = formatTimeSinceLastTurn(timeUntilNextTurn);

    return timeSinceLastTurnAString;
}

const formatTimeSinceLastTurn = (time) => {
    let hours = Math.max(Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 0);
    let minutes = Math.max(Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)), 0);
    let seconds = Math.max(Math.floor((time % (1000 * 60)) / 1000), 0);
    return `${hours}:${minutes}:${seconds}`;
}

const getHoursSinceLastTurn = (time) => {
    let now = new Date();
    let lastTurn = new Date(time);
    lastTurn.setMinutes(lastTurn.getMinutes() - lastTurn.getTimezoneOffset());
    let hours = Math.floor((now - lastTurn) / (1000 * 60 * 60));
    return hours;
}

window.onload = () => {
    loggedInUser = getUser();
    if (!loggedInUser) {
        window.location.href = 'index.html';
    } else {
        getGameList();
    }
};
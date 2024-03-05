// Doesn't include "promoted" property because that's a game state thing
let Piece_inDB = {
    "id": "1-A", // {PieceNumber}-{TeamLetter} A = Black, B = White
    "displayText": "text",
    "lifetimeKills": 0,
    "lifetimeDeaths": 0, //Display ratio on stats page
    "lifetimePromotions": 0
}

let PlayerA_inDB = {
    "id": "213123-123123-123123-123213", //Friend Code
    "name": "Player A",
    "email": "playerA@email.com",
    "password": "shhhhhhhhhhhhh",
    "victories": 1,
    "pieces": {
        "1-A": { // {PieceNumber}-{TeamLetter} A = Black, B = Whit: {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0, //Display ratio on stats page
            "lifetimePromotions": 0
        },
        "2-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "3-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "4-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "5-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "6-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "7-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "8-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "9-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "10-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "11-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "12-A": {

            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "1-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "2-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "3-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "4-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "5-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "6-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "7-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "8-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "9-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "10-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "11-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        },
        "12-B": {
            "displayText": "text",
            "lifetimeKills": 0,
            "lifetimeDeaths": 0,
            "lifetimePromotions": 0
        }
    },
    "piecesAColor": "#000000",
    "piecesBColor": "#ffffff",
    "highlightColor": "#ffe600",
    "backgroundColor": "#adadad"
}

let Piece_inGame = {
    "1-A": false // {PieceNumber}-{TeamLetter} A = Black, B = White | True = Promoted
}

let Game_inDB = {
    "id": "123123-123123-123123-123213", //Game Code
    "players": {
        "A": {
            "id": "213123-123123-123123-123213",
            "lastTurnTakenAt": "TIMESTAMP"
        },
        "B": {
            "id": "213123-123123-123123-123213",
            "lastTurnTakenAt": "TIMESTAMP"
        }
    },
    "turnCount": 0,
    "board": [
        [
            null,
            {
                "1-A": false
            },
            null,
            {
                "2-A": false
            },
            null,
            {
                "3-A": false
            },
            null,
            {
                "4-A": false
            }
        ],
        [
            {
                "5-A": false
            },
            null,
            {
                "6-A": false
            },
            null,
            {
                "7-A": false
            },
            null,
            {
                "8-A": false
            }
        ],
        [
            null,
            {
                "9-A": false
            },
            null,
            {
                "10-A": false
            },
            null,
            {
                "11-A": false
            },
            null,
            {
                "12-A": false
            }
        ],
        [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],
        [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],
        [
            {
                "1-B": false
            },
            null,
            {
                "2-B": false
            },
            null,
            {
                "3-B": false
            },
            null,
            {
                "4-B": false
            }
        ],
        [
            null,
            {
                "5-B": false
            },
            null,
            {
                "6-B": false
            },
            null,
            {
                "7-B": false
            },
            null,
            {
                "8-B": false
            }
        ],
        [
            {
                "9-B": false
            },
            null,
            {
                "10-B": false
            },
            null,
            {
                "11-B": false
            },
            null,
            {
                "12-B": false
            }
        ]
    ]
};

let invite_inDB = {
    "id": "123123-123123-123123-123213", //Invite Code
    "from": "213123-123123-123123-123213",
    "from-name": "Player A",
    "from-background-color": "#adadad",
    "from-highlight-color": "#ffe600",
    "to": "213123-123123-123123-123213",
}
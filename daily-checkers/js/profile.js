let User = null;

const handleClickPiece = (event) => {
    // Get the piece that was clicked
    // Open up a menu allowing the user to edit the piece's text
    // (and possibly view per-piece stats)
    // ONLY AVAILABLE TO VICTORS
    const piece = event.target;
    const pieceText = piece.innerHTML;
    const pieceId = piece.id;
    const pieceColor = pieceId.split('-')[1] === 'A' ? 'black' : 'white';
    const textColor = pieceColor === 'black' ? 'white' : 'black';

    piece.innerHTML = `
    <input type="text" value="${pieceText}" style="width:100%; text-align: center; background-color: transparent; color: ${textColor};" />
    `;
    const label = piece.querySelector('input');
    label.focus();

    const eventListenerEvent = (event) => {
        piece.innerHTML = label.value;
        if (pieceText != label.value) {
            document.getElementById('submit-button').style.animation = 'pulse 3s infinite';
            User.pieces[pieceId].displayText = label.value;
            setUser(User);
        }
    }

    label.addEventListener('blur', eventListenerEvent);
    label.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            eventListenerEvent();
        }
    });

};

const handleEditClicked = () => {
    // Show Hidden Edit Fields
    // Hide the Shown non-edit fields
    let editorSlate = document.getElementById('editor-slate');
    let playerSlate = document.getElementById('player-slate');
    editorSlate.classList.remove('hidden');
    playerSlate.classList.add('hidden');
};

const handleSaveClicked = (event) => {
    let button = event.target;
    if (button.classList.contains('disabled')) {
        return;
    }

    let playerIdElement = document.getElementById('player-id');
    let playerNameField = document.getElementById('name-field');
    let playerEmailField = document.getElementById('email-field');
    let playerNewPassword = document.getElementById('new-password-field');
    let playerConfirmPassword = document.getElementById('confirm-password-field');

    if (!playerConfirmPassword.value) {
        alert('For your own security, the Confirm Password field cannot be empty.');
        return;
    }
    if (!playerNameField.value) {
        alert('The Name field cannot be empty.');
        return;
    }
    if (!playerEmailField.value) {
        alert('The Email field cannot be empty.');
        return;
    }

    button.classList.add('disabled');
    button.innerText = 'Saving...';

    const user = {
        id: playerIdElement.innerHTML,
        name: playerNameField.value,
        email: playerEmailField.value,
        newPassword: playerNewPassword.value,
        confirmPassword: playerConfirmPassword.value,
    };

    const url = 'https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/user/update/' + user.id;
    const token = getCookie('token');
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(user),
    })
        .then(response => {
            console.log(response);
            if (response.status !== 200) {
                button.classList.remove('disabled');
                button.innerHTML = 'Save';
                throw new Error('An error occurred. Please try again later.');
            }

            return response.json();
        })
        .then(data => {
            renderProfile(data);
            setCookie('user', JSON.stringify(data), 2);
            handleCancelClicked();
            button.classList.remove('disabled');
            button.innerHTML = 'Save';
            playerConfirmPassword.value = '';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Account changes could not be saved. Please check your password and try again later.')
        });
};

const handleCancelClicked = () => {
    // Hide the editor
    // Show the player
    let editorSlate = document.getElementById('editor-slate');
    let playerSlate = document.getElementById('player-slate');
    editorSlate.classList.add('hidden');
    playerSlate.classList.remove('hidden');
};

const handleDeleteClicked = (event) => {
    let areTheySure = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!areTheySure) {
        return;
    } else {
        let areTheyReallySure = confirm('Are you really sure? This action cannot be undone!!');
        if (!areTheyReallySure) {
            return;
        }
    }

    let button = event.target;
    if (button.classList.contains('disabled')) {
        return;
    } else {
        button.classList.add('disabled');
        button.innerText = 'Deleting...';
    }

    const user = getUser();
    const url = 'https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/user/delete/' + user.id;
    const token = getCookie('token');
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
    })
        .then(response => {
            button.classList.remove('disabled');
            button.innerHTML = 'Delete';
            if (response.status === 200) {
                setUser(null);
                setCookie('token', '', 0);
                alert('Account deleted successfully.');
                window.location.href = 'index.html';
            } else {
                alert('An error occurred. Please try again later.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.')
        });
};

const renderProfile = (User) => {
    let nameElement = document.getElementById('playerName');
    nameElement.innerText = User.name;
    let friendCodeElement = document.getElementById('friendCode');
    friendCodeElement.innerText = User.id;
    let playerWinsElement = document.getElementById('player-victories');
    playerWinsElement.innerText = User.victories;


    let playerPieces = User.pieces;
    let pieces = document.getElementsByClassName('piece');
    let itter_count = 0;
    for (let piece of pieces) {
        if (User.victories > 0) {
            piece.innerText = User.pieces[piece.id].displayText;
            piece.title = `${piece.innerText}\nLifetime Kills: ${User.pieces[piece.id].lifetimeKills}\nLifetime Deaths: ${User.pieces[piece.id].lifetimeDeaths}\nLifetime Promotions: ${User.pieces[piece.id].lifetimePromotions}`;
        }
        itter_count++;
    }

    // Set the colors
    document.documentElement.style.setProperty('--player-a-piece-color-primary', User.piecesAColor);
    document.documentElement.style.setProperty('--player-b-piece-color-primary', User.piecesBColor);
    document.documentElement.style.setProperty('--current-player-outline-color', User.highlightColor);
    document.documentElement.style.setProperty('--current-player-background-color', User.backgroundColor);

    // Set field values
    let playerIdElement = document.getElementById('player-id');
    playerIdElement.innerHTML = User.id;
    let playerNameField = document.getElementById('name-field');
    playerNameField.value = User.name;
    let playerEmailField = document.getElementById('email-field');
    playerEmailField.value = User.email;
    let highlightColor = document.getElementById('highlight-color');
    highlightColor.value = User.highlightColor;
    let backgroundColor = document.getElementById('background-color');
    backgroundColor.value = User.backgroundColor;
    let piecesAColor = document.getElementById('pieces-a-color');
    piecesAColor.value = User.piecesAColor;
    let piecesBColor = document.getElementById('pieces-b-color');
    piecesBColor.value = User.piecesBColor;
};

const handleSaveCustomizeClicked = (event) => {
    let button = event.target;
    if (button.classList.contains('disabled')) {
        return;
    } else {
        button.classList.add('disabled');
        button.innerText = 'Saving...';
    }
    let highlightColor = document.getElementById('highlight-color');
    let backgroundColor = document.getElementById('background-color');
    let piecesAColor = document.getElementById('pieces-a-color');
    let piecesBColor = document.getElementById('pieces-b-color');
    let pieces = getUser().pieces;
    let id = getUser().id;
    let body = {
        highlightColor: highlightColor.value,
        backgroundColor: backgroundColor.value,
        piecesAColor: piecesAColor.value,
        piecesBColor: piecesBColor.value,
        pieces: pieces,
    }
    const url = "https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/user/update-customization/" + id;
    const token = getCookie('token');
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(body)
    }).then(response => {
        console.log(response);
        if (response.status !== 200) {
            button.classList.remove('disabled');
            button.innerHTML = 'Update Customization';
            throw new Error('An error occurred. Please try again later.');
        }

        return response.json();
    }).then(data => {
        setCookie('user', JSON.stringify(data), 2);
        renderProfile(data);
        button.classList.remove('disabled');
        button.innerHTML = 'Update Customization';
    }).catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.')
    });
}

const emptyUser = {
    "victories": "0",
    "piecesAColor": "#000000",
    "piecesBColor": "#ffffff",
    "highlightColor": "#ff0000",
    "pieces": {
        "12-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "12-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "11-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "11-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "10-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "10-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "1-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "2-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "1-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "3-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "2-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "4-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "3-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "5-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "4-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "6-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "5-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "7-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "6-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "8-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "7-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "9-A": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "8-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        },
        "9-B": {
            "displayText": "",
            "lifetimeKills": "0",
            "lifetimeDeaths": "0",
            "lifetimePromotions": "0"
        }
    },
    "id": "93a1c909-d471-4c34-80dc-c4b2f89d3996",
    "email": "Spinto@gmail.com",
    "backgroundColor": "#050505",
    "name": "User Not Found"
}

window.onload = () => {
    // Get the user's profile
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const user_id = urlParams.get('user');
    if (user_id == null) {
        User = getUser();
        let id = User.id;
        let profileButton = document.getElementById('profile-button');
        profileButton.classList.add('disabled');
        let customizationSlate = document.getElementById('customization-slate');
        customizationSlate.classList.remove('hidden');
        const url = `https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/user/view/${id}`;
        fetch(url, {
            headers: {
                'content-type': 'application/json',
                'Authorization': getCookie('token'),
            }
        })
            .then(
                response => {
                    if (response.status === 404) {
                        return null;
                    }
                    return response.json()
                })
            .then(data => {
                if (data === null) {
                    return;
                }
                User = data;
                renderProfile(User);
                setUser(User);
                let profileTitle = document.getElementById('profile-title');
                profileTitle.innerText = `${User.name}'s Profile`;
                if (User.victories > 1) {
                    // Initialize the interactable JavaScript bits
                    let pieces = document.getElementsByClassName('piece');
                    let itter_count = 0;
                    for (let piece of pieces) {
                        piece.addEventListener('click', handleClickPiece);
                        if (itter_count < 12) {
                            piece.id = `${itter_count + 1}-A`;
                        } else {
                            piece.id = `${itter_count - 11}-B`;
                        }
                        itter_count++;
                    }

                    let customizationStation = document.getElementById('customization-station');
                    customizationStation.classList.remove('hidden');
                    let nonVictorMessage = document.getElementById('non-victor-message');
                    nonVictorMessage.classList.add('hidden');
                }
            })
            .catch((error) => {
                console.log('Error:', error);
                alert('An error occurred. Please try again later.');
            });
    } else {
        let editButton = document.getElementById('edit-button');
        editButton.classList.add('hidden');
        const url = `https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/user/view/${user_id}`;
        fetch(url)
            .then(
                response => {
                    if (response.status === 404) {
                        return null;
                    }
                    return response.json()
                })
            .then(data => {
                if (data === null) {
                    return;
                }
                User = data;
                renderProfile(User);
                let profileTitle = document.getElementById('profile-title');
                profileTitle.innerText = `${User.name}'s Profile`;
                if (User.victories < 1) {
                    let customizationStation = document.getElementById('customization-slate');
                    customizationStation.classList.add('hidden');
                }
            })
            .catch((error) => {
                console.log('Error:', error);
                alert('An error occurred. Please try again later.');
            });
    }
    if (User) {
        if (User.victories > 0) {
            // Initialize the interactable JavaScript bits
            let pieces = document.getElementsByClassName('piece');
            let itter_count = 0;
            for (let piece of pieces) {
                piece.addEventListener('click', handleClickPiece);
                if (itter_count < 12) {
                    piece.id = `${itter_count + 1}-A`;
                } else {
                    piece.id = `${itter_count - 11}-B`;
                }
                itter_count++;
            }

            let customizationStation = document.getElementById('customization-station');
            customizationStation.classList.remove('hidden');
            let nonVictorMessage = document.getElementById('non-victor-message');
            nonVictorMessage.classList.add('hidden');
        }

        renderProfile(User);
    } else {
        renderProfile(emptyUser);
    }
}
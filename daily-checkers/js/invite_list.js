// Fetch Invites
// Generate Invite List
// Accept Invites
// Decline Invites
// Send Invites

const getInviteList = async () => {
    let inviteList = [];
    let url = "https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/invite/list"
    inviteList = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`,
        },
    }).then((response) => {
        return response.json();
    }).then((data) => {
        document.getElementById('loading-slate').style.display = "none";
        console.log(data)
        return data["invites"];
    });



    for (let i = 0; i < inviteList.length; i++) {
        let invite = inviteList[i];
        let inviteElement = document.createElement('div');
        inviteElement.classList.add('slate');
        inviteElement.classList.add('invite');
        inviteElement.id = invite.id;
        inviteElement.style.backgroundColor = invite["from-background-color"];
        inviteElement.innerHTML = `
        <h3>
            <span class="player-name bold" style="color: ${invite["from-highlight-color"]};">${invite["from-name"]}</span> has invited you to play a game of checkers.
        </h3>
        <div class="button-container">
            <p class="button submit" onclick="acceptInviteClicked('${invite.id}')">Accept</p>
            <p class="button cancel" onclick="declineInviteClicked('${invite.id}')">Decline</p>
        </div>
            `;

        document.getElementById('invite-container').appendChild(inviteElement);
    }
    console.log(inviteList.length);
    if (inviteList.length == 0) {
        let inviteElement = document.createElement('div');
        inviteElement.innerHTML = `
        <div id="no-invites-message" class="slate">
            <h3>
                You have no game invites at this time.
            </h3>
        </div>
            `;
        document.getElementById('invite-container').appendChild(inviteElement);
    }
};

const acceptInviteClicked = async (inviteId) => {
    console.log(inviteId);
    let inviteSlate = document.getElementById(inviteId);
    console.log(inviteSlate);
    let buttons = inviteSlate.getElementsByClassName('button');
    console.log(buttons);
    buttons[1].style.filter = "grayscale(100%) brightness(150%)";
    buttons[1].style.transform = "translate(4px, 4px)";
    buttons[1].style.boxShadow = "none";
    buttons[0].innerHTML = "Accepting...";
    buttons[0].style.transform = "translate(4px, 4px)";
    buttons[0].style.boxShadow = "none";
    fetch("https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/invite/accept/" + inviteId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`,
        },
    }).then((response) => {
        return response.json();
    }).then((data) => {
        // if data has gameID field
        if (data["gameID"]) {
            window.location.href = `play_game.html?game=${data["gameID"]}`;
        }
    }).catch((error) => {
        console.error('Error:', error);
        alert('Error accepting invite');
    });

};

const declineInviteClicked = async (inviteId) => {
    console.log(inviteId);
    let inviteSlate = document.getElementById(inviteId);
    console.log(inviteSlate);
    let buttons = inviteSlate.getElementsByClassName('button');
    console.log(buttons);
    buttons[0].classList.add('disabled');
    buttons[1].innerHTML = "Declining...";
    buttons[1].style.transform = "translate(4px, 4px)";
    buttons[1].style.boxShadow = "none";
    fetch("https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/invite/decline/" + inviteId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`,
        },
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        inviteSlate.remove();
    }).catch((error) => {
        console.error('Error:', error);
        alert('Error accepting invite');
    });
};

const handleNewInviteClicked = async () => {
    let friendCode = document.getElementById('friend-code').value;
    if (friendCode) {
        let url = "https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/invite/" + friendCode;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('token')}`,
            },
        }).then((response) => {
            if (response.status === 404) {
                alert('User not found');
                return;
            }

            if (response.status !== 200) {
                alert('Error sending invite');
                return;
            }

            return response.json();
        }).then((data) => {
            if (!data) return;
            document.getElementById('friend-code').value = "";
            alert('Invite sent');
        }).catch((error) => {
            console.error('Error:', error);
            alert('Error sending invite');
        });
    } else {
        alert('Please enter a friend code');
    }
};


window.onload = () => {
    getInviteList();
};
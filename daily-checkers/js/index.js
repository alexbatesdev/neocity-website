window.onload = () => {
    if (!isUserLoggedIn()) {
        let logoutButton = document.getElementById('log-out-button');
        logoutButton.classList.add('hidden');
        let gamesButton = document.getElementById('games-button');
        gamesButton.classList.add('hidden');
        let profileButton = document.getElementById('profile-button');
        profileButton.classList.add('hidden');
        let inviteButton = document.getElementById('invite-button');
        inviteButton.classList.add('hidden');
    } else {
        let loggedInBar = document.getElementById('logged-in-bar');
        let loggedOutBar = document.getElementById('logged-out-bar');
        loggedInBar.classList.remove('hidden');
        loggedOutBar.classList.add('hidden');

    }
};
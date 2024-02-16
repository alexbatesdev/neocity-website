const europaClick = () => {
    let clipperFeed = document.getElementById('clipper-feed');
    let infoFrame = document.getElementsByClassName('info-frame')[0];
    let miniMenu = document.getElementsByClassName('mini-menu')[0];

    if (clipperFeed.classList.contains('hidden')) {
        clipperFeed.classList.remove('hidden');
        infoFrame.classList.add('hidden');
        miniMenu.classList.remove('hidden');
    } else {
        clipperFeed.classList.add('hidden');
        infoFrame.classList.remove('hidden');
        miniMenu.classList.add('hidden');
    }
}
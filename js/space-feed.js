const toggleMenu = () => {
    let infoFrame = document.getElementsByClassName('info-frame')[0];
    let miniMenu = document.getElementsByClassName('mini-menu')[0];

    if (miniMenu.classList.contains('hidden')) {
        infoFrame.classList.add('hidden');
        miniMenu.classList.remove('hidden');
    } else {
        infoFrame.classList.remove('hidden');
        miniMenu.classList.add('hidden');
    }
}

const toggleFullScreen = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}
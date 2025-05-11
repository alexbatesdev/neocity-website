const USERNAME = "nekkostarr";
const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${USERNAME}/latest-song`;
let Track = {};

const getTrack = async () => {
    const tracks = await fetch(BASE_URL)
        .then(response => response.json())
        .catch((error) => {
            console.log(error);
            return null;
        })
    if (!tracks.hasOwnProperty('track')) return console.log('No track found');

    let current_song = tracks['track'];
    Track = current_song;
    let isPlaying = current_song['@attr']?.nowplaying || false;
    let cover_image_url = current_song.image[2]['#text'];
    if (cover_image_url === "") {
        cover_image_url = "https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png";
    }

    let title = current_song.name;
    let artist = current_song.artist['#text'];
    let url = current_song.url;

    let almbumArt = document.getElementById('album-art');
    let songTitle = document.getElementById('title');
    let songArtist = document.getElementById('artist');
    let listeningLabel = document.getElementById('listening-label');

    almbumArt.src = cover_image_url;
    songTitle.innerHTML = title;
    songTitle.href = url;
    songTitle.target = "_blank";
    songArtist.innerHTML = artist;

    if (!isPlaying) {
        listeningLabel.innerHTML = "Recently Listened to:";
    } else {
        listeningLabel.innerHTML = "Currently Listening to:";
    }
};



setInterval(() => { getTrack(); }, 10000);
getTrack();

const playSoundEffect = (filename) => {
    const audio = new Audio(`/sfx/${filename}`);
    audio.play();
}

window.addEventListener('load', () => {
    const parallaxElements = document.querySelectorAll('.plax');
    console.log(parallaxElements);
    const scrollContainer = document.querySelector('.retro-scrollbar');
    console.log(scrollContainer);
    scrollContainer.addEventListener('scroll', () => {
        parallaxElements.forEach(element => {
            // console.log('parallax element', element);
            calculateParallax(element);
        });
    });
});

function calculateParallax(element) {
    const scrollContainer = document.querySelector('.retro-scrollbar');
    const PARALLAX_SENSITIVITY = 50;
    
    // Get the z-index from the class (e.g., "z50")
    let zIndex = 0;
    element.classList.forEach(className => {
        if (className.startsWith('z')) {
            zIndex = parseInt(className.replace('z', ''), 10);
        }
    });
    const parallaxSpeed = (zIndex / 100) * PARALLAX_SENSITIVITY;

    console.log(`zIndex: ${zIndex}`);
    // log scrollContainer scrollHeight
    console.log(`scrollContainer scrollHeight: ${scrollContainer.scrollHeight}`);
    // log scrollContainer scrollTop
    console.log(`scrollContainer scrollTop: ${scrollContainer.scrollTop}`);
    // log scrollContainer scrollBottom
    console.log(`scrollContainer scrollHeight - scrollTop - clientHeight: ${scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight}`);
    // log scrollContainer clientHeight
    console.log(`scrollContainer clientHeight: ${scrollContainer.clientHeight}`);
    // log normalized scroll position
    const normalizedScrollPosition = 1 - (scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight) / (scrollContainer.scrollHeight - scrollContainer.clientHeight);
    console.log(`normalizedScrollPosition: ${normalizedScrollPosition}`);

    // Calculate the new position of the element based on the scroll position and parallax speed
    const newPosition = (normalizedScrollPosition - 0.5) * parallaxSpeed * 100;
    console.log(`newPosition: ${newPosition}`);
    // Apply the new position to the element
    const computedStyle = window.getComputedStyle(element);
    element.style.transform = `translateY(${newPosition}%)`;
    console.log(computedStyle.transform);
// matrix(1, 0, 0, 1, 0, 42.6357)
// matrix(0.866025, 0.5, -0.5, 0.866025, 0, 0)

    
}
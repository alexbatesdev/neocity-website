const USERNAME = "nekkostarr";
const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${USERNAME}/latest-song`;

const getTrack = async () => {
    const tracks = await fetch(BASE_URL)
        .then(response => response.json())
        .catch((error) => {
            console.log(error);
            return null;
        })
    if (!tracks.hasOwnProperty('track')) return console.log('No track found');

    let current_song = tracks['track'];
    let isPlaying = current_song['@attr']?.nowplaying || false;
    let cover_image_url = current_song.image[2]['#text'];

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

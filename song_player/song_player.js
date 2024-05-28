let SP_audio = null;
let SP_last_track_number = -1;
let SP_track_element = document.getElementById("SP-track-name");
let SP_track_scrolling_left = true;
let SP_artist_element = document.getElementById("SP-artist-name");
let SP_artist_scrolling_left = true;

let song_data = [
    {
        "name": "Guy Gets Promoted / End Title",
        "artist": "Tom Hiel",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/01%20Track%2001.mp3"
    },
    {
        "name": "The Singing Sea",
        "artist": "Tulivu-Donna Cumberbatch",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/02%20Track%2002.mp3"
    },
    {
        "name": "La Valse d'Amelie",
        "artist": "Yann Tiersen",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/03%20Track%2003.mp3"
    },
    {
        "name": "Come Undone",
        "artist": "Duran Duran",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/04%20Track%2004.mp3"
    },
    {
        "name": "This Is a Lie",
        "artist": "The Cure",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/05%20Track%2005.mp3"
    },
    {
        "name": "Millennia",
        "artist": "Hotel de Ville",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/06%20Track%2006.mp3"
    },
    {
        "name": "Trust",
        "artist": "The Cure",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/07%20Track%2007.mp3"
    },
    {
        "name": "Perfect Disguise",
        "artist": "Modest Mouse",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/08%20Track%2008.mp3"
    },
    {
        "name": "The Last Beat of My Heart",
        "artist": "Siouxsie and the Banshees",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/09%20Track%2009.mp3"
    },
    {
        "name": "The World Has Turned and Left Me Here",
        "artist": "Christopher John",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/10%20Track%2010.mp3"
    },
    {
        "name": "Moonlight Sonata",
        "artist": "Depeche Mode",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/11%20Track%2011.mp3"
    },
    {
        "name": "Fear of the South",
        "artist": "Tin Hat Trio",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/12%20Track%2012.mp3"
    },
    {
        "name": "One More Time",
        "artist": "The Cure",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/13%20Track%2013.mp3"
    },
    {
        "name": "Max Payne 2 Theme",
        "artist": "Kärtsy Hatakka & Kimmo Kajasto",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/14%20Track%2014.mp3"
    },
    {
        "name": "If Only Tonight We Could Sleep",
        "artist": "The Cure",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/15%20Track%2015.mp3"
    },
    {
        "name": "This Side of the Blue",
        "artist": "Joanna Newsom",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/16%20Track%2016.mp3"
    },
    {
        "name": "Playground Love",
        "artist": "Air",
        "url": "https://github.com/alexbatesdev/neocity-website/raw/master/Sleep%20CD/17%20Track%2017.mp3"
    }
];

const play_song = (track_number) => {
    if (SP_audio && SP_audio.paused) {
        console.log("Resuming song")
        SP_audio.play();
        return;
    } else if (SP_audio && track_number == null) {
        console.log(track_number, SP_last_track_number)
        console.log("Pausing song")
        SP_audio.pause();
        return;
    }
    if (!track_number && SP_last_track_number === -1) {
        track_number = 0;
    } else if (track_number >= song_data.length) {
        track_number = 0;
    } else if (track_number < 0) {
        track_number = song_data.length - 1;
    }

    if (SP_audio && !SP_audio.paused) {
        stop_song();
    }
    
    let song_url = song_data[track_number].url;
    console.log("Playing song: " + song_data[track_number].name + " by " + song_data[track_number].artist);
    document.getElementById("SP-track-name").innerHTML = song_data[track_number].name;
    document.getElementById("SP-artist-name").innerHTML = song_data[track_number].artist;
    SP_audio = new Audio(song_url);
    SP_audio.play();
    SP_last_track_number = track_number;
}

const pause_song = () => {
    console.log("Pausing song")
    SP_audio.pause();
}

const next_song = () => {
    console.log("Playing next song")
    let next_track_number = SP_last_track_number + 1;
    if (next_track_number >= song_data.length) {
        next_track_number = 0;
    }

    play_song(next_track_number);
}

const prev_song = () => {
    console.log("Playing previous song")
    let prev_track_number = SP_last_track_number - 1;
    if (prev_track_number < 0) {
        prev_track_number = song_data.length - 1;
    }

    play_song(prev_track_number);
}

const stop_song = () => {
    console.log("Stopping music")
    SP_audio.pause();
    SP_audio = null;
    SP_last_track_number = -1;
}

const getSongProgressString = (audio_object) => {
    if (!audio_object) {
        return "0:00";
    }
    const current_time = audio_object.currentTime || 0;
    return `${Math.floor(current_time / 60)}:${Math.floor(current_time % 60).toString().padStart(2, '0')}`;
}

const getSongDurationString = (audio_object) => {
    if (!audio_object) {
        return "0:00";
    }
    const duration = audio_object.duration || 0;
    return `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
}

const updateDurationText = (audio_object) => {
    let progressText = document.getElementById('SP-duration-total');
    progressText.innerHTML = getSongDurationString(audio_object);
}

const updateProgressText = (audio_object) => {
    let progressText = document.getElementById('SP-duration-current');
    progressText.innerHTML = getSongProgressString(audio_object);
}

const getSongProgressPercent = (audio_object) => {
    if (audio_object == null) return 0;
    const currentTime = audio_object.currentTime;
    const duration = audio_object.duration;
    return currentTime / duration;
}

const updateProgressBar = (progressFloat) => {
    let progressTruncated = progressFloat.toFixed(2);
    let progressBar = document.getElementById('progress-bar-fill');
    progressBar.style.width = progressTruncated + "%";
}

const scrollTrackText = () => {
    if (SP_track_element.scrollWidth > SP_track_element.clientWidth + SP_track_element.scrollLeft && SP_track_scrolling_left) {
        console.log("Scrolling text");
        SP_track_element.scrollBy(1, 0);
    } else {
        SP_track_scrolling_left = false;
    }
    if (!SP_track_scrolling_left) {
        console.log("Scrolling text back");
        SP_track_element.scrollBy(-0.5, 0);
        if (SP_track_element.scrollLeft === 0) {
            SP_track_scrolling_left = true;
        }
    }
}

const scrollArtistText = () => {
    if (SP_artist_element.scrollWidth > SP_artist_element.clientWidth + SP_artist_element.scrollLeft && SP_artist_scrolling_left) {
        console.log("Scrolling text");
        SP_artist_element.scrollBy(1, 0);
    } else {
        SP_artist_scrolling_left = false;
    }
    if (!SP_artist_scrolling_left) {
        console.log("Scrolling text back");
        SP_artist_element.scrollBy(-0.5, 0);
        if (SP_artist_element.scrollLeft === 0) {
            SP_artist_scrolling_left = true;
        }
    }
}

const renderPauseOrPlayButton = () => {
    let play_button = document.getElementById('SP-play');
    let pause_button = document.getElementById('SP-pause');
    if (SP_audio && !SP_audio.paused) {
        play_button.style.display = "none";
        pause_button.style.display = "block";
    } else {
        play_button.style.display = "block";
        pause_button.style.display = "none";
    }
}


setInterval(() => {
    scrollTrackText();
    scrollArtistText();
    updateProgressBar(getSongProgressPercent(SP_audio) * 100)
    updateProgressText(SP_audio);
    updateDurationText(SP_audio);
    renderPauseOrPlayButton();
}, 50);
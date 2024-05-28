class MusicPlayer {
    constructor(element, song_data) {
        this.SP_parent_element = element;
        this.SP_audio = null;
        this.SP_last_track_number = -1;
        console.log(this.SP_parent_element, element);
        this.SP_track_element = this.SP_parent_element.querySelector(".SP-track-name");
        this.SP_track_scrolling_left = true;
        this.SP_artist_element = this.SP_parent_element.querySelector(".SP-artist-name");
        this.SP_artist_scrolling_left = true;
        this.SP_song_data = song_data;
    }

    start = () => {
        let buttons = this.SP_parent_element.querySelectorAll('.SP-button');
        buttons.forEach((button) => {
            button.addEventListener('click', (event) => {
                if (event.target.classList.contains("SP-play")) {
                    this.play_song();
                } else if (event.target.classList.contains("SP-pause")) {
                    this.pause_song();
                } else if (event.target.classList.contains("SP-next")) {
                    this.next_song();
                } else if (event.target.classList.contains("SP-prev")) {
                    this.prev_song();
                } else if (event.target.classList.contains("SP-stop")) {
                    this.stop_song();
                }
            });
        });

        setInterval(() => {
            this.scrollTrackText();
            this.scrollArtistText();
            this.updateProgressBar(this.getSongProgressPercent(this.SP_audio) * 100)
            this.updateProgressText(this.SP_audio);
            this.updateDurationText(this.SP_audio);
            this.renderPauseOrPlayButton();
        }, 50);
    }

    play_song = (track_number) => {
        console.log("Playing song", track_number)
        if (this.SP_audio && this.SP_audio.paused) {
            console.log("Resuming song")
            this.SP_audio.play();
            return;
        } else if (this.SP_audio && track_number == null) {
            console.log(track_number, this.SP_last_track_number)
            console.log("Pausing song")
            this.SP_audio.pause();
            return;
        }
        if (!track_number && this.SP_last_track_number === -1) {
            track_number = 0;
        } else if (track_number >= song_data.length) {
            track_number = 0;
        } else if (track_number < 0) {
            track_number = song_data.length - 1;
        }
    
        if (this.SP_audio && !this.SP_audio.paused) {
            this.stop_song();
        }
    
        let song_url = song_data[track_number].url;
        console.log(track_number)
        console.log("Playing song: " + song_data[track_number].name + " by " + song_data[track_number].artist);
        this.SP_parent_element.querySelector(".SP-track-name").innerHTML = song_data[track_number].name;
        this.SP_parent_element.querySelector(".SP-artist-name").innerHTML = song_data[track_number].artist;
        this.SP_audio = new Audio(song_url);
        this.SP_audio.play();
        this.SP_last_track_number = track_number;
    }
    
    pause_song = () => {
        console.log("Pausing song")
        this.SP_audio.pause();
    }
    
    next_song = () => {
        console.log("Playing next song")
        let next_track_number = this.SP_last_track_number + 1;
        if (next_track_number >= song_data.length) {
            next_track_number = 0;
        }
    
        this.play_song(next_track_number);
    }
    
    prev_song = () => {
        console.log("Playing previous song")
        let prev_track_number = this.SP_last_track_number - 1;
        if (prev_track_number < 0) {
            prev_track_number = song_data.length - 1;
        }
    
        this.play_song(prev_track_number);
    }
    
    stop_song = () => {
        console.log("Stopping music")
        this.SP_audio.pause();
        this.SP_audio = null;
        this.SP_last_track_number = -1;
    }
    
    getSongProgressString = (audio_object) => {
        if (!audio_object) {
            return "0:00";
        }
        const current_time = audio_object.currentTime || 0;
        return `${Math.floor(current_time / 60)}:${Math.floor(current_time % 60).toString().padStart(2, '0')}`;
    }
    
    getSongDurationString = (audio_object) => {
        if (!audio_object) {
            return "0:00";
        }
        const duration = audio_object.duration || 0;
        return `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
    }
    
    updateDurationText = (audio_object) => {
        let progressText = this.SP_parent_element.querySelector('.SP-duration-total');
        progressText.innerHTML = this.getSongDurationString(audio_object);
    }
    
    updateProgressText = (audio_object) => {
        let progressText = this.SP_parent_element.querySelector('.SP-duration-current');
        progressText.innerHTML = this.getSongProgressString(audio_object);
    }
    
    getSongProgressPercent = (audio_object) => {
        if (audio_object == null) return 0;
        const currentTime = audio_object.currentTime;
        const duration = audio_object.duration;
        return currentTime / duration;
    }
    
    updateProgressBar = (progressFloat) => {
        let progressTruncated = progressFloat.toFixed(2);
        let progressBar = this.SP_parent_element.querySelector('.SP-progress-bar-fill');
        progressBar.style.width = progressTruncated + "%";
    }
    
    scrollTrackText = () => {
        if (this.SP_track_element.scrollWidth > this.SP_track_element.clientWidth + this.SP_track_element.scrollLeft && this.SP_track_scrolling_left) {
            this.SP_track_element.scrollBy(1, 0);
        } else {
            this.SP_track_scrolling_left = false;
        }
        if (!this.SP_track_scrolling_left) {
            this.SP_track_element.scrollBy(-0.5, 0);
            if (this.SP_track_element.scrollLeft === 0) {
                this.SP_track_scrolling_left = true;
            }
        }
    }
    
    scrollArtistText = () => {
        if (this.SP_artist_element.scrollWidth > this.SP_artist_element.clientWidth + this.SP_artist_element.scrollLeft && this.SP_artist_scrolling_left) {
            this.SP_artist_element.scrollBy(1, 0);
        } else {
            this.SP_artist_scrolling_left = false;
        }
        if (!this.SP_artist_scrolling_left) {
            this.SP_artist_element.scrollBy(-0.5, 0);
            if (this.SP_artist_element.scrollLeft === 0) {
                this.SP_artist_scrolling_left = true;
            }
        }
    }
    
    renderPauseOrPlayButton = () => {
        let play_button = this.SP_parent_element.querySelector('.SP-play');
        let pause_button = this.SP_parent_element.querySelector('.SP-pause');
        if (this.SP_audio && !this.SP_audio.paused) {
            play_button.style.display = "none";
            pause_button.style.display = "block";
        } else {
            play_button.style.display = "block";
            pause_button.style.display = "none";
        }
    }
}

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
let song_player_element = document.querySelector(".SP-outer");
let audio_player = new MusicPlayer(song_player_element, song_data);
audio_player.start();
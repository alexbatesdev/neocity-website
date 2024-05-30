// This component is where the magic happens!
// You shouldn't need to modify this unless you are adding new features! >🐢
class MusicPlayer {
    constructor(element, song_data) {
        this.parent_element = element;
        this.audio = null;
        this.current_track_index = -1;
        this.track_element = this.parent_element.querySelector(".SP-track-name");
        this.track_scrolling_left = true;
        this.artist_element = this.parent_element.querySelector(".SP-artist-name");
        this.artist_scrolling_left = true;
        this.song_data = song_data;
        this.isDragging = false;
        this.start();
    }

    start = () => {
        this.initializeButtons();
        this.initializeStatefulRenderingInterval();
        this.initializeProgressBar();
    }

    initializeStatefulRenderingInterval = () => {
        setInterval(() => {
            this.scrollTrackText();
            this.scrollArtistText();
            this.updateProgressBar(this.getSongProgressPercent(this.audio) * 100)
            this.updateProgressText(this.audio);
            this.updateDurationText(this.audio);
            this.renderPauseOrPlayButton();
        }, 50);
    }

    initializeButtons = () => {
        let buttons = this.parent_element.querySelectorAll('.SP-button');
        buttons.forEach((button) => {
            button.addEventListener('click', (event) => {
                switch (true) {
                    case event.target.classList.contains("SP-play"):
                        this.play_song();
                        break;
                    case event.target.classList.contains("SP-pause"):
                        this.pause_song();
                        break;
                    case event.target.classList.contains("SP-next"):
                        this.next_song();
                        break;
                    case event.target.classList.contains("SP-prev"):
                        this.prev_song();
                        break;
                    case event.target.classList.contains("SP-stop"):
                        this.stop_song();
                        break;
                    default:
                        break;
                }
            });
        });
    }

    initializeProgressBar = () => {
        let progressKnob = this.parent_element.querySelector('.SP-progress-bar-knob');
        let progressBar = this.parent_element.querySelector('.SP-progress-bar');
        progressKnob.addEventListener('pointerdown', (event) => {
            this.isDragging = true;
            event.preventDefault();
        });

        this.parent_element.addEventListener('pointermove', (event) => {
            if (!this.isDragging || !this.audio) return;
            const boundingRect = progressBar.getBoundingClientRect();
            let percent = (event.clientX - boundingRect.left) / boundingRect.width;
            percent = Math.max(0, Math.min(1, percent));
            this.audio.currentTime = this.audio.duration * percent;
            this.updateProgressBar(percent * 100);
        });
        document.addEventListener('pointerup', () => {
            this.isDragging = false;
        });
        
        progressBar.addEventListener('click', (event) => {
            if (this.audio == null || this.isDragging) return; // Skip if dragging or audio is not initialized
            const bounding = progressBar.getBoundingClientRect();
            const percent = (event.clientX - bounding.left) / bounding.width;
            this.audio.currentTime = this.audio.duration * percent;
            this.updateProgressBar(percent * 100);
        });
    }

    play_song = (track_number) => {
        // If the audio is paused and the track number is the same as the current track, just resume playing
        if (this.audio && this.audio.paused && (track_number === this.current_track_index || track_number == null)) {
            this.audio.play();
            return;
        // If the audio is playing, but the play button is pressed, pause the audio
        } else if (this.audio && track_number == null) {
            this.audio.pause();
            return;
        }
        // Loop the song list if the track number is out of bounds
        if (!track_number && this.current_track_index === -1) {
            track_number = 0;
        } else if (track_number >= this.song_data.length) {
            track_number = 0;
        } else if (track_number < 0) {
            track_number = this.song_data.length - 1;
        }

        // Stop the current song if it is playing
        if (this.audio && !this.audio.paused) {
            this.stop_song();
        }
        
        // Play the song
        let song_url = this.song_data[track_number].url;
        this.parent_element.querySelector(".SP-track-name").innerHTML = this.song_data[track_number].name;
        this.parent_element.querySelector(".SP-artist-name").innerHTML = this.song_data[track_number].artist;
        this.audio = new Audio(song_url);
        this.audio.addEventListener('ended', () => {
            this.audio.currentTime = 0;
            this.next_song();
        });
        this.audio.play();
        this.current_track_index = track_number;
    }
    
    pause_song = () => {
        this.audio.pause();
    }
    
    next_song = () => {
        let next_track_number = this.current_track_index + 1;
        if (next_track_number >= this.song_data.length) {
            next_track_number = 0;
        }
        this.play_song(next_track_number);
    }
    
    prev_song = () => {
        let prev_track_number = this.current_track_index - 1;
        if (prev_track_number < 0) {
            prev_track_number = this.song_data.length - 1;
        }
    
        this.play_song(prev_track_number);
    }
    
    stop_song = () => {
        this.audio.pause();
        this.audio = null;
        this.current_track_index = -1;
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
        let progressText = this.parent_element.querySelector('.SP-duration-total');
        progressText.innerHTML = this.getSongDurationString(audio_object);
    }
    
    updateProgressText = (audio_object) => {
        let progressText = this.parent_element.querySelector('.SP-duration-current');
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
        let progressBar = this.parent_element.querySelector('.SP-progress-bar-fill');
        progressBar.style.width = progressTruncated + "%";
    }
    
    // This function scrolls the track text in the player when it is too long to fit in the container
    scrollTrackText = () => {
        if (this.track_element.scrollWidth > this.track_element.clientWidth + this.track_element.scrollLeft && this.track_scrolling_left) {
            this.track_element.scrollBy(1, 0);
        } else {
            this.track_scrolling_left = false;
        }
        if (!this.track_scrolling_left) {
            this.track_element.scrollBy(-0.5, 0);
            if (this.track_element.scrollLeft === 0) {
                this.track_scrolling_left = true;
            }
        }
    }
    
    // This function scrolls the artist text in the player when it is too long to fit in the container
    scrollArtistText = () => {
        if (this.artist_element.scrollWidth > this.artist_element.clientWidth + this.artist_element.scrollLeft && this.artist_scrolling_left) {
            this.artist_element.scrollBy(1, 0);
        } else {
            this.artist_scrolling_left = false;
        }
        if (!this.artist_scrolling_left) {
            this.artist_element.scrollBy(-0.5, 0);
            if (this.artist_element.scrollLeft === 0) {
                this.artist_scrolling_left = true;
            }
        }
    }
    
    // This hides the play button when the audio is playing and hides the pause button when the audio is paused
    renderPauseOrPlayButton = () => {
        let play_button = this.parent_element.querySelector('.SP-play');
        let pause_button = this.parent_element.querySelector('.SP-pause');
        if (this.audio && !this.audio.paused) {
            play_button.style.display = "none";
            pause_button.style.display = "block";
        } else {
            play_button.style.display = "block";
            pause_button.style.display = "none";
        }
    }
}
// Song files hosted on github >🐢
let song_data_absolute = [
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
// Song files hosted on nekoweb >🐢
let song_data_relative = [
    {
        "name": "Guy Gets Promoted / End Title",
        "artist": "Tom Hiel",
        "url": "../Sleep CD/01 Track 01.mp3"
    },
    {
        "name": "The Singing Sea",
        "artist": "Tulivu-Donna Cumberbatch",
        "url": "../Sleep CD/02 Track 02.mp3"
    },
    {
        "name": "La Valse d'Amelie",
        "artist": "Yann Tiersen",
        "url": "../Sleep CD/03 Track 03.mp3"
    },
    {
        "name": "Come Undone",
        "artist": "Duran Duran",
        "url": "../Sleep CD/04 Track 04.mp3"
    },
    {
        "name": "This Is a Lie",
        "artist": "The Cure",
        "url": "../Sleep CD/05 Track 05.mp3"
    },
    {
        "name": "Millennia",
        "artist": "Hotel de Ville",
        "url": "../Sleep CD/06 Track 06.mp3"
    },
    {
        "name": "Trust",
        "artist": "The Cure",
        "url": "../Sleep CD/07 Track 07.mp3"
    },
    {
        "name": "Perfect Disguise",
        "artist": "Modest Mouse",
        "url": "../Sleep CD/08 Track 08.mp3"
    },
    {
        "name": "The Last Beat of My Heart",
        "artist": "Siouxsie and the Banshees",
        "url": "../Sleep CD/09 Track 09.mp3"
    },
    {
        "name": "The World Has Turned and Left Me Here",
        "artist": "Christopher John",
        "url": "../Sleep CD/10 Track 10.mp3"
    },
    {
        "name": "Moonlight Sonata",
        "artist": "Depeche Mode",
        "url": "../Sleep CD/11 Track 11.mp3"
    },
    {
        "name": "Fear of the South",
        "artist": "Tin Hat Trio",
        "url": "../Sleep CD/12 Track 12.mp3"
    },
    {
        "name": "One More Time",
        "artist": "The Cure",
        "url": "../Sleep CD/13 Track 13.mp3"
    },
    {
        "name": "Max Payne 2 Theme",
        "artist": "Kärtsy Hatakka & Kimmo Kajasto",
        "url": "../Sleep CD/14 Track 14.mp3"
    },
    {
        "name": "If Only Tonight We Could Sleep",
        "artist": "The Cure",
        "url": "../Sleep CD/15 Track 15.mp3"
    },
    {
        "name": "This Side of the Blue",
        "artist": "Joanna Newsom",
        "url": "../Sleep CD/16 Track 16.mp3"
    },
    {
        "name": "Playground Love",
        "artist": "Air",
        "url": "../Sleep CD/17 Track 17.mp3"
    }
];


// Automatically initialize all song players on the page with the same data >🐢
let song_player_elements = document.querySelectorAll(".StarrPlayer");
let audio_players = [];

song_player_elements.forEach((element) => {
    let audio_player = new MusicPlayer(element, song_data_relative);
    audio_players.push(audio_player);
});

// Load the song players manually >🐢
// let song_player_basic = document.querySelector(".StarrPlayer");
// let basic_player = new MusicPlayer(song_player_basic, song_data_relative);

// // This one loads from github via an absolute path >🐢
// let song_player_stone = document.querySelector("#SP-stone.StarrPlayer");
// let stone_player = new MusicPlayer(song_player_stone, song_data_absolute);

// // This one loads from nekoweb via a relative path >🐢
// let song_player_tv = document.querySelector("#SP-tv.StarrPlayer");
// let tv_player = new MusicPlayer(song_player_tv, song_data_relative);
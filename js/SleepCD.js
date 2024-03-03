let audio = null;
let last_track_number = -1;
let paused = false;

let song_data = [
    {
        "name": "Guy Gets Promoted / End Title",
        "artist": "Tom Hiel",
        "releaseDate": "09/10/1994",
        "blurb": `This is the first track on the Sleep CD. I don't have 
        a ton to say about it, but it's a good track. I think some of 
        the piano gets a little loud, but I also feel like the earlier
        in a sleep CD are allowed to be a little louder.`
    },
    {
        "name": "The Singing Sea",
        "artist": "Tulivu-Donna Cumberbatch",
        "releaseDate": "10/21/1998",
        "blurb": `This is the second track on the Sleep CD. For years
        I knew this track solely as "that song on my sleep CD", I never
        fell asleep to it, but it did help me relax. Years later I decided
        to watch Cowboy Bebop and I was shocked to hear this song in one of 
        the episodes. It gave me chills.`
    },
    {
        "name": "La Valse d'Amelie",
        "artist": "Yann Tiersen",
        "releaseDate": "04/23/2001",
        "blurb": `This is the third track on the Sleep CD. I think this
        is the first track on the CD that I've actually fallen asleep to.
        I remember really liking this one. My mom said she watched the movie
        with me, but I couldn't read the subtitles fast enough so she dubbed
        the entire movie for me. I don't remember any of that, so I'm ecited
        to be able to watch Amelie for the first time again!`
    },
    {
        "name": "Come Undone",
        "artist": "Duran Duran",
        "releaseDate": "03/23/1993",
        "blurb": `This is the fourth track on the Sleep CD. This song gives
        off a dreamy vibe. I don't really know how to turn the feelings I have
        associated with these songs into words, and I think this track is as good
        of one to admit that than any other. This song is good, but it definitely
        does get a little loud. If I were to make changes to the CD, I'd probably
        move it closer to the beginning a little.`
    },
    {
        "name": "This Is a Lie",
        "artist": "The Cure",
        "releaseDate": "05/07/1996",
        "blurb": `This is the fifth track on the Sleep CD.If you had to pick 
        one song to embody this CD I think this would be it.It's a little odd
        for a sleep CD, but that's kinda the vibe of the entire CD. This song is 
        also about polyamory, which is neat.`
    },
    {
        "name": "Millennia",
        "artist": "Hotel de Ville",
        "releaseDate": "05/12/2006",
        "blurb": `This is the sixth track on the Sleep CD.This version is actually
        a beta version of the song! This was found on a music forum where the creator 
        was asking for feedback! The final version is a little different, the only 
        difference I know of are the new inclusion of some shrill ringing bells
        at a specific section.I haven't analyzed the song enough to know if there are
        others.You could probably guess via my verbage, but I don't like the final version.
        `
    },
    {
        "name": "Trust",
        "artist": "The Cure",
        "releaseDate": "04/21/1992",
        "blurb": `This is the seventh track on the Sleep CD. There's a lot of Cure
        on this CD and it's all really good. This whole song carries significant sleepitude.`
    },
    {
        "name": "Perfect Disguise",
        "artist": "Modest Mouse",
        "releaseDate": "06/13/2000",
        "blurb": `This is the eighth track on the Sleep CD. A lot of the
        sleepy factor to the previous music was carried by piano, but this
        song uses a guitar to the same effect. The vocals aren't as soft as
        the other songs, but the rest of it is still sleepy sounding.`
    },
    {
        "name": "The Last Beat of My Heart",
        "artist": "Siouxsie and the Banshees",
        "releaseDate": "09/05/1988",
        "blurb": `This is the ninth track on the Sleep CD. I always liked
        this song because I liked songs sung by girls more as a kid. I don't 
        know if this is because I'm trying to write all these blurbs at once, 
        but I don't have a ton to say except that I am glad I was able to fall 
        asleep to this song. It means a lot to me.`
    },
    {
        "name": "The World Has Turned and Left Me Here",
        "artist": "Christopher John",
        "releaseDate": "02/05/2002",
        "blurb": `This is the tenth track on the Sleep CD. This song is a cover 
        that was lost to the internet for years! Both I and my Uncle who made 
        the Sleep CD looked for it from time to time over the years and we were 
        never able to find it. About a year and a half ago from writing this, 
        someone uploaded it to YouTube! If it ever goes missing from YouTube, 
        the internet has this page as a backup.`
    },
    {
        "name": "Moonlight Sonata",
        "artist": "Depeche Mode",
        "releaseDate": "05/16/1987",
        "blurb": `This is the eleventh track on the Sleep CD. This song is 
        a cover of a song by Beethoven. It's a good example of how the Sleep 
        CD is a little odd. A completely classical song, but covered by a 
        rock(?) band. I don't actually know what genre Depeche Mode is, but 
        they've got a mean classical hook.`
    },
    {
        "name": "Fear of the South",
        "artist": "Tin Hat Trio",
        "releaseDate": "01/01/2002",
        "blurb": `This is the twelfth track on the Sleep CD. This song brings 
        back the strings vibe that Perfect Disguise had. I don't remember much 
        about this song, I remember a couple of the songs being too much for me 
        to fall asleep to, but I don't remember if this was one of them.`
    },
    {
        "name": "One More Time",
        "artist": "The Cure",
        "releaseDate": "05/07/1987",
        "blurb": `This is the thirteenth track on the Sleep CD. This song is yet 
        another cure song. I think this is one I fell asleep to a lot. Something 
        interesting about long term deep emotional attachment to art is that even 
        though my opinions varied a lot between songs, over time those feelings 
        have sort of evened out into one homogenous feeling towards the entire CD 
        as a whole.`
    },
    {
        "name": "Max Payne 2 Theme",
        "artist": "Kärtsy Hatakka & Kimmo Kajasto",
        "releaseDate": "10/14/2003",
        "blurb": `This is the fourteenth track on the Sleep CD. This song is oddly 
        ominous in retrospect, but it is also equally sleepy in my completely biased 
        opinion. As a kid I couldn't fall asleep to pretty much anything with lyrics,
        so I fell asleep to this song a lot.`
    },
    {
        "name": "If Only Tonight We Could Sleep",
        "artist": "The Cure",
        "releaseDate": "05/05/1987",
        "blurb": `This is the fifteenth track on the Sleep CD. This song is the final
        song by The Cure on the CD. The title is very fitting, I don't have much to say
        on this one. Woo! more Cure!`
    },
    {
        "name": "This Side of the Blue",
        "artist": "Joanna Newsom",
        "releaseDate": "03/23/2004",
        "blurb": `This is the sixteenth track on the Sleep CD. This song is one of my
        absolute favorites! I actually didn't like it as a kid because I thought it was
        complete gibberish and that confused me. Now I know that it's half gibberish and
        I really like the weird vibes it gives off. Joanna Newsom happens to be Andy Samberg's
        wife, which is a neat fact that was once told to me and I now repeat. The invention
        of recording technology means your voice could be someone's childhood lullaby and you
        would never know, your voice could be a recording that serves as a lullaby for an entire
        generation of kids decades or even centuries after you lived and died. I really hope
        that someone a hundred years from now is falling asleep to something from this CD.`
    },
    {
        "name": "Playground Love",
        "artist": "Air",
        "releaseDate": "02/20/2000",
        "blurb": `This is the seventeenth track on the Sleep CD. This song is the final
        song on the CD. This song is from the soundtrack of the movie The Virgin Suicides.
        I've never seen or heard of the movie, I just learned that fact right now as of writing
        this! XD The song gives good sleepy vibes, and the playground element was more fitting 
        in the past when I was a kid.`
    }
];

const clicked = (new_track_number) => {
    let disk = document.getElementById('disk');
    let pause_button = document.getElementById('pause-button');
    pause_button.innerHTML = 'Pause';
    if (last_track_number != new_track_number) {
        if (audio != null) audio.pause();
        audio = new Audio(`https://github.com/Mcbuzzerr/neocity-website/raw/master/Sleep%20CD/${new_track_number}%20Track%20${new_track_number}.mp3`);

        updateDurationText();
        updateProgressBar();
        audio.addEventListener("ended", () => {
            audio.currentTime = 0;
            next();
        });

        if (disk.getAnimations().length == 0) {
            disk.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
            ], {
                duration: 10000,
                iterations: Infinity
            });
        }

    }
    audio.play();
    selected_item = document.getElementById(`sng-${new_track_number}`);
    selected_item.classList.add('selected');
    if (last_track_number != -1 && last_track_number != new_track_number) {
        document.getElementById(`sng-${last_track_number}`).classList.remove('selected');
    }
    last_track_number = new_track_number;
    set_track_info(new_track_number);
}

const set_track_info = (track_number_string) => {
    let track_title = document.getElementById('name');
    let track_artist = document.getElementById('artist');
    let track_release_date = document.getElementById('date');
    let track_blurb = document.getElementById('blurb');
    let track_number = Number.parseInt(track_number_string);

    let title_string = song_data[track_number - 1].name;
    let artist_string = song_data[track_number - 1].artist;
    let release_date_string = song_data[track_number - 1].releaseDate;
    let blurb_string = song_data[track_number - 1].blurb;

    track_title.innerHTML = title_string;
    track_artist.innerHTML = artist_string;
    track_release_date.innerHTML = release_date_string;
    track_blurb.innerHTML = blurb_string;
}

const pause_or_play = (event) => {
    if (audio == null) {
        clicked("01");
        return;
    }

    if (!paused) {
        audio.pause();
        disk.getAnimations().forEach((animation) => animation.cancel());
        if (last_track_number != -1) {
            document.getElementById(`sng-${last_track_number}`).classList.remove('selected');
        }
        paused = true;
        event.target.innerHTML = 'Resume';
    } else {
        audio.play();
        disk.animate([
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        });
        selected_item = document.getElementById(`sng-${last_track_number}`);
        selected_item.classList.add('selected');
        paused = false;
        event.target.innerHTML = 'Pause';
    }
}

const next = () => {
    let next_track = Number.parseInt(last_track_number) + 1;
    if (next_track > 17) next_track = 1;
    let next_track_str = next_track.toString().padStart(2, '0');
    clicked(next_track_str);
}

const prev = () => {
    let prev_track = Number.parseInt(last_track_number) - 1;
    if (prev_track < 1) prev_track = 17;
    let prev_track_str = prev_track.toString().padStart(2, '0');
    clicked(prev_track_str);
}


const getSongProgressString = () => {
    const currentTime = audio?.currentTime || 0;
    const duration = audio?.duration || 0;
    return `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')} / ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
}

const getSongProgressPercent = () => {
    if (audio == null) return 0;
    const currentTime = audio.currentTime;
    const duration = audio.duration;
    return currentTime / duration;
}

const updateProgressBar = () => {
    let progressFloat = getSongProgressPercent() * 100;
    let progressTruncated = progressFloat.toFixed(2);
    let progressBar = document.getElementById('progress-bar');
    progressBar.style.width = progressTruncated + "%";
}

const updateDurationText = () => {
    let progressText = document.getElementById('duration');
    progressText.innerHTML = getSongProgressString();
}

setInterval(() => {
    updateProgressBar();
    updateDurationText();
}, 1000);


const progressBar = document.getElementById('progress-bar-outer');
// This code was written by an AI assistant. (Based on my code)

// Define a variable to track whether the user is dragging the progress bar knob.
let isDragging = false;

// Add event listener for mousedown on the progress bar knob.
const progressBarKnob = document.getElementById('progress-bar-knob');
progressBarKnob.addEventListener('mousedown', (event) => {
    isDragging = true;
    // Prevent default behavior to avoid selecting text on drag.
    event.preventDefault();
});

// Add event listener for mousemove on the entire document.
document.addEventListener('mousemove', (event) => {
    if (!isDragging || audio == null) return;
    const bounding = progressBar.getBoundingClientRect();
    let percent = (event.clientX - bounding.left) / bounding.width;
    percent = Math.max(0, Math.min(1, percent)); // Ensure percent is between 0 and 1
    audio.currentTime = audio.duration * percent;
    updateProgressBar();
});

// Add event listener for mouseup on the entire document.
document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Modify the existing click event listener on the progress bar to be more responsive.
progressBar.addEventListener('click', (event) => {
    if (audio == null || isDragging) return; // Skip if dragging or audio is not initialized
    const bounding = progressBar.getBoundingClientRect();
    const percent = (event.clientX - bounding.left) / bounding.width;
    audio.currentTime = audio.duration * percent;
    updateProgressBar();
});

// Ensure the updateProgressBar function is periodically called.
// This could be done within a function that updates the UI based on the current audio playback state.
const updateUI = () => {
    if (!isDragging) {
        updateProgressBar();
    }
    requestAnimationFrame(updateUI);
}

// Start the UI update loop when the page loads.
updateUI();

// This code was written by an AI assistant.

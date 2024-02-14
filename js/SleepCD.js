let audio = null;
let last_track_number = -1;
let paused = false;

const clicked = (new_track_number) => {
    let disk = document.getElementById('disk');
    let pause_button = document.getElementById('pause-button');
    pause_button.innerHTML = 'Pause';
    if (last_track_number != new_track_number) {
        if (audio != null) audio.pause();
        audio = new Audio(`https://github.com/Mcbuzzerr/neocity-website/raw/master/Sleep%20CD/${new_track_number}%20Track%20${new_track_number}.mp3`);

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

onload = () => {

}
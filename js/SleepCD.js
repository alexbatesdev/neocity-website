let audio = null;
let last_track_number = -1;

const clicked = (new_track_number) => {
    if (last_track_number != new_track_number) {
        if (audio != null) audio.pause();
        audio = new Audio(`https://github.com/Mcbuzzerr/neocity-website/raw/master/Sleep%20CD/${new_track_number}%20Track%2${new_track_number}.mp3`);
    }
    console.log(new_track_number)
    audio.play();
    selected_item = document.getElementById(`sng-${new_track_number}`);
    selected_item.classList.add('selected');
    if (last_track_number != -1 && last_track_number != new_track_number) {
        document.getElementById(`sng-${last_track_number}`).classList.remove('selected');
    }
    last_track_number = new_track_number;
}

const stop = () => {
    audio.pause();
}

onload = () => {

}
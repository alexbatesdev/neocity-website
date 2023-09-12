const generateRandomMythBustersEpisode = () => {
    const randomMythBustersSeason = Math.floor(Math.random() * 16) + 1;

    //season 1 has 12 episodes
    //season 2 has 13 episodes
    //season 3 has 24 episodes
    //season 4 has 28 episodes
    //season 5 has 25 episodes
    //season 6 has 20 episodes
    //season 7 has 24 episodes
    //season 8 has 29 episodes
    //season 9 has 22 episodes
    //season 10 has 12 episodes
    //season 11 has 9 episodes
    //season 12 has 11 episodes
    //season 13 has 8 episodes
    //season 14 has 7 episodes
    //season 15 has 14 episodes
    //season 16 has 11 episodes

    //switch statement to set the max number for the random generator
    let maxNumber = 0;
    switch (randomMythBustersSeason) {
        case 1:
            maxNumber = 12;
            break;
        case 2:
            maxNumber = 13;
            break;
        case 3:
            maxNumber = 24;
            break;
        case 4:
            maxNumber = 28;
            break;
        case 5:
            maxNumber = 25;
            break;
        case 6:
            maxNumber = 20;
            break;
        case 7:
            maxNumber = 24;
            break;
        case 8:
            maxNumber = 29;
            break;
        case 9:
            maxNumber = 22;
            break;
        case 10:
            maxNumber = 12;
            break;
        case 11:
            maxNumber = 9;
            break;
        case 12:
            maxNumber = 11;
            break;
        case 13:
            maxNumber = 8;
            break;
        case 14:
            maxNumber = 7;
            break;
        case 15:
            maxNumber = 14;
            break;
        case 16:
            maxNumber = 11;
            break;
        default:
            maxNumber = 0;
    }

    const randomMythBustersEpisode = Math.floor(Math.random() * maxNumber) + 1;

    let string = `: Season ${randomMythBustersSeason} Episode ${randomMythBustersEpisode}`;

    document.getElementById("episode").innerHTML = string;
}
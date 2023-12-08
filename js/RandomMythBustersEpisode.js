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
    //These numbers are the bigger number between the episode count found on the API, and the episode count I commented earlier
    //The reason for this is because the API is missing some episodes
    //There's a message displayed on the page if the episode is missing, because it may exist
    //The numbers hopefully aren't off
    let maxNumber = 0;
    switch (randomMythBustersSeason) {
        case 1:
            maxNumber = 18;
            break;
        case 2:
            maxNumber = 15;
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
            maxNumber = 21;
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
            maxNumber = 21;
            break;
        case 11:
            maxNumber = 9;
            break;
        case 12:
            maxNumber = 14;
            break;
        case 13:
            maxNumber = 13;
            break;
        case 14:
            maxNumber = 11;
            break;
        case 15:
            maxNumber = 14;
            break;
        case 16:
            maxNumber = 12;
            break;
        default:
            maxNumber = 0;
    }

    const randomMythBustersEpisode = Math.floor(Math.random() * maxNumber) + 1;

    let string = `:<br> Season ${randomMythBustersSeason} Episode ${randomMythBustersEpisode}`;
    let episodeData = getEpisodeInfo(randomMythBustersSeason, randomMythBustersEpisode);
    console.log(randomMythBustersSeason, randomMythBustersEpisode);
    episodeData.then(data => {
        console.log(data);
        document.getElementById("tv-screen").style.backgroundImage = data.Poster == undefined ? "url('../img/giphy.gif')" : `url(${data.Poster}`;
        document.getElementById("episode-title").innerHTML = data.Title == undefined ? "Episode Not Found" : data.Title;
        document.getElementById("episode-plot").innerHTML = data.Plot == undefined ? "The database is missing some episodes, it may still exist idk check for yourself" : data.Plot;

        if (data.Poster == undefined) {
            document.getElementsByClassName("tv-fullscreen")[0].href = "/dvd.html";
        } else {
            document.getElementsByClassName("tv-fullscreen")[0].href = "https://sflix.to/tv/free-mythbusters-hd-38891";
        }
    });
    document.getElementById("episode").innerHTML = string;
}

const getEpisodeInfo = async (season, episode) => {
    const respone = await fetch(`https://www.omdbapi.com/?i=tt0383126&Season=${season}&Episode=${episode}&apikey=e3cf8eea`, { //I don't know how to securely hide the API key on neocities, please don't steal it
        method: "GET"
    })
    const data = await respone.json();
    return data;
}
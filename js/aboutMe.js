let inputs = [];
document.body.addEventListener("keydown", (event) => {
    inputs.push(event.key);

    if (inputs.length > 10) {
        inputs.shift();
    }

    if (inputs.join("") == "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba") {
        document.body.style.filter = "hue-rotate(" + Math.floor(Math.random() * 360) + "deg)";
    }
})

const summonCat = (event) => {
    console.log(event)
}

const anotherNeko = () => {
    x = Math.floor(Math.random() * box.boundWidth());
    y = Math.floor(Math.random() * box.boundHeight());
    new Neko(x, y);
}
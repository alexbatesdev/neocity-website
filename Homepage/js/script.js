let themeDict = {
    "blueberry": {
        "--primary-color": "#061555",
        "--secondary-color": "#094292",
        "--tertiary-color": "#006DAA",
        "--accent-color": "#0353A4",
        "--text-color": "#B9D6F2"
    },
    "mint": {
        "--primary-color": "#002A32",
        "--secondary-color": "#08605f",
        "--tertiary-color": "#2EC4B6",
        "--accent-color": "#CBF3F0",
        "--text-color": "#FFFFFF"
    },
    "raisin": {
        "--primary-color": "#201A23",
        "--secondary-color": "#2E2532",
        "--tertiary-color": "#43344A",
        "--accent-color": "#6A477B",
        "--text-color": "#f8e5ee"
    },
    "island": {
        "--primary-color": "#05668D",
        "--secondary-color": "#028090",
        "--tertiary-color": "#00A896",
        "--accent-color": "#02C39A",
        "--text-color": "#F0F3BD"
    },
    "pastel": {
        "--primary-color": "#A6E3E9",
        "--secondary-color": "#FFE6EB",
        "--tertiary-color": "#CBF1F5",
        "--accent-color": "#DEFCFC",
        "--text-color": "#3482C2"
    },
    "beach": {
        "--primary-color": "#3DA5D9",
        "--secondary-color": "#FEC601",
        "--tertiary-color": "#2364AA",
        "--accent-color": "#EA7317",
        "--text-color": "#fffaff"
    }
}

startup();

function startup() {
    GenerateThemeMenu();
    DommyMommy();
}

// Dropdown Menu
let dropdown = document.getElementById("dropdownToggle");
// Dropdown menu Toggle
dropdown.addEventListener("click", evt => {
    document.getElementById("dropContent").classList.toggle("show");
    document.getElementById("dropArrow").classList.toggle("up");
})
// Hides the menu when anything other than the Dropdown itself is clicked
window.onclick = (evt) => {
    if (!evt.target.matches(".drop-btn") &&
        !evt.target.matches("#title") &&
        !evt.target.matches(".drop-arrow")) {

        var dropdownC = document.getElementById("dropContent");
        var arrow = document.getElementById("dropArrow");

        if (dropdownC.classList.contains("show")) dropdownC.classList.remove("show");
        if (arrow.classList.contains("up")) arrow.classList.remove("up");
    }
}
// GenerateThemeMenu() creates the entries in the dropdown menu dynamically depending on the amount of themes
function GenerateThemeMenu() {
    // Called connection because it is our connection to the page and "dropcontent" as a variable name has lost meaning to me
    let connection = document.getElementById("dropContent");
    for (key in themeDict) {
        let themeName = key;
        let item = document.createElement("div");
        // Adding the id, display text, and class to the dropdown item
        item.id = themeName;
        item.innerText = themeName.charAt(0).toUpperCase() + themeName.slice(1);
        item.classList.add("drop-item");
        // Event listener sets the theme when clicked
        item.addEventListener("click", (evt) => {
            localStorage.setItem("theme", item.id);
            DommyMommy();
        })

        // Appends to dropdown menu
        connection.appendChild(item);
    }
    // Adds a rounded bottom to the last element
    connection.lastChild.classList.add("b-bot-rad-20");
}

// DommyMommy() sets all of the css variables the values from the selected theme
// and updates the Theme dropdown title to be that of the current theme
function DommyMommy() {
    if (localStorage.getItem("theme")) {
        let themeName = localStorage.getItem("theme");

        document.getElementById("title").innerText = themeName.charAt(0).toUpperCase() + themeName.slice(1);
        document.documentElement.style.setProperty("--primary-color", themeDict[themeName]["--primary-color"]);
        document.documentElement.style.setProperty("--secondary-color", themeDict[themeName]["--secondary-color"]);
        document.documentElement.style.setProperty("--tertiary-color", themeDict[themeName]["--tertiary-color"]);
        document.documentElement.style.setProperty("--accent-color", themeDict[themeName]["--accent-color"]);
        document.documentElement.style.setProperty("--text-color", themeDict[themeName]["--text-color"]);
    }
}
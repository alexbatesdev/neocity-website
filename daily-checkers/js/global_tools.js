// Simple functions taken straight from W3_schools
// https://www.w3schools.com/js/js_cookies.asp


const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const getCookie = (cname) => {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const getUser = () => {
    try {
        return JSON.parse(getCookie("user"));
    } catch (e) {
        return null;
    }
}

const setUser = (user) => {
    setCookie("user", JSON.stringify(user), 1);
}

let inputs = [];
document.body.addEventListener("keydown", (event) => {
    inputs.push(event.key);

    if (inputs.length > 10) {
        inputs.shift();
    }

    if (inputs.join("") == "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba") {
        // Update css root variable
        let backgroundColor = prompt("Enter new background color (#RRGGBB)", "#5079e9")
        // verify that it's a valid color
        let validColor = /^#[0-9A-F]{6}$/i.test(backgroundColor);
        if (validColor) {
            document.documentElement.style.setProperty('--background-color', backgroundColor);
        } else {
            alert("Invalid color");
        }
    }
})

const handleLogoutClicked = () => {
    console.log('logging out');
    setUser(null);
    window.location.href = 'index.html'
}

const isUserLoggedIn = () => {
    return getUser() != null;
}
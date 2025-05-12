// Bogo Sort Code from https://sortvisualizer.com/bogosort/
// Me and ChatGPT have adapted the code for our own use.

function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) {
            renderArray(arr);
            return false;
        }
    }
    return true;
};

function shuffle(arr) {
    let count = arr.length, temp, index;
    while (count > 0) {
        index = Math.floor(Math.random() * count);
        count--;

        temp = arr[count];
        arr[count] = arr[index];
        arr[index] = temp;
    }

    totalShuffles += 1;
    currentListShuffles += 1;
    return arr;
}

// This code is an adaptation of the provided script to use requestAnimationFrame by an AI assistant.

let the_array = [];
let N = 1; // Starting array size
let animationFrameId; // ID to keep track of the requestAnimationFrame
let totalShuffles = 0;
let currentListShuffles = 0;
let sortingAlgorithms = [shuffleAndCheckSort, cocktailShakerSort];
let sortIndex = 0;
let previousSortTime = new Date().getTime();

function shuffleAndCheckSort() {
    if (isSorted(the_array)) {
        N += 1;
        renderArray(the_array, true);
        setTimeout(initializeArray, 750);

    } else {
        animationFrameId = requestAnimationFrame(shuffleAndCheckSort); // Keep shuffling and checking
    }
    shuffle(the_array);
}

function initializeArray() {
    console.log("Sorted array: ", the_array);
    console.log("- - - - - - - - - - - - - - - - - - ");
    console.log("Total shuffles: ", totalShuffles);
    console.log("Shuffles for this array: ", currentListShuffles);
    console.log("- - - - - - - - - - - - - - - - - - ");
    console.log("Time Sorted at:", new Date().toLocaleTimeString());
    console.log("Time taken to sort: ", formatElapsedTime(previousSortTime, new Date().getTime()));
    previousSortTime = new Date();
    console.log("====================================");
    currentListShuffles = 0;
    document.getElementById("N").innerText = N;
    the_array = Array.from({ length: N }, () => Math.floor(Math.random() * 100) + 1);
    console.log("Original array: ", the_array);
    renderArray(the_array);
    sortingAlgorithms[sortIndex](); // Start the sort process
}

console.log("If ur reading this ur really cool! 🎉");
console.log(`Dev Note: Don't forget you can check the "totalShuffles" variable to see how many shuffles we're at`);
initializeArray();

function renderArray(array, isSorted = false) {
    let container = document.getElementById("sort-body");
    container.innerHTML = "";
    array.forEach((value) => {
        let element = document.createElement("div");
        element.classList.add("sort-item");
        if (isSorted) {
            element.classList.add("alt");
        }
        element.style.height = `${value}%`;
        element.innerHTML = `<span>${value}</span>`
        container.appendChild(element);
    });
}

// https://sortvisualizer.com/shakersort/

// AI-generated code snippet for adapting the cocktailShakerSort function to render intermediate steps

function cocktailShakerSort() {
    let start = 0;
    let end = the_array.length;
    let swapped = true;
    let sortStep = () => {
        totalShuffles += 1;
        currentListShuffles += 1;
        if (!swapped) {
            N += 1;
            renderArray(the_array, true);
            setTimeout(initializeArray, 750);
            return;
        }

        swapped = false;
        // Forward pass
        for (let i = start; i < end - 1; ++i) {
            if (the_array[i] > the_array[i + 1]) {
                [the_array[i], the_array[i + 1]] = [the_array[i + 1], the_array[i]];
                swapped = true;
                renderArray(the_array);
                setTimeout(sortStep, 50); // Adjust delay as needed
                return;
            }
        }
        end--;

        if (!swapped) {
            N += 1;
            renderArray(the_array, true);
            setTimeout(initializeArray, 750);
            return;
        }

        // Backward pass
        for (let i = end - 1; i > start; --i) {
            if (the_array[i - 1] > the_array[i]) {
                [the_array[i], the_array[i - 1]] = [the_array[i - 1], the_array[i]];
                swapped = true;
                renderArray(the_array);
                setTimeout(sortStep, 50); // Adjust delay as needed
                return;
            }
        }
        start++;

        if (swapped) setTimeout(sortStep, 50); // Adjust delay as needed
    };

    sortStep(); // Kick off the sorting process
}


// TypeScript code snippet written by an AI assistant

function formatElapsedTime(timestamp1, timestamp2) {
    let difference = Math.abs(timestamp1 - timestamp2);

    const weeks = Math.floor(difference / (7 * 24 * 60 * 60 * 1000));
    difference -= weeks * (7 * 24 * 60 * 60 * 1000);
    const days = Math.floor(difference / (24 * 60 * 60 * 1000));
    difference -= days * (24 * 60 * 60 * 1000);
    const hours = Math.floor(difference / (60 * 60 * 1000));
    difference -= hours * (60 * 60 * 1000);
    const minutes = Math.floor(difference / (60 * 1000));
    difference -= minutes * (60 * 1000);
    const seconds = (difference / 1000).toFixed(2); // Keep two decimal places

    const parts = [];
    if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (parseFloat(seconds) > 0) parts.push(`${parseFloat(seconds)} second${parseFloat(seconds) === "1.00" ? '' : 's'}`);

    if (parts.length === 0) {
        return '0 seconds';
    }

    return parts.join(', ').replace(/, (?=[^,]*$)/, ' and ');
}
// End of TypeScript code snippet
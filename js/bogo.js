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

    return arr;
}

function bogoSort(arr) {
    let sorted = false;
    while (!sorted) {
        arr = shuffle(arr);
        sorted = isSorted(arr);
    }
    return arr;
}

// This code is an adaptation of the provided script to use requestAnimationFrame by an AI assistant.

let a = []; // Global array to sort
let N = 1; // Starting array size
let animationFrameId; // ID to keep track of the requestAnimationFrame

function shuffleAndCheckSort() {
    shuffle(a);
    if (isSorted(a)) {
        console.log("Sorted array: ", a);
        N += 1;
        document.getElementById("N").innerText = N;
        if (N < 10) {
            renderArray(a, true);
            setTimeout(initializeArray, 1000); // Wait for 1 second before moving to the next array size
        } else {
            console.log("Bogo sort visualization completed.");
            cancelAnimationFrame(animationFrameId); // Stop the animation frame when done
        }
    } else {
        animationFrameId = requestAnimationFrame(shuffleAndCheckSort); // Keep shuffling and checking
    }
}

function initializeArray() {
    a = Array.from({ length: N }, () => Math.floor(Math.random() * 100) + 1);
    console.log("====================================");
    console.log("Original array: ", a);
    shuffleAndCheckSort(); // Start the sort process
}

// Kick off the visualization with the initial array size
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
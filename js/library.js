const books = document.getElementsByClassName('book');

let pageIndex = {};

const toggleBookOpen = (book_id) => {
    const book_contents = document.getElementById(book_id + "-contents");
    if (book_contents.classList.contains('closedBook')) {
        book_contents.classList.remove('closedBook');
        book_contents.classList.add('openBook');
    } else {
        book_contents.classList.remove('openBook');
        book_contents.classList.add('closedBook');
    }

    book_contents.querySelector('.left-half').style.backgroundColor = window.getComputedStyle(document.getElementById(book_id)).backgroundColor
    book_contents.querySelector('.right-half').style.backgroundColor = window.getComputedStyle(document.getElementById(book_id)).backgroundColor
}

const closeBook = (event) => {
    const book_id = event.target.parentNode.parentNode.id;
    const book_contents = document.getElementById(book_id);
    book_contents.classList.remove('openBook');
    book_contents.classList.add('closedBook');
}

const changePage = (event, direction) => {
    const bookContents = event.target.parentNode.parentNode;
    const book_id = bookContents.id.substring(0, bookContents.id.indexOf("-contents"));
    pageIndex[book_id] += direction;
    const page = document.getElementById(book_id + "-p" + pageIndex[book_id]);
    const page2 = document.getElementById(book_id + "-p" + (pageIndex[book_id] + 1));
    if (page && page2) {
        bookContents.querySelector('.left-page').innerHTML = page.innerHTML;
        bookContents.querySelector('.right-page').innerHTML = page2.innerHTML;
    } else if (!page2 && page) {
        bookContents.querySelector('.left-page').innerHTML = page.innerHTML;
        bookContents.querySelector('.right-page').innerHTML = "";
    } else {
        pageIndex[book_id] -= direction;
    }
    if (pageIndex[book_id] == 1) {
        bookContents.querySelector('.prev').style.visibility = "hidden";
    } else {
        bookContents.querySelector('.prev').style.visibility = "visible";
    }

    const pages = document.getElementById(book_id).querySelector('.pages').querySelectorAll('div.page');

    if (pageIndex[book_id] == pages.length - 1 || pageIndex[book_id] == pages.length) {
        bookContents.querySelector('.next').style.visibility = "hidden";
    } else {
        bookContents.querySelector('.next').style.visibility = "visible";
    }

}

let dragged_node = null;

const handleMove = (event) => {
    let bookContents = dragged_node;
    // get mouse cursor change in x position
    const dx = event.movementX;
    // get mouse cursor change in y position
    const dy = event.movementY;
    // set new position

    // get current position
    const left = bookContents.offsetLeft;
    const top = bookContents.offsetTop;

    bookContents.style.left = (left + dx) + "px";
    bookContents.style.top = (top + dy) + "px";
}

const moveBook = (event) => {
    const book = event.target.parentNode;
    if (book.classList.contains('openBook')) {
        dragged_node = book;
        document.addEventListener('mousemove', handleMove);
    }
    document.addEventListener('mouseup', (event) => {
        document.removeEventListener('mousemove', handleMove);
        dragged_node = null;
    });
}

for (let book of books) {
    book.addEventListener('click', (event) => {
        toggleBookOpen(book.id)
    });

    pageIndex[book.id] = 1;

    // The following code will be recreating this HTML structure:
    // <div id="bk-1-contents" class="closedBook">
    //     <div class="left-half">
    //         <div class="prev"></div>
    //         <div class="left-page"></div>
    //     </div>
    //     <div class="right-half">
    //         <div class="close" onclick="closeBook(event)"></div>
    //         <div class="right-page"></div>
    //         <div class="next"></div>
    //     </div>
    // </div>

    const bookContents = document.createElement('div');
    bookContents.classList.add('closedBook');
    bookContents.id = book.id + "-contents";
    const leftHalf = document.createElement('div');
    leftHalf.classList.add('left-half');
    const prevIcon = document.createElement('div');
    prevIcon.classList.add('prev');
    prevIcon.addEventListener('click', (event) => changePage(event, -2));
    prevIcon.style.visibility = "hidden";
    leftHalf.appendChild(prevIcon);
    const leftPage = document.createElement('div');
    leftPage.classList.add('left-page');
    leftHalf.appendChild(leftPage);
    leftPage.innerHTML = book.querySelector('.pages').querySelector("#" + book.id + "-p1").innerHTML;

    const rightHalf = document.createElement('div');
    rightHalf.classList.add('right-half');
    const close = document.createElement('div');
    close.classList.add('close');
    close.addEventListener('click', closeBook);
    rightHalf.appendChild(close);
    const rightPage = document.createElement('div');
    rightPage.classList.add('right-page');
    rightHalf.appendChild(rightPage);
    if (book.querySelector('.pages').querySelector("#" + book.id + "-p2") != null) {

        rightPage.innerHTML = book.querySelector('.pages').querySelector("#" + book.id + "-p2").innerHTML;
    }


    const nextIcon = document.createElement('div');
    nextIcon.classList.add('next');
    if (document.getElementById(book.id).querySelector('.pages').childElementCount <= 2) {
        nextIcon.style.visibility = "hidden";
    }
    nextIcon.addEventListener('click', (event) => changePage(event, 2));
    rightHalf.appendChild(nextIcon);

    bookContents.appendChild(leftHalf);
    bookContents.appendChild(rightHalf);

    bookContents.addEventListener('mousedown', moveBook);

    document.body.appendChild(bookContents);
}

const goHome = (event) => {
    window.location.href = "index.html";
}

document.getElementById('rock').addEventListener('click', (event) => {
    event.target.style.animation = "scoot-up 5s forwards linear";
    setTimeout(() => {

        let popup = document.createElement('div');
        popup.style.position = "fixed";
        popup.style.top = "0";
        popup.style.left = "0";
        popup.style.width = "100%";
        popup.style.height = "100%";
        popup.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        popup.style.zIndex = "2";
        let popupContent = document.createElement('div');
        popupContent.classList.add('popup-content');
        popupContent.innerHTML = document.getElementById('hole-content').innerHTML;
        popup.appendChild(popupContent);
        document.body.appendChild(popup);
        popup.addEventListener('click', () => {
            document.body.removeChild(popup);
        });
        // event.target.style.animation = "";
        

        document.querySelector('body')
    }, 5000);
});
const updateScrollbar = (event) => {
    var container = event.target.parentElement.querySelector(".js-scrollbar-content");
    var scrollbar = event.target.parentElement.querySelector(".js-scrollbar-tracker");
    var scrollPosition = container.scrollTop / (container.scrollHeight - container.clientHeight);
    var scrollbarPosition = scrollPosition * (container.clientHeight - scrollbar.clientHeight);
    scrollbar.style.top = scrollbarPosition + "px";
}


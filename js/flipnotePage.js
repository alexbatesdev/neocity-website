const main = () => {
    console.log('flipnotePage.js');
    const contentDiv = document.getElementById('contentDiv');

    const arrowLeft = document.getElementById('arrow-left');
    const arrowRight = document.getElementById('arrow-right');

    const pages = document.getElementsByClassName('drawing-page');
    const drawings = document.getElementsByClassName('drawing-outer');

    let flipnoteIndex = 1;

    const handleChangePage = (direction) => {
        console.log('handleChangePage', direction);
        const from = flipnoteIndex;
        const to = flipnoteIndex + direction;

        if (to < 1 || to > pages.length) return;

        const easing = 'ease-in-out';

        pages[from - 1].animate([
            { left: '50%' },
            { left: `${direction === 1 ? '-50' : '150'}%` }
        ], {
            duration: 750,
            easing,
            fill: 'forwards'
        });

        pages[to - 1].animate([
            { left: `${direction === 1 ? '150' : '-50'}%` },
            { left: '50%' }
        ], {
            duration: 750,
            easing,
            fill: 'forwards'
        })

        flipnoteIndex = to;

        if (flipnoteIndex === 1) {
            arrowLeft.classList.add('hidden');
        } else {
            arrowLeft.classList.remove('hidden');
        }

        if (flipnoteIndex === pages.length) {
            arrowRight.classList.add('hidden');
        } else {
            arrowRight.classList.remove('hidden');
        }

    }

    const handleDrawingClick = (event) => {
        let target = event.target;
        switch (target.nodeName) {
            case 'IMG':
                target = target.parentNode;
                break;
            case 'DIV':
                break;
            case 'P':
                target = target.parentNode;
                break;
            default:
                return;
        }
        const drawing = target.querySelector('img');
        const bigNote = document.getElementsByClassName('big-note')[0];
        const bigNoteImg = bigNote.querySelector('img');
        bigNoteImg.src = drawing.src;
        const bigNoteClose = document.getElementsByClassName('big-note-close')[0];
        const bigNoteText = bigNote.querySelector('p');
        const drawingTitle = target.querySelector('p');
        bigNoteText.innerHTML = drawingTitle.innerHTML;
        const bigNoteBacksideText = bigNote.querySelector('p.backside');
        const drawingBacksideTitle = target.querySelector('.drawing-backside');
        bigNoteBacksideText.innerHTML = drawingBacksideTitle.innerHTML;

        target.animate([
            {
                bottom: '0',
                zIndex: '1'
            },
            {
                bottom: '-100vh',
                zIndex: '1'
            },
        ], {
            duration: 250,
            fill: 'both',
        });

        setTimeout(() => {

            bigNote.animate([
                {
                    top: '150%',
                    zIndex: '2'
                },
                {
                    top: '50%',
                    zIndex: '2'
                },
            ], {
                duration: 250,
                fill: 'both',
            });
        }, 250);

        const closeBigNote = () => {
            bigNote.animate([
                {
                    top: '50%',
                    zIndex: '2'
                },
                {
                    top: '150%',
                    zIndex: '2'
                },
            ], {
                duration: 250,
                fill: 'both',
            });
            setTimeout(() => {
                target.animate([
                    {
                        bottom: '-100vh',
                        zIndex: '1'
                    },
                    {
                        bottom: '0',
                        zIndex: '1'
                    },
                ], {
                    duration: 250,
                    fill: 'both',
                });
            }, 250);
            bigNoteClose.classList.add('hidden');
            bigNoteClose.removeEventListener('click', closeBigNote);
            if (bigNoteImg.classList.contains('hidden')) {
                bigNote.click();
                bigNote.removeEventListener('click', turnOverNote);
            }
        };
        bigNoteClose.addEventListener('click', closeBigNote);
        bigNoteClose.classList.remove('hidden');

        const turnOverNote = () => {
            bigNote.animate([
                {
                    transform: 'translate(-50%, -50%) rotateY(0deg)'
                },
                {
                    transform: 'translate(-50%, -50%) rotateY(90deg)'
                },
                {
                    transform: 'translate(-50%, -50%) rotateY(0deg)'
                }
            ], {
                duration: 500,
                fill: 'both',
            });

            setTimeout(() => {
                bigNoteImg.classList.add('hidden');
                bigNoteText.classList.add('hidden');
                bigNoteBacksideText.classList.remove('hidden');
            }, 250);

            if (target.classList.contains('change-on-view')) {
                console.log('change-on-view');
                let firstMessage = document.getElementsByClassName('first-message')[0];
                let secondMessage = document.getElementsByClassName('second-message')[0];
                firstMessage.classList.add('hidden');
                secondMessage.classList.remove('hidden');
                setTimeout(() => {
                    bigNoteText.innerHTML = secondMessage.innerHTML;
                }, 250);
            }



            bigNote.removeEventListener('click', turnOverNote);
            bigNote.addEventListener('click', turnBackNote);
        }

        const turnBackNote = () => {
            bigNote.animate([
                {
                    transform: 'translate(-50%, -50%) rotateY(0deg)'
                },
                {
                    transform: 'translate(-50%, -50%) rotateY(90deg)'
                },
                {
                    transform: 'translate(-50%, -50%) rotateY(0deg)'
                }
            ], {
                duration: 500,
                fill: 'both',
            });

            setTimeout(() => {
                bigNoteImg.classList.remove('hidden');
                bigNoteText.classList.remove('hidden');
                bigNoteBacksideText.classList.add('hidden');
            }, 250);


            bigNote.removeEventListener('click', turnBackNote);
            bigNote.addEventListener('click', turnOverNote);
        }

        bigNote.addEventListener('click', turnOverNote);
    }

    for (let i = 0; i < drawings.length; i++) {
        const drawing = drawings[i];
        drawing.addEventListener('click', handleDrawingClick);
    }

    arrowLeft.addEventListener('click', () => handleChangePage(-1));
    arrowRight.addEventListener('click', () => handleChangePage(1));
}

window.onload = main;
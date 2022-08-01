if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '.' }).then((registration) => {
        console.log('Service worker registrated:', registration);
    }).catch((error) => {
        console.log('Service worker registration error', error);
    });
}

const S = Storage.create({
    level: 1,
    balance: 0,
    help: 1
});

window.viewController = new ViewController();
window.viewController.next('main');

q('.buy-lamp').on('click', () => {
    const PRICE = 400;
    if (S.balance >= PRICE) {
        S.balance -= PRICE;
        S.help++;
    }
});

const LEVEL_1 = [
    [0, 0, 'V', 'B', 0],
    [0, 'Y', 0, 'Y', 0],
    [0, 0, 0, 0, 0],
    ['V', 0, 'O', 0, 0],
    ['G', 0, 'B', 'G', 0],
    [0, 0, 0, 0, 0],
    ['O', 0, 0, 0, 0]
];

const LEVEL_2 = [
    ['Y', 0, 'V', 'B', 'B'],
    [0, 0, 0, 0, 0],
    ['Y', 0, 0, 0, 0],
    ['V', 0, 'O', 0, 'G'],
    ['O', 0, 0, 0, 0],
    [0, 0, 0, 0, 'G']
];

const LEVEL_4 = [
    ['-', 'B', 'V', 0, '-'],
    [0, 0, 'V', 0, 'Y'],
    [0, '-', 'O', 0, 0],
    [0, 0, 'G', 0, 0],
    [0, 0, '-', 0, 0],
    [0, 0, '-', 0, 0],
    ['B', 'G', '-', 'O', 'Y'],
];

const LEVEL_3 = [
    ['G', 'G', 'V', 'O', 'O'],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    ['B', 'B', 'V', 'Y', 'Y']
];

const levels = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4];


const colors = {
    V: '#AF5AFE',
    B: '#0095FE',
    Y: '#FFFF00',
    O: '#FE7C01',
    G: '#04FC07'
}


class Path {
    constructor(x, y, level) {
        this.active = true;
        const el = q(`[data-x="${x}"][data-y="${y}"]`)[0];
        this.dataDot = el.getAttribute('data-dot');

        if (!this.dataDot || +el.getAttribute('data-filled') === 2) {
            this.active = false;
            return;
        }

        const color = el.getAttribute('data-color');
        this.color = color;

        el.classList.add('tile_active');
        el.style.setProperty('--color', color);


        this.currentX = x;
        this.currentY = y;
        this.startEl = el;
        el.setAttribute('data-filled', '2');

        this.path = [this.startEl];
    }

    next(x, y, finishClbc) {
        if ((Math.abs(this.currentX - x) + Math.abs(this.currentY - y)) !== 1) {
            return;
        }

        const el = q(`[data-x="${x}"][data-y="${y}"]`)[0];
        const isElFilled = +el.getAttribute('data-filled');
        const dataDot = el.getAttribute('data-dot');

        if (isElFilled === 2) {
            this.revert();
            return;
        }

        if (isElFilled && dataDot !== this.dataDot) {
            this.revert();
            return;
        }

        el.style.setProperty('--color', this.color);
        el.setAttribute('data-filled', '2');

        const prevEl = this.path[this.path.length - 1];

        if (this.currentX > x) {
            prevEl.classList.add('tile_link-left')
        } else if (this.currentX < x) {
            prevEl.classList.add('tile_link-right')
        } else if (this.currentY > y) {
            prevEl.classList.add('tile_link-top')
        } if (this.currentY < y) {
            prevEl.classList.add('tile_link-bot')
        }

        this.path.push(el);
        this.currentX = x;
        this.currentY = y;

        if (dataDot === this.dataDot) {
            this.active = false;
            this.path[0].classList.remove('tile_active');

            this.path.forEach(e => e.classList.add('highlight'));
            finishClbc();
        }
    }

    revert() {
        this.path.splice(0, 1).forEach(el => {
            el.classList.remove('tile_active');
            el.classList.remove('tile_link-left');
            el.classList.remove('tile_link-right');
            el.classList.remove('tile_link-top');
            el.classList.remove('tile_link-bot');
            el.setAttribute('data-filled', '1');
        });

        this.path.forEach(el => {
            el.classList.remove('tile_link-left');
            el.classList.remove('tile_link-right');
            el.classList.remove('tile_link-top');
            el.classList.remove('tile_link-bot');
            el.style.removeProperty('--color');
            el.setAttribute('data-filled', '0');
        });

        this.active = false;
    }
}

class Game {
    constructor() {
        this.reservedMarks = [0, '-'];
        this.path = null;

        this.timeS = 0;
        this.timeM = 0;

        setInterval(() => {
            this.timeS++;
            if (this.timeS > 60) {
                this.timeS = 0;
                this.timeM++;
            };
            q('.timer__value').setHTML(`${this.timeM}:${`${this.timeS}`.padStart(2, '0')}`);
        }, 1000);
    }

    generateLevel(level) {
        this.timeS = 0;
        this.timeM = 0;
        this.dotsCounter = 0;
        const levelEl = createElement('div', { classNames: ['level'] });

        level.forEach((row, y) => {
            const rowEl = createElement('div', { classNames: ['level__row'] });
            levelEl.appendChild(rowEl);

            row.forEach((tile, x) => {
                const tileEl = createElement('div', {
                    classNames: ['level__tile', 'tile'],
                    attrs: { 'data-x': x, 'data-y': y }
                });

                const tileImgEl = createElement('img', { classNames: ['tile__img'], attrs: { src: './img/tile.svg' } });
                tileEl.appendChild(tileImgEl);

                if (tile === '-') {
                    tileEl.setAttribute('data-filled', '2');
                    tileEl.style.opacity = '0';
                }

                if (!this.reservedMarks.includes(tile)) {
                    this.dotsCounter++;
                    const circleEl = createElement('div', { classNames: ['tile__circle'], style: { background: colors[tile] } });
                    tileEl.setAttribute('data-filled', '1');
                    tileEl.setAttribute('data-color', colors[tile]);
                    tileEl.setAttribute('data-dot', tile);
                    tileEl.appendChild(circleEl);
                }

                rowEl.appendChild(tileEl);
            });
        });
        this.addEvents(levelEl);
        return levelEl;
    }

    addEvents(levelEl) {

        levelEl.addEventListener('touchmove', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const pageX = e.touches[0].pageX;
            const pageY = e.touches[0].pageY;
            this.processPosition(pageX, pageY);
        });

        let drag = false;
        levelEl.addEventListener('mousedown', () => {
            drag = true;
        });

        levelEl.addEventListener('mousemove', e => {
            if (!drag) { return; }
            e.stopPropagation();
            e.preventDefault();
            const pageX = e.pageX;
            const pageY = e.pageY;
            this.processPosition(pageX, pageY);
        })

        document.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            e.preventDefault();
            drag = false;
            if (this.path && this.path.active) {
                this.path.revert();
            }
        })

        levelEl.addEventListener('touchend', () => {
            if (this.path && this.path.active) {
                this.path.revert();
            }
        });
    }

    processPosition(x, y) {
        const els = document.elementsFromPoint(x, y);
        const tile = els.find(e => e.classList.contains('tile'));
        if (tile) {
            if (!this.path || !this.path.active) {
                this.lastTile = null;
            }
            if (tile !== this.lastTile) {
                const x = +tile.getAttribute('data-x');
                const y = +tile.getAttribute('data-y');
                if (this.path && this.path.active) {
                    this.path.next(x, y, () => {
                        this.dotsCounter -= 2;
                        console.log(this.dotsCounter);
                        if (this.dotsCounter === 0) {
                            q('.level-complete-overlay')[0].style.display = 'block';
                            S.balance += 360;
                        }
                    })
                } else {
                    this.path = new Path(x, y);
                }
                this.lastTile = tile;
            }
        }
    }
}

const G = new Game();

function genLevel() {
    q('.level-cotent')[0].innerHTML = '';
    let level = levels[S.level - 1];
    if (!level) {
        level = levels[levels.length - 1];
    }
    q('.level-cotent')[0].appendChild(G.generateLevel(level));
}

q('.menu__play').on('click', () => {
    window.viewController.next('level');
    genLevel();
});

q('.to-menu').on('click', () => {
    window.viewController.next('main');
});

(() => {
    let prevGameFieldSize = 0;
    const setLevelWidth = () => {
        requestAnimationFrame(setLevelWidth)

        const height = q('.view_level')[0].clientHeight;
        const gameFieldSize = height - 84 - 64;

        if (prevGameFieldSize !== gameFieldSize) {
            prevGameFieldSize = gameFieldSize;
            q('.level-cotent')[0].style.width = `${gameFieldSize / 7 * 5}px`;
        }
    }
    setLevelWidth();
})();

q('.refresh').on('click', () => genLevel())

q('.level-complete-overlay').on('click', () => {
    q('.level-complete-overlay')[0].style.display = 'none';
    S.level++;
    genLevel();
})
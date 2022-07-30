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

        if (!this.dataDot || el.getAttribute('data-filled') === '2') {
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

    next(x, y) {
        if ((Math.abs(this.currentX - x) + Math.abs(this.currentY - y)) !== 1) {
            return;
        }

        const el = q(`[data-x="${x}"][data-y="${y}"]`)[0];
        const isElFilled = +el.getAttribute('data-filled');
        const dataDot = el.getAttribute('data-dot');

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
    }

    generateLevel(level) {
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

                if (!this.reservedMarks.includes(tile)) {
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
                console.log('to', x, y);
                if (this.path && this.path.active) {
                    this.path.next(x, y)
                } else {
                    this.path = new Path(x, y);
                }
                this.lastTile = tile;
            }
        }
    }
}

const G = new Game();

q('.menu__play').on('click', () => {
    window.viewController.next('level');
    q('.view_level').innerHTML = '';
    q('.view_level')[0].appendChild(G.generateLevel(LEVEL_1));
})
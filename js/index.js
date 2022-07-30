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
class ViewController {
    constructor() {
        this.history = [];
    }

    next(viewName) {
        if (viewName === this.currentViewName) { return; }
        this.currentViewName = viewName;
        const el = document.querySelector(`.view_${viewName}`);

        el.classList.add('view_active');
        el.classList.add('view_active-next');

        const currentView = this.currentView;

        setTimeout(() => {
            el.classList.remove('view_active-next');
        }, 290);

        if (this.currentView) {
            currentView.classList.remove('view_active-next');
            currentView.classList.add('view_inactive-next');

            setTimeout(() => {
                currentView.classList.remove('view_active');
                currentView.classList.remove('view_inactive-next');
            }, 290);
        }

        this.currentView = el;

    }

    prev() {

    }
}

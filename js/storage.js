class Storage {
    /**
     * 
     * @param {*} structure - keys with default values 
     */
    constructor(structure, events) {
        if (!events) {
            events = {};
        }
        this.events = events;
        this.binds = {};
        this.data = {};
        Object.keys(structure).forEach(key => {
            const storageValue = localStorage.getItem(`STORAGE__${key}`);
            if (!storageValue && storageValue !== false) {
                this.set(key, structure[key]);
                return;
            }
            try {
                this.set(key, JSON.parse(storageValue));
            } catch (e) {
                this.set(key, structure[key]);
            }
        });

        this.data = new Proxy(this.data, {
            set: (target, key, value) => {
                localStorage.setItem(`STORAGE__${key}`, JSON.stringify(value));
                target[key] = value;

                if (this.binds[key]) {
                    this.binds[key].forEach(el => el.innerHTML = value);
                }

                if (this.events[key]) {
                    this.events[key](value, this.data);
                }

                return true;
            }
        })

        this.initBinding();
        Object.entries(events).forEach(([key, lstener]) => lstener(this.data[key], this.data));
    }

    static create(structure, events) {
        const storage = new Storage(structure, events);
        return storage.data;
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        localStorage.setItem(`STORAGE__${key}`, JSON.stringify(value));
        this.data[key] = value;
        if (this.binds[key]) {
            this.binds[key].forEach(el => el.innerHTML = value);
        }
        if (this.events[key]) {
            this.events[key](value, this.data);
        }
        return value;
    }

    initBinding() {
        this.binds = {};
        Array.from(document.querySelectorAll('[data-storage]')).forEach(el => {
            const param = el.getAttribute('data-storage');
            if (!this.binds[param]) { this.binds[param] = []; }
            el.innerHTML = this.data[param];
            this.binds[param].push(el);
        });
    }
}
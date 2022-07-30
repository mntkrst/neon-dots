HTMLElement.prototype.activate = function () {
    this.classList.add('active');
    this.active = true;
}

HTMLElement.prototype.deactivate = function () {
    this.classList.remove('active');
    this.active = false;
}

HTMLElement.prototype.toogleActive = function () {
    if (this.active) {
        this.deactivate();
    } else {
        this.activate();
    }
}

NodeList.prototype.forEach = function (fn) {
    Array.from(this).forEach(fn);
}

NodeList.prototype.on = function (event, listener) {
    Array.from(this).forEach(el => el.addEventListener(event, listener.bind(el)));
}

NodeList.prototype.setHTML = function (html) {
    Array.from(this).forEach(el => el.innerHTML = html);
}

NodeList.prototype.activate = function () {
    Array.from(this).forEach(el => el.activate());
}

NodeList.prototype.deactivate = function () {
    Array.from(this).forEach(el => el.deactivate());
}

NodeList.prototype.addClass = function (className) {
    this.forEach(el => el.classList.add(className));
}

NodeList.prototype.removeClass = function (className) {
  this.forEach(el => el.classList.remove(className));
}

function q(selector) {
    return document.querySelectorAll(selector);
}

function calculateBackgroundScale(imageWidth, imageHeight, blockWidth, blockHeight) {
    let gapX = 0;
    let gapY = 0;

    const scaleByWidth = blockWidth / imageWidth;
    const calculatedHeightFromScalingByWidth = imageHeight * scaleByWidth;

    if (calculatedHeightFromScalingByWidth >= blockHeight) {
        gapX = 0;
        gapY = (calculatedHeightFromScalingByWidth - blockHeight) / 2;
        return { width: blockWidth, height: calculatedHeightFromScalingByWidth, gapX, gapY, scaleCoef: scaleByWidth };
    } else {
        const scaleByHeight = blockHeight / imageHeight;
        const calculatedWidthFromScalingByHeight = imageWidth * scaleByHeight;
        gapX = (calculatedWidthFromScalingByHeight - blockWidth) / 2;
        gapY = 0;
        return { width: calculatedWidthFromScalingByHeight, height: blockHeight, gapX, gapY, scaleCoef: scaleByHeight };
    }
}

// Load classes-- requires webserver to run "http-server ."

import { HexMap } from './hexmap.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

var hexMap = null;
const hexSizeDefault = 50;

(function init() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    hexMap = new HexMap(10, 15, hexSizeDefault, canvas);
    redraw();
})()

function redraw() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    hexMap.render(context);
}

document.addEventListener('keydown', event => {
    switch (event.code) {

        case "Escape":
            console.log("Resetting...");
            hexMap.hexSize = hexSizeDefault;
            hexMap.initialize();
            redraw();
            break;

        default:
            break;
    }
});

document.addEventListener('mousedown', event => {
    var target = hexMap.findHexAtClick(event);
    if (target != null) {
        target.setIsSelected(!target.isSelected);
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        hexMap.render(context);
    }
});

document.addEventListener('mousemove', event => {
    // console.log(`${event.offsetX}`)
})

document.addEventListener('wheel', event => {
    event.preventDefault();
    if (event.wheelDelta > 0) {
        hexMap.increaseSize();
    } else {
        hexMap.decreaseSize();
    }

    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    hexMap.render(context);
}, { passive: false });





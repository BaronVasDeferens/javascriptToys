// Load classes-- requires webserver to run "http-server ."

import { HexMap } from './hexmap.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

var hexMap = null;
const hexSizeDefault = 42;

// --- STARTUP / INIT ---
(function init() {
    hexMap = new HexMap(11, 15, hexSizeDefault, canvas);
    redraw();
})()

function redraw() {
    hexMap.render(context);
}

// Prevent right-click from summoning the context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', event => {

    switch (event.code) {

        case "KeyD":
            hexMap.toggleDebug();
            redraw();
            break;

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

    event.preventDefault();

    if (event.buttons == 1) {
        let target = hexMap.findHexAtClick(event);
        if (target != null) {
            target.setIsSelected(!target.isSelected);
            hexMap.getAdjacentHexes(target).forEach( hex => {
                hex.setIsSelected(!hex.isSelected);
            });
            hexMap.render(context);
        }
    }

}, { passive: false });

document.addEventListener('mousemove', event => {
    
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





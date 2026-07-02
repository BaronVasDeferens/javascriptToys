// Load classes-- requires webserver to run "http-server ."

import { HexMap } from './hexmap.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const hexmap = new HexMap(10, 15);


(function init() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hexmap.draw(ctx);
})()

canvas.addEventListener('mousedown', event => {

    var target = hexmap.findHexAtClick(event);
    if (target != null) {
        target.isSelected = !target.isSelected;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        hexmap.draw(ctx);
    }
});

canvas.addEventListener('wheel', event => {

    if (event.wheelDelta > 0) {
        hexmap.increaseSize();
    } else {
        hexmap.decreaseSize();
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hexmap.draw(ctx);
});





// Load classes-- requires webserver to run "http-server ."

import { HexMap } from './hexmap.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const hexmap = new HexMap(7,7);
hexmap.draw(ctx);

canvas.addEventListener('mousedown', event => {
    console.log(event);
    hexmap.findHex(event);
    ctx.clearRect(0,0,canvas.width, canvas.height);
    hexmap.draw(ctx);
});






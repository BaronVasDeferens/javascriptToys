import { TankEntity } from './entity.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const tank = new TankEntity(250,250);
const inputSet = new Set();

window.onkeydown = function(event) {
    inputSet.add(event.key);
    processInput();
}

window.onkeyup = function(event) {
    inputSet.delete(event.key);
    processInput();
}

function processInput() {
    if (inputSet.has("a") && inputSet.has("d")) {
        tank.moveForward();
    } else if (inputSet.has("a")) {
        tank.updateOrientationByDelta(-5);
    } else if (inputSet.has("d")) {
        tank.updateOrientationByDelta(5);
    }
}

var setup = function() {
    drawScene();
}();


function drawScene() {
    context.fillStyle = "#FF0000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(context);
    tank.draw(context);
    requestAnimationFrame(drawScene);
}

function drawGrid(context) {
    context.strokeStyle = "#000000";
    for(var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            context.strokeRect(i * 50, j * 50, 50, 50);
        }
    }
}
import { TankEntity } from './entity.js';

/**
 * TANK
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 */

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const tank = new TankEntity(250,250);
const inputSet = new Set();

window.onkeydown = function(event) {
    inputSet.add(event.key);
}

window.onkeyup = function(event) {
    inputSet.delete(event.key);
}

function processInput() {
    // Movement controls: engage treads
    if (inputSet.has("a") && inputSet.has("d")) {
        tank.moveForward();
    } else if (inputSet.has("a")) {
        tank.updateOrientationByDelta(-1);
    } else if (inputSet.has("d")) {
        tank.updateOrientationByDelta(1);
    }

    // Turret controls
    if(inputSet.has("j")) {
        tank.rotateTurretByDelta(-2); 
    } else if (inputSet.has("l")) {
       tank.rotateTurretByDelta(2);     
    }
}

var setup = function() {
    drawScene();
}();


function drawScene() {
    processInput();
    context.fillStyle = "#29293d";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(context);
    tank.draw(context);
    requestAnimationFrame(drawScene);
}

function drawGrid(context) {
    context.strokeStyle = "#7575a3";
    for(var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            context.strokeRect(i * 50, j * 50, 50, 50);
        }
    }
}
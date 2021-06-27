/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Dot } from './entity.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


/**
 * GAME STATES
 * 
 */
var States = Object.freeze({IDLE: 0, UNIT_SELECTED: 1});
var currentState = States.IDLE;

const entities = [];

var setup = function () {

    // Include any initiatlization code here
    console.log(">>> Starting...");
    beginGame();
}();


window.onmousedown = function(event) {

    switch (currentState) {
        case States.IDLE:

            switch (event.button) {
                // left click
                case 0: 
                    activateAtMouse(event);
                    break;
                case 2:
                    break;
                default:
                    break;
            }
            break;
        case States.UNIT_SELECTED:
        
            break;
        default:
            break;
    }
}

function activateAtMouse(event) {

    var dot = new Dot(event.x, event.y, 50, "#FF0000");
    entities.push(dot);

}


function beginGame() {
    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}



function updateGameState() {

    processPlayerInput();

}

function processPlayerInput() {

}

function drawGrid(context, size) {
    context.strokeStyle = "#000000";
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            context.strokeRect(i * size, j * size, size, size);
        }
    }
}

function drawScene() {
    // Draw background
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, 50);

    entities.forEach( entity => { 
        entity.render(context);
    });

}
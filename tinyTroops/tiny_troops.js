/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Dot, Line } from './entity.js';
import { Soldier } from './entity.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


/**
 * GAME STATES
 * 
 */
var States = Object.freeze({IDLE: "IDLE", UNIT_SELECTED: "UNIT_SELECTED"});
var currentState = States.IDLE;

var selectedUnitPrimary = null;
const entitiesResident = [];    // All "permanent" entities (playhers, enemies)
const entitiesTemporary = [];   // Temporary entities
const entitiesTransient = [];   // These are cleared after ever render

var setup = function () {
    // Include any initiatlization code here
    console.log(">>> Starting...");
    entitiesResident.push(new Soldier(50,50));
    entitiesResident.push(new Soldier(150,50));
    entitiesResident.push(new Soldier(250,50));
    entitiesResident.push(new Soldier(350,50));
    entitiesResident.push(new Soldier(450,50));



    beginGame();
}();



//Prevent the right click from summoning the context menu
document.addEventListener('contextmenu', event => event.preventDefault());


// Process mouse clicks
window.onmousedown = function(event) {

    switch (currentState) {
        case States.IDLE:

            switch (event.button) {
                // left click
                case 0: 
                    activateAtMouse(event);
                    break;
                // Right click
                case 2:
                    currentState = States.IDLE
                    entitiesTemporary.length = 0;
                    break;
                default:
                    break;
            }
            break;
        case States.UNIT_SELECTED:

            switch (event.button) {
                // left click
                case 0: 
                    // Preform an action

                    break;
                // Right click
                case 2:
                    currentState = States.IDLE
                    entitiesTemporary.length = 0;
                    selectedUnitPrimary = null;
                    break;
                default:
                    break;
            }

            break;
        default:
            break;
    }

    console.log("State is now " + currentState);

}

// Process mouse movement
window.onmousemove = function(event) {

    switch (currentState) {
        case States.IDLE:
            break;
        case States.UNIT_SELECTED:
            console.log("!! == " + event);
            let centeredCoords = selectedUnitPrimary.getCenteredCoords();
            entitiesTransient.push(new Line(centeredCoords.x, centeredCoords.y, event.x, event.y, 5, "#FF0000"));
            break;
    }

};

function activateAtMouse(event) {

    entitiesResident.forEach (resident => {
        // LOk for a unit under this click
        let centeredOnClick = resident.isClicked(event);
        if (centeredOnClick) {
            var dot = new Dot(centeredOnClick.x, centeredOnClick.y, 50, "#000000");
            entitiesTemporary.push(dot);
            selectedUnitPrimary = resident;
            currentState = States.UNIT_SELECTED;
        }
    });



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
    context.strokeStyle = "#a8a8a8";
    context.lineWidth = 1;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            context.strokeRect(i * size, j * size, size, size);
        }
    }
}

function drawScene() {
    // Draw background
    context.fillStyle = "#b8bab9";
    context.lineWidth =
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, 50);

    entitiesResident.forEach( entity => {
        entity.render(context);
    });

    entitiesTemporary.forEach( entity => { 
        entity.render(context);
    });

    entitiesTransient.forEach( entity => { 
        entity.render(context);
    });

    entitiesTransient.length = 0;

}
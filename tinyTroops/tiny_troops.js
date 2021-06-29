/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Dot, Line } from './entity.js';
import { Soldier, Blob } from './entity.js';

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

var selectedEntityPrimary = null;       // the currently "selected" entity
var selectedEntitySecondary = null;
                                        // Transient objects are discarded after each render; the following data tracks the last known position of the mouse
var mousePointerHoverDot = null;        // a dot which denotes the selected entity
var mousePointerHoverLine = null;       // a line stretching from the sleected unit to the mouse pointer

const entitiesResident = [];    // All "permanent" entities (playhers, enemies)
const entitiesTemporary = [];   // Temporary entities
const entitiesTransient = [];   // These are cleared after ever render




var setup = function () {
    console.log(">>> Starting...");


    entitiesResident.push(new Soldier(50,50));
    entitiesResident.push(new Soldier(50,150));
    entitiesResident.push(new Soldier(50,250));
    entitiesResident.push(new Soldier(50,350));
    entitiesResident.push(new Soldier(50,450));

    entitiesResident.push(new Blob(450,50));
    entitiesResident.push(new Blob(450,150));
    entitiesResident.push(new Blob(450,250));
    entitiesResident.push(new Blob(450,350));
    entitiesResident.push(new Blob(450,450));

    
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
                    selectEntityAtMouse(event);
                    break;
                // Right click
                case 2:
                    setStateIdle();
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
                    // TODO: check eligibillity
                    moveEntity(selectedEntityPrimary, event);
                    break;
                // Right click
                case 2:
                    setStateIdle();
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

            if (selectedEntityPrimary != null) {
                // draw a line from the primary selected unit
                let centeredCoords = selectedEntityPrimary.getCenteredCoords();
                mousePointerHoverLine = new Line(centeredCoords.x, centeredCoords.y, event.x, event.y, 2, "#000000");
                

                // sub-entity under click?
                let subEnt = secondaryEntityUnderMouse(event);
                selectedEntitySecondary = subEnt;
                
                if (selectedEntitySecondary == null) {
                    mousePointerHoverDot = new Dot(event.x, event.y, 50, "#000000");
                } else {
                    mousePointerHoverDot = new Dot(event.x, event.y, 50, "#FF0000");
                }
            }

            break;
    }

};


window.onmouseover = function (event) {
    // when leaving the game window: handly later?
};


function selectEntityAtMouse(event) {

    entitiesResident.forEach (resident => {
        // Look for a unit under this click:
        let centeredOnClick = resident.isClicked(event);
        // A unit is found: set the primary selected unit; draw a temporary reticle over it; update the state 
        if (centeredOnClick) {
            var dot = new Dot(centeredOnClick.x, centeredOnClick.y, 50, "#000000");
            entitiesTemporary.push(dot);
            selectedEntityPrimary = resident;
            currentState = States.UNIT_SELECTED;
        }
    });
}

function secondaryEntityUnderMouse(event) {

    let target = null;

    entitiesResident.forEach( entity => {
        if (entity instanceof Blob) {
            let entityCoords = entity.isClicked(event)
            if (entityCoords != null) {
                target = entity;
            }
        }
    });

    return target;

}


function moveEntity(entity, event) {
    entity.x = event.x;
    entity.y = event.y;
    setStateIdle();
}

function setStateIdle() {
    currentState = States.IDLE
    entitiesTemporary.length = 0;
    selectedEntityPrimary = null;
    mousePointerHoverDot = null;
    mousePointerHoverLine = null;
}

function beginGame() {
    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}



function updateGameState() {

    processPlayerInput();

    // Add transients for the last known mouse positions
    if (mousePointerHoverLine != null) {
        entitiesTransient.push(mousePointerHoverLine);
    }
    
    if (mousePointerHoverDot != null) {
        entitiesTransient.push(mousePointerHoverDot);
    }



}

function processPlayerInput() {

}

function drawGrid(context, size) {
    context.strokeStyle = "#a8a8a8";
    context.lineWidth = 0.15;
    for (var i = 0; i < (canvas.width / size); i++) {
        for (var j = 0; j < (canvas.height / size); j++) {
            context.strokeRect(i * size, j * size, size, size);
        }
    }
}

function drawScene() {
    // Draw background
    context.fillStyle = "#b8bab9";
    context.lineWidth =
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, 25);

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
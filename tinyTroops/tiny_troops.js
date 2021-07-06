/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Dot, Line, TextLabel } from './entity.js';
import { Soldier, Blob } from './entity.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


/**
 * GAME STATES
 * 
 */
var States = Object.freeze({
    IDLE: "IDLE",
    UNIT_SELECTED: "UNIT_SELECTED",
    ENEMY_TURN: "ENEMY_TURN"
});

var currentState = States.IDLE;

var selectedEntityPrimary = null;       // the currently "selected" entity
var selectedEntitySecondary = null;
// Transient objects are discarded after each render; the following data tracks the last known position of the mouse
var mousePointerHoverDot = null;        // a dot which denotes the selected entity
var mousePointerHoverLine = null;       // a line stretching from the sleected unit to the mouse pointer

var mousePointerHoverLineDistance = 0;

const entitiesResident = [];    // All "permanent" entities (playhers, enemies)
const entitiesTemporary = [];   // Temporary entities
const entitiesTransient = [];   // These are cleared after ever render

let actionPointsMax = 5;
var actionPointAvailable = 0;



var setup = function () {
    console.log(">>> Starting...");

    entitiesResident.push(new Soldier("alpha", 50, 50));
    entitiesResident.push(new Soldier("bravo", 50, 150));
    entitiesResident.push(new Soldier("charlie", 50, 250));
    entitiesResident.push(new Soldier("delta", 50, 350));
    entitiesResident.push(new Soldier("echo", 50, 450));

    entitiesResident.push(new Blob("one", 450, 50));
    entitiesResident.push(new Blob("two", 450, 150));
    entitiesResident.push(new Blob("three", 450, 250));
    entitiesResident.push(new Blob("four", 450, 350));
    entitiesResident.push(new Blob("five", 450, 450));

    beginGame();
}();



//Prevent the right click from summoning the context menu
document.addEventListener('contextmenu', event => event.preventDefault());


// Process mouse clicks
window.onmousedown = function (event) {

    switch (currentState) {
        case States.IDLE:

            switch (event.button) {
                // left click
                case 0:
                    selectPlayerEntityAtMouse(event);
                    break;
                // Right click
                case 2:
                    setState(States.IDLE);
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

                    if (selectedEntitySecondary == null) {
                        moveEntity(selectedEntityPrimary, event);
                    } else {
                        attackEntity(selectedEntityPrimary, selectedEntitySecondary);
                    }

                    startEnemyTurn();
                    setState(States.IDLE);
                    break;
                // Right click
                case 2:
                    setState(States.IDLE);
                    break;
                default:
                    break;
            }

            break;
        default:
            break;
    }

}

// Process mouse movement
window.onmousemove = function (event) {

    switch (currentState) {
        case States.IDLE:
            break;
        case States.UNIT_SELECTED:

            if (selectedEntityPrimary != null) {
                // draw a line from the primary selected unit
                let centeredCoords = selectedEntityPrimary.getCenteredCoords();
                mousePointerHoverLine = new Line(centeredCoords.x, centeredCoords.y, event.x, event.y, 2, "#000000");

                // sub-entity under mouse?
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

function selectPlayerEntityAtMouse(event) {

    entitiesResident.forEach(resident => {

        // Look for a unit under this click:
        let centeredOnClick = resident.isClicked(event);
        // A unit is found: set the primary selected unit; draw a temporary reticle over it; update the state
        if (centeredOnClick && resident instanceof Soldier) {
            var dot = new Dot(centeredOnClick.x, centeredOnClick.y, 50, "#000000");
            entitiesTemporary.push(dot);
            selectedEntityPrimary = resident;
            currentState = States.UNIT_SELECTED;
        }

    });
}

function secondaryEntityUnderMouse(event) {

    let target = null;

    entitiesResident.forEach(entity => {
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
}

function attackEntity(aggressor, target) {
    console.log(aggressor.id + " attacks " + target.id);

    // If something non-deterministic happens here, you have done something very bad
    target.alive = false;
}

/** 
 * 
 * START ENEMY TURN 
 * 
*/
function startEnemyTurn() {

    setState(States.ENEMY_TURN);

    let blobs = entitiesResident.filter(ent => {
        if (ent instanceof Blob) {
            return ent.alive;
        } else {
            return false;
        }
    });

    let soldiers = entitiesResident.filter(ent => {
        if (ent instanceof Soldier) {
            return ent.alive;
        } else {
            return false;
        }
    });

    let activeBlob = blobs[Math.floor(Math.random() * blobs.length)];

    // Does the monster have a target?
    if (activeBlob.target == null || activeBlob.target.alive == false) {
        activeBlob.setTarget(soldiers[Math.floor(Math.random() * soldiers.length)]);
    }

    // Move toward target
    let deltaX = activeBlob.x - activeBlob.target.x;
    let deltaY = activeBlob.y - activeBlob.target.y;
    let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    // console.log("distance: " + distance);
    // console.log({deltaX, deltaY});

    if (distance <= 100) {
        // Target in in striking distance!
        console.log("Blob in range of target-- STRIKE!!")
        activeBlob.updatePositionByDelta(-deltaX, -deltaY);
        // kill target
    } else {
        // move as far as possible toward target
        let x = (100 * deltaX) / distance;
        let y = (100 * deltaY) / distance;
        // console.log({x,y});
        activeBlob.updatePositionByDelta(-x, -y);

    }


}

function sleep(sleepDuration) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + sleepDuration) { /* do nothing */ }
}


function setState(state) {

    switch (state) {

        case States.ENEMY_TURN:
            break;

        case States.IDLE:
            currentState = States.IDLE
            entitiesTemporary.length = 0;
            selectedEntityPrimary = null;
            mousePointerHoverDot = null;
            mousePointerHoverLine = null;
            break;
        default:
            break;
    }

    currentState = state;
    console.log("State is now " + currentState);
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
        var mousePointerHoverLineDistance = mousePointerHoverLine.getLength();
        entitiesTransient.push(new TextLabel(
            mousePointerHoverLine.endX,
            mousePointerHoverLine.endY + 75,
            mousePointerHoverLineDistance, "#FF0000"));
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

    entitiesResident.forEach(entity => {
        entity.render(context);
    });

    entitiesTemporary.forEach(entity => {
        entity.render(context);
    });

    entitiesTransient.forEach(entity => {
        entity.render(context);
    });

    entitiesTransient.length = 0;

}

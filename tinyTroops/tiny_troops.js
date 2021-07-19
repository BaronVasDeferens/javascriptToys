/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Dot, Line, TextLabel } from './entity.js';
import { Soldier, Blob, Helpless } from './entity.js';

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



const entitiesResident = [];    // All "permanent" entities (playhers, enemies)
const entitiesTemporary = [];   // Temporary entities
const entitiesTransient = [];   // These are cleared after ever render

let actionPointsMax = 7;
var actionPointsAvailable = actionPointsMax;
var actionPointsCostPotential = 0;
var actionPointCostAdjustment = 0;

function actionPointCostTotal() {
    return actionPointsCostPotential + actionPointCostAdjustment;
};

function randomValueInRange(min, max) {
    return Math.random() * max + min;
};

var setup = function () {
    console.log(">>> Starting...");



    entitiesResident.push(new Soldier("soldier_alpha", randomValueInRange(50, 150), randomValueInRange(50, 50)));
    // entitiesResident.push(new Soldier("soldier_bravo", randomValueInRange(50, 150), randomValueInRange(150, 50)));
    // entitiesResident.push(new Soldier("soldier_charlie", randomValueInRange(50, 150), randomValueInRange(250, 50)));
    // entitiesResident.push(new Soldier("soldier_delta", randomValueInRange(50, 150), randomValueInRange(350, 50)));
    // entitiesResident.push(new Soldier("soldier_echo", randomValueInRange(50, 150), randomValueInRange(450, 50)));

    entitiesResident.push(new Blob("blob_one", randomValueInRange(450, 150), randomValueInRange(50, 50)));
    entitiesResident.push(new Blob("blob_two", randomValueInRange(450, 150), randomValueInRange(150, 50)));
    entitiesResident.push(new Blob("blob_three", randomValueInRange(450, 150), randomValueInRange(250, 50)));
    entitiesResident.push(new Blob("blob_four", randomValueInRange(450, 150), randomValueInRange(350, 50)));
    entitiesResident.push(new Blob("blob_five", randomValueInRange(450, 150), randomValueInRange(450, 50)));

    entitiesResident.push(new Helpless("soldier_alpha", randomValueInRange(50, 150), randomValueInRange(250, 250)));



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

                        if (actionPointsAvailable - actionPointCostTotal() >= 0) {
                            moveEntity(selectedEntityPrimary, event);
                            actionPointsAvailable -= actionPointCostTotal();
                        }
                        setState(States.IDLE);
                    } else {

                        if (actionPointsAvailable - actionPointCostTotal() >= 0) {
                            attackEntity(selectedEntityPrimary, selectedEntitySecondary);
                            actionPointsAvailable -= actionPointCostTotal();
                        }
                        setState(States.IDLE);
                    }

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

    // Check for remaining action points...

    // No more avaialbe actions? Enemy turn...
    if (actionPointsAvailable == 0) {
        startEnemyTurn();
        actionPointsAvailable = actionPointsMax;
        setState(States.IDLE);
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

// Process mousewheel events: increase point spend on up, decrease on down (when targetting)
window.onmousewheel = function (event) {

    if (actionPointsCostPotential > 0 && selectedEntitySecondary != null) {
        // Mouse wheel rolls top-to-bottom
        if (event.deltaY == 100 && actionPointCostAdjustment > 0) {
            actionPointCostAdjustment--;
        } else if (event.deltaY == -100 && (actionPointCostAdjustment + actionPointsCostPotential < actionPointsAvailable)) {
            // mouse wheel rolls bottom-to-top
            actionPointCostAdjustment++;
        }
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

function computeAttackStats() {

    let hit = "AUTO";
    let min = 0;
    let max = 3;


    switch (actionPointsCostPotential) {
        case 1:
            hit = 100;
            break;
        case 2:
            hit = 85;
            break;
        case 3:
            hit = 60;
            break;
        case 4:
            hit = 40;
            break;
        case 5:
            hit = 20;
            break;
        case 6:
            hit = 10;
            break;
        case 7:
        default:
            hit = 0;
            break;
    }

    hit = hit + (actionPointCostAdjustment * 10);
    min = min + actionPointCostAdjustment;
    max = max + actionPointCostAdjustment;

    return {
        hitChance: hit,
        minDamage: min,
        maxDamage: max
    };

}

function attackEntity(aggressor, target) {
    console.log(aggressor.id + " attacks " + target.id);

    let attackStats = computeAttackStats();

    if (Math.floor(Math.random() * 100) <= attackStats.hitChance) {
        console.log("attack success!");
        target.alive = false;
    } else {
        console.log("attack fail");
    }

    // do some rolling here


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


    blobs.forEach(activeBlob => {
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
    });

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

            actionPointCostAdjustment = 0;
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

    // Add transients for the last known mouse positions
    if (mousePointerHoverLine != null) {
        entitiesTransient.push(mousePointerHoverLine);
        var mousePointerHoverLineDistance = mousePointerHoverLine.getLength();
        actionPointsCostPotential = mousePointerHoverLineDistance;
        entitiesTransient.push(new TextLabel(
            mousePointerHoverLine.endX,
            mousePointerHoverLine.endY + 75,
            actionPointCostTotal(),
            "#FF0000"));

        // Display hit chnace and damage potential stats
        if (selectedEntitySecondary != null) {

            let attackStats = computeAttackStats();

            entitiesTransient.push(
                new TextLabel(
                    mousePointerHoverLine.endX - 25,
                    mousePointerHoverLine.endY + 100,
                    "HIT: " + attackStats.hitChance,
                    "#FF0000"));

            entitiesTransient.push(
                new TextLabel(
                    mousePointerHoverLine.endX - 25,
                    mousePointerHoverLine.endY + 125,
                    "DMG: " + attackStats.minDamage + "-" + attackStats.maxDamage,
                    "#FF0000"));
        }

    }

    // The distance will represent the point cost of moving or shooting
    entitiesTransient.push(new TextLabel(
        10, 600, "AP: " + actionPointsAvailable, "#000000"
    ));

    if (mousePointerHoverDot != null) {
        entitiesTransient.push(mousePointerHoverDot);
    }



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
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, 25);


    // context.lineWidth = 1;
    // context.fillStyle = "#000000";

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

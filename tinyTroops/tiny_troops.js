/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Dot, Line, TextLabel } from './entity.js';
import { GridSquare, Soldier, Blob, Helpless } from './entity.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


/**
 * GAME STATES
 */
var States = Object.freeze({
    IDLE: "IDLE",
    UNIT_SELECTED: "UNIT_SELECTED",
    ENEMY_TURN: "ENEMY_TURN"
});

var currentState = States.IDLE;

var selectedEntityPrimary = null;       // the currently "selected" entity
var selectedEntitySecondary = null;

var mousePointerHoverDot = null;        // a dot which denotes the selected entity
var mousePointerHoverLine = null;       // a line stretching from the sleected unit to the mouse pointer

const gridSize = 10;
const gridSquares = new Array(0);
var allSquares = [];
const gridSquareSize = 75;
var selectedGridSquares = [];


const entitiesResident = [];    // All "permanent" entities (players, enemies)
const entitiesTemporary = [];   // Temporary entities; cleared after the phase changes
const entitiesTransient = [];   // These are cleared after every render

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

    for (var i = 0; i < gridSize; i++) {
        gridSquares[i] = new Array(0);
        for (var j = 0; j < gridSize; j++) {
            gridSquares[i].push(new GridSquare(i, j, gridSquareSize));
        }
    }

    let randomGridSquare = gridSquares[Math.floor(Math.random() * gridSize)][Math.floor(Math.random() * gridSize)]
    let gridCenter = randomGridSquare.getCenter();


    entitiesResident.push(new Soldier("soldier_alpha", gridCenter.x, gridCenter.y));
    // entitiesResident.push(new Soldier("soldier_bravo", randomValueInRange(50, 150), randomValueInRange(150, 50)));
    // entitiesResident.push(new Soldier("soldier_charlie", randomValueInRange(50, 150), randomValueInRange(250, 50)));
    // entitiesResident.push(new Soldier("soldier_delta", randomValueInRange(50, 150), randomValueInRange(350, 50)));
    // entitiesResident.push(new Soldier("soldier_echo", randomValueInRange(50, 150), randomValueInRange(450, 50)));


    allSquares = gridSquares.flat(arr => {
        arr.flat();
    }).flat();

    for (var n = 0; n < 5; n++) {
        shuffleArray(allSquares);
        let home = allSquares.filter(sq => sq.isOccupied == false )[0];
        console.log(home);
        let center = home.getCenter();
        let ent = new Blob("blob_one", center.x, center.y);
        ent.setGridSquare(home);
        entitiesResident.push(ent);
    }


    // entitiesResident.push(new Blob("blob_one", randomValueInRange(450, 150), randomValueInRange(50, 50)));
    // entitiesResident.push(new Blob("blob_two", randomValueInRange(450, 150), randomValueInRange(150, 50)));
    // entitiesResident.push(new Blob("blob_three", randomValueInRange(450, 150), randomValueInRange(250, 50)));
    // entitiesResident.push(new Blob("blob_four", randomValueInRange(450, 150), randomValueInRange(350, 50)));
    // entitiesResident.push(new Blob("blob_five", randomValueInRange(450, 150), randomValueInRange(450, 50)));

    beginGame();
}();



// Prevent the right click from summoning the context menu. Considered "bad form" but LOL whatever
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
                // Left click
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
                // Right click: dismiss
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

    // Check for remaining action points. When there are no more, it's the enemy's turn...
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

            // Comput the selection path (selectedGridSquares)
            let selected = findGridSquareAtMouse(event);
            if (selected != null) {

                // Determine if the gridSquare under the mouse is already in the set BUT is NOT the last item
                let index = selectedGridSquares.indexOf(selected);
                if (index == -1) {
                    selectedGridSquares.push(selected);
                } else {
                    // Otherwise, truncate the selection queue back to the current mouse position
                    if (index != selectedGridSquares.length - 1) {
                        selectedGridSquares = selectedGridSquares.slice(0, index);
                    }
                }
            }

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

// Process mousewheel events: increase actionPointAdjustment on up, decrease on down (when targetting)
window.onmousewheel = function (event) {

    if (actionPointsCostPotential > 0 && selectedEntitySecondary != null) {
        // Mouse wheel rolls top-to-bottom (down)
        if (event.deltaY == 100 && actionPointCostAdjustment > 0) {
            actionPointCostAdjustment--;
        } else if (event.deltaY == -100 && (actionPointCostAdjustment + actionPointsCostPotential < actionPointsAvailable)) {
            // mouse wheel rolls bottom-to-top (up)
            actionPointCostAdjustment++;
        }
    }
};

window.onmouseover = function (event) {
    // when leaving the game window. Maybe handy later?
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function findGridSquareAtMouse(event) {

    // Think of it like this...
    // The layout of the first Array is horizontal (like normal)
    // Then the sub-arrays start in the home element but extend downward, like columns.
    // So, counter-intuitively...
    // columns: x
    // rows : y

    let column = Math.floor(event.x / gridSquareSize);
    let row = Math.floor(event.y / gridSquareSize);

    if (row > gridSize || column > gridSize) {
        return;
    }

    let target = gridSquares[column].find(sq => sq.y === row);
    return target;
}

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

    let targetSquare = findGridSquareAtMouse(event);
    let center = targetSquare.getCenter();

    entity.x = center.x;
    entity.y = center.y;
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

    // do some rolling here for wounds, effects, etc


}

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

        if (distance <= 100) {
            // Target in in striking distance!
            console.log("Blob in range of target-- STRIKE!!")
            activeBlob.updatePositionByDelta(-deltaX, -deltaY);
            // kill target
        } else {
            // move as far as possible toward target
            let x = (100 * deltaX) / distance;
            let y = (100 * deltaY) / distance;
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

            selectedGridSquares.length = 0;

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

        // Display hit chance and damage potential stats
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

    // Highlight the selected path (selectedGridSquares)
    selectedGridSquares.forEach(square => {
        entitiesTransient.push(new GridSquare(square.x, square.y, square.size, "#FF0000"));
    });

    // Display available AP
    entitiesTransient.push(new TextLabel(
        10, 600, "AP: " + actionPointsAvailable, "#000000"
    ));

    if (mousePointerHoverDot != null) {
        entitiesTransient.push(mousePointerHoverDot);
    }
}

// Display the underlying grid.
// BIG GRIDS make the game SLOW! 
// TODO: Render once and re-use
function drawGrid(context) {
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            gridSquares[i].forEach(square => {
                square.render(context);
            });
        }
    }
}

function drawScene() {
    // Draw background
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context);

    // Draw entities
    // TODO: consider adding layer ordering
    entitiesResident.forEach(entity => {
        entity.render(context);
    });

    entitiesTemporary.forEach(entity => {
        entity.render(context);
    });

    entitiesTransient.forEach(entity => {
        entity.render(context);
    });

    // Clear the transients
    entitiesTransient.length = 0;
}

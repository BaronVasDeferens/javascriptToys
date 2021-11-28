/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Blob, Ring, GridSquare, IntroAnimation, Line, MovementAnimationDriver, Soldier, TextLabel, Dot, LittleDot, CustomDriver, CombatActionDriver, CombatResolutionDriver, CombatResolutionState } from './entity.js';


const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;


/**
 * GAME STATES
 */
var States = Object.freeze({
    INTRO: "INTRO",
    IDLE: "IDLE",
    UNIT_SELECTED: "UNIT_SELECTED",
    ENEMY_TURN: "ENEMY_TURN",
    ANIMATION: "ANIMATION"
});

var currentState = States.INTRO;
const introAudio = new Audio("resources/intro.wav");

// Map data
const gridSize = 9;
const gridSquares = new Array(0);
var allSquares = [];
const gridSquareSize = 75;
var selectedGridSquares = [];

var selectedEntityPrimary = null;       // the currently "selected" entity
var selectedEntitySecondary = null;     // if selectedPrimary != null, this is the entity (if any) under the mouse

var mousePointerHoverDot = null;        // a ring which denotes the selected entity
var mousePointerHoverLine = null;       // a line stretching from the selected unit to the mouse pointer

var lineOfSightDots = new Set();


const entitiesResident = [];    // All "permanent" entities (players, enemies)
const entitiesTemporary = [];   // Temporary entities; cleared after the phase changes
const entitiesTransient = [];   // Cleared after every render


/**
 * Movement Animation Drivers
 * An ordered queue of classes which incrementally adjust entity positions on screen
 */
var movementAnimationDrivers = new Array();

// Action point tracking
const actionPointsMax = 7;
var actionPointsAvailable = actionPointsMax;
var actionPointsCostPotential = 0;
var actionPointCostAdjustment = 0;



var totalFrames = 0;
var totalMilliSeconds = 0;



function actionPointCostTotal() {
    return actionPointsCostPotential + actionPointCostAdjustment;
};

function randomValueInRange(min, max) {
    return Math.random() * max + min;
};



/**
 * SETUP
 */

var setup = function () {
    console.log(">>> Starting...");

    // Set intro mode, animation, music
    setState(States.INTRO);
    let introAnim = new IntroAnimation(90, 180);
    entitiesTemporary.push(introAnim);


    // Setup grid squares
    for (var i = 0; i < gridSize; i++) {
        gridSquares[i] = new Array(0);
        for (var j = 0; j < gridSize; j++) {
            gridSquares[i].push(new GridSquare(i, j, gridSquareSize));
        }
    }

    allSquares = gridSquares.flat(arr => {
        arr.flat();
    }).flat();



    for (var xyz = 0; xyz < 12; xyz++) {
        shuffleArray(allSquares);
        allSquares[0].isObstructed = true;
    }


    // Create some soldiers
    for (var n = 0; n < 3; n++) {
        shuffleArray(allSquares);
        let home = allSquares.filter(sq => sq.isOccupied == false && sq.isObstructed == false).pop();
        let center = home.getCenter();
        let ent = new Soldier("soldier_" + n, center.x, center.y);
        ent.setGridSquare(home);
        entitiesResident.push(ent);
    }

    // Create some blobs
    for (var n = 0; n < 7; n++) {
        shuffleArray(allSquares);
        let home = allSquares.filter(sq => sq.isOccupied == false && sq.isObstructed == false).pop();
        let center = home.getCenter();
        let ent = new Blob("blob_" + n, center.x, center.y);
        ent.setGridSquare(home);
        entitiesResident.push(ent);
    }

    beginGame();
}();



// Prevent the right click from summoning the context menu. Considered "bad form" but LOL whatever
document.addEventListener('contextmenu', event => event.preventDefault());

// Process mouse clicks
window.onmousedown = function (event) {

    switch (currentState) {
        case States.INTRO:
            setState(States.IDLE);
            break;

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
                        } else {
                            console.log("too few AP to move", actionPointsAvailable, actionPointsCostPotential);
                        }
                        setState(States.IDLE);
                    } else {

                        if (actionPointsAvailable - actionPointCostTotal() >= 0) {
                            attackEntity(selectedEntityPrimary, selectedEntitySecondary);
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
}

// Process mouse movement
window.onmousemove = function (event) {

    switch (currentState) {
        case States.INTRO:
            //introAudio.play();
            break;
        case States.IDLE:
            introAudio.pause();
            break;
        case States.UNIT_SELECTED:
            // Compute the selection path (selectedGridSquares)
            let selected = findGridSquareAtMouse(event);
            if (selected != null) {

                //Is the gridSquare under the mouse is already in the set
                let indexOfSelected = selectedGridSquares.indexOf(selected);
                if (indexOfSelected == -1) {

                    // Determine if the new square is adjacent to the most recent in the queue (unless the queue is empty)
                    let adj = selectedGridSquares[selectedGridSquares.length - 1];
                    let isAdjacentToPrior = selectedGridSquares.length == 0 || (Math.abs(selected.x - adj.x) + Math.abs(selected.y - adj.y) <= 1);

                    if (selected.isObstructed == false && isAdjacentToPrior && selected.isOccupied == false) {
                        // Finally, check if there are sufficient AP remaining
                        if (selectedGridSquares.length <= actionPointsAvailable) {
                            selectedGridSquares.push(selected);
                        }
                    }
                } else {

                    // Do not remove the gridSquare of the selected unit form the movement queue
                    if (indexOfSelected == 0) {
                        selectedGridSquares = selectedGridSquares.slice(0, 1);
                    } else if (indexOfSelected != selectedGridSquares.length - 1) {
                        // Otherwise, truncate the selection queue back to the current mouse position
                        selectedGridSquares = selectedGridSquares.slice(0, indexOfSelected);
                    }
                }
            }

            if (selectedEntityPrimary != null) {
                // draw a line from the primary selected unit
                let centeredCoords = selectedEntityPrimary.getCenteredCoords();

                // sub-entity under mouse?
                let subEnt = secondaryEntityUnderMouse(event);
                selectedEntitySecondary = subEnt;


                if (selectedEntitySecondary == null) {
                    mousePointerHoverDot = new Ring(event.x, event.y, 50, "#000000");
                    mousePointerHoverLine = null;
                    lineOfSightDots.clear();
                } else {
                    let centerTarget = selectedEntitySecondary.gridSquare.getCenter();
                    mousePointerHoverDot = new Ring(centerTarget.x, centerTarget.y, 50, "#FF0000");
                    // TODO: make mousePointerHoverLine origin at circumference of hoverdot
                    mousePointerHoverLine = new Line(centeredCoords.x, centeredCoords.y, centerTarget.x, centerTarget.y, 2, "#FF0000");

                    // Draw LOS obstruction dots...
                    calculateLineOfSight(selectedEntityPrimary.gridSquare, selectedEntitySecondary.gridSquare).forEach(square => {
                        if ((square.isOccupied || square.isObstructed)) {
                            lineOfSightDots.add(new Dot(square, "#FFFF00", true));
                        } else {
                            lineOfSightDots.add(new Dot(square, "#FFFF00", false));
                        }
                    });
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

            if (resident.isAlive == true) {

                var dot = new Ring(centeredOnClick.x, centeredOnClick.y, 50, "#000000");
                entitiesTemporary.push(dot);
                selectedEntityPrimary = resident;

                console.log(`selected ${selectedEntityPrimary.id}`);

                // Add the selected unit's gridsquare to selectedGridSquares...MEANING when a unit is selected, the movement queue is NEVER empty
                // This is convenient for calculating which squares are eligible to highlight during moevement
                selectedGridSquares.push(findGridSquareAtMouse(event));

                // Update game state
                currentState = States.UNIT_SELECTED;
            }
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

function moveEntity(entity, event) {

    let drivers = [];

    drivers.push(new CustomDriver(() => {
        setState(States.ANIMATION);
    }));


    let destinationSquare = selectedGridSquares[selectedGridSquares.length - 1]; // last item in the list
    entity.setGridSquare(destinationSquare);

    if (entity instanceof Soldier) {
        // Add movement drivers
        selectedGridSquares.forEach((sqr, index) => {
            if (index + 1 < selectedGridSquares.length) {
                drivers.push(new MovementAnimationDriver(entity, sqr, selectedGridSquares[index + 1]));
            }
        });

        actionPointsAvailable -= (selectedGridSquares.length - 1);
    }

    drivers.push(new CustomDriver(() => {
        setState(States.IDLE);
    }));

    movementAnimationDrivers = movementAnimationDrivers.concat(drivers);
}

function attackEntity(aggressor, target) {

    console.log(aggressor.id + " attacks " + target.id);

    let kill = {
        attacker: aggressor,
        defender: target,
        result: CombatResolutionState.KILL
    };

    let noEffect = {
        attacker: aggressor,
        defender: target,
        result: CombatResolutionState.NO_EFFECT
    };


    let attackStats = computeAttackStats();

    let drivers = [];

    drivers.push(new CustomDriver(function () {
        setState(States.ANIMATION);
    }));

    if (Math.floor(Math.random() * 100) <= attackStats.hitChance) {
        drivers.push(new CombatResolutionDriver(kill, () => {
            console.log("attack success!");
            killEntity(target);
        }));
    } else {
        drivers.push(new CombatResolutionDriver(noEffect, () => {
            console.log("attack fail");
            setState(States.IDLE);
        }));
    }
    
    drivers.push(new CustomDriver(function () {
        setState(States.IDLE);
    }));

    movementAnimationDrivers = movementAnimationDrivers.concat(drivers);

    // do some rolling here for wounds, effects, etc
}

function killEntity(condemned) {

    // if (!(condemned instanceof Entity)) {
    //     return;
    // }

    // if (!condemned.isAlive) {
    //     return;
    // }

    condemned.isAlive = false
    condemned.gridSquare.isOccupied = false;
    condemned.gridSquare = null;
}


/**
 * START ENEMY TURN
 */
function startEnemyTurn() {

    let drivers = [];

    drivers.push(new CustomDriver(function () {
        setState(States.ENEMY_TURN);
    }));


    let blobs = entitiesResident.filter(ent => {
        if (ent instanceof Blob) {
            return ent.isAlive == true;
        } else {
            return false;
        }
    });



    // Randomize the blobs' turn order
    shuffleArray(blobs);

    blobs.forEach(activeBlob => {

        let soldiers = entitiesResident.filter(ent => {
            if (ent instanceof Soldier) {
                return ent.isAlive == true;
            } else {
                return false;
            }
        });

        // Does the monster have a target? If not, obtain one.
        if (activeBlob.target == null || activeBlob.target.isAlive == false) {
            activeBlob.setTarget(soldiers[Math.floor(Math.random() * soldiers.length)]);
        }

        // Move toward target
        let attemptedMoves = 0;
        let attemptedMovesMax = 4;
        let movesMade = 0;
        let movesMadeMax = 2;

        // TODO: add "max moves" to monster class
        // TODO: add attacks here
        while ((attemptedMoves < attemptedMovesMax) && (movesMade < movesMadeMax)) {

            let deltaX = 0;
            if (activeBlob.gridSquare.x > activeBlob.target.gridSquare.x) {
                deltaX = -1
            } else if (activeBlob.gridSquare.x < activeBlob.target.gridSquare.x) {
                deltaX = 1;
            }

            let deltaY = 0;
            if (activeBlob.gridSquare.y > activeBlob.target.gridSquare.y) {
                deltaY = -1
            } else if (activeBlob.gridSquare.y < activeBlob.target.gridSquare.y) {
                deltaY = 1;
            }

            // If multiple FAILED attempts to move were made, try backing up or moving left or right
            if (attemptedMoves >= 2 && movesMade == 0) {
                deltaX = deltaX * -1;
                deltaY = deltaY * -1;
            }

            // TODO: randomize which is first, horizontal or vertical movement

            let origin = activeBlob.gridSquare;
            let newX = activeBlob.gridSquare.x + deltaX;
            let newY = activeBlob.gridSquare.y;
            let possibleMove = gridSquares[0][0];


            if (newX <= gridSize - 1 && newX >= 0) {
                possibleMove = gridSquares[newX][newY];
                if (possibleMove != undefined && !possibleMove.isObstructed && !possibleMove.isOccupied && (movesMade < movesMadeMax)) {
                    origin = activeBlob.gridSquare
                    activeBlob.setGridSquare(possibleMove);
                    drivers.push(new MovementAnimationDriver(activeBlob, origin, possibleMove));
                    movesMade++;
                    attemptedMoves++;
                } else {
                    attemptedMoves++;
                }
            } else {
                attemptedMoves++;
            }

            newX = activeBlob.gridSquare.x;
            newY = activeBlob.gridSquare.y + deltaY;

            // console.log(`newY: ${newY}`);
            if (newY <= gridSize - 1 && newY >= 0) {
                possibleMove = gridSquares[newX][newY];
                if (possibleMove != undefined && !possibleMove.isObstructed && !possibleMove.isOccupied && (movesMade < movesMadeMax)) {
                    origin = activeBlob.gridSquare
                    activeBlob.setGridSquare(possibleMove);
                    drivers.push(new MovementAnimationDriver(activeBlob, origin, possibleMove));
                    movesMade++;
                    attemptedMoves++;
                } else {
                    attemptedMoves++;
                }
            } else {
                attemptedMoves++;
            }

            // ATTACK! (if able)...
            let distance = Math.abs(activeBlob.gridSquare.x - activeBlob.target.gridSquare.x)
                + Math.abs(activeBlob.gridSquare.y - activeBlob.target.gridSquare.y);
            let isAdjacent = distance < 2;
            console.log(`distance: ${distance} adj: ${distance <= 1}`);
            if (movesMade < 2 && isAdjacent == true) {

                let kill = {
                    attacker: activeBlob,
                    defender: activeBlob.target,
                    result: CombatResolutionState.KILL
                };

                drivers.push(new CombatResolutionDriver(kill, () => {
                    console.log("KILL!")
                    killEntity(activeBlob.target);
                }));

                // console.log(`monster ${activeBlob.id} ATTACKS and KILLS ${activeBlob.target.id}!`);
                // //attackEntity(activeBlob, activeBlob.target);
                // activeBlob.target.isAlive = false;
                // activeBlob.target.gridSquare.isOccupied = false;
                // activeBlob.target.gridSquare = null;
                // activeBlob.target = null;
                break;
            }

        }
    });

    drivers.push(new CustomDriver(() => {
        setState(States.IDLE);
    }));

    movementAnimationDrivers = movementAnimationDrivers.concat(drivers);
}

/**
 * Draw a line of sight from the center of one grid square (origin) to the another (target).
 * Next, "sub-sample" points from the line at regular intervals and find any squares that contain
 * the those points.
 */
function calculateLineOfSight(origin, target) {

    let pathSquares = new Set();

    let rise = target.y - origin.y;           // vertical difference: rise
    let run = target.x - origin.x;           // horizontal difference: run
    let theta = Math.atan(Math.abs(rise) / Math.abs(run));

    let deltaX = Math.cos(theta) * (gridSquareSize / 4);
    if (run < 0 && deltaX > 0) {
        deltaX = deltaX * -1;
    }

    let deltaY = Math.sin(theta) * (gridSquareSize / 4);
    if (rise < 0 && deltaY > 0) {
        deltaY = deltaY * -1;
    }

    // console.log(`rise: ${rise}\n run: ${run}\n theta: ${theta}\nangle: ${theta * 180 / Math.PI}`);
    // console.log(`dx: ${deltaX} deltaY: ${deltaY}`)

    let candidate = origin;

    let zPoint = {
        x: candidate.getCenter().x + deltaX,
        y: candidate.getCenter().y + deltaY
    };

    while (candidate != target) {

        zPoint = {
            x: zPoint.x + deltaX,
            y: zPoint.y + deltaY
        };

        let nextSquare = findGridSquareAtMouse(zPoint);

        if (nextSquare == null) {
            break;
        }

        if (candidate != target && candidate != origin) {
            pathSquares.add(candidate);
        }

        candidate = nextSquare;
    }

    return pathSquares;
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
            actionPointsCostPotential = 0;

            selectedGridSquares.length = 0;
            lineOfSightDots.clear();
            break;

        case States.ANIMATION:

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

    // Only highlight the movement path if there is no secondary entity selected
    if (selectedEntitySecondary == null) {
        // Highlight the selected path (selectedGridSquares)
        selectedGridSquares.forEach((square, index) => {

            let next = selectedGridSquares[index - 1];

            if (next != null) {
                let c1 = square.getCenter();
                let c2 = next.getCenter();
                entitiesTransient.push(new Line(c1.x, c1.y, c2.x, c2.y, 5.0, "#000000"));
                entitiesTransient.push(new Dot(square, "#000000", true));
            }
        });

    }


    // TODO: remove?
    lineOfSightDots.forEach(dot => {
        entitiesTransient.push(dot);
    });

    // Recalculate available action points
    let apAvail = 0;
    if (selectedGridSquares.length > 1) {
        apAvail = actionPointsAvailable - (selectedGridSquares.length - 1);
    } else {
        apAvail = actionPointsAvailable;
    }

    // Display available AP

    if (currentState == States.ENEMY_TURN) {
        entitiesTransient.push(new TextLabel(
            10, 700, "ENEMY TURN", "#000000"
        ));
    } else {
        // If there's a movement being plotted...
        if (selectedGridSquares.length > 0) {
            entitiesTransient.push(new TextLabel(
                10, 700, "AP: " + apAvail + " / " + actionPointsAvailable, "#000000"
            ));
        } else {
            //...otherwise, display the remaining AP
            entitiesTransient.push(new TextLabel(
                10, 700, "AP: " + apAvail, "#000000"
            ));
        }
    }

    if (mousePointerHoverDot != null) {
        entitiesTransient.push(mousePointerHoverDot);
    }

    // Check for remaining action points. When there are no more, it's the enemy's turn...
    let notBusy = (currentState != States.ANIMATION && currentState != States.ENEMY_TURN);
    if (actionPointsAvailable == 0 && notBusy) {
        startEnemyTurn();
        actionPointsAvailable = actionPointsMax;
        //setState(States.IDLE);
    }


    /* CULL DEAD ENTITIES */
    let deadEntities = new Array();
    entitiesResident.forEach(entity => {
        if (entity.isAlive == false) {
            deadEntities.push(entity);
        } else {
            entity.update();
        }
    });

    deadEntities.forEach(entity => {
        let index = entitiesResident.indexOf(entity);
        if (index > -1) {
            console.log(`removing dead entity: ${entity.id}`);
            entitiesResident.splice(index, 1);
        }
    });

    // Process each driver, one at a time starting at the head of the queue, until it is expired.
    if (movementAnimationDrivers.length > 0) {
        let driver = movementAnimationDrivers[0];
        driver.update();

        if (driver instanceof CombatResolutionDriver) {
            entitiesTransient.push(driver);
        }

        if (driver.isDone()) {
            movementAnimationDrivers = movementAnimationDrivers.splice(1, movementAnimationDrivers.length - 1);
        }
    }
}

// Display the underlying grid.
// BIG GRIDS with intricate internal geometry make the game SLOW! 
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

    // let date = new Date();
    // let start = date.getMilliseconds();

    // Draw background
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context);

    context.imageSmoothingEnabled = false;

    // Draw entities
    // TODO: consider adding layer ordering
    entitiesResident.forEach(entity => {
        if (entity.isAlive == true) {
            entity.render(context);
        }
    });

    entitiesTemporary.forEach(entity => {
        entity.render(context);
    });

    entitiesTransient.forEach(entity => {
        entity.render(context);
    });

    // Clear the transients
    entitiesTransient.length = 0;

    // date = new Date();
    // let end = date.getMilliseconds();
    // totalFrames++;
    // totalMilliSeconds = totalMilliSeconds + (end-start);
    // console.log(`frames: ${totalFrames} millis: ${totalMilliSeconds} fps: ${(totalFrames/totalMilliSeconds)}`);
}

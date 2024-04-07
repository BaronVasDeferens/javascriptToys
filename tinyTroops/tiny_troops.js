/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

import { Blob, Ring, GridSquare, IntroAnimation, Line, MovementAnimationDriver, Soldier, TextLabel, Dot, LittleDot, CustomDriver, CombatResolutionDriver, CombatResolutionState, DeathAnimationDriver, DefeatAnimation, BonusActionPointTile } from './entity.js';
import * as SoundModule from './SoundModule.js';

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
    ANIMATION: "ANIMATION",
    DEFEAT: "DEFEAT",
    VICTORY: "VICTORY"
});

var currentState = States.INTRO;
const introAudio = SoundModule.getSound(SoundModule.SFX.INTRO); // new Audio("resources/intro.wav");

// Map data
const gridCols = 20;
const gridRows = 10;

const numObstructedSquares = randomIntInRange(gridRows, gridCols);

const numSoldiers = 1;
const numBlobs = 1;

const gridSquares = new Array(0);
var allSquares = [];
const gridSquareSize = 64;
var selectedGridSquares = [];

var selectedEntityPrimary = null;       // the currently "selected" entity
var selectedEntitySecondary = null;     // if selectedPrimary != null, this is the entity (if any) under the mouse

var mousePointerHoverDot = null;        // a ring which denotes the selected entity
var mousePointerHoverLine = null;       // a line stretching from the selected unit to the mouse pointer

var lineOfSightDots = new Set();
var lineOfSightGridSquares = new Set();

const entitiesResident = [];    // All "permanent" entities (players, enemies)
const entitiesTemporary = [];   // Temporary entities; cleared after the phase changes
const entitiesTransient = [];   // Cleared after every render


/**
 * Movement Animation Drivers
 * An ordered queue of classes which incrementally adjust entity positions on screen
 */
var movementAnimationDrivers = new Array();

// Action point tracking
const actionPointsMax = 7; //= numSoldiers * 3;
var actionPointsAvailable = actionPointsMax;
var actionPointsCostPotential = 0;
var actionPointCostAdjustment = 0;





function actionPointCostTotal() {
    return actionPointsCostPotential + actionPointCostAdjustment;
};

function randomIntInRange(min, max) {
    return parseInt(Math.random() * max + min);
};



/**
 * SETUP
 */

var setup = function () {
    console.log(">>> Starting...");
    initialize();
    beginGame();
}();

function initialize() {
    // Set intro mode, animation, music
    setState(States.INTRO);

    // Clear away prior squares and entities
    entitiesTemporary.length = 0;
    entitiesResident.length = 0;
    gridSquares.length = 0;


    console.log(`${gridCols} x ${gridRows}`)
    entitiesTemporary.push(new IntroAnimation(gridCols, gridRows, gridSquareSize));


    // Setup grid squares
    for (var i = 0; i < gridCols; i++) {
        gridSquares[i] = new Array(0);
        for (var j = 0; j < gridRows; j++) {
            gridSquares[i].push(new GridSquare(i, j, gridSquareSize));
        }
    }

    allSquares = gridSquares.flat(arr => {
        arr.flat();
    }).flat();


    // Set up obstructed squares
    shuffleArray(allSquares);
    for (var xyz = 0; xyz < numObstructedSquares; xyz++) {
        allSquares[xyz].isObstructed = true;
    }

    // Create some soldiers in the LEFT third of the map
    let firstThird = allSquares.filter(sq => sq.x <= gridCols / 3);
    let soldiers = [];
    for (var n = 0; n < numSoldiers; n++) {
        shuffleArray(firstThird);
        let home = firstThird.filter(sq => sq.isOccupied == false && sq.isObstructed == false).pop();
        let center = home.getCenter();
        let ent = new Soldier("soldier_" + n, center.x, center.y);
        ent.setGridSquare(home);
        soldiers.push(ent);
    }

    soldiers.forEach(soldier => {
        entitiesResident.push(soldier);
    });


    // Create some blobs in the RIGHT third of the map
    let lastThird = allSquares.filter(sq => sq.x >= (gridCols - (1 / 3 * gridCols)));
    let blobs = [];
    for (var n = 0; n < numBlobs; n++) {
        shuffleArray(lastThird);
        let home = lastThird.filter(sq => sq.isOccupied == false && sq.isObstructed == false).pop();
        let center = home.getCenter();
        let ent = new Blob("blob_" + n, center.x, center.y);
        ent.setGridSquare(home);
        blobs.push(ent);
        entitiesResident.push(ent);
    }

    // ------------ ADD BONUS SQUARES --------------------
    let bonusSquares = allSquares.filter(square => {
        return (square.isObstructed == false && square.isOccupied == false);
    });

    shuffleArray(bonusSquares);

    for (var sqz = 0; sqz < 10; sqz++) {
        let square = bonusSquares[sqz];
        var bonusTile = new BonusActionPointTile("+3", square.x, square.y, gridSquareSize);
        entitiesResident.push(bonusTile);
    }
}

// Prevent the right click from summoning the context menu. Considered "bad form" but LOL whatever
document.addEventListener('contextmenu', event => event.preventDefault());

// Process mouse clicks
window.onmousedown = function (event) {

    switch (currentState) {
        case States.INTRO:
            setState(States.IDLE);
            break;

        case States.DEFEAT:
        case States.VICTORY:    
            initialize();
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

                        let reducer = (sum, current) => {
                            return sum || current.isObstructed || current.isOccupied;
                        };

                        let isShotObstructed = Array.from(lineOfSightGridSquares).reduce(reducer, false);

                        if (isShotObstructed == false && actionPointsAvailable - actionPointCostTotal() >= 0) {
                            attackEntity(selectedEntityPrimary, selectedEntitySecondary);
                            // console.log(`apa: ${actionPointsAvailable} / apct: ${actionPointCostTotal()}`)
                            actionPointsAvailable = actionPointsAvailable - actionPointCostTotal();
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

                //Is the gridSquare under the mouse is already in the set?
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

                // Draw a ring under the mouse
                if (selectedEntitySecondary == null) {
                    mousePointerHoverDot = new Ring(event.x, event.y, 50, "#000000");
                    mousePointerHoverLine = null;
                    lineOfSightDots.clear();
                    lineOfSightGridSquares.clear();
                } else {
                    let centerTarget = selectedEntitySecondary.gridSquare.getCenter();
                    mousePointerHoverDot = new Ring(centerTarget.x, centerTarget.y, 50, "#FF0000");
                    // TODO: make mousePointerHoverLine origin at circumference of hoverdot
                    mousePointerHoverLine = new Line(centeredCoords.x, centeredCoords.y, centerTarget.x, centerTarget.y, 2, "#FF0000");

                    // Caluilate LOS and draw LOS obstruction dots...
                    lineOfSightGridSquares = calculateLineOfSight(selectedEntityPrimary.gridSquare, selectedEntitySecondary.gridSquare);

                    // debug: LOS dots
                    lineOfSightGridSquares.forEach(square => {
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

    if (column > gridCols || row > gridRows) {
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

function findAndTargetClosestHuman(blob) {

    let soldiers = entitiesResident.filter(ent => {
        return ent instanceof Soldier;
    });

    let blobGridSq = blob.gridSquare;

    let distances = soldiers.map(soldier => {
        let soldierGridSq = soldier.gridSquare
        return Math.abs(blobGridSq.x - soldierGridSq.x) + Math.abs(blobGridSq.y - soldierGridSq.y);
    });

    let closestDistance = 999;
    let closestIndex = 0;

    for (var i = 0; i < soldiers.length; i++) {
        if (distances[i] < closestDistance) {
            closestDistance = distances[i];
            closestIndex = i;
        }
    }

    // console.log(`${distances} : ${closestIndex}`);

    blob.setTarget(soldiers[closestIndex]);
}

function targetClosestEnemy(attacker, targets) {

    let attackerSq = attacker.gridSquare;

    let distances = targets.map(target => {
        let targetSq = target.gridSquare
        return Math.abs(attackerSq.x - targetSq.x) + Math.abs(attackerSq.y - targetSq.y);
    });

    let closestDistance = 999;
    let closestIndex = 0;

    for (var i = 0; i < targets.length; i++) {
        if (distances[i] < closestDistance) {
            closestDistance = distances[i];
            closestIndex = i;
        }
    }

    attacker.setTarget(targets[closestIndex]);
}

function computeAttackStats(aggressor, target, range) {

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
                drivers.push(new MovementAnimationDriver(entity, sqr, selectedGridSquares[index + 1], SoundModule.SFX.SOLDIER_MOVE_1));
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

    var canvas = document.getElementById('playArea');
    var windowWidth = canvas.width;
    var windowHeight = canvas.height;

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


    let attackStats = computeAttackStats(aggressor, target);

    let drivers = [];

    drivers.push(new CustomDriver(function () {
        setState(States.ANIMATION);
    }));

    if (Math.floor(Math.random() * 100) <= attackStats.hitChance) {
        drivers.push(new CombatResolutionDriver(windowWidth, windowHeight, aggressor, target, kill, () => {
            console.log("attack success!");
            killEntity(target);
        }));
    } else {
        drivers.push(new CombatResolutionDriver(windowWidth, windowHeight, aggressor, target, noEffect, () => {
            console.log("attack fail");
        }));
    }

    drivers.push(new CustomDriver(function () {
        setState(States.IDLE);
    }));

    movementAnimationDrivers = movementAnimationDrivers.concat(drivers);

    // do some rolling here for wounds, effects, etc
}

function killEntity(condemned) {
    console.log(`${condemned.id} dies`);
    condemned.isAlive = false
    condemned.gridSquare.isOccupied = false;
}


/**
 * START ENEMY TURN
 */
function startEnemyTurn() {

    var canvas = document.getElementById('playArea');
    var windowWidth = canvas.width;
    var windowHeight = canvas.height;

    let drivers = [];

    drivers.push(new CustomDriver(function () {
        setState(States.ENEMY_TURN);
    }));


    let blobs = entitiesResident.filter(ent => {
        if (ent instanceof Blob) {
            return (ent.isAlive == true);
        } else {
            return false;
        }
    });

    let soldiers = entitiesResident.filter(ent => {
        if (ent instanceof Soldier) {
            return ent.isAlive;
        } else {
            return false;
        }
    });

    console.log(`${blobs.length} blobs move...`);

    // Randomize the blobs' turn order
    // TODO: ...or don't. Predicatability might need to work in the player's favor
    shuffleArray(blobs);

    blobs.forEach(activeBlob => {

        let path = new Array();
        let bad = new Array();
        let attemptedMoves = 0;
        let attemptedMovesMax = 5;
        let movesMade = 0;
        let movesMadeMax = 5;

        // Does the monster have a LIVE target? If not, obtain one.
        if (activeBlob.target == undefined || activeBlob.target == null || !activeBlob.target.isAlive) {
            let index = randomIntInRange(0, soldiers.length);
            activeBlob.setTarget(soldiers[index]);
        }

        console.log(`blob ${activeBlob.id} target ${activeBlob.target.id} at: ${activeBlob.target.gridSquare.x},${activeBlob.target.gridSquare.y}`);

        // TODO: add "max moves" to monster class
        while ((attemptedMoves < attemptedMovesMax) && (movesMade < movesMadeMax)) {

            // ATTACK! (if able)...
            let distance = Math.abs(activeBlob.gridSquare.x - activeBlob.target.gridSquare.x)
                + Math.abs(activeBlob.gridSquare.y - activeBlob.target.gridSquare.y);

            let isAdjacent = distance < 2;

            let isWithinSpittingDistance = distance <= 5

            if (movesMadeMax - movesMade >= 1 && isAdjacent == true) {

                let kill = {
                    attacker: activeBlob,
                    defender: activeBlob.target,
                    result: CombatResolutionState.KILL
                };

                drivers.push(new CombatResolutionDriver(windowWidth, windowHeight, activeBlob, activeBlob.target, kill, () => {
                    console.log(`${activeBlob.id} kills ${activeBlob.target.id}`);
                    killEntity(activeBlob.target);
                }));

                break;
            }
            // else if (isWithinSpittingDistance) {
            //     let gridSquares = calculateLineOfSight(activeBlob.gridSquare, activeBlob.target.gridSquare)
            //     let gridSquareArray = new Array();
            //     gridSquares.forEach( element => {
            //         gridSquareArray.push(element);
            //     })
            //     let isWithinLOS = gridSquareArray.every(element => {return !element.isObstructed && !element.isOccupied});
            //     if (isWithinLOS) {
            //         console.log(`${activeBlob.id} can spit at ${activeBlob.target.id}`);
            //     } else {
            //         console.log(`${activeBlob.id} has no LOS to at ${ activeBlob.target.id}`);
            //     }
            // } 
            else {
                let currentGridSquare = activeBlob.gridSquare;
                let neighbors = getAdjacentSquares(currentGridSquare);

                // console.log(`blob at: ${activeBlob.gridSquare.x},${activeBlob.gridSquare.y}`);
                // console.log(`blob considers ${neighbors.length} adjacent squares... `);

                neighbors = neighbors.sort((sq1, sq2) => {
                    let dist1 = Math.abs(activeBlob.target.gridSquare.x - sq1.x) + Math.abs(activeBlob.target.gridSquare.y - sq1.y);
                    let dist2 = Math.abs(activeBlob.target.gridSquare.x - sq2.x) + Math.abs(activeBlob.target.gridSquare.y - sq2.y);
                    if (dist1 < dist2) {
                        return -1;
                    }

                    if (dist2 > dist1) {
                        return 1;
                    }

                    return 0;
                });
                neighbors = neighbors.filter(sq => { return path.includes(sq) == false });
                neighbors = neighbors.filter(sq => { return sq.isOccupied == false });
                neighbors = neighbors.filter(sq => { return sq.isObstructed == false });
                let candidate = neighbors[0];

                if (candidate != undefined) {
                    movesMade++;
                    activeBlob.setGridSquare(candidate);
                    path.push(candidate);
                    drivers.push(new MovementAnimationDriver(activeBlob, currentGridSquare, candidate, "resources/sounds/blob_move_1.wav"));
                } else {
                    attemptedMoves++;
                }
            }


            //console.log(`${movesMade} / ${attemptedMoves}`);

        }
    });

    drivers.push(new CustomDriver(() => {
        setState(States.IDLE);
    }));

    movementAnimationDrivers = movementAnimationDrivers.concat(drivers);
}


function getAdjacentSquares(center) {
    let neighbors = [];

    if (center.x + 1 < gridCols && gridSquares[center.x + 1][center.y] != undefined) {
        neighbors.push(gridSquares[center.x + 1][center.y]);
    }

    if (center.x - 1 >= 0 && gridSquares[center.x - 1][center.y] != undefined) {
        neighbors.push(gridSquares[center.x - 1][center.y]);
    }

    if (center.y + 1 < gridRows && gridSquares[center.x][center.y + 1] != undefined) {
        neighbors.push(gridSquares[center.x][center.y + 1]);
    }

    if (center.y - 1 >= 0 && gridSquares[center.x][center.y - 1] != undefined) {
        neighbors.push(gridSquares[center.x][center.y - 1]);
    }

    return neighbors;
}

/**
 * Draw a line of sight from the center of one grid square (origin) to the another (target).
 * Next, "sub-sample" points from the line at regular intervals and find any squares that contain
 * the those points.
 * 
 * Returns the GridSquares between the origin and target.
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
            // DEBUG: display points along the LOS line
            let dot = new LittleDot(zPoint.x, zPoint.y);
            dot.isFilled = nextSquare.isOccupied || nextSquare.isObstructed;
            lineOfSightDots.add(dot);

            pathSquares.add(candidate);
        }



        candidate = nextSquare;
    }

    return pathSquares;
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
            lineOfSightGridSquares.clear();
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

/*******************
 * UPDATE GAME STATE
******************** 
*/

function updateGameState() {

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var gridLowerBound = (gridRows * gridSquareSize) + 25;     // the bottom of the grid (plus an offset)


    // Add transients for the last known mouse positions
    if (mousePointerHoverLine != null) {
        entitiesTransient.push(mousePointerHoverLine);

        let asArray = Array.from(lineOfSightGridSquares);
        let reducer = (sum, current) => {
            return sum || current.isObstructed || current.isOccupied;
        };

        let isShotObstructed = asArray.reduce(reducer, false);

        if (isShotObstructed) {
            entitiesTransient.push(new TextLabel(
                mousePointerHoverLine.endX - 25,
                mousePointerHoverLine.endY + 100,
                "OBSTRUCTED",
                "#FF0000"));
        } else {

            // Display AP cost when hovering over potential target
            var mousePointerHoverLineDistance = mousePointerHoverLine.getLength();
            actionPointsCostPotential = mousePointerHoverLineDistance;
            entitiesTransient.push(new TextLabel(
                mousePointerHoverLine.endX,
                mousePointerHoverLine.endY + 75,
                actionPointCostTotal(),
                "#FF0000"));

            // Display hit chance and damage potential stats
            if (selectedEntitySecondary != null) {

                let attackStats = computeAttackStats(selectedEntityPrimary, selectedEntitySecondary);

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

    // DEBUG: render LOS info
    // lineOfSightDots.forEach(dot => {
    //     entitiesTransient.push(dot);
    // });

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
            10, gridLowerBound, "ENEMY TURN", "#000000"
        ));
    } else {
        // If there's a movement being plotted...
        if (selectedGridSquares.length > 0) {
            entitiesTransient.push(new TextLabel(
                10, gridLowerBound, "AP: " + apAvail + " / " + actionPointsAvailable, "#000000"
            ));
        } else {
            //...otherwise, display the remaining AP
            entitiesTransient.push(new TextLabel(
                10, gridLowerBound, "AP: " + apAvail, "#000000"
            ));
        }
    }

    if (mousePointerHoverDot != null) {
        entitiesTransient.push(mousePointerHoverDot);
    }

    // Check for remaining action points. When there are no more, it's the enemy's turn...
    let notBusy = (currentState != States.ANIMATION) && (currentState != States.ENEMY_TURN) && (movementAnimationDrivers.length == 0);
    if (actionPointsAvailable == 0 && notBusy) {
        startEnemyTurn();
        actionPointsAvailable = actionPointsMax;
    }


    /* CULL DEAD ENTITIES */
    let deadEntities = new Array();
    entitiesResident.forEach(entity => {
        if (entity.isAlive == false) {
            deadEntities.push(entity);
            if (entity instanceof Blob) {
                movementAnimationDrivers.push(new DeathAnimationDriver(entity.gridSquare.getCenter()));
            }
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

        if (driver instanceof CombatResolutionDriver || driver instanceof DeathAnimationDriver) {
            entitiesTransient.push(driver);
        }

        if (driver.isDone()) {

            // ----------- PROCESS BONUS SQUARES ----------------
            // As the movement drivers expire, check whether the destination contains a bonus.
            // If yes, award the bonus and clear the bonus tile.
            if (driver instanceof MovementAnimationDriver) {
                let bonusSquare = entitiesResident.filter(ent => {
                    return (ent instanceof BonusActionPointTile && ent.x == driver.destination.x && ent.y == driver.destination.y)
                })[0];

                if (bonusSquare != undefined) {
                    bonusSquare.isAlive = false;
                    // Only award bonus AP if the entity is a soldier!
                    if (driver.entity instanceof Soldier) {
                        actionPointsAvailable += parseInt(bonusSquare.value);
                    }
                }
            }



            movementAnimationDrivers = movementAnimationDrivers.splice(1, movementAnimationDrivers.length - 1);
        }
    } else {
        if (currentState == States.IDLE) {

            // Check for endgame
            let blobs = entitiesResident.filter(entity => {
                return entity instanceof Blob
            });

            let soldiers = entitiesResident.filter(entity => {
                return entity instanceof Soldier
            });

            if (soldiers.length == 0) {
                setState(States.DEFEAT);
                entitiesTemporary.push(new DefeatAnimation(90, 180));
            } else if (blobs.length == 0) {
                setState(States.VICTORY);
            } else {
                // keep playing
            }
        }
    }

}

// Display the underlying grid.
// BIG GRIDS with intricate internal geometry make the game SLOW! 
// TODO: Render once and re-use
function drawGrid(context) {
    for (var i = 0; i < gridCols; i++) {
        for (var j = 0; j < gridRows; j++) {
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
}

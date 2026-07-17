// Load classes-- requires webserver to run "http-server ."

import { HexMap } from './hexmap.js';
import { PathTracker } from '../../pathtracker.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const canvasOffscreen = document.createElement('canvas');
canvasOffscreen.width = canvas.width;
canvasOffscreen.height = canvas.height
const contextOffscreen = canvasOffscreen.getContext('2d');

var backgroundImage = null;
var overlayImage = null;

var hexMap = null;
const hexSizeDefault = 42;

var pathTracker = new PathTracker();

const GameState = Object.freeze({
    IDLE: "IDLE",
    UNIT_SELECT_MOVE: "UNIT_SELECT_MOVE"
});

var gameState = GameState.IDLE;

// ------------------------------ BEGIN CORE LOOP --------------------------
// --- STARTUP / INIT ---
(function init() {
    pathTracker.clear();
    backgroundImage = new Image();
    overlayImage = new Image();
    hexMap = new HexMap(11, 15, hexSizeDefault, canvas);
    printBackground();
    render();
})()


function render() {
    context.drawImage(backgroundImage, 0, 0);

    let markerRadius = 10;
    pathTracker.pathSet.forEach(hex => {
        context.fillStyle = "#FF00FF"
        context.beginPath();
        context.arc(
            hex.center.x,
            hex.center.y,
            markerRadius,
            0,
            2 * Math.PI);
        context.fill();
    });
}

// ---------------------------- END CORE LOOP ------------------------------

function updateGameState(newState) {
    if (newState != gameState) {
        gameState = newState;
        console.log(`${gameState}`)
    }
}

function printBackground() {
    hexMap.render(context);
    var updatedSrc = canvas.toDataURL();
    backgroundImage.src = updatedSrc;
}

function modifyHexPath(hex) {

    if (hex == null) {
        console.error(`cannot modify hexPath: hex is NULL!`);
        return;
    }

    if (pathTracker.size() == 0) {
        pathTracker.add(hex);
    } else if (pathTracker.size() == 1 && !pathTracker.has(hex)) {
        pathTracker.add(hex);
    } else {

        let indexOfHex = pathTracker.indexOf(hex);

        if (pathTracker.has(hex) && pathTracker.indexOf(hex) != pathTracker.size() - 1) {
            pathTracker.deleteHex(pathTracker.getAtIndex(indexOfHex + 1))
        } else {
            pathTracker.add(hex)
        }
    }

    render();

}


// Prevent right-click from summoning the context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', event => {

    switch (event.code) {

        case "KeyD":
            hexMap.toggleDebug();
            printBackground();
            render();
            break;

        case "Escape":
            console.log("Resetting...");
            hexMap.hexSize = hexSizeDefault;
            pathTracker.clear();
            hexMap.initialize();
            render();
            break;

        default:
            break;
    }
});

document.addEventListener('mousedown', event => {

    event.preventDefault();

    if (event.button == 0) {

        let hex = hexMap.findHexAtClick(event);
        if (hex != null) {
            updateGameState(GameState.UNIT_SELECT_MOVE);
            modifyHexPath(hex);
        }
    }

}, { passive: false });

document.addEventListener('mouseup', event => {


    if (event.button == 0) {
        let hex = hexMap.findHexAtClick(event);
        if (hex != null) {
            // TODO: Trigger movement
        }
    }

    updateGameState(GameState.IDLE);
    pathTracker.clear();
    render();

});


document.addEventListener('mousemove', event => {

    switch (gameState) {

        case GameState.UNIT_SELECT_MOVE:
            modifyHexPath(hexMap.findHexAtClick(event));
            break;

        default:
            break;
    }

});

document.addEventListener('wheel', event => {

    event.preventDefault();

    // if (event.wheelDelta > 0) {
    //     hexMap.increaseSize();
    // } else {
    //     hexMap.decreaseSize();
    // }

    // context.fillStyle = "#000000";
    // context.fillRect(0, 0, canvas.width, canvas.height);
    // hexMap.render(context);

}, { passive: false });



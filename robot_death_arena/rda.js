// Load classes-- requires webserver to run "http-server ."

import { HexMap } from './hexmap.js';

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

var pathHexes = new Set();

const GameState = Object.freeze({
    IDLE: "IDLE",
    UNIT_SELECT_MOVE: "UNIT_SELECT_MOVE"
});

var gameState = GameState.IDLE;

// --------------------------------------------------------------------
// --- STARTUP / INIT ---
(function init() {
    backgroundImage = new Image();
    overlayImage = new Image();
    hexMap = new HexMap(11, 15, hexSizeDefault, canvas);
    printBackground();
    render();
})()
// --------------------------------------------------------------------

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

function render() {
    context.drawImage(backgroundImage, 0, 0);
    pathHexes.forEach(hex => {
        context.fillStyle = "#FF00FF"
        context.fillRect(hex.center.x, hex.center.y, 10, 10);
    });
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
            hex.setIsSelected(!hex.isSelected);
            if (!pathHexes.has(hex)) {
                pathHexes.add(hex);
                render();
            }
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
    pathHexes.clear();
    render();

});


document.addEventListener('mousemove', event => {

    switch (gameState) {

        case GameState.UNIT_SELECT_MOVE:

            let hex = hexMap.findHexAtClick(event);
            if (hex != null && !pathHexes.has(hex)) {
                pathHexes.add(hex);
                render();
            }

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





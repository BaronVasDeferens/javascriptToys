import { AssetLoader, ImageAsset, ImageLoader, SoundLoader } from "./assets.js";
import { Entity } from "./entity.js";
import { RoadManager } from "./roads.js";

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();
const soundLoader = new SoundLoader();

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');

var audioContext; // AudioContext must be initialized after interactions

// ----------------------------- WEBSOCKET ---------------------------------

// Location of our back-end
const ip = "127.0.0.1";
const port = 8080;
const serverAddress = `ws://${ip}:${port}/registerMonitor`
var socket;

// ------------------------- GAME LOGIC --------------------------

export const Stage = Object.freeze({
    INITIALIZING: "INITIALIZING",
    INSERT_COIN: "INSERT_COIN",
    PLAYER_SELECT: "PLAYER_SELECT",
    GAME_ACTIVE: "GAME_ACTIVE",
    GAME_OVER: "GAME_OVER"
});

var stage = Stage.INITIALIZING;

var debugMode = false;

var backgroundImage = new Image();

var playerEntity;

var entitiesTemporary = [];

const tileSize = 64;            // in pixels
const tileRows = canvas.height / tileSize;
const tileCols = canvas.width / tileSize;

var roadManager = new RoadManager(tileCols, tileRows, tileSize, imageLoader);

var speedCurrent = 2;
const speedIncrement = 2;

const speedMax = 64;
const speedMin = 2;


// -------------------------------------------------------

var setup = function () {
    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, soundLoader, () => {
        initialize();
        beginGame();
    });
}();

function initialize() {
    console.log("Initializing...");
    entitiesTemporary = [];
    renderInitBackgroundImage(context);
    beginWebSocket();
    roadManager.init();
}

function beginWebSocket() {
    // Creates new WebSocket object with a ws URI as the parameter
    socket = new WebSocket(serverAddress);

    // Fired when a connection with a WebSocket is opened
    socket.onopen = function () {
        console.log(`>>> Connected to ${serverAddress}`);
        let dimensions = {
            width: canvas.width,
            height: canvas.height
        }
        sendMonitorDimensions(dimensions);
    };

    // Fired when data is received through a WebSocket
    socket.onmessage = function (event) {
        processIncomingGameStateData(event.data);
    };

    // Fired when a connection with a WebSocket is closed
    socket.onclose = function (event) {
        console.log(">>> WebSocket connection CLOSED!");
        console.log(event);
        updateStage(Stage.INITIALIZING);
    };

    // Fired when a connection with a WebSocket has been closed because of an error
    socket.onerror = function (event) {
        console.log(event);
    };

}

function sendMonitorDimensions(dimensions) {
    let payload = JSON.stringify(dimensions)
    socket.send(payload);
}

function beginGame() {
    update();
    render(context);
    requestAnimationFrame(beginGame);
}

function processIncomingGameStateData(gameStateData) {
    let newData = JSON.parse(gameStateData);
    let newStage = Stage[newData.stage];
    updateStage(newStage);

    if (newData.playerPositions != null) {
        newData.playerPositions.forEach(playerPos => {
            updatePlayerPosition(playerPos);
        });
    }
}

function updatePlayerPosition(playerPos) {
    playerEntity.x = playerPos.x;
    playerEntity.y = playerPos.y;
}

function updateStage(newStage) {
    if (newStage != stage) {
        stage = newStage;
        console.log(`stage: ${stage}`);

        switch (stage) {
            case Stage.INITIALIZING:
                renderInitBackgroundImage();
                break;
            case Stage.INSERT_COIN:
                renderAttractScreen();
                roadManager.updateSpeed(speedCurrent);
                break;
            case Stage.GAME_ACTIVE:
                playerEntity = new Entity(
                    canvas.width / 2,
                    canvas.height / 2,
                    imageLoader.getImage(ImageAsset.INFILTRATOR));
                roadManager.updateSpeed(speedCurrent);
                break;
            default:
                break;
        }
    }
}

function update() {


    switch (stage) {
        case Stage.INSERT_COIN:
        case Stage.GAME_ACTIVE:
            roadManager.update();
            break;
        default:
            break;
    }
}

function render(context) {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    switch (stage) {
        case Stage.INITIALIZING:
        case Stage.INSERT_COIN:
            roadManager.render(context);
            context.drawImage(imageLoader.getImage(ImageAsset.TITLE), 0, 0);
            break;
        case Stage.GAME_ACTIVE:
            roadManager.render(context);
            entitiesTemporary.forEach(ent => {
                ent.render(context);
            });
            playerEntity.render(context);
            entitiesTemporary = [];
            break;
    }
}


/**
 * Renders the background once into a reusable image
 */
function renderInitBackgroundImage() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    let updatedSrc = canvas.toDataURL();
    backgroundImage = new Image();
    backgroundImage.src = updatedSrc;
}

function renderAttractScreen() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    let titleScreen = new Entity(0, 0, imageLoader.getImage(ImageAsset.TITLE));
    titleScreen.render(context);
    let updatedSrc = canvas.toDataURL();
    backgroundImage = new Image();
    backgroundImage.src = updatedSrc;
}

function random(min, max) {
    return parseInt(Math.random() * max + min);
};




// -----------------------------------------------
// --- PLAYER INPUT ---


// Mouse DOWN
document.addEventListener('mousedown', (click) => {

});

// Mouse MOVE
document.addEventListener('mousemove', (click) => {

    switch (stage) {
        default:
            break;
    }
});

// Mouse UP
document.addEventListener('mouseup', (click) => {


});

document.addEventListener('keydown', (event) => {

    switch (event.key) {

        case 'd':
            break;

        case 'i':
            break;

        case 'w':
            speedCurrent = speedCurrent * speedIncrement;
            if (speedCurrent >= speedMax) {
                speedCurrent = speedMax;
            }
            roadManager.updateSpeed(speedCurrent);
            break;
        case 's':
            speedCurrent = speedCurrent / speedIncrement;
            if (speedCurrent < speedMin) {
                speedCurrent = speedMin;
            }
            roadManager.updateSpeed(speedCurrent);
            break;
        default:
            break;
    }
});

import { ResourceManager } from "./resources/ResourceManager.js";
import { SceneType } from "./scenes/scene.js";
import { SceneManager } from "./scenes/SceneManager.js";


// ------------------------------------- HTML ELEMENTS -------------------------------------

const canvasPrimary = document.getElementById('primary');
const contextPrimary = canvasPrimary.getContext('2d');

var audioContext = new AudioContext(); // AudioContext must be initialized after interactions

const tileSize = 64;

const resourceManager = new ResourceManager(audioContext);
const sceneManager = new SceneManager(canvasPrimary, null, tileSize, resourceManager, null);


// ------------------------------------- GAME DETAILS -------------------------------------

export const Stage = Object.freeze({
    LOAD_START: "LOAD_START",
    LOAD_COMPLETE: "LOAD_COMPLETE",
    INITIALIZING: "INITIALIZING",
    GAME_ACTIVE: "GAME_ACTIVE",
    GAME_OVER: "GAME_OVER"
});

var stage;

var debugMode = false;

var lastRenderMillis = Date.now();

// ------------------------------------- CORE LOGIC -------------------------------------

var setup = function () {
    updateStage(Stage.LOAD_START);
    resourceManager.loadAssets(() => {

        sceneManager.initialize();

        updateStage(Stage.LOAD_COMPLETE);
        beginGame();
    });
}();


function initialize() {

    // TODO: init stuff goes here...
    updateStage(Stage.GAME_ACTIVE);
}


function beginGame() {
    update();
    render(contextPrimary, null);
    requestAnimationFrame(beginGame);
}


function updateStage(newStage) {

    if (newStage != stage) {
        stage = newStage;
        log(`stage: ${stage}`);

        switch (stage) {

            case Stage.LOAD_START:
            case Stage.LOAD_COMPLETE:
                break;

            case Stage.INITIALIZING:
                sceneManager.setCurrentSceneType(SceneType.NO_SCENE);
                break;

            case Stage.GAME_ACTIVE:
                sceneManager.setCurrentSceneType(SceneType.HEX_MAP);
                break;

            default:
                break;
        }
    }
}


function update() {

    let delta = Date.now() - lastRenderMillis;
    lastRenderMillis = Date.now();
    sceneManager.update(delta);

    switch (stage) {
        case Stage.LOAD_START:
        case Stage.LOAD_COMPLETE:
        default:
            break;
    }
}


function render(contextPrimary, contextSecondary) {

    sceneManager.render(contextPrimary, null);

    switch (stage) {

        case Stage.LOAD_START:
            contextPrimary.fillStyle = "#FFFFFF";
            contextPrimary.fillText("LOADING...", 50, 50);
            break;

        case Stage.LOAD_COMPLETE:
            contextPrimary.fillStyle = "#FFFFFF";
            contextPrimary.fillText("LOADING...COMPLETE", 50, 50);
            contextPrimary.fillText("Click to continue...", 50, 100);
            break;

        case Stage.INITIALIZING:
        case Stage.GAME_ACTIVE:
            break;

        default:
            break;
    }
}

// --- HELPER METHODS ---

function toggleDebug() {
    debugMode = !debugMode;
    if (debugMode == true) {
        log(`debug: ON`);
    } else {
        log(`debug: OFF`);
    }
}

function renderDebug(context, framesPerSecond) {
    context.fillStyle = "#FFFFFF";
    context.font = "16px micronian";
    context.fillText(`fps (avg): ${framesPerSecond}`, 50, 100);
}

function random(min, max) {
    return parseInt(Math.random() * max + min);
};

function randomInRange(min, max) {
    let range = Math.abs(max - min);
    return Math.floor(Math.random() * range) + min
}

function log(msg) {
    console.log(msg)
}


// ------------------------------------- PLAYER INPUT -------------------------------------

document.addEventListener('contextmenu', (e) => e.preventDefault());

// Mouse DOWN (primary canvas)
canvasPrimary.addEventListener('mousedown', (click) => {

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    sceneManager.onMouseDown(click);


    switch (stage) {

        case Stage.LOAD_COMPLETE:
            initialize();
            break;

        case Stage.INITIALIZING:
            updateStage(Stage.GAME_ACTIVE);
            break;

        case Stage.GAME_ACTIVE:
            break;

        default:
            break;
    }

});

// Mouse MOVE (Primary)
canvasPrimary.addEventListener('mousemove', (event) => {

    switch (stage) {
        default:
            break;
    }

    sceneManager.onMouseMove(event);
});



// Mouse UP (Primary)
canvasPrimary.addEventListener('mouseup', (click) => {
    sceneManager.onMouseUp(click);
});


// Key listener: GLOBAL
document.addEventListener('keydown', (event) => {
    sceneManager.onKeyPressed(event);
});

document.addEventListener('visibilitychange', () => {
    sceneManager.onVisibilityStateChanged(document.visibilityState)
});

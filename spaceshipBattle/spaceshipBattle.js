import { AssetManager, FontAsset, ImageAsset, SoundAsset } from "./assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion, EntityFire, EntityText } from "./entity.js";
import { RoadManager } from "./roads.js";
import { Level, LevelManager } from "./levels.js"
import { SoundLooper, SoundPlayer } from "./sound.js";
import { SceneManager, SceneType } from "./scene.js";


// ------------------------------------- HTML ELEMENTS -------------------------------------

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');
var audioContext = new AudioContext(); // AudioContext must be initialized after interactions



const assetManager = new AssetManager(audioContext);
const soundPlayer = new SoundPlayer(assetManager, audioContext);
const sceneManager = new SceneManager(canvas, assetManager, soundPlayer);


// ------------------------------------- GAME DETAILS -------------------------------------

export const Stage = Object.freeze({
    LOAD_START: "LOAD_START",
    LOAD_COMPLETE: "LOAD_COMPLETE",
    INITIALIZING: "INITIALIZING",
    INSERT_COIN: "INSERT_COIN",
    AWAITING_PLAYER_START: "AWAITING_PLAYER_START",
    GAME_ACTIVE: "GAME_ACTIVE",
    GAME_OVER: "GAME_OVER"
});

var stage;

var gameFont = null;

var debugMode = false;


var lastRenderMillis = Date.now();

// ------------------------------------- CORE LOGIC -------------------------------------

var setup = function () {
    updateStage(Stage.LOAD_START);
    assetManager.loadAssets(() => {
        gameFont = new FontFace("micronian", assetManager.getFont(FontAsset.PRIMARY));
        document.fonts.add(gameFont);
        updateStage(Stage.LOAD_COMPLETE);
    });
}();


function initialize() {
    updateStage(Stage.INITIALIZING);
    updateStage(Stage.INSERT_COIN);
}


function beginGame() {
    update();
    render(context);
    requestAnimationFrame(beginGame);
}


function updateStage(newStage) {

    if (newStage != stage) {
        stage = newStage;
        log(`stage: ${stage}`);

        switch (stage) {

            case Stage.LOAD_START:
            case Stage.LOAD_COMPLETE:
                render(context);
                break;

            case Stage.INITIALIZING:
                break;

            case Stage.INSERT_COIN:
                sceneManager.setCurrentSceneType(SceneType.INTRO);
                break;

            case Stage.GAME_ACTIVE:
                sceneManager.setCurrentSceneType(SceneType.SELECT_ZONE);
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
        case Stage.INSERT_COIN:
        case Stage.GAME_ACTIVE:
        default:
            break;
    } 
}


function render(context) {

    sceneManager.render(context);

    switch (stage) {

        case Stage.LOAD_START:
            context.fillStyle = "#FFFFFF";
            context.font = "35px micronian";
            context.fillText("LOADING...", 50, 50);
            break;

        case Stage.LOAD_COMPLETE:
            context.fillStyle = "#FFFFFF";
            context.font = "35px micronian";
            context.fillText("LOADING...COMPLETE", 50, 50);
            context.fillText("Click to continue...", 50, 100);
            break;

        case Stage.INITIALIZING:
        case Stage.INSERT_COIN:
        case Stage.GAME_ACTIVE:
            break;
    }
}


function renderHUD(context) {

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


// Mouse DOWN
document.addEventListener('mousedown', (click) => {

    switch (stage) {

        case Stage.INITIALIZING:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            break;

        case Stage.LOAD_COMPLETE:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            initialize();
            beginGame();
            break;

        case Stage.INSERT_COIN:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            updateStage(Stage.GAME_ACTIVE);
            break;

        case Stage.GAME_ACTIVE:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            break;
    }

    sceneManager.onMouseDown(click);

});

// Mouse MOVE
document.addEventListener('mousemove', (event) => {

    switch (stage) {
        default:
            break;
    }

    sceneManager.onMouseMove(event);

});

// Mouse UP
document.addEventListener('mouseup', (click) => {
    sceneManager.onMouseUp(click);
});

document.addEventListener('keydown', (event) => {

    switch (event.key) {

        case 'd':
            toggleDebug();
            break;

        default:
            break;
    }

    sceneManager.onKeyPressed(click);
});

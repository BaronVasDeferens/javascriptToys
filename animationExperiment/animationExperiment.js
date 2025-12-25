import { AssetManager, FontAsset, ImageAsset, SoundAsset } from "./assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion, EntityFire } from "./entity.js";
import { RoadManager } from "./roads.js";
import { Level, LevelManager } from "./levels.js"
import { SoundLooper, SoundPlayer } from "./sound.js";


/**
 * 
 *  IDEAS
 * 

 */

var audioContext = new AudioContext(); // AudioContext must be initialized after interactions

const assetManager = new AssetManager(audioContext);
const soundPlayer = new SoundPlayer(assetManager, audioContext);

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');


// ------------------------------ GAME DETAILS -------------------------------------

export const Stage = Object.freeze({
    AWAITING_INTERACTION: "AWAITING_INTERACTION",
    INITIALIZING: "INITIALIZING",
    LOAD_START: "LOAD_START",
    LOAD_COMPLETE: "LOAD_COMPLETE",
    INSERT_COIN: "INSERT_COIN",
    AWAITING_PLAYER_START: "AWAITING_PLAYER_START",
    GAME_ACTIVE: "GAME_ACTIVE",
    GAME_OVER: "GAME_OVER"
});

var stage = Stage.AWAITING_INTERACTION;

var timers = [];

// TEMPORARY: entities that are not permanent but will persist for long than a single update/rendering cycle
var entitiesTemporary = [];

// TRANSIENT: entities that will cleared after a single update/rendering cycle.
var entitiesTransient = [];

var entitiesEnemies = [];
var projectilesPlayer = [];

// ------------------------- MAP & BACKGROUND ------------------------------------
const tileSize = 64;                            // in pixels
const tileRows = canvas.height / tileSize;
const tileCols = canvas.width / tileSize;

var backgroundImage = new Image();

var gameFont = null;

var frames = 0;
const renderBegin = Date.now();
var lastRenderMillis = Date.now();







// ----------------------------- DEBUGGING ----------------------------------

var debugMode = false;










// ---------------------------- CORE LOGIC -----------------------

var setup = function () {
    render(context);
}();

function onInitialUserInteraction() {
    updateStage(Stage.LOAD_START);
    render(context);
    assetManager.loadAssets(() => {
        gameFont = new FontFace("micronian", assetManager.getFont(FontAsset.PRIMARY));
        document.fonts.add(gameFont);
        updateStage(Stage.LOAD_COMPLETE);
    });
}

function initialize() {
    console.log("Initializing...");
    stage = Stage.INITIALIZING;
    entitiesEnemies = [];
    entitiesTemporary = [];
    entitiesTransient = [];
    projectilesPlayer = [];
    timers = [];

    updateStage(Stage.INSERT_COIN);
}

function beginGame() {
    let now = Date.now();
    update(now);
    render(context);
    requestAnimationFrame(beginGame);
}


function updateStage(newStage) {

    if (newStage != stage) {
        stage = newStage;
        console.log(`stage: ${stage}`);

        switch (stage) {

            case Stage.AWAITING_INTERACTION:
                break;

            case Stage.INITIALIZING:
                break;

            case Stage.LOAD_COMPLETE:
                render(context);
                break;

            case Stage.INSERT_COIN:

                projectilesPlayer = [];
                timers = [];
                entitiesEnemies = [];
                break;

            case Stage.GAME_ACTIVE:

                for (let i = 1; i < 10; i++) {
                    
                    entitiesEnemies.push(
                        new EntityFire(
                            0,
                            i * 64,
                            false,
                            i * 100,
                            assetManager
                        )
                    );

                    entitiesEnemies.push(
                        new EntityExplosion(
                            64,
                            i * 64,
                            false,
                            i * 100,
                            assetManager
                        )
                    );
                }

                break;

            default:
                break;
        }
    }
}

function update(delta) {

    switch (stage) {

        case Stage.AWAITING_INTERACTION:
            break;

        case Stage.LOAD_START:
        case Stage.LOAD_COMPLETE:
            break;

        case Stage.INSERT_COIN:

            break;

        case Stage.GAME_ACTIVE:
            entitiesEnemies.forEach(enemy => {
                enemy.update(delta);
            });
            break;

        default:
            break;
    }

    // Update timers...
    timers.forEach(timer => {
        timer.update(Date.now())
    });

    // Cull dead timers...
    timers = timers.filter(timer => {
        return timer.isActive == true
    });

}



function render(context) {

    context.fillStyle = "#000000ff";
    context.globalAlpha = 1.0;
    context.fillRect(0, 0, canvas.width, canvas.height);

    switch (stage) {

        case Stage.AWAITING_INTERACTION:
            context.fillStyle = "#FFFFFF";
            context.font = "35px micronian";
            context.fillText("ESRB WARNING", 50, 50);
            context.fillText("Click to continue...", 50, 100);
            break;

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

            entitiesTemporary.forEach(entity => {
                entity.render(context);
            });

            break;

        case Stage.GAME_ACTIVE:

            projectilesPlayer.forEach(projectile => {
                projectile.render(context);
            })

            entitiesEnemies.forEach(enemy => {
                enemy.render(context);
            });

            entitiesTemporary.forEach(ent => {
                ent.render(context);
            });

            entitiesTransient.forEach(transient => {
                transient.render(context)
            });

            entitiesTransient = [];

            renderHUD(context);

            break;
    }

}

function renderHUD(context) {

}

function toggleDebug() {
    debugMode = !debugMode;
    if (debugMode == true) {
        console.log(`debug: ON`);
    } else {
        console.log(`debug: OFF`);
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


// ------------------------ PLAYER INPUT -----------------------


// Mouse DOWN
document.addEventListener('mousedown', (click) => {

    switch (stage) {

        case Stage.AWAITING_INTERACTION:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            onInitialUserInteraction();
            break;

        case Stage.INITIALIZING:
            break;

        case Stage.LOAD_COMPLETE:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            updateStage(Stage.INSERT_COIN);
            initialize();
            beginGame();
            break;
        case Stage.INSERT_COIN:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            updateStage(Stage.GAME_ACTIVE);

            break;
    }

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
            toggleDebug();
            break;

        default:
            break;
    }
});

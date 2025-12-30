import { AssetManager, FontAsset, ImageAsset, SoundAsset } from "./assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion, EntityFire, EntityText } from "./entity.js";
import { RoadManager } from "./roads.js";
import { Level, LevelManager } from "./levels.js"
import { SoundLooper, SoundPlayer } from "./sound.js";


// ------------------------------------- HTML ELEMENTS -------------------------------------

var audioContext = new AudioContext(); // AudioContext must be initialized after interactions

const assetManager = new AssetManager(audioContext);
const soundPlayer = new SoundPlayer(assetManager, audioContext);

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');


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

// --- ENTITIES

// TEMPORARY: entities that are not permanent but will persist for long than a single update/rendering cycle
var entitiesTemporary = [];

// TRANSIENT: entities that will cleared after a single update/rendering cycle.
var entitiesTransient = [];

// ENEMIES: entities that can harm the player or be destoryed by projectiles. You know-- the baddies.
var entitiesEnemies = [];

// PROJECTILES (PLAYER): bullets originating from the player which may damage or destroy enemy entities
var projectilesPlayer = [];

// TIMERS: measures time and executes instructions once or at fixed intervals
var timers = [];

// --- MAP & BACKGROUND

const tileSize = 64;                            // in pixels
const tileRows = canvas.height / tileSize;
const tileCols = canvas.width / tileSize;

var backgroundImage = new Image();

var gameFont = null;

var debugMode = false;


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
        log(`stage: ${stage}`);

        switch (stage) {

            case Stage.LOAD_START:
            case Stage.LOAD_COMPLETE:
                render(context);
                break;

            case Stage.INITIALIZING:
                break;

            case Stage.INSERT_COIN:
                projectilesPlayer = [];
                timers = [];
                entitiesEnemies = [];

                // !!!!!! ANIMATION TEST !!!!!
                // Add some varibale speed entities

                for (let i = 1; i < 10; i++) {

                    entitiesTemporary.push(
                        new EntityFire(
                            0,
                            i * 64,
                            false,
                            i * 100,
                            assetManager
                        )
                    );

                    entitiesTemporary.push(
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

            case Stage.GAME_ACTIVE:
                break;

            default:
                break;
        }
    }
}


function update(delta) {

    switch (stage) {

        case Stage.LOAD_START:
        case Stage.LOAD_COMPLETE:
            break;

        case Stage.INSERT_COIN:
            entitiesTemporary.forEach(entity => {
                entity.update(delta);
            });
            break;

        case Stage.GAME_ACTIVE:
            entitiesTemporary.forEach(entity => {
                entity.update(delta);
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
            soundPlayer.playOneShot(SoundAsset.MACHINEGUN_2);
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

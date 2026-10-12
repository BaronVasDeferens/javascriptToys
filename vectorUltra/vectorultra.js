import { AssetManager, FontAsset } from "./assets.js";
import { SoundPlayer } from "./soundHelper.js";
import { SceneType } from "./scenes/Scene.js";
import { SceneManager } from "./scenes/SceneManager.js";

/**
 *
 *  VECTOR ULTRA
 *
 *  This file is now just the app host/bootstrap, modeled on jsGame/index.js:
 *  it owns the canvas, the AudioContext, asset/sound loading, the top-level
 *  requestAnimationFrame loop, and global DOM input listeners -- then hands
 *  everything else off to the SceneManager. All of the actual game logic
 *  (entities, road, level progression, HUD, gameplay input) now lives in
 *  scenes/vectorUltra/scene_vectorUltra.js as VectorUltraScene.
 *
 *  IDEAS
 *
 *      - more speed = more maneuverability but more damage
 *      - player must choose whether to prioritize speed/ammo/damage capacity
 *      - multiple kinds of vehicles with different damage thresholds and speeds
 *      - display QR code to download APK
 *
 *  TODO
 *
 *      ----------------------------------------------------------------------
 *      THE BASICS
 *
 *      - game over screen
 *      - "press to start" flashing prompt
 *      - ammunition readout
 *      - level readout: decaying bar shows time remaining in section

 *      - collectable drops: faster guns (start annoyingly slow), more maneuverability, health
 *
 *      - fill in road sections' "shoulder gaps" with rounded tile
 *
 *      -----------------------------------------------------------------------
 *      NEEDS WORK
 *
 *      - enemies: visual design
 *      - enemies: behavior ( + design)
 *      - machine guns
 *      - level management
 *
 *     -------------------------------------------------------------------------
 *     DONE-ZO!
 *      - intro music
 *      - in-road obstacles
 *      - detect damage
 *      - damage readout
 *      - light vibration when on shoulder
 *      - ported to the jsGame Scene/SceneManager framework
 */

// ------------------------------------- HTML ELEMENTS -------------------------------------

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');

var audioContext = new AudioContext(); // AudioContext must be initialized after interactions

const tileSize = 64;

const assetManager = new AssetManager(audioContext);
const soundPlayer = new SoundPlayer(assetManager, audioContext);
const sceneManager = new SceneManager(canvas, tileSize, assetManager, soundPlayer);

// ------------------------------------- GAME DETAILS -------------------------------------

export const Stage = Object.freeze({
    AWAITING_INTERACTION: "AWAITING_INTERACTION",
    LOAD_START: "LOAD_START",
    LOAD_COMPLETE: "LOAD_COMPLETE",
    GAME_ACTIVE: "GAME_ACTIVE"
});

var stage = Stage.AWAITING_INTERACTION;

var lastRenderMillis = Date.now();

// Safety net: clamp huge deltas (e.g. a backgrounded tab resuming after
// minutes) so entities/projectiles can't tunnel through obstacles in a
// single update tick. jsGame's own index.js doesn't clamp this either --
// worth carrying this fix back upstream at some point.
const maxDeltaMillis = 100;

// ---------------------------- CORE LOGIC -----------------------

var setup = function () {
    render(context);
}();

function onInitialUserInteraction() {
    updateStage(Stage.LOAD_START);
    render(context);
    assetManager.loadAssets(() => {
        let gameFont = new FontFace("micronian", assetManager.getFont(FontAsset.PRIMARY));
        document.fonts.add(gameFont);
        updateStage(Stage.LOAD_COMPLETE);
    });
}

function beginGame() {
    update();
    render(context);
    requestAnimationFrame(beginGame);
}

function updateStage(newStage) {

    if (newStage != stage) {
        stage = newStage;
        console.log(`stage: ${stage}`);

        switch (stage) {

            case Stage.LOAD_COMPLETE:
                render(context);
                break;

            case Stage.GAME_ACTIVE:
                sceneManager.initialize();
                sceneManager.setCurrentSceneType(SceneType.VECTOR_ULTRA);
                beginGame();
                break;

            default:
                break;
        }
    }
}

function update() {

    let delta = Math.min(Date.now() - lastRenderMillis, maxDeltaMillis);
    lastRenderMillis = Date.now();

    sceneManager.update(delta);
}

function render(contextPrimary) {

    switch (stage) {

        case Stage.AWAITING_INTERACTION:
            contextPrimary.fillStyle = "#000000";
            contextPrimary.fillRect(0, 0, canvas.width, canvas.height);
            contextPrimary.fillStyle = "#FFFFFF";
            contextPrimary.font = "35px micronian";
            contextPrimary.fillText("ESRB WARNING", 50, 50);
            contextPrimary.fillText("This game may be too rad. Click to continue...", 50, 100);
            break;

        case Stage.LOAD_START:
            contextPrimary.fillStyle = "#000000";
            contextPrimary.fillRect(0, 0, canvas.width, canvas.height);
            contextPrimary.fillStyle = "#FFFFFF";
            contextPrimary.font = "35px micronian";
            contextPrimary.fillText("LOADING...", 50, 50);
            break;

        case Stage.LOAD_COMPLETE:
            contextPrimary.fillStyle = "#000000";
            contextPrimary.fillRect(0, 0, canvas.width, canvas.height);
            contextPrimary.fillStyle = "#FFFFFF";
            contextPrimary.font = "35px micronian";
            contextPrimary.fillText("LOADING...COMPLETE", 50, 50);
            contextPrimary.fillText("Click to continue...", 50, 100);
            break;

        case Stage.GAME_ACTIVE:
            sceneManager.render(contextPrimary, null);
            break;

        default:
            break;
    }

}

// ------------------------ PLAYER INPUT -----------------------
// Bootstrap-level stage transitions (click-to-start / loading) are handled
// directly here, same as jsGame/index.js. Once GAME_ACTIVE, every input event
// is routed to whichever scene is active via the SceneManager.

document.addEventListener('mousedown', (click) => {

    switch (stage) {

        case Stage.AWAITING_INTERACTION:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            onInitialUserInteraction();
            break;

        case Stage.LOAD_COMPLETE:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            updateStage(Stage.GAME_ACTIVE);
            break;

        case Stage.GAME_ACTIVE:
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            sceneManager.onMouseDown(click);
            break;

        default:
            break;
    }

});

window.addEventListener('gamepadconnected', (event) => {
    console.log(`gamepad!!! ${JSON.stringify(event)}`);
});

document.addEventListener('keydown', (event) => {

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (stage == Stage.GAME_ACTIVE) {
        sceneManager.onKeyPressed(event);
    }
});

document.addEventListener('keyup', (event) => {

    if (stage == Stage.GAME_ACTIVE) {
        sceneManager.onKeyUp(event);
    }
});

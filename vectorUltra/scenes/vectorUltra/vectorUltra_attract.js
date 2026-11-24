import { ImageAsset, SoundAsset } from "../../Assets.js";
import { RoadManager } from "./Roads.js";
import { LevelManager } from "./Levels.js"
import { SoundGenerator, SoundLooper } from "../../SoundHelper.js";
import { Scene, SceneType } from "../Scene.js";

/**
 *
 *  VECTOR ULTRA
 *  Ported to the jsGame Scene/SceneManager framework.
 *
 *  The old vectorultra.js owned its own requestAnimationFrame loop, its own
 *  AssetManager/SoundPlayer, and a flat Stage enum that mixed app-bootstrap
 *  states (AWAITING_INTERACTION, LOAD_START, LOAD_COMPLETE) together with
 *  actual gameplay states (INSERT_COIN, GAME_ACTIVE, GAME_OVER).
 *
 *  Now: the bootstrap-only stages live in vectorultra.js (the thin app host,
 *  modeled on jsGame/index.js) and this file owns only the gameplay states,
 *  via GameState below. All the module-level `var`s from the original file
 *  became instance fields; all free functions became methods.
 *
 *  All entity/road movement now flows through update(deltaMillis) -- see
 *  FRAME_MS in entity.js for how the old per-frame pixel constants are kept
 *  meaningful under a real elapsed-time clock.
 * 
 * 
 * 
 * Gamepad test: https://luser.github.io/gamepadtest/
 * 
 * 
 */

const GameState = Object.freeze({
    INITIALIZING: "INITIALIZING",
    READY: "READY"
});

export const VisionMode = Object.freeze({
    NORMAL: 0,
    INFRARED: 1
});

export const WeaponStatus = Object.freeze({
    IDLE: "IDLE",
    FIRING: "FIRING",
});

/**
 * 
 * ------------------------------- IDEAS --------------------------------
 * 
 *      infiltrator smokes when damaged
 *      infiltrator emits warning tone on low health
 *      infiltrator has swivelling cannon on roof, controlled with right stick
 * 
 *      vehicle inertia
 *      muzzle flashes
 * 
 *      an enemy type that seeks the player
 * 
 *      enemies move SLOWER as the player goes FASTER
 * 
 *      one of the engine tone generators oscillates the faster with vehicle speed
 * 
 *      refresh-independent infiltrator motion deltas (can we combine this with vehicle inertia?)
 * 
 * 
 */



export class VectorUltraSceneAttract extends Scene {


    // ------------------------- MAP & BACKGROUND ------------------------------------

    tileSize = 64;                            // in pixels

    // ------------------------ FPS MANAGEMENT (debug HUD only) -----------------

    frames = 0;
    milliseconds = Date.now();

    targetFps = 60;
    targetPausedMsBetweenFrames = 1000 / this.targetFps;

    // -------------------- PLAYER STUFF ------------------------------

    speedMax = 32;
    speedMin = 5;
    speedDefault = 5;
    speedIncrement = 1;

    gamePad = null;


    constructor(gameCore, sceneManager, canvasPrimary, canvasSecondary, assetManager, soundPlayer) {

        super(gameCore, sceneManager, SceneType.VECTOR_ULTRA_ATRRACT, canvasPrimary, canvasSecondary, assetManager, soundPlayer);

        this.state = GameState.INITIALIZING;

        this.tileRows = this.canvasPrimary.height / this.tileSize;
        this.tileCols = this.canvasPrimary.width / this.tileSize;

        this.roadManager = new RoadManager(this.tileCols, this.tileRows, this.tileSize, this.assetManager);
        this.levelManager = new LevelManager();

        this.speedCurrent = this.speedDefault;
        this.speedLastUpdated = Date.now();

        this.backgroundImage = new Image();

        this.isDebug = false;
    }

    // ---------------------------- CORE LOGIC -----------------------

    onStart() {
        this.initialize();
    }

    onStop() {

    }

    initialize() {

        console.log("Initializing...");
        this.state = GameState.INITIALIZING;

        this.roadManager.init();
        this.levelManager.init(this.speedDefault);
        this.speedCurrent = this.speedDefault;

        this.updateState(GameState.READY);
    }

    dualSenseButtonMap = Object.freeze({
        "buttonX": 0,
        "buttonCircle": 1,
        "buttonSquare": 2,
        "buttonTriangle": 3,
        "bumperLeft": 4,
        "bumperRight": 5,
        "triggerLeft": 6,
        "triggerRight": 7
    })

    updateState(newState) {

        if (newState != this.state) {
            this.state = newState;
            console.log(`vectorUltra attract state: ${this.state}`);

            switch (this.state) {

                case GameState.INITIALIZING:
                    break;

                case GameState.READY:
                    break;

                default:
                    break;
            }
        }
    }

    update(deltaMillis) {

        switch (this.state) {

            case GameState.READY:

                this.roadManager.update(deltaMillis, this.levelManager);

                if (this.gameCore.gamePad != null && this.gameCore.gamePad.buttons[0].pressed == true) {
                    this.sceneManager.setCurrentSceneType(SceneType.VECTOR_ULTRA_GAME);
                }

                break;

            default:
                break;
        }

    }

    render(context) {

        context.fillStyle = "#000000";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height);

        switch (this.state) {

            case GameState.INITIALIZING:
                break;

            case GameState.READY:

                this.roadManager.render(context);
                context.drawImage(this.assetManager.getImage(ImageAsset.TITLE), 0, this.canvasPrimary.height / 6);

                context.drawImage(
                    this.assetManager.getImage(ImageAsset.TITLE),
                    0 + this.randomInRange(-5, 5),
                    (this.canvasPrimary.height / 6) + this.randomInRange(-5, 5),
                );

                break;

        }
    }

    randomInRange(min, max) {
        let range = Math.abs(max - min) + 1;
        return Math.floor(Math.random() * range) + min
    }


    // ------------------------ KEYBOARD INPUT -----------------------
    // Routed here from vectorultra.js via SceneManager.onKeyPressed()/onKeyUp(),
    // the same way jsGame routes input to whichever scene is active.

    onKeyPressed(event) {

        switch (this.state) {

            case GameState.READY:

                // transition to the next scene
                this.sceneManager.setCurrentSceneType(SceneType.VECTOR_ULTRA_GAME);
                break;

            default:
                break;
        }
    }
}

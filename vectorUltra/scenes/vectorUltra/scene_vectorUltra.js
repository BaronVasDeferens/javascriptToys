import { ImageAsset, SoundAsset } from "../../assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion, FRAME_MS } from "../../entity.js";
import { RoadManager } from "../../roads.js";
import { Level, LevelManager } from "../../levels.js"
import { SoundLooper } from "../../soundHelper.js";
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

export const GameState = Object.freeze({
    INITIALIZING: "INITIALIZING",
    INSERT_COIN: "INSERT_COIN",
    AWAITING_PLAYER_START: "AWAITING_PLAYER_START",
    GAME_ACTIVE: "GAME_ACTIVE",
    GAME_OVER: "GAME_OVER"
});

export const VisionMode = Object.freeze({
    NORMAL: 0,
    INFRARED: 1
});

export const WeaponStatus = Object.freeze({
    IDLE: "IDLE",
    FIRING: "FIRING",
});

// ------------------------- BACK-END I/O ----------------------------
// Preserved from the original file. Currently unused (beginWebSocket() is
// never called -- it wasn't in the original either), kept for parity.

class BackEndUpdateData {
    constructor(width, height, vibrations, state) {
        this.millis = Date.now(),
            this.width = width;
        this.height = height;
        this.vibrations = vibrations;
        this.stage = state;
    }
}

export class VectorUltraScene extends Scene {

    // ------------------------- MAP & BACKGROUND ------------------------------------
    tileSize = 64;                            // in pixels

    speedIncrement = .5;
    speedMax = 32;
    speedMin = 0;

    // ------------------------ FPS MANAGEMENT (debug HUD only) -----------------
    frames = 0;
    milliseconds = Date.now();

    targetFps = 60;
    targetPausedmsBetweenFrames = 1000 / this.targetFps;

    // -------------------- PLAYER STUFF ------------------------------
    healthMax = 10;

    // ----------------------------- WEBSOCKET ---------------------------------
    ip = "127.0.0.1";
    port = 8080;

    constructor(canvasPrimary, canvasSecondary, assetManager, soundPlayer) {
        super(SceneType.VECTOR_ULTRA, canvasPrimary, canvasSecondary, assetManager, soundPlayer);

        this.serverAddress = `ws://${this.ip}:${this.port}/registerMonitor`;
        this.socket = null;

        this.gamepad = null;

        this.state = GameState.INITIALIZING;

        this.timers = [];

        // TEMPORARY: entities that are not permanent but will persist for longer than a single update/rendering cycle
        this.entitiesTemporary = [];

        // TRANSIENT: entities that will be cleared after a single update/rendering cycle.
        this.entitiesTransient = [];

        this.entitiesEnemies = [];
        this.projectilesPlayer = [];

        this.tileRows = this.canvasPrimary.height / this.tileSize;
        this.tileCols = this.canvasPrimary.width / this.tileSize;

        this.roadManager = new RoadManager(this.tileCols, this.tileRows, this.tileSize, this.assetManager);

        this.speedDefault = 2;
        this.speedCurrent = this.speedDefault;

        this.levelManager = new LevelManager();

        this.backgroundImage = new Image();

        this.playerEntity = new Entity(0, 0, this.backgroundImage);

        this.healthCurrent = this.healthMax;
        this.isPlayerInvulnerable = false;

        this.visionMode = VisionMode.NORMAL;
        this.weaponStatus = WeaponStatus.IDLE;

        this.soundLooper = null;

        this.debugMode = false;
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
        this.entitiesEnemies = [];
        this.entitiesTemporary = [];
        this.entitiesTransient = [];
        this.projectilesPlayer = [];
        this.timers = [];

        this.soundLooper = new SoundLooper(SoundAsset.MACHINEGUN_3, this.assetManager, this.assetManager.audioContext);

        //this.beginWebSocket();

        this.roadManager.init();
        this.levelManager.init(this.speedDefault);

        this.updateState(GameState.INSERT_COIN);

        this.pollGamepad();
    }

    // Gamepad objects returned by navigator.getGamepads() are frozen snapshots --
    // they do NOT update in place, so this must be called every frame (from
    // update()) rather than once at startup, or button/stick state will never
    // change after the first read. Also picks the first CONNECTED pad rather
    // than just taking whichever slot came last: getGamepads() returns a
    // fixed-size slot array (commonly 4) padded with nulls for empty slots, so
    // blindly overwriting on every slot can stomp a real gamepad in slot 0
    // with null from an empty slot 1-3.
    pollGamepad() {
        if (this.gamepad != null) {
            return;
        }

        let gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] != null) {
                this.gamepad = gamepads[i];
                console.log(this.gamepad);
                return;
            }
        }

    }

    // --- BACK-END I/O (preserved, currently unused) ---

    beginWebSocket() {

        this.socket = new WebSocket(this.serverAddress);

        this.socket.onopen = () => {
            console.log(`>>> Connected to ${this.serverAddress}`);

            let update = new BackEndUpdateData(
                this.canvasPrimary.width,
                this.canvasPrimary.height,
                false,
                this.state);

            this.sendUpdateToBackEnd(update);
        };

        this.socket.onmessage = (event) => {
            this.processIncomingGameStateData(event.data);
        };

        this.socket.onclose = (event) => {
            console.log(">>> WebSocket connection CLOSED!");
            console.log(event);
            this.updateState(GameState.INSERT_COIN);
        };

        this.socket.onerror = (event) => {
            console.log(event);
        };

    }

    sendUpdateToBackEnd(update) {
        let payload = JSON.stringify(update);
        this.socket.send(payload);
    }

    sendVibration(vibeOn) {
        this.sendUpdateToBackEnd(
            new BackEndUpdateData(
                this.canvasPrimary.width,
                this.canvasPrimary.height,
                vibeOn,
                this.state
            )
        )
    }

    processIncomingGameStateData(update) {

        let data = JSON.parse(update);

        // If no controllers are present, the game cannot begin
        let controllerIds = data.controllerIds;
        if (controllerIds == null || controllerIds.length <= 0) {
            this.updateState(GameState.INSERT_COIN);
        } else {
            switch (this.state) {

                case GameState.INSERT_COIN:
                case GameState.AWAITING_PLAYER_START:

                    this.updateState(GameState.GAME_ACTIVE);
                    break;

                case GameState.GAME_ACTIVE:
                    if (data.playerPositions != null) {
                        data.playerPositions.forEach(update => {
                            this.updatePlayerPosition(update);
                            this.updateVisionStatus(update);
                            this.updateWeaponStatus(update);
                        });
                    }
                    break;
            }
        }
    }

    /*

    data class PlayerControllerInput(
        val playerId: String,
        val millis: Long,
        val deltaX: Float,
        val deltaY: Float,
        val visionMode: VisionModeStatus,
        val weaponStatus: WeaponStatus
    )

    */

    updatePlayerPosition(playerPos) {
        this.playerEntity.x -= (4 * playerPos.deltaX);
        this.playerEntity.y -= (4 * playerPos.deltaY);

        // Bounds checking -- keep the player on screen

        // Top & bottom
        if (this.playerEntity.y + this.playerEntity.image.height > this.canvasPrimary.height) {
            this.playerEntity.y = this.canvasPrimary.height - this.playerEntity.image.height;
        } else if (this.playerEntity.y < 0) {
            this.playerEntity.y = 0;
        }

        // Left & right
        if (this.playerEntity.x < 0) {
            this.playerEntity.x = 0;
        } else if (this.playerEntity.x > this.canvasPrimary.width - this.playerEntity.image.width) {
            this.playerEntity.x = this.canvasPrimary.width - this.playerEntity.image.width;
        }
    }

    toggleVisionMode() {
        if (this.visionMode == VisionMode.NORMAL) {
            this.updateVisionStatus(VisionMode.INFRARED);
        } else {
            this.updateVisionStatus(VisionMode.NORMAL);
        }
    }

    updateWeaponStatus(update) {
        if (update.weaponStatus != this.weaponStatus) {
            this.weaponStatus = update.weaponStatus;

            if (this.weaponStatus == WeaponStatus.FIRING) {
                this.soundLooper.play();
            } else {
                this.soundLooper.stop();
                this.soundPlayer.playOneShot(SoundAsset.MACHINEGUN_TRAIL);
            }
        }
    }

    updateVisionStatus(mode) {

        if (mode != null && mode != this.visionMode) {
            this.visionMode = mode;
            console.log(this.visionMode)
        }
    }

    updateState(newState) {

        if (newState != this.state) {
            this.state = newState;
            console.log(`vectorUltra state: ${this.state}`);

            switch (this.state) {

                case GameState.INITIALIZING:
                    break;

                case GameState.INSERT_COIN:

                    //this.soundPlayer.playBackgroundMusic(SoundAsset.THEME_1);

                    this.speedCurrent = this.speedDefault;
                    this.levelManager.init(this.speedDefault);
                    this.roadManager.updateSpeed(this.speedDefault);

                    this.healthCurrent = this.healthMax;

                    this.projectilesPlayer = [];

                    this.timers.forEach(timer => {
                        timer.isActive = false;
                    });
                    this.timers = [];

                    this.entitiesEnemies.forEach(enemy => {
                        enemy.isOffScreen = true;
                    });
                    this.entitiesEnemies = [];
                    break;

                case GameState.GAME_ACTIVE:
                    this.entitiesEnemies = [];
                    this.entitiesTemporary = [];
                    this.timers.forEach(timer => {
                        timer.isActive = false;
                    });
                    this.timers = [];
                    this.roadManager.setRoadProperties(this.tileCols, this.tileRows, 5, 3);
                    this.playerEntity = new Entity(
                        this.canvasPrimary.width / 2,
                        this.canvasPrimary.height / 2,
                        this.assetManager.getImage(ImageAsset.INFILTRATOR));
                    this.setPlayerInvulnerable(3);

                    let levelZero = this.levelManager.getCurrentLevel();

                    this.roadManager.updateSpeed(levelZero.speed);

                    // -------------- ADD BADDIES AT A FIXED RATE ---------------------
                    this.timers.push(
                        new TimedLooper(
                            1000,
                            () => { this.addEnemy() }
                        )
                    )

                    break;
                default:
                    break;
            }
        }
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

    update(deltaMillis) {

        let frameScale = deltaMillis / FRAME_MS;

        switch (this.state) {

            case GameState.INSERT_COIN:
                this.roadManager.update(deltaMillis, null);
                this.entitiesEnemies.forEach(enemy => {
                    if (enemy instanceof EntityRoadFollower) {

                        enemy.update(deltaMillis, this.roadManager);

                        // OBSTACLE COLLISION DETECTION
                        let highlightedSections = this.roadManager.findRoadSectionsForEntityPosition(enemy);
                        if (highlightedSections.length > 0) {
                            highlightedSections.forEach(section => {
                                if (section.isCollideWithObstacle(enemy)) {
                                    enemy.x += this.randomInRange(-10, 10);
                                    enemy.y += this.randomInRange(-10, 10);
                                }
                            })
                        }
                    }
                });

                if (this.gamepad != null && this.gamepad.buttons[0].pressed == true) {
                    this.updateState(GameState.GAME_ACTIVE);
                }

                break;

            case GameState.GAME_ACTIVE:

                if (this.gamepad != null) {

                    // PLAYER FIRING?
                    let firing = this.gamepad.buttons[this.dualSenseButtonMap.buttonX].pressed == true;
                    if (firing) {
                        this.updateWeaponStatus({ weaponStatus: WeaponStatus.FIRING })
                    } else {
                        this.updateWeaponStatus({ weaponStatus: WeaponStatus.IDLE })
                    }

                    // PLAYER MOVING?
                    // d-pad: up / down
                    if (this.gamepad.buttons[12].pressed == true) {
                        this.updatePlayerPosition(
                            {
                                deltaX: 0,
                                deltaY: 1 * frameScale
                            }
                        )
                    } else if (this.gamepad.buttons[13].pressed == true) {
                        this.updatePlayerPosition(
                            {
                                deltaX: 0,
                                deltaY: -1 * frameScale
                            }
                        )
                    }

                    // d-pad: left / right
                    if (this.gamepad.buttons[14].pressed == true) {
                        this.updatePlayerPosition(
                            {
                                deltaX: 1 * frameScale,
                                deltaY: 0
                            }
                        )
                    } else if (this.gamepad.buttons[15].pressed == true) {
                        this.updatePlayerPosition(
                            {
                                deltaX: -1 * frameScale,
                                deltaY: 0
                            }
                        )
                    }
                }

                this.roadManager.update(deltaMillis, this.levelManager);
                this.projectilesPlayer.forEach(projectile => {
                    projectile.update(deltaMillis);
                    let highlightedSections = this.roadManager.findRoadSectionsForEntityPosition(projectile);
                    if (highlightedSections.length > 0) {
                        highlightedSections.forEach(section => {
                            if (section.isCollideWithObstacle(projectile)) {
                                projectile.isAlive = false;
                            }
                        })
                    }

                    // BULLETS vs MONSTERS
                    this.entitiesEnemies.forEach(enemy => {
                        if (enemy.isCollideWithEntity(projectile)) {
                            this.soundPlayer.playOneShotWithDetuneRange(SoundAsset.EXPLOSION_1, -500, 500);
                            enemy.isAlive = false;
                            projectile.isAlive = false;
                            this.entitiesTemporary.push(
                                new EntityExplosion(enemy, 0, this.speedCurrent, this.assetManager)
                            );
                        }
                    })
                });

                this.projectilesPlayer = this.projectilesPlayer.filter(projectile => {
                    return projectile.isAlive == true
                });

                if (this.weaponStatus == WeaponStatus.FIRING) {
                    this.projectilesPlayer.push(
                        new Projectile(
                            this.playerEntity.x + this.randomInRange(-2,2),     // add some "jitter"
                            this.playerEntity.y,                                // start at player's y coordinate
                            0,                                                  // delta x
                            (50 + this.speedCurrent) * -1,                      // delta y
                            this.assetManager
                        )
                    )
                }

                this.entitiesEnemies.forEach(enemy => {
                    if (enemy instanceof EntityRoadFollower) {
                        enemy.update(deltaMillis, this.roadManager);
                        // OBSTACLE COLLISION DETECTION
                        let highlightedSections = this.roadManager.findRoadSectionsForEntityPosition(enemy);
                        if (highlightedSections.length > 0) {
                            highlightedSections.forEach(section => {
                                if (section.isCollideWithObstacle(enemy)) {
                                    enemy.x += this.randomInRange(-10, 10);
                                    enemy.y += this.randomInRange(-10, 10);
                                }
                            })
                        }

                    } else {
                        enemy.update(deltaMillis);
                    }

                    // --- MONSTER COLLISIONS
                    if (enemy.isAlive == true && enemy.isCollideWithEntity(this.playerEntity)) {
                        //this.sendVibration(true);
                        this.handleEntityCollision(enemy);
                    }
                });


                this.entitiesEnemies = this.entitiesEnemies.filter(enemy => {
                    return enemy.isAlive == true && enemy.isOffScreen == false
                });

                // PLAYER: OBSTACLE COLLISION DETECTION / INVULNERABLE FRAMES
                let highlightedSections = this.roadManager.findRoadSectionsForEntityPosition(this.playerEntity);
                if (highlightedSections.length > 0) {
                    highlightedSections.forEach(section => {
                        if (section.isCollideWithObstacle(this.playerEntity)) {
                            this.handleObstacleCollision();
                        } else if (section.isOffRoad(this.playerEntity)) {
                            // Going off-road makes the vehicle squirrely
                            this.playerEntity.x += this.randomInRange(-1, 1);
                            this.playerEntity.y += this.randomInRange(-1, 1);
                        }

                    })
                }

                this.entitiesTemporary.forEach(entity => {
                    entity.update(deltaMillis)
                });

                this.entitiesTemporary = this.entitiesTemporary.filter(entity => {
                    return entity.isAlive == true
                });
                break;

            default:
                break;
        }

        // Update timers...
        // (Timer/TimedLooper are wall-clock based by design -- see entity.js --
        // so they still take Date.now() rather than deltaMillis.)
        this.timers.forEach(timer => {
            timer.update(Date.now())
        });

        // Cull dead timers...
        this.timers = this.timers.filter(timer => {
            return timer.isActive == true
        });

        // Cull dead enemies
        this.entitiesEnemies = this.entitiesEnemies.filter(enemy => {
            return enemy.isOffScreen == false
        })

    }

    handleObstacleCollision() {

        let jitter = 3

        //this.sendVibration(true);

        if (this.isPlayerInvulnerable == true) {
            // Ignore damage while invulnerable
        } else {

            // !!! Collision!!!
            // Punt the player in a random direction...
            this.playerEntity.x += this.randomInRange(-jitter, jitter);
            this.playerEntity.y += this.randomInRange(-jitter, jitter);

            //this.gamepad.hapticActuators[0].pulse(1.0, 200);

            // ...penalize health...
            this.healthCurrent--;

            // ... and give them a moment's grace
            this.setPlayerInvulnerable(1)
        }
    }

    handleEntityCollision(entity) {
        //this.sendVibration(true);

        if (this.isPlayerInvulnerable == true) {
            // Ignore damage while invulnerable
        } else {
            // !!! Collision!!!
            // Punt the player in a random direction...
            this.playerEntity.x += this.randomInRange(-5, 5);
            this.playerEntity.y += this.randomInRange(-5, 5);

            // ...penalize health...
            this.healthCurrent--;

            // ... and give them a moment's grace
            this.setPlayerInvulnerable(1)
        }
    }

    // Returns TRUE if the game is over
    checkForGameOver() {
        return false
    }

    render(context) {

        context.fillStyle = "#000000";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height);

        switch (this.state) {

            case GameState.INITIALIZING:
            case GameState.INSERT_COIN:
                this.roadManager.render(context);
                context.drawImage(this.assetManager.getImage(ImageAsset.TITLE), 0, this.canvasPrimary.height / 6);

                context.drawImage(
                    this.assetManager.getImage(ImageAsset.TITLE),
                    0 + this.randomInRange(-5, 5),
                    (this.canvasPrimary.height / 6) + this.randomInRange(-5, 5),
                )

                this.entitiesEnemies.filter(enemy => {
                    return enemy.isAlive == true
                }).forEach(enemy => {
                    enemy.render(context);
                });

                this.entitiesTemporary.forEach(entity => {
                    entity.render(context);
                })
                break;

            case GameState.GAME_ACTIVE:

                this.roadManager.render(context);

                this.projectilesPlayer.forEach(projectile => {
                    projectile.render(context);
                })

                this.entitiesEnemies.forEach(enemy => {
                    enemy.render(context);
                });

                this.entitiesTemporary.forEach(ent => {
                    ent.render(context);
                });

                this.playerEntity.render(context);

                this.entitiesTransient.forEach(transient => {
                    transient.render(context)
                });

                this.entitiesTransient = [];
                this.renderHUD(context);
                if (this.debugMode == true) {
                    this.renderDebug(context);
                }
                break;
        }

    }

    renderHUD(context) {
        context.strokeStyle = "#FFFFFF";
        context.fillStyle = "#FFFFFF";

        for (let n = 1; n <= this.healthMax; n++) {
            if (n <= this.healthCurrent) {
                context.fillRect(n * 40, 20, 20, 20);
            } else {
                context.strokeRect(n * 40, 20, 20, 20);
            }
        }

        // let visionReadout;
        // if (this.visionMode == VisionMode.NORMAL) {
        //     visionReadout = this.assetManager.getImage(ImageAsset.VISION_NIGHT_MODE);
        // } else {
        //     visionReadout = this.assetManager.getImage(ImageAsset.VISION_INFRARED_MODE);
        // }
        // context.drawImage(visionReadout, 20, 60);
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        if (this.debugMode == true) {
            console.log(`debug: ON`);
        } else {
            console.log(`debug: OFF`);
        }
    }

    renderDebug(context) {

        this.frames++;
        let now = Date.now();
        let delta = now - this.milliseconds;
        if (delta >= 1000) {
            this.frames = 0;
            this.milliseconds = now;
        } else {
            let framesPerSecond = Math.floor(this.frames / (delta / 1000));
            context.fillStyle = "#FFFFFF";
            context.font = "16px arial";
            context.fillText(`fps: ${framesPerSecond}`, 50, 100);
        }

        // let highlightedSections = this.roadManager.findRoadSectionsForEntityPosition(this.playerEntity);
        // if (highlightedSections.length > 0) {

        //     highlightedSections.forEach(section => {
        //         if (this.debugMode) {
        //             context.strokeStyle = "#FF0000";
        //             context.strokeRect(0, section.yOffset, 1024, 64);
        //         }
        //     })
        // }

    }

    randomInRange(min, max) {
        let range = Math.abs(max - min) + 1;
        return Math.floor(Math.random() * range) + min
    }

    setPlayerInvulnerable(seconds) {

        // ...play a sound...
        this.soundPlayer.playOneShot(SoundAsset.CRASH_2);

        // Give the player a few seconds of invulnerability
        this.isPlayerInvulnerable = true;

        let invulnerableMillis = seconds * 1000;
        let divisions = 100;
        let now = Date.now();

        // Push pairs of timers (one of on, one for off) into the timer queue
        // which cause the player's car to blink for a few moments
        for (let i = 1; i < (invulnerableMillis / divisions) / 2; i++) {

            this.timers.push(
                new Timer(
                    now,
                    now + (((i * 2) - 1) * divisions),
                    () => { },
                    () => {
                        this.playerEntity.alpha = 0.25;
                    }
                )
            )

            this.timers.push(
                new Timer(
                    now,
                    now + (((i * 2)) * divisions),
                    () => { },
                    () => {
                        this.playerEntity.alpha = 1.00;
                    }
                )
            )
        }

        // Finally, add a timer to remove the invulnerable state
        // and restore opacity / alpha
        this.timers.push(
            new Timer(
                Date.now(),
                Date.now() + invulnerableMillis + 100,
                () => { }, // on every update
                () => {   // on finish
                    this.isPlayerInvulnerable = false;
                    this.playerEntity.alpha = 1.0;
                }
            )
        )
    }

    addEnemy() {

        let startX = 0;
        let startY = 0;
        let dX = 0;
        let dY = 0;

        let chance = Math.floor(Math.random() * 2);
        switch (chance) {
            case 0:

                switch (Math.floor(Math.random() * 4)) {
                    case 0:
                        // Top down (same as road)
                        startX = this.randomInRange(10, this.canvasPrimary.width - 10);
                        startY = -10;
                        dX = 0;
                        dY = this.randomInRange(2, 6);
                        break;
                    case 1:
                        // bottom up
                        startX = this.randomInRange(10, this.canvasPrimary.width - 10)
                        startY = this.canvasPrimary.height - 10;
                        dX = 0;
                        dY = -2;
                        break;
                    case 2:
                        // left to right
                        startX = 1;
                        startY = Math.floor(Math.random() * this.canvasPrimary.height);
                        dX = 2;
                        dY = 0;
                        break;
                    case 3:
                        // right to left
                        startX = this.canvasPrimary.width - 10;
                        startY = Math.floor(Math.random() * this.canvasPrimary.height);
                        dX = -1;
                        dY = 0;
                        break;
                }

                this.entitiesEnemies.push(new EntityEnemy(
                    startX,
                    startY,
                    this.assetManager.getImage(ImageAsset.ENEMY_MUTANT_1),
                    dX,
                    dY,
                    this.canvasPrimary.width,
                    this.canvasPrimary.height
                ));


                break;
            case 1:

                /**
                 * These enemies should come in from the sides and
                 * begin to occupy the lower sections of the road, forcing
                 * the player to either drive closer to the top or engage
                 * the monsters.
                 */


                let lastFollower = this.entitiesEnemies.filter(enemy => {
                    return enemy instanceof EntityRoadFollower
                }).sort((a, b) => {
                    if (a.y < b.y) {
                        return -1
                    } else if (a.y > b.y) {
                        return 1
                    } else {
                        return 0
                    }
                })[0];

                if (lastFollower != null) {
                    startY = lastFollower.y - this.tileSize
                } else {
                    startY = (this.canvasPrimary.height) - (this.tileSize * 3)
                }

                this.entitiesEnemies.push(new EntityRoadFollower(
                    Math.floor(Math.random() * 2) * this.canvasPrimary.width,
                    startY,                                         // not TOO close to the bottom!
                    this.assetManager.getImage(ImageAsset.ENEMY_SPIDER_1)
                ));

                break;
        }
    }

    // ------------------------ PLAYER INPUT -----------------------
    // Routed here from vectorultra.js via SceneManager.onKeyPressed()/onKeyUp(),
    // the same way jsGame routes input to whichever scene is active.

    onKeyPressed(event) {

        switch (this.state) {

            case GameState.INSERT_COIN:
                this.updateState(GameState.GAME_ACTIVE);
                break;

            case GameState.GAME_ACTIVE:

                switch (event.code) {

                    case "KeyA":
                        this.updatePlayerPosition(
                            {
                                deltaX: 5,
                                deltaY: 0
                            }
                        )
                        break;

                    case "KeyD":
                        this.updatePlayerPosition(
                            {
                                deltaX: -5,
                                deltaY: 0
                            }
                        )
                        break;

                    case "KeyW":
                        this.updatePlayerPosition(
                            {
                                deltaX: 0,
                                deltaY: 5
                            }
                        )
                        break;

                    case "KeyS":
                        this.updatePlayerPosition(
                            {
                                deltaX: 0,
                                deltaY: -5
                            }
                        )
                        break;

                    case "Space":
                        this.updateWeaponStatus(
                            { weaponStatus: WeaponStatus.FIRING }
                        );
                        break;

                    case "KeyV":
                        this.toggleVisionMode();
                        break;

                    case "KeyP":
                        this.toggleDebug();
                        break;

                    case "NumpadAdd":
                        this.speedCurrent += this.speedIncrement;
                        this.roadManager.updateDebugSpeedDelta(this.speedCurrent);
                        console.log(`speed up: ${this.speedCurrent}`);
                        break;

                    case "NumpadSubtract":
                        this.speedCurrent -= this.speedIncrement;
                        this.roadManager.updateDebugSpeedDelta(this.speedCurrent);
                        console.log(`speed down: ${this.speedCurrent}`);
                        break;

                    case "Escape":
                        this.initialize();
                        break;

                    default:
                        console.log(event.code)
                        break;
                }
                break;

            default:
                break;
        }
    }

    onKeyUp(event) {

        switch (this.state) {

            case GameState.GAME_ACTIVE:

                switch (event.code) {

                    case "Space":
                        this.updateWeaponStatus(
                            { weaponStatus: WeaponStatus.IDLE }
                        );
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    }
}

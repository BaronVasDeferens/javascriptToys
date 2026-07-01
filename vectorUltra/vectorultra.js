import { AssetManager, FontAsset, ImageAsset, SoundAsset } from "./assets.js";
import { Entity, EntityEnemy, Timer, TimedLooper, EntityRoadFollower, Projectile, EntityExplosion } from "./entity.js";
import { RoadManager } from "./roads.js";
import { Level, LevelManager } from "./levels.js"
import { SoundLooper, SoundPlayer } from "./soundHelper.js";


/**
 * 
 *  IDEAS
 * 
 *      - more speed = more maneuverability but more damage
 *      - player must choose whether to prioritize speed/ammo/damage capcity
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

var roadManager = new RoadManager(tileCols, tileRows, tileSize, assetManager);

const speedDefault = 2;
var speedCurrent = speedDefault;
const speedIncrement = .5;

const levelManager = new LevelManager();

const speedMax = 32;
const speedMin = 0;

var backgroundImage = new Image();

var gameFont = null;

// ------------------------ FPS MANAGEMENT -----------------------

var frames = 0;
var milliseconds = Date.now();

const targetFps = 60;
const targetPausedmsBetweenFrames = 1000 / targetFps;



// -------------------- PLAYER STUFF ------------------------------

var playerEntity = new Entity(0, 0, backgroundImage);

const healthMax = 10;
var healthCurrent = 10;
var isPlayerInvulnerable = false;

export const VisionMode = Object.freeze({
    NORMAL: 0,
    INFRARED: 1
});

var visionMode = VisionMode.NORMAL;

export const WeaponStatus = Object.freeze({
    IDLE: "IDLE",
    FIRING: "FIRING",
});

var weaponStatus = WeaponStatus.IDLE;

var soundLooper = null;

// ----------------------------- DEBUGGING ----------------------------------

var debugMode = false;


// ----------------------------- WEBSOCKET ---------------------------------

const ip = "127.0.0.1";
const port = 8080;
const serverAddress = `ws://${ip}:${port}/registerMonitor`
var socket;

// ------------------------- BACK-END I/O ----------------------------

class BackEndUpdateData {
    constructor(width, height, vibrations, stage) {
        this.millis = Date.now(),
            this.width = width;
        this.height = height;
        this.vibrations = vibrations;
        this.stage = stage;
    }
}

function beginWebSocket() {

    // Creates new WebSocket object with a ws URI as the parameter
    socket = new WebSocket(serverAddress);

    // Fired when a connection with a WebSocket is opened
    socket.onopen = function () {
        console.log(`>>> Connected to ${serverAddress}`);

        let update = new BackEndUpdateData(
            canvas.width,
            canvas.height,
            false,
            stage);

        sendUpdateToBackEnd(update);
    };

    // Fired when data is received through a WebSocket
    socket.onmessage = function (event) {
        processIncomingGameStateData(event.data);
    };

    // Fired when a connection with a WebSocket is closed
    socket.onclose = function (event) {
        console.log(">>> WebSocket connection CLOSED!");
        console.log(event);
        updateStage(Stage.INSERT_COIN);
    };

    // Fired when a connection with a WebSocket has been closed because of an error
    socket.onerror = function (event) {
        console.log(event);
    };

}

function sendUpdateToBackEnd(update) {
    let payload = JSON.stringify(update);
    socket.send(payload);
}

function sendVibration(vibeOn) {
    sendUpdateToBackEnd(
        new BackEndUpdateData(
            canvas.width,
            canvas.height,
            vibeOn,
            stage
        )
    )
}

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

    soundLooper = new SoundLooper(SoundAsset.MACHINEGUN_2, assetManager, audioContext);

    //beginWebSocket();

    roadManager.init();
    levelManager.init(speedDefault);

    updateStage(Stage.INSERT_COIN);
}

function beginGame() {
    update();
    render(context);
    requestAnimationFrame(beginGame);
}

function processIncomingGameStateData(update) {

    // console.log(update)

    let data = JSON.parse(update);

    // If no controllers are present, the game cannot begin
    let controllerIds = data.controllerIds;
    if (controllerIds == null || controllerIds.length <= 0) {
        updateStage(Stage.INSERT_COIN);
    } else {
        switch (stage) {

            case Stage.INSERT_COIN:
            case Stage.AWAITING_PLAYER_START:

                updateStage(Stage.GAME_ACTIVE);
                break;

            case Stage.GAME_ACTIVE:
                if (data.playerPositions != null) {
                    data.playerPositions.forEach(update => {
                        updatePlayerPosition(update);
                        updateVisionStatus(update);
                        updateWeaponStatus(update);
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

function updatePlayerPosition(playerPos) {
    playerEntity.x -= (4 * playerPos.deltaX);
    playerEntity.y -= (4 * playerPos.deltaY);

    // Bounds checking -- keep the player on screen

    // Bottom & bottom
    if (playerEntity.y + playerEntity.image.height > canvas.height) {
        playerEntity.y = canvas.height - playerEntity.image.height;
    } else if (playerEntity.y < 0) {
        playerEntity.y = 0;
    }

    // Left & right
    if (playerEntity.x < 0) {
        playerEntity.x = 0;
    } else if (playerEntity.x > canvas.width - playerEntity.image.width) {
        playerEntity.x = canvas.width - playerEntity.image.width;
    }
}

function updateWeaponStatus(update) {
    if (update.weaponStatus != weaponStatus) {
        weaponStatus = update.weaponStatus;

        if (weaponStatus == WeaponStatus.FIRING) {
            soundLooper.play();
        } else {
            soundLooper.stop();
            soundPlayer.playOneShot(SoundAsset.MACHINEGUN_TRAIL);
        }
    }
}

function updateVisionStatus(update) {
    let newMode = VisionMode[update.visionMode];
    if (newMode != null && newMode != visionMode) {
        visionMode = newMode;
    }
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

                soundPlayer.playBackgroundMusic(SoundAsset.THEME_1);

                speedCurrent = speedDefault;
                levelManager.init(speedDefault);
                roadManager.updateSpeed(speedDefault);

                healthCurrent = healthMax;

                projectilesPlayer = [];

                timers.forEach(timer => {
                    timer.isActive = false;
                });
                timers = [];

                entitiesEnemies.forEach(enemy => {
                    enemy.isOffScreen = true;
                });
                entitiesEnemies = [];
                break;

            case Stage.GAME_ACTIVE:
                entitiesEnemies = [];
                entitiesTemporary = [];
                timers.forEach(timer => {
                    timer.isActive = false;
                });
                timers = [];
                roadManager.setRoadProperties(tileCols, tileRows, 5, 3);
                playerEntity = new Entity(
                    canvas.width / 2,
                    canvas.height / 2,
                    assetManager.getImage(ImageAsset.INFILTRATOR));
                setPlayerInvulnerable(3);

                let levelZero = levelManager.getCurrentLevel();

                roadManager.updateSpeed(levelZero.speed);

                // -------------- ADD BADDIES AT A FIXED RATE ---------------------
                timers.push(
                    new TimedLooper(
                        1000,
                        function () { addEnemy() }
                    )
                )

                break;
            default:
                break;
        }
    }
}

function update() {

    switch (stage) {

        case Stage.AWAITING_INTERACTION:
            break;

        case Stage.LOAD_START:
        case Stage.LOAD_COMPLETE:
            break;

        case Stage.INSERT_COIN:
            roadManager.update(null);
            entitiesEnemies.forEach(enemy => {
                if (enemy instanceof EntityRoadFollower) {

                    enemy.update(Date.now(), roadManager);

                    // OBSTACLE COLLISION DETECTION 
                    let highlightedSections = roadManager.findRoadSectionsForEntityPosition(enemy);
                    if (highlightedSections.length > 0) {
                        highlightedSections.forEach(section => {
                            if (section.isCollideWithObstacle(enemy)) {
                                enemy.x += randomInRange(-10, 10);
                                enemy.y += randomInRange(-10, 10);
                            }
                        })
                    }
                }
            });
            break;

        case Stage.GAME_ACTIVE:
            roadManager.update(levelManager);
            projectilesPlayer.forEach(projectile => {
                projectile.update();
                let highlightedSections = roadManager.findRoadSectionsForEntityPosition(projectile);
                if (highlightedSections.length > 0) {
                    highlightedSections.forEach(section => {
                        if (section.isCollideWithObstacle(projectile)) {
                            projectile.isAlive = false;
                        }
                    })
                }

                // BULLETS vs MONSTERS
                entitiesEnemies.forEach(enemy => {
                    if (enemy.isCollideWithEntity(projectile)) {
                        soundPlayer.playOneShotWithDetuneRange(SoundAsset.EXPLOSION_1, -500, 500);
                        enemy.isAlive = false;
                        projectile.isAlive = false;
                        entitiesTemporary.push(
                            new EntityExplosion(enemy, 0, speedCurrent, assetManager)
                        );
                    }
                })
            });

            projectilesPlayer = projectilesPlayer.filter(projectile => {
                return projectile.isAlive == true
            });

            if (weaponStatus == WeaponStatus.FIRING) {
                projectilesPlayer.push(
                    new Projectile(
                        playerEntity.x,
                        playerEntity.y,
                        0,
                        (20 + speedCurrent) * -1,
                        assetManager
                    )
                )
            }

            entitiesEnemies.forEach(enemy => {
                if (enemy instanceof EntityRoadFollower) {
                    enemy.update(Date.now(), roadManager);
                    // OBSTACLE COLLISION DETECTION
                    let highlightedSections = roadManager.findRoadSectionsForEntityPosition(enemy);
                    if (highlightedSections.length > 0) {
                        highlightedSections.forEach(section => {
                            if (section.isCollideWithObstacle(enemy)) {
                                enemy.x += randomInRange(-10, 10);
                                enemy.y += randomInRange(-10, 10);
                            }
                        })
                    }

                } else {
                    enemy.update();
                }

                // --- MONSTER COLLISIONS
                if (enemy.isAlive == true && enemy.isCollideWithEntity(playerEntity)) {
                    sendVibration(true);
                    handleEntityCollision(enemy);
                }
            });


            entitiesEnemies = entitiesEnemies.filter(enemy => {
                return enemy.isAlive == true && enemy.isOffScreen == false
            });

            // PLAYER: OBSTACLE COLLISION DETECTION / INVULNERABLE FRAMES
            let highlightedSections = roadManager.findRoadSectionsForEntityPosition(playerEntity);
            if (highlightedSections.length > 0) {
                highlightedSections.forEach(section => {
                    if (section.isCollideWithObstacle(playerEntity)) {
                        handleObstacleCollision()
                    } else if (section.isOffRoad(playerEntity)) {
                        // Going off-road makes the vehicle squirrely
                        playerEntity.x += randomInRange(-1, 1);
                        playerEntity.y += randomInRange(-1, 1);
                    }

                })
            }

            entitiesTemporary.forEach(entity => {
                entity.update(Date.now())
            });

            entitiesTemporary = entitiesTemporary.filter(entity => {
                return entity.isAlive == true
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

    // Cull dead enemies
    entitiesEnemies = entitiesEnemies.filter(enemy => {
        return enemy.isOffScreen == false
    })

}

function handleObstacleCollision() {

    sendVibration(true);

    if (isPlayerInvulnerable == true) {
        // Ignore damage while invulnerable
    } else {

        // !!! Collison!!!
        // Punt the player in a random direction...
        playerEntity.x += randomInRange(-7, 7);
        playerEntity.y += randomInRange(-7, 7);

        // ...penalize health...
        healthCurrent--;

        // ...play a sound...
        //soundPlayer.playOneShot(SoundAsset.CRASH_2);

        // ... and give them a moment's grace 
        setPlayerInvulnerable(1)
    }
}

function handleEntityCollision(entity) {
    sendVibration(true);

    if (isPlayerInvulnerable == true) {
        // Ignore damage while invulnerable
    } else {
        // !!! Collison!!!
        // Punt the player in a random direction...
        playerEntity.x += randomInRange(-5, 5);
        playerEntity.y += randomInRange(-5, 5);

        // ...penalize health...
        healthCurrent--;

        // ... and give them a moment's grace 
        setPlayerInvulnerable(1)
    }
}

// Returns TRUE if the game is over
function checkForGameOver() {
    return false
}

function render(context) {

    context.fillStyle = "#000000";
    context.globalAlpha = 1.0;
    context.fillRect(0, 0, canvas.width, canvas.height);

    switch (stage) {

        case Stage.AWAITING_INTERACTION:
            context.fillStyle = "#FFFFFF";
            context.font = "35px micronian";
            context.fillText("ESRB WARNING", 50, 50);
            context.fillText("This game may be too rad. Click to continue...", 50, 100);
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
            roadManager.render(context);
            context.drawImage(assetManager.getImage(ImageAsset.TITLE), 0, canvas.height / 6);

            context.drawImage(
                assetManager.getImage(ImageAsset.TITLE),
                0 + randomInRange(-5, 5),
                (canvas.height / 6) + randomInRange(-5, 5),
            )

            entitiesEnemies.filter(enemy => {
                return enemy.isAlive == true
            }).forEach(enemy => {
                enemy.render(context);
            });

            entitiesTemporary.forEach(entity => {
                entity.render(context);
            })
            break;

        case Stage.GAME_ACTIVE:

            roadManager.render(context);

            projectilesPlayer.forEach(projectile => {
                projectile.render(context);
            })

            entitiesEnemies.forEach(enemy => {
                enemy.render(context);
            });

            entitiesTemporary.forEach(ent => {
                ent.render(context);
            });

            playerEntity.render(context);

            entitiesTransient.forEach(transient => {
                transient.render(context)
            });

            entitiesTransient = [];
            renderHUD(context);
            if (debugMode == true) {
                renderDebug(context);
            }
            break;
    }

}

function renderHUD(context) {
    context.strokeStyle = "#FFFFFF";
    context.fillStyle = "#FFFFFF";

    for (let n = 1; n <= healthMax; n++) {
        if (n <= healthCurrent) {
            context.fillRect(n * 40, 20, 20, 20);
        } else {
            context.strokeRect(n * 40, 20, 20, 20);
        }
    }

    // let visionReadout;
    // if (visionMode == VisionMode.NORMAL) {
    //     visionReadout = assetManager.getImage(ImageAsset.VISION_NIGHT_MODE);
    // } else {
    //     visionReadout = assetManager.getImage(ImageAsset.VISION_INFRARED_MODE);
    // }
    // context.drawImage(visionReadout, 20, 60);
}

function toggleDebug() {
    debugMode = !debugMode;
    if (debugMode == true) {
        console.log(`debug: ON`);
    } else {
        console.log(`debug: OFF`);
    }
}

function renderDebug(context) {

    frames++;
    let now = Date.now();
    let delta = now - milliseconds;
    if (delta >= 1000) {
        frames = 0;
        milliseconds = now;
    } else {
        let framesPerSecond = Math.floor(frames / (delta / 1000));
        context.fillStyle = "#FFFFFF";
        context.font = "16px arial";
        context.fillText(`fps: ${framesPerSecond}`, 50, 100);
    }

    // let highlightedSections = roadManager.findRoadSectionsForEntityPosition(playerEntity);
    // if (highlightedSections.length > 0) {

    //     highlightedSections.forEach(section => {
    //         if (debugMode) {
    //             context.strokeStyle = "#FF0000";
    //             context.strokeRect(0, section.yOffset, 1024, 64);
    //         }
    //     })
    // }

}

function random(min, max) {
    return parseInt(Math.random() * max + min);
};

function randomInRange(min, max) {
    let range = Math.abs(max - min);
    return Math.floor(Math.random() * range) + min
}

function setPlayerInvulnerable(seconds) {

    // Give the player a few seconds of invulnerability
    isPlayerInvulnerable = true;

    let invulnerableMillis = seconds * 1000;
    let divisions = 100;
    let now = Date.now();

    // Push pairs of timers (one of on, one for off) into the timer queue
    // which cause the player's car to blink for a few moments
    for (let i = 1; i < (invulnerableMillis / divisions) / 2; i++) {

        timers.push(
            new Timer(
                now,
                now + (((i * 2) - 1) * divisions),
                function () { },
                function () {
                    playerEntity.alpha = 0.25;
                }
            )
        )

        timers.push(
            new Timer(
                now,
                now + (((i * 2)) * divisions),
                function () { },
                function () {
                    playerEntity.alpha = 1.00;
                }
            )
        )
    }

    // Finally, add a timer to remove the invulnerable state
    // and restore opacity / alpha
    timers.push(
        new Timer(
            Date.now(),
            Date.now() + invulnerableMillis + 100,
            function () { }, // on every update
            function () {   // on finish
                isPlayerInvulnerable = false;
                playerEntity.alpha = 1.0;
            }
        )
    )
}

function toggleVisionMode() {
    switch (visionMode) {
        case VisionMode.NORMAL:
            visionMode = VisionMode.INFRARED;
            break;
        case VisionMode.INFRARED:
            visionMode = VisionMode.NORMAL;
            break;
        default:
            console.log(`what is ${visionMode} ???`);
            break;
    }
}

function addEnemy() {

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
                    startX = randomInRange(10, canvas.width - 10);
                    startY = -10;
                    dX = 0;
                    dY = randomInRange(2, 6);
                    break;
                case 1:
                    // bottom up
                    startX = randomInRange(10, canvas.width - 10)
                    startY = canvas.height - 10;
                    dX = 0;
                    dY = -2;
                    break;
                case 2:
                    // left to right
                    startX = 1;
                    startY = Math.floor(Math.random() * canvas.height);
                    dX = 2;
                    dY = 0;
                    break;
                case 3:
                    // right to left
                    startX = canvas.width - 10;
                    startY = Math.floor(Math.random() * canvas.height);
                    dX = -1;
                    dY = 0;
                    break;
            }

            entitiesEnemies.push(new EntityEnemy(
                startX,
                startY,
                assetManager.getImage(ImageAsset.ENEMY_MUTANT_1),
                dX,
                dY,
                canvas.width,
                canvas.height
            ));


            break;
        case 1:

            /**
             * These enemies should come in from the sides and 
             * begin to occupy the lower sections of the road, forcing
             * the player to either drive closer to the top or engage 
             * the monsters.
             */


            let lastFollower = entitiesEnemies.filter(enemy => {
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
                startY = lastFollower.y - tileSize
            } else {
                startY = (canvas.height) - (tileSize * 3)
            }

            entitiesEnemies.push(new EntityRoadFollower(
                Math.floor(Math.random() * 2) * canvas.width,
                startY,                                         // not TOO close to the bottom!
                assetManager.getImage(ImageAsset.ENEMY_SPIDER_1)
            ));

            break;
    }







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
            break;
    }

});

document.addEventListener('keydown', (event) => {

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    switch (stage) {

        case Stage.INSERT_COIN:
            updateStage(Stage.GAME_ACTIVE);
            break;

        case Stage.GAME_ACTIVE:


            switch (event.code) {

                case "KeyA":
                    updatePlayerPosition(
                        {
                            deltaX: 5,
                            deltaY: 0
                        }
                    )
                    break;

                case "KeyD":
                    updatePlayerPosition(
                        {
                            deltaX: -5,
                            deltaY: 0
                        }
                    )
                    break;

                case "KeyW":
                    updatePlayerPosition(
                        {
                            deltaX: 0,
                            deltaY: 5
                        }
                    )
                    break;

                case "KeyS":

                    updatePlayerPosition(
                        {
                            deltaX: 0,
                            deltaY: -5
                        }
                    )
                    break;

                case "Space":
                    updateWeaponStatus(
                        { weaponStatus: WeaponStatus.FIRING }
                    );
                    break;

                case "KeyV":
                    toggleVisionMode();
                    break;

                case "Escape":
                    initialize();
                    break;

                default:
                    break;
            }
    }

    // switch (event.key) {

    //     case 'a':
    //         updatePlayerPosition(
    //             {
    //                 deltaX: -5,
    //                 deltaY: 0
    //             }
    //         )
    //         break;

    //     case 'd':
    //         updatePlayerPosition(
    //             {
    //                 deltaX: 5,
    //                 deltaY: 0
    //             }
    //         )
    //         break;

    // case 'd':
    //     toggleDebug();
    //     break;

    // case 'e':
    //     addEnemy();
    //     break;

    // case 'j':
    //     roadManager.shiftRoad(-1);
    //     break;

    // case 'l':
    //     roadManager.shiftRoad(1);
    //     break;

    // case 'i':
    //     roadManager.modifyWidth(1);
    //     break;

    // case 'k':
    //     roadManager.modifyWidth(-1);
    //     break;

    // case 'm':
    //     soundPlayer.toggleMute();
    //     break;

    // case 'w':
    //     speedCurrent += speedIncrement;
    //     if (speedCurrent >= speedMax) {
    //         speedCurrent = speedMax;
    //     }
    //     roadManager.updateSpeed(speedCurrent);
    //     console.log(`speed: ${speedCurrent}`);
    //     break;

    // case 's':
    //     speedCurrent -= speedIncrement;
    //     if (speedCurrent < speedMin) {
    //         speedCurrent = speedMin;
    //     }
    //     roadManager.updateSpeed(speedCurrent);
    //     console.log(`speed: ${speedCurrent}`);
    //     break;

    //     case 'v':
    //         toggleVisionMode();
    //         break;

    //     default:
    //         break;
    // }
});

document.addEventListener('keyup', (event) => {

    switch (stage) {

        case Stage.INSERT_COIN:
            break;

        case Stage.GAME_ACTIVE:

            switch (event.code) {

                case "Space":
                    updateWeaponStatus(
                        { weaponStatus: WeaponStatus.IDLE }
                    );
                    break;


                default:
                    break;
            }

        default:
            break;
    }

});

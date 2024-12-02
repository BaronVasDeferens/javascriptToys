/**
 * 
 * WIZARD WARS
 * or WAGE MAGE
 * 
 * IDEAS
 * 
 *      TECHNICAL
 *          load and use custom font
 * 
 *      ASTHETIC
 *          title screen
 *          8-bit font
 *          background music
 *          torch flicker
 * 
 *      CONTROLS
 *          smaller spell cards
 *          better controls for mobile-- D-pad?
 *          numeric keys trigger spells
 * 
 *      LEVELS
 *          understand the optimal "fun" mix of obstacles, enemies, hazards, gold
 *          "stock" level (like the 1st level -- outdoor field of ruins / columns / statues)
 *          bonus / safe room / campfire
 *          
 *      COLLECATBLES
 *          some gold is worth more than others
 *          rare chests that contain juicy stuff
 *          potions that do stuff that spells don't
 * 
 *      ENEMIES
 *          some enemies can't pass through hazards (can't fly) (easier)
 *          some enemies can't stack (occupy same space) (easier)
 *          some enemies can pass through obstacles (ghost)
 * 
 *      SPELLS
 *          spell: become immune to monster death for N moves (monsters semi-transparent)
 *          spell: turn hazards into obstacles?
 *          spell: make smart monsters dumb?
 *          spell: push all monsters to edges?
 *          spell: pull all monsters to center?
 *          spell: make hazards lethal to all creatures
 *          SPELLS REPLENISH AT DIFFERENT RATES
 *          
 *      
 *      POTIONS
 *          appear randomly; walking over one puts it in the "spell area"
 *          potion: turn empty speces into gold (x turns)
 *          potion: invincibility (x turns)
 *          potion: move through obstacles(x turns)
 * 
 *      SCORING
 *          score display on level descent
 *          online score board
 *          better "bonus" sound
 *          bonus for certain monsters on the board
 *          bonus for collecting everything
 *          bonus for casting NO spells?
 *          bonus for casting ALL spells?
 *          bonus/subtraction for some spells but no others?
 * 
 *      HIGH SCORES
 *          final level reached
 *          number of moves (lower the better)
 *          gold collected
 *          spells cast
 *          potions acquired
 *          potions consumed
 */



import { Card, Collectable, EffectTimerFreeze, Hazard, Monster, MonsterMovementBehavior, Mover, Obstacle, Portal, SpecialEffectDeath, SpecialEffectDescend, SpecialEffectFreeze, SpecialEffectRandomize, ImageDisplayEntity, Wizard, SpecialEffectScoreDisplay, MonsterType } from './entity.js';
import { AssetLoader, ImageLoader, ImageAsset, SoundAsset, SoundLoader } from './AssetLoader.js';

const debugOutput = false;

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();
const soundLoader = new SoundLoader();

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 1000;

// The square play area
let mapWidth = 640
let mapHeight = 640
let tileSize = 64;

let tileCols = mapWidth / tileSize;
let tileRows = mapHeight / tileSize;

var level = 1;
var score = 0;
var totalMoves = 0;

var playerWizard;

var wizardMovePerTick = 8;
var monsterMovePerTick = 8;
var moveAdjustment = 2;

var numObstacles = 2 * level;
var numCollectables = level + 1;
var numHazards = level + 1;
var numMonstersBasic = level;
var numMonstersScary = 0;

var entities = [];
var controlInput = null;
var movers = [];
var collectables = [];
var obstacles = [];
var hazards = [];
var effects = [];
var specialEffects = [];
var cards = [];
var portal;
var bonusAwarded = false;

var backgroundImage = new Image();

var coinSounds = [];
var backgroundMusicPlayer;


class Tile {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const GameState = Object.freeze({
    LOAD_START: "Preloading...",
    LOAD_COMPLETE: "...load complete!",
    INTRO: "Intro",
    LEVEL_START: "Starting level...",
    PLAYER_ACTION_SELECT: "Player choosing action...",
    PLAYER_ACTION_EXECUTE: "Player executes action",
    ENEMY_MOVE_PREPARE: "Enemies plan their moves...",
    ENEMY_MOVE_EXECUTE: "Enemies moving!",
    CAST_SPELL_EFFECT: "Wizard casts a spell!",
    GAME_OVER: "GAME OVER",
    SHOW_SCORE: "Showing score..."
});

var gameState = GameState.LOAD_START;

const SpellAction = Object.freeze({
    SPELL_FREEZE: "SPELL_FREEZE",
    SPELL_RANDOMIZE: "SPELL_RANDOMIZE"
});


const ControlInput = Object.freeze({
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
});

/** ------- KEYBOARD INPUT -------- */
document.addEventListener('keydown', (e) => {

    if (gameState == GameState.LOAD_COMPLETE) {
        playBackgroundMusic();
        initializeGameState();
    } else if (gameState == GameState.INTRO) {
        changeGameState(GameState.LEVEL_START);
        createBoardForLevel(level);
    } else if (gameState == GameState.SHOW_SCORE) {
        initializeGameState();
    } else if (gameState == GameState.PLAYER_ACTION_SELECT && controlInput == null) {
        switch (e.key) {
            case "ArrowUp":
            case "w":
            case "W":
                moveIfAble(ControlInput.UP);
                break;
            case "ArrowDown":
            case "s":
            case "S":
                moveIfAble(ControlInput.DOWN);
                break;
            case "ArrowLeft":
            case "a":
            case "A":
                moveIfAble(ControlInput.LEFT);
                break;
            case "ArrowRight":
            case "d":
            case "D":
                moveIfAble(ControlInput.RIGHT);
                break;
            case "o":
            case "O":
                // DEBUG ONLY
                let levelIncrease = 4;
                console.log(`DEBUG: creating new level ${level + levelIncrease}...`);
                createBoardForLevel(level + levelIncrease);
                break;
            case "m":
            case "M":
                if (backgroundMusicPlayer.paused == true) {
                    backgroundMusicPlayer.play();
                } else {
                    backgroundMusicPlayer.pause();
                }
                break;
            case "Escape":
                initializeGameState();
                break;
            case "-":
                decreaseEntityMovementSpeeds();
                break;
            case "+":
                increaseEntityMovementSpeeds();
                break;
        }
    }
});

/**--------- MOUSE INPUT -----------*/
document.addEventListener('mousedown', (e) => {

    if (gameState == GameState.LOAD_COMPLETE) {
        playBackgroundMusic();
        initializeGameState();
    } else if (gameState == GameState.INTRO) {
        changeGameState(GameState.LEVEL_START);
        createBoardForLevel(level);
    } else if (gameState == GameState.SHOW_SCORE) {
        initializeGameState();
    } else if (gameState == GameState.PLAYER_ACTION_SELECT && controlInput == null) {

        var rect = document.getElementById("canvas").getBoundingClientRect();
        var clickX = e.clientX - rect.left; //x position within the HTML element.
        var clickY = e.clientY - rect.top;  //y position within the HTML element.

        // Check for SPELL CLICKED
        cards.forEach(card => {
            if (card.containsClick(clickX, clickY)) {
                processCardAction(card);
            }
        });

        // Check for ADJACENT TILE CLICKED (MOVE)
        let clickedTile = {
            x: Math.floor((clickX / tileSize) % tileSize) * tileSize,
            y: Math.floor((clickY / tileSize) % tileSize) * tileSize
        };
        moveIfAble(checkAdjacentToWizard(clickedTile))
    }
});


/**
 * SETUP
 * AN IFFE (Immediately Invoked Expression Function) that runs ONCE
 */
(() => {
    console.log("Setting up...");
    changeGameState(GameState.LOAD_START);

    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, soundLoader, () => {

        // Set up the frequently-used audio resources...
        coinSounds.push(soundLoader.getSound(SoundAsset.COIN_1));
        coinSounds.push(soundLoader.getSound(SoundAsset.COIN_2));
        coinSounds.push(soundLoader.getSound(SoundAsset.COIN_3));

        // ...and begin the primary loop
        changeGameState(GameState.LOAD_COMPLETE);
        beginGame();
    });

})();


// ------------ START MAIN GAME LOOP ------------

function initializeGameState() {

    console.log("Initializing...");
    changeGameState(GameState.INTRO);

    level = 1;
    totalMoves = 0;
    score = 0;
    entities = [];
    cards = [];

    let introImage = imageLoader.getImage(ImageAsset.GRAPHIC_TITLE_CARD);
    let introEntity = new ImageDisplayEntity(
        "intro",
        (mapWidth - introImage.width) / 2,
        (mapHeight - introImage.height) / 2,
        introImage
    );
    entities.push(introEntity);
}

function createBoardForLevel(newLevel) {

    console.log(`LEVEL ${newLevel}`);

    level = newLevel;

    numObstacles = 2 + Math.floor(level / 2);
    numHazards = Math.floor(level / 3);
    numCollectables = level + 1;

    numMonstersBasic = level;
    numMonstersScary = Math.floor(level / 5);
    numMonstersBasic = numMonstersBasic - numMonstersScary;

    // Clear out prior data
    movers = [];
    entities = [];
    collectables = [];
    obstacles = [];
    hazards = [];
    effects = [];
    cards = [];
    portal = null;
    bonusAwarded = false;

    controlInput = null;

    // Add player
    var location = getSingleUnoccupiedGrid();
    playerWizard = new Wizard(
        "wizard", location.x * tileSize, location.y * tileSize, imageLoader.getImage(ImageAsset.WIZARD_2)
    );
    entities.push(playerWizard);

    // Add obstacles
    var obstacleImages = imageLoader.getTilesetForName("PILLARS");
    for (var i = 0; i < numObstacles; i++) {
        var location = getSingleUnoccupiedGrid();
        obstacles.push(
            new Obstacle(
                `pillar_${i}`, location.x * tileSize, location.y * tileSize, obstacleImages[randomIntInRange(0, obstacleImages.length)])
        );
    }

    // Add hazards
    for (var i = 0; i < numHazards; i++) {
        var location = getSingleUnoccupiedGrid();
        hazards.push(
            new Hazard(
                `hazard_${i}`, location.x * tileSize, location.y * tileSize, imageLoader.getImage(ImageAsset.HAZARD_PIT_1))
        )
    }

    // Add BASIC monsters
    for (var i = 0; i < numMonstersBasic; i++) {
        var location = getSingleUnoccupiedGrid();
        let monster = createMonster(MonsterType.RAT, location.x * tileSize, location.y * tileSize);
        entities.push(monster);
    }

    if (level % 3 == 0) {
        var location = getSingleUnoccupiedGrid();
        entities.push(
            createMonster(MonsterType.RAT_MAN, location.x * tileSize, location.y * tileSize)
        );
    }

    // Add SCARY monsters
    for (var i = 0; i < numMonstersScary; i++) {
        let chance = Math.floor(Math.random() * 10);

        switch (chance) {
            case 0:
            case 1:
            case 2:
            case 3:
                // Add seeking wasp
                var location = getSingleUnoccupiedGrid();
                entities.push(
                    createMonster(MonsterType.WASP_CHASER, location.x * tileSize, location.y * tileSize)
                );
                break;
            case 4:
            case 5:
            case 6:
                // Add replicating blob
                var location = getSingleUnoccupiedGrid();
                var monster = createMonster(MonsterType.BLOB, location.x * tileSize, location.y * tileSize);
                monster.replicationsRemaining = 1;
                entities.push(monster);
                break;
            case 7:
            case 8:
                // Add ghost (basic)
                var location = getSingleUnoccupiedGrid();
                var monster = createMonster(MonsterType.GHOST_BASIC, location.x * tileSize, location.y * tileSize);
                entities.push(monster);
                break;
            case 9:
                // Add ghost (chaser)
                var location = getSingleUnoccupiedGrid();
                var monster = createMonster(MonsterType.GHOST_CHASER, location.x * tileSize, location.y * tileSize);
                entities.push(monster);
                break;
        }
    }

    // Add collectables
    var coinImages = imageLoader.getTilesetForName("GOLDSTACKS");
    for (var i = 0; i < numCollectables; i++) {
        var location = getSingleUnoccupiedGrid();
        collectables.push(
            new Collectable(`gold_${i}`, location.x * tileSize, location.y * tileSize, coinImages[randomIntInRange(0, coinImages.length)])
        );
    }

    // Add the exit
    let portalLocation = getSingleUnoccupiedGrid();
    portal = new Portal(level + 1, portalLocation.x * tileSize, portalLocation.y * tileSize, imageLoader.getImage(ImageAsset.STAIRS_DOWN_1));

    // Add cards
    let imageSize = 96;
    let gap = 16;
    cards.push(new Card(0, 640 + gap, SpellAction.SPELL_FREEZE, imageLoader.getImage(ImageAsset.CARD_SPELL_FREEZE)));
    cards.push(new Card(imageSize + gap, 640 + gap, SpellAction.SPELL_RANDOMIZE, imageLoader.getImage(ImageAsset.CARD_SPELL_RANDOMIZE)));

    renderBackground(context);

    changeGameState(GameState.PLAYER_ACTION_SELECT);
}

/**
 * Renders the background once and re-uses the image
 */
function renderBackground(context) {
    // Prepare the background
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiles onto the background image
    var tiles;
    switch (level) {
        case 1:
            tiles = imageLoader.getTilesetForName("MARBLE_PINK");
            break;
        case 2:
            tiles = imageLoader.getTilesetForName("MARBLE");
            break;
        default:
            tiles = imageLoader.getTilesetForName("SKULLS");
            break;
    }


    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            context.drawImage(tiles[randomIntInRange(0, tiles.length)], i * tileSize, j * tileSize);
        }
    }

    obstacles.forEach(ob => { ob.render(context) });
    hazards.forEach(hazard => { hazard.render(context) });
    portal.render(context);

    var updatedSrc = canvas.toDataURL();
    backgroundImage.src = updatedSrc;
}

function beginGame() {
    update();
    render();
    requestAnimationFrame(beginGame);
}


function processCardAction(card) {

    switch (card.action) {
        case SpellAction.SPELL_FREEZE:
            specialEffects.push(new SpecialEffectFreeze(mapWidth, mapHeight));
            effects.push(new EffectTimerFreeze(card.action, 6));
            break;
        case SpellAction.SPELL_RANDOMIZE:
            var swappables = entities.filter(ent => {
                if (ent instanceof Card == false) {
                    return ent;
                }
            }).concat(obstacles).concat(hazards).concat(collectables).concat(portal);
            shuffle(swappables);

            specialEffects.push(new SpecialEffectRandomize(mapWidth, mapHeight, () => {
                // Create a list of positions 
                let positions = swappables.map(entity => {
                    return {
                        x: entity.x,
                        y: entity.y
                    }
                }).reverse();

                // Starting from the end of the position list, assign a new position to every entity 
                for (var pos = 0; pos < swappables.length; pos++) {
                    swappables[pos].x = positions[pos].x;
                    swappables[pos].y = positions[pos].y;
                }

                renderBackground(context);
            }));

            break;
    }

    // Remove the card
    removeElement(card, cards);

    changeGameState(GameState.CAST_SPELL_EFFECT);
    let spellEffectSound = soundLoader.getSound(SoundAsset.SPELL_THUNDER_1);
    spellEffectSound.addEventListener("ended", (e) => {
        changeGameState(GameState.PLAYER_ACTION_SELECT);
    }, { once: true });
    spellEffectSound.play();
}

function update() {
    if (gameState == GameState.INTRO) {
        // skip
    } else if (gameState == GameState.LOAD_START) {
        // skip
    } else if (gameState == GameState.LOAD_COMPLETE) {
        // skip
    } else if (gameState == GameState.GAME_OVER) {
        // skip
    } else if (gameState == GameState.CAST_SPELL_EFFECT) {
        // skip
    } else if (gameState == GameState.SHOW_SCORE) {
        // skip
    } else {

        specialEffects = [];

        // Clean out dead entities
        entities = entities.filter(ent => {
            return ent.isAlive == true;
        });

        // Clean out dead movers
        movers = movers.filter(mover => {
            return mover.isAlive;
        });

        // Monsters plot thier moves here
        if (gameState == GameState.ENEMY_MOVE_PREPARE) {
            var hasFreeze = effects.map(ef => { return ef.effectType == SpellAction.SPELL_FREEZE }).includes(true);
            if (!hasFreeze) {
                entities
                    .filter(entity => { return entity instanceof Monster })
                    .forEach(entity => {
                        switch (entity.behavior) {
                            case MonsterMovementBehavior.CHASE_PLAYER:
                            case MonsterMovementBehavior.RANDOM:
                                if (entity.mover == null || entity.mover.isAlive == false) {
                                    var mover = getMonsterMover(entity, playerWizard);
                                    if (mover != null) {
                                        entity.setMover(mover);
                                        movers.push(mover);
                                    }
                                }
                                break;
                            case MonsterMovementBehavior.REPLICATE:
                                if (entity.replicationsRemaining > 0) {
                                    let freeSpaces = getUnoccupiedAdjacencies(entity);
                                    if (freeSpaces.length > 0) {
                                        let freeSpace = freeSpaces[0];
                                        let newMonster = new Monster("monsterSpawn", entity.x, entity.y, MonsterMovementBehavior.REPLICATE, imageLoader.getImage(ImageAsset.MONSTER_BLOB_1));
                                        let mover = getMonsterMover(newMonster, freeSpace)
                                        newMonster.setMover(mover);
                                        newMonster.replicationsRemaining = 1;
                                        entity.replicationsRemaining -= 1;
                                        entities.push(newMonster);
                                        movers.push(mover);
                                    }
                                }
                                break;
                        }

                    })
            }

            changeGameState(GameState.ENEMY_MOVE_EXECUTE);
        }

        movers.forEach(mover => {
            mover.update();
        });


        if (gameState == GameState.ENEMY_MOVE_EXECUTE) {
            if (movers.every(mover => { mover.isAlive == false })) {
                changeGameState(GameState.PLAYER_ACTION_SELECT);
            }
        }

        // Consume the collectables
        collectables
            .filter(item => item.isCollected == false)
            .forEach(item => {
                if (isWithinCollisionDistance(playerWizard, item, 0)) {
                    item.isCollected = true;
                    score += 100;
                    playCoinSound();
                }
            });

        // Award BONUS for collecting everything
        if (collectables.length == 0) {
            if (bonusAwarded == false) {
                playBonusSound();
                var bonusValue = level * 100;
                score += bonusValue;
                console.log(`* BONUS ${bonusValue} PTS *`);
            }
            bonusAwarded = true;
        }

        // Remove all acquired collectables
        collectables = collectables.filter(item => item.isCollected == false);

        // Check for player / entity collisions / level descents
        let fatalEntity = getFatalEntity(playerWizard, hazards.concat(entities));
        if (fatalEntity.length > 0) {
            // Check for GAME OVER: HAZARDS and MONSTERS...
            gameOver(fatalEntity[0]);
        } else if (isWithinCollisionDistance(playerWizard, portal, 0)) {
            // ...or LEVEL DESCENT
            effects = [];
            changeGameState(GameState.CAST_SPELL_EFFECT);
            let descendSound = soundLoader.getSound(SoundAsset.DESCEND);
            descendSound.addEventListener("ended", (e) => {
                createBoardForLevel(portal.toLevelNumber);
            }, { once: true });
            descendSound.play();

            specialEffects.push(
                new SpecialEffectDescend(mapWidth, mapHeight, portal.x, portal.y, tileSize, wizardMovePerTick)
            );
        }
    }
}

function render() {
    if (gameState == GameState.LOAD_START) {
        // Set background to display "loading" text
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#FF0000";
        context.lineWidth = 2.0;
        context.font = "24px sans-serif";
        context.fillText("LOADING", (canvas.width / 2) - 48, (canvas.height / 2));
    } else if (gameState == GameState.LOAD_COMPLETE) {
        // Set background to display "loading" text
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#FF0000";
        context.lineWidth = 2.0;
        context.font = "24px sans-serif";
        context.fillText("PRESS TO CONTINUE", (canvas.width / 2) - 48, (canvas.height / 2));
    } else if (gameState == GameState.INTRO) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        entities.forEach(entity => {
            entity.render(context);
        });
    } else {
        // Draw background
        context.drawImage(backgroundImage, 0, 0);

        cards.forEach(card => {
            card.render(context);
        });

        // Draw collectables
        collectables.forEach(item => {
            item.render(context);
        });

        // Draw entities
        entities.forEach(entity => {
            entity.render(context);
        });

        specialEffects.forEach(spEf => {
            spEf.render(context);
        });

        effects.forEach(effect => {
            if (effect instanceof EffectTimerFreeze) {
                effect.render(
                    context,
                    entities.filter(ent => { return ent instanceof Monster }),
                    tileSize
                );
            }
        });
    }

}

// ------------ END MAIN GAME LOOP ------------

function changeGameState(newState) {
    gameState = newState;
    if (debugOutput) {
        console.log(`gameState: ${gameState}`);
    }
}

/**
 * Determines whether a grid of the map is directly adjacent to the wizard.
 * @param {*} target an object with x and y properties, each a multiple of 64 
 * @returns the direction relative to the wizard, or null if not adjacent
 */
function checkAdjacentToWizard(target) {
    if (target.x == playerWizard.x) {
        if (target.y == playerWizard.y - tileSize) {
            return ControlInput.UP;
        } else if (target.y == playerWizard.y + tileSize) {
            return ControlInput.DOWN;
        } else {
            return null;
        }
    } else if (target.y == playerWizard.y) {
        if ((target.x == playerWizard.x - tileSize)) {
            return ControlInput.LEFT;
        } else if (target.x == playerWizard.x + tileSize) {
            return ControlInput.RIGHT;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

/**
 * Moves the wizard in the indicated direction, if able.
 * @param {*} direction : InputControl
 */
function moveIfAble(direction) {
    switch (direction) {
        case ControlInput.UP:
            if (checkIsValidMove(playerWizard, playerWizard.x, playerWizard.y - tileSize)) {
                controlInput = ControlInput.UP
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x,
                        playerWizard.y - tileSize,
                        0,
                        -wizardMovePerTick,
                        () => {
                            totalMoves++;
                            controlInput = null;
                            updateEffects();
                            changeGameState(GameState.ENEMY_MOVE_PREPARE);
                        }
                    )
                )
                playStepSound();
                changeGameState(GameState.PLAYER_ACTION_EXECUTE);
            }
            break;
        case ControlInput.DOWN:
            if (checkIsValidMove(playerWizard, playerWizard.x, playerWizard.y + tileSize)) {
                controlInput = ControlInput.DOWN
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x,
                        playerWizard.y + tileSize,
                        0,
                        wizardMovePerTick,
                        () => {
                            totalMoves++;
                            controlInput = null;
                            updateEffects();
                            changeGameState(GameState.ENEMY_MOVE_PREPARE);
                        }
                    )
                )
                playStepSound();
                changeGameState(GameState.PLAYER_ACTION_EXECUTE);
            }
            break;
        case ControlInput.LEFT:
            if (checkIsValidMove(playerWizard, playerWizard.x - tileSize, playerWizard.y)) {
                controlInput = ControlInput.LEFT
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x - tileSize,
                        playerWizard.y,
                        -wizardMovePerTick,
                        0,
                        () => {
                            totalMoves++;
                            controlInput = null;
                            updateEffects();
                            changeGameState(GameState.ENEMY_MOVE_PREPARE);
                        }
                    )
                );
                playStepSound();
                changeGameState(GameState.PLAYER_ACTION_EXECUTE);
            }
            break;
        case ControlInput.RIGHT:
            if (checkIsValidMove(playerWizard, playerWizard.x + tileSize, playerWizard.y)) {
                controlInput = ControlInput.RIGHT
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x + tileSize,
                        playerWizard.y,
                        wizardMovePerTick,
                        0,
                        () => {
                            totalMoves++;
                            controlInput = null;
                            updateEffects();
                            changeGameState(GameState.ENEMY_MOVE_PREPARE);
                        }
                    )
                )
                playStepSound();
                changeGameState(GameState.PLAYER_ACTION_EXECUTE);
            }
            break;
        default:
            break;
    }
}

function increaseEntityMovementSpeeds() {
    if ((wizardMovePerTick * moveAdjustment) <= tileSize) {
        wizardMovePerTick *= moveAdjustment;
    }

    if ((monsterMovePerTick * moveAdjustment) <= tileSize) {
        monsterMovePerTick *= moveAdjustment;
    }

    console.log(`Increasing movement speeds wizard: ${wizardMovePerTick} monsters: ${monsterMovePerTick}`);
}

function decreaseEntityMovementSpeeds() {
    if ((wizardMovePerTick / moveAdjustment) >= moveAdjustment) {
        wizardMovePerTick /= moveAdjustment;
    }

    if ((monsterMovePerTick / moveAdjustment) >= moveAdjustment) {
        monsterMovePerTick /= moveAdjustment;
    }
    console.log(`Decreasing movement speeds wizard: ${wizardMovePerTick} monsters: ${monsterMovePerTick}`);
}

function gameOver(fatalEntity) {

    let finalScore = Math.floor((score / totalMoves) * level);
    console.log("----------------------------------------------------------");
    console.log("Wizard was slain: GAME OVER");
    console.log(`LEVEL ACHIEVED: ${level}`);
    console.log(`TOTAL MOVES: ${totalMoves}`);
    console.log(`TREASURE COLLECTED: ${score}`);
    console.log(`FINAL SCORE: ${finalScore}`);
    console.log("----------------------------------------------------------");


    changeGameState(GameState.GAME_OVER);
    effects = [];
    specialEffects.push(
        new SpecialEffectDeath(canvas.width, canvas.height, playerWizard, fatalEntity)
    );

    var gameOverSound = soundLoader.getSound(SoundAsset.PLAYER_DIES);
    gameOverSound.currentTime = 0;
    gameOverSound.addEventListener("ended", (e) => {
        changeGameState(GameState.SHOW_SCORE);
        specialEffects.push(
            new SpecialEffectScoreDisplay(
                mapWidth / 4,
                mapHeight / 4,
                totalMoves,
                score,
                finalScore
            )
        )
    }, { once: true });
    gameOverSound.play();



}

function checkIsValidMove(entity, destinationX, destinationY) {
    var inBounds = checkInBounds(destinationX, destinationY);

    if (entity instanceof Monster) {
        var illegalSpaces = [];

        if (entity.isBlockedByHazard) {
            illegalSpaces = illegalSpaces.concat(hazards);
        }

        if (entity.isBlockedByObstacle) {
            illegalSpaces = illegalSpaces.concat(obstacles)
        }

        if (entity.isBlockedByCollectable) {
            illegalSpaces = illegalSpaces.concat(collectables);
        }

        if (entity.isBlockedByPortal) {
            illegalSpaces = illegalSpaces.concat(portal);
        }

        var isClear = illegalSpaces.map(grid => {
            return (destinationX == grid.x) && (destinationY == grid.y)
        });

        return !isClear.includes(true) && inBounds;

    } else {
        var isUnobstruced = checkUnobstructed(destinationX, destinationY);
        return isUnobstruced && inBounds;
    }
}


function checkInBounds(destinationX, destinationY) {
    var inBounds = (destinationX >= 0) && (destinationX < mapWidth) && (destinationY >= 0) && (destinationY < mapHeight);
    return inBounds;
}

function checkUnobstructed(destinationX, destinationY) {
    var isObstructed = obstacles.map(obstacle => {
        //console.log(`OBSTRUCTED ${obstacle.x} : ${(destinationX == obstacle.x) && (destinationY == obstacle.y)}`)
        return (destinationX == obstacle.x) && (destinationY == obstacle.y)
    });
    return !isObstructed.includes(true);
}

function getFatalEntity(source, potentials) {
    var fatalEntities = potentials.map((entity) => {
        if ((source !== entity) && (entity.isLethal == true) && (isWithinCollisionDistance(source, entity, 0))) {
            return entity;
        };
    });

    return fatalEntities.filter(it => { return (it != null) });
}

function checkFatalCollision(source, entities) {
    var collisions = entities.map((entity) => {
        if (source === entity) {
            return false;
        } else {
            return isWithinCollisionDistance(source, entity, 0)
        }
    });

    return collisions.includes(true);
}

function isWithinCollisionDistance(entityA, entityB, distance) {
    var xDist = Math.abs(entityA.x - entityB.x);
    var yDist = Math.abs(entityA.y - entityB.y);
    var collisionDetected = (xDist <= distance) && (yDist <= distance);
    return collisionDetected;
}

/**
 * @returns a single grid space (x,y) that contains no other entity 
 */
function getSingleUnoccupiedGrid() {
    var allTiles = [];
    for (var cols = 0; cols < tileCols; cols++) {
        for (var rows = 0; rows < tileRows; rows++) {
            allTiles.push(new Tile(cols, rows));
        }
    }

    var occupiedGrids = getAllOccupiedGrids();

    occupiedGrids.forEach(occupied => {
        allTiles = allTiles.filter(grid => { return JSON.stringify(grid) !== JSON.stringify(occupied) });
    });

    shuffle(allTiles);
    return allTiles[0];
}

/**
 * Returns the list of all grid points that have at least one entity (enemy, player, collectable) partially or wholly within them
 */
function getAllOccupiedGrids() {
    var occupiedGrids = [];

    var allEntities = entities.concat(collectables).concat(obstacles).concat(hazards);
    allEntities.forEach(entity => {
        occupiedGrids.push(new Tile(Math.floor(entity.x / tileSize), Math.floor(entity.y / tileSize)))
    });

    return occupiedGrids;
}

function getUnoccupiedAdjacencies(entity) {
    var adjacnencies = [];

    adjacnencies.push({ x: entity.x, y: (entity.y - tileSize) }); // up
    adjacnencies.push({ x: entity.x, y: (entity.y + tileSize) }); // down
    adjacnencies.push({ x: (entity.x - tileSize), y: entity.y }); // left
    adjacnencies.push({ x: (entity.x + tileSize), y: entity.y }); // right

    // Remove any that are outside the boundaries of the map
    adjacnencies = adjacnencies.filter(adj => {
        return (adj.x >= 0 && adj.x < mapWidth && adj.y >= 0 && adj.y < mapHeight);
    });

    var occupiedGrids = getAllOccupiedGrids().concat(portal);

    occupiedGrids
        .map(occupied => {
            if (occupied instanceof Portal) {
                return { x: occupied.x, y: occupied.y };     // FIXME: Portal object isn't pre-multiplied
            } else {
                return { x: occupied.x * tileSize, y: occupied.y * tileSize };
            }
        }).forEach(occupied => {
            adjacnencies = adjacnencies.filter(grid => { return JSON.stringify(grid) !== JSON.stringify(occupied) });
        });

    shuffle(adjacnencies);
    return adjacnencies;
}

function getMonsterMover(monster, target) {
    switch (monster.behavior) {
        case MonsterMovementBehavior.CHASE_PLAYER:
        case MonsterMovementBehavior.REPLICATE:
            return getMoverToTarget(monster, target);
        case MonsterMovementBehavior.RANDOM:
            return getRandomMover(monster);
    }
}

function getMoverToTarget(monster, target) {

    var potentialMovers = [];

    var destinationX = 0;
    var deltaX = 0;

    if (monster.x > target.x) {
        destinationX = monster.x - tileSize;
        deltaX = -monsterMovePerTick
    } else if (monster.x < target.x) {
        destinationX = monster.x + tileSize;
        deltaX = monsterMovePerTick
    }

    if (checkIsValidMove(monster, destinationX, monster.y) && deltaX != 0) {
        potentialMovers.push(new Mover(monster, destinationX, monster.y, deltaX, 0, () => { }));
    }

    var destinationY = 0;
    var deltaY = 0;

    if (monster.y > target.y) {
        destinationY = monster.y - tileSize;
        deltaY = -monsterMovePerTick
    } else if (monster.y < target.y) {
        destinationY = monster.y + tileSize;
        deltaY = monsterMovePerTick
    }

    if (checkIsValidMove(monster, monster.x, destinationY) && deltaY != 0) {
        potentialMovers.push(new Mover(monster, monster.x, destinationY, 0, deltaY, () => { }));
    }

    shuffle(potentialMovers);
    return potentialMovers[0];
}

function getRandomMover(monster) {

    var potentialMoves = [];
    var targetX = 0;
    var targetY = 0;
    var mover;

    // move down
    targetY = monster.y + tileSize;
    if (checkIsValidMove(monster, monster.x, targetY)) {
        mover = new Mover(monster, monster.x, targetY, 0, monsterMovePerTick, () => { })
        potentialMoves.push(mover);
    }

    // move up
    targetY = monster.y - tileSize;
    if (checkIsValidMove(monster, monster.x, targetY)) {
        mover = new Mover(monster, monster.x, targetY, 0, -monsterMovePerTick, () => { })
        potentialMoves.push(mover);
    }


    // move left
    targetX = monster.x - tileSize;
    if (checkIsValidMove(monster, targetX, monster.y)) {
        mover = new Mover(monster, targetX, monster.y, -monsterMovePerTick, 0, () => { })
        potentialMoves.push(mover);
    }

    // move right
    targetX = monster.x + tileSize;
    if (checkIsValidMove(monster, targetX, monster.y)) {
        mover = new Mover(monster, targetX, monster.y, monsterMovePerTick, 0, () => { })
        potentialMoves.push(mover);
    }

    shuffle(potentialMoves);
    return potentialMoves[0];
}

function createMonster(type, x, y) {
    var monster;
    switch (type) {
        case MonsterType.RAT:
            monster = new Monster(
                "rat", x, y, MonsterMovementBehavior.RANDOM, imageLoader.getImage(ImageAsset.MONSTER_RAT_SMALL)
            );
            monster.isBlockedByHazard = true;
            monster.isBlockedByObstacle = true;
            monster.isBlockedByCollectable = true;
            monster.isBlockedByPortal = true;
            return monster;

        case MonsterType.RAT_MAN:
            monster = new Monster(
                "rat_man", x, y, MonsterMovementBehavior.CHASE_PLAYER, imageLoader.getImage(ImageAsset.MONSTER_RAT_MAN)
            );
            monster.isBlockedByHazard = true;
            monster.isBlockedByObstacle = true;
            monster.isBlockedByCollectable = true;
            monster.isBlockedByPortal = true;
            return monster;

        case MonsterType.WASP_BASIC:
            monster = Monster(
                `wasp`, x, y, MonsterMovementBehavior.RANDOM, imageLoader.getImage(ImageAsset.MONSTER_WASP_YELLOW)
            );
            monster.isBlockedByHazard = false;
            monster.isBlockedByObstacle = true;
            monster.isBlockedByCollectable = true;
            monster.isBlockedByPortal = true;
            return monster;

        case MonsterType.WASP_CHASER:
            monster = new Monster(
                `wasp_chaser`, x, y, MonsterMovementBehavior.CHASE_PLAYER, imageLoader.getImage(ImageAsset.MONSTER_WASP_RED)
            );
            monster.isBlockedByHazard = false;
            monster.isBlockedByObstacle = true;
            monster.isBlockedByCollectable = true;
            monster.isBlockedByPortal = true;
            return monster;

        case MonsterType.BLOB:
            monster = new Monster(
                `blob`, x, y, MonsterMovementBehavior.REPLICATE, imageLoader.getImage(ImageAsset.MONSTER_BLOB_1)
            );
            monster.isBlockedByHazard = true;
            monster.isBlockedByObstacle = true;
            monster.isBlockedByCollectable = true;
            monster.isBlockedByPortal = true;
            return monster;

        case MonsterType.GHOST_BASIC:
            monster = new Monster(
                `ghost`, x, y, MonsterMovementBehavior.RANDOM, imageLoader.getImage(ImageAsset.MONSTER_GHOST_1)
            );
            monster.isBlockedByHazard = false;
            monster.isBlockedByObstacle = false;
            monster.isBlockedByCollectable = false;
            monster.isBlockedByPortal = false;
            return monster;

        case MonsterType.GHOST_CHASER:
            monster = new Monster(
                `ghost`, x, y, MonsterMovementBehavior.CHASE_PLAYER, imageLoader.getImage(ImageAsset.MONSTER_GHOST_2)
            );
            monster.isBlockedByHazard = false;
            monster.isBlockedByObstacle = false;
            monster.isBlockedByCollectable = false;
            monster.isBlockedByPortal = false;
            return monster;
    }

}


/**
 * ------- SOUNDS --------
 */

function playStepSound() {
    var stepSound = soundLoader.getSound(SoundAsset.MOVE_2);
    stepSound.currentTime = 0;
    stepSound.play();
}

function playCoinSound() {
    var sound = coinSounds[randomIntInRange(0, coinSounds.length)];
    sound.pause();
    sound.currentTime = 0;
    var pbr = Math.abs(2.0 - Math.random());
    sound.playbackRate = pbr;
    sound.play();
}

function playBonusSound() {
    var sound = soundLoader.getSound(SoundAsset.BONUS);
    sound.currentTime = 0;
    sound.play();
}

function playBackgroundMusic() {
    if (backgroundMusicPlayer == null) {
        backgroundMusicPlayer = soundLoader.getSound(SoundAsset.BGM);
        backgroundMusicPlayer.loop = true;
        backgroundMusicPlayer.play();
    }
}

function updateEffects() {
    effects.forEach(ef => { ef.update() });
    effects = effects.filter(ef => { return ef.isAlive })
}

/* ------------ CONVENIENCE METHODS ------------ */
function randomIntInRange(min, max) {
    return parseInt(Math.random() * max + min);
};

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

function removeElement(element, array) {
    let index = array.indexOf(element);
    if (index != -1) {
        array.splice(index, 1);
    }
}



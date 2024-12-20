/**
 * 
 * WIZARD WARS
 * or WAGE MAGE
 * 
 * IDEAS
 * 
 *      UNSORTED
 *          level (HARD): LOTS of gold, a few obstacles/hazrads, and two chaser ghosts!
 *              + the portal only appears when all gold is collected!
 *          puzzle: a treasure chest in the center of four columns or pits
 *          puzzle: the EXIT in the center of four pits means you MUST use phase spell to leave
 *          [X] a treasure that RUNS AWAY FROM YOU means you MUST freeze it
 *          an EVIL WIZARD is summoned after you cast a certain number of spells
 *          obstacles that are invisible but are reveal through magic
 *          multiple portals
 *              + after reaching level 10 or higher, a new portal becomes available at the level 0 start
 *              + the second portal goes to a much harder version of the game
 *              + the magical portal shimmers
 * 
 *      TECHNICAL
 *          load and use custom font
 * 
 *      ASTHETIC
 *          title screen
 *          8-bit font
 *          [X] background music
 *          torch flicker
 * 
 *      CONTROLS
 *          should you be able to SKIP a move?
 *          better controls for mobile-- D-pad?
 *          numeric keys trigger spells
 * 
 *      LEVELS
 *          understand the optimal "fun" mix of obstacles, enemies, hazards, gold
 *          "stock" level (like the 1st level -- outdoor field of ruins / columns / statues)
 *          bonus / safe room / campfire
 *          
 *      COLLECATBLES
 *          items that FADE with each move
 *              + perhaps LOTS of collectable gold which fades with each step
 *          some gold stacks are worth more than others
 *          rare chests that contain juicy stuff
 *          potions that do stuff that spells don't
 *          !! an invisible chest that only appears when you cast precog;
 *              + doesn't move, or
 *              + moves randomly (LOL)
 * 
 *      ENEMIES
 *          enemy type that guards stairs or collectables
 *          some enemies can't stack (occupy same space) (easier)
 * 
 *      ENVIRONMENT
 *          traps?
 *          tiles that fall away after moving over them N times
 * 
 *      SPELLS
 *          [X] spell: become immune to monster death for N moves (monsters semi-transparent)
 *          spell: turn hazards into obstacles?
 *          spell: make smart monsters dumb?
 *          spell: push all monsters to edges?
 *          spell: pull all monsters to center?
 *          spell: make hazards lethal to all creatures
 *          spell: drop boulders (kill monsters, block tiles)
 *          SPELLS REPLENISH AT DIFFERENT RATES
 *          
 *      POTIONS
 *          potions should be REALLY GOOD spells that can be used ONCE
 *          appear randomly; walking over one puts it in the "spell area"
 *          potion: turn empty speces into gold (x turns)
 *          potion: invincibility (x turns)
 *          potion: move through obstacles (x turns)
 * 
 *      SCORING
 *          score display
 *          online score board
 *          better "bonus" sound
 *          bonus for certain monsters on the board
 *          bonus for number of blobs on board
 *          bonus for collecting everything
 *          bonus for casting NO spells?
 *          bonus for casting ALL spells?
 *          bonus/subtraction for some spells but not others?
 *          DEBT: start off with 50,000 of debt
 *          DEBT: debt decreases every time you complete 10 levels (making it "out")
 *          DEBT: debt INCREASES when you die
 * 
 *      HIGH SCORES
 *          final level reached
 *          number of moves (lower the better)
 *          gold collected
 *          spells cast
 *          potions acquired
 *          potions consumed
 * 
 *      BUGS BUGS BUGS
 *          precog doesn't always work with blobs
 */



import { Card, Collectable, EffectTimerFreeze, Hazard, Monster, MonsterMovementBehavior, Mover, Obstacle, Portal, SpecialEffectDeath, SpecialEffectDescend, SpecialEffectFreeze, SpecialEffectRandomize, ImageDisplayEntity, Wizard, SpecialEffectScoreDisplay, MonsterType, SpecialEffectPrecognition, TemporaryEntity, SpecialEffectPhase, EffectTimerPhase, CollectableMonster } from './entity.js';
import { AssetLoader, ImageAsset, SoundAsset } from './AssetLoader.js';
import { Level, Level_0 } from './level.js';

const debugOutput = false;

const assetLoader = new AssetLoader();

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


var levelZero = new Level_0();


var level = 1;
var goldCollected = 0;
var movesThisRun = 0;

/** --- STATSTICS --- */
const statisticVersion = 1;
const costPerAttempt = 1000;        // The amount added to your debt every time a new game is started.
var debtTotal = -50000;             // Current debt
var attemptsLifetime = 0;           // Total number of games played
var highScoreLifetime = 0;          // Highest score achieved across every game
var movesLifetime = 0;              // Total number of moves made across every game
var spellsCastLifetime = 0;         // Total number of spells cast across every game
var furthestLevelAchieved = 1;
var goldGatheredLifetime = 0;       // Total amount of gold gathered (but not necessarily banked)
var goldBankedLifetime = 0;         // Total amount of gold that was banked by reaching a checkpoint

var playerWizard;

var wizardMovePerTick = 8;
var monsterMovePerTick = 8;
var moveAdjustment = 2;

var numObstacles = 2 * level;
var numCollectables = level + 1;
var numHazards = level + 1;
var numMonstersBasic = level;
var numMonstersScary = 0;
var numCollectableMonsters = 0;

var entities = [];
var controlInput = null;
var movers = [];
var collectables = [];
var obstacles = [];
var hazards = [];
var effects = [];
var specialEffects = [];
var cards = [];
var temporaryEntities = [];
var portal = null;
var bonusAwarded = false;

var backgroundImage = new Image();

var coinSounds = [];

var backgroundMusicPlayer = null;

var audioConfig = {
    efxEnabled: true,
    bgmEnabled: true
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
    SPELL_RANDOMIZE: "SPELL_RANDOMIZE",
    SPELL_PRECOGNITION: "SPELL_PRECOGNITION",
    SPELL_PHASE: "SPELL_PHASE"
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
        updateAudio();
        initializeGameState();
    } else if (gameState == GameState.INTRO) {
        changeGameState(GameState.LEVEL_START);
        createBoardForLevel(level);
    } else if (gameState == GameState.SHOW_SCORE) {
        hideScore();
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
                let levelIncrease = 1;
                createBoardForLevel(level + levelIncrease);
                break;
            case "m":
            case "M":
                audioConfig.bgmEnabled = !audioConfig.bgmEnabled;
                audioConfig.efxEnabled = !audioConfig.efxEnabled;
                updateAudio();
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
        updateAudio();
        initializeGameState();
    } else if (gameState == GameState.INTRO) {
        changeGameState(GameState.LEVEL_START);
        createBoardForLevel(level);
    } else if (gameState == GameState.SHOW_SCORE) {
        hideScore();
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

/** --- PAUSE AUDIO when switching tabs (as one should) ---*/
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        backgroundMusicPlayer.pause();
    } else {
        updateAudio();
    }
});


/**
 * SETUP
 * AN IFFE (Immediately Invoked Expression Function) that runs ONCE
 * Should this be window.onload? /shrug
 */
(() => {
    console.log("Setting up...");


    changeGameState(GameState.LOAD_START);
    loadStatistics();

    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(() => {

        // Set up the frequently-used audio resources...
        coinSounds.push(assetLoader.getSound(SoundAsset.COIN_1));
        coinSounds.push(assetLoader.getSound(SoundAsset.COIN_2));
        coinSounds.push(assetLoader.getSound(SoundAsset.COIN_3));

        levelZero.initialize(assetLoader);

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
    movesThisRun = 0;
    goldCollected = 0;
    entities = [];
    cards = [];

    let introImage = assetLoader.getImage(ImageAsset.GRAPHIC_TITLE_CARD);
    let introEntity = new ImageDisplayEntity(
        "intro",
        (mapWidth - introImage.width) / 2,
        (mapHeight - introImage.height) / 2,
        introImage,
        1.0
    );
    entities.push(introEntity);

    backgroundMusicPlayer.playbackRate = 1.0;
}

function createBoardForLevel(newLevel) {

    levelZero = new Level_0();
    levelZero.initialize(assetLoader);

    console.log(`LEVEL ${newLevel}`);

    // Handle statistics
    if (newLevel == 1) {
        attemptsLifetime++;
        debtTotal -= costPerAttempt;
    } else {
        if (newLevel > furthestLevelAchieved) {
            furthestLevelAchieved = newLevel;
        }
    }

    updateStatistics();

    playerWizard = levelZero.playerWizard;
    portal = levelZero.portal;
    entities = levelZero.entities;
    obstacles = levelZero.obstacles;
    hazards = levelZero.hazards;
    collectables = levelZero.collectables;

    level = levelZero.levelNumber;

    numCollectables = levelZero.numCollectables;
    numCollectableMonsters = levelZero.numCollectableMonsters;

    // numObstacles = 2 + Math.floor(level / 2);
    // numHazards = Math.floor(level / 3);
    // numCollectables = level + 1;

    // numMonstersBasic = level;
    // numMonstersScary = Math.floor(level / 3);
    // numMonstersBasic = numMonstersBasic - numMonstersScary;

    // if (level % 3 == 0) {
    //     numCollectableMonsters = 1;
    // } else {
    //     numCollectableMonsters = 0;
    // }

    // Clear out prior data
    movers = [];
    // entities = [];
    // collectables = [];
    // obstacles = [];
    // hazards = [];
    // effects = [];
    cards = [];
    temporaryEntities = [];

    bonusAwarded = false;

    controlInput = null;


    // // Add COLLECTABLE monster
    // for (var i = 1; i <= numCollectableMonsters; i++) {
    //     var location = getSingleUnoccupiedGrid();
    //     entities.push(
    //         new CollectableMonster(
    //             location.x * tileSize,
    //             location.y * tileSize,
    //             assetLoader.getImage(ImageAsset.TREASURE_RING)
    //         )
    //     );
    // }



    // Add cards
    let imageSize = 96;
    let gap = 16;
    cards.push(new Card(0 * (imageSize + gap), 640 + gap, SpellAction.SPELL_FREEZE, assetLoader.getImage(ImageAsset.CARD_SPELL_FREEZE)));
    cards.push(new Card(1 * (imageSize + gap), 640 + gap, SpellAction.SPELL_RANDOMIZE, assetLoader.getImage(ImageAsset.CARD_SPELL_RANDOMIZE)));
    cards.push(new Card(2 * (imageSize + gap), 640 + gap, SpellAction.SPELL_PRECOGNITION, assetLoader.getImage(ImageAsset.CARD_SPELL_PRECOGNITION)));
    cards.push(new Card(3 * (imageSize + gap), 640 + gap, SpellAction.SPELL_PHASE, assetLoader.getImage(ImageAsset.CARD_SPELL_PHASE)));

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
    var tiles = assetLoader.getTilesetForName(levelZero.floorTileSetName);

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
            // FREEZE locks all monsters into their current positions for N turns
            specialEffects.push(new SpecialEffectFreeze(mapWidth, mapHeight));
            effects.push(new EffectTimerFreeze(card.action, 6));
            break;

        case SpellAction.SPELL_RANDOMIZE:
            // RANDOMIZE swaps the positions of all entities. CAUTION: entities can stack, so wizard may swap into a space that is already occupied!

            // Begin by removing any "precog" movers
            temporaryEntities = [];
            movers = [];
            entities
                .filter(ent => {
                    return ent instanceof Monster
                }).forEach(ent => {
                    ent.setMover(null);
                });

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

        case SpellAction.SPELL_PRECOGNITION:

            var monsters = entities.filter(ent => { return ent instanceof Monster })
            monsters.forEach(entity => {

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
                                let newMonster = new Monster("monsterSpawn", entity.x, entity.y, MonsterMovementBehavior.REPLICATE, assetLoader.getImage(ImageAsset.MONSTER_BLOB_1));
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
            });

            entities.filter(ent => { return ent instanceof Monster })
                .filter(monster => { return monster.mover != null })
                .forEach(entity => {
                    // push some temporary entities for the "ghost" monsters

                    var dX = 0;
                    var dY = 0;
                    switch (entity.mover.direction) {
                        case ControlInput.UP:
                            dY = -tileSize;
                            break;
                        case ControlInput.DOWN:
                            dY = tileSize;
                            break;
                        case ControlInput.LEFT:
                            dX = -tileSize;
                            break;
                        case ControlInput.RIGHT:
                            dX = tileSize;
                            break;
                    }

                    temporaryEntities.push(
                        new TemporaryEntity(
                            entity.x + dX,
                            entity.y + dY,
                            entity.image,
                            0.5,
                            GameState.ENEMY_MOVE_EXECUTE)
                    );
                });

            specialEffects.push(
                new SpecialEffectPrecognition(mapWidth, mapHeight)
            );
            break;

        case SpellAction.SPELL_PHASE:
            specialEffects.push(new SpecialEffectPhase(mapWidth, mapHeight));
            playerWizard.isPhasedOut = true;
            effects.push(new EffectTimerPhase(card.action, 2, playerWizard));
            break;
    }

    spellsCastLifetime++;
    removeElement(card, cards);
    changeGameState(GameState.CAST_SPELL_EFFECT);
    let spellEffectSound = assetLoader.getSound(SoundAsset.SPELL_THUNDER_1);
    spellEffectSound.addEventListener("ended", (e) => {
        changeGameState(GameState.PLAYER_ACTION_SELECT);
    }, { once: true });
    spellEffectSound.play();
}

function update() {

    temporaryEntities = temporaryEntities.filter(ent => {
        return ent.expiresOnGameState != gameState
    });


    if (gameState == GameState.INTRO) {
        // skip
    } else if (gameState == GameState.LOAD_START) {
        // skip
    } else if (gameState == GameState.LOAD_COMPLETE) {
        // skip
    } else if (gameState == GameState.GAME_OVER) {
        // skip
    } else if (gameState == GameState.CAST_SPELL_EFFECT) {

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

        var hasFreeze = effects.map(ef => { return ef.effectType == SpellAction.SPELL_FREEZE }).includes(true);

        // Monsters plot thier moves here
        if (gameState == GameState.ENEMY_MOVE_PREPARE) {
            if (!hasFreeze) {
                entities
                    .filter(entity => { return entity instanceof Monster })
                    .filter(entity => { return entity.mover == null || entity.mover.isAlive == false })
                    .forEach(entity => {
                        switch (entity.behavior) {

                            case MonsterMovementBehavior.CHASE_PLAYER:
                            case MonsterMovementBehavior.RANDOM:
                            case MonsterMovementBehavior.FLEE_PLAYER:
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
                                        let newMonster = new Monster("monsterSpawn", entity.x, entity.y, MonsterMovementBehavior.REPLICATE, assetLoader.getImage(ImageAsset.MONSTER_BLOB_1));
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


                changeGameState(GameState.ENEMY_MOVE_EXECUTE);
            } else {
                changeGameState(GameState.PLAYER_ACTION_SELECT);
            }

        }

        movers.forEach(mover => {
            if (gameState == GameState.PLAYER_ACTION_EXECUTE) {
                if (mover.entity instanceof Wizard) {
                    mover.update();
                }
            } else if (gameState == GameState.ENEMY_MOVE_EXECUTE) {
                if (mover.entity instanceof Monster && !hasFreeze) {
                    mover.update();
                }
            }
        });


        if (gameState == GameState.ENEMY_MOVE_EXECUTE) {
            if (movers.every(mover => { mover.isAlive == false })) {
                changeGameState(GameState.PLAYER_ACTION_SELECT);
            }
        }

        // Consume the collectables
        collectables
            .filter(item => item.isCollected == false && playerWizard.isPhasedOut == false)
            .forEach(item => {
                if (isWithinCollisionDistance(playerWizard, item, 0)) {
                    item.isCollected = true;
                    goldCollected += 100;
                    goldGatheredLifetime += 100;
                    playCoinSound();
                }
            });

        // Award BONUS for collecting everything
        if (collectables.length == 0) {
            if (bonusAwarded == false) {
                playBonusSound();
                var bonusValue = level * 100;
                goldCollected += bonusValue;
                goldGatheredLifetime += bonusValue;
                console.log(`* BONUS ${bonusValue} PTS *`);
            }
            bonusAwarded = true;
        }

        // Remove all acquired collectables
        collectables = collectables.filter(item => item.isCollected == false);


        // Check for COLLECTABLE MONSTER
        entities.filter((ent) => { return ent instanceof CollectableMonster }).forEach((mon) => {
            if (isWithinCollisionDistance(playerWizard, mon, 0)) {
                assetLoader.getSound(SoundAsset.SUCCESS).play();
                mon.isAlive = false;
                goldCollected += 1000;
                goldBankedLifetime += 1000;
            }
        });

        // Check for player / entity collisions / level descents
        let fatalEntity = getFatalEntity(playerWizard, hazards.concat(entities));
        if (fatalEntity.length > 0) {
            // Check for GAME OVER: HAZARDS and MONSTERS...
            gameOver(fatalEntity[0]);
        } else if (isWithinCollisionDistance(playerWizard, portal, 0)) {
            // ...or LEVEL DESCENT
            effects = [];
            changeGameState(GameState.CAST_SPELL_EFFECT);
            let descendSound = assetLoader.getSound(SoundAsset.DESCEND);
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

        temporaryEntities.forEach(temp => {
            temp.render(context);
        })

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
    // updateStatistics();
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
                            movesThisRun++;
                            movesLifetime++;
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
                            movesThisRun++;
                            movesLifetime++;
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
                            movesThisRun++;
                            movesLifetime++;
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
                            movesThisRun++;
                            movesLifetime++;
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

    let finalScore = Math.floor((goldCollected / movesThisRun) * level);
    console.log("----------------------------------------------------------");
    console.log("Wizard was slain: GAME OVER");
    console.log(`LEVEL ACHIEVED: ${level}`);
    console.log(`TOTAL MOVES: ${movesThisRun}`);
    console.log(`TREASURE COLLECTED: ${goldCollected}`);
    console.log(`FINAL SCORE: ${finalScore}`);
    console.log("----------------------------------------------------------");

    updateStatistics();
    changeGameState(GameState.GAME_OVER);
    backgroundMusicPlayer.playbackRate = 0.5;
    effects = [];
    specialEffects.push(
        new SpecialEffectDeath(canvas.width, canvas.height, playerWizard, fatalEntity)
    );

    var gameOverSound = assetLoader.getSound(SoundAsset.PLAYER_DIES);
    gameOverSound.currentTime = 0;
    gameOverSound.addEventListener("ended", (e) => {
        changeGameState(GameState.SHOW_SCORE);
        showScore();
    }, { once: true });
    gameOverSound.play();
}

function showScore() {
    let scoreDisplay = document.getElementById("scoreDisplay");
    document.getElementById("level").textContent = `LEVEL: ${level}`;
    document.getElementById("gold").textContent = `GOLD COLLECTED: ${goldCollected}`;
    document.getElementById("moves").textContent = `MOVES: ${movesThisRun}`;
    document.getElementById("debt").textContent = `${debtTotal} GOLD`;
    scoreDisplay.style["display"] = "block";
}

function hideScore() {
    let scoreDisplay = document.getElementById("scoreDisplay");
    scoreDisplay.style["display"] = "none";
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
        var isUnobstruced = checkUnobstructed(destinationX, destinationY) || playerWizard.isPhasedOut;
        return isUnobstruced && inBounds;
    }
}


function checkInBounds(destinationX, destinationY) {
    var inBounds = (destinationX >= 0) && (destinationX < mapWidth) && (destinationY >= 0) && (destinationY < mapHeight);
    return inBounds;
}

function checkUnobstructed(destinationX, destinationY) {
    var isObstructed = obstacles.map(obstacle => {
        return (destinationX == obstacle.x) && (destinationY == obstacle.y)
    });
    return !isObstructed.includes(true);
}

function getFatalEntity(source, potentials) {
    var fatalEntities = potentials.map((entity) => {
        if ((source !== entity) && (entity.isLethal == true) && (isWithinCollisionDistance(source, entity, 0)) && !playerWizard.isPhasedOut) {
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
            allTiles.push({ x: cols, y: rows });
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
        occupiedGrids.push({ x: Math.floor(entity.x / tileSize), y: Math.floor(entity.y / tileSize) })
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
        case MonsterMovementBehavior.FLEE_PLAYER:
            return getMoverFromTarget(monster, target);
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
    var selectedMover = potentialMovers[0];
    if (selectedMover != null) {
        if (selectedMover.deltaX < 0) {
            selectedMover.direction = ControlInput.LEFT;
        } else if (selectedMover.deltaX > 0) {
            selectedMover.direction = ControlInput.RIGHT;
        } else if (selectedMover.deltaY < 0) {
            selectedMover.direction = ControlInput.UP;
        } else if (selectedMover.deltaY > 0) {
            selectedMover.direction = ControlInput.DOWN;
        }
    }

    return selectedMover;
}

/**
 * Returns a (nullable) mover which is guaranteed to MOVE AWAY from the target entity
 */
function getMoverFromTarget(monster, target) {

    var distance = (Math.abs(monster.x - target.x) / tileSize) + (Math.abs(monster.y - target.y) / tileSize);
    if (distance > 5) {
        return null;
    }

    var mover = null;

    var potentialDestinations = getUnoccupiedAdjacencies(monster)
        .filter((adj) => {
            return checkIsValidMove(monster, adj.x, adj.y)
        }).sort((a, b) => {
            if (Math.abs(target.x - a.x) + Math.abs(target.y - a.y) < Math.abs(target.x - b.x) + Math.abs(target.y - b.y)) {
                return 1;
            } else {
                return -1;
            }
        });

    var potentialDestination = potentialDestinations[0];

    if (potentialDestination != null) {

        var deltaX = 0;
        var deltaY = 0;

        if (potentialDestination.x != monster.x) {
            if (potentialDestination.x > monster.x) {
                deltaX = monsterMovePerTick;
            } else if (potentialDestination.x < monster.x) {
                deltaX = -monsterMovePerTick;
            }
        } else if (potentialDestination.y != monster.y) {
            if (potentialDestination.y > monster.y) {
                deltaY = monsterMovePerTick;
            } else if (potentialDestination.y < monster.y) {
                deltaY = -monsterMovePerTick;
            }
        }

        mover = new Mover(monster, potentialDestination.x, potentialDestination.y, deltaX, deltaY, () => { });
    }

    return mover;
}

function getRandomMover(monster) {

    var potentialMoves = [];
    var targetX = 0;
    var targetY = 0;
    var mover;

    // move down
    targetY = monster.y + tileSize;
    if (checkIsValidMove(monster, monster.x, targetY)) {
        mover = new Mover(monster, monster.x, targetY, 0, monsterMovePerTick, () => { });
        mover.direction = ControlInput.DOWN;
        potentialMoves.push(mover);
    }

    // move up
    targetY = monster.y - tileSize;
    if (checkIsValidMove(monster, monster.x, targetY)) {
        mover = new Mover(monster, monster.x, targetY, 0, -monsterMovePerTick, () => { });
        mover.direction = ControlInput.UP;
        potentialMoves.push(mover);
    }


    // move left
    targetX = monster.x - tileSize;
    if (checkIsValidMove(monster, targetX, monster.y)) {
        mover = new Mover(monster, targetX, monster.y, -monsterMovePerTick, 0, () => { });
        mover.direction = ControlInput.LEFT;
        potentialMoves.push(mover);
    }

    // move right
    targetX = monster.x + tileSize;
    if (checkIsValidMove(monster, targetX, monster.y)) {
        mover = new Mover(monster, targetX, monster.y, monsterMovePerTick, 0, () => { });
        mover.direction = ControlInput.RIGHT;
        potentialMoves.push(mover);
    }

    shuffle(potentialMoves);
    return potentialMoves[0];
}



/** --- SOUNDS --- */
function playStepSound() {
    var stepSound = assetLoader.getSound(SoundAsset.MOVE_2);
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
    var sound = assetLoader.getSound(SoundAsset.BONUS);
    sound.currentTime = 0;
    sound.play();
}

function updateAudio() {

    if (backgroundMusicPlayer == null) {
        backgroundMusicPlayer = assetLoader.getSound(SoundAsset.BGM);
        backgroundMusicPlayer.loop = true;
        backgroundMusicPlayer.pause();
    }

    if (audioConfig.bgmEnabled) {
        if (backgroundMusicPlayer.paused == true) {
            backgroundMusicPlayer.play();
        } else {
            backgroundMusicPlayer.pause();
        }
    } else {
        backgroundMusicPlayer.pause();
    }
}

function updateEffects() {
    effects.forEach(ef => { ef.update() });
    effects = effects.filter(ef => { return ef.isAlive })
}

/* --- CONVENIENCE METHODS --- */
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


/** --- STATISTICS and DATA STORAGE --- */
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

function loadStatistics() {
    console.log("Loading stats...");
    if (storageAvailable("localStorage")) {
        // check for prior population
        if (Number(localStorage.getItem("statisticVersion")) != statisticVersion) {
            updateStatistics();
        } else {
            debtTotal = Number(localStorage.getItem("debtTotal"));
            attemptsLifetime = Number(localStorage.getItem("attemptsLifetime"));
            highScoreLifetime = Number(localStorage.getItem("highScoreLifetime"));
            movesLifetime = Number(localStorage.getItem("movesLifetime"));
            spellsCastLifetime = Number(localStorage.getItem("spellsCastLifetime"));
            furthestLevelAchieved = Number(localStorage.getItem("furthestLevelAchieved"));
            goldGatheredLifetime = Number(localStorage.getItem("goldGatheredLifetime"));
            goldBankedLifetime = Number(localStorage.getItem("goldBankedLifetime"));
        }

        if (debugOutput) {
            console.log(`debtTotal: ${debtTotal}`);
            console.log(`attemptsLifetime: ${attemptsLifetime}`);
            console.log(`highScoreLifetime: ${highScoreLifetime}`);
            console.log(`movesLifetime: ${movesLifetime}`);
            console.log(`spellsCastLifetime: ${spellsCastLifetime}`);
            console.log(`furthestLevelAchieved: ${furthestLevelAchieved}`);
            console.log(`goldGatheredLifetime: ${goldGatheredLifetime}`);
            console.log(`goldBankedLifetime: ${goldBankedLifetime}`);
        }

    } else {
        console.log("Thy scores and statistics shall not be saved across sessions. A pity!");
    }
}

function updateStatistics() {

    if (storageAvailable("localStorage")) {
        localStorage.setItem("statisticVersion", statisticVersion);
        localStorage.setItem("debtTotal", debtTotal);
        localStorage.setItem("attemptsLifetime", attemptsLifetime);
        localStorage.setItem("highScoreLifetime", highScoreLifetime);
        localStorage.setItem("movesLifetime", movesLifetime);
        localStorage.setItem("spellsCastLifetime", spellsCastLifetime);
        localStorage.setItem("furthestLevelAchieved", furthestLevelAchieved);
        localStorage.setItem("goldGatheredLifetime", goldGatheredLifetime);
        localStorage.setItem("goldBankedLifetime", goldBankedLifetime);
    }
}




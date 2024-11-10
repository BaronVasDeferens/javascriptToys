import { Card, Collectable, Monster, MonsterMovementBehavior, Mover, Obstacle, Wizard } from './entity.js';
import { AssetLoader, ImageLoader, ImageAsset, SoundAsset, } from './AssetLoader.js';

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();

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

let playerWizard;
let wizardMovePerTick = 8;

let numObstacles = 5;
let numCollectables = 5;

let numMonstersBasic = 3;
let numMonstersScary = 1;
let monsterMovePerTick = 4;

let entities = [];
let controlInput = null;
var movers = [];
var collectables = [];
var obstacles = [];

let backgroundImage = new Image();

var delayValue = 0;
let delayValueIncrement = 2;

class Tile {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const ControlInput = Object.freeze({
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
});

const GameState = Object.freeze({
    INTRO: "Intro",
    DRAW_CARDS: "Drawing cards...",
    PLAYER_ACTION_SELECT: "Player choosing action...",
    PLAYER_ACTION_EXECUTE: "Player executes action",
    ENEMY_MOVE_PREPARE: "Enemies plan their moves...",
    ENEMY_MOVE_EXECUTE: "Enemies moving!",
    GAME_OVER: "GAME OVER"
});

var gameState = GameState.DRAW_CARDS;

const ActionCard = Object.freeze({
    ACTION_CARD_UP: "ACTION_CARD_UP",
    ACTION_CARD_DOWN: "ACTION_CARD_DOWN",
    ACTION_CARD_LEFT: "ACTION_CARD_LEFT",
    ACTION_CARD_RIGHT: "ACTION_CARD_RIGHT"
});
let actionCards = [
    ActionCard.ACTION_CARD_UP,
    ActionCard.ACTION_CARD_DOWN,
    ActionCard.ACTION_CARD_LEFT,
    ActionCard.ACTION_CARD_RIGHT
];

var cardA;
var cardB;

/** ------- KEYBOARD INPUT -------- */
document.addEventListener('keydown', (e) => {
    if (gameState == GameState.PLAYER_ACTION_SELECT && controlInput == null) {
        switch (e.key) {
            case "ArrowUp":
            case "w":
            case "W":
                if (checkValidMove(playerWizard.x, playerWizard.y - tileSize)) {
                    controlInput = ControlInput.UP
                    movers.push(
                        new Mover(
                            playerWizard,
                            playerWizard.x,
                            playerWizard.y - tileSize,
                            0,
                            -wizardMovePerTick,
                            () => {
                                controlInput = null;
                                gameState = GameState.ENEMY_MOVE_PREPARE;
                            }
                        )
                    )
                    gameState = GameState.PLAYER_ACTION_EXECUTE;
                }
                break;
            case "ArrowDown":
            case "s":
            case "S":
                if (checkValidMove(playerWizard.x, playerWizard.y + tileSize)) {
                    controlInput = ControlInput.DOWN
                    movers.push(
                        new Mover(
                            playerWizard,
                            playerWizard.x,
                            playerWizard.y + tileSize,
                            0,
                            wizardMovePerTick,
                            () => {
                                controlInput = null;
                                gameState = GameState.ENEMY_MOVE_PREPARE;
                            }
                        )
                    )
                    gameState = GameState.PLAYER_ACTION_EXECUTE;
                }
                break;
            case "ArrowLeft":
            case "a":
            case "A":
                if (checkValidMove(playerWizard.x - tileSize, playerWizard.y)) {
                    controlInput = ControlInput.LEFT
                    movers.push(
                        new Mover(
                            playerWizard,
                            playerWizard.x - tileSize,
                            playerWizard.y,
                            -wizardMovePerTick,
                            0,
                            () => {
                                controlInput = null;
                                gameState = GameState.ENEMY_MOVE_PREPARE;
                            }
                        )
                    )
                    gameState = GameState.PLAYER_ACTION_EXECUTE;
                }
                break;
            case "ArrowRight":
            case "d":
            case "D":
                if (checkValidMove(playerWizard.x + tileSize, playerWizard.y)) {
                    controlInput = ControlInput.RIGHT
                    movers.push(
                        new Mover(
                            playerWizard,
                            playerWizard.x + tileSize,
                            playerWizard.y,
                            wizardMovePerTick,
                            0,
                            () => {
                                controlInput = null;
                                gameState = GameState.ENEMY_MOVE_PREPARE;
                            }
                        )
                    )
                    gameState = GameState.PLAYER_ACTION_EXECUTE;
                }
                break;
            case "Escape":
                initializeGameState();
                break;
            case "-":
                delayValue += delayValueIncrement;
                console.log(`Slowing down...${delayValue}`);
                break;
            case "+":
                delayValue -= delayValueIncrement;
                if (delayValue <= 0) {
                    delayValue = 0;
                }
                console.log(`Speeding up...${delayValue}`);
                break;
        }
    }

});

/**--------- MOUSE INPUT -----------*/
document.addEventListener('mousedown', (e) => {

    if (gameState == GameState.PLAYER_ACTION_SELECT) {

        var rect = e.target.getBoundingClientRect();
        var clickX = e.clientX - rect.left; //x position within the element.
        var clickY = e.clientY - rect.top;  //y position within the element.

        if (cardA.containsClick(clickX, clickY)) {
            processCardAction(cardA.action);
        } else if (cardB.containsClick(clickX, clickY)) {
            processCardAction(cardB.action);
        }
    }
});

var setup = function () {
    // Set background to display "loading" text
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#FF0000";
    context.lineWidth = 2.0;
    context.font = "24px sans-serif";
    context.fillText("LOADING", (canvas.width / 2) - 48, (canvas.height / 2));

    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, () => {
        initializeGameState();
        beginGame();
    });
}();

function initializeGameState() {

    console.log("Initializing...");
    gameState = GameState.DRAW_CARDS;

    // Clear out prior data
    movers = [];
    entities = [];
    collectables = [];
    obstacles = [];
    controlInput = null;
    cardA = null;
    cardB = null;

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

    // Add BASIC monsters
    for (var i = 0; i < numMonstersBasic; i++) {
        var location = getSingleUnoccupiedGrid();
        entities.push(
            new Monster(
                `monster_${i}`, location.x * tileSize, location.y * tileSize, MonsterMovementBehavior.RANDOM, imageLoader.getImage(ImageAsset.MONSTER_2)
            )
        );
    }

    // Add SCARY monsters
    for (var i = 0; i < numMonstersScary; i++) {
        var location = getSingleUnoccupiedGrid();
        entities.push(
            new Monster(
                `monster_chaser_${i}`, location.x * tileSize, location.y * tileSize, MonsterMovementBehavior.CHASE_PLAYER, imageLoader.getImage(ImageAsset.MONSTER_1)
            )
        );
    }


    // Add collectables
    var coinImages = imageLoader.getTilesetForName("GOLDSTACKS");
    for (var i = 0; i < numCollectables; i++) {
        var location = getSingleUnoccupiedGrid();
        collectables.push(
            new Collectable(`gold_${i}`, location.x * tileSize, location.y * tileSize, coinImages[randomIntInRange(0, coinImages.length)])
        );
    }

    renderBackground(context);
}

function renderBackground(context) {
    // Renders the background once and re-uses the image
    console.log("Rendering background...");

    // Prepare the background
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiles onto the background image
    let tiles = imageLoader.getTilesetForName("FLESH_GROUND");
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            context.drawImage(tiles[randomIntInRange(0, tiles.length)], i * tileSize, j * tileSize);
        }
    }

    obstacles.forEach(ob => { ob.render(context) });

    var updatedSrc = canvas.toDataURL();
    backgroundImage.src = updatedSrc;
}

async function beginGame() {
    await new Promise(resolve => setTimeout(resolve, delayValue));
    updateGameState();
    drawScene()
    requestAnimationFrame(beginGame);
}

// ------------ START MAIN GAME LOOP ------------

function processCardAction(cardAction) {
    switch (cardAction) {
        case ActionCard.ACTION_CARD_UP:
            if (checkValidMove(playerWizard.x, playerWizard.y - tileSize)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x,
                        playerWizard.y - tileSize,
                        0,
                        -wizardMovePerTick,
                        () => {
                            gameState = GameState.ENEMY_MOVE_PREPARE;
                        }
                    )
                )
                gameState = GameState.PLAYER_ACTION_EXECUTE;
            }
            break;
        case ActionCard.ACTION_CARD_DOWN:
            if (checkValidMove(playerWizard.x, playerWizard.y + tileSize)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x,
                        playerWizard.y + tileSize,
                        0,
                        wizardMovePerTick,
                        () => {
                            gameState = GameState.ENEMY_MOVE_PREPARE
                        }
                    )
                )
                gameState = GameState.PLAYER_ACTION_EXECUTE;
            }
            break;
        case ActionCard.ACTION_CARD_LEFT:
            if (checkValidMove(playerWizard.x - tileSize, playerWizard.y)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x - tileSize,
                        playerWizard.y,
                        -wizardMovePerTick,
                        0,
                        () => {
                            gameState = GameState.ENEMY_MOVE_PREPARE;
                        }
                    )
                )
                gameState = GameState.PLAYER_ACTION_EXECUTE;
            }
            break;
        case ActionCard.ACTION_CARD_RIGHT:
            if (checkValidMove(playerWizard.x + tileSize, playerWizard.y)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x + tileSize,
                        playerWizard.y,
                        wizardMovePerTick,
                        0,
                        () => {
                            gameState = GameState.ENEMY_MOVE_PREPARE;
                        }
                    )
                )
                gameState = GameState.PLAYER_ACTION_EXECUTE;
            }
            break;
    }

}

function updateGameState() {

    // Clean out dead movers
    movers = movers.filter(mover => {
        return mover.isAlive;
    });

    if (gameState == GameState.DRAW_CARDS) {

        shuffle(actionCards);
        var action = actionCards[0];
        cardA = new Card(10, 650, action, getImageForAction(action));
        entities.push(cardA);

        action = actionCards[1];
        cardB = new Card(330, 650, action, getImageForAction(action));
        entities.push(cardB);

        gameState = GameState.PLAYER_ACTION_SELECT;
    }


    // Monsters plot thier moves here
    if (gameState == GameState.ENEMY_MOVE_PREPARE) {
        entities
            .filter(entity => { return entity instanceof Monster })
            .forEach(entity => {
                if (entity.mover == null || entity.mover.isAlive == false) {
                    var mover = getMonsterMover(entity, playerWizard);
                    if (mover != null) {
                        entity.setMover(mover);
                        movers.push(mover);
                    }
                }

            })
        gameState = GameState.ENEMY_MOVE_EXECUTE;
    }

    var currentMover = movers[0];
    if (currentMover != null) {
        currentMover.update();
    }

    if (gameState == GameState.ENEMY_MOVE_EXECUTE) {
        if (movers.every(mover => { mover.isAlive == false })) {
            gameState = GameState.DRAW_CARDS;
        }
    }

    // movers.forEach(mover => {
    //     mover.update();
    // });

    // Check for GAME OVER
    if (checkFatalCollision(playerWizard, entities)) {
        initializeGameState();
    }

    // Consume the collectables
    collectables.forEach(item => {
        if (isWithinCollisionDistance(playerWizard, item, 0)) {
            item.isCollected = true;
        }
    });

    // Remove all acquired collectables
    collectables = collectables.filter(item => item.isCollected == false);
}

function drawScene() {

    // Draw background
    context.fillStyle = "#FF0000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(backgroundImage, 0, 0);
    //context.imageSmoothingEnabled = false;

    // Draw collectables
    collectables.forEach(item => {
        item.render(context);
    })

    // Draw entities
    entities.forEach(entity => {
        entity.render(context);
    });

}

// ------------ END MAIN GAME LOOP ------------





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

function getImageForAction(action) {
    switch (action) {
        case ActionCard.ACTION_CARD_UP:
            return imageLoader.getImage(ImageAsset.ACTION_CARD_UP);
        case ActionCard.ACTION_CARD_DOWN:
            return imageLoader.getImage(ImageAsset.ACTION_CARD_DOWN);
        case ActionCard.ACTION_CARD_LEFT:
            return imageLoader.getImage(ImageAsset.ACTION_CARD_LEFT);
        case ActionCard.ACTION_CARD_RIGHT:
            return imageLoader.getImage(ImageAsset.ACTION_CARD_RIGHT);
    }
}

function checkValidMove(destinationX, destinationY) {
    return checkInBounds(destinationX, destinationY) && checkUnobstructed(destinationX, destinationY) // && checkDestination(destinationX, destinationY);
}

function checkInBounds(destinationX, destinationY) {
    var inBounds = (destinationX >= 0) && (destinationX < mapWidth) && (destinationY >= 0) && (destinationY < mapHeight);
    return inBounds;
}

function checkDestination(destinationX, destinationY) {
    var destinationOccupied = movers.map(mover => { return mover.destinationX == destinationX && mover.destinationY == destinationY });
    return !destinationOccupied.includes(true);
}

function checkUnobstructed(destinationX, destinationY) {
    var isObstructed = obstacles.map(obstacle => {
        //console.log(`OBSTRUCTED ${obstacle.x} : ${(destinationX == obstacle.x) && (destinationY == obstacle.y)}`)
        return (destinationX == obstacle.x) && (destinationY == obstacle.y)
    });
    return !isObstructed.includes(true);
}

function checkFatalCollision(source, entities) {
    var collisions = entities.map((entity) => {
        if (source === entity) {
            return false;
        } else {
            return isWithinCollisionDistance(source, entity, 32)
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
    ;
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

    entities.forEach(entity => {
        occupiedGrids.push(new Tile(Math.floor(entity.x / tileSize), Math.floor(entity.y / tileSize)))
    });

    collectables.forEach(item => {
        occupiedGrids.push(new Tile(Math.floor(item.x / tileSize), Math.floor(item.y / tileSize)))
    });

    obstacles.forEach(obstacle => {
        occupiedGrids.push(new Tile(Math.floor(obstacle.x / tileSize), Math.floor(obstacle.y / tileSize)))
    });

    return occupiedGrids;
}

function getMonsterMover(monster, target) {
    switch (monster.behavior) {
        case MonsterMovementBehavior.CHASE_PLAYER:
            return getMoverToTarget(monster, target);
        case MonsterMovementBehavior.RANDOM:
        default:
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

    if (checkValidMove(destinationX, monster.y) && deltaX != 0) {
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

    if (checkValidMove(monster.x, destinationY) && deltaY != 0) {
        potentialMovers.push(new Mover(monster, monster.x, destinationY, 0, deltaY, () => { }));
    }

    shuffle(potentialMovers);
    return potentialMovers[0];
}

function getRandomMover(monster) {

    var potentialMoves = [];
    var targetX = 0;
    var targetY = 0;

    // move down
    targetY = monster.y + tileSize;
    if (checkValidMove(monster.x, targetY)) {
        let mover = new Mover(monster, monster.x, targetY, 0, monsterMovePerTick, () => { })
    }

    // move up
    targetY = monster.y - tileSize;
    if (checkValidMove(monster.x, targetY)) {
        let mover = new Mover(monster, monster.x, targetY, 0, -monsterMovePerTick, () => { })
        potentialMoves.push(mover);
    }


    // move left
    targetX = monster.x - tileSize;
    if (checkValidMove(targetX, monster.y)) {
        let mover = new Mover(monster, targetX, monster.y, -monsterMovePerTick, 0, () => { })
        potentialMoves.push(mover);
    }

    // move right
    targetX = monster.x + tileSize;
    if (checkValidMove(targetX, monster.y)) {
        let mover = new Mover(monster, targetX, monster.y, monsterMovePerTick, 0, () => { })
        potentialMoves.push(mover);
    }


    shuffle(potentialMoves);
    return potentialMoves[0];
}



import { Card, Collectable, Monster, Mover, Wizard } from './entity.js';
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

let monsterMovePerTick = 2;

let entities = [];
let controlInput = null;
var movers = [];
var collectables = [];

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
    PLAYER_CHOOSE_CARD: "Choose Card",
    PLAYER_EXECUTE_CARD: "Player executes action",
    ENEMY_MOVE: "Enemies move...",
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


document.addEventListener('keydown', (e) => {
    if (controlInput == null) {
        switch (e.key) {
            case "ArrowUp":
            case "w":
                if (checkInBounds(playerWizard.x, playerWizard.y - tileSize)) {
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
                            }
                        )
                    )
                }
                break;
            case "ArrowDown":
            case "s":
                if (checkInBounds(playerWizard.x, playerWizard.y + tileSize)) {
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
                            }
                        )
                    )
                }
                break;
            case "ArrowLeft":
            case "a":
                if (checkInBounds(playerWizard.x - tileSize, playerWizard.y)) {
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
                            }
                        )
                    )
                }
                break;
            case "ArrowRight":
            case "d":
                if (checkInBounds(playerWizard.x + tileSize, playerWizard.y)) {
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
                            }
                        )
                    )
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

document.addEventListener('mousedown', (e) => {
    if (gameState == GameState.PLAYER_CHOOSE_CARD) {
        if (cardA.containsClick(e.x, e.y)) {
            console.log("player chose card A");
            processCardAction(cardA.action);
        } else if (cardB.containsClick(e.x, e.y)) {
            console.log("player chose card B");
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
    controlInput = null;
    cardA = null;
    cardB = null;

    // Set up player
    var location = getSingleUnoccupiedGrid();
    playerWizard = new Wizard("wizard", location.x * tileSize, location.y * tileSize, imageLoader.getImage(ImageAsset.WIZARD_2));
    entities.push(playerWizard);

    // Add monsters
    for (var i = 0; i < 10; i++) {
        var location = getSingleUnoccupiedGrid();
        entities.push(new Monster(`monster_${i}`, location.x * tileSize, location.y * tileSize, imageLoader.getImage(ImageAsset.MONSTER_1)));
    }

    // Add collectables
    var coinImages = imageLoader.getTilesetForName("GOLDSTACKS");
    for (var i = 0; i < 10; i++) {
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
            if (checkInBounds(playerWizard.x, playerWizard.y - tileSize)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x,
                        playerWizard.y - tileSize,
                        0,
                        -wizardMovePerTick,
                        () => {
                            gameState = GameState.ENEMY_MOVE
                        }
                    )
                )
            }
            break;
        case ActionCard.ACTION_CARD_DOWN:
            if (checkInBounds(playerWizard.x, playerWizard.y + tileSize)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x,
                        playerWizard.y + tileSize,
                        0,
                        wizardMovePerTick,
                        () => {
                            gameState = GameState.ENEMY_MOVE
                        }
                    )
                )
            }
            break;
        case ActionCard.ACTION_CARD_LEFT:
            if (checkInBounds(playerWizard.x - tileSize, playerWizard.y)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x - tileSize,
                        playerWizard.y,
                        -wizardMovePerTick,
                        0,
                        () => {
                            gameState = GameState.ENEMY_MOVE
                        }
                    )
                )
            }
            break;
        case ActionCard.ACTION_CARD_RIGHT:
            if (checkInBounds(playerWizard.x + tileSize, playerWizard.y)) {
                movers.push(
                    new Mover(
                        playerWizard,
                        playerWizard.x + tileSize,
                        playerWizard.y,
                        wizardMovePerTick,
                        0,
                        () => {
                            gameState = GameState.ENEMY_MOVE
                        }
                    )
                )
            }
            break;
    }

    gameState = GameState.PLAYER_EXECUTE_CARD;

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

        gameState = GameState.PLAYER_CHOOSE_CARD;
    }


    // Move the monsters
    if (gameState == GameState.ENEMY_MOVE) {
        entities
            .filter(entity => { return entity instanceof Monster })
            .forEach(entity => {
                if (entity.mover == null || entity.mover.isAlive == false) {
                    // chose a new destination
                    switch (randomIntInRange(0, 4)) {  // <-- decrease the second value to make the monsters' movement less "confident"
                        case 0:
                            // move down
                            var targetY = entity.y + tileSize;
                            if (checkInBounds(entity.x, targetY)) {
                                let mover = new Mover(entity, entity.x, targetY, 0, monsterMovePerTick, () => { })
                                entity.setMover(mover);
                                movers.push(mover);
                            }
                            break;
                        case 1:
                            // move up
                            var targetY = entity.y - tileSize;
                            if (checkInBounds(entity.x, targetY)) {
                                let mover = new Mover(entity, entity.x, targetY, 0, -monsterMovePerTick, () => { })
                                entity.setMover(mover);
                                movers.push(mover);
                            }
                            break;
                        case 2:
                            // move left
                            var targetX = entity.x - tileSize;
                            if (checkInBounds(targetX, entity.y)) {
                                let mover = new Mover(entity, targetX, entity.y, -monsterMovePerTick, 0, () => { })
                                entity.setMover(mover);
                                movers.push(mover);
                            }
                            break;
                        case 3:
                            // move right
                            var targetX = entity.x + tileSize;
                            if (checkInBounds(targetX, entity.y)) {
                                let mover = new Mover(entity, targetX, entity.y, monsterMovePerTick, 0, () => { })
                                entity.setMover(mover);
                                movers.push(mover);
                            }
                            break;
                    }
                }
            })

            gameState = GameState.DRAW_CARDS;
    }


    movers.forEach(mover => {
        mover.update();
    });

    // Check for GAME OVER
    if (checkCollision(playerWizard, entities)) {
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

function checkInBounds(destinationX, destinationY) {
    var inBounds = (destinationX >= 0) && (destinationX < mapWidth) && (destinationY >= 0) && (destinationY < mapHeight);
    return inBounds
}

function checkCollision(source, entities) {
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
    var occupiedGrids = getAllOccupiedGrids().sort();

    occupiedGrids.forEach(occupied => {
        allTiles = allTiles.filter(grid => { return JSON.stringify(grid) !== JSON.stringify(occupied) });
    });

    return allTiles[randomIntInRange(0, allTiles.length)];
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

    return occupiedGrids;
}



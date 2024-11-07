import { Collectable, Monster, Mover, Wizard } from './entity.js';
import { AssetLoader, ImageLoader, ImageAsset, SoundAsset, } from './AssetLoader.js';

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 640;

let tileSize = 64;
let tileCols = canvas.width / tileSize;
let tileRows = canvas.height / tileSize;

let playerWizard;
let wizardMovePerTick = 8;

let monsterMovePerTick = 2;

let entities = [];
let controlInput = null;
var movers = [];
var collectables = [];

let backgroundImage = new Image();

var delayValue = 0;
let delayValueIncrement = 2

const ControlInput = Object.freeze({
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
});

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

var setup = function () {
    // Set background to display "loading" text
    context.fillStyle = "#000000";
    context.fillRect(0, 0, innerWidth, innerHeight);
    context.strokeStyle = "#000000";
    context.fillStyle = "#FF0000";
    context.lineWidth = 2.0;
    context.font = "24px sans-serif";
    context.fillText("LOADING", (canvas.width / 2) - 48, (canvas.height / 2));

    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, () => {
        initializeGameState();
        console.log("Begin game!");
        beginGame();
    });
}();

function initializeGameState() {
    console.log("Initializing...");

    // Clear out prior data
    movers = [];
    entities = [];
    collectables = [];
    controlInput = null;

    // Set up player
    playerWizard = new Wizard("wizard", 0, 0, imageLoader.getImage(ImageAsset.WIZARD_2));
    entities.push(playerWizard);

    // Add monsters
    for (var i = 0; i < 9; i++) {
        var location = findUnoccupiedGrid();
        entities.push(new Monster(`monster_${i}`, location.x * tileSize, location.y * tileSize, imageLoader.getImage(ImageAsset.MONSTER_1)));
    }

    // Add collectables
    var coinImages = imageLoader.getTilesetForName("GOLDSTACKS");
    for (var i = 1; i < 10; i++) {
        var location = findUnoccupiedGrid();
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
    context.fillStyle = "#b8bab9";
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

function updateGameState() {

    // Clean out dead movers
    movers = movers.filter(mover => {
        return mover.isAlive;
    });

    // Move the monsters
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
    context.fillStyle = "#b8bab9";
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

function checkInBounds(destinationX, destinationY) {
    var inBounds = (destinationX >= 0) && (destinationX < canvas.width) && (destinationY >= 0) && (destinationY < canvas.height);
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

    // if (collisionDetected) {
    //     console.log(`>>> ${entityA.id} COLLIDES WITH ${entityB.id} <<<`);
    // }

    return collisionDetected;
}

/**
 * @returns a single grid space (x,y) that contains no other entity 
 */
function findUnoccupiedGrid() {
    var allGrids = [];
    for (var cols = 0; cols < tileCols; cols++) {
        for (var rows = 0; rows < tileRows; rows++) {
            allGrids.push( {x: cols, y: rows} );
        }
    }

    getOccupiedGrids().forEach( grid => {
        var index = allGrids.indexOf(grid);
        if (index != -1) {
            allGrids.splice(index, 1);
        }
    });

    return allGrids[randomIntInRange(0, allGrids.length)];
}

/**
 * Returns the list of all grid points that have at least one entity (enemy, player, collectable) partially or wholly within them
 */
function getOccupiedGrids() {
    return entities.map(entity => {
        return {
            x: Math.floor(entity.x / tileSize),
            y: Math.floor(entity.y / tileSize)
        }
    }).concat(
        collectables.map(item => {
            return {
                x: item.x / tileSize,
                y: item.y / tileSize
            }
        })
    )
}



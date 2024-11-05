import { Monster, Mover, Wizard } from './entity.js';
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

let backgroundImage = new Image();


const ControlInput = Object.freeze({
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
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
        initialize();
        console.log("Begin game!");
        beginGame();
    });
}();

function initialize() {
    console.log("Initializing...");

    playerWizard = new Wizard("wizard", 0, 0, imageLoader.getImage(ImageAsset.WIZARD_2));
    entities.push(playerWizard);

    for (var i = 0; i < 10; i++) {
        entities.push(new Monster(`monster_${i}`, 5 * tileSize, i * tileSize, imageLoader.getImage(ImageAsset.MONSTER_1)));
    }

    renderBackground(context);
}

function beginGame() {
    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}

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
                switch (randomIntInRange(0, 4)) {
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

    checkCollision(playerWizard, entities);
}

function renderBackground(context) {

    let tilesSze = 64;

    // get random tiles
    let tiles = [];

    imageLoader.getTileSet("MAGIC_DARK").forEach(tile => {
        tiles.push(imageLoader.getImage(tile));
    });


    // Renders the background once and re-uses the image
    console.log("Rendering background...");
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            context.drawImage(tiles[randomIntInRange(0, tiles.length)], i * tilesSze, j * tilesSze);
        }
    }


    var updatedSrc = canvas.toDataURL();
    backgroundImage.src = updatedSrc;
}

function randomIntInRange(min, max) {
    return parseInt(Math.random() * max + min);
};

function drawScene() {

    // Draw background
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0);
    //context.imageSmoothingEnabled = false;

    // Draw entities
    entities.forEach(entity => {
        entity.render(context);
    });

}

function checkInBounds(destinationX, destinationY) {
    var inBounds = (destinationX >= 0) && (destinationX < canvas.width) && (destinationY >= 0) && (destinationY < canvas.height);
    var disallowedTargets = movers.filter(mover => { mover.destinationX == destinationX && mover.destinationY == destinationY }).length;
    // console.log(`${inBounds} ${disallowedTargets == 0}`)
    return inBounds // && disallowedTargets.length == 0;
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
    // console.log(`${entityB.id}: ${xDist} ${yDist}`)

    var collisionDetected = (xDist <= distance) && (yDist <= distance);

    if (collisionDetected) {
        console.log(`>>> ${entityA.id} COLLIDES WITH ${entityB.id} <<<`);
    }
    return collisionDetected;
}

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
        }
    }

});
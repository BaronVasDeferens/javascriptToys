import { GridSquare, GridMap } from './entity.js';
import { AssetLoader, ImageLoader, ImageAsset, SoundLoader, SoundAsset } from './AssetLoader.js';

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();
const soundLoader = new SoundLoader();

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

const gridCols = 20;
const gridRows = 10;
const gridSquareSize = 64;

var gridSquares = new Array(0);
var gridMap = new GridMap(gridSquares);

const EntityPlacementType = Object.freeze({
    OBSTRUCTION: "OBSTRUCTION",
    SOLDIER: "SOLDIER",
    BLOB: "BLOB"
});

const entityPlacementTypes = [
    EntityPlacementType.OBSTRUCTION,
    EntityPlacementType.SOLDIER,
    EntityPlacementType.BLOB
];
var placementIndex = 0;
var placementType = entityPlacementTypes[placementIndex];


/* --- MOUSE --- */

window.onmousedown = function (event) {
    processClick(event);
}

// Prevent the right click from summoning the context menu. Considered "bad form" but LOL whatever
document.addEventListener('contextmenu', event => event.preventDefault());

/* --- KEYBOARD --- */

window.onkeydown = function (event) {
    switch (event.key) {
        case 'e':
            // Cycle through placement modes
            placementIndex = (placementIndex + 1) % entityPlacementTypes.length;
            placementType = entityPlacementTypes[placementIndex];
            console.log(`Placing entity: ${placementType}`);
            break;

        case 's':
            // Save map
            console.log("Saving map file...");
            downloadMapfile(JSON.stringify(gridMap));
            break;

        case 'l':
            // Load map
            console.log("Loading map file...");
            loadMapFile("test.json");
            break;
        default:
            break;
    }
};

/* --- GAME LOGIC --- */

var setup = function () {
    // Set background to display "loading" text
    context.fillStyle = "#FF0000";
    context.fillRect(0, 0, innerWidth, innerHeight);
    context.strokeStyle = "#000000";
    context.fillStyle = "#000000";
    context.lineWidth = 2.0;
    context.font = "24px sans-serif";
    context.fillText("LEVEL EDITOR", (innerWidth / 2) - 48, (innerHeight / 2));


    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, soundLoader, () => {
        initialize();
        beginGameLoop();
    });

}();

function initialize() {

    console.log("Initializing...");

    if (!window.isSecureContext) {
        console.log("-------------------------- WARNING: SAVING WILL NOT WORK --------------------");
        console.log(">>> You MUST browse to localhost (http://127.0.0.1:8080) in order to save! <<<");
        alert("Insecure context! You will not be able to save your map. See console output for more info.");
    }

    // Setup basic, blank grid squares
    for (var i = 0; i < gridCols; i++) {
        for (var j = 0; j < gridRows; j++) {
            gridSquares.push(new GridSquare(i, j, gridSquareSize, "a8a8a8", imageLoader));
        }
    }
}

function beginGameLoop() {
    drawScene();
    requestAnimationFrame(beginGameLoop);
}

function processClick(event) {

    if (event.button != 0) {
        return;
    }

    var x = Math.floor(event.pageX / gridSquareSize);
    var y = Math.floor(event.pageY / gridSquareSize);
    var targetSquare = gridSquares.flat().filter((sq) => {
        return (sq.x == x) && (sq.y == y);
    })[0];

    if (targetSquare == null) {
        return;
    }

    switch (placementType) {
        case EntityPlacementType.OBSTRUCTION:
            // Toggle obstructions in the selected square
            targetSquare.isObstructed = !targetSquare.isObstructed;
            break;
        case EntityPlacementType.SOLDIER:
            // Toggle placement of SOLDIER entity in the selected square
            var newEntity = {
                x: targetSquare.x,
                y: targetSquare.y
            };

            var existingEntity = gridMap.soldiers.filter((ent) => {
                return (ent.x == newEntity.x) && (ent.y == newEntity.y);
            })[0];

            if (existingEntity == undefined) {
                console.log(`Adding soldier...`)
                gridMap.soldiers.push(newEntity);
                console.log(gridMap.soldiers);
            } else {
                console.log(`Removing soldier at ${existingEntity.x},${existingEntity.y} `)
                gridMap.soldiers = gridMap.soldiers.filter((ent) => {
                    if (ent.x == existingEntity.x && ent.y == existingEntity.y) {
                        return false;
                    } else {
                        return true;
                    }
                });
                console.log(gridMap.soldiers);
            }
            break;
        case EntityPlacementType.BLOB:
            // Toggle placement of BLOB entity in the selected square
            var newEntity = {
                x: targetSquare.x,
                y: targetSquare.y
            };

            var existingEntity = gridMap.blobs.filter((ent) => {
                return (ent.x == newEntity.x) && (ent.y == newEntity.y);
            })[0];

            if (existingEntity == undefined) {
                console.log(`Adding blob...`)
                gridMap.blobs.push(newEntity);
                console.log(gridMap.soldiers);
            } else {
                console.log(`Removing blob at ${existingEntity.x},${existingEntity.y} `)
                gridMap.blobs = gridMap.blobs.filter((ent) => {
                    if (ent.x == existingEntity.x && ent.y == existingEntity.y) {
                        return false;
                    } else {
                        return true;
                    }
                });
                console.log(gridMap.blobs);
            }
            break;
        default:
            break;
    }



}

function drawScene() {
    // Draw background
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);

    gridSquares.forEach(square => {
        square.render(context);
    });

    var soldierPlaceholder = imageLoader.getImage(ImageAsset.SOLDIER_PLACEHOLDER);
    var blobPlaceholder = imageLoader.getImage(ImageAsset.BLOB_PLACEHOLDER);
    var placeholderOffset = Math.floor(50 / 4);

    gridMap.soldiers.forEach((soldier) => {
        context.drawImage(soldierPlaceholder, (soldier.x * gridSquareSize) + placeholderOffset, (soldier.y * gridSquareSize) + placeholderOffset);
    });

    gridMap.blobs.forEach((blob) => {
        context.drawImage(blobPlaceholder, (blob.x * gridSquareSize) + placeholderOffset, (blob.y * gridSquareSize) + placeholderOffset);
    });


}

async function downloadMapfile(content) {
    const options = {
        types: [
            {
                description: "",
                accept: {
                    "text/plain": [".json"],
                },
            },
        ],
    };

    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();

    await writable.write(content);
    await writable.close();

    return handle;
}


function loadMapFile(mapName) {
    console.log(`Loading map: ${mapName}...`);
    var client = new XMLHttpRequest();
    client.open("GET", `resources/${mapName}`);
    client.setRequestHeader("Cache-Control", "no-cache");
    client.onload = function () {
        var mapAsJson = client.responseText;
        var mapObject = JSON.parse(mapAsJson);

        // Transform the JSON representation into GridSquare objects
        gridSquares = new Array();
        for (var i = 0; i < gridCols; i++) {
            for (var j = 0; j < gridRows; j++) {
                var patternSquare = mapObject.gridSquares.filter((sq) => {
                    return sq.x == i && sq.y == j
                })[0];

                var newSquare = new GridSquare(patternSquare.x, patternSquare.y, patternSquare.size, patternSquare.color, imageLoader)
                newSquare.isObstructed = patternSquare.isObstructed;
                newSquare.isOccupied = patternSquare.isOccupied;
                gridSquares.push(newSquare);
            }
        }

        gridMap = new GridMap(gridSquares);

        mapObject.soldiers.forEach((soldier) => {
            gridMap.soldiers.push(soldier);
        });

        mapObject.blobs.forEach((blob) => {
            gridMap.blobs.push(blob);
        });


        console.log(gridMap);
    }
    client.send();
}


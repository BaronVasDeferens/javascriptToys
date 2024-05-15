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


window.onmousedown = function (event) {
    toggleGridSquareAtClick(event);
}

window.onkeydown = function (event) {
    switch (event.key) {
        case 's':
            console.log("Saving map...");
            var mapFileName = `${Date.now()}.json`;
            downloadMapfile(mapFileName, JSON.stringify(gridMap));
            break;
        case 'l':
            loadMapFile("test.json");
            break;
        default:
            break;
    }
};

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
    // Setup grid squares
    for (var i = 0; i < gridCols; i++) {
        //gridSquares[i] = new Array(0);
        for (var j = 0; j < gridRows; j++) {
            gridSquares.push(new GridSquare(i, j, gridSquareSize, "a8a8a8", imageLoader));
        }
    }
}

function beginGameLoop() {
    drawScene();
    requestAnimationFrame(beginGameLoop);
}

function toggleGridSquareAtClick(event) {
    console.log(event);
    var x = Math.floor(event.pageX / gridSquareSize);
    var y = Math.floor(event.pageY / gridSquareSize);
    var targetSquare = gridSquares.flat().filter((sq) => {
        return (sq.x == x) && (sq.y == y);
    })[0];

    if (targetSquare != null) {
        targetSquare.isObstructed = !targetSquare.isObstructed;
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


}

async function downloadMapfile(filename, content) {
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
        gridSquares = new Array();

        for (var i = 0; i < gridCols; i++) {
            //gridSquares[i] = new Array(0);
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
        console.log(gridMap);
    }
    client.send();
}


import { Maze, Directions } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();
const soundLoader = new SoundLoader();

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');

var audioContext; // AudioContext must be initialized after interactions

const numRows = 5;
const numCols = 5;
const roomSize = canvas.width / numCols;

var maze;

// Process mouse movement
document.addEventListener('mousemove', (event) => {
    checkAudioContext();
});

// Process mouse movement
document.addEventListener('mousedown', (event) => {
    checkAudioContext();
});

var setup = function () {
    context.fillStyle = "#FF0000";
    context.fillRect(0, 0, canvas.width, canvas.height);


    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, soundLoader, () => {
        initialize();
        beginGame();
    });
}();

function initialize() {

    maze = new Maze(numRows, numCols, roomSize);

    maze.openNeighboringRooms(0, 0, Directions.RIGHT);
    maze.openNeighboringRooms(0, 0, Directions.DOWN);
    maze.openNeighboringRooms(0, 1, Directions.DOWN);
    maze.openNeighboringRooms(0, 2, Directions.RIGHT);
    maze.openNeighboringRooms(0, 3, Directions.RIGHT);
    maze.openNeighboringRooms(0, 3, Directions.DOWN);
    maze.openNeighboringRooms(0, 4, Directions.RIGHT);

    maze.openNeighboringRooms(1, 0, Directions.RIGHT);
    maze.openNeighboringRooms(1, 1, Directions.LEFT);
    maze.openNeighboringRooms(1, 1, Directions.DOWN);
    maze.openNeighboringRooms(1, 2, Directions.RIGHT);
    maze.openNeighboringRooms(1, 2, Directions.DOWN);
    maze.openNeighboringRooms(1, 3, Directions.RIGHT);
    maze.openNeighboringRooms(1, 4, Directions.RIGHT);

    maze.openNeighboringRooms(2, 1, Directions.UP);
    maze.openNeighboringRooms(2, 1, Directions.RIGHT);
    maze.openNeighboringRooms(2, 2, Directions.UP);
    maze.openNeighboringRooms(2, 2, Directions.DOWN);
    maze.openNeighboringRooms(2, 4, Directions.RIGHT);

    maze.openNeighboringRooms(3, 0, Directions.DOWN);
    maze.openNeighboringRooms(3, 1, Directions.DOWN);
    maze.openNeighboringRooms(3, 2, Directions.DOWN);
    maze.openNeighboringRooms(3, 3, Directions.LEFT);
    maze.openNeighboringRooms(3, 4, Directions.RIGHT);

    maze.openNeighboringRooms(4, 0, Directions.LEFT);
    maze.openNeighboringRooms(4, 0, Directions.DOWN);
    maze.openNeighboringRooms(4, 1, Directions.DOWN);
    maze.openNeighboringRooms(4, 2, Directions.DOWN);
    maze.openNeighboringRooms(4, 3, Directions.DOWN);
    maze.computeBorders();
}

function beginGame() {
    updateGameState();
    render(context);
    requestAnimationFrame(beginGame);
}

function updateGameState() {

}

function render(context) {
    maze.render(context);
}

function checkAudioContext() {

    if (audioContext == null) {
        audioContext = new AudioContext();
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

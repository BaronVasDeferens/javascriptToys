import { Maze, Directions } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";
import { EnititySimple, GameState } from "./entity.js";

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();
const soundLoader = new SoundLoader();

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');

var audioContext;

var gameState = GameState.IDLE;

const numRows = 5;
const numCols = 5;
const roomSize = canvas.width / numCols;

var maze;

const entitySize = 50;
var playerEntities = new Array();
var selectedPlayerEntity = null;

var setup = function () {

    // Clear background
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

    var roomZero = maze.getRoomByArrayPosition(0, 0)
    var centerCoords = roomZero.getCenterCoordsWithOffset(entitySize);

    console.log(centerCoords);

    playerEntities.push(
        new EnititySimple(
            centerCoords.x,
            centerCoords.y,
            entitySize,
            "#FF0000"
        )
    )
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

    playerEntities.forEach(entity => {
        entity.render(context);
    });

    if (selectedPlayerEntity != null) {
        selectedPlayerEntity.render(context);
    }

}


// --- PLAYER INPUT ---

document.addEventListener('mousedown', (click) => {
    playerEntities.forEach(entity => {
        if (entity.containsClick(click)) {
            selectedPlayerEntity = entity;
            gameState = GameState.SELECTED_PLAYER_ENTITY;
        }
    });

    if (selectedPlayerEntity == null) {
        gameState = GameState.IDLE;
    }

    console.log(`state: ${gameState}`);
});

document.addEventListener('mousemove', (click) => {

    switch (gameState) {
        case GameState.IDLE:
            break;
        case GameState.SELECTED_PLAYER_ENTITY:
            selectedPlayerEntity.x = click.offsetX - (entitySize / 2);
            selectedPlayerEntity.y = click.offsetY - (entitySize / 2);
            break;
    }
});


document.addEventListener('mouseup', (click) => {

    // Find the nearest room and snap to the center
    var targetRoom = maze.getRoomAtClick(click);
    if (targetRoom != null && selectedPlayerEntity != null) {
        var centerCoords = targetRoom.getCenterCoordsWithOffset(entitySize);
        selectedPlayerEntity.x = centerCoords.x;
        selectedPlayerEntity.y = centerCoords.y;
        selectedPlayerEntity = null;
    }

    gameState = GameState.IDLE;
    console.log(`state: ${gameState}`);

});
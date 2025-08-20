import { Maze, Directions } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";
import { EntitySimple, GameState } from "./entity.js";

/**
 * 
 * IDEAS
 * 
 *      - monster hunt 
 *          player controls agents who must track and kill a monster lurking the maze.
 *          agents are limited to LOS
 *          only some agents can fight and defeat the monster
 *      - spaceship defense
 *          player controls agents who must cleanse the ship and rescue captives
 *          solo agents are weak and die during invader encounters
 *          individual agents merge into parties when in the same room
 *          parties may overcome invaders more easily but can be in fewer places
 *          collectable weapons may help either
 * 
 * 
 */


const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();
const soundLoader = new SoundLoader();

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');

var audioContext; // AudioContext must be initialized after interactions

var gameState = GameState.IDLE;

const numRows = 5;
const numCols = 5;
const roomSize = canvas.width / numCols;

var maze;

const entitySize = roomSize / 4;
var playerEntities = new Array();
var selectedPlayerEntity = null;

var setup = function () {

    // Clear background
    context.fillStyle = "#000000";
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

    // Add some players
    for (var n = 0; n < numCols; n++) {
        var room = maze.getRoomByArrayPosition(n, n);
        var entity = new EntitySimple(
                0,
                0,
                entitySize
            );
        entity.setRoom(room);
        playerEntities.push(entity);
    }

    maze.computeVisibility(playerEntities);
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
        selectedPlayerEntity.setRoom(targetRoom);
        maze.computeVisibility(playerEntities);
        selectedPlayerEntity = null;
    }

    gameState = GameState.IDLE;
    console.log(`state: ${gameState}`);

});
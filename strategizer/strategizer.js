import { Maze, Directions, Visibility } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";
import { Beast, EntitySimple, GameState } from "./entity.js";

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

const numRows = 4;
const numCols = 4;
const roomSize = canvas.width / numCols;

var maze = new Maze(numRows, numCols, roomSize);

const numPlayers = 1;
const entitySize = roomSize / 4;
var playerEntities = new Array();
var selectedPlayerEntity = null;

const numBeasts = 3;
var beastEntities = new Array();

// -------------------------------------------------------

var setup = function () {
    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, soundLoader, () => {
        initialize();
        beginGame();
    });
}();

function initialize() {

    console.log("Initializing...");

        // Clear background
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    playerEntities = new Array();
    beastEntities = new Array();
    
    maze = new Maze(numRows, numCols, roomSize);

    // Open all rooms to each other...
    maze.rooms.forEach(room => {
        var adjacentRooms = maze.getAdjacentRoomsWithDirection(room);
        adjacentRooms.forEach(neighbor => {
            maze.openNeighboringRooms(room.x, room.y, neighbor.direction);
        });
    })

    // ...then close a few doors...
    shuffleArray(maze.rooms);
    var closedDoors = (numRows * numCols) * 0.25;
    for (var n = 0; n < closedDoors; n++) {
        var room = maze.rooms[n];
        var neighbors = maze.getAdjacentRoomsWithDirection(room);
        shuffleArray(neighbors);
        maze.closeNeighboringRooms(room.x, room.y, neighbors[0].direction);
    }

    maze.computeBorders();

    // Add some players
    for (var n = 0; n < numPlayers; n++) {
        var room = maze.getRoomByArrayPosition(
            random(0, numCols),
            random(0, numRows)
        );
        var entity = new EntitySimple(
            0,
            0,
            entitySize,
            "#0000FF"
        );
        entity.setRoom(room);
        playerEntities.push(entity);
    }

    maze.computeVisibility(playerEntities);

    // Add beast/s
    shuffleArray(maze.rooms);
    var beastRooms = maze.rooms.filter(room => {
        return room.visibility == Visibility.DARK
    });

    for (var n = 0; n < numBeasts; n++) {
        var beast = new Beast(0, 0, entitySize);
        beast.setRoom(beastRooms[n]);
        beastEntities.push(beast);
    }

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

    beastEntities.forEach(beast => {
        beast.render(context);
    })

    if (selectedPlayerEntity != null) {
        selectedPlayerEntity.render(context);
    }
}

function random(min, max) {
    return parseInt(Math.random() * max + min);
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// -----------------------------------------------
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

        // Only move the player entity if the room they're moving to
        // is adjacent to their starting room 
        if (maze.getOpenNeighborsToRoom(selectedPlayerEntity.room).includes(targetRoom)) {
            selectedPlayerEntity.setRoom(targetRoom);
            beastEntities.forEach(beast => {
                beast.move(maze);
            })
        } else {
            selectedPlayerEntity.setRoom(selectedPlayerEntity.room);
        }

        maze.computeVisibility(playerEntities);
        selectedPlayerEntity = null;
    }

    gameState = GameState.IDLE;
    console.log(`state: ${gameState}`);
});

document.addEventListener('keydown', (event) => {

    switch (event.key) {
        case 'r':
            initialize();
            break;
    }
});

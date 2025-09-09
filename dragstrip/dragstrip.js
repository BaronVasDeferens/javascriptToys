import { Maze, Directions, Visibility, PlacementGrid } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";
import { Beast, EntitySimple, GameState } from "./entity.js";

/**
 * THIS WAS SPAWNED FROM STRATEGIZER 
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

const globalDivisor = 10;
const numRows = canvas.height / globalDivisor;
const numCols = canvas.width / globalDivisor;
const roomSize = globalDivisor * 2 //numRows / globalDivisor;

const placementGrid = new PlacementGrid(numRows, numCols, roomSize);

const numPlayers = 1;
const entitySize = 40 // roomSize / 4;
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

    clearBackground(context);

    var room = placementGrid.getRoomByArrayPosition(
        numCols / globalDivisor,
        numRows / globalDivisor
    );

    var entity = new EntitySimple(
        0,
        0,
        entitySize,
        "#FF0000"
    );

    entity.setRoom(room);
    playerEntities.push(entity);

}

function beginGame() {
    updateGameState();
    render(context);
    requestAnimationFrame(beginGame);
}

function updateGameState() {

}

function clearBackground(context) {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function render(context) {
    clearBackground(context);
    placementGrid.render(context);
    playerEntities.forEach(entity => {
        entity.render(context);
    });

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

    var targetVertex = placementGrid.getRoomAtClick(click);
    if (targetVertex != null && selectedPlayerEntity != null) {
        selectedPlayerEntity.setRoom(targetVertex);
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

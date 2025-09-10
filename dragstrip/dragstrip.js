import { PlacementGrid } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";
import { EntitySimple, TransientEntitySimple, GameState } from "./entity.js";

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
const roomSize = globalDivisor * 2; //numRows / globalDivisor;

const placementGrid = new PlacementGrid(numRows, numCols, roomSize);

const entitySize = 40; // roomSize / 4;
var playerEntities = new Array();
var selectedPlayerEntity = null;



/** TRANSIENT ENTITIES: these entities will be disposed of at the end of each rendering cycle */
var transientEntities = new Array();

/**
 * Background image is rendered one and re-used on each re-draw
 */
var backgroundImage = new Image();

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

    var vertex = placementGrid.getVertexByArrayPosition(
        numCols / globalDivisor,
        numRows / globalDivisor
    );

    var entity = new EntitySimple(
        0,
        0,
        entitySize,
        "#FF0000"
    );

    entity.setVertex(vertex);
    playerEntities.push(entity);

    renderBackgroundImage(context);
}

function beginGame() {
    updateGameState();
    render(context);
    requestAnimationFrame(beginGame);
}

function updateGameState() {

}

/**
 * Renders the background once into a reusable image
 */
function renderBackgroundImage(context) {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    placementGrid.render(context);
    var updatedSrc = canvas.toDataURL();
    backgroundImage.src = updatedSrc;
}

function render(context) {

    context.drawImage(backgroundImage, 0, 0,);

    playerEntities.forEach(entity => {
        entity.render(context);
    });

    if (selectedPlayerEntity != null) {
        selectedPlayerEntity.render(context);
    }

    transientEntities.forEach(entity => {
        entity.render(context);
    });

    transientEntities.length = 0;
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
            selectedPlayerEntity = new TransientEntitySimple(
                entity,
                0.25
            );
            gameState = GameState.SELECTED_PLAYER_ENTITY;
        } else {
            selectedPlayerEntity = null;
            gameState = GameState.IDLE;
        }
    });

    console.log(`state: ${gameState}`);
});

document.addEventListener('mousemove', (click) => {

    switch (gameState) {

        case GameState.IDLE:
            break;

        case GameState.SELECTED_PLAYER_ENTITY:
            var vertex = placementGrid.getVertexAtClick(click);
            selectedPlayerEntity.setVertex(vertex);
            break;
    }
});

document.addEventListener('mouseup', (click) => {

    var targetVertex = placementGrid.getVertexAtClick(click);
    if (targetVertex != null && selectedPlayerEntity != null) {
        selectedPlayerEntity.setVertex(targetVertex);
    }

    selectedPlayerEntity = null;

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

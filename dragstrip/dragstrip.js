import { PlacementGrid } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";
import { EntityImage, TransientEntityImage, GameState, TransientLine, EntityMovementDriver } from "./entity.js";

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

var debugMode = false;

const globalDivisor = 10;
const numRows = canvas.height / 20;
const numCols = canvas.width / 20;
const roomSize = globalDivisor * 2;

const placementGrid = new PlacementGrid(numRows, numCols, roomSize);

const entitySize = 40;

const numPlayerEntities = 5;
var playerEntities = new Array();
var selectedPlayerEntity = null;


/** TRANSIENT ENTITIES: these entities will be disposed of at the end of each rendering cycle */
var transientEntities = new Array();

/** ENTITY MOVEMENT DRIVERS */
var entityMovementDrivers = new Array();

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

    playerEntities = new Array();

    for (var i = 0; i < numPlayerEntities; i++) {

        var vertex = placementGrid.getVertexByArrayPosition(
            random(0, numCols),
            random(0, numRows)
        );

        var entity = new EntityImage(
            0,
            0,
            entitySize,
            imageLoader
        );

        entity.setVertex(vertex);
        playerEntities.push(entity);
    }

    renderBackgroundImage(context);
}

function beginGame() {
    update();
    render(context);
    requestAnimationFrame(beginGame);
}

function update() {

    // Add a line between the selected entity's ghost and source
    if (selectedPlayerEntity != null && selectedPlayerEntity.vertex != null) {
        transientEntities.push(
            new TransientLine(
                selectedPlayerEntity.originalEntity.vertex,
                selectedPlayerEntity.vertex,
                1.0,
                "#FF0000"
            )
        )
    }

    if (gameState == GameState.PROCESSING_PLAYER_MOVE) {
        entityMovementDrivers.forEach(driver => {
            driver.update();
        });

        // TODO remove completed drivers

    }
}

function updateGameState(newState) {
    if (newState != gameState) {
        gameState = newState;
        console.log(`gameState: ${gameState}`);
    }
}

/**
 * Renders the background once into a reusable image
 */
function renderBackgroundImage(context) {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    placementGrid.render(context, debugMode);
    var updatedSrc = canvas.toDataURL();
    backgroundImage = new Image();
    backgroundImage.src = updatedSrc;
}

function render(context) {

    context.drawImage(backgroundImage, 0, 0,);

    playerEntities.forEach(entity => {
        entity.render(context, debugMode);
    });

    if (selectedPlayerEntity != null) {
        selectedPlayerEntity.render(context, debugMode);
    }

    transientEntities.forEach(entity => {
        entity.render(context, debugMode);
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

    // Identify the first player under the mouse...
    var candidate = playerEntities.filter(entity => {
        return entity.containsClick(click)
    })[0];

    //...and if a candidate is found, set a selectedEntity
    if (candidate != null) {
        selectedPlayerEntity = new TransientEntityImage(
            candidate,
            0.25
        );
        updateGameState(GameState.SELECTED_PLAYER_ENTITY);
    } else {
        selectedPlayerEntity = null;
        updateGameState(GameState.IDLE);
    }
});


document.addEventListener('mousemove', (click) => {

    switch (gameState) {

        case GameState.IDLE:
            break;

        case GameState.SELECTED_PLAYER_ENTITY:
            if (selectedPlayerEntity != null) {
                var vertex = placementGrid.getVertexAtClick(click);
                selectedPlayerEntity.setVertex(vertex);
            }
            break;
    }
});

document.addEventListener('mouseup', (click) => {

    var targetVertex = placementGrid.getVertexAtClick(click);
    if (targetVertex != null && selectedPlayerEntity != null) {

        var targetEntity = selectedPlayerEntity.originalEntity;
        var sourceVertex = targetEntity.vertex;

        entityMovementDrivers.push(

            new EntityMovementDriver(
                targetEntity,
                sourceVertex,
                targetVertex,
                1,
                function () {
                    targetEntity.setVertex(targetVertex);
                    updateGameState(GameState.IDLE)
                }
            )
        )

        updateGameState(GameState.PROCESSING_PLAYER_MOVE);
    }

    selectedPlayerEntity = null;
});

document.addEventListener('keydown', (event) => {

    switch (event.key) {
        
        case 'd':
            debugMode = !debugMode
            renderBackgroundImage(context);
            break;
        
        case 'r':
            initialize();
            break;
    }
});

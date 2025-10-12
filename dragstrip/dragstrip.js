import { PlacementGrid, ObstacleSimple, Vertex } from "./rooms.js";
import { AssetLoader, ImageLoader, SoundLoader } from "./assets.js";
import { EnemyEntity, EntityImageTransient, GameState, DottedLineTransient, EntityMovementDriver, PlayerEntity } from "./entity.js";

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


/**
 * ROOM SIZE
 * Smaller room sizes make the map more granular, offering a larger
 * number of spaces in which to move. Larger values (like 
 * entitySize) make for a more chessboard-like experience.
 */

const roomSize = 50;        
const numRows = canvas.height / roomSize;
const numCols = canvas.width / roomSize;

const placementGrid = new PlacementGrid(numRows, numCols, roomSize);

const entitySize = 50;

const numPlayerEntities = 3;
var playerEntities = [];
var selectedPlayerEntity = null;
var selectedPlayerPath = null;

const numEnemyEntities = 3;
var enemyEntities = [];

const numRandomObstacles = 30;
var obstacles = [];

/** TRANSIENT ENTITIES: these entities will be disposed of at the end of each rendering cycle */
var transientEntities = [];

/** ENTITY MOVEMENT DRIVERS */
var entityMovementDrivers = [];

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

    placementGrid.resetObstructions();

    let shuffledVertices = placementGrid.getRandomizedVertices();
    let index = 0;

    // --- Create PLAYERS (random placement) ---
    playerEntities = [];

    for (let i = 0; i < numPlayerEntities; i++) {

        let vertex = shuffledVertices[index];
        index++;

        var entity = new PlayerEntity(
            0,
            0,
            entitySize,
            imageLoader
        );

        entity.setVertex(vertex);
        playerEntities.push(entity);
    }

    // --- Create ENEMIES (random placement) ---
    enemyEntities = [];

    for (let i = 0; i < numEnemyEntities; i++) {

        let vertex = shuffledVertices[index];
        index++;

        let entity = new EnemyEntity(
            0,
            0,
            entitySize,
            imageLoader
        );

        entity.setVertex(vertex);
        enemyEntities.push(entity);
    }

    // --- Create OBSTACLES
    obstacles = [];

    for (let i = 0; i < numRandomObstacles; i++) {
        let vertex = shuffledVertices[index];
        index++;
        let obstacle = new ObstacleSimple(vertex, roomSize, "#424242ff")
        obstacles.push(obstacle);
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

        let pointsAtInterval = placementGrid.getPointsAtInterval(
            selectedPlayerEntity.originalEntity.vertex,
            selectedPlayerEntity.vertex,
            4
        );

        transientEntities.push(
            new DottedLineTransient(
                pointsAtInterval,
                "#FFFFFF"
            )
        )

        selectedPlayerPath = placementGrid.getVerticesForPoints(pointsAtInterval);

        if (debugMode == true) {
            selectedPlayerPath.forEach(vtx => {
                transientEntities.push(
                    new Vertex(vtx.x, vtx.y, roomSize, "#FFFF00")
                )
            });
            console.log(`distance: ${selectedPlayerPath.size}`)
        }
    }

    if (gameState == GameState.PROCESSING_PLAYER_MOVE) {

        let activeDriver = entityMovementDrivers[0];
        if (activeDriver != null) {
            if (activeDriver.isDischarged == false) {
                activeDriver.update();
            } else {
                entityMovementDrivers.shift();
            }
        } else {
            updateGameState(GameState.IDLE);
        }
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
    let updatedSrc = canvas.toDataURL();
    backgroundImage = new Image();
    backgroundImage.src = updatedSrc;
}

function render(context) {

    context.drawImage(backgroundImage, 0, 0,);

    obstacles.forEach(obstacle => {
        obstacle.render(context)
    });

    playerEntities.forEach(entity => {
        entity.render(context, debugMode);
    });

    enemyEntities.forEach(entity => {
        entity.render(context, debugMode);
    });

    if (selectedPlayerEntity != null) {
        selectedPlayerEntity.render(context, debugMode);
    }

    transientEntities.forEach(entity => {
        entity.render(context, debugMode);
    });

    transientEntities = [];
}

function random(min, max) {
    return parseInt(Math.random() * max + min);
};


// -----------------------------------------------
// --- PLAYER INPUT ---


// Mouse DOWN
document.addEventListener('mousedown', (click) => {

    // Identify the first player under the mouse...
    let candidate = playerEntities.filter(entity => {
        return entity.containsClick(click)
    })[0];

    //...and if a candidate is found, set a selectedEntity
    if (candidate != null) {
        selectedPlayerEntity = new EntityImageTransient(
            candidate,
            0.25
        );
        updateGameState(GameState.SELECTED_PLAYER_ENTITY);
    } else {
        selectedPlayerEntity = null;
        updateGameState(GameState.IDLE);
    }
});

// Mouse MOVE
document.addEventListener('mousemove', (click) => {

    switch (gameState) {

        case GameState.IDLE:
            break;

        case GameState.SELECTED_PLAYER_ENTITY:
            if (selectedPlayerEntity != null) {
                let vertex = placementGrid.getVertexAtClick(click);
                selectedPlayerEntity.setVertex(vertex);
            }
            break;
    }
});

// Mouse UP
document.addEventListener('mouseup', (click) => {

    let targetVertex = placementGrid.getVertexAtClick(click);
    if (targetVertex != null && selectedPlayerEntity != null && gameState == GameState.SELECTED_PLAYER_ENTITY)  {

        // Check for path obstruction
        if (selectedPlayerPath != null && !(selectedPlayerPath.values().some(vtx => {
            return vtx.isObstructed
        }))) {

            let targetEntity = selectedPlayerEntity.originalEntity;
            let sourceVertex = targetEntity.vertex;
            // let path = ;
            
            Array.from(selectedPlayerPath).forEach((vtx, index, array) => {

                sourceVertex = vtx;

                let destinationVertex = array[index + 1];
                if (destinationVertex == null) {
                    destinationVertex = targetVertex;
                }

                entityMovementDrivers.push(

                    new EntityMovementDriver(
                        targetEntity,
                        null,
                        null,
                        1,
                        function () {
                            targetEntity.setVertex(destinationVertex);
                        }
                    )
                )
            });

            entityMovementDrivers.push(
                new EntityMovementDriver(
                    targetEntity,
                    null,
                    null,
                    1,
                    function () {
                        updateGameState(GameState.IDLE)
                    }
                ));

            updateGameState(GameState.PROCESSING_PLAYER_MOVE);
        }

        selectedPlayerPath = null;
    }

    selectedPlayerEntity = null;
});

document.addEventListener('keydown', (event) => {

    switch (event.key) {

        case 'd':
            debugMode = !debugMode
            renderBackgroundImage(context);
            break;

        case 'i':
            initialize();
            break;
    }
});

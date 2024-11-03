import { AssetLoader, ImageLoader, ImageAsset, } from './AssetLoader.js';

const assetLoader = new AssetLoader();
const imageLoader = new ImageLoader();

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

var backgroundImage = new Image();

var setup = function () {
    // Set background to display "loading" text
    context.fillStyle = "#FF0000";
    context.fillRect(0, 0, innerWidth, innerHeight);
    context.strokeStyle = "#000000";
    context.fillStyle = "#000000";
    context.lineWidth = 2.0;
    context.font = "24px sans-serif";
    context.fillText("LOADING", (innerWidth / 2) - 48, (innerHeight / 2));

    // Invoke AssetLoader and trigger callback upon completion...
    assetLoader.loadAssets(imageLoader, () => {
        initialize();
        console.log("Begin game!");
        beginGame();
    });
}();

function initialize() {
    console.log("Initializing...");
    renderBackground(context);
}

function beginGame() {
    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}

function updateGameState() {

}

function renderBackground(context) {

    // get random tiles
    let tiles = [
        imageLoader.getImage(ImageAsset.FLOOR_TILE_1),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_2),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_3),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_4),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_5),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_6),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_7),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_8),
        imageLoader.getImage(ImageAsset.FLOOR_TILE_9)];


    // Renders the background once and re-uses the image
    console.log("Rendering background...");
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            context.drawImage(tiles[randomIntInRange(0, tiles.length)], i * 16, j * 16);
        }
    }
    

    var updatedSrc = canvas.toDataURL();
    backgroundImage.src = updatedSrc;
}

function randomIntInRange(min, max) {
    return parseInt(Math.random() * max + min);
};

function drawScene() {

    // Draw background
    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0);

    context.imageSmoothingEnabled = false;

    // Draw entities

}
/**
 * TINY TROOPS
 * To run locally, console: "http-server ."
 * If that doesn't work, you'll need: "npm install http-server -g"
 * And if THAT doesn't work (and you use BASH), try: "sudo npm install --global http-server"
 */

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

var setup = function () {

    // Include any initiatlization code here
    console.log(">>> Starting...");
    beginGame();
}();



function beginGame() {
    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}



function updateGameState() {

    processPlayerInput();

}

function processPlayerInput() {

}

function drawGrid(context, size) {
    context.strokeStyle = "#7575a3";
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            context.strokeRect(i * size, j * size, size, size);
        }
    }
}

function drawScene() {
    // Draw background
    context.fillStyle = "#29293d";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, 50);
}
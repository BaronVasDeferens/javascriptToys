
var MovingState = Object.freeze({
    STOP: "STOP",
    MOVING_RIGHT: "MOVING_RIGHT",
    MOVING_LEFT: "MOVING_LEFT",
    MOVING_UP: "MOVING_UP",
    MOVING_DOWN: "MOVING_DOWN"
});

var movingDirection = MovingState.STOP;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

let countCurrent = 0;
let countMax = 100;

var playerX = 0;
var playerY = 0;
const pixelsPerIncrement = 10;


document.addEventListener('keydown', (e) => {

    switch (e.key) {
        case "a":
        case "ArrowLeft":
            movingDirection = MovingState.MOVING_LEFT;
            break;
        case "d":
        case "ArrowRight":
            movingDirection = MovingState.MOVING_RIGHT;
            break;
        case "w":
        case "ArrowUp":
            movingDirection = MovingState.MOVING_UP;
            break;
        case "s":
        case "ArrowDown":
            movingDirection = MovingState.MOVING_DOWN;
            break;
        case " ":
            movingDirection = MovingState.STOP;
            break;
        default:
            break;
    }
});


// Setup (IFFE function)
var setup = function () {

    runGame();
}();

function runGame() {
    update();
    render();
    requestAnimationFrame(runGame);
}

function update() {
    countCurrent = (countCurrent + 1) % countMax;

    let movement = pixelsPerIncrement / (countCurrent + 1);

    switch (movingDirection) {
        case MovingState.MOVING_UP:
            playerY = playerY - movement;
            break;
        case MovingState.MOVING_DOWN:
            playerY = playerY + movement;
            break;
        case MovingState.MOVING_LEFT:
            playerX = playerX - movement;
            break;
        case MovingState.MOVING_RIGHT:
            playerX = playerX + movement;
            break;
        case MovingState.STOP:
        default:
            break;

    }
}

function render() {

    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // context.strokeStyle = "#00FF00";
    // context.lineWidth = 2.0;
    // context.font = "24px sans-serif";
    // context.strokeText(countCurrent, 150, 100);
    // context.strokeText(movingDirection, 150, 150);

    context.fillStyle = "#FF0000";
    context.lineWidth = 1.0;
    context.beginPath();
    context.ellipse(playerX, playerY, 5, 5, 2 * Math.PI, 2 * Math.PI, false);
    // context.stroke();
    context.fill();
}


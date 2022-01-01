
var Moving = Object.freeze({
    STOP: "STOP",
    MOVING_RIGHT: "MOVING_RIGHT",
    MOVING_LEFT: "MOVING_LEFT",
    MOVING_UP: "MOVING_UP",
    MOVING_DOWN: "MOVING_DOWN"
});

var movingDirection = Moving.STOP;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

let countCurrent = 0;
let countMax = 100;

var playerX = 0;
var playerY = 0;
const pixelsPerIncrement = 2;


document.addEventListener('keydown', (e) => {

    switch (e.key) {
        case "a":
        case "ArrowLeft":
            movingDirection = Moving.MOVING_LEFT;
            break;
        case "d":
        case "ArrowRight":
            movingDirection = Moving.MOVING_RIGHT;
            break;
        case "w":
        case "ArrowUp":
            movingDirection = Moving.MOVING_UP;
            break;
        case "s":
        case "ArrowDown":
            movingDirection = Moving.MOVING_DOWN;
            break;
        case " ":
            movingDirection = Moving.STOP;
            break;
        default:
            break;
    }

    //console.log(`key down: ${e.key}`);
});

// document.addEventListener('keyup', (e) => {

//     switch (e.key) {
//         case "a":
//         case "ArrowLeft":
//             if (movingDirection == Moving.MOVING_LEFT) {
//                 movingDirection = Moving.STOP;
//             }
//             break;
//         case "d":
//         case "ArrowRight":
//             if (movingDirection == Moving.MOVING_RIGHT) {
//                 movingDirection = Moving.STOP;
//             }
//             break;
//         case "w":
//         case "ArrowUp":
//             if (movingDirection == Moving.MOVING_UP) {
//                 movingDirection = Moving.STOP;
//             }
//             break;
//         case "s":
//         case "ArrowDown":
//             if (movingDirection == Moving.MOVING_DOWN) {
//                 movingDirection = Moving.STOP;
//             }
//             break;
//         case " ":
//             movingDirection = Moving.STOP;
//             break;
//         default:
//             break;
//     }

//     //console.log(`key up: ${e.key}`);
// });


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

    let movement = pixelsPerIncrement  // / (countCurrent + 1);

    switch (movingDirection) {
        case Moving.MOVING_UP:
            playerY = playerY - movement;
            break;
        case Moving.MOVING_DOWN:
            playerY = playerY + movement;
            break;
        case Moving.MOVING_LEFT:
            playerX = playerX - movement;
            break;
        case Moving.MOVING_RIGHT:
            playerX = playerX + movement;
            break;
        case Moving.STOP:
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

    context.fillStyle = "#FFE600";
    context.lineWidth = 1.0;
    context.beginPath();
    context.ellipse(playerX, playerY, 15, 15, 2 * Math.PI, 2 * Math.PI, false);
    // context.stroke();
    context.fill();
}
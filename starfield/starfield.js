
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

// AudioContext is necessary for sounds to play correctly
const audioContext = new AudioContext();



// Prevent the right click from summoning the context menu. Considered "bad form" but LOL whatever
document.addEventListener('contextmenu', event => event.preventDefault());

window.onkeydown = function (event) {
    switch (event.key) {

    }
}

// Process mouse clicks
window.onmousedown = function (event) {

}

// Process mouse movement
window.onmousemove = function (event) {

};

// Process mousewheel events: increase actionPointAdjustment on up, decrease on down (when targetting)
window.onmousewheel = function (event) {


};

window.onmouseover = function (event) {
    // when leaving the game window. Maybe handy later?
};

var setup = function () {
    initialize();
    beginGame();

}();

function initialize() {
    
    // context.fillStyle = "#FF0000";
    // context.fillRect(0, 0, innerWidth, innerHeight);
    context.strokeStyle = "#FF0000";
    context.fillStyle = "#FF0000";
    context.lineWidth = 2.0;
    context.font = "24px sans-serif";
    context.fillText("STARFIELD", (innerWidth / 2) - 48, (innerHeight / 2));
}

function beginGame() {
    updateGameState();
    drawScene();
    requestAnimationFrame(beginGame);
}

function updateGameState() {
    // console.log(`${new Date().getMilliseconds()}`);
}

function drawScene() {
    
}
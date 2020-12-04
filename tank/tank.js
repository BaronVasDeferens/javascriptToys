
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

// const hexmap = new HexMap(7,7);
// hexmap.draw(ctx);


    window.addEventListener('keypress', event => {
    console.log(event);
    draw();
});


function draw() {
    context.fillStyle = "#FF0000";
    context.fillRect(0,0,canvas.width,canvas.height);
}


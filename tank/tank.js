import { TankEntity } from './entity.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const tank = new TankEntity(50,50,50)

window.addEventListener('keypress', event => {
    console.log(event);

    switch(event.key){
        case 'w':
            tank.updatePosition(0,-10);
            break;
        case 's':
            tank.updatePosition(0,10);   
            break; 
        case 'a':
            tank.updatePosition(-10,0);
            break;
        case 'd':
            tank.updatePosition(10,0);
            break;  
    } 
    drawScene();
});

window.addEventListener('mousedown', event => {
    console.log(event);

    if (event.y < tank.y) {
        tank.updatePosition(0,-10);
    }
    if (event.y > tank.y) {
        tank.updatePosition(0,10);   
    }   
    if (event.x < tank.x) {
        tank.updatePosition(-10,0);
    }
    if (event.x > tank.x) {
        tank.updatePosition(10,0); 
    } 
    drawScene();
});


var setup = function() {
    drawScene();
}();

function drawScene() {
    context.fillStyle = "#FF0000";
    context.fillRect(0,0,canvas.width,canvas.height);
    tank.draw(context);
}
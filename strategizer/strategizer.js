import { Maze, Directions } from "./rooms.js";

const canvas = document.getElementById('playArea');
const context = canvas.getContext('2d');

const numRows = 5;
const numCols = 5;
const roomSize = canvas.width / numCols;

const maze = new Maze(numRows, numCols, roomSize);

var setup = function () {
    context.fillStyle = "#FF0000";
    context.fillRect(0, 0, canvas.width, canvas.height);


    maze.openNeighboringRooms(0, 0, Directions.RIGHT);
    maze.openNeighboringRooms(0, 0, Directions.DOWN);
    maze.openNeighboringRooms(1, 0, Directions.RIGHT);
    maze.openNeighboringRooms(3, 0, Directions.DOWN);
    maze.openNeighboringRooms(0, 1, Directions.DOWN);
    maze.openNeighboringRooms(1, 1, Directions.LEFT);
    maze.openNeighboringRooms(1, 1, Directions.DOWN);
    maze.openNeighboringRooms(2, 1, Directions.UP);
    maze.openNeighboringRooms(2, 1, Directions.RIGHT);
    maze.openNeighboringRooms(3, 1, Directions.DOWN);
    maze.openNeighboringRooms(0, 2, Directions.RIGHT);
    maze.openNeighboringRooms(1, 2, Directions.RIGHT);
    maze.openNeighboringRooms(1, 2, Directions.DOWN);
    maze.openNeighboringRooms(2, 2, Directions.UP);
    maze.openNeighboringRooms(2, 2, Directions.DOWN);
    maze.openNeighboringRooms(3, 2, Directions.DOWN);
    maze.openNeighboringRooms(0, 3, Directions.RIGHT);
    maze.openNeighboringRooms(1, 3, Directions.RIGHT);
    maze.openNeighboringRooms(3, 3, Directions.LEFT);
    maze.computeBorders();



    beginGame();
}();

function beginGame() {
    updateGameState();
    render(context);
    requestAnimationFrame(beginGame);
}

function updateGameState() {

}

function render(context) {
    maze.render(context);
}
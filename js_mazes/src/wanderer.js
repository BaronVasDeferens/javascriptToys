class Room {

    row = 0;
    col = 0;
    open = false;

    constructor(row, col, open) {
        this.row = row;
        this.col = col;
        this.open = open;
    }
};

class Player {
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
};


const mazeRowsCols = 50;
const roomSize = 125;        // render size (pixels) of rooms 

var mazeArray = new Array(mazeRowsCols);
var allRooms = new Array();
var frontier = new Array();
var reachable = new Array();
var inMaze = new Array();

const mazeWindowSize = 7;       // Number of maze squares visible on screen at any time
var mazeWindowX = 0;                // array position/s of maze window
var mazeWindowY = 0;

let player = new Player(2, 2);

document.addEventListener('keydown', (e) => {

    switch (e.key) {
        case "a":
        case "ArrowLeft":
            player.x--;
            if (player.x < 0) {
                player.x = 0;
            }

            if (player.x < mazeRowsCols - Math.floor(mazeWindowSize / 2) - 1) {
                if (mazeWindowX >= 0 && mazeWindowX < mazeRowsCols) {
                    mazeWindowX--;
                    if (mazeWindowX < 0) {
                        mazeWindowX = 0;
                    }

                }
            }
            drawMaze();
            break;
        case "d":
        case "ArrowRight":
            player.x++;
            if (player.x >= mazeRowsCols) {
                player.x = mazeRowsCols - 1;
            }

            // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
            if (player.x >= Math.floor(mazeWindowSize / 2) + 1) {
                if (mazeWindowX >= 0 && mazeWindowX < mazeRowsCols) {
                    mazeWindowX++;
                    if (mazeWindowX >= mazeRowsCols - mazeWindowSize) {
                        mazeWindowX = mazeRowsCols - mazeWindowSize;
                    }

                }
            }
            drawMaze();
            break;
        case "w":
        case "ArrowUp":
            player.y--;
            if (player.y < 0) {
                player.y = 0;
            }

            if (player.y < mazeRowsCols - Math.floor(mazeWindowSize / 2) - 1) {
                if (mazeWindowY >= 0 && mazeWindowY < mazeRowsCols) {
                    mazeWindowY--;
                    if (mazeWindowY < 0) {
                        mazeWindowY = 0;
                    }
                    
                }
            }
            drawMaze();
            break;
        case "s":
        case "ArrowDown":
            player.y++;
            if (player.y >= mazeRowsCols) {
                player.y = mazeRowsCols - 1;
            }

            // Only move the window if the player's y position is at least 1/2 of the mazeWindowSize
            if (player.y >= Math.floor(mazeWindowSize / 2) + 1) {
                if (mazeWindowY >= 0 && mazeWindowY < mazeRowsCols) {
                    mazeWindowY++;
                    if (mazeWindowY >= mazeRowsCols - mazeWindowSize) {
                        mazeWindowY = mazeRowsCols - mazeWindowSize;
                    }
                }
            }
            drawMaze();
            break;
        default:
            console.log(e);
            break;

    }
});

// Setup (IFFE function)
// Insert a drawable canvas element into the page
// TODO: parameterize the canvas size
var setup = function () {

    var mazeArea = document.getElementById('gameArea');
    mazeArea.innerHTML = "<canvas id=\"myCanvas\" width=\"875\" height=\"875\"></canvas>"

    for (var i = 0; i < mazeRowsCols; i++) {

        mazeArray[i] = new Array(mazeRowsCols);

        for (var j = 0; j < mazeRowsCols; j++) {
            var room = new Room(i, j, false);
            allRooms.push(room);
            mazeArray[i][j] = room;
        }
    }

    createMaze();

}();

function getRandomRoom() {
    var index = Math.floor(Math.random() * 1000 % (mazeRowsCols * mazeRowsCols));
    return allRooms[index]
}

function getRoom(row, col) {
    try {
        return mazeArray[row][col];
    } catch (e) {
        return undefined;
    }
}

function getAdjacentRooms(row, col) {

    var room = getRoom(row, col);
    var adjacentRooms = new Array();

    var up = getRoom(row, col - 1);
    if (up !== undefined) {
        adjacentRooms.push(up);
    }

    var down = getRoom(row, col + 1);
    if (down !== undefined) {
        adjacentRooms.push(down);
    }

    var left = getRoom(row - 1, col);
    if (left !== undefined) {
        adjacentRooms.push(left);
    }

    var right = getRoom(row + 1, col);
    if (right !== undefined) {
        adjacentRooms.push(right);
    }

    return adjacentRooms;
}

function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function areDiagonalsOpen(room) {

    var diag = getRoom(room.row - 1, room.col - 1);

    if (diag !== undefined) {
        if (diag.open) { return true; }
    }

    diag = getRoom(room.row - 1, room.col + 1);
    if (diag !== undefined) {
        if (diag.open) { return true; }
    }

    diag = getRoom(room.row + 1, room.col - 1);
    if (diag !== undefined) {
        if (diag.open) { return true; }
    }

    diag = getRoom(room.row + 1, room.col + 1);
    if (diag !== undefined) {
        if (diag.open) { return true; }
    }

    return false;
}

function createMaze() {

    // Define the "start room" and adjacent rooms...
    var startRoom = getRandomRoom();
    console.log("START " + startRoom.row + "," + startRoom.col);
    startRoom.open = true;
    inMaze.push(startRoom);
    reachable.push(startRoom);

    var adjacentRooms = getAdjacentRooms(startRoom.row, startRoom.col);
    adjacentRooms.forEach(function (r) {
        frontier.push(r);
        reachable.push(r);
    });


    while (reachable.length != allRooms.length) {

        frontier = shuffleArray(frontier);

        var newRoom = frontier.pop();

        // Disqualify any room whose neighbors are all already reachable

        //            if (getAdjacentRooms(newRoom.row, newRoom.col).length == 0)
        //                continue;

        if (getAdjacentRooms(newRoom.row, newRoom.col).every(function (r) {
            if (reachable.includes(r)) {
                return true;
            }

        })) { continue; }


        if (!inMaze.includes(newRoom)) {

            // Disqualify any room whose diagonal is already open
            //                if (areDiagonalsOpen(newRoom)) {
            //                    console.log("skipping " + newRoom.row + "," + newRoom.col);
            //                    continue;
            //                }

            newRoom.open = true;
            inMaze.push(newRoom);

            getAdjacentRooms(newRoom.row, newRoom.col).forEach(function (r) {
                if (!frontier.includes(r)) {
                    frontier.push(r);

                    if (!reachable.includes(r)) {
                        reachable.push(r);
                    }
                }
            });

        }

        //            console.log("frontier size = " + frontier.length);
    }

    drawMaze();
}

function drawMaze() {

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    context.fillStyle = "#b8bab9";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let subRooms = getMazeSubsection(mazeWindowY, mazeWindowX, mazeWindowSize);

    subRooms.forEach(room => {

        if (room.open) {
            context.fillStyle = "#FFFFFF";

        } else {
            context.fillStyle = "#000000";
        }

        context.fillRect(
            (room.col - mazeWindowX) * roomSize,
            (room.row - mazeWindowY) * roomSize,
            roomSize,
            roomSize);
    });

    // render player
    context.fillStyle = "#FF0000";
    context.fillRect((player.x - mazeWindowX) * roomSize + 50, (player.y - mazeWindowY) * roomSize + 50, 25, 25);
    console.log(player);
}


function getMazeSubsection(row, col, size) {

    size = size - 1;

    if (col < 0) {
        col = 0;
    }

    let rightBound = col + size;
    if (rightBound >= mazeRowsCols) {
        rightBound = mazeRowsCols - 1;
    }

    if (row < 0) {
        row = 0;
    }

    let lowerBound = row + size;
    if (lowerBound >= mazeRowsCols) {
        lowerBound = mazeRowsCols - 1;
    }

    // console.log(`looking X: ${col}-${rightBound} looking Y: ${row}-${lowerBound}`)

    let subRooms = [];

    allRooms.forEach(room => {
        if (room.col >= col && room.col <= rightBound) {
            if (room.row >= row && room.row <= lowerBound) {
                subRooms.push(room);
            }
        }
    });

    return subRooms;
}

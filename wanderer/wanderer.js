const EventType = Object.freeze({
    TEXT_ONLY: "TEXT_ONLY",
    ENCOUNTER: "ENCOUNTER",
});

class Event {

    title = "Corridor";
    type = null;
    colorDiscovered = "#FFFFFF";
    colorUndiscovered = "#FFFFFF";
    isLive = true;
    isDiscovered = false;
    event = null;

    constructor(title, type, colorUndiscovered, colorDiscovered, event) {
        this.title = title;
        this.type = type;
        this.colorUndiscovered = colorUndiscovered;
        this.colorDiscovered = colorDiscovered;
        this.event = event;
    }

    getColor() {
        if (this.isDiscovered == true) {
            return this.colorDiscovered;
        } else {
            return this.colorUndiscovered;
        }
    }

    triggerEvent() {
        this.event();
    }


}

class Room {

    row = 0;
    col = 0;
    open = false;
    event = null;

    constructor(row, col, open) {
        this.row = row;
        this.col = col;
        this.open = open;
    }

    setEvent(event) {
        this.event = event;
    }

    triggerEvent() {
        if (this.event != null) {
            this.event.triggerEvent();
        }
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

class Clickable {

    x = 0;
    y = 0;
    width = 0;
    height = 0;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    containsClick(click) {
        return (click.offsetX >= this.x) && (click.offsetX <= (this.x + this.width)) && (click.offsetY >= this.y) && (click.offsetY <= (this.y + this.height));
    }
}

const DieMode = Object.freeze({
    ATTACK: "ATTACK",
    DEFEND: "DEFEND",
    INITIATIVE: "INITIATIVE"
});


class Die extends Clickable {

    size = 100;
    pips = 1;
    type = DieMode.ATTACK;
    color = "#A64200";

    constructor(x, y, size, pips) {
        super(x, y, size, size);
        this.size = size;
        this.pips = pips;
    }

    setPips(pips) {
        this.pips = pips;
    }

    nextType() {
        switch (this.type) {
            case DieMode.ATTACK:
                this.type = DieMode.DEFEND;
                this.color = "#0055ff";
                break;
            case DieMode.DEFEND:
                this.type = DieMode.INITIATIVE;
                this.color = "#ff0890";
                break;
            case DieMode.INITIATIVE:
                this.type = DieMode.ATTACK;
                this.color = "#A64200";
                break;
        }
    }

    render(context) {

        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);

        // Draw pips
        context.fillStyle = "#000000";


        console.log(this.type, this.pips);

        // Center pip
        if (this.pips == 1 || this.pips == 3 || this.pips == 5) {
            context.beginPath();
            context.ellipse(
                this.x + (this.size / 2),
                this.y + (this.size / 2),
                this.size / 10,
                this.size / 10,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();
        }

        if (this.pips == 2 || this.pips == 3 || this.pips == 4 || this.pips == 5 || this.pips == 6) {
            // upper left
            context.beginPath();
            context.ellipse(
                this.x + (this.size / 6),
                this.y + (this.size / 6),
                this.size / 10,
                this.size / 10,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();

            // lower right
            context.beginPath();
            context.ellipse(
                this.x + (this.size / 1.25),
                this.y + (this.size / 1.25),
                this.size / 10,
                this.size / 10,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();
        }

        if (this.pips == 4 || this.pips == 5 || this.pips == 6) {
            // lower left
            context.beginPath();
            context.ellipse(
                this.x + (this.size / 6),
                this.y + (this.size / 1.25),
                this.size / 10,
                this.size / 10,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();

            // upper right
            context.beginPath();
            context.ellipse(
                this.x + (this.size / 1.25),
                this.y + (this.size / 6),
                this.size / 10,
                this.size / 10,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();
        }

        if (this.pips == 6) {
            // center left
            context.beginPath();
            context.ellipse(
                this.x + (this.size / 6),
                this.y + (this.size / 2),
                this.size / 10,
                this.size / 10,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();

            // center right
            context.beginPath();
            context.ellipse(
                this.x + (this.size / 1.25),
                this.y + (this.size / 2),
                this.size / 10,
                this.size / 10,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();
        }
    }
}

class CombatState {

    clickables = [];

    addClickable(clickable) {
        this.clickables.push(clickable);
    }

    processClick(click) {
        this.clickables.forEach(clickable => {
            if (clickable.containsClick(click)) {
                clickable.nextType();
                render();
            }
        });
    }

    render(context) {
        let offset = 10;
        context.fillStyle = "#515151";
        context.fillRect(offset, offset, 350, 350);

        this.clickables.forEach(clickable => {
            clickable.render(context);
        });
    }
}

const GameState = Object.freeze({
    ROAMING: "ROAMING",
    ENCOUNTER: "ENCOUNTER"
});

var currentState = GameState.ROAMING;
var combatState = new CombatState();

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

var bigMapMode = false;

var turnsMade = 0;
const turnsMax = 1000;



document.addEventListener('keydown', (e) => {

    if (currentState == GameState.ROAMING) {
        switch (e.key) {
            case "a":
            case "ArrowLeft":
                maybeRoom = getRoom(player.y, player.x - 1);
                if (!bigMapMode && maybeRoom.open == true) {
                    player.x--;
                    if (player.x < 0) {
                        player.x = 0;
                    }

                    turnsMade++;
                    maybeRoom.triggerEvent();

                    // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
                    if (player.x < mazeRowsCols - Math.floor(mazeWindowSize / 2) - 1) {
                        if (mazeWindowX >= 0 && mazeWindowX < mazeRowsCols) {
                            mazeWindowX--;
                            if (mazeWindowX < 0) {
                                mazeWindowX = 0;
                            }
                        }
                    }
                }
                break;
            case "d":
            case "ArrowRight":
                maybeRoom = getRoom(player.y, player.x + 1);
                if (!bigMapMode && maybeRoom.open == true) {
                    player.x++;
                    if (player.x >= mazeRowsCols) {
                        player.x = mazeRowsCols - 1;
                    }

                    turnsMade++;
                    maybeRoom.triggerEvent();

                    // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
                    if (player.x >= Math.floor(mazeWindowSize / 2) + 1) {
                        if (mazeWindowX >= 0 && mazeWindowX < mazeRowsCols) {
                            mazeWindowX++;
                            if (mazeWindowX >= mazeRowsCols - mazeWindowSize) {
                                mazeWindowX = mazeRowsCols - mazeWindowSize;
                            }
                        }
                    }
                }
                break;
            case "w":
            case "ArrowUp":
                maybeRoom = getRoom(player.y - 1, player.x);
                if (!bigMapMode && maybeRoom.open == true) {

                    player.y--;
                    if (player.y < 0) {
                        player.y = 0;
                    }

                    turnsMade++;
                    maybeRoom.triggerEvent();

                    // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
                    if (player.y < mazeRowsCols - Math.floor(mazeWindowSize / 2) - 1) {
                        if (mazeWindowY >= 0 && mazeWindowY < mazeRowsCols) {
                            mazeWindowY--;
                            if (mazeWindowY < 0) {
                                mazeWindowY = 0;
                            }
                        }
                    }
                }
                break;
            case "s":
            case "ArrowDown":
                maybeRoom = getRoom(player.y + 1, player.x);
                if (!bigMapMode && maybeRoom.open == true) {
                    player.y++;
                    if (player.y >= mazeRowsCols) {
                        player.y = mazeRowsCols - 1;
                    }

                    turnsMade++;
                    maybeRoom.triggerEvent();

                    // Only move the window if the player's y position is at least 1/2 of the mazeWindowSize
                    if (player.y >= Math.floor(mazeWindowSize / 2) + 1) {
                        if (mazeWindowY >= 0 && mazeWindowY < mazeRowsCols) {
                            mazeWindowY++;
                            if (mazeWindowY >= mazeRowsCols - mazeWindowSize) {
                                mazeWindowY = mazeRowsCols - mazeWindowSize;
                            }
                        }
                    }
                }

                break;
            case " ":
                bigMapMode = !bigMapMode;
                break;
            case "Escape":
                bigMapMode = false;
                break;
            default:
                console.log(e);
                break;
        }

        render();
    } else if (currentState == GameState.ENCOUNTER) {

    }
});

document.addEventListener('mousedown', (e) => {

    combatState.processClick(e);
    render();
});


// Setup (IFFE function)
var setup = function () {

    for (var i = 0; i < mazeRowsCols; i++) {

        mazeArray[i] = new Array(mazeRowsCols);

        for (var j = 0; j < mazeRowsCols; j++) {
            var room = new Room(i, j, false);
            allRooms.push(room);
            mazeArray[i][j] = room;
        }
    }

    createMaze();

    // Populate the maze with random events
    let subDivisions = 10;
    let chunkSize = Math.floor(mazeRowsCols / subDivisions);

    let events = shuffleArray(createEvents());

    for (var divCol = 0; divCol < subDivisions; divCol++) {
        for (var divRow = 0; divRow < subDivisions; divRow++) {
            let rooms = getMazeSubsection(divCol * chunkSize, divRow * chunkSize, chunkSize);
            createDestinations(rooms, 1, events.pop());
        }
    }

    for (var i = 0; i < 5; i++) {
        combatState.addClickable(new Die(200 + (100 * i), 600, 85, 0));
    }

    render();
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

function createEvents() {

    let events = [];

    for (var i = 0; i < 100; i++) {
        if (i % 2 == 0) {
            events.push(new Event("Locator", EventType.TEXT_ONLY, "#FFFFFF", "#4E4E4E", () => {
                console.log("There is a beacon here.");
            }));
        } else {
            events.push(new Event("Enemy", EventType.ENCOUNTER, "#FFFFFF", "#000000", () => {
                console.log("A hideously deformed mutant lurches nearby.");
                currentState = GameState.ENCOUNTER;
            }));
        }
    }

    return events;
}

function createDestinations(roomList, numDestinations, event) {

    for (var i = 0; i < numDestinations; i++) {

        let rooms = shuffleArray(roomList);

        let targetRoom = rooms.filter(room => {
            return (room.open == true);
        })[0];

        if (targetRoom != null) {
            targetRoom.setEvent(event);
        }
    }
}

function render() {

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (currentState == GameState.ROAMING) {
        if (bigMapMode == true) {
            drawEntireMaze();
        } else {
            drawWindowedMaze();
        }
    } else {
        drawEncounterPanel(context);
    }

    drawStatus();
}

// Draws the section of the maze occupied by the player
function drawWindowedMaze() {

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let subRooms = getMazeSubsection(mazeWindowY, mazeWindowX, mazeWindowSize);

    subRooms.forEach(room => {

        if (room.open) {
            context.fillStyle = "#606060";
        } else {
            context.fillStyle = "#000000";
        }

        context.fillRect(
            (room.col - mazeWindowX) * roomSize,
            (room.row - mazeWindowY) * roomSize,
            roomSize,
            roomSize);

        // Render a dot
        if (room.event != null) {
            room.event.isDiscovered = true;
            context.fillStyle = room.event.getColor();
            context.lineWidth = 1.0;
            context.beginPath();
            context.ellipse(
                ((room.col - mazeWindowX) * roomSize) + roomSize / 2,
                ((room.row - mazeWindowY) * roomSize) + roomSize / 2,
                roomSize / 4, roomSize / 4,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();
        }
    });

    // render player
    context.fillStyle = "#6E0000";
    context.fillRect((player.x - mazeWindowX) * roomSize + 50, (player.y - mazeWindowY) * roomSize + 50, 25, 25);
}

function drawEntireMaze() {

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let size = 17.5;

    allRooms.forEach(room => {

        if (room.event != null) {

            // Draw room
            context.fillStyle = "#606060";
            context.fillRect(
                room.col * size,
                room.row * size,
                size,
                size);

            // Draw dot 
            context.fillStyle = room.event.getColor();
            context.lineWidth = 1.0;
            context.beginPath();
            context.ellipse(
                (room.col * size) + (size / 2),
                (room.row * size) + (size / 2),
                size / 4,
                size / 4,
                2 * Math.PI,
                2 * Math.PI,
                false);
            context.fill();
        } else if (room.open) {
            context.fillStyle = "#606060";
            context.fillRect(
                room.col * size,
                room.row * size,
                size,
                size);
        } else {
            context.fillStyle = "#000000";
            context.fillRect(
                room.col * size,
                room.row * size,
                size,
                size);
        }

    });

    // Draw player
    context.fillStyle = "#FF0000";
    context.lineWidth = 1.0;
    context.beginPath();
    context.ellipse(
        (player.x * size) + (size / 2),
        (player.y * size) + (size / 2),
        size / 4,
        size / 4,
        2 * Math.PI,
        2 * Math.PI,
        false);
    context.fill();
}

function drawEncounterPanel(context) {
    combatState.render(context);
}

function rollDie(low, high) {
    return low + Math.floor((Math.random() * high));
}



function drawStatus() {

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    context.strokeStyle = "#FF0000";
    context.fillStyle = "#FF0000";
    context.lineWidth = 2.0;
    context.font = "12px sans-serif";
    context.strokeText(`TURN: ${turnsMade} / ${turnsMax}`, 15, 893);
}
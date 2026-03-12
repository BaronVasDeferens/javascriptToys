import { Scene, SceneType } from "./scene.js";



export class MazeScene extends Scene {

    backgroundImage = new Image();

    mazeArray = [];
    allRooms = [];

    mazeWindowWidth = 7;              // Number of maze squares visible on screen at any time
    mazeWindowHeight = 7;
    mazeWindowX = 0;                // array position/s of maze window
    mazeWindowY = 0;

    player = new Player(2, 2);

    constructor(mazeRows, mazeCols, tileSize, canvas, assetManager, soundPlayer) {

        super(SceneType.MAZE_SCENE, canvas, assetManager, soundPlayer);

        this.mazeRows = mazeRows;
        this.mazeCols = mazeCols;
        this.tileSize = tileSize;

        this.mazeWindowWidth = canvas.width / tileSize;
        this.mazeWindowHeight = canvas.height / tileSize;

        console.log(`${tileSize} ${this.mazeWindowWidth} ${this.mazeWindowHeight}`);

        this.initialize();
    }

    initialize() {

        for (let i = 0; i < this.mazeRows; i++) {

            this.mazeArray[i] = new Array(this.mazeCols);

            for (let j = 0; j < this.mazeCols; j++) {
                let room = new MazeRoom(i, j, false);
                this.allRooms.push(room);
                this.mazeArray[i][j] = room;
            }
        }

        this.createMaze();

    }

    onStart() {

    }

    onStop() {

    }

    onMouseDown(click) {

    }

    onMouseUp(click) {

    }

    onMouseMove(event) {

    }

    onKeyPressed(event) {

        let maybeRoom = null;

        switch (event.key) {

            case "a":
            case "ArrowLeft":
                maybeRoom = this.getRoom(this.player.y, this.player.x - 1);
                if (maybeRoom.open == true) {

                    this.player.x--;
                    if (this.player.x < 0) {
                        this.player.x = 0;
                    }

                    //turnsMade++;
                    //maybeRoom.triggerEvent();

                    // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
                    if (this.player.x < this.mazeWindowX + Math.floor(this.mazeWindowWidth / 2)) {
                                        
                        if (this.mazeWindowX >= 0 && this.mazeWindowX < this.mazeCols) {
                            
                            this.mazeWindowX--;
                            if (this.mazeWindowX < 0) {
                                this.mazeWindowX = 0;
                            }
                        }
                    }
                }
                break;

            case "d":
            case "ArrowRight":
                maybeRoom = this.getRoom(this.player.y, this.player.x + 1);
                if (maybeRoom.open == true) {

                    this.player.x++;
                
                    if (this.player.x >= this.mazeCols) {
                        this.player.x = this.mazeCols - 1;
                    }

                    //turnsMade++;
                    //maybeRoom.triggerEvent();

                    // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
                    if (this.player.x > this.mazeWindowX + Math.floor(this.mazeWindowWidth / 2)) {

                        if (this.mazeWindowX >= 0 && this.mazeWindowX < this.mazeCols) {

                            this.mazeWindowX++;
                            if (this.mazeWindowX >= this.mazeCols - this.mazeWindowWidth) {
                                this.mazeWindowX = this.mazeCols - this.mazeWindowWidth;
                            }
                        }
                    }
                }
                break;

            case "w":
            case "ArrowUp":
                maybeRoom = this.getRoom(this.player.y - 1, this.player.x);
                if (maybeRoom.open == true) {

                    this.player.y--;
                    if (this.player.y < 0) {
                        this.player.y = 0;
                    }

                    // turnsMade++;
                    // maybeRoom.triggerEvent();

                    // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
                    if (this.player.y < this.mazeWindowY + Math.floor(this.mazeWindowHeight / 2)) {
                        
                        console.log("A")

                        if (this.mazeWindowY >= 0 && this.mazeWindowY < this.mazeRows) {
                           
                            console.log("B")
                            
                            this.mazeWindowY--;
                            if (this.mazeWindowY < 0) {
                                this.mazeWindowY = 0;
                            }
                        }
                    }
                }
                break;

            case "s":
            case "ArrowDown":
                maybeRoom = this.getRoom(this.player.y + 1, this.player.x);
                if (maybeRoom.open == true) {

                    this.player.y++;
                    if (this.player.y >= this.mazeRows) {
                        this.player.y = this.mazeRows - 1;
                    }

                    // turnsMade++;
                    // maybeRoom.triggerEvent();

                    // Only move the window if the player's y position is at least 1/2 of the mazeWindowSize
                    if (this.player.y > this.mazeWindowY + Math.floor(this.mazeWindowHeight / 2)) {

                        if (this.mazeWindowY >= 0 && this.mazeWindowY < this.mazeWindowHeight) {

                            this.mazeWindowY++;

                            if (this.mazeWindowY >= this.mazeRows - this.mazeWindowHeight) {
                                this.mazeWindowY = this.mazeRows - this.mazeWindowHeight;
                            }
                        }
                    }
                }

                break;

            default:
                console.log(event.key);
        }

        console.log(`pxy: (${this.player.x}, ${this.player.y})  mwX: ${this.mazeWindowX} mwY: ${this.mazeWindowY}`)

    }

    onVisibilityStateChanged(state) {

    }

    update(delta) {

    }

    render(context) {
        context.fillStyle = "#00FF00";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWindowedMaze(context);
    }

    drawWindowedMaze(context) {

        let subRooms = this.getMazeSubsection(this.mazeWindowY, this.mazeWindowX, this.mazeWindowWidth, this.mazeWindowHeight);

        subRooms.forEach(room => {

            if (room.open) {
                context.fillStyle = "#606060";
            } else {
                context.fillStyle = "#000000";
            }

            context.fillRect(
                (room.col - this.mazeWindowX) * this.tileSize,
                (room.row - this.mazeWindowY) * this.tileSize,
                this.tileSize,
                this.tileSize);
        });

        context.fillStyle = "#6E0000";
        context.fillRect(
            (this.player.x - this.mazeWindowX) * this.tileSize + (this.tileSize / 4),
            (this.player.y - this.mazeWindowY) * this.tileSize + (this.tileSize / 4),
            (this.tileSize / 2),
            (this.tileSize / 2)
        );
    }

    getRandomRoom() {
        var index = Math.floor(Math.random() * 1000 % (this.mazeRows * this.mazeCols));
        return this.allRooms[index]
    }

    getRoom(row, col) {
        try {
            return this.mazeArray[row][col];
        } catch (e) {
            return undefined;
        }
    }

    getAdjacentRooms(row, col) {

        let room = this.getRoom(row, col);
        let adjacentRooms = new Array();

        let up = this.getRoom(row, col - 1);
        if (up !== undefined) {
            adjacentRooms.push(up);
        }

        let down = this.getRoom(row, col + 1);
        if (down !== undefined) {
            adjacentRooms.push(down);
        }

        let left = this.getRoom(row - 1, col);
        if (left !== undefined) {
            adjacentRooms.push(left);
        }

        let right = this.getRoom(row + 1, col);
        if (right !== undefined) {
            adjacentRooms.push(right);
        }

        return adjacentRooms;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    areDiagonalsOpen(room) {

        let diag = this.getRoom(room.row - 1, room.col - 1);

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

    createMaze() {

        let inMaze = [];
        let reachable = [];
        let frontier = [];

        // Define the "start room" and adjacent rooms...
        let startRoom = this.getRandomRoom();
        console.log("START " + startRoom.row + "," + startRoom.col);
        startRoom.open = true;
        inMaze.push(startRoom);
        reachable.push(startRoom);

        let adjacentRooms = this.getAdjacentRooms(startRoom.row, startRoom.col);
        adjacentRooms.forEach(function (r) {
            frontier.push(r);
            reachable.push(r);
        });


        while (reachable.length != this.allRooms.length) {

            this.shuffleArray(frontier);

            let newRoom = frontier.pop();

            // Disqualify any room whose neighbors are all already reachable

            //            if (getAdjacentRooms(newRoom.row, newRoom.col).length == 0)
            //                continue;

            if (this.getAdjacentRooms(newRoom.row, newRoom.col).every(function (r) {
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

                this.getAdjacentRooms(newRoom.row, newRoom.col).forEach(function (r) {
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

    getMazeSubsection(row, col, width, height) {

        //size = size - 1;

        if (col < 0) {
            col = 0;
        }

        let rightBound = col + width - 1;
        if (rightBound >= this.mazeCols) {
            rightBound = this.mazeCols - 1;
        }

        if (row < 0) {
            row = 0;
        }

        let lowerBound = row + height - 1;
        if (lowerBound >= this.mazeRows) {
            lowerBound = this.mazeRows - 1;
        }

        // console.log(`looking X: ${col}-${rightBound} looking Y: ${row}-${lowerBound}`)

        let subRooms = [];

        this.allRooms.forEach(room => {
            if (room.col >= col && room.col <= rightBound) {
                if (room.row >= row && room.row <= lowerBound) {
                    subRooms.push(room);
                }
            }
        });

        return subRooms;
    }

}


class MazeRoom {

    row = 0;
    col = 0;
    isOpen = false;

    constructor(row, col, isOpen) {
        this.row = row;
        this.col = col;
        this.isOpen = isOpen;
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
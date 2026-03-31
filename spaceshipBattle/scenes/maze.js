import { SoundAsset } from "../assets.js";
import { MovementDriver, MazeEntityMovementDriver } from "../driver.js";
import { Scene, SceneType } from "./scene.js";
import { Entity } from "../entity/entity.js";



export class MazeScene extends Scene {

    backgroundImage = new Image();

    mazeArray = [];
    allRooms = [];
    visibleRooms = [];
    eventList = [];

    entitiesEnemy = [];

    mazeWindowWidth = 0;              // Number of maze squares visible on screen at any time
    mazeWindowHeight = 0;
    mazeWindowX = 0;                // array position/s of maze window
    mazeWindowY = 0;

    player = null;

    movementRateDefaultMillis = 100;      // time to traverse from one grid section to the next 

    movementDrivers = [];

    debugShowLineOfSight = false;
    lineOfSightLines = [];

    constructor(sceneManager, mazeCols, mazeRows, tileSize, canvas, assetManager, soundPlayer) {

        super(SceneType.MAZE_SCENE, canvas, assetManager, soundPlayer);

        this.sceneManager = sceneManager;
        this.mazeRows = mazeRows;
        this.mazeCols = mazeCols;
        this.tileSize = tileSize;

        this.mazeWindowWidth = canvas.width / tileSize;
        this.mazeWindowHeight = canvas.height / tileSize;

        this.initialize();
    }

    initialize() {

        this.eventList = [];

        this.movementDrivers = [];
        this.lineOfSightLines = [];

        this.entitiesEnemy = [];

        this.allRooms = [];
        this.mazeArray = [];

        // CREATE ROOMS
        for (let i = 0; i < this.mazeRows; i++) {
            this.mazeArray[i] = new Array(this.mazeCols);
            for (let j = 0; j < this.mazeCols; j++) {
                let room = new MazeRoom(i, j, this.tileSize, false);
                this.allRooms.push(room);
                this.mazeArray[i][j] = room;
            }
        }

        // SET UP MAZE
        this.createMaze();

        // CREATE EVENTS
        for (let n = 0; n < 5; n++) {
            this.eventList.push(
                new MazeEvent(() => {
                    // this.sceneManager.setCurrentSceneType(SceneType.GRID_DRAGGER)
                },
                    "#000000")
            );
        }

        // SCATTER EVENTS RANDOMLY ACROSS MAZE
        this.distributeEventsAcrossMap();

        // Find an UNOCCIPIED, NO EVENT square near the TOP LEFT
        let playerStartRoom = this.allRooms.sort((a, b) => {
            if ((a.x + a.y) < (b.x + b.y)) {
                return -1;
            } else if ((a.x + a.y) > (b.x + b.y)) {
                return 1;
            } else {
                return 0;
            }
        }).filter(room => { return (room.isOpen == true) && (room.event == null) })[0];

        this.player = new Player(
            playerStartRoom,
            this.tileSize
        );
    }

    onStart() {
        this.computeMazeWindow();
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

        var potentialRoom = null;

        switch (event.key) {

            case "a":
            case "ArrowLeft":
                potentialRoom = this.getRoom(this.player.row, this.player.col - 1);
                if (potentialRoom != null && potentialRoom.isOpen == true) {

                    this.movementDrivers.push(
                        new MazeEntityMovementDriver(
                            this.player,
                            potentialRoom,
                            this.movementRateDefaultMillis,
                            () => {
                                // onUpdate
                            },
                            () => {
                                // onComplete
                                this.player.setRoom(potentialRoom);

                                if (this.player.x < 0) {
                                    this.player.x = 0;
                                }

                                potentialRoom.triggerEventIfPresent();
                                //this.centerWindowOnPlayer();
                                this.computeMazeWindow();
                            }
                        )
                    )
                }

                break;

            case "d":
            case "ArrowRight":
                potentialRoom = this.getRoom(this.player.row, this.player.col + 1);
                if (potentialRoom != null && potentialRoom.isOpen == true) {

                    this.movementDrivers.push(
                        new MazeEntityMovementDriver(
                            this.player,
                            potentialRoom,
                            this.movementRateDefaultMillis,
                            () => {
                                // onUpdate
                            },
                            () => {
                                // onComplete
                                this.player.setRoom(potentialRoom);

                                // if (this.player.x >= this.mazeCols) {
                                //     this.player.x = this.mazeCols - 1;
                                // }

                                potentialRoom.triggerEventIfPresent();

                                this.computeMazeWindow();
                                //this.centerWindowOnPlayer();

                            }
                        )
                    )
                }

                break;

            case "w":
            case "ArrowUp":
                potentialRoom = this.getRoom(this.player.row - 1, this.player.col);
                if (potentialRoom != null && potentialRoom.isOpen == true) {

                    this.movementDrivers.push(
                        new MazeEntityMovementDriver(
                            this.player,
                            potentialRoom,
                            this.movementRateDefaultMillis,
                            () => {
                                // onUpdate
                            },
                            () => {
                                // onComplete
                                this.player.setRoom(potentialRoom);

                                // if (this.player.y < 0) {
                                //     this.player.y = 0;
                                // }

                                potentialRoom.triggerEventIfPresent();
                                //this.centerWindowOnPlayer();
                                this.computeMazeWindow();
                            }
                        )
                    )
                }
                break;

            case "s":
            case "ArrowDown":
                potentialRoom = this.getRoom(this.player.row + 1, this.player.col);
                if (potentialRoom != null && potentialRoom.isOpen == true) {

                    this.movementDrivers.push(
                        new MazeEntityMovementDriver(
                            this.player,
                            potentialRoom,
                            this.movementRateDefaultMillis,
                            () => {
                                // onUpdate
                            },
                            () => {
                                // onComplete
                                this.player.setRoom(potentialRoom);

                                // if (this.player.y >= this.mazeRows) {
                                //     this.player.y = this.mazeRows - 1;
                                // }

                                potentialRoom.triggerEventIfPresent();
                                //this.centerWindowOnPlayer();
                                this.computeMazeWindow();
                            }
                        )
                    )
                }
                break;

            case 'l':
                // Los sight lines on/off
                this.debugShowLineOfSight = !this.debugShowLineOfSight;
                break;

            case 'Escape':

                console.log("init?");

                this.initialize();
                this.computeMazeWindow();

                break;

            default:
                console.log(`unrecognized key: ${event.key}`);
                break;
        }

    }

    computeMazeWindow() {
        this.visibleRooms = this.getMazeSubsection(this.mazeWindowY, this.mazeWindowX, this.mazeWindowWidth, this.mazeWindowHeight);
        this.computeEntityVisibility();
    }

    computeEntityVisibility() {

        this.lineOfSightLines = [];

        /**
         * Computes line of sight (LOS) to other things in the maze.
         * From the player's position, draw lines to each event and entity.
         * If any such line crosss through a grid square that is block (open == false),
         * then no LOS can be established to that entity/event.
         */

        let playerRoom = this.player.room;
        let visibilityMap = this.eventList
            .filter(evt => { return evt.isActive == true })
            .map(evt => {
                let eventRoom = evt.room;
                let result = {
                    event: evt,
                    isVisible: this.calculateLineOfSight(playerRoom, eventRoom)
                }

                let playerCenter = playerRoom.getCenter();
                let targetCenter = eventRoom.getCenter();

                this.lineOfSightLines.push(
                    {
                        startX: playerCenter.x,
                        startY: playerCenter.y,
                        endX: targetCenter.x,
                        endY: targetCenter.y,
                        isVisible: result.isVisible
                    }
                )

                return result;
            });

        return visibilityMap;
    }

    calculateLineOfSight(origin, target) {

        /**
         * Draw a line of sight (LOS) from the center of one grid square (origin) to the another (target).
         * Next, "sub-sample" points from the line at regular intervals and find any squares that contain
         * the those points.
         * 
         * Returns TRUE if there exists LOS between the two squares;
         * FALSE if obstructed
         */

        let pathSquares = new Set();

        let rise = target.row - origin.row;                     // vertical difference: rise
        let run = target.col - origin.col;                      // horizontal difference: run
        let theta = Math.atan(Math.abs(rise) / Math.abs(run));

        let deltaX = Math.cos(theta) * (this.tileSize / 4);
        if (run < 0 && deltaX > 0) {
            deltaX = deltaX * -1;
        }

        let deltaY = Math.sin(theta) * (this.tileSize / 4);
        if (rise < 0 && deltaY > 0) {
            deltaY = deltaY * -1;
        }

        let candidate = origin;

        let zPoint = {
            x: candidate.getCenter().x + deltaX,
            y: candidate.getCenter().y + deltaY
        };

        while (candidate != target) {

            zPoint = {
                x: zPoint.x + deltaX,
                y: zPoint.y + deltaY
            };

            let nextSquare = this.findMazeRoomAtPoint(zPoint);

            if (nextSquare == null) {
                break;
            }

            if (candidate != target && candidate != origin) {
                pathSquares.add(candidate);
            }

            candidate = nextSquare;
        }

        return Array.from(pathSquares).every(room => { return room.isOpen == true })
    }

    findMazeRoomAtPoint(event) {

        // columns: x
        // rows : y

        let column = Math.floor(event.x / this.tileSize);
        let row = Math.floor(event.y / this.tileSize);

        if (column > this.mazeCols || row > this.mazeRows) {
            return;
        }

        let target = this.mazeArray[row].find(sq => sq.col === column);
        return target;
    }

    centerWindowOnPlayer() {

        // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
        if (this.player.x < this.mazeWindowX + Math.floor(this.mazeWindowWidth / 2)) {
            if (this.mazeWindowX >= 0 && this.mazeWindowX < this.mazeCols) {
                this.mazeWindowX--;
                if (this.mazeWindowX < 0) {
                    this.mazeWindowX = 0;
                }
            }
        }

        // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
        if (this.player.x > this.mazeWindowX + Math.floor(this.mazeWindowWidth / 2)) {
            if (this.mazeWindowX >= 0 && this.mazeWindowX < this.mazeCols) {
                this.mazeWindowX++;
                if (this.mazeWindowX >= this.mazeCols - this.mazeWindowWidth) {
                    this.mazeWindowX = this.mazeCols - this.mazeWindowWidth;
                }
            }
        }

        // Only move the window if the player's x position is at least 1/2 of the mazeWindowSize
        if (this.player.y < this.mazeWindowY + Math.floor(this.mazeWindowHeight / 2)) {
            if (this.mazeWindowY >= 0 && this.mazeWindowY < this.mazeRows) {
                this.mazeWindowY--;
                if (this.mazeWindowY < 0) {
                    this.mazeWindowY = 0;
                }
            }
        }

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

    onVisibilityStateChanged(state) {

    }

    update(delta) {
        let driver = this.movementDrivers[0];
        if (driver != null) {
            if (driver.isFinished == true) {
                this.movementDrivers.shift()
            } else {
                driver.update(delta)
            }
        }
    }

    render(context) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.visibleRooms.forEach(room => {
            room.render(context, this.mazeWindowX, this.mazeWindowY);
        });

        // Render player token
        this.player.render(context, this.mazeWindowX, this.mazeWindowY)

        // render LOS
        if (this.debugShowLineOfSight == true) {
            this.lineOfSightLines.forEach(line => {
                if (line.isVisible == true) {
                    context.strokeStyle = "#00FF00";
                } else {
                    context.strokeStyle = "#FF0000";
                }

                context.lineWidth = 1.0;
                context.save();
                context.beginPath();
                context.moveTo(line.startX, line.startY);
                context.lineTo(line.endX, line.endY);
                context.stroke();
                context.restore();
            })
        }
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
            if (diag.isOpen) { return true; }
        }

        diag = getRoom(room.row - 1, room.col + 1);
        if (diag !== undefined) {
            if (diag.isOpen) { return true; }
        }

        diag = getRoom(room.row + 1, room.col - 1);
        if (diag !== undefined) {
            if (diag.isOpen) { return true; }
        }

        diag = getRoom(room.row + 1, room.col + 1);
        if (diag !== undefined) {
            if (diag.isOpen) { return true; }
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
        startRoom.setIsOpen(true)
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

                // Disqualify any room whose diagonal is already isOpen
                //                if (areDiagonalsOpen(newRoom)) {
                //                    console.log("skipping " + newRoom.row + "," + newRoom.col);
                //                    continue;
                //                }

                newRoom.setIsOpen(true);
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

    distributeEventsAcrossMap() {
        let rooms = this.allRooms.filter(room => { return room.isOpen == true });
        this.shuffleArray(rooms);
        let index = 0;
        this.eventList.forEach(event => {
            let room = rooms[index];
            room.setEvent(event);
            index++;
        });
    }
}


class Player {

    x = 0;
    y = 0;
    tileSize = 64;

    color = "#6E0000";

    room = null;

    constructor(room, tileSize) {
        this.setRoom(room);
        this.tileSize = tileSize;

        console.log(`(${this.x}, ${this.y}) r:${this.row} c:${this.col}`)
    }

    setRoom(room) {
        this.room = room;
        this.row = this.room.row;
        this.col = this.room.col;
        this.x = this.col * this.tileSize;
        this.y = this.row * this.tileSize;
        console.log(`room set r/c:${this.row} ${this.col}`)
    }

    render(context) {
        context.fillStyle = this.color;
        context.fillRect(
            this.x + (this.tileSize / 4),
            this.y + (this.tileSize / 4),
            (this.tileSize / 2),
            (this.tileSize / 2)
        );
    }
};

class MazeRoom {

    row = 0;
    col = 0;
    roomSize = 64;
    isOpen = false;         // Whether this room can be occupied

    occupant = null;
    isOccupied = false;

    event = null;

    constructor(row, col, roomSize, isOpen) {
        this.row = row;
        this.col = col;
        this.roomSize = roomSize;
        this.setIsOpen(isOpen);
    }

    setIsOpen(isOpen) {
        this.isOpen = isOpen;

        if (this.isOpen == true) {
            this.color = "#606060";
        } else {
            this.color = "#000000";
        }
    }

    setEvent(event) {
        this.event = event;
        this.event.setRoom(this);
    }

    setOccupant(entity) {
        this.occupant = entity;
        if (this.occupant != null) {
            this.isOccupied = true;
        } else {
            this.isOccupied = false;
        }
    }

    triggerEventIfPresent() {
        if (this.event != null) {
            this.event.triggerEvent();
        }
    }

    getCenter() {
        let xCenter = (this.col * this.roomSize) + (this.roomSize / 2);
        let yCenter = (this.row * this.roomSize) + (this.roomSize / 2);
        return { x: xCenter, y: yCenter };
    }

    render(context, mazeWindowX, mazeWindowY) {

        // Draw a border
        context.strokeStyle = "#000000"
        context.strokeRect(
            (this.col - mazeWindowX) * this.roomSize,
            (this.row - mazeWindowY) * this.roomSize,
            this.roomSize,
            this.roomSize)

        // Draw the room
        context.fillStyle = this.color;
        context.fillRect(
            (this.col - mazeWindowX) * this.roomSize,
            (this.row - mazeWindowY) * this.roomSize,
            this.roomSize,
            this.roomSize
        );

        if (this.event != null) {
            this.event.render(context, mazeWindowX, mazeWindowY);
        }
    }

};

class MazeMonster {

    x = 0;
    y = 0;
    tileSize = 64;

    room = null;
    color = "#00FF00"

    constructor(room, tileSize) {
        this.room = room;
        this.tileSize = tileSize;
        this.x = this.room.col * this.tileSize;
        this.y = this.room.row * this.tileSize;
    }

    setRoom(room) {
        this.room = room;
    }

    render(context, mazeWindowX, mazeWindowY) {

        context.fillStyle = this.color;
        context.lineWidth = 1.0;
        context.beginPath();
        context.ellipse(
            ((this.room.col - mazeWindowX) * this.room.roomSize) + this.room.roomSize / 2,
            ((this.room.row - mazeWindowY) * this.room.roomSize) + this.room.roomSize / 2,
            this.room.roomSize / 4, this.room.roomSize / 4,
            2 * Math.PI,
            2 * Math.PI,
            false);
        context.fill();
    }

}

class MazeEvent {

    onTrigger = null;
    color = "#FF0000"
    room = null;

    isOneShot = true;
    isActive = true;

    constructor(onTrigger, color) {
        this.onTrigger = onTrigger;
        this.color = color;
    }

    setRoom(room) {
        this.room = room;
    }

    render(context, mazeWindowX, mazeWindowY) {

        if (this.isActive == false) {
            return;
        }

        context.fillStyle = this.color;
        context.lineWidth = 1.0;
        context.beginPath();
        context.ellipse(
            ((this.room.col - mazeWindowX) * this.room.roomSize) + this.room.roomSize / 2,
            ((this.room.row - mazeWindowY) * this.room.roomSize) + this.room.roomSize / 2,
            this.room.roomSize / 4, this.room.roomSize / 4,
            2 * Math.PI,
            2 * Math.PI,
            false);
        context.fill();
    }

    triggerEvent() {
        if (this.isActive == true) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
        }

    }


}
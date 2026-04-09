import { ImageAsset } from "../assets.js";
import { MazeEntityMovementDriver, Driver } from "../driver.js";
import { Scene, SceneType } from "./scene.js";
import { SpellZone, SpellZoneComponentCard } from "../entity/entity_spell.js";

// "My name is Master Slave"
// WAGON MASTER

const GameSequence = Object.freeze(
    {
        "INITIALIZING": 0,
        "PLAYER_AWAITING_MOVEMENT": 1,
        "PLAYER_MOVING": 2,
        "ENEMY_PLOTTING_MOVEMENT": 3,
        "ENEMY_MOVING": 4
    }
);

export class MazeScene extends Scene {

    currentGameSequence = GameSequence.INITIALIZING;

    backgroundImage = new Image();

    mazeArray = [];
    allRooms = [];
    visibleRooms = [];
    eventList = [];

    numEnemyEntities = 5;
    entitiesEnemy = [];

    mazeWindowWidth = 0;                    // Number of maze squares visible on screen at any time
    mazeWindowHeight = 0;
    mazeWindowX = 0;                        // array position/s of maze window
    mazeWindowY = 0;

    player = null;

    movementRateDefaultMillis = 75;         // time to traverse from one grid section to the next 

    stateDrivers = [];                      // each state driver is processed in the order in which they are received (queue) during the update cycle

    spellZoneComponents = [];

    highlightedGridSquares = [];

    debugMode = false;
    debugShowLineOfSight = false;
    lineOfSightLines = [];

    constructor(sceneManager, mazeCols, mazeRows, tileSize, canvasPrimary, canvasSecondary, assetManager, soundPlayer) {

        super(SceneType.MAZE_SCENE, canvasPrimary, canvasSecondary, assetManager, soundPlayer);

        this.sceneManager = sceneManager;
        this.mazeRows = mazeRows;
        this.mazeCols = mazeCols;
        this.tileSize = tileSize;

        this.mazeWindowWidth = canvasPrimary.width / tileSize;
        this.mazeWindowHeight = canvasPrimary.height / tileSize;

        this.initialize();
    }

    updateGameSequence(newSequence) {
        if (this.currentGameSequence != newSequence) {

            if (this.debugMode == true) {
                console.log(`changing sequence: ${Object.keys(GameSequence).find(k => GameSequence[k] === newSequence)}`);
            }

            this.currentGameSequence = newSequence;

            switch (newSequence) {

                case GameSequence.INITIALIZING:
                    break;

                case GameSequence.PLAYER_AWAITING_MOVEMENT:
                    break;

                case GameSequence.PLAYER_MOVING:
                    break;

                case GameSequence.ENEMY_PLOTTING_MOVEMENT:
                    this.computeEnemyMoves();
                    this.stateDrivers.push(
                        new Driver(
                            0,
                            () => { },
                            () => {
                                this.updateGameSequence(GameSequence.PLAYER_AWAITING_MOVEMENT);
                                this.computeEntityVisibility()
                            }
                        )
                    )
                    break;

                case GameSequence.ENEMY_MOVING:
                    break;
            }
        }
    }

    initialize() {

        this.updateGameSequence(GameSequence.INITIALIZING)

        this.eventList = [];
        this.spellZoneComponents = [];
        this.highlightedGridSquares = [];
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

        // CREATE and PLACE EVENTS
        for (let n = 0; n < 5; n++) {
            this.eventList.push(
                new MazeEvent(() => {
                    // this.sceneManager.setCurrentSceneType(SceneType.GRID_DRAGGER)
                },
                    "#000000")
            );
        }


        this.distributeAcrossOpenRooms(this.eventList);


        // CREATE nad PLACE ENEMIES
        for (let n = 0; n < this.numEnemyEntities; n++) {
            this.entitiesEnemy.push(new MazeMonster(this.tileSize, this.assetManager));
            this.distributeAcrossOpenRooms(this.entitiesEnemy);
        }

        // CREATE and PLACE PLAYER
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
            this.assetManager,
            this.tileSize
        );


        // Populate spell ZONE COMPONENTS
        this.spellZoneComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CROSS_SMALL,
                this.canvasSecondary,
                0,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellZoneComponents.push(
            new SpellZoneComponentCard(
                SpellZone.COLUMN_FULL,
                this.canvasSecondary,
                64,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellZoneComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CANCEL,
                this.canvasSecondary,
                64,
                64,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellZoneComponents.push(
            new SpellZoneComponentCard(
                SpellZone.ROW_FULL,
                this.canvasSecondary,
                128,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.updateGameSequence(GameSequence.PLAYER_AWAITING_MOVEMENT);
    }

    onStart() {
        this.computeMazeWindow();
    }

    onStop() {

    }

    onMouseDown(click) {

    }

    onMouseDownSecondary(click) {

        let clickTarget = this.spellZoneComponents.filter(card => {
            return card.containsPoint(click)
        })[0];

        if (clickTarget != null) {

            switch (clickTarget.constructor) {

                case SpellZoneComponentCard:
                    this.handleZoneSection(clickTarget)
                    break;

                default:
                    console.log(`dunno: ${clickTarget}`)
                    break;
            }

        }
    }

    onMouseUp(click) {

    }

    onMouseMove(event) {

    }

    onMouseMoveSecondary(event) {

    }

    onKeyPressed(event) {

        var potentialRoom = null;

        if (this.currentGameSequence != GameSequence.PLAYER_AWAITING_MOVEMENT) {
            return;
        }

        switch (event.key) {

            case "a":
            case "ArrowLeft":
                potentialRoom = this.getRoom(this.player.row, this.player.col - 1);
                if (potentialRoom != null && potentialRoom.isOpen == true) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.moveEntityToRoom(
                        this.player,
                        potentialRoom,
                        this.movementRateDefaultMillis,
                        () => {
                            this.computeMazeWindow();
                            this.updateGameSequence(GameSequence.ENEMY_PLOTTING_MOVEMENT);
                        }
                    );
                }
                break;

            case "d":
            case "ArrowRight":
                potentialRoom = this.getRoom(this.player.row, this.player.col + 1);
                if (potentialRoom != null && potentialRoom.isOpen == true) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.moveEntityToRoom(
                        this.player,
                        potentialRoom,
                        this.movementRateDefaultMillis,
                        () => {
                            this.computeMazeWindow();
                            this.updateGameSequence(GameSequence.ENEMY_PLOTTING_MOVEMENT);
                        }
                    );
                }
                break;

            case "w":
            case "ArrowUp":
                potentialRoom = this.getRoom(this.player.row - 1, this.player.col);
                if (potentialRoom != null && potentialRoom.isOpen == true) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.moveEntityToRoom(
                        this.player,
                        potentialRoom,
                        this.movementRateDefaultMillis,
                        () => {
                            this.computeMazeWindow();
                            this.updateGameSequence(GameSequence.ENEMY_PLOTTING_MOVEMENT);
                        }
                    );
                }
                break;

            case "s":
            case "ArrowDown":
                potentialRoom = this.getRoom(this.player.row + 1, this.player.col);
                if (potentialRoom != null && potentialRoom.isOpen == true) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.moveEntityToRoom(
                        this.player,
                        potentialRoom,
                        this.movementRateDefaultMillis,
                        () => {
                            this.computeMazeWindow();
                            this.updateGameSequence(GameSequence.ENEMY_PLOTTING_MOVEMENT);
                        }
                    );
                }
                break;

            case 'l':
                // Los sight lines on/off
                this.debugMode = !this.debugMode;
                this.debugShowLineOfSight = !this.debugShowLineOfSight;
                console.log(`debug: ${this.debugMode}`);
                break;

            case 'Escape':
                this.initialize();
                this.computeMazeWindow();
                break;

            default:
                console.log(`unrecognized key: ${event.key}`);
                break;
        }

    }



    /**
     * Triggered when the user clicks on a SpellZone card to select an area of effect. 
     */
    handleZoneSection(zoneCard) {

        let rooms = [];
        let room = null;

        switch (zoneCard.spellZone) {

            case SpellZone.CANCEL:
                // Do nothing-- the highlighted rooms array will be emptied at the end of this method
                break;

            case SpellZone.COLUMN_FULL:

                // Rooms ABOVE player
                room = this.getRoom(this.player.room.row - 1, this.player.room.col);
                while (room != null) {
                    rooms.push(room)
                    room = this.getRoom(room.row - 1, room.col);
                }

                // Rooms BELOW player
                room = this.getRoom(this.player.room.row + 1, this.player.room.col);
                while (room != null) {
                    rooms.push(room)
                    room = this.getRoom(room.row + 1, room.col);
                }
                break;

            case SpellZone.ROW_FULL:

                // Rooms TO RIGHT of player
                room = this.getRoom(this.player.room.row, this.player.room.col + 1);
                while (room != null) {
                    rooms.push(room)
                    room = this.getRoom(room.row, room.col + 1);
                }

                // Rooms TO LEFT of player
                room = this.getRoom(this.player.room.row, this.player.room.col - 1);
                while (room != null) {
                    rooms.push(room)
                    room = this.getRoom(room.row, room.col - 1);
                }
                break;

            case SpellZone.CROSS_SMALL:
                rooms.push(this.getRoom(this.player.room.row - 1, this.player.room.col));
                rooms.push(this.getRoom(this.player.room.row + 1, this.player.room.col));
                rooms.push(this.getRoom(this.player.room.row, this.player.room.col + 1));
                rooms.push(this.getRoom(this.player.room.row, this.player.room.col - 1));
                break;

            default:
                break;
        }

        this.highlightedGridSquares = [];

        rooms
            .filter(rm => { return rm != null })
            .forEach(highlightedRoom => {
                this.highlightedGridSquares.push(
                    {
                        x: highlightedRoom.col,
                        y: highlightedRoom.row,
                        tileSize: this.tileSize,
                        render: function (context) {
                            context.fillStyle = "#FF0000";
                            context.globalAlpha = 0.5;
                            context.fillRect(
                                this.x * this.tileSize,
                                this.y * this.tileSize,
                                this.tileSize,
                                this.tileSize
                            )
                            context.globalAlpha = 1.0;
                        }

                    }
                )
            });

    }




    moveEntityToRoom(entity, room, rate, onComplete) {
        if (entity != null
            && room != null
            && room.isOpen == true
            //&& room.isOccupied == false
            //&& this.movementDrivers.length == 0
        ) {

            this.stateDrivers.push(
                new MazeEntityMovementDriver(
                    entity,
                    room,
                    rate,
                    () => {
                        // onUpdate
                    },
                    () => {
                        // onComplete
                        entity.setRoom(room);
                        room.triggerEventIfPresent();
                        onComplete();
                    }
                )
            )
        }
    }

    computeMazeWindow() {
        this.visibleRooms = this.getMazeSubsection(this.mazeWindowY, this.mazeWindowX, this.mazeWindowWidth, this.mazeWindowHeight);
        this.computeEntityVisibility();
    }

    computeEntityVisibility() {

        /**
         * Computes line of sight (LOS) to other things in the maze.
         * From the player's position, draw lines to each event and entity.
         * If any such line crosss through a grid square that is block (open == false),
         * then no LOS can be established to that entity/event.
         */

        this.lineOfSightLines = [];
        let playerRoom = this.player.room;
        let visibilityMap = this.entitiesEnemy
            .map(monster => {
                let eventRoom = monster.room;
                let result = {
                    target: monster,
                    isVisible: this.calculateLineOfSight(this.player.room, monster.room)
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

        return Array.from(pathSquares)
            .every(room => { return room.isOpen == true })
    }

    computeEnemyMoves() {

        // Ineligible rooms will be those that another monster has set it's sights on
        // TODO: ...but make the room that a monster is LEAVING elibible to the next monster
        let ineligibleRooms = [];


        this.entitiesEnemy.forEach(monster => {
            if (this.calculateLineOfSight(this.player.room, monster.room) == true) {
                let neighbors =
                    this.getAdjacentRooms(monster.room.row, monster.room.col)
                        .filter(room => { return room.isOpen == true })
                        .filter(room => { return ineligibleRooms.indexOf(room) == -1 });

                var neighbor = null;

                if (neighbors.length >= 2) {

                    let neighborsSortedByDistance = neighbors.sort((a, b) => {
                        let distA = Math.abs(this.player.room.row - a.row) + Math.abs(this.player.room.col - a.col);
                        let distB = Math.abs(this.player.room.row - b.row) + Math.abs(this.player.room.col - b.col);
                        if (distA > distB) {
                            return 1;
                        } else if (distA < distB) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });

                    neighbor = neighborsSortedByDistance[0];

                } else {
                    neighbor = neighbors[0];
                }

                ineligibleRooms.push(neighbor);
                this.moveEntityToRoom(monster, neighbor, 50, () => { });
            }
        })
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

        /*
            This is a relic leftover from when the maze was larger than the window could render.
            This function helped the maze window to scroll, keeping the payer in the center of
            the screen, or allow them to traverse to the edges.
        */


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
        let driver = this.stateDrivers[0];
        if (driver != null) {
            if (driver.isFinished == true) {
                this.stateDrivers.shift()
            } else {
                driver.update(delta)
            }
        }
    }

    render(contextPrimary, contextSecondary) {
        contextPrimary.fillStyle = "#000000";
        contextPrimary.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height);

        this.visibleRooms.forEach(room => {
            room.render(contextPrimary, this.mazeWindowX, this.mazeWindowY);
        });

        // Render enemies
        this.entitiesEnemy.forEach(monster => {
            monster.render(contextPrimary, this.mazeWindowX, this.mazeWindowY);
        })

        // Render player token
        this.player.render(contextPrimary, this.mazeWindowX, this.mazeWindowY)

        // Render LOS
        if (this.debugShowLineOfSight == true) {
            this.lineOfSightLines.forEach(line => {
                if (line.isVisible == true) {
                    contextPrimary.strokeStyle = "#00FF00";
                } else {
                    contextPrimary.strokeStyle = "#FF0000";
                }

                contextPrimary.lineWidth = 1.0;
                contextPrimary.save();
                contextPrimary.beginPath();
                contextPrimary.moveTo(line.startX, line.startY);
                contextPrimary.lineTo(line.endX, line.endY);
                contextPrimary.stroke();
                contextPrimary.restore();
            })
        }

        // Render highlighted squares
        this.highlightedGridSquares.forEach(sq => {
            sq.render(contextPrimary);
        });

        // Render the secondary canvas
        this.spellZoneComponents.forEach(component => {
            component.render(contextSecondary);
        });

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

    distributeAcrossOpenRooms(objects) {

        let availableRooms = this.allRooms.filter(room => {
            return room.isOpen == true && room.isOccupied == false;
        });

        this.shuffleArray(availableRooms);

        objects.forEach(object => {
            let room = availableRooms.pop();
            if (object instanceof MazeEvent) {
                room.setEvent(object);
            } else if (object instanceof MazeMonster) {
                room.setOccupant(object);
                object.setRoom(room);
            }
        });
    }
}


class Player {

    x = 0;
    y = 0;
    tileSize = 64;
    offsetX = 0;
    offsetY = 0;

    image = null;
    room = null;

    constructor(room, assetManager, tileSize) {
        this.setRoom(room);
        this.image = assetManager.getImage(ImageAsset.WIZARD_1);
        this.tileSize = tileSize;

        if (this.image.width < this.tileSize) {
            this.offsetX = Math.floor((this.tileSize - this.image.width) / 2);
        }

        if (this.image.height < this.tileSize) {
            this.offsetY = Math.floor((this.tileSize - this.image.height) / 2);
        }

    }

    setRoom(room) {
        this.room = room;
        this.row = this.room.row;
        this.col = this.room.col;
        this.x = this.col * this.tileSize;
        this.y = this.row * this.tileSize;
    }

    render(context) {
        context.drawImage(this.image, this.x + this.offsetX, this.y + this.offsetY);
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
    image = null;
    room = null;

    constructor(tileSize, assetManager) {
        this.tileSize = tileSize;
        this.image = assetManager.getImage(ImageAsset.GOBLIN_3);
    }

    setRoom(room) {
        this.room = room;
        this.x = this.room.col * this.tileSize;
        this.y = this.room.row * this.tileSize;
    }

    render(context, mazeWindowX, mazeWindowY) {
        context.drawImage(
            this.image,
            this.x + ((this.tileSize - this.image.width) / 2),
            this.y + ((this.tileSize - this, this.image.height) / 2)
        );
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
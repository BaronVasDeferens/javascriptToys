import { ImageAsset } from "../assets.js";
import { EntityMovementDriver, Driver, MultiEntityMovementDriver, SpellEffectOverlayDriver, ImageUpdateDriver } from "../driver.js";
import { Scene, SceneType } from "./scene.js";
import { SpellEffect, SpellEffectComponentCard, SpellEffectOverlay, SpellZone, SpellZoneComponentCard } from "../entity/entity_spell.js";
import { MonsterEntity, MonsterBehavior, MonsterPinkEye, MonsterSpider } from "../entity/entity_enemy.js";
import { PlayerEntity } from "../entity/entity_player.js"

/**
 * DUNGEON of DEBT
 * Version 2
 * 2026 Scott C West
 * 
 */

const GameSequence = Object.freeze(
    {
        "INITIALIZING": 0,
        "PLAYER_AWAITING_MOVEMENT": 10,
        "PLAYER_MOVING": 20,
        "SPECIAL_EFFECT_ANIMATING": 21,
        "ENEMY_PLOTTING_MOVEMENT": 30,
        "ENEMY_MOVING": 40,
        "GAME_OVER": 99999
    }
);

const Direction = Object.freeze({
    UP: { rowOffset: -1, colOffset: 0 },
    DOWN: { rowOffset: 1, colOffset: 0 },
    LEFT: { rowOffset: 0, colOffset: -1 },
    RIGHT: { rowOffset: 0, colOffset: 1 }
});

export class MazeScene extends Scene {

    currentGameSequence = GameSequence.INITIALIZING;

    backgroundImage = new Image();
    backgroundOpacity = 1.0;

    mazeArray = [];
    allRooms = [];
    visibleRooms = [];
    eventList = [];

    numEnemyEntities = 9;
    entitiesEnemy = [];

    mazeWindowWidth = 0;                    // Number of maze squares visible on screen at any time
    mazeWindowHeight = 0;
    mazeWindowX = 0;                        // array position/s of maze window
    mazeWindowY = 0;

    player = null;
    levelCurrent = 1;
    levelMax = 9;

    movementRateDefaultMillis = 50;         // time to traverse from one grid section to the next 

    stateDrivers = [];                      // each state driver is processed in the order in which they are received (queue) during the update cycle

    spellCardComponents = [];
    selectedSpellZone = null;
    selectedSpellEffect = null;

    highlightedGridSquares = [];

    spellEffectOverlay = null;              // if not null, render this item last

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

    initialize() {

        this.updateGameSequence(GameSequence.INITIALIZING)

        this.setLevel(this.levelCurrent);

        this.selectedSpellZone = null;
        this.selectedSpellEffect = null;

        this.eventList = [];
        this.spellCardComponents = [];
        this.highlightedGridSquares = [];
        this.stateDrivers = [];
        this.lineOfSightLines = [];

        this.entitiesEnemy = [];
        this.allRooms = [];
        this.mazeArray = [];

        this.backgroundOpacity = 1.0;

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

        // Print the rooms onto a re-usable background image...
        this.printToImage(this.canvasPrimary, this.backgroundImage, this.allRooms);
        let contextPrimary = this.canvasPrimary.getContext('2d');
        contextPrimary.fillStyle = "#00000";
        contextPrimary.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height)

        // EVENTS
        for (let n = 0; n < 5; n++) {

            this.eventList.push(
                new TreasureCollectableEvent(
                    () => { console.log(`cha-CHING ${n}`) },
                    this.assetManager
                )
            );
        }

        this.distributeAcrossOpenRooms(this.eventList);


        // ENEMIES
        for (let n = 0; n < this.levelCurrent; n++) {
            this.entitiesEnemy.push(new MonsterPinkEye(this.tileSize, this.assetManager));
        }

        for (let n = 0; n < this.levelMax - this.levelCurrent; n++) {
            this.entitiesEnemy.push(new MonsterSpider(this.tileSize, this.assetManager));
        }

        this.distributeAcrossOpenRooms(this.entitiesEnemy);

        // PLAYER
        // Find an UNOCCIPIED, NO EVENT square near the TOP LEFT
        let playerStartRoom = this.allRooms.sort((a, b) => {
            if ((a.x + a.y) < (b.x + b.y)) {
                return -1;
            } else if ((a.x + a.y) > (b.x + b.y)) {
                return 1;
            } else {
                return 0;
            }
        }).filter(room => { return room.isEmpty == true })[0];

        this.player = new PlayerEntity(
            playerStartRoom,
            this.tileSize,
            this.assetManager
        );


        // Spell ZONE cards
        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CROSS_SMALL,
                () => { this.onSpellZoneSected(SpellZone.CROSS_SMALL) },
                this.canvasSecondary,
                0,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CROSS_INVERTED,
                () => { this.onSpellZoneSected(SpellZone.CROSS_INVERTED) },
                this.canvasSecondary,
                0,
                64,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.COLUMN_FULL,
                () => { this.onSpellZoneSected(SpellZone.COLUMN_FULL) },
                this.canvasSecondary,
                64,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CANCEL,
                () => { this.onSpellZoneSected(SpellZone.CANCEL) },
                this.canvasSecondary,
                64,
                64,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.ROW_FULL,
                () => { this.onSpellZoneSected(SpellZone.ROW_FULL) },
                this.canvasSecondary,
                128,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.SELF_TARGET,
                () => { this.onSpellZoneSected(SpellZone.SELF_TARGET) },
                this.canvasSecondary,
                128,
                64,
                this.tileSize,
                this.assetManager
            )
        );

        // Spell EFFECT cards
        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.BLAZE,
                () => { this.onSpellEffectSelected(SpellEffect.BLAZE) },
                this.canvasSecondary,
                256,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.FREEZE,
                () => { this.onSpellEffectSelected(SpellEffect.FREEZE) },
                this.canvasSecondary,
                320,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.CANCEL,
                () => { this.onSpellEffectSelected(SpellEffect.CANCEL) },
                this.canvasSecondary,
                320,
                64,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.PHASE,
                () => { this.onSpellEffectSelected(SpellEffect.PHASE) },
                this.canvasSecondary,
                384,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.updateGameSequence(GameSequence.PLAYER_AWAITING_MOVEMENT);
    }

    // -------------------------------------- MAIN LOOP --------------------------------------

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

        contextPrimary.globalAlpha = this.backgroundOpacity;
        contextPrimary.drawImage(this.backgroundImage, 0, 0);
        contextPrimary.globalAlpha = 1.0;

        // Render events
        this.eventList.forEach(evt => {
            evt.render(contextPrimary, 0, 0)
        })

        // Render player
        this.player.render(contextPrimary, this.mazeWindowX, this.mazeWindowY)

        // Render enemies
        this.entitiesEnemy.forEach(monster => {
            monster.render(contextPrimary, this.mazeWindowX, this.mazeWindowY);
        })

        // Render LOS (in debug)
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

        // Spell effect overaly (screen flash)
        if (this.spellEffectOverlay != null) {
            this.spellEffectOverlay.render(contextPrimary);
        }

        // Render the secondary canvas
        this.spellCardComponents.forEach(component => {
            component.render(contextSecondary);
        });

        // Render UI elements
        this.spellCardComponents.forEach(component => {
            component.render(contextSecondary);
        });

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
                                this.updateSequenceOrGameOver(GameSequence.PLAYER_AWAITING_MOVEMENT);
                                this.computeEntityVisibility()
                            }
                        )
                    )
                    break;

                case GameSequence.ENEMY_MOVING:
                    break;

                case GameSequence.GAME_OVER:
                    console.log("GAME OVER YEAH")
                    break;
            }
        }
    }

    setLevel(level) {
        console.log(`level: ${this.levelCurrent}`);
        this.levelCurrent = level;
    }

    concludePlayerTurn() {

        this.entitiesEnemy.forEach(enemy => {
            enemy.onTurnConclusion();
        });

        this.updateSequenceOrGameOver(GameSequence.ENEMY_PLOTTING_MOVEMENT);
    }

    updateSequenceOrGameOver(sequence) {

        if (this.currentGameSequence == GameSequence.GAME_OVER) {
            return;
        }

        let fatalEntity = this.entitiesEnemy.filter(ent => { return ent.room == this.player.room })[0];
        let gameOver = fatalEntity != null;

        if (gameOver == true) {

            // GAME OVER DRIVER
            // Fade out the background and all but the fatal entity and player

            this.entitiesEnemy
                .filter(ent => { return (ent != fatalEntity) })
                .forEach(ent => {
                    ent.imageOpacity = 0.0;
                    ent.overlayImage = null;
                })

            this.eventList
                .forEach(evt => { evt.imageOpacity = 0.0; })

            this.stateDrivers.push(
                new Driver(
                    1000,
                    (pctComplete) => {
                        // onUpdate
                        if (pctComplete <= 1.0) {
                            let opacity = 1 - pctComplete;
                            this.backgroundOpacity = opacity;
                        }
                    },
                    () => {
                        // onComplete 
                    }
                )
            )

            this.selectedSpellZone = null;
            this.selectedSpellEffect = null;
            this.highlightedGridSquares = [];
            this.updateGameSequence(GameSequence.GAME_OVER)

        } else {
            this.updateGameSequence(sequence)
        }
    }

    // -------------------------------------- SCENE STUFF --------------------------------------

    onStart() {
        this.computeMazeWindow();
    }

    onStop() {

    }

    onMouseDown(click) {
        if (this.currentGameSequence == GameSequence.GAME_OVER) {
            this.initialize();
        }
    }

    onMouseDownSecondary(click) {

        if (this.currentGameSequence != GameSequence.PLAYER_AWAITING_MOVEMENT) {
            return;
        }

        let clickTarget = this.spellCardComponents.filter(card => {
            return card.containsPoint(click)
        })[0];

        if (clickTarget != null) {
            clickTarget.onClick();
        }
    }

    onMouseUp(click) {

    }

    onMouseMove(event) {

    }

    onMouseMoveSecondary(event) {

    }

    onKeyPressed(event) {

        var driver = null;


        switch (event.key) {

            case "a":
            case "ArrowLeft":

                if (this.currentGameSequence != GameSequence.PLAYER_AWAITING_MOVEMENT) {
                    return;
                }

                driver = this.createMovementDriverByDirection(this.player, Direction.LEFT, this.movementRateDefaultMillis, () => {
                    this.computeMazeWindow();
                    this.concludePlayerTurn();
                })

                if (driver != null) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.stateDrivers.push(driver);
                }
                break;

            case "d":
            case "ArrowRight":

                if (this.currentGameSequence != GameSequence.PLAYER_AWAITING_MOVEMENT) {
                    return;
                }

                driver = this.createMovementDriverByDirection(this.player, Direction.RIGHT, this.movementRateDefaultMillis, () => {
                    this.computeMazeWindow();
                    this.concludePlayerTurn();
                })

                if (driver != null) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.stateDrivers.push(driver);
                }
                break;

            case "w":
            case "ArrowUp":

                if (this.currentGameSequence != GameSequence.PLAYER_AWAITING_MOVEMENT) {
                    return;
                }

                driver = this.createMovementDriverByDirection(this.player, Direction.UP, this.movementRateDefaultMillis, () => {
                    this.computeMazeWindow();
                    this.concludePlayerTurn();
                })

                if (driver != null) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.stateDrivers.push(driver);
                }
                break;

            case "s":
            case "ArrowDown":

                if (this.currentGameSequence != GameSequence.PLAYER_AWAITING_MOVEMENT) {
                    return;
                }

                driver = this.createMovementDriverByDirection(this.player, Direction.DOWN, this.movementRateDefaultMillis, () => {
                    this.computeMazeWindow();
                    this.concludePlayerTurn();
                })

                if (driver != null) {
                    this.updateGameSequence(GameSequence.PLAYER_MOVING);
                    this.stateDrivers.push(driver);
                }
                break;

            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                this.setLevel(Number.parseInt(event.key));
                this.initialize();
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

    // -------------------------------------- MAGIC STUFF --------------------------------------

    /**
     * Triggered when the user clicks on a SpellZone card to select an area of effect. 
     */
    onSpellZoneSected(spellZone) {

        // TODO: consider limiting spell effects such that they cannot pass through walls...?

        this.highlightedGridSquares = [];

        let rooms = [];
        let room = null;

        if (this.selectedSpellZone == null) {
            this.selectedSpellZone = spellZone;
        } else {
            if (this.selectedSpellZone == spellZone || spellZone == SpellZone.CANCEL) {
                this.selectedSpellZone = null;
            } else {
                this.selectedSpellZone = spellZone;
            }
        }

        switch (this.selectedSpellZone) {

            case SpellZone.CANCEL:
                this.selectedSpellZone = null;
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


            case SpellZone.CROSS_INVERTED:
                rooms.push(this.getRoom(this.player.room.row - 1, this.player.room.col - 1));
                rooms.push(this.getRoom(this.player.room.row - 1, this.player.room.col + 1));
                rooms.push(this.getRoom(this.player.room.row + 1, this.player.room.col - 1));
                rooms.push(this.getRoom(this.player.room.row + 1, this.player.room.col + 1));
                break;

            case SpellZone.SELF_TARGET:
                rooms.push(this.player.room);
                break;

            default:
                break;
        }

        rooms
            .filter(rm => { return rm != null })
            //.filter(rm => { return (rm.row != this.player.room.row) && (rm.col != this.player.room.col) })
            .forEach(highlightedRoom => {
                this.highlightedGridSquares.push(

                    // Add an anonymous object which can be both rendered and
                    // traced back to a specific Room via (row, col)

                    {
                        col: highlightedRoom.col,
                        row: highlightedRoom.row,
                        tileSize: this.tileSize,
                        render: function (context) {
                            context.fillStyle = "#FF0000";
                            context.globalAlpha = 0.5;
                            context.fillRect(
                                this.col * this.tileSize,
                                this.row * this.tileSize,
                                this.tileSize,
                                this.tileSize
                            )
                            context.globalAlpha = 1.0;
                        }

                    }
                )
            });
    }

    onSpellEffectSelected(spellEffect) {

        // TODO: consider enforcing the sequence: ZONE => EFFECT => DURATION/STRENGTH

        if (this.selectedSpellEffect == null && spellEffect != SpellEffect.CANCEL) {
            this.selectedSpellEffect = spellEffect;
        } else {
            // Double-selcting the same effect CLEARS the effect
            if (this.selectedSpellEffect == spellEffect || spellEffect == SpellEffect.CANCEL) {
                this.selectedSpellEffect = null;
            } else {
                this.selectedSpellEffect = spellEffect;
            }
        }

        this.resolveSpellCasting();
    }

    resolveSpellCasting() {

        if (this.selectedSpellZone != null
            && this.selectedSpellEffect != null) {

            if (this.debugMode == true) {
                console.log(`casting: ${this.getSpellEffectName(this.selectedSpellEffect)}`)
            }

            switch (this.selectedSpellEffect) {

                case SpellEffect.FREEZE:

                    // Apply a FREEZE effect (ice cube) to every entity in the selected squares
                    this.highlightedGridSquares.forEach(sq => {
                        let gridSquare = this.getRoom(sq.row, sq.col);
                        if (gridSquare.occupant != null) {
                            gridSquare.occupant.addSpellEffect(SpellEffect.FREEZE, 5);
                        }
                    });

                    // Create a spell effect overlay to flash the screen during this spell effect
                    this.spellEffectOverlay = new SpellEffectOverlay(
                        this.canvasPrimary,
                        "#00a9FF"
                    );

                    // Flash! A spell is cast! 
                    this.stateDrivers.push(
                        new SpellEffectOverlayDriver(
                            this.spellEffectOverlay,
                            500,
                            () => {
                                // onUpdate
                            },
                            () => {
                                // onComplete
                                this.spellEffectOverlay = null;
                                this.updateGameSequence(GameSequence.PLAYER_AWAITING_MOVEMENT);
                            }
                        )
                    )

                    this.updateGameSequence(GameSequence.SPECIAL_EFFECT_ANIMATING);
                    break;

                default:
                    break;
            }

            this.selectedSpellEffect = null;
            this.selectedSpellZone = null;
            this.highlightedGridSquares = [];
        }
    }

    // -------------------------------------- MOVEMENT STUFF --------------------------------------

    computeEnemyMoves() {

        // Ineligible rooms will be those that another monster has set its sights on
        // TODO: ...but make the room that a monster is LEAVING elibible to the next monster
        let ineligibleRooms = new Set();
        let vacatedRooms = new Set();
        let drivers = [];

        this.entitiesEnemy
            .filter(monster => { return !monster.spellEffects.has(SpellEffect.FREEZE) })
            .forEach(monster => {

                switch (monster.behavior) {

                    case MonsterBehavior.CHASE_LINE_OF_SIGHT:

                        /**
                                * CHASE_LINE_OF_SIGHT: 
                                * Monsters should...
                                *      determine whether it can see the player
                                *      seek to occupy the player's space, or occupy nearest space closest to the player
                                *      should NOT occupy the same space as another monster
                                *      should consider not moving if it is the optimal move
                                *      choose randomly between two equivalent potential moves
                                */

                        if (this.calculateLineOfSight(this.player.room, monster.room) == true) {

                            let destination = null;

                            let neighborsRaw = this.getAdjacentRooms(monster.room)
                                .concat(monster.room)
                                .map(room => {
                                    room.distance = Math.abs(this.player.room.row - room.row) + Math.abs(this.player.room.col - room.col);
                                    return room
                                });

                            let neighborsFiltered = neighborsRaw
                                .filter(room => { return room.isOpen == true })
                                .filter(room => {
                                    if (room.occupant != null) {
                                        return (vacatedRooms.has(room) == true) || (room.occupant instanceof PlayerEntity)
                                    } else {
                                        return true
                                    }
                                })
                                .filter(room => { return ineligibleRooms.has(room) == false })

                            let minimalDistance = Math.min(...neighborsFiltered.map(rm => { return rm.distance }));

                            let closest = neighborsFiltered.filter(room => { return room.distance == minimalDistance });
                            destination = closest[Math.floor(Math.random() * closest.length)];

                            if (destination != null) {
                                ineligibleRooms.add(destination);
                                vacatedRooms.add(monster.room);
                                vacatedRooms.delete(destination)
                                let movementDriver = this.moveEntityToRoom(monster, destination, 50, () => { });
                                drivers.push(movementDriver);
                            }
                        }

                        break;

                    case MonsterBehavior.RANDOM:

                        let destination = null;

                        let neighbors = this.getAdjacentRooms(monster.room)
                            .concat(monster.room)
                            .filter(room => { return room.isOpen == true })
                            .filter(room => { return ineligibleRooms.has(room) == false })

                        destination = neighbors[Math.floor(Math.random() * neighbors.length)];

                        if (destination != null) {
                            ineligibleRooms.add(destination);
                            vacatedRooms.add(monster.room);
                            vacatedRooms.delete(destination)
                            let movementDriver = this.moveEntityToRoom(monster, destination, 50, () => { });
                            drivers.push(movementDriver);
                        }
                        break;

                    case MonsterBehavior.FLEE_LINE_OF_SIGHT:

                        if (this.calculateLineOfSight(this.player.room, monster.room) == true) {
                            let neighbors =
                                this.getAdjacentRooms(monster.room)
                                    .filter(room => { return room.isOpen == true })
                                    .filter(room => { return ineligibleRooms.indexOf(room) == -1 });

                            let neighbor = null;

                            if (neighbors.length >= 2) {

                                let neighborsSortedByDistance = neighbors.sort((a, b) => {
                                    let distA = Math.abs(this.player.room.row - a.row) + Math.abs(this.player.room.col - a.col);
                                    let distB = Math.abs(this.player.room.row - b.row) + Math.abs(this.player.room.col - b.col);
                                    if (distA > distB) {
                                        return -1;
                                    } else if (distA < distB) {
                                        return 1;
                                    } else {
                                        return 0;
                                    }
                                });

                                neighbor = neighborsSortedByDistance[0];

                            } else {
                                neighbor = neighbors[0];
                            }

                            ineligibleRooms.push(neighbor);
                            let movementDriver = this.moveEntityToRoom(monster, neighbor, 50, () => { });
                            drivers.push(movementDriver);
                        }
                        break;

                    default:
                        break;
                }


            });

        // Place all monster movements into a single multi-entity driver
        this.stateDrivers.push(
            new MultiEntityMovementDriver(
                drivers,
                () => { },
                () => { }
            )
        );

    }

    createMovementDriverByDirection(entity, direction, rate, onComplete) {

        let destination = this.getAdjacentRoomByDirection(entity.room, direction);

        let icecubePush = null;

        if (entity != null
            && destination != null
            && destination.isOpen == true
        ) {

            let primaryDriver = new EntityMovementDriver(
                entity,
                destination,
                rate,
                () => {
                    // onUpdate
                },
                () => {
                    // onComplete
                    entity.room.setOccupant(null);
                    entity.setRoom(destination);
                    destination.setOccupant(entity);
                    destination.triggerEventIfPresent(entity);
                }
            )

            // SPACIAL CASE: SLIDING ICE CUBES
            // The player can push a frozen enemy out into an adjacent space
            if (entity == this.player && destination.occupant != null && destination.occupant.isFrozen == true) {

                console.log("calculating push...")

                // Find the "end point" of the push
                let endpoint = destination;
                while (endpoint != null && endpoint.isOpen == true) {
                    let candidate = this.getAdjacentRoomByDirection(endpoint, direction)
                    if (candidate != null && candidate.isOpen == true && candidate.occupant == null) {
                        endpoint = candidate;
                    } else {
                        break;
                    }
                }

                let sliderEntity = destination.occupant

                // Compute a constant time for the slide-- 50ms per room
                let distance = Math.abs(destination.row - endpoint.row) + Math.abs(destination.col - endpoint.col);

                icecubePush = new EntityMovementDriver(
                    sliderEntity,
                    endpoint,
                    this.movementRateDefaultMillis * distance,
                    () => {
                        // onUpdate
                    },
                    () => {
                        // onCompleted
                        sliderEntity.setRoom(endpoint);
                        endpoint.setOccupant(sliderEntity);
                    }
                )
            }

            let allDrivers = [primaryDriver, icecubePush].filter(drv => { return drv != null });

            return new MultiEntityMovementDriver(
                allDrivers,
                () => { },
                () => {
                    onComplete();       // Be sure to only call this ONCE, else each sub-driver will call it, too.
                }
            )

        } else {
            return null
        }
    }

    moveEntityToRoom(entity, destination, rate, onComplete) {

        if (entity != null
            && destination != null
            && destination.isOpen == true
        ) {

            return new EntityMovementDriver(
                entity,
                destination,
                rate,
                () => {
                    // onUpdate
                },
                () => {
                    // onComplete
                    entity.room.setOccupant(null);
                    entity.setRoom(destination);
                    destination.setOccupant(entity);
                    destination.triggerEventIfPresent();
                    onComplete();
                }
            )

        } else {
            return null
        }
    }

    // -------------------------------------- LINE OF SIGHT and WINDOWING STUFF --------------------------------------

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

    computeMazeWindow() {
        this.visibleRooms = this.getMazeSubsection(this.mazeWindowY, this.mazeWindowX, this.mazeWindowWidth, this.mazeWindowHeight);
        this.computeEntityVisibility();
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

    // -------------------------------------- MAZE and ROOM STUFF --------------------------------------

    createMaze() {

        let inMaze = [];
        let reachable = [];
        let frontier = [];

        // Define the "start room" and adjacent rooms...
        let startRoom = this.getRandomRoom();
        startRoom.setIsOpen(true)
        inMaze.push(startRoom);
        reachable.push(startRoom);

        let adjacentRooms = this.getAdjacentRooms(startRoom);
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

            if (this.getAdjacentRooms(newRoom).every(function (r) {
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

                this.getAdjacentRooms(newRoom).forEach(function (r) {
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

    printToImage(canvas, image, renderables) {
        console.log("print to image...");
        let context = canvas.getContext("2d");
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        renderables.forEach(renderMe => {
            renderMe.render(context, 0, 0);
        });

        image.src = canvas.toDataURL();
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

    getRoom(row, col) {
        try {
            return this.mazeArray[row][col];
        } catch (e) {
            return null;
        }
    }

    getAdjacentRoomByDirection(room, direction) {
        try {
            return this.mazeArray[room.row + direction.rowOffset][room.col + direction.colOffset];
        } catch (e) {
            return null;
        }
    }

    getAdjacentRooms(room) {
        let adjacentRooms = new Array();
        adjacentRooms.push(this.getAdjacentRoomByDirection(room, Direction.UP));
        adjacentRooms.push(this.getAdjacentRoomByDirection(room, Direction.DOWN));
        adjacentRooms.push(this.getAdjacentRoomByDirection(room, Direction.LEFT));
        adjacentRooms.push(this.getAdjacentRoomByDirection(room, Direction.RIGHT));
        return adjacentRooms.filter(rm => { return rm != null })
    }

    getRandomRoom() {
        var index = Math.floor(Math.random() * 1000 % (this.mazeRows * this.mazeCols));
        return this.allRooms[index]
    }

    // -------------------------------------- UTILITIES and STUFF --------------------------------------

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    distributeAcrossOpenRooms(objects) {

        let availableRooms = this.allRooms.filter(room => {
            return room.isEmpty == true
        });

        this.shuffleArray(availableRooms);

        objects.forEach(object => {

            let room = availableRooms.pop();

            if (object instanceof MazeEvent) {
                room.setEvent(object);
                object.setRoom(room);
            } else if (object instanceof MonsterEntity) {
                room.setOccupant(object);
                object.setRoom(room);
            }
        });
    }

    getSpellEffectName(effect) {
        return Object.keys(SpellEffect).find(k => SpellEffect[k] === effect);
    }
}

// -------------------------------------- CLASSES --------------------------------------

class MazeRoom {

    row = 0;
    col = 0;
    roomSize = 64;

    isOpen = false;         // Whether this room can be occupied

    isOccupied = false;
    occupant = null;

    event = null;

    isEmpty = true;

    constructor(row, col, roomSize, isOpen) {
        this.row = row;
        this.col = col;
        this.roomSize = roomSize;
        this.setIsOpen(isOpen);
        this.computeEmptiness();
    }

    computeEmptiness() {
        this.isEmpty = (this.isOpen == true) && (this.isOccupied == false) && (this.event == null);
        if (this.isOpen == true) {
            this.color = "#606060";
        } else {
            this.color = "#000000";
        }
    }

    setIsOpen(isOpen) {
        this.isOpen = isOpen;
        this.computeEmptiness();

        if (this.isOpen == true) {
            this.color = "#606060";
        } else {
            this.color = "#000000";
        }
    }

    setEvent(event) {
        this.event = event;
        this.computeEmptiness();
    }

    setOccupant(entity) {

        // !!! be sure to call entity.setRoom() BUT NOT FROM HERE (unless you have infinite compute, RAM, and time)

        this.occupant = entity;
        if (this.occupant != null) {
            this.isOccupied = true;
        } else {
            this.isOccupied = false;
        }
        this.computeEmptiness();
    }

    triggerEventIfPresent(entity) {
        if (this.event != null) {
            this.event.triggerEvent(entity);
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
    }

};

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
        // !!! be sure to call room.setOccupant() BUT NOT FROM HERE (unless you have infinite compute, RAM, and time)
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

    addSpellEffect(effect) {

    }

    triggerEvent(entity) {

    }

}

class TreasureCollectableEvent extends MazeEvent {

    image = null;
    imageOpacity = 1.0;

    constructor(onTrigger, assetManager) {
        super(onTrigger);
        this.image = assetManager.getImage(ImageAsset.TRAESURE_CHEST_SMALL);
    }

    triggerEvent(entity) {
        if (this.isActive == true && entity != null && entity instanceof PlayerEntity) {
            this.onTrigger();
            if (this.isOneShot == true) {
                this.isActive = false;
            }
        }
    }

    render(context, mazeWindowX, mazeWindowY) {
        if (this.isActive == true) {
            context.globalAlpha = this.imageOpacity;
            context.drawImage(
                this.image,
                (this.room.col * this.room.roomSize) + (this.room.roomSize - this.image.width) / 2,
                (this.room.row * this.room.roomSize) + (this.room.roomSize - this.image.height) / 2
            )

        }
        context.imageOpacity = 1.0;
    }
}
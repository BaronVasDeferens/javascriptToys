import { AssetManager, ImageAsset, SoundAsset } from "../assets.js";
import { EntityMovementDriver, Driver, MultiEntityMovementDriver, OverlayDriver, EntityImageOpacityUpdateDriver } from "../driver.js";
import { Scene, SceneType } from "./scene.js";
import { Spell, SpellEffect, SpellEffectComponentCard, SpellEffectOverlay, SpellZone, SpellZoneComponentCard } from "../entity/entity_spell.js";
import { MonsterEntity, MonsterMovement, MonsterPinkEye, MonsterWraith, MonsterScorpion, MonsterMammoth, MonsterGhost, MonsterVisibility, MonsterPhysicality, MonsterMummy, MonsterCollectable, MonsterContactEffect } from "../entity/entity_monster.js";
import { PlayerEntity } from "../entity/entity_player.js"
import { SoundPlayer } from "../sound.js";
import { MazeEvent, TreasureCollectableEvent, ChestCollectableEvent, KeyCollectableEvent, PortalStaircaseEvent } from "../event/event.js"

/**
 * DUNGEON of DEBT
 * Version 2
 * 2026 Scott C West
 * 
 * --- IDEAS ---
 * 
 * 
 * BUGS
 *      wraith is always visible during GAME OVER except when he caused it :/
 *      casting certain spells on yourself should be fatal
 * 
 * SHORT TERM
 * 
 * 
 *      O sorcerer! Not for want of arcane power 
 *          hast thou been defeated
 * 
 *      Poor sorcerer! The level failed
 *          and thou must again repeat it
 * 
 *      O sorcerer! What possessed thee to seek 
 *          thy fortune in such a place
 *  * 
 *      O sorcerer! Ruin 

 *          thou hast been consumed by greed 
 *          and the labyrinth consumes the weak 

 * 
 * 
 *      !!! FREEZE is too powerful-- should end turn after 1st use?
 * 
 *      !!! spell effects x monster types
 *              - can UNDEAD be TRANSMUTED?
 *              - can INCORPOREAL be FROZEN?
 * 
 *      !!! give player a randomized set of zones and spells
 *      !!! cook up more spells then give the player a random number of them per "run" (? too rogue-like?)
 *      !!! cook up more spells then let player choose however many
 * 
 *      !!! TRANSMUTATION has a chance of turning the user into a CRAZY MONSTER
                - when a harmless frog, moving plays the player plays a ribbit sound, until the PENULTIMATE MOVE, which indicates that his next will last as a frog!
 *              - every cast lasts a random number of turns???
 * 
 *      !!! when cast upon a chest future vision (divination) reveals its contents
 *      !!! opening a chest presents player with a choice between two or more items
 * 
 *      !!! each spell has a side effect:
 *              - EXCHANGE 
 *                  ends the wizards turn
 *                  monsters move immediately after casting
 *              - INVERT
 *                  destroys treasure
 *                  turns the door invisible
 *                  kills monsters, replacing them with angry ghosts
 *                  kills the wizard when cast on self
 *              - FREEZE
 *                  kills the wizard when cast on self
 *              
 * 
 *      !!! hide some invisible treasure in "closed" rooms!    
 * 
 *      !!! BONUS LEVEL: countdown timer in a maze FULL of gold 
 *      !!! bonus when all treasures collected 
 * 
 *      !!! spell hotkeys (and the spell -> zone -> commit workflow)
 * 
 *      !!! gold counter / debt counter / interest rate -- lean into revenue theme?
 * 
 *      punting frozen enemies should trigger a sound
 *      vary footsteps sounds
 *      vary spell effect sounds
 *      freezing wraith make him visible
 * 
 *      !!! monsters type that is drawn to magic?
 *      
 * 
 * 
 * ---------------------------------- THE CARROT ---------------------------
 * 
 * Collectables
 *      - opening a CHEST allows the player to choose from randomly-selected items:
 *              gold
 *              new spells
 *              new zones
 *              potions (1-time spells)
 *              medicine for their sick child
 * 
 *      - some high value collectables decay over time?
 * 
 * ---------------------------------- MAGIC ----------------------------------
 * 
 * Spell Types
 *      - !!! future vision:
 *              reveals the next move for RANDOMLY moving monsters; monsters who use LoS will NOT
 *      - INVERT: swap walls for rooms and vice versa
 *      - TRANSMUTATION: briefly turn into a creature
 *      - PHASE: 
 *      - EXCHANGE: randomly swap locations of all entities in the zone
 *      - befuddle
 *      - wall of flame (temp block)
 * 
 * Spell Interface
 *      - some spells require row/col selection, but others do not
 *      - future vision could be global
 *      - this means that selecting the spell must come FIRST, then the UI changes to suit
 * 
 * Magic Economy
 *      - small zones (self) cost 1
 *      - medium (plus/inverted) cost 2
 *      - large (whole row/col): cost 3 or possibly
 *      - cost increases by tile???
 *      - discounts or bonuses if all habitable squares in zones are occupied???
 *      - MAKE IT A LITTLE VAGUE: rather than displaying a cut-and-dried meter, show a bottle or something
 *        that fills up a little each time a spell is cast, making the player a little uncertain
 *        whether the next spell will trigger a Peril
 *      - !!! casting the same spell in succession increases the Peril cost
 *      - !!! once Peril has reached a threshold, the MASTER AWAKENS
 *
 * Magic and Collectables
 *      - acquiring books expands spells  
 *      - acquiring wands expands zones
 * 
 * Magic / Entity Interactions
 *      - freeze spell SLAYS certain enemies
 *      - SLAIN MONSTERS RETURN AS GHOSTS who ignore walls and maybe have different behaviors
 *      - monster fragmentation?
 * 
 * Magical Consequences
 *      - Casting too many spells draws the attention of a rival sorcerer (Illusionist)
 *      - Changing too many tiles draws the attention of the minotaur
 *      - Killing too many monsters draws the attention of the druid
 *      - Stealing too much treasure draws the attention of the dragon
 *      - Drinking too many potions draws the attention of the alchemist
 *      
 *      - Illusionist replaces floor tiles with garish "eye fry" versions 
 * 
 * -------------------------------- MONSTERS ------------------------------
 * 
 * Behaviors
 *      - a monster that begins as scattered fragments which seek each other out and, once all are reunited, forms a MAJOR headache.
 * 
 * 
 * ---------------------------------- ENVIRONMENT ----------------------------
 * 
 * Environments
 *      - pits
 *      - traps
 * 
 * ------------------------------------ STORY --------------------------------------
 * 
 *      - wizard's actual mission is to find and shake down monsters that owe HIM money
 * 
 *      - wizard is a pacifist and either physically cannot harm monsters, OR mourns them 
 *        OR slaying costs magic points, gold, whatever economic penalty
 * 
 */

const GameSequence = Object.freeze({
    "INITIALIZING": 0,
    "PLAYER_AWAITING_MOVEMENT": 10,
    "PLAYER_MOVING": 20,
    "SPECIAL_EFFECT_ANIMATING": 21,
    "ENEMY_PLOTTING_MOVEMENT": 30,
    "ENEMY_MOVING": 40,
    "WAIT_FOR_DRIVER": 50,
    "GAME_OVER": 99999
});

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
    eventList = [];                         // TODO: split out portals and collectables

    numEnemyEntities = 9;
    entitiesEnemy = [];

    mazeWindowWidth = 0;                    // Number of maze squares visible on screen at any time
    mazeWindowHeight = 0;
    mazeWindowX = 0;                        // array position/s of maze window
    mazeWindowY = 0;

    player = null;
    levelCurrent = 0;
    levelMax = 9;

    movementRateDefaultMillis = 75;         // time to traverse from one grid section to the next 

    stateDrivers = [];                      // each state driver is processed in the order in which they are received (queue) during the update cycle

    audioContext = new AudioContext();      // AudioContext must be initialized after interactions

    soundPlayer = null;
    coinSounds = [
        SoundAsset.COIN_1,
        SoundAsset.COIN_2,
        SoundAsset.COIN_3
    ];

    spellCardComponents = [];
    selectedSpellZone = null;
    selectedSpellEffect = null;

    highlightedGridSquares = [];
    highlightedGridColor = "#FFFFFF"

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

        this.soundPlayer = new SoundPlayer(this.assetManager, this.audioContext)

        this.selectedSpellEffect = null;
        this.selectedSpellZone = null;

        this.eventList = [];
        this.spellCardComponents = [];
        this.highlightedGridSquares = [];
        this.stateDrivers = [];
        this.lineOfSightLines = [];

        this.entitiesEnemy = [];
        this.allRooms = [];
        this.mazeArray = [];

        this.backgroundOpacity = 1.0;


        // --------- ROOMS and MAZE ---------

        // Create rooms....
        for (let i = 0; i < this.mazeRows; i++) {
            this.mazeArray[i] = new Array(this.mazeCols);
            for (let j = 0; j < this.mazeCols; j++) {
                let room = new MazeRoom(i, j, this.tileSize, false, this.assetManager);
                this.allRooms.push(room);
                this.mazeArray[i][j] = room;
            }
        }

        // Arrange the maze...
        this.createMaze();

        // Remove some tiles...
        let closedRooms = this.allRooms.filter(room => { return room.isOpen == false });
        this.shuffleArray(closedRooms);
        for (let n = 0; n < this.levelCurrent + 3; n++) {
            closedRooms[n].setIsOpen(true);
        }

        // Print the rooms onto a re-usable background image...
        this.printToImage(this.canvasPrimary, this.backgroundImage, this.allRooms);
        let contextPrimary = this.canvasPrimary.getContext('2d');
        contextPrimary.fillStyle = "#00000";
        contextPrimary.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height)

        // -------- ENTITIES ---------

        // PLAYER
        // Find an UNOCCUPIED, NO EVENT square near the TOP LEFT
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

        // TREASURES...
        let treasureTotal = 5;
        for (let n = 0; n < treasureTotal; n++) {

            let coinSound = this.coinSounds[Math.floor(this.coinSounds.length * Math.random())];

            this.eventList.push(
                new TreasureCollectableEvent(
                    () => { this.soundPlayer.playOneShot(coinSound) },
                    this.assetManager
                )
            );
        }

        // PORTALS...
        let exitPortal = new PortalStaircaseEvent(
            () => {
                this.soundPlayer.playOneShot(SoundAsset.DESCEND_STAIRS);
                this.levelCurrent += 1;
                this.fadeOut(() => {
                    this.initialize();
                    this.computeMazeWindow();
                });
            },
            this.assetManager
        );

        this.eventList.push(exitPortal);

        // // KEYS...
        // this.eventList.push(
        //     new KeyCollectableEvent(
        //         () => {
        //             this.soundPlayer.playOneShot(SoundAsset.KEY_ACQUIRED_DOOR_CREAKS);
        //             exitPortal.setIsLocked(false);
        //         },
        //         this.assetManager
        //     )
        // );

        this.distributeAcrossOpenRooms(this.eventList);



        // FLEEING KEY
        let keyMonster = new MonsterCollectable(
            () => {
                this.soundPlayer.playOneShot(SoundAsset.KEY_ACQUIRED_DOOR_CREAKS);
                exitPortal.setIsLocked(false);
                keyMonster.isAlive = false;
            },
            this.tileSize,
            this.assetManager
        )
        this.entitiesEnemy.push(
            keyMonster
        )




        // MONSTERS...
        this.entitiesEnemy.push(new MonsterGhost(this.tileSize, this.assetManager));

        // if (this.levelCurrent - 5 >= 0) {
        this.entitiesEnemy.push(new MonsterMummy(this.tileSize, this.assetManager));
        // this.entitiesEnemy.push(new MonsterMummy(this.tileSize, this.assetManager));
        // }

        // for (let n = 0; n < this.levelCurrent; n++) {
        //     this.entitiesEnemy.push(new MonsterMammoth(this.tileSize, this.assetManager));
        // }

        for (let n = 0; n < this.levelCurrent; n++) {
            this.entitiesEnemy.push(new MonsterPinkEye(this.tileSize, this.assetManager));
        }

        for (let n = 0; n < this.levelCurrent; n++) {
            this.entitiesEnemy.push(new MonsterScorpion(this.tileSize, this.assetManager));
        }



        this.distributeAcrossOpenRooms(this.entitiesEnemy, true);

        // -------- USER INTERFACE ----------

        // EFFECTS: UPPER ROW ---------------------------------------------------------

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CROSS_SMALL,
                () => { this.onSpellZoneSelected(SpellZone.CROSS_SMALL) },
                this.canvasSecondary,
                0,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.ROW_FULL,
                () => { this.onSpellZoneSelected(SpellZone.ROW_FULL) },
                this.canvasSecondary,
                0,
                1,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.SELF_TARGET,
                () => { this.onSpellZoneSelected(SpellZone.SELF_TARGET) },
                this.canvasSecondary,
                0,
                2,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.FREEZE,
                () => { this.onSpellEffectSelected(SpellEffect.FREEZE) },
                this.canvasSecondary,
                0,
                4,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.INVERT,
                () => { this.onSpellEffectSelected(SpellEffect.INVERT) },
                this.canvasSecondary,
                0,
                5,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CROSS_INVERTED,
                () => { this.onSpellZoneSelected(SpellZone.CROSS_INVERTED) },
                this.canvasSecondary,
                1,
                0,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.COLUMN_FULL,
                () => { this.onSpellZoneSelected(SpellZone.COLUMN_FULL) },
                this.canvasSecondary,
                1,
                1,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.TRANSMUTATION,
                () => { this.onSpellEffectSelected(SpellEffect.TRANSMUTATION) },
                this.canvasSecondary,
                1,
                4,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.EXCHANGE,
                () => { this.onSpellEffectSelected(SpellEffect.EXCHANGE) },
                this.canvasSecondary,
                1,
                5,
                this.tileSize,
                this.assetManager
            )
        );

        this.fadeIn(() => {
            this.updateGameSequence(GameSequence.PLAYER_AWAITING_MOVEMENT);
        });

        this.updateMagicInterface();

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

        // Remove any "dead" (permanently neutralized) entities
        this.entitiesEnemy = this.entitiesEnemy.filter(ent => { return ent.isAlive == true });
    }

    render(contextPrimary, contextSecondary) {

        contextPrimary.globalAlpha = 1.0;
        contextPrimary.fillStyle = "#000000";
        contextPrimary.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height);

        contextPrimary.globalAlpha = this.backgroundOpacity;
        contextPrimary.drawImage(this.backgroundImage, 0, 0);

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

        // Render the overlays
        let driverCurrent = this.stateDrivers[0];
        if (driverCurrent instanceof OverlayDriver) {
            driverCurrent.overlay.render(contextPrimary);
        }

        contextSecondary.fillStyle = "#000000";
        contextSecondary.globalAlpha = 1.0;
        contextSecondary.fillRect(0, 0, this.canvasSecondary.width, this.canvasSecondary.height);

        // Render  secondary canvas: UI elements
        this.spellCardComponents.forEach(component => {
            component.render(contextSecondary);
        });

    }

    setLevel(level) {
        console.log(`level: ${this.levelCurrent}`);
        this.levelCurrent = level;
    }

    concludePlayerTurn() {

        // Alert all entities that the current player turn has concluded; spell durations get shorter, etc.
        this.entitiesEnemy.concat(this.player).forEach(ent => {
            ent.onTurnConclusion();
        });

        this.updateMagicInterface();
        this.updateSequenceOrGameOver(GameSequence.ENEMY_PLOTTING_MOVEMENT);
    }

    /*
       TODO ---- REFACTOR UpdateGameSeq() and UpdateGameSeqOrGameOver() to be less...uh, like they are
    */

    updateGameSequence(newSequence) {

        if (this.currentGameSequence != newSequence) {

            this.debug(`changing sequence: ${Object.keys(GameSequence).find(k => GameSequence[k] === newSequence)}`);

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
                    break;
            }
        }

    }

    updateSequenceOrGameOver(sequence) {

        if (this.currentGameSequence == GameSequence.GAME_OVER) {
            return;
        }

        let gameOver = false;

        // Check: did the wizard cast FREEZE or INVERT upon himself? 
        if (this.player.isFrozen == true || this.player.isInverted == true) {
            gameOver = true;
        }

        // Check: does any monster co-occupy the wizard's square?
        let contactEntity = this.entitiesEnemy
            .filter(ent => { return (ent.isTransmuted == false) })
            .filter(ent => { return ent.room == this.player.room })[0];

        if (contactEntity != null && !(this.player.isTransmuted == true)) {

            switch (contactEntity.contactEffect) {

                case MonsterContactEffect.LETHAL:
                    gameOver = true;
                    break;

                case MonsterContactEffect.TRIGGER_EVENT:
                    contactEntity.onContact();
                    break;
            }
        }

        if (gameOver == true) {

            // GAME OVER !!!
            // If the fatal entity was a WRAITH, make him visible
            if (contactEntity instanceof MonsterWraith) {
                contactEntity.setVisibility(true);
            }

            // Clear selection and states
            this.selectedSpellZone = null;
            this.selectedSpellEffect = null;
            this.highlightedGridSquares = [];

            // Use a driver to fade out the background and all but the fatal entity and player
            this.entitiesEnemy
                .filter(ent => { return (ent !== contactEntity) })
                .forEach(ent => {
                    ent.setVisibility(MonsterVisibility.INVISIBLE);
                    ent.overlayImage = null;
                })

            this.eventList
                .forEach(evt => { evt.setAlpha(0.0) })

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

            // Play the "barbeque's over" sound and INITIALIZE when it finishes
            this.soundPlayer.playOneShot(SoundAsset.GAME_OVER, () => {
                this.fadeOut(() => {
                    this.initialize();
                });
            });

            // Lock the controls
            this.updateGameSequence(GameSequence.GAME_OVER);
            this.updateMagicInterface();

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

    // -------------------------------------- PLAYER INPUT --------------------------------------

    onMouseDown(click) {
        if (this.currentGameSequence == GameSequence.GAME_OVER) {
            return;
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

        let hoverTarget = this.spellCardComponents
            .filter(card => { return card.containsPoint(event) })[0];

        if (hoverTarget != null) {
            if (hoverTarget instanceof SpellEffectComponentCard) {
                if (hoverTarget.spellEffect != this.selectedSpellEffect) {
                    this.setHighlightedSquares(hoverTarget.spellEffect, this.selectedSpellZone)
                }
            } else if (hoverTarget instanceof SpellZoneComponentCard) {
                // Don't update the zone on hover if a zone has already been selected
                if (hoverTarget.spellZone != this.selectedSpellZone && this.selectedSpellZone == null) {
                    this.setHighlightedSquares(this.selectedSpellEffect, hoverTarget.spellZone)
                }
            }
        } else {
            if (this.selectedSpellZone == null) {
                this.setHighlightedSquares(this.selectedSpellEffect, null)
            }
        }

    }

    onKeyPressed(event) {

        if (this.currentGameSequence == GameSequence.GAME_OVER) {
            return;
        }

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
                    if (this.player.isTransmuted == true) {
                        this.soundPlayer.playOneShotWithDetuneRange(SoundAsset.FROG_HOP, -200, 200);
                    } else {
                        this.soundPlayer.playOneShot(SoundAsset.WIZARD_WALK);
                    }

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
                    if (this.player.isTransmuted == true) {
                        this.soundPlayer.playOneShotWithDetuneRange(SoundAsset.FROG_HOP, -200, 200);
                    } else {
                        this.soundPlayer.playOneShot(SoundAsset.WIZARD_WALK);
                    }
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
                    if (this.player.isTransmuted == true) {
                        this.soundPlayer.playOneShotWithDetuneRange(SoundAsset.FROG_HOP, -200, 200);
                    } else {
                        this.soundPlayer.playOneShot(SoundAsset.WIZARD_WALK);
                    }
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
                    if (this.player.isTransmuted == true) {
                        this.soundPlayer.playOneShotWithDetuneRange(SoundAsset.FROG_HOP, -200, 200);
                    } else {
                        this.soundPlayer.playOneShot(SoundAsset.WIZARD_WALK);
                    }
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
            case "0":
                this.processSpellHotkey(Number.parseInt(event.key));
                break;

            case "+":
                this.fadeOut(() => {
                    this.levelCurrent += 1;
                    this.initialize();
                    this.computeMazeWindow();
                });

                break;

            case "-":
                this.fadeOut(() => {
                    this.levelCurrent -= 1;
                    this.initialize();
                    this.computeMazeWindow();
                });

                break;

            case 'l':
                // Los sight lines on/off
                this.debugMode = !this.debugMode;
                this.debugShowLineOfSight = !this.debugShowLineOfSight;
                console.log(`debug: ${this.debugMode}`);
                break;

            case 'Escape':
                this.fadeOut(() => {
                    this.initialize();
                    this.computeMazeWindow();
                });

                break;

            default:
                console.log(`unrecognized key: ${event.key}`);
                break;
        }

    }

    // -------------------------------------- MAGIC --------------------------------------

    setHighlightedSquares(spellEffect, spellZone) {

        this.highlightedGridSquares = [];

        if (this.player.isTransmuted == true || this.currentGameSequence == GameSequence.GAME_OVER) {
            return;
        }

        let rooms = [];
        let room = null;

        switch (spellZone) {

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

        // TODO: move this somewhere LESS volatile
        let spellColorMap = new Map();
        spellColorMap.set(SpellEffect.FREEZE, "#00a9FF")
        spellColorMap.set(SpellEffect.INVERT, "#ffffff");
        spellColorMap.set(SpellEffect.TRANSMUTATION, "#00ff0d");
        spellColorMap.set(SpellEffect.EXCHANGE, "#6d0088");

        let color = spellColorMap.get(spellEffect);
        if (color == null) {
            color = "#FF0000";
        }

        rooms
            .filter(rm => { return rm != null })
            .forEach(highlightedRoom => {
                this.highlightedGridSquares.push(

                    // Add an anonymous object which can be both rendered and
                    // traced back to a specific Room via (row, col)

                    {
                        col: highlightedRoom.col,
                        row: highlightedRoom.row,
                        tileSize: this.tileSize,
                        render: function (context) {
                            context.fillStyle = color;
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

        let playThisSound = null;

        if (this.player.isTransmuted == true) {
            playThisSound = SoundAsset.UI_INVALID;
        } else if (this.selectedSpellEffect == null) {
            // No other selection has been made
            this.selectedSpellEffect = spellEffect;

            if (this.selectedSpellZone == null) {
                playThisSound = SoundAsset.UI_SELECTION;
            }

        } else {
            if (this.selectedSpellEffect == spellEffect) {
                // Double-selection of the same effect cancels everything
                this.selectedSpellEffect = null;
                this.highlightedGridSquares = [];
                playThisSound = SoundAsset.UI_CANCEL;
            } else {
                this.selectedSpellEffect = spellEffect;
                playThisSound = SoundAsset.UI_SELECTION;
            }
        }

        if (playThisSound != null) {
            this.soundPlayer.playOneShot(playThisSound);
        }


        this.updateMagicInterface();

        if (this.selectedSpellEffect != null && this.selectedSpellZone != null) {
            this.resolveSpellCasting();
        } else {
            this.setHighlightedSquares(this.selectedSpellEffect, this.selectedSpellZone)
        }
    }

    onSpellZoneSelected(spellZone) {

        let playThisSound = null;

        if (this.player.isTransmuted == true) {
            playThisSound = SoundAsset.UI_INVALID;
        } else if (this.selectedSpellZone == null) {
            // No prior effect was selected -> SELECT
            this.selectedSpellZone = spellZone;
            if (this.selectedSpellEffect == null) {
                playThisSound = SoundAsset.UI_SELECTION;
            }
        } else {
            if (this.selectedSpellZone == spellZone) {
                // Selected the same options -> DESELECT
                this.selectedSpellZone = null;
                playThisSound = SoundAsset.UI_CANCEL;
            } else {
                // user changed their selection -> SELECT
                this.selectedSpellZone = spellZone;
                playThisSound = SoundAsset.UI_SELECTION;
            }
        }

        if (playThisSound != null) {
            this.soundPlayer.playOneShot(playThisSound);
        }

        this.updateMagicInterface();

        if (this.selectedSpellEffect != null && this.selectedSpellZone != null) {
            this.resolveSpellCasting();
        } else {
            this.setHighlightedSquares(this.selectedSpellEffect, this.selectedSpellZone)
        }
    }

    processSpellHotkey(number) {

    }

    updateMagicInterface() {

        let gameOver = this.currentGameSequence == GameSequence.GAME_OVER;

        this.spellCardComponents.forEach(card => {

            if (this.player.isTransmuted == true) {
                card.setIsActive(false);
                card.setIsSelected(false)
            } else if (card instanceof SpellEffectComponentCard) {

                if (gameOver == true) {
                    // Effect cards aren't lit while the wizard is transmuted or defeated...
                    card.setIsActive(false);
                    card.setIsSelected(false);
                } else {

                    // ...otherwise, the effect cards are always lit
                    card.setIsActive(true);
                    card.setIsSelected((card.spellEffect == this.selectedSpellEffect))
                }

            } else if (card instanceof SpellZoneComponentCard) {

                if (gameOver == true) {
                    card.setIsActive(false);
                    card.setIsSelected(false);
                } else {
                    card.setIsActive(true);
                    card.setIsSelected((card.spellZone == this.selectedSpellZone));
                }
            }
        });
    }

    resolveSpellCasting() {

        if (this.selectedSpellZone != null
            && this.selectedSpellEffect != null) {

            this.debug(`casting: ${this.getSpellEffectName(this.selectedSpellEffect)}`)

            let spellEffectOverlay = null;

            switch (this.selectedSpellEffect) {

                case SpellEffect.FREEZE:

                    let wizardFrozen = false;

                    // Apply a FREEZE effect (ice cube) to every entity in the selected squares...
                    this.highlightedGridSquares.forEach(sq => {
                        let gridSquare = this.getRoom(sq.row, sq.col);
                        if (gridSquare.occupant != null) {
                            gridSquare.occupant.addSpellEffect(SpellEffect.FREEZE, 5);

                            if (gridSquare.occupant instanceof PlayerEntity) {
                                //...but if the wizard freezes himself, it's GAME OVER
                                wizardFrozen = true
                            }
                        }
                    });

                    // Create a spell effect overlay to flash the screen during this spell effect
                    spellEffectOverlay = new SpellEffectOverlay(
                        this.canvasPrimary,
                        "#00a9FF"
                    );

                    // Flash! A spell is cast! 
                    this.stateDrivers.push(
                        new OverlayDriver(
                            spellEffectOverlay,
                            1.0,
                            0.0,
                            500,
                            () => {
                                // onUpdate
                            },
                            () => {
                                this.concludePlayerTurn();
                            }
                        )
                    )
                    break;

                case SpellEffect.INVERT:

                    let wizardInverted = false;

                    this.highlightedGridSquares.map(sq => {
                        return this.getRoom(sq.row, sq.col)
                    }).forEach(room => {

                        room.setIsOpen(!room.isOpen);

                        if (room.occupant != null) {

                            // WIZARD DIES IF INVERTED
                            if (room.occupant instanceof PlayerEntity) {
                                wizardInverted = true;
                                room.occupant.addSpellEffect(SpellEffect.INVERT);
                                room.occupant.overlayImage = room.image;
                            }
                        }

                        if (room.event != null) {
                            room.event.applySpellEffect(SpellEffect.INVERT);
                        }
                    });

                    this.printToImage(this.canvasPrimary, this.backgroundImage, this.allRooms);

                    spellEffectOverlay = new SpellEffectOverlay(
                        this.canvasPrimary,
                        "#ffffff"
                    );

                    // Flash! A spell is cast! 
                    this.stateDrivers.push(
                        new OverlayDriver(
                            spellEffectOverlay,
                            1.0,
                            0.0,
                            500,
                            () => {
                                // onUpdate
                            },
                            () => {
                                this.concludePlayerTurn();
                            }
                        )
                    )
                    break;

                case SpellEffect.TRANSMUTATION:

                    // Apply a TRANSMUTATION effect to every entity in the selected squares
                    this.highlightedGridSquares.forEach(sq => {
                        let gridSquare = this.getRoom(sq.row, sq.col);
                        if (gridSquare.occupant != null) {
                            gridSquare.occupant.addSpellEffect(SpellEffect.TRANSMUTATION, 5);
                        }
                    });

                    // Create a spell effect overlay to flash the screen during this spell effect
                    spellEffectOverlay = new SpellEffectOverlay(
                        this.canvasPrimary,
                        "#00ff0d"
                    );

                    // Flash! A spell is cast! 
                    this.stateDrivers.push(
                        new OverlayDriver(
                            spellEffectOverlay,
                            1.0,
                            0.0,
                            500,
                            () => {
                                // onUpdate
                            },
                            () => {
                                this.concludePlayerTurn();
                            }
                        )
                    )
                    break;

                case SpellEffect.EXCHANGE:

                    let affectedRooms = this.highlightedGridSquares
                        .map(room => { return this.getRoom(room.row, room.col) })
                        .filter(room => { return room.isOccupied == true });

                    this.shuffleArray(affectedRooms);
                    affectedRooms = affectedRooms.concat(this.player.room);

                    affectedRooms.forEach((room, index) => {

                        if (affectedRooms[index + 1] != null) {

                            let roomA = this.getRoom(room.row, room.col);
                            let occupantA = roomA.occupant;

                            let roomB = affectedRooms[index + 1];
                            let occupantB = roomB.occupant;

                            this.setRoomResident(roomB, occupantA)
                            this.setRoomResident(roomA, occupantB)
                        }
                    });

                    // CHECK: did the wizard exchange places with an incorporeal entity inside a block?
                    let fatalTeleport = !this.player.room.isOpen;
                    if (fatalTeleport == true) {
                        this.player.addSpellEffect(SpellEffect.INVERT);     // Teleported to a closed room-- same as INVERTED!
                    }

                    spellEffectOverlay = new SpellEffectOverlay(
                        this.canvasPrimary,
                        "#6d0088"
                    )

                    // Flash! A spell is cast! 
                    this.stateDrivers.push(
                        new OverlayDriver(
                            spellEffectOverlay,
                            1.0,
                            0.0,
                            500,
                            () => {
                                // onUpdate
                            },
                            () => {

                                this.concludePlayerTurn();
                            }
                        )
                    )
                    break;

                default:
                    break;
            }

            this.soundPlayer.playOneShot(SoundAsset.WIZARD_CAST_SPELL);
            this.selectedSpellEffect = null;
            this.selectedSpellZone = null;
            this.highlightedGridSquares = [];
        }

        this.updateMagicInterface();
    }

    // -------------------------------------- MOVEMENT --------------------------------------

    computeEnemyMoves() {

        // Ineligible rooms will be those that another monster has set its sights on
        // TODO: ...but make the room that a monster is LEAVING eligible to the next monster
        let ineligibleRooms = new Set();
        let vacatedRooms = new Set();
        let drivers = [];


        this.entitiesEnemy
            .filter(monster => { return !monster.spellEffects.has(SpellEffect.FREEZE) })
            .forEach(monster => {

                let destination = null;

                switch (monster.getMovementBehavior()) {

                    case MonsterMovement.RANDOM:

                        let neighbors = this.getAdjacentRooms(monster.room)
                            .concat(monster.room)
                            .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) })
                            .filter(room => { return ineligibleRooms.has(room) == false })
                            .filter(room => {
                                if (room.occupant != null) {
                                    return (vacatedRooms.has(room) == true) || (room.occupant instanceof PlayerEntity)
                                } else {
                                    return true
                                }
                            });


                        destination = neighbors[Math.floor(Math.random() * neighbors.length)];

                        if (destination != null) {
                            ineligibleRooms.add(destination);
                            vacatedRooms.add(monster.room);
                            vacatedRooms.delete(destination)
                            let movementDriver = this.createEntityMovementDriver(monster, destination, this.movementRateDefaultMillis, () => { });
                            drivers.push(movementDriver);
                        }
                        break;

                    case MonsterMovement.CHASE_LINE_OF_SIGHT:

                        /**
                                * CHASE_LINE_OF_SIGHT: 
                                * Monsters should...
                                *      determine whether it can see the player
                                *      seek to occupy the player's space, or occupy nearest space closest to the player...
                                *      should NOT occupy the same space as another monster
                                *      should consider not moving if it is the optimal move
                                *      choose randomly between two equivalent potential moves
                                */

                        if (this.calculateLineOfSight(this.player.room, monster.room) == true) {

                            // Find all eligible neighbors
                            let eligibleNeighbors = this.getAdjacentRooms(monster.room)
                                .filter(room => { return ineligibleRooms.has(room) == false })
                                .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) }).filter(room => {
                                    if (room.occupant != null) {
                                        return (vacatedRooms.has(room) == true) || (room.occupant instanceof PlayerEntity)
                                    } else {
                                        return true
                                    }
                                });

                            // Sort the neighbors in order of distance to player
                            // NOTE: this algorithm will ALWAYS choose the same move, so moving back and forth
                            // to "juke" the monster will NOT WORK. Muah-ha-ha-ha-haaaa! 
                            destination = eligibleNeighbors.sort((a, b) => {
                                let distA = Math.abs(this.player.room.row - a.row) + Math.abs(this.player.room.col - a.col)
                                let distB = Math.abs(this.player.room.row - b.row) + Math.abs(this.player.room.col - b.col)
                                if (distA < distB) {
                                    return -1
                                } else if (distA > distB) {
                                    return 1
                                } else {
                                    return 0
                                }
                            })[0];

                            if (destination != null) {
                                ineligibleRooms.add(destination);
                                vacatedRooms.add(monster.room);
                                vacatedRooms.delete(destination)
                                let movementDriver = this.createEntityMovementDriver(
                                    monster,
                                    destination,
                                    this.movementRateDefaultMillis,
                                    () => { });
                                drivers.push(movementDriver);
                            }
                        }
                        break;

                    case MonsterMovement.FLEE_LINE_OF_SIGHT:

                        if (this.calculateLineOfSight(this.player.room, monster.room) == true) {

                            // Find all eligible neighbors
                            let eligibleNeighbors = this.getAdjacentRooms(monster.room)
                                .concat(monster.room)
                                .filter(room => { return ineligibleRooms.has(room) == false })
                                .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) })
                                .filter(room => {
                                    if (room.occupant != null) {
                                        return (vacatedRooms.has(room) == true) || (room.occupant instanceof PlayerEntity)
                                    } else {
                                        return true
                                    }
                                });

                            // Sort the neighbors in order of distance to player
                            // NOTE: one consequence of this algorithm is that the monster will ALWAYS choose the same move;
                            // moving back and forth in the hopes that it will make a different move will NOT WOK. Muah-ha-ha-ha-haaaa! 
                            let possibleDestinations = eligibleNeighbors.sort((a, b) => {
                                let distA = Math.abs(this.player.room.row - a.row) + Math.abs(this.player.room.col - a.col)
                                let distB = Math.abs(this.player.room.row - b.row) + Math.abs(this.player.room.col - b.col)
                                if (distA < distB) {
                                    return -1
                                } else if (distA > distB) {
                                    return 1
                                } else {
                                    return 0
                                }
                            });

                            let destination = possibleDestinations[possibleDestinations.length - 1];

                            if (destination != null) {
                                ineligibleRooms.add(destination);
                                vacatedRooms.add(monster.room);
                                vacatedRooms.delete(destination)
                                let movementDriver = this.createEntityMovementDriver(
                                    monster,
                                    destination,
                                    this.movementRateDefaultMillis,
                                    () => { });
                                drivers.push(movementDriver);
                            }
                        }
                        break;

                    case MonsterMovement.CHASE_OMNISCIENT:

                        /**
                         * CHASE OMNISCIENT
                         * This monster will compute the moves that get it closest to the wizard, choosing randomly
                         * if there is a tie.
                         */

                        // Find all eligible neighbors
                        let eligibleNeighbors = this.getAdjacentRooms(monster.room)
                            .concat(monster.room)
                            .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) })
                            .filter(room => { return ineligibleRooms.has(room) == false })
                            .filter(room => {
                                if (room.occupant != null) {
                                    return (vacatedRooms.has(room) == true) || (room.occupant instanceof PlayerEntity)
                                } else {
                                    return true
                                }
                            })
                            .map(room => {
                                return {
                                    room: room,
                                    distance: Math.abs(this.player.room.row - room.row) + Math.abs(this.player.room.col - room.col)
                                }
                            });

                        let minDist = Math.min(...eligibleNeighbors.map(n => { return n.distance }))
                        eligibleNeighbors = eligibleNeighbors.filter(room => { return room.distance == minDist });
                        this.shuffleArray(eligibleNeighbors);
                        if (eligibleNeighbors[0] != null) {
                            destination = eligibleNeighbors[0].room;
                        }

                        if (destination != null) {
                            ineligibleRooms.add(destination);
                            vacatedRooms.add(monster.room);
                            vacatedRooms.delete(destination)
                            let movementDriver = this.createEntityMovementDriver(
                                monster,
                                destination,
                                this.movementRateDefaultMillis,
                                () => { });
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

        let primaryDriver = null;
        let iceCubePush = null;

        if (entity != null && destination != null) {

            if (destination.isOpen == true) {

                // Case 1: destination open, no occupant
                if (destination.isOccupied == false) {
                    primaryDriver = new EntityMovementDriver(
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
                            this.processCollectableEvents(entity, destination);
                        }
                    )
                } else if (destination.occupant.isFrozen == false) {

                    // Case 2: destination open, occupied (player likely dies!)
                    primaryDriver = new EntityMovementDriver(
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
                            this.processCollectableEvents(entity, destination);
                        }
                    )

                } else {

                    // Case 3: destination open, occupant frozen...KICK THE CUBE!
                    // The player can push a frozen enemy out into an adjacent space under the following conditions:
                    //      there must exist a space for the cube to move over to

                    // Is there space immediately adjacent for the cube to move into?
                    let adjacentToCube = this.getAdjacentRoomByDirection(destination, direction);

                    if (adjacentToCube != null
                        && adjacentToCube.isOpen == true
                        && adjacentToCube.isOccupied == false
                    ) {

                        primaryDriver = new EntityMovementDriver(
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
                                this.processCollectableEvents(entity, destination);
                            }
                        )

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

                        iceCubePush = new EntityMovementDriver(
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

                        this.soundPlayer.playOneShot(SoundAsset.ZIP);
                    } else {

                    }
                }

                let allDrivers = [primaryDriver, iceCubePush].filter(drv => { return drv != null });

                if (allDrivers.length == 0) {
                    return null;
                }

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
    }

    createEntityMovementDriver(entity, destination, rate, onComplete) {

        if (entity != null
            && destination != null) {

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
                    this.processCollectableEvents(entity, destination);
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

                // If the monster is a WRAITH, it is only visible on screen when NOT in the wizard's LoS...
                if (monster instanceof MonsterWraith) {
                    let visibility = MonsterVisibility.VISIBLE;
                    if (result.isVisible) {
                        visibility = MonsterVisibility.INVISIBLE
                    }
                    monster.setVisibility(visibility);
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

    setRoomResident(room, entity) {

        if (room == null || entity == null) {
            console.error(`setRoomResident failed: ${room} ${entity}`);
            return;
        }

        entity.setRoom(room);
        room.setOccupant(entity)

    }

    processCollectableEvents(entity, room) {

        if (entity == null || room == null || room.event == null) {
            return
        }

        // Collecting all the loose treasures reveals a CHEST!
        let unclaimedTreasures = this.eventList
            .filter(evt => { return evt instanceof TreasureCollectableEvent })
            .filter(evt => { return evt.isActive == true });

        if (unclaimedTreasures.length > 0) {

            room.triggerEventIfPresent(entity);

            if (unclaimedTreasures.every(evt => { return evt.isActive == false })) {

                // Place a chest in a random square

                this.soundPlayer.playOneShot(SoundAsset.SECRET_REVEALED);
                let chest = new ChestCollectableEvent(
                    () => {
                        // onTreasureCollected
                        console.log(`MEGA CHINGUS`);
                        this.soundPlayer.playOneShot(SoundAsset.BONUS);
                        // TODO: award bonus
                    },
                    this.assetManager
                );
                chest.setAlpha(0.0);

                this.eventList.push(chest);
                this.distributeAcrossOpenRooms([chest]);

                let fadeInDriver = new EntityImageOpacityUpdateDriver(
                    chest,
                    0.0,
                    1.0,
                    1000,
                    () => {
                        // onComplete
                    }
                )
                this.stateDrivers.push(fadeInDriver);

            }
        } else {
            room.triggerEventIfPresent(entity);
        }
    }

    // -------------------------------------- UTILITIES and STUFF --------------------------------------

    fadeIn(onComplete) {

        let spellEffectOverlay = new SpellEffectOverlay(
            this.canvasPrimary,
            "#000000"
        );

        this.stateDrivers.push(
            new OverlayDriver(
                spellEffectOverlay,
                1.0,
                0.0,
                500,
                () => {
                    // onUpdate
                },
                () => {
                    // onComplete
                    onComplete();
                }
            )
        )
    }

    fadeOut(onComplete) {

        let spellEffectOverlay = new SpellEffectOverlay(
            this.canvasPrimary,
            "#000000"
        );

        this.stateDrivers.push(
            new OverlayDriver(
                spellEffectOverlay,
                0.0,
                1.0,
                500,
                () => {
                    // onUpdate
                },
                () => {
                    // onComplete
                    onComplete();
                }
            )
        )
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    distributeAcrossOpenRooms(objects, avoidPlayerLos) {

        let availableRooms = this.allRooms.filter(room => {
            return room.isEmpty == true
        });

        if (avoidPlayerLos == true) {
            availableRooms = availableRooms.filter(room => {
                return this.calculateLineOfSight(room, this.player.room) == false
            })
        }

        this.shuffleArray(availableRooms);

        objects.forEach(object => {

            let room = availableRooms.pop();

            // There may not be enough rooms outside of the player's LoS...
            if (room == null) {
                console.error("Not enough avialable rooms!");
                return
            }

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

    debug(msg) {
        if (this.debugMode == true) {
            console.log(msg);
        }
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

    image = null;

    constructor(row, col, roomSize, isOpen, assetManager) {
        this.row = row;
        this.col = col;
        this.roomSize = roomSize;
        this.assetManager = assetManager;
        this.setIsOpen(isOpen);
        this.computeEmptiness();
    }

    computeEmptiness() {

        let floorTiles = [
            ImageAsset.FLOOR_ZX_18,
            ImageAsset.FLOOR_ZX_19,
            ImageAsset.FLOOR_ZX_20,
            ImageAsset.FLOOR_ZX_21,
            ImageAsset.FLOOR_ZX_22,
            ImageAsset.FLOOR_ZX_23,
            ImageAsset.FLOOR_ZX_24,
            ImageAsset.FLOOR_ZX_25,
            ImageAsset.FLOOR_ZX_26,
            ImageAsset.FLOOR_ZX_27
        ];

        let blockTiles = [
            ImageAsset.BLOCK_ZX_1,
            ImageAsset.BLOCK_ZX_2,
            ImageAsset.BLOCK_ZX_3,
            ImageAsset.BLOCK_ZX_4,
            ImageAsset.BLOCK_ZX_5,
            ImageAsset.BLOCK_ZX_6
        ];

        this.isEmpty = (this.isOpen == true) && (this.isOccupied == false) && (this.event == null);
        if (this.isOpen == true) {
            this.color = "#606060";
            let tile = floorTiles[Math.floor(floorTiles.length * Math.random())];
            this.image = this.assetManager.getImage(tile);
        } else {
            let tile = blockTiles[Math.floor(blockTiles.length * Math.random())];
            this.image = this.assetManager.getImage(tile);
        }
    }

    setIsOpen(isOpen) {
        this.isOpen = isOpen;
        this.computeEmptiness();
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
        if (this.image != null) {
            context.drawImage(
                this.image,
                (this.col * this.roomSize),
                (this.row * this.roomSize))
        } else {
            context.fillStyle = this.color;
            context.fillRect(
                (this.col - mazeWindowX) * this.roomSize,
                (this.row - mazeWindowY) * this.roomSize,
                this.roomSize,
                this.roomSize
            );
        }

    }

};


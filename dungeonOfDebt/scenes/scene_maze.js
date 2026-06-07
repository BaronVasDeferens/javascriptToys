import { AssetManager, SoundAsset } from "../assets.js";
import { EntityMovementDriver, Driver, KeyholeOverlayDriver, MultiEntityMovementDriver, OverlayDriver, EntityImageOpacityUpdateDriver } from "../driver.js";
import { Scene, SceneType } from "./scene.js";
import { KeyholeEffectOverlay, Spell, SpellEffect, SpellEffectComponentCard, SpellEffectOverlay, SpellZone, SpellZoneComponentCard } from "../entity/entity_spell.js";
import { Entity } from "../entity/entity.js";
import { MonsterPinkEye, MonsterShadowMan, MonsterScorpion, MonsterMammoth, MonsterGhost, MonsterMosquitoGiant, MonsterPhysicality, MonsterMummy, MonsterTroll, KeyFleeing, KeyNormal, StatueEntity, MonsterSnail, MonsterEntity, MonsterVengefulSpirit, MonsterGoldFrog } from "../entity/entity_monster.js";
import { EntityType } from "../entity/entity.js";
import { EntityOpacityType } from "../entity/entity.js";
import { EntityContactEffectType } from "../entity/entity.js";
import { EntityMovementType } from "../entity/entity.js";
import { PlayerEntity } from "../entity/entity_player.js"
import { SoundPlayer } from "../sound.js";
import { EventEntity, GoldCoinCollectableEvent, ChestCollectableEvent, PortalStaircaseEvent, SnailTrailEvent } from "../event/event.js"
import { EntityRoomManager, MazeRoom } from "./EntityRoomManager.js";
import { EntityFactory } from "../entity/EntityFactory.js";

/**
 * DUNGEON of DEBT
 * Version 2
 * 2026 Scott C West
 * 
 * --- IDEAS ---
 * 
 * 
 * BUGS
 *      HUGE CHEST / STATUE sometimes stops moving when player pushes on it
 * 
 * SHORT TERM
 * 
 *      COLOR-CODING: MAGIC, and MONSTERS
 *          The colors of the spells, monsters, hazards, and treasures should mean something...maybe?
 *          A relationship between the colors and their effects and behaviors would be pleasing...maybe?
 *          COLLECTABLE ROBES of differing colors empower certain color spells (found in CHESTS)
 *          
 *          Potential effects of different robes:
 *              general, all-around
 *              bigger zones, fewer spells
 *              immune to certain hazards
 *              self-teleport only, huge bonuses to gold
 * 
 *      MAGICAL ALIGNMENT
 *          Dungeons can have a magical alignment which boots the effects of some spells or grant new ones
 *          Aligned dungeons are color-shifted (see method printToImage())
 *      
 *      PUSHING
 *          HUGE key that has to be pushed to the door
 *          HUGE chest that has to be pushed to the open door to be collected
 *      
 *      ENVIRONMENT
 *          IMMUTABLE blocks that will not allow spells to be cast when in an active spell zone
 *          
 * 
 *      MONSTERS
 *          MONSTER that PUSHED THE PLAYER
 *          MONSTER which travels in one direction
 *          MONSTER that EATS GOLD
 *          ENRAGED! MONSTER that after being affected by a spell becomes SEEKING
 *          LOS MONSTERS should CLOSE THEIR EYES when they can't see the player
 * 
 *      HAZARDS
 *          Acid pit that only a frog can cross
 *  
 *      SPELLS and EFFECTS
 *          Self-teleport does nothing-- it SHOULD! Maybe there are a few specially-marked tiles that will always 
 *          be the RANSOM destination of a self-teleport. 
 * 
 *          The KEY does not flee when the wizard is TRANSMUTED
 * 
 *      GAME OVER MESSAGES:
 *          Not for want of arcane power 
 *              hast thou been defeated;
 *          O sorcerer! The level failed
 *              and thou must again repeat it
 *  
 *          O sorcerer! What possessed thee to seek 
 *              thy fortune in such a place?
 *  *   
 *          O sorcerer! Ruin 
 *              thou hast been consumed by greed 
 *              and the labyrinth consumes the weak 

 * 
        LEVELS
            Overworld:
                Dungeon Entrance
                Wizard School
            Dungeon
                Floors 01 - 09: cellars (insects only)
                Floors 10 - 19: crypts (undead and insects)
                Floors 20 - 29: depths (demons and sorcerers)

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

    entityManager = null;
    entityFactory = null;

    mazeWindowWidth = 0;                    // Number of maze squares visible on screen at any time
    mazeWindowHeight = 0;
    mazeWindowX = 0;                        // array position/s of maze window
    mazeWindowY = 0;

    player = null;
    levelCurrent = 1;
    levelMax = 9;

    movementRateDefaultMillis = 75;         // time to traverse from one grid section to the next 

    stateDrivers = [];                      // each state driver is processed in the order in which they are received (queue) during the update cycle

    audioContext = new AudioContext();      // AudioContext must be initialized after interactions

    soundPlayer = null;


    spellCardComponents = [];
    selectedSpellZone = null;

    selectedSpellZones = new Set();

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

        this.soundPlayer = new SoundPlayer(this.assetManager, this.audioContext);
        this.entityManager = new EntityRoomManager(this.tileSize);
        this.entityFactory = new EntityFactory(this.tileSize, this.entityManager, this.assetManager, this.soundPlayer);


        this.initialize();

        this.fadeIn(
            () => {
                this.updateGameSequence(GameSequence.PLAYER_AWAITING_MOVEMENT);
            });
    }

    initialize() {

        this.updateGameSequence(GameSequence.INITIALIZING);

        this.clearBackground();

        this.setLevel(this.levelCurrent);

        this.selectedSpellEffect = null;
        this.selectedSpellZone = null;

        this.entityManager.clear();

        this.eventList = [];
        this.spellCardComponents = [];
        this.highlightedGridSquares = [];
        this.stateDrivers = [];
        this.lineOfSightLines = [];

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

        // Change a number of tiles from closed to open
        let closedRooms = this.allRooms.filter(room => { return room.isOpen == false });
        this.shuffleArray(closedRooms);

        let numRoomsToOpen = 20 - (2 * this.levelCurrent);
        if (numRoomsToOpen < 0) {
            numRoomsToOpen = 0
        }
        for (let n = 0; n < numRoomsToOpen; n++) {
            closedRooms[n].setIsOpen(true);
        }

        this.entityManager.setRooms(this.allRooms);

        // Print the rooms onto a re-usable background image...
        this.printToImage(this.canvasPrimary, this.backgroundImage, this.allRooms);
        let contextPrimary = this.canvasPrimary.getContext('2d');
        contextPrimary.fillStyle = "#00000";
        contextPrimary.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height)

        // --- ENTITIES ---

        // PLAYER...
        // Find an UNOCCUPIED, NO EVENT square near the top...
        let possibleRooms = this.allRooms
            .filter(room => { return room.isOpen == true })

        this.shuffleArray(possibleRooms);
        let playerStartRoom = possibleRooms[0];

        this.player = new PlayerEntity(
            this.tileSize,
            this.assetManager
        );

        this.entityManager.setPlayer(this.player);
        this.entityManager.setEntityRoom(this.player, playerStartRoom);


        let monstersAndEvents = [];

        // --- TREASURES...
        monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.TREASURE_GOLD_COIN, 5));

        // --- MONSTERS...

        switch (this.levelCurrent) {

            case 0:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.STATUE, 3));
                break;

            case 1:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.GOLD_FROG, 3));
                break;

            case 2:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.STATUE, 3));
                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.SNAIL, 5));
                break;

            case 3:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.STATUE, 3));
                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.SCORPION, 3));
                monstersAndEvents.push(this.entityFactory.createEntity(EntityType.TROLL));
                break;

            case 4:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.STATUE, 3));
                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.PINK_EYE, 5));
                break;

            case 5:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.STATUE, 3));
                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.PINK_EYE, 4));
                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.SHADOW_MAN, 1));
                break;

            case 6:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.STATUE, 3));
                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.MOSQUITO_GIANT, 1));
                break;

            case 7:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.STATUE, 3));
                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.MOSQUITO_GIANT, 5));
                break;

            case 8:

                monstersAndEvents.push(...this.entityFactory.createEntities(EntityType.GHOST, 7));
                break;

            default:

                let types = Object.values(EntityType);
                for (let i = 0; i < this.levelCurrent - 2; i++) {
                    let type = types[Math.floor(Math.random() * types.length)];
                    monstersAndEvents.push(this.entityFactory.createEntity(type));
                }
                break;
        }

        // KEYS and PORTALS
        let keyPortal = this.entityFactory.createKeyPortal(this, this.levelCurrent + 1);
        monstersAndEvents.push(keyPortal.key);
        monstersAndEvents.push(keyPortal.portal);

        this.distributeAcrossOpenRooms(monstersAndEvents, true);

        // -------- USER INTERFACE ----------

        this.spellCardComponents.push(
            new SpellZoneComponentCard(
                SpellZone.CROSS_SMALL,
                (card) => {

                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                    } else {
                        card.setIsSelected(!card.isSelected)

                        if (card.isSelected == true) {
                            this.soundPlayer.playOneShot(SoundAsset.UI_SELECTION);
                        } else {
                            this.soundPlayer.playOneShot(SoundAsset.UI_CANCEL);
                        }

                        this.onSpellZoneSelected(SpellZone.CROSS_SMALL);
                    }

                },
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
                (card) => {

                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                    } else {
                        card.setIsSelected(!card.isSelected)

                        if (card.isSelected == true) {
                            this.soundPlayer.playOneShot(SoundAsset.UI_SELECTION);
                        } else {
                            this.soundPlayer.playOneShot(SoundAsset.UI_CANCEL);
                        }

                        this.onSpellZoneSelected(SpellZone.ROW_FULL);
                    }
                },
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
                (card) => {

                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                    } else {
                        card.setIsSelected(!card.isSelected)

                        if (card.isSelected == true) {
                            this.soundPlayer.playOneShot(SoundAsset.UI_SELECTION);
                        } else {
                            this.soundPlayer.playOneShot(SoundAsset.UI_CANCEL);
                        }

                        this.onSpellZoneSelected(SpellZone.SELF_TARGET);
                    }
                },
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
                (card) => {
                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                    } else {
                        this.onSpellEffectSelected(SpellEffect.FREEZE);
                    }
                },
                this.canvasSecondary,
                0,
                4,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.EXCHANGE,
                (card) => {
                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                        return;
                    } else {
                        this.onSpellEffectSelected(SpellEffect.EXCHANGE);
                    }
                },
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
                (card) => {

                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                    } else {
                        card.setIsSelected(!card.isSelected)

                        if (card.isSelected == true) {
                            this.soundPlayer.playOneShot(SoundAsset.UI_SELECTION);
                        } else {
                            this.soundPlayer.playOneShot(SoundAsset.UI_CANCEL);
                        }

                        this.onSpellZoneSelected(SpellZone.CROSS_INVERTED);
                    }
                },
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
                (card) => {

                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                    } else {
                        card.setIsSelected(!card.isSelected)

                        if (card.isSelected == true) {
                            this.soundPlayer.playOneShot(SoundAsset.UI_SELECTION);
                        } else {
                            this.soundPlayer.playOneShot(SoundAsset.UI_CANCEL);
                        }

                        this.onSpellZoneSelected(SpellZone.COLUMN_FULL);
                    }
                },
                this.canvasSecondary,
                1,
                1,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.TRANSMUTE,
                (card) => {
                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                        return;
                    } else {
                        this.onSpellEffectSelected(SpellEffect.TRANSMUTE);
                    }
                },
                this.canvasSecondary,
                1,
                4,
                this.tileSize,
                this.assetManager
            )
        );

        this.spellCardComponents.push(
            new SpellEffectComponentCard(
                SpellEffect.INVERT,
                (card) => {
                    if (card.isActive == false) {
                        this.soundPlayer.playOneShot(SoundAsset.UI_INVALID);
                        return;
                    } else {
                        this.onSpellEffectSelected(SpellEffect.INVERT);
                    }
                },
                this.canvasSecondary,
                1,
                5,
                this.tileSize,
                this.assetManager
            )
        );

        this.updateMagicInterface();
    }

    startLevel() {
        this.keyholeIn(
            this.player.x,
            this.player.y,
            () => {
                this.updateGameSequence(GameSequence.PLAYER_AWAITING_MOVEMENT);
            }
        )
    }

    // -------------------------------------- MAIN LOOP --------------------------------------

    update(delta) {

        let driver = this.stateDrivers[0];
        if (driver != null) {
            if (driver.isFinished == true) {
                this.stateDrivers.shift();
            } else {
                driver.update(delta)
            }
        }
    }

    render(contextPrimary, contextSecondary) {

        contextPrimary.globalAlpha = 1.0;
        contextPrimary.globalAlpha = this.backgroundOpacity;
        contextPrimary.drawImage(this.backgroundImage, 0, 0);

        // Render events

        this.entityManager.getActiveEvents().forEach(event => {
            event.render(contextPrimary, 0, 0)
        })

        this.player.render(contextPrimary, 0, 0)

        // Render entities
        this.entityManager.getActiveMonsters().forEach(entity => {
            entity.render(contextPrimary, this.mazeWindowX, this.mazeWindowY);
        });

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

        this.player.onTurnConclusion(this.entityManager);

        this.entityManager.getActiveMonsters()
            .forEach(ent => {
                ent.onTurnConclusion(this.entityManager);
            });

        this.entityManager.getActiveEvents()
            .forEach(event => {
                event.onTurnConclusion(this.entityManager);
            })

        this.computeHighlightedSquares();       // <-- !! this is done specifically to move any highlighted squares relative to the player       
        this.updateMagicInterface();
        this.updateSequenceOrGameOver(GameSequence.ENEMY_PLOTTING_MOVEMENT);
    }

    processEvents() {

        // Process effects which might affect MONSTERS...
        this.entityManager.getActiveMonsters().forEach(monster => {

            let monsterRoom = this.entityManager.getRoomForEntity(monster);
            let event = this.entityManager.getEventForRoom(monsterRoom);
            if (event != null) {
                if (event.checkForEventTrigger(monster) == true) {
                    event.triggerEventEffect(monster);
                }
            }
        })

        // Process events which might affect the PLAYER...
        let room = this.entityManager.getPlayerRoom();
        let entity = this.entityManager.getEventForRoom(room)
        let event = this.entityManager.getEventForRoom(room);

        if (event != null) {

            let eventTriggered = event.checkForEventTrigger(this.player);
            if (eventTriggered == true) {
                event.triggerEventEffect(this.player);
            }

            // CHECK: was that the last treasure?
            // Collecting all the loose treasures reveals a CHEST!
            let unclaimedTreasures = this.entityManager
                .getAllEvents()
                .filter(event => { return event instanceof GoldCoinCollectableEvent })

            if (eventTriggered == true && event instanceof GoldCoinCollectableEvent
                && unclaimedTreasures.every(event => { return event.isActive == false })
            ) {

                // Place a chest in a random square
                this.soundPlayer.playOneShot(SoundAsset.SECRET_REVEALED);

                let chest = new ChestCollectableEvent(
                    this.tileSize,
                    this.assetManager,
                    (entity, self) => {
                        // onTreasureCollected
                        if (entity instanceof PlayerEntity) {
                            this.soundPlayer.playOneShot(SoundAsset.BONUS);
                        } else {
                            this.soundPlayer.playOneShot(SoundAsset.MONSTER_EATS);
                        }
                        self.isActive = false;
                        // TODO: award bonus
                    }
                );
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
        }
    }

    processMonsters() {

        let room = this.entityManager.getPlayerRoom();
        let entity = this.entityManager.getEntityForRoom(room);

        if (entity == null || room == null) {
            return
        }

        switch (entity.contactEffect) {

            case EntityContactEffectType.LETHAL:
                this.player.isActive = false;
                this.updateGameSequence(GameSequence.GAME_OVER);
                break;

            case EntityContactEffectType.TRIGGER_EVENT:
                entity.onPlayerContact(this.player);
                break;
        }

    }

    updateGameSequence(newSequence) {

        if (this.currentGameSequence != newSequence) {

            this.debug(`changing sequence: ${Object.keys(GameSequence).find(k => GameSequence[k] === newSequence)}`);

            this.currentGameSequence = newSequence;

            switch (newSequence) {

                case GameSequence.INITIALIZING:
                    break;

                case GameSequence.PLAYER_AWAITING_MOVEMENT:
                    this.computeEntityVisibility();
                    break;

                case GameSequence.PLAYER_MOVING:
                    break;

                case GameSequence.ENEMY_PLOTTING_MOVEMENT:
                    this.computeEntityVisibility();
                    this.computeEnemyMoves();
                    this.stateDrivers.push(
                        new Driver(
                            0,
                            () => { },
                            () => {
                                this.updateSequenceOrGameOver(GameSequence.PLAYER_AWAITING_MOVEMENT);
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

        this.processMonsters();
        this.processEvents();

        let gameOver = (sequence == GameSequence.GAME_OVER);

        // Check: did the wizard cast FREEZE or INVERT upon himself? 
        if (this.player.isActive == false
            || this.player.isFrozen == true
            || this.player.isInverted == true) {
            gameOver = true;
        }

        if (gameOver == true) {
            this.gameOver();
        } else {
            this.updateGameSequence(sequence)
        }
    }

    gameOver() {

        this.selectedSpellZone = null;
        this.selectedSpellEffect = null;
        this.highlightedGridSquares = [];

        let playerRoom = this.entityManager.getPlayerRoom();
        let contactEntity = this.entityManager.getEntityForRoom(playerRoom) ? this.entityManager.getEntityForRoom(playerRoom) : this.entityManager.getEventForRoom(playerRoom)

        // Hide all entities but the fatal entity and player
        this.entityManager.getActiveMonsters()
            .concat(this.entityManager.getActiveEvents())
            .forEach(entityOrEvent => {
                entityOrEvent.setOpacity(EntityOpacityType.INVISIBLE);
                entityOrEvent.setAlpha(0.0);
                entityOrEvent.overlayImage = null;
            })


        // If the game ended because of entity contact, show the fatal entity
        if (contactEntity != null) {
            contactEntity.setOpacity(EntityOpacityType.VISIBLE);
            contactEntity.setAlpha(1.0);
        }

        // Use a driver to fade out the background
        this.stateDrivers.push(
            new Driver(
                1000,
                (pctComplete) => {
                    // onUpdated
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

        // Play the "BBQ's over" sound and INITIALIZE when it finishes
        this.soundPlayer.playOneShot(SoundAsset.GAME_OVER, () => {
            this.fadeOut(() => {
                this.initialize();
                this.startLevel();
            });
        });

        // Lock the controls
        this.updateGameSequence(GameSequence.GAME_OVER);
        this.updateMagicInterface();
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
            clickTarget.onComponentClicked(clickTarget);
        }
    }

    onMouseUp(click) {

    }

    onMouseMove(event) {

    }

    onMouseMoveSecondary(event) {

    }

    onKeyPressed(event) {

        // The penalty for failure is control lockout!
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
                this.keyholeOut(
                    this.player.x,
                    this.player.y,
                    () => {
                        this.levelCurrent += 1;
                        this.initialize();
                        this.computeMazeWindow();
                        this.startLevel();
                    });

                break;

            case "-":
                this.keyholeOut(
                    this.player.x,
                    this.player.y,
                    () => {
                        this.levelCurrent -= 1;
                        this.initialize();
                        this.computeMazeWindow();
                        this.startLevel();
                    });

                break;

            case 'l':
                // Los sight lines on/off
                this.debugMode = !this.debugMode;
                this.debugShowLineOfSight = !this.debugShowLineOfSight;
                console.log(`debug: ${this.debugMode}`);
                break;

            case 'Escape':
                this.keyholeOut(
                    this.player.x,
                    this.player.y,
                    () => {
                        this.initialize();
                        this.computeMazeWindow();
                        this.startLevel();
                    });

                break;

            default:
                console.log(`unrecognized key: ${event.key}`);
                break;
        }

    }

    // -------------------------------------- MAGIC --------------------------------------


    processSpellHotkey(number) {

    }

    onSpellZoneSelected(spellZone) {

        // The zone could have been activated or deactivated

        let selectedZoneCard = this.spellCardComponents
            .filter(card => { return card instanceof SpellZoneComponentCard })
            .filter(card => { return card.spellZone == spellZone })[0];

        // Sanity check
        if (selectedZoneCard == null) {
            debugger
        }

        if (selectedZoneCard.isSelected == true) {
            this.selectedSpellZones.add(spellZone);
        } else {
            this.selectedSpellZones.delete(spellZone);
        }

        this.computeHighlightedSquares();
        this.updateMagicInterface();
    }

    onSpellEffectSelected(spellEffect) {
        this.selectedSpellEffect = spellEffect;
        this.resolveSpellCasting();
    }

    updateMagicInterface() {

        let gameOver = this.currentGameSequence == GameSequence.GAME_OVER;
        let isPlayerTransmuted = this.player.isTransmuted;

        let isAtLeastOneZoneSelected = [...this.selectedSpellZones.entries()].length >= 1;

        this.spellCardComponents.forEach(card => {

            if (isPlayerTransmuted == true || gameOver == true) {
                // No cast-y spells when turned into a frog!
                card.setIsActive(false);
                card.setIsSelected(false);
            } else if (card instanceof SpellZoneComponentCard) {
                card.setIsActive(true);
            } else if (card instanceof SpellEffectComponentCard) {
                // At least on Spell Zone must be selected in order to activate the Effects
                if (isAtLeastOneZoneSelected == true) {
                    card.setIsActive(true);
                } else {
                    card.setIsActive(false);
                    card.setIsSelected(false);
                }
            }
        })
    }

    computeHighlightedSquares() {

        this.highlightedGridSquares = [];

        if (this.player.isTransmuted == true || this.currentGameSequence == GameSequence.GAME_OVER) {
            return;
        }

        let rooms = new Set();
        let room = null;
        let playerRoom = this.entityManager.getPlayerRoom();

        let selectedZones = [...this.selectedSpellZones.values()];

        if (selectedZones.length == Object.keys(SpellZone).length) {
            // If all zones are selected, then HIGHLIGHT ALL ROOMS...
            this.allRooms.forEach(room => { rooms.add(room) });
        } else {
            // ...otherwise, highlight only those rooms
            selectedZones.forEach(spellZone => {

                switch (spellZone) {

                    case SpellZone.CANCEL:
                        this.selectedSpellZone = null;
                        break;

                    case SpellZone.COLUMN_FULL:

                        // Rooms ABOVE player
                        room = this.getRoom(playerRoom.row - 1, playerRoom.col);
                        while (room != null) {
                            rooms.add(room)
                            room = this.getRoom(room.row - 1, room.col);
                        }

                        // Rooms BELOW player
                        room = this.getRoom(playerRoom.row + 1, playerRoom.col);
                        while (room != null) {
                            rooms.add(room)
                            room = this.getRoom(room.row + 1, room.col);
                        }
                        break;

                    case SpellZone.ROW_FULL:

                        // Rooms TO RIGHT of player
                        room = this.getRoom(playerRoom.row, playerRoom.col + 1);
                        while (room != null) {
                            rooms.add(room)
                            room = this.getRoom(room.row, room.col + 1);
                        }

                        // Rooms TO LEFT of player
                        room = this.getRoom(playerRoom.row, playerRoom.col - 1);
                        while (room != null) {
                            rooms.add(room)
                            room = this.getRoom(room.row, room.col - 1);
                        }
                        break;

                    case SpellZone.CROSS_SMALL:
                        rooms.add(this.getRoom(playerRoom.row - 1, playerRoom.col));
                        rooms.add(this.getRoom(playerRoom.row + 1, playerRoom.col));
                        rooms.add(this.getRoom(playerRoom.row, playerRoom.col + 1));
                        rooms.add(this.getRoom(playerRoom.row, playerRoom.col - 1));
                        break;

                    case SpellZone.CROSS_INVERTED:
                        rooms.add(this.getRoom(playerRoom.row - 1, playerRoom.col - 1));
                        rooms.add(this.getRoom(playerRoom.row - 1, playerRoom.col + 1));
                        rooms.add(this.getRoom(playerRoom.row + 1, playerRoom.col - 1));
                        rooms.add(this.getRoom(playerRoom.row + 1, playerRoom.col + 1));
                        break;

                    case SpellZone.SELF_TARGET:
                        rooms.add(playerRoom);
                        break;

                    default:
                        break;
                }
            })

        }




        // TODO: move this somewhere LESS volatile
        // let spellColorMap = new Map();
        // spellColorMap.set(SpellEffect.FREEZE, "#00a9FF")
        // spellColorMap.set(SpellEffect.INVERT, "#ffffff");
        // spellColorMap.set(SpellEffect.TRANSMUTE, "#00ff0d");
        // spellColorMap.set(SpellEffect.EXCHANGE, "#6d0088");

        // let color = spellColorMap.get(spellEffect);
        // if (color == null) {
        //     color = "#FF0000";
        // }

        [...rooms.values()]
            .filter(rm => { return rm != null })
            .forEach(highlightedRoom => {

                this.highlightedGridSquares.push(

                    // Add an anonymous object which can be both rendered and
                    // traced back to a specific Room via (row, col)

                    {
                        col: highlightedRoom.col,
                        row: highlightedRoom.row,
                        id: highlightedRoom.id,
                        room: highlightedRoom,
                        tileSize: this.tileSize,
                        render: function (context) {
                            context.fillStyle = "#FF0000";
                            context.globalAlpha = 0.25;
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

    resolveSpellCasting() {

        if ([...this.selectedSpellZones.entries()].length >= 1
            && this.selectedSpellEffect != null) {

            this.debug(`casting: ${this.getSpellEffectName(this.selectedSpellEffect)}`)

            let spellEffectOverlay = null;
            let playerRoom = this.entityManager.getPlayerRoom();

            switch (this.selectedSpellEffect) {

                case SpellEffect.FREEZE:

                    let wizardFrozen = false;

                    // Apply a FREEZE effect (ice cube) to every entity in the selected squares...
                    this.highlightedGridSquares.forEach(highlighted => {
                        let room = highlighted.room;
                        let occupant = this.entityManager.getEntityForRoom(room)
                        if (occupant != null) {
                            occupant.addSpellEffect(SpellEffect.FREEZE, 5);
                        }

                        if (room == playerRoom) {
                            this.player.addSpellEffect(SpellEffect.FREEZE, 5)
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

                    this.highlightedGridSquares.forEach(highlighted => {

                        let room = highlighted.room;
                        room.setIsOpen(!room.isOpen);

                        // WIZARD DIES IF INVERTED
                        if (room == playerRoom) {
                            this.player.addSpellEffect(SpellEffect.INVERT);
                            this.player.overlayImage = room.image;
                        } else {

                            let occupant = this.entityManager.getEntityForRoom(room);
                            // TODO: invert occupant????

                            let event = this.entityManager.getEventForRoom(room);
                            if (event != null) {
                                event.applySpellEffect(SpellEffect.INVERT);
                            }
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

                case SpellEffect.TRANSMUTE:

                    // Apply a TRANSMUTATION effect to every entity in the selected squares
                    this.highlightedGridSquares.forEach(highlightedRoom => {
                        let room = highlightedRoom.room;

                        if (highlightedRoom.room == playerRoom) {
                            this.player.addSpellEffect(SpellEffect.TRANSMUTE, 6);
                        } else {
                            let occupant = this.entityManager.getEntityForRoom(room);
                            if (occupant != null) {
                                occupant.addSpellEffect(SpellEffect.TRANSMUTE, 5);
                            }
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

                    let rooms = this.highlightedGridSquares
                        .map(highlighted => {
                            return highlighted.room
                        }).filter(room => {
                            return (this.entityManager.getEntityForRoom(room) != null) || (room == playerRoom)
                        })

                    let entities = rooms.map(room => {
                        if (room == playerRoom) {
                            return this.player;
                        } else {
                            return this.entityManager.getEntityForRoom(room);
                        }

                    }).filter(entity => {
                        return entity != null
                    });

                    let shuffledEntities = [];
                    entities.forEach(entity => {
                        shuffledEntities.unshift(entity)
                    });

                    for (let index = 0; index < shuffledEntities.length; index++) {
                        let entity = shuffledEntities[index];
                        this.entityManager.setEntityRoom(entity, rooms[index])
                    };

                    // CHECK: did the wizard exchange places with an incorporeal entity inside a block?
                    let fatalTeleport = this.entityManager.getPlayerRoom() == false;
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


            this.spellCardComponents.forEach(card => {
                card.setIsSelected(false);
            });
            this.selectedSpellEffect = null;
            this.selectedSpellZone = null;
            this.selectedSpellZones.clear();
            this.highlightedGridSquares = [];

        }

        this.updateMagicInterface();
    }

    // -------------------------------------- MOVEMENT --------------------------------------

    computeEnemyMoves() {

        // Ineligible rooms will be those that another monster has set its sights on
        // TODO: ...but make the room that a monster is LEAVING eligible to the next monster
        let ineligibleRoomIds = new Set();
        let vacatedRoomIds = new Set();
        let drivers = [];

        let playerRoom = this.entityManager.getPlayerRoom();

        this.entityManager.getActiveMonsters()
            .filter(monster => { return !monster.spellEffects.has(SpellEffect.FREEZE) })
            .forEach(monster => {

                let destination = null;
                let monsterRoom = this.entityManager.getRoomForEntity(monster);

                switch (monster.getMovementBehavior()) {

                    // ---------------------------------- RANDOM ----------------------------------
                    case EntityMovementType.RANDOM:

                        let neighbors = this.getAdjacentRooms(monsterRoom)
                            .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) })
                            .filter(room => { return ineligibleRoomIds.has(room.id) == false })
                            .filter(room => {
                                let occupant = this.entityManager.getEntityForRoom(room);

                                if (occupant != null) {
                                    return (vacatedRoomIds.has(room.id) == true) || (occupant instanceof PlayerEntity)
                                } else {
                                    return true
                                }
                            });


                        destination = neighbors[Math.floor(Math.random() * neighbors.length)];

                        if (destination != null) {

                            monster.onMoveBegin(this.entityManager, this.soundPlayer);

                            ineligibleRoomIds.add(destination.id);
                            vacatedRoomIds.add(monsterRoom.id);
                            vacatedRoomIds.delete(destination.id)
                            let movementDriver = this.createEntityMovementDriver(
                                monster,
                                destination,
                                this.movementRateDefaultMillis,
                                () => {
                                    monster.onMoveComplete(this.entityManager);
                                });
                            drivers.push(movementDriver);
                        }

                        break;

                    // ------------------------------------ ROOK -------------------------------------
                    case EntityMovementType.RANDOM_ROOK:

                        // ASSERTION: this monster is either INCORPOREAL or the ONLY monster in the maze;
                        // monster overlap, blocking, etc. makes this a bit hard without more codified rules

                        let possibleDirections = [
                            Direction.UP,
                            Direction.DOWN,
                            Direction.LEFT,
                            Direction.RIGHT
                        ].map(dir => {
                            return {
                                direction: dir,
                                room: this.getAdjacentRoomByDirection(monsterRoom, dir)
                            }
                        }).filter(obj => { return (obj.room != null) && (obj.room.isOpen == true) })
                            .filter(obj => { return (ineligibleRoomIds.has(obj.room.id) == false) })
                            .filter(candidate => {
                                let blockingEntity = this.entityManager.getEntityForRoom(candidate.room);
                                if (blockingEntity == null || blockingEntity == this.player) {
                                    return true
                                } else {
                                    return false
                                }
                            })

                        this.shuffleArray(possibleDirections);

                        let start = possibleDirections.shift();
                        while (start == null && possibleDirections.length > 0) {
                            start = possibleDirections.shift();
                        }

                        if (start == null) {
                            return
                        }

                        let firstRoom = start.room;
                        let direction = start.direction;
                        let path = [firstRoom];
                        let candidateRoom = this.getAdjacentRoomByDirection(firstRoom, direction);
                        let candidateOccupant = this.entityManager.getEntityForRoom(candidateRoom);

                        while (candidateRoom != null && candidateRoom.isOpen == true) {
                            if (candidateRoom == playerRoom) {
                                // The monster has crossed paths with the player-- stop!
                                path.push(candidateRoom);
                                break;
                            } else if (candidateOccupant != null || ineligibleRoomIds.has(candidateRoom.id)) {
                                break;
                            } else {
                                path.push(candidateRoom);
                                candidateRoom = this.getAdjacentRoomByDirection(candidateRoom, direction);
                                candidateOccupant = this.entityManager.getEntityForRoom(candidateRoom);
                            }
                        }

                        destination = path.pop();

                        if (destination != null && destination.id != monsterRoom.id) {

                            monster.onMoveBegin(this.entityManager, this.soundPlayer);

                            ineligibleRoomIds.add(destination.id);
                            vacatedRoomIds.add(firstRoom.id)
                            vacatedRoomIds.delete(destination.id);

                            let driver = this.createEntityMovementDriver(
                                monster,
                                destination,
                                Math.floor(this.movementRateDefaultMillis * (3 / 4)),
                                () => {
                                    // onComplete
                                    this.entityManager.setEntityRoom(monster, destination);
                                    monster.onMoveComplete(this.entityManager);
                                }
                            )

                            drivers.push(driver);
                        } else {
                            console.log("huh?")
                        }

                        break;

                    // ------------------------------------ CHASE (LINE of SIGHT) -------------------------------------
                    case EntityMovementType.CHASE_LINE_OF_SIGHT:

                        /**
                                * CHASE_LINE_OF_SIGHT: 
                                * Monsters should...
                                *      determine whether it can see the player
                                *      seek to occupy the player's space, or occupy nearest space closest to the player...
                                *      should NOT occupy the same space as another monster
                                *      should consider not moving if it is the optimal move
                                *      choose randomly between two equivalent potential moves
                                */

                        if (monster.isVisibleToPlayer == true) {

                            // Find all eligible neighbors
                            let eligibleNeighbors = this.getAdjacentRooms(monsterRoom)
                                .filter(room => { return ineligibleRoomIds.has(room.id) == false })
                                .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) })
                                .filter(room => {
                                    let roomOccupant = this.entityManager.getEntityForRoom(room);
                                    if (roomOccupant != null) {
                                        return (vacatedRoomIds.has(room.id) == true) || (roomOccupant instanceof PlayerEntity)
                                    } else {
                                        return true
                                    }
                                });

                            // Sort the neighbors in order of distance to player
                            // NOTE: this algorithm will ALWAYS choose the same move, so moving back and forth
                            // to "juke" the monster will NOT WORK. Muah-ha-ha-ha-haaaa! 
                            destination = eligibleNeighbors.sort((a, b) => {
                                let distA = Math.abs(playerRoom.row - a.row) + Math.abs(playerRoom.col - a.col)
                                let distB = Math.abs(playerRoom.row - b.row) + Math.abs(playerRoom.col - b.col)
                                if (distA < distB) {
                                    return -1
                                } else if (distA > distB) {
                                    return 1
                                } else {
                                    return 0
                                }
                            })[0];

                            if (destination != null) {

                                monster.onMoveBegin(this.entityManager, this.soundPlayer);

                                ineligibleRoomIds.add(destination.id);
                                vacatedRoomIds.add(monsterRoom.id);
                                vacatedRoomIds.delete(destination.id)
                                let movementDriver = this.createEntityMovementDriver(
                                    monster,
                                    destination,
                                    this.movementRateDefaultMillis,
                                    () => {
                                        monster.onMoveComplete(this.entityManager);
                                    });
                                drivers.push(movementDriver);
                            }
                        }
                        break;

                    // ------------------------------------ CHASE (OMNISCIENT) -------------------------------------
                    case EntityMovementType.CHASE_OMNISCIENT:

                        /**
                         * CHASE OMNISCIENT
                         * This monster will compute the moves that get it closest to its target, choosing randomly
                         * if there is a tie.
                         */

                        let target = monster.getCurrentSeekTarget(this.entityManager);
                        let targetRoom = null;

                        if (target == null || target == this.player) {
                            target = this.player;
                            targetRoom = playerRoom
                        } else if (target instanceof MonsterEntity) {
                            targetRoom = this.entityManager.getRoomForEntity(target);
                        } else if (target instanceof EventEntity) {
                            targetRoom = this.entityManager.getRoomForEvent(target);
                        }

                        // Find all eligible neighbors
                        let eligibleNeighbors = this.getAdjacentRooms(monsterRoom)
                            .concat(monsterRoom)
                            .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) })
                            .filter(room => { return ineligibleRoomIds.has(room.id) == false })
                            .filter(room => {
                                let occupant = this.entityManager.getEntityForRoom(room);
                                if (occupant != null) {
                                    return (vacatedRoomIds.has(room.id) == true) || (occupant == target)
                                } else {
                                    return true
                                }
                            })
                            .map(room => {
                                return {
                                    room: room,
                                    distance: Math.abs(targetRoom.row - room.row) + Math.abs(targetRoom.col - room.col)
                                }
                            });

                        let minDist = Math.min(...eligibleNeighbors.map(n => { return n.distance }))
                        eligibleNeighbors = eligibleNeighbors.filter(room => { return room.distance == minDist });
                        this.shuffleArray(eligibleNeighbors);
                        if (eligibleNeighbors[0] != null) {
                            destination = eligibleNeighbors[0].room;
                        }

                        if (destination != null) {

                            monster.onMoveBegin(this.entityManager, this.soundPlayer);

                            ineligibleRoomIds.add(destination.id);
                            vacatedRoomIds.add(monsterRoom.id);
                            vacatedRoomIds.delete(destination.id)
                            let movementDriver = this.createEntityMovementDriver(
                                monster,
                                destination,
                                this.movementRateDefaultMillis,
                                () => {
                                    monster.onMoveComplete(this.entityManager);
                                });
                            drivers.push(movementDriver);
                        }
                        break;

                    // ------------------------------------ FLEE (LINE of SIGHT) -------------------------------------
                    case EntityMovementType.FLEE_LINE_OF_SIGHT:

                        if (monster.isVisibleToPlayer == true) {

                            // Find all eligible neighbors
                            let eligibleNeighbors = this.getAdjacentRooms(monsterRoom)
                                .filter(room => { return ineligibleRoomIds.has(room.id) == false })
                                .filter(room => { return (room.isOpen == true || monster.physicality == MonsterPhysicality.INCORPOREAL) })
                                .filter(room => {
                                    let occupant = this.entityManager.getEntityForRoom(room);
                                    if (occupant != null) {
                                        return (vacatedRoomIds.has(room.id) == true) || (occupant instanceof PlayerEntity)
                                    } else {
                                        return true
                                    }
                                });

                            // Sort the neighbors in order of distance to player
                            // NOTE: one consequence of this algorithm is that the monster will ALWAYS choose the same move;
                            // moving back and forth in the hopes that it will make a different move will NOT WOK. Muah-ha-ha-ha-haaaa! 
                            let possibleDestinations = eligibleNeighbors.sort((a, b) => {
                                let distA = Math.abs(playerRoom.row - a.row) + Math.abs(playerRoom.col - a.col)
                                let distB = Math.abs(playerRoom.row - b.row) + Math.abs(playerRoom.col - b.col)
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

                                monster.onMoveBegin(this.entityManager, this.soundPlayer);

                                ineligibleRoomIds.add(destination.id);
                                vacatedRoomIds.add(monsterRoom.id);
                                vacatedRoomIds.delete(destination.id);
                                let movementDriver = this.createEntityMovementDriver(
                                    monster,
                                    destination,
                                    this.movementRateDefaultMillis,
                                    () => {
                                        monster.onMoveComplete(this.entityManager);
                                    });
                                drivers.push(movementDriver);
                            }
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
        let entityRoom = this.entityManager.getRoomForEntity(entity);
        let destination = this.getAdjacentRoomByDirection(entityRoom, direction);


        let primaryDriver = null;
        let iceCubePush = null;
        let pushOnlyMove = null;

        if (entity != null && destination != null) {

            if (destination.isOpen == true) {

                // Case 1: destination open, no occupant
                let destinationOccupant = this.entityManager.getEntityForRoom(destination);

                if (destinationOccupant == null) {
                    primaryDriver = new EntityMovementDriver(
                        entity,
                        destination,
                        rate,
                        () => {
                            // onUpdate
                        },
                        () => {
                            // onComplete
                            this.entityManager.setEntityRoom(entity, destination);
                            //this.processCollectableEvents(entity, destination);
                        }
                    )
                } else if (destinationOccupant.isFrozen == true) {

                    // Case 3: destination open, occupant frozen...KICK THE CUBE!
                    // The player can push a frozen enemy out into an adjacent space under the following conditions:
                    //      there must exist a space for the cube to move over to

                    // Is there space immediately adjacent for the cube to move into?
                    let adjacentToCube = this.getAdjacentRoomByDirection(destination, direction);

                    if (adjacentToCube != null
                        && adjacentToCube.isOpen == true
                        && this.entityManager.getEntityForRoom(adjacentToCube) == null
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
                                this.entityManager.setEntityRoom(entity, destination);
                                //this.processCollectableEvents(entity, destination);
                            }
                        )

                        // Find the "end point" of the push
                        let endpoint = destination;
                        while (endpoint != null && endpoint.isOpen == true) {
                            let candidate = this.getAdjacentRoomByDirection(endpoint, direction)
                            let candidateOccupant = candidate ? this.entityManager.getEntityForRoom(candidate) : null
                            if (candidate != null && candidate.isOpen == true && candidateOccupant == null) {
                                endpoint = candidate;
                            } else {
                                break;
                            }
                        }

                        let sliderEntity = this.entityManager.getEntityForRoom(destination);

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
                                this.entityManager.setEntityRoom(sliderEntity, endpoint);
                            }
                        )

                        this.soundPlayer.playOneShot(SoundAsset.ZIP);
                    }
                } else if (destinationOccupant.movement == EntityMovementType.ONLY_WHEN_PUSHED) {

                    // Case 4: destination is occupied by occupant that moves ONLY_WHEN_PUSHED
                    let neighborToObjectRoom = this.getAdjacentRoomByDirection(destination, direction);
                    if (neighborToObjectRoom == null) {
                        return;
                    }

                    let isNeighborOccupied = (this.entityManager.getEntityForRoom(neighborToObjectRoom) != null);
                    if (neighborToObjectRoom.isOpen && isNeighborOccupied == false) {

                        primaryDriver = new EntityMovementDriver(
                            entity,
                            destination,
                            rate,
                            () => {
                                // onUpdate
                            },
                            () => {
                                // onComplete
                                // entity.room.setOccupant(null);
                                // entity.setRoom(destination);
                                // destination.setOccupant(entity);
                                this.entityManager.setEntityRoom(entity, destination)
                            }
                        )

                        destinationOccupant.onMoveBegin(this.entityManager, this.soundPlayer);

                        pushOnlyMove = new EntityMovementDriver(
                            destinationOccupant,
                            neighborToObjectRoom,
                            rate,
                            () => {
                                // onUpdate
                            },
                            () => {
                                // onComplete
                                this.entityManager.setEntityRoom(destinationOccupant, neighborToObjectRoom);
                                destinationOccupant.onMoveComplete(this.entityManager);
                            }
                        )
                    }

                } else {
                    // Case 2: destination open, but occupied (player likely dies!)
                    primaryDriver = new EntityMovementDriver(
                        entity,
                        destination,
                        rate,
                        () => {
                            // onUpdate
                        },
                        () => {
                            // onComplete
                            // entity.room.setOccupant(null);
                            // entity.setRoom(destination);
                            // destination.setOccupant(entity);
                            this.entityManager.setEntityRoom(entity, destination);
                            //this.processCollectableEvents(entity, destination);
                        }
                    )
                }

                let allDrivers = [primaryDriver, iceCubePush, pushOnlyMove].filter(drv => { return drv != null });

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
                    // entity.room.setOccupant(null);
                    // entity.setRoom(destination);
                    // destination.setOccupant(entity);
                    this.entityManager.setEntityRoom(entity, destination);
                    //this.processCollectableEvents(entity, destination);
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
         * If any such line crosses through a grid square that is block (open == false),
         * then no LOS can be established to that entity/event.
         */

        this.lineOfSightLines = [];
        let playerRoom = this.entityManager.getPlayerRoom();

        let visibilityMap = this.entityManager
            .getActiveMonsters()
            .map(monster => {
                let monsterRoom = this.entityManager.getRoomForEntity(monster);
                let result = {
                    target: monster,
                    monsterId: monster.id,
                    roomId: monsterRoom.id,
                    isVisible: this.calculateLineOfSight(playerRoom, monsterRoom)
                }

                monster.setIsVisibleToPlayer(result.isVisible);

                let playerCenter = playerRoom.getCenter();
                let targetCenter = monsterRoom.getCenter();

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

        //return visibilityMap;
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

    printToImage(canvas, image, objectsToRender) {

        let context = canvas.getContext("2d");
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        objectsToRender.forEach(renderMe => {
            renderMe.render(context, 0, 0);
        });

        let isRedShift = false;
        if (isRedShift) {
            let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            for (let n = 0; n < imageData.data.length; n += 4) {
                imageData.data[n] *= 2;
                imageData.data[n + 1] = 0;
                imageData.data[n + 2] = 0;
                imageData.data[n + 3] = 128;
            }
            context.putImageData(imageData, 0, 0);
        }

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
                (deltaMillis) => {
                    // onUpdate
                },
                () => {
                    // onComplete
                    onComplete();
                }
            )
        )
    }

    keyholeIn(centerX, centerY, onComplete) {

        let spellEffectOverlay = new KeyholeEffectOverlay(
            this.canvasPrimary,
            centerX,
            centerY,
            this.tileSize,
            "#000000"
        );

        this.stateDrivers.push(
            new KeyholeOverlayDriver(
                spellEffectOverlay,
                centerX,
                centerY,
                false,
                750,
                (deltaMillis) => {
                    // onUpdate
                },
                () => {
                    // onComplete
                    onComplete();
                }
            )
        )
    }

    keyholeOut(centerX, centerY, onComplete) {

        let spellEffectOverlay = new KeyholeEffectOverlay(
            this.canvasPrimary,
            centerX,
            centerY,
            this.tileSize,
            "#000000"
        );

        this.stateDrivers.push(
            new KeyholeOverlayDriver(
                spellEffectOverlay,
                centerX,
                centerY,
                true,
                750,
                (deltaMillis) => {
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

        let playerRoom = this.entityManager.getRoomForEntity(this.player);

        let availableRooms = this.allRooms.filter(room => {
            return room.isOpen == true
                && this.entityManager.getEntityForRoom(room) == null
                && this.entityManager.getEventForRoom(room) == null
                && room != playerRoom
        });

        if (avoidPlayerLos == true) {
            availableRooms = availableRooms.filter(room => {
                return this.calculateLineOfSight(room, playerRoom) == false
            })
        }

        this.shuffleArray(availableRooms);

        objects.forEach(object => {

            let room = availableRooms.pop();

            // There may not be enough rooms outside of the player's LoS...
            if (room == null) {
                console.error("Not enough available rooms!");
                return
            }

            if (object instanceof EventEntity) {
                this.entityManager.setEventRoom(object, room);
            } else if (object instanceof MonsterEntity) {
                this.entityManager.setEntityRoom(object, room);
            }
        });
    }

    getSpellEffectName(effect) {
        return Object.keys(SpellEffect).find(k => SpellEffect[k] === effect);
    }

    clearBackground() {
        this.backgroundImage = new Image();
    }

    debug(msg) {
        if (this.debugMode == true) {
            console.log(msg);
        }
    }
}



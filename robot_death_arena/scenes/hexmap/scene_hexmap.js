import { Scene, SceneType } from "../scene.js";
import { PathTracker } from "./pathtracker.js";
import { HexMap } from "./hexmap.js";
import { Hex } from "./hex.js";
import { ImageAsset, SoundAsset } from "../../resources/ResourceManager.js";
import { EntityPositionManager } from "./entitypositionmanager.js";
import { Entity } from "./entity.js";
import { Driver, EntityMotionDriver, EntityMovementMultiDriver } from "../../drivers/drivers.js";

const GameState = Object.freeze({
    IDLE: "IDLE",
    UNIT_SELECT_MOVE: "UNIT_SELECT_MOVE",
    ANIMATING: "ANIMATING"
});

export class HexMapScene extends Scene {

    gameState = GameState.IDLE;

    hexMap = null;
    hexSizeDefault = 42;

    entityPositionMgr = new EntityPositionManager();
    entities = [];

    pathTracker = new PathTracker();

    backgroundImage = null;
    overlayImage = null;

    selectedEntity = null;

    drivers = [];

    isDebug = false;

    constructor(canvasPrimary, canvasSecondary, resourceManager, soundPlayer) {
        super(SceneType.HEX_MAP, canvasPrimary, canvasSecondary, resourceManager, soundPlayer);
    }

    onStart() {
        this.initialize();
    }

    onStop() {

    }

    initialize() {

        this.updateGameState(GameState.IDLE);

        this.drivers = [];

        this.entities = [];

        this.backgroundImage = new Image();
        this.overlayImage = new Image();

        this.hexMap = new HexMap(11, 15, this.hexSizeDefault, this.resourceManager, this.canvasPrimary);
        this.hexMap.setDebug(this.isDebug);
        this.hexMap.initialize();

        this.printBackground();

        this.pathTracker.clear();

        this.entityPositionMgr.clear();
        this.entityPositionMgr.setHexes(this.hexMap.hexes);

        let numEntities = 5;
        let startHexes = this.hexMap.getRandomHexes(numEntities);
        for (let n = 0; n < numEntities; n++) {
            let testEntity = new Entity(ImageAsset.SOLDIER_2, this.resourceManager);
            this.entities.push(testEntity);
            this.entityPositionMgr.addEntity(testEntity);
            this.entityPositionMgr.setEntityHex(testEntity, startHexes.pop());
        }
    }

    updateGameState(newState) {
        if (newState != this.gameState) {
            this.gameState = newState;
            console.log(`${this.gameState}`)
        }
    }

    printBackground() {
        this.hexMap.render(this.canvasPrimary.getContext('2d'), null);
        var updatedSrc = this.canvasPrimary.toDataURL();
        this.backgroundImage.src = updatedSrc;
    }

    modifyHexPath(hex) {

        if (hex == null) {
            console.error(`cannot modify hexPath: hex is NULL!`);
            return;
        }

        let playSound = false;

        if (this.pathTracker.size() == 0) {
            playSound = this.pathTracker.add(hex);
        } else if (this.pathTracker.size() == 1 && !this.pathTracker.has(hex)) {
            playSound = this.pathTracker.add(hex);
        } else {

            let indexOfHex = this.pathTracker.indexOf(hex);

            if (this.pathTracker.has(hex) && this.pathTracker.indexOf(hex) != this.pathTracker.size() - 1) {
                this.pathTracker.deleteHex(this.pathTracker.getAtIndex(indexOfHex + 1));
                playSound = true;
            } else {
                playSound = this.pathTracker.add(hex);
            }
        }

        if (playSound) {
            this.soundPlayer.playOneShot(SoundAsset.CLICK);
        }
    }

    update(delta) {

        let driver = this.drivers[0];
        if (driver != null) {
            if (driver.isFinished == true) {
                this.drivers.shift();
            } else {
                driver.update(delta);
            }
        }
    }

    render(context, contextSecondary) {

        context.fillStyle = "#000000";
        context.globalAlpha = 0.75;
        context.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height);
        context.drawImage(this.backgroundImage, 0, 0);

        context.globalAlpha = 1.0;
        this.entities.forEach(entity => {
            entity.render(context);
        })

        let markerRadius = 10;
        this.pathTracker.pips.forEach(pip => {
            pip.render(context)
        });
    }

    onKeyPressed(event) {

        switch (event.code) {

            case "KeyD":
                this.isDebug = !this.isDebug;
                this.hexMap.setDebug(this.isDebug);
                this.printBackground();
                break;

            case "Escape":
                console.log("Resetting...");
                this.hexMap.hexSize = this.hexSizeDefault;
                this.initialize();
                break;

            default:
                break;
        }

    }

    onMouseDown(event) {

        event.preventDefault();

        if (this.gameState != GameState.IDLE) {
            return
        }

        if (event.button == 0) {

            let hex = this.hexMap.findHexAtClick(event);
            let entity = this.entityPositionMgr.getEntityForHex(hex);
            if (entity != null) {
                this.selectedEntity = entity;
                this.updateGameState(GameState.UNIT_SELECT_MOVE);
                this.modifyHexPath(hex);
            }
        }
    }

    onMouseUp(event) {

        if (this.gameState != GameState.UNIT_SELECT_MOVE) {
            return;
        }

        if (event.button == 0) {

            let destinationHex = this.hexMap.findHexAtClick(event);

            if (this.selectedEntity == null || destinationHex == null) {
                this.pathTracker.clear();
                this.updateGameState(GameState.IDLE);
                return;
            }

            if (this.pathTracker.getPath().length <= 1) {
                this.pathTracker.clear();
                this.updateGameState(GameState.IDLE);
                return;
            }

            let residentEntity = this.entityPositionMgr.getEntityForHex(destinationHex);
            if (residentEntity == null) {

                this.updateGameState(GameState.ANIMATING);

                let entity = this.selectedEntity;
                let path = this.pathTracker.getPath();

                // For each node in the path, create a MotionDriver that moves the entity
                for (let index = 0; index < path.length - 1; index++) {

                    let source = path[index];
                    let destination = path[index + 1];

                    this.drivers.push(

                        new EntityMotionDriver(
                            this.selectedEntity,
                            source,
                            destination,
                            100,
                            () => { },
                            () => {
                                this.entityPositionMgr.setEntityHex(entity, destination);
                            }
                        )
                    )

                }

                // Once the MotionDrivers have completed, update the GameState
                this.drivers.push(
                    new Driver(
                        0,
                        () => { },
                        () => {
                            this.selectedEntity = null;
                            this.updateGameState(GameState.IDLE);
                        }
                    )
                )
            }
        }

        this.pathTracker.clear();
    }

    onMouseMove(event) {

        switch (this.gameState) {

            case GameState.UNIT_SELECT_MOVE:
                this.modifyHexPath(this.hexMap.findHexAtClick(event));
                break;

            default:
                break;
        }

    }

    onMouseWheel(event) {

        // Do nothing for now!

        // if (event.wheelDelta > 0) {
        //     this.hexMap.increaseSize();
        // } else {
        //     this.hexMap.decreaseSize();
        // }

        // this.printBackground();
    }
}
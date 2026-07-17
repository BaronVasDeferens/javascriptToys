import { Scene, SceneType } from "../scene.js";
import { PathTracker } from "./pathtracker.js";
import { HexMap } from "./hexmap.js";
import { Hex } from "./hex.js";

const GameState = Object.freeze({
    IDLE: "IDLE",
    UNIT_SELECT_MOVE: "UNIT_SELECT_MOVE"
});

export class HexMapScene extends Scene {

    gameState = GameState.IDLE;

    hexMap = null;
    hexSizeDefault = 42;
    pathTracker = new PathTracker();

    backgroundImage = null;
    overlayImage = null;

    constructor(canvasPrimary, canvasSecondary, assetManager, soundPlayer) {
        super(SceneType.HEX_MAP, canvasPrimary, canvasSecondary, assetManager, soundPlayer);
    }

    onStart() {
        this.initialize();
    }

    onStop() {

    }

    initialize() {
        this.pathTracker.clear();
        this.backgroundImage = new Image();
        this.overlayImage = new Image();
        this.hexMap = new HexMap(11, 15, this.hexSizeDefault, this.canvasPrimary);
        this.printBackground();
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

        if (this.pathTracker.size() == 0) {
            this.pathTracker.add(hex);
        } else if (this.pathTracker.size() == 1 && !this.pathTracker.has(hex)) {
            this.pathTracker.add(hex);
        } else {

            let indexOfHex = this.pathTracker.indexOf(hex);

            if (this.pathTracker.has(hex) && this.pathTracker.indexOf(hex) != this.pathTracker.size() - 1) {
                this.pathTracker.deleteHex(this.pathTracker.getAtIndex(indexOfHex + 1))
            } else {
                this.pathTracker.add(hex)
            }
        }
    }

    update(delta) {

    }

    render(context, contextSecondary) {
        context.fillStyle = "#000000";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height);
        context.drawImage(this.backgroundImage, 0, 0);

        let markerRadius = 10;
        this.pathTracker.pathSet.forEach(hex => {
            context.fillStyle = "#FF00FF"
            context.beginPath();
            context.arc(
                hex.center.x,
                hex.center.y,
                markerRadius,
                0,
                2 * Math.PI);
            context.fill();
        });
    }

    onKeyPressed(event) {

        switch (event.code) {

            case "KeyD":
                this.hexMap.toggleDebug();
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

        if (event.button == 0) {

            let hex = this.hexMap.findHexAtClick(event);
            if (hex != null) {
                this.updateGameState(GameState.UNIT_SELECT_MOVE);
                this.modifyHexPath(hex);
            }
        }
    }

    onMouseUp(event) {

        if (event.button == 0) {
            let hex = this.hexMap.findHexAtClick(event);
            if (hex != null) {
                // TODO: Trigger movement
            }
        }

        this.updateGameState(GameState.IDLE);
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
}
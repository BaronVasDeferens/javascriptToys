import { Scene, SceneType } from "./scene.js";

export class BlankScene extends Scene {

    constructor(canvasPrimary, canvasSecondary, assetManager, soundPlayer) {
        super(SceneType.NO_SCENE, canvasPrimary, canvasSecondary, assetManager, soundPlayer);
    }

    onStart() {

    }

    onStop() {

    }

    update(delta) {

    }

    render(context) {
        context.fillStyle = "#000000";
        context.globalAlpha = 1.0;
        context.fillRect(0, 0, this.canvasPrimary.width, this.canvasPrimary.height);
    }
}
// Ported from jsGame/scenes/Scene.js

//  ------------------------------------ SCENE TYPES ------------------------------------

export const SceneType = Object.freeze({
    NO_SCENE: "NO_SCENE",
    VECTOR_ULTRA: "VECTOR_ULTRA"
});

//  ------------------------------------ SCENE DEFINITION ------------------------------------


export class Scene {

    backgroundImage = new Image();

    constructor(sceneType, canvasPrimary, canvasSecondary, assetManager, soundPlayer) {
        this.sceneType = sceneType;
        this.canvasPrimary = canvasPrimary;
        this.canvasSecondary = canvasSecondary;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
    }

    initialize() {

    }

    onStart() {

    }

    onStop() {

    }

    onMouseDown(click) {

    }

    onMouseDownSecondary(event) {

    }

    onMouseUp(click) {

    }

    onMouseMove(event) {

    }

    onMouseMoveSecondary(event) {

    }

    onKeyPressed(event) {

    }

    // NOTE: jsGame's own Scene/SceneManager have no keyup hook. vectorUltra needs
    // one (releasing Space must stop the machine gun), so it's added here and
    // wired through SceneManager.onKeyUp() below.
    onKeyUp(event) {

    }

    onVisibilityStateChanged(state) {

    }

    update(delta) {

    }

    render(contextPrimary, contextSecondary) {

    }

}

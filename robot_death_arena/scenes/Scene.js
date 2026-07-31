
//  ------------------------------------ SCENE TYPES ------------------------------------

export const SceneType = Object.freeze({
    NO_SCENE: "NO_SCENE",
    HEX_MAP: "HEX_MAP"
});

//  ------------------------------------ SCENE DEFINITION ------------------------------------


export class Scene {

    sceneType = null;
    canvasPrimary = null;
    canvasSecondary = null;
    resourceManager = null;
    soundPlayer = null;

    backgroundImage = new Image();

    constructor(sceneType, canvasPrimary, canvasSecondary, resourceManager, soundPlayer) {
        this.sceneType = sceneType;
        this.canvasPrimary = canvasPrimary;
        this.canvasSecondary = canvasSecondary;
        this.resourceManager = resourceManager;
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

    onMouseWheel(event) {
        
    }

    onKeyPressed(event) {

    }

    onVisibilityStateChanged(state) {

    }

    update(delta) {

    }

    render(contextPrimary, contextSecondary) {

    }

}





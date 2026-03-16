
//  ------------------------------------ SCENE TYPES ------------------------------------

export const SceneType = Object.freeze({
    NO_SCENE: "NO_SCENE",
    INTRO: "INTRO",
    GRID_DRAGGER: "GRID_DRAGGER",
    SELECT_ZONE: "SELECT_ZONE",
    SELECT_SQUAD: "SELECT_SQUAD",
    FIGHT_BATTLE: "FIGHT_BATTLE",
    AFTER_BATTLE: "AFTER_BATTLE",
    MAZE_SCENE: "MAZE_SCENE"
});

//  ------------------------------------ SCENE DEFINITION ------------------------------------


export class Scene {

    backgroundImage = new Image();

    constructor(sceneType, canvas, assetManager, soundPlayer) {
        this.sceneType = sceneType;
        this.canvas = canvas;
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

    onMouseUp(click) {

    }

    onMouseMove(event) {

    }

    onKeyPressed(event) {

    }

    onVisibilityStateChanged(state) {

    }

    update(delta) {

    }

    render(context) {

    }

}





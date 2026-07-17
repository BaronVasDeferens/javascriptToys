import { FadeTransition } from "../transitions/transition_fade.js";
import { SceneType } from "./scene.js"
import { BlankScene } from "./blank/scene_blank.js";
import { HexMapScene } from "./hexmap/scene_hexmap.js"



export class SceneManager {

    sceneMap = new Map();
    currentSceneType = SceneType.NO_SCENE;

    transitions = [];

    constructor(canvasPrimary, tileSize, assetManager, soundPlayer) {
        this.canvasPrimary = canvasPrimary;
        this.tileSize = tileSize;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
    }

    initialize() {
        // !!! IMPORTANT !!!
        // This method should only be called after the assetManager has been initialized!
        this.sceneMap.set(SceneType.NO_SCENE, new BlankScene(this.canvasPrimary, null, this.assetManager, this.soundPlayer));
        this.sceneMap.set(SceneType.HEX_MAP, new HexMapScene (this.canvasPrimary, null, this.assetManager, this.soundPlayer));
    }

    setCurrentSceneType(newSceneType) {

        if (newSceneType != this.currentSceneType) {

            // Create a transition
            this.transitions.push(
                
                new FadeTransition(
                    this.getCurrentScene(),
                    this.sceneMap.get(newSceneType),
                    this.canvasPrimary,
                    500,
                )

            );

            if (this.getCurrentScene() != null) {
                this.getCurrentScene().onStop();
            }

            this.currentSceneType = newSceneType;

            if (this.getCurrentScene() != null) {
                this.getCurrentScene().onStart();
            }

        }
    }

    getCurrentScene() {
        return this.sceneMap.get(this.currentSceneType);
    }

    onMouseDown(click) {

        if (this.getCurrentScene() == null) {
            return;
        }

        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onMouseDown(click);
    }

    onMouseDownSecondary(event) {
        this.getCurrentScene().onMouseDownSecondary(event);
    }

    onMouseUp(click) {

        if (this.getCurrentScene() == null) {
            return;
        }

        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onMouseUp(click);
    }

    onMouseMove(event) {

        if (this.getCurrentScene() == null) {
            return;
        }


        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onMouseMove(event);
    }

    onMouseMoveSecondary(event) {
        this.getCurrentScene().onMouseMoveSecondary(event);
    }

    onKeyPressed(event) {

        if (this.getCurrentScene() == null) {
            return;
        }

        if (this.transitions.length > 0) {
            return
        }

        switch (event.key) {

            default:
                this.getCurrentScene().onKeyPressed(event);
                break;
        }

    }

    onVisibilityStateChanged(state) {

        if (this.getCurrentScene() == null) {
            return;
        }

        this.getCurrentScene().onVisibilityStateChanged(state);
    }

    update(delta) {

        if (this.getCurrentScene() == null) {
            return;
        }

        this.getCurrentScene().update(delta);

        this.transitions.forEach(transition => {
            transition.update(delta);
        });

        this.transitions = this.transitions.filter(transition => {
            return !(transition.isFinished)
        });
    }

    render(contextPrimary, contextSecondary) {

        if (this.getCurrentScene() == null) {
            return;
        }

        if (this.transitions.length > 0) {
            this.transitions.forEach(transition => {
                transition.render(contextPrimary, contextSecondary);
            });
        } else {
            this.getCurrentScene().render(contextPrimary, contextSecondary);
        }
    }
}
import { BlinkEffectTransition, CheckerboardTransition } from "./transition.js";
import { SceneType,  BlankScene, IntroScene, AnimationTestScene, GridMapScene } from "./scene.js"





export class SceneManager {

    sceneMap = new Map();
    currentSceneType = SceneType.NO_SCENE;

    transitions = [];

    constructor(canvas, tileSize, assetManager, soundPlayer) {
        this.canvas = canvas;
        this.tileSize = tileSize;
        this.assetManager = assetManager;
        this.soundPlayer = soundPlayer;
    }

    initialize() {
        // !!! IMPORTANT !!!
        // This method should only be called after the assetManager has been initialized!
        this.sceneMap.set(SceneType.NO_SCENE, new BlankScene(this.canvas, this.assetManager, this.soundPlayer));
        this.sceneMap.set(SceneType.INTRO, new IntroScene(this.canvas, this.assetManager, this.soundPlayer));
        this.sceneMap.set(SceneType.GRID_TEST, new GridMapScene(this.tileSize, this.canvas, this.assetManager, this.soundPlayer));
    }

    setCurrentSceneType(newSceneType) {

        if (newSceneType != this.currentSceneType) {

            // Create a transition
            this.transitions.push(
                // new BlinkEffectTransition(
                //     this.getCurrentScene(),
                //     this.sceneMap.get(newSceneType),
                //     this.canvas,
                //     "#535353ff",
                //     500
                // )

                new CheckerboardTransition(
                    this.getCurrentScene(),
                    this.sceneMap.get(newSceneType),
                    this.canvas,
                    500,
                    this.tileSize / 16,
                    "#272727ff"
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

    onKeyPressed(event) {

        if (this.getCurrentScene() == null) {
            return;
        }


        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onKeyPressed(event);
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

    render(context) {

        if (this.getCurrentScene() == null) {
            return;
        }

        if (this.transitions.length > 0) {
            this.transitions.forEach(transition => {
                transition.render(context);
            });
        } else {
            this.getCurrentScene().render(context);
        }
    }
}
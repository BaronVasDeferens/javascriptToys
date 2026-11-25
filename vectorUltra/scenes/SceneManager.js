// Ported from jsGame/scenes/SceneManager.js, trimmed to vectorUltra's own scene set.

import { FadeTransition } from "../transitions/transition_fade.js"
import { CheckerboardTransition } from "../transitions/transition_checkerboard.js"
import { SceneType } from "./Scene.js"
import { BlankScene } from "./scene_blank.js";
import { GameCore } from "./vectorUltra/gameCore.js";
import { VectorUltraSceneAttract } from "./vectorUltra/vectorUltra_attract.js"
import { VectorUltraSceneGameplay } from "./vectorUltra/vectorUltra_gameplay.js"



export class SceneManager {

    gameCore = new GameCore();

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
        this.sceneMap.set(SceneType.NO_SCENE, new BlankScene(this.gameCore, this, this.canvasPrimary, null, this.assetManager, this.soundPlayer));
        this.sceneMap.set(SceneType.VECTOR_ULTRA_ATTRACT, new VectorUltraSceneAttract(this.gameCore, this, this.canvasPrimary, null, this.assetManager, this.soundPlayer));
        this.sceneMap.set(SceneType.VECTOR_ULTRA_GAME, new VectorUltraSceneGameplay(this.gameCore, this, this.canvasPrimary, null, this.assetManager, this.soundPlayer));

    }

    setCurrentSceneType(newSceneType) {

        if (newSceneType != this.currentSceneType) {

            // Create a transition
            this.transitions.push(

                // new CheckerboardTransition(
                //     this.getCurrentScene(),
                //     this.sceneMap.get(newSceneType),
                //     this.canvasPrimary,
                //     500,
                //     this.tileSize / 4,
                //     "#FF0000"
                // )

                new FadeTransition(
                    this.getCurrentScene(),
                    this.sceneMap.get(newSceneType),
                    this.canvasPrimary,
                    500,
                    this.tileSize / 4,
                    "#FF0000"
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

        this.getCurrentScene().onKeyPressed(event);
    }

    onKeyUp(event) {

        if (this.getCurrentScene() == null) {
            return;
        }

        if (this.transitions.length > 0) {
            return
        }

        this.getCurrentScene().onKeyUp(event);
    }

    onVisibilityStateChanged(state) {

        if (this.getCurrentScene() == null) {
            return;
        }

        this.getCurrentScene().onVisibilityStateChanged(state);
    }

    pollGamepad() {

        if (this.gameCore.gamePad != null) {
            return;
        }

        let gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i] != null) {
                this.gameCore.setGamePad(gamepads[i]);
                return;
            }
        }

    }

    update(delta) {

        this.pollGamepad();

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

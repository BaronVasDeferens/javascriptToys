import { Transition } from "../transition.js";

/**
 * BLINK EFFECT TRANSITION
 * "Covers" the current scene form top to bottom, then "uncovers"
 * the next scene from bottom to top.
 */
export class BlinkEffectTransition extends Transition {

    constructor(startScene, endScene, canvas, color, durationMillis) {
        super(startScene, endScene, canvas, durationMillis);
        this.color = color;
    }

    update(delta) {

        if (this.isFinished == true) {
            return;
        }

        this.totalRenderTimeMillis += delta;
        this.progress = this.totalRenderTimeMillis / this.durationMillis;

        if (this.progress >= 1.0) {
            this.isFinished = true;
        }
    }

    render(context) {

        if (this.isFinished == true) {
            return
        }

        context.globalAlpha = 1.0;

        if (this.progress <= .50) {
            // "Cover" the current scene...
            context.fillStyle = this.color;
            context.fillRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height * 2 * this.progress);
        } else {
            //...then "uncover" the next scene.
            this.endScene.render(context);
            context.fillStyle = this.color;
            context.fillRect(
                0,
                0,
                this.canvas.width,
                (2 - (this.progress * 2)) * this.canvas.height,
            );
        }


    }

}
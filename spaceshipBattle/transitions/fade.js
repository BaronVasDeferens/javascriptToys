import { Transition } from "../transition.js";

export class FadeTransition extends Transition {

    alpha = 0.00;

    constructor(startScene, endScene, canvas, duration) {
        super(startScene, endScene, canvas, duration)
    }

    update(delta) {

        if (this.isFinished == true) {
            return;
        }

        this.totalRenderTimeMillis += delta;
        this.progress = this.totalRenderTimeMillis / this.durationMillis;

        if (this.progress == Number.POSITIVE_INFINITY) {
            this.progress = 0.01;
        }

        if (this.progress >= 1.0) {
            this.isFinished = true;
        }
    }

    render(context) {

        context.globalAlpha = 1.0;

        if (this.progress < 0.50) {
            this.startScene.render(context);
            this.alpha = 2 * this.progress;
        } else {
            this.endScene.render(context);
            this.alpha = (1 - this.progress) * 2;
        }

        context.globalAlpha = this.alpha;
        context.fillStyle = "#000000"
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.globalAlpha = 1.0;
    }

}
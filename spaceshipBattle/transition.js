export class Transition {

    isFinished = false;
    durationMillis = 0;
    totalRenderTimeMillis = 0;
    progress = 0;

    constructor(startScene, endScene, canvas, durationMillis) {
        this.startScene = startScene;
        this.endScene = endScene;
        this.canvas = canvas;
        this.durationMillis = durationMillis;
    }

    update(delta) {

    }

    render(context) {

    }

}

export class ColorWipeTransition extends Transition {

    constructor(startScene, endScene, canvas, color, durationMillis) {
        super(startScene, endScene, canvas, durationMillis);
        this.color = color;

        console.log(`transition start: ${this.startScene.constructor.name} -> ${this.endScene.constructor.name}`);
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
            // draw the "in" section
            context.fillStyle = this.color;
            context.fillRect(
                0,
                0,
                this.canvas.width * 2 * this.progress,
                this.canvas.height * 2 * this.progress);
        } else {
            //draw the "out" section
            this.endScene.render(context);
            context.fillStyle = this.color;
            context.fillRect(
                0,
                0,
                (2 - (this.progress * 2)) * this.canvas.width,
                (2 - (this.progress * 2)) * this.canvas.height,
            );
        }


    }

}

export class CurtainTransition extends Transition {

    constructor(fromScene, toScene, canvas, durationMillis) {
        super(fromScene, toScene, canvas, durationMillis);
    }

}
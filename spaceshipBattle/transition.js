export class Transition {

    isFinished = false;
    progress = 0;

    constructor(startScene, endScene, canvas, lengthMillis) {
        this.startScene = startScene;
        this.endScene = endScene;
        this.canvas = canvas;
        this.lengthMillis = lengthMillis;
    }

    update(delta) {

    }

    render(context) {

    }

}

export class ColorWipeTransition extends Transition {

    totalRenderTimeMillis = 0;

    constructor(startScene, endScene, canvas, color, lengthMillis) {
        super(startScene, endScene, canvas, lengthMillis);
        this.color = color;
    }

    update(delta) {

        if (this.isFinished) {
            return;
        }

        this.totalRenderTimeMillis += delta;
        this.progress = this.totalRenderTimeMillis / this.lengthMillis;

        if (this.progress >= 1.0) {
            this.isFinished = true;
        }
    }

    render(context) {

        if (this.isFinished) {
            return
        }

        //context.drawImage(this.startImage, 0, 0);
        this.startScene.render(context);
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.canvas.width * this.progress, this.canvas.height * this.progress);
        context.globalAlpha = 1.0;
    }

}
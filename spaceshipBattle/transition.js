export class Transition {

    isFinished = false;
    totalRenderTimeMillis = 0;
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


    constructor(startScene, endScene, canvas, color, lengthMillis) {
        super(startScene, endScene, canvas, lengthMillis);
        this.color = color;
    }

    update(delta) {

        if (this.isFinished == true) {
            // console.log("Color wipe FINISHED");
            return;
        }

        // console.log(`Color wipe UPDATE: ${this.progress}`);

        this.totalRenderTimeMillis += delta;
        this.progress = this.totalRenderTimeMillis / this.lengthMillis;

        if (this.progress >= 1.0) {
            this.isFinished = true;
        }
    }

    render(context) {

        if (this.isFinished == true) {
            return
        }

        //context.drawImage(this.startImage, 0, 0);
        this.startScene.render(context);
        context.globalAlpha = 1.0;
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.canvas.width * this.progress, this.canvas.height * this.progress);
    }

}

export class CurtainTransition extends Transition {

    constructor(fromScene, toScene, canvas, duration) {
        super(fromScene, toScene, canvas, duration);
    }

}
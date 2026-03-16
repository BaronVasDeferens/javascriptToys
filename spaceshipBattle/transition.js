export class Transition {

    isFinished = false;
    durationMillis = 0;
    totalRenderTimeMillis = 0;
    progress = 0;                       // 0.00 to 0.999

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



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


/**
 * CHECKERBOARD TRANSITION
 * Draws a grid over the display area, fills in the cells until all are filled,
 * then removes the cells, revelaing the new scene beneath.
 */
export class CheckerboardTransition extends Transition {

    gridSectionsStart = [];
    gridSectionsEnd = [];
    totalGrids = 0;

    constructor(startScene, endScene, canvas, durationMillis, tileSize, color) {

        super(startScene, endScene, canvas, durationMillis);
        this.tileSize = tileSize;
        this.color = color;

        for (let i = 0; i < Math.floor(this.canvas.height / tileSize); i++) {
            for (let j = 0; j < Math.floor(this.canvas.width / tileSize); j++) {
                this.gridSectionsEnd.push(
                    {
                        x: i,
                        y: j
                    }
                )
            }
        }

        this.shuffleArray(this.gridSectionsEnd);
        this.totalGrids = this.gridSectionsEnd.length;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
        } else {
            if (this.progress <= 0.50) {
                while ((this.gridSectionsStart.length / this.totalGrids) < (this.progress * 2)) {
                    this.gridSectionsStart.push(
                        this.gridSectionsEnd.pop()
                    )
                }
            } else {
                while ((this.gridSectionsEnd.length / this.totalGrids) < ((this.progress - 0.5) * 2)) {
                    this.gridSectionsEnd.push(
                        this.gridSectionsStart.pop()
                    )
                }
            }
        }
    }

    render(context) {

        if (this.progress >= 0.50) {
            this.endScene.render(context);
        }

        context.fillStyle = this.color;
        this.gridSectionsStart.forEach(square => {
            context.fillRect(square.x * this.tileSize, square.y * this.tileSize, this.tileSize, this.tileSize);
        });
    }

}

export class Entity {

    x = 0;
    y = 0;

    tileSize = 64;
    image = null;

    isAlive = true;

    constructor(x, y, tileSize, image) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.image = image;
    }


    setAlpha(alpha) {
        this.alpha = alpha;
    }

    update(delta) {

    }

    render(context) {
        context.globalAlpha = this.alpha;
        context.drawImage(this.image, this.x, this.y);
        context.globalAlpha = 1.0;
    }
}

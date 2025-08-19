
export const GameState = Object.freeze({
    IDLE: "IDLE",
    SELECTED_PLAYER_ENTITY: "SELECTED_PLAYER_ENTITY",
});

/**
 * A simple colored square
 */
export class EnititySimple {

    // x and y coords describe the top-left corner of the image
    x = 0;
    y = 0;
    imageSize = 50;
    color = "#000000";

    constructor(x, y, imageSize, color) {

        if (x != null) {
            this.x = x;
        }

        if (y != null) {
            this.y = y;
        }

        if (imageSize != null) {
            this.imageSize = imageSize;
        }

        if (color != null) {
            this.color = color;
        }
    }

    render(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.imageSize, this.imageSize);
    }

    containsClick(click) {
        return (click.offsetX >= this.x && click.offsetX <= this.x + this.imageSize) && (click.offsetY >= this.y && click.offsetY <= this.y + this.imageSize);
    }

}
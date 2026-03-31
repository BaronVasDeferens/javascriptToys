import { Entity } from "./entity.js";

export class DraggableEntity extends Entity {

    screenX = 0;            // absolute positions on the screen
    screenY = 0;            // absolute positions on the screen

    image = null;
    alpha = 1.0;

    deltaX = 0;             // pixels per second
    deltaY = 0;             // pixels per second

    isOffScreen = false;
    isAlive = true;

    constructor(x, y, image) {
        this.screenX = x;
        this.y = y;
        this.image = image;
        this.imageHeight = image.height;
        this.imageWidth = image.width;
    }

    wasClicked(click) {
        let x = click.offsetX;
        let y = click.offsetY;

        if (x > this.screenX && x < this.screenX + this.image.width) {
            if (y > this.screenY && y < this.screenY + this.image.height) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    setSpeedDelta(dX, dY) {
        this.deltaX = dX;
        this.deltaY = dY;
    }

    isCollideWithEntity(otherEntity) {
        return (otherEntity.x + otherEntity.imageWidth >= this.screenX)
            && (otherEntity.x <= this.screenX + this.imageWidth)
            && (otherEntity.y + otherEntity.imageHeight >= this.screenY)
            && (otherEntity.y <= this.screenY + this.imageHeight)
    }

    getCenteredCoordsOnMouse(event) {
        return {
            x: event.offsetX - (this.image.width / 2),
            y: event.offsetY - (this.image.height / 2)
        }
    }

    update(delta) {
        this.screenX += (delta / 1000) * this.deltaX;
        this.screenY += (delta / 1000) * this.deltaY;
    }

    render(context) {
        context.globalAlpha = this.alpha;
        context.drawImage(this.image, this.screenX, this.screenY);
        context.globalAlpha = 1.0;
    }
}
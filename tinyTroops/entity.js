class Entity {

    // randomRange(min, max) {
    //     return Math.floor(Math.random() * max) + min;
    // }
}


export class Dot extends Entity {

    centerX = 0;
    centerY = 0;
    size = 50;
    color = "#FF0000";

    lineWidth = 10;

    constructor(x,y,size, color) {
        super();
        this.centerX = x;
        this.centerY = y;
        this.size = size;
        this.color = color;
    }

    render(context) {

        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.beginPath();

        context.ellipse(this.centerX, this.centerY, this.size, this.size, 2 * Math.PI, 2 * Math.PI, false);
        // context.moveTo(this.x, this.y);
        // context.lineTo(
        //     this.x + Math.cos((this.orientation - 90) * Math.PI / 180) * lineLength,
        //     this.y + Math.sin((this.orientation - 90) * Math.PI / 180) * lineLength);
        context.stroke();

    }
}

export class Line extends Entity {

    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
    color = "#FF0000"
    lineWidth = 1;

    constructor(x1, y1, x2, y2, lineWidth, color) {
        super();
        this.startX = x1;
        this.startY = y1;
        this.endX =x2;
        this.endY =y2;
        this.color = color;
        this.lineWidth = lineWidth;
    }

    render(context) {
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;

        context.save();
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.stroke();
        context.restore();
    }


}


export class Soldier extends Entity {

    x = 0;
    y = 0;
    image = new Image();

    constructor(x,y) {
        super();
        this.x = x;
        this.y = y;
        this.image.src = "resources/guy_1.png";
    }

    /**
     * Returns the coordinates of this entity if the click was within this image's bounds;
     * 
     * @param {*} event 
     */
    isClicked(event) {

        if (event.x >= this.x - (this.image.width / 2) && event.x <= this.x + (this.image.width / 2) ) {
            if (event.y >= this.y - (this.image.height / 2) && event.y <= this.y + ( this.image.height /2)) {
                return { x: this.x, y: this.y };
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    getCenteredCoords() {
        return {
            x: this.x, // + (this.image.width / 2),
            y: this.y // + (this.image.height / 2)
        }
    }

    updatePositionByDelta(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    // Draws CENTERED on x,y
    render(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, -(this.image.width / 2), - (this.image.height / 2));
        context.restore();
    }

}
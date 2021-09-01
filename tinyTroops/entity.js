class Entity {

    id = "";
    x = 0;
    y = 0;

    alive = true;
    gridSquare = null;

    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    setGridSquare(gridSquare) {
        if (this.gridSquare != null) {
            this.gridSquare.isOccupied = false;
        }

        this.gridSquare = gridSquare;
        this.gridSquare.isOccupied = true;
    }

}

export class GridSquare {

    x = 0;
    y = 0;
    size = 50;
    color = "#a8a8a8";

    isOccupied = false;
    isObstructed = false;

    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        if (color != undefined) {
            this.color = color;
        }
    }

    setColor(color) {
        this.color = color;
    }

    containsPoint(x, y) {
        if (x > this.x && x < this.x + this.size) {
            if (y > this.y && y < this.y + this.size) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    getCenter() {
        let xCenter = (this.x * this.size) + (this.size / 2);
        let yCenter = (this.y * this.size) + (this.size / 2);
        return { x: xCenter, y: yCenter };
    }

    getOnScreenPos() {
        return {
            x: this.x * this.size,
            y: this.y * this.size,
            size: this.size
        };
    }

    render(context) {

        if (this.isObstructed) {
            context.fillStyle = "#000000";
            context.fillRect(this.x * this.size, this.y * this.size, this.size, this.size);
        } else {
            context.strokeStyle = this.color;
            context.lineWidth = 1.0;
            context.strokeRect(this.x * this.size, this.y * this.size, this.size, this.size);
            // context.beginPath();
            // let center = this.getCenter();
            // context.ellipse(center.x, center.y, 5, 5, 2 * Math.PI, 2 * Math.PI, false);
            // context.stroke();
        }
    }
}

export class Dot {

    centerX = 0;
    centerY = 0;
    size = 50;
    color = "#FF0000";

    lineWidth = 10;

    constructor(x, y, size, color) {
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
        context.stroke();
    }
}

export class Line {

    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
    color = "#FF0000"
    lineWidth = 1;

    constructor(x1, y1, x2, y2, lineWidth, color) {
        this.startX = x1;
        this.startY = y1;
        this.endX = x2;
        this.endY = y2;
        this.color = color;
        this.lineWidth = lineWidth;
    }

    getLength() {
        let rawLength = Math.sqrt(
            Math.pow(this.startX - this.endX, 2) + Math.pow(this.startY - this.endY, 2));

        let length = Math.ceil(rawLength / 100);

        // Minimum length of 1
        if (length < 1) {
            length++
        }

        return length;
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

export class TextLabel {

    startX = 0;
    startY = 0;
    text = "";
    color = "#FF0000";

    lineWidth = 10;

    constructor(x, y, text, color) {
        this.startX = x;
        this.startY = y;
        this.text = text;
        this.color = color;
    }

    render(context) {
        context.strokeStyle = this.color;
        context.fillStyle = "#000000";
        context.lineWidth = 2.0;
        context.font = "24px sans-serif";
        context.strokeText(this.text, this.startX, this.startY);
    }
}

export class Soldier extends Entity {

    image = new Image();
    imageWidth = 50;
    imageHeight = 50;

    currentFrameIndex = 0;
    maxFrameIndex = 3;
    currentTick = 0;
    maxTicks = 60;

    constructor(id, x, y) {
        super(id, x, y);
        this.image.src = "resources/guys_strip.png";
    }

    /**
     * Returns the coordinates of this entity if the click was within this image's bounds;
     * 
     * @param {*} event 
     */
    isClicked(event) {

        if (event.x >= this.x - (this.imageWidth / 2) && event.x <= this.x + (this.imageWidth / 2)) {
            if (event.y >= this.y - (this.imageHeight / 2) && event.y <= this.y + (this.imageHeight / 2)) {
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

    update() {
        this.currentTick++;
        if (this.currentTick >= this.maxTicks) {
            this.currentFrameIndex++;
            if (this.currentFrameIndex > this.maxFrameIndex) {
                this.currentFrameIndex = 0;
            }
        }
    }

    // Draws CENTERED on x,y
    render(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, 50 * this.currentFrameIndex, 0, 50, 50,  -(this.imageWidth / 2), - (this.imageHeight / 2), 50, 50);
        context.restore();
    }
}

export class Helpless extends Entity {

    image = new Image();

    constructor(id, x, y) {
        super(id, x, y);
        this.image.src = "resources/helpless_1.png";
    }

    isClicked(event) {
        return null;
    }

    render(context) {
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, -(this.image.width / 2), - (this.image.height / 2));
        context.restore();
    }
}

export class Blob extends Entity {

    imageAlive = new Image();
    imageDead = new Image();
    target = null;

    imageWidth = 50;
    imageHeight = 50;

    currentFrameIndex = 0;
    maxFrameIndex = 3;
    currentTick = 0;
    maxTicks = 45;

    constructor(id, x, y) {
        super(id, x, y);
        this.imageAlive.src = "resources/blob_strip.png";
        this.imageDead.src = "resources/blob_dead_1.png";
    }

    /**
     * Returns the coordinates of this entity if the click was within this image's bounds;
     */
    isClicked(event) {
        if (event.x >= this.x - (this.imageWidth / 2) && event.x <= this.x + (this.imageWidth / 2)) {
            if (event.y >= this.y - (this.imageHeight / 2) && event.y <= this.y + (this.imageHeight / 2)) {
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

    update() {
        this.currentTick++;
        if (this.currentTick >= this.maxTicks) {
            this.currentTick = 0;

            // Random frame
            this.currentFrameIndex = Math.floor(Math.random() * (this.maxFrameIndex + 1));

            // this.currentFrameIndex++;
            // if (this.currentFrameIndex > this.maxFrameIndex) {
            //     this.currentFrameIndex = 0;
            // }
        }
    }

    setTarget(target) {
        this.target = target;
        console.log("blob " + this.id + " now targets soldier " + this.target.id);
    }

    // Draws CENTERED on x,y
    render(context) {
        context.save();
        context.translate(this.x, this.y);
        var image;
        if (this.alive) {
            image = this.imageAlive;
        } else {
            image = this.imageDead;
        }
        context.drawImage(image, 50 * this.currentFrameIndex, 0, 50, 50,  -(this.imageWidth / 2), - (this.imageHeight / 2), 50, 50);

        context.restore();
    }

}

export class EntityAnimationFrame {

    x = 0;
    y = 0;
    entity = null;

    constructor(x, y, entity) {
        this.x = x;
        this.y = y;
        this.entity = entity;
    }

    render(context) {
        // context.drawImage(this.image, this.x, this.y);

        // Test text render
        // context.strokeStyle = "#FF0000";
        // context.fillStyle = "#FF0000";
        // context.lineWidth = 2.0;
        // context.font = "24px sans-serif";
        // context.strokeText({x: this.x, y: this.y}, 100,100);

        // Entity render
        context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.entity.image, -(this.entity.image.width / 2), - (this.entity.image.height / 2));
        context.restore();
    }
}

export class EntityTransitionAnimation {
    
    deltaX = 0;
    deltaY = 0;


    /**
     * Every call to update() increases the current tick. 
     */
    ticksPerUpdate = 60;
    currentTick = 0;

    /**
     * After all ticks complete, move the image by this amount
     */
    movePerUpdate = 5;

    /**
     * Contains the image frames
     */
    frameSequence = [];
    currentFrameIndex = 0;

    image = new Image();

    constructor(startX, startY, endX, endY, frameSequence) {
        this.deltaX = (startX - endX);
        this.deltaY = (startY - endY);

        this.frameSequence = frameSequence;

        this.image.src = this.frameSequence[this.currentFrameIndex];
    }

    update() {
        this.currentTick++;
        if (this.currentTick >= this.ticksPerUpdate) {

            // Reset
            this.currentTick = 0;

            // TODO: advance to the next frame
            // this.currentFrameIndex++;
            // this.image.src = this.frameSequence[this.currentFrameIndex];
        }
    }

    render(context) {
        context.drawImage(this.image)
    }


}

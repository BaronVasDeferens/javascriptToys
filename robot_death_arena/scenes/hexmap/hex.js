

export const HexFace = Object.freeze({
    UP: 0,
    RIGHT_UP: 1,
    RIGHT_DOWN: 2,
    DOWN: 3,
    LEFT_DOWN: 4,
    LEFT_UP: 5
});



export class Hex {

    id = crypto.randomUUID();

    colorOutline =  "#000000"; // "#777777";
    colorSelected = "#FF0000";

    image = null;

    isSelected = false;
    isDebug = false;

    origin = null;                      // the first point in the hexagon
    center = null;
    points = [];

    halfSize = 0;
    hexWidth = 0;
    hexHeight = 0;

    constructor(row, col, hexSize, image) {
        this.row = row;
        this.col = col;
        this.image = image;
        this.setSize(hexSize);
        this.computePoints;
    }

    computePoints() {
        this.points = [];

        // Compute the origin (upper left) point...
        this.origin = {
            x: this.halfSize + (this.col * (this.hexSize + this.halfSize)),
            y: (this.row * 2 * (this.hexSize * 0.8660)) + (((this.col % 2)) * Math.floor(0.8660 * this.hexSize))
        };

        // ...then compute the perimeter points, going clockwise from the origin
        this.points.push({ x: this.origin.x, y: this.origin.y });
        this.points.push({ x: this.origin.x + this.hexSize, y: this.origin.y });
        this.points.push({ x: this.origin.x + this.hexSize + this.halfSize, y: this.origin.y + (this.hexSize * 0.8660) });
        this.points.push({ x: this.origin.x + this.hexSize, y: this.origin.y + (2 * this.hexSize * 0.8660) });
        this.points.push({ x: this.origin.x, y: this.origin.y + (2 * this.hexSize * 0.8660) });
        this.points.push({ x: this.origin.x - this.halfSize, y: this.origin.y + (this.hexSize * 0.8660) });

        // ...finally, compute the center point
        this.center = {
            x: this.points[0].x + this.halfSize,
            y: this.points[5].y
        }

        this.path = new Path2D();
        this.path.moveTo(this.points[0].x, this.points[0].y);
        this.path.lineTo(this.points[1].x, this.points[1].y);
        this.path.lineTo(this.points[2].x, this.points[2].y);
        this.path.lineTo(this.points[3].x, this.points[3].y);
        this.path.lineTo(this.points[4].x, this.points[4].y);
        this.path.lineTo(this.points[5].x, this.points[5].y);
        this.path.closePath();
    }

    setIsSelected(isSelected) {
        this.isSelected = isSelected;
    }


    setSize(newSize) {
        this.hexSize = newSize;
        this.halfSize = this.hexSize / 2;
        this.hexWidth = 2 * this.hexSize;
        this.hexHeight = 2 * this.hexSize * 0.8660;
        this.xOffset = (this.image.width - this.hexWidth) / 2;
        this.yOffset = (this.image.height - this.hexHeight) / 2;
        this.computePoints();
    }

    toggleDebug() {
        this.isDebug = !this.isDebug;
    }

    setColor(newColor) {
        this.colorOutline = newColor;
    }

    render(context) {

        context.strokeStyle = this.colorOutline;
        context.lineWidth = 2;
        context.stroke(this.path);

        context.save();
        context.clip(this.path);
        context.drawImage(this.image, this.points[0].x - this.halfSize - this.xOffset, this.points[0].y - this.yOffset);
        context.restore();

        if (this.isDebug) {
            // Draw center point
            context.fillStyle = "#0000FF"
            context.fillRect(this.center.x, this.center.y, 2, 2);

            context.strokeStyle = "#FFFF00"
            context.lineWidth = 0.5;
            context.strokeText(`${this.row}, ${this.col}`, this.points[0].x, this.center.y - this.hexSize / 2);
        }

    }

}